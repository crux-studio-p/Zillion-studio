"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const COOKIE_NAME = "zillion_admin_session";
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "7e9b4f2c8d1a3e5069b2d8f4c7a1e3b5a6c9d2f8e1b4a7c0d3e6f9b2a5c8d1e4";

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp: number; // unix timestamp in seconds
}

// In-memory rate-limiter for failed attempts
interface AttemptRecord {
  count: number;
  lockoutUntil: number;
}
const loginAttempts = new Map<string, AttemptRecord>();

function checkRateLimit(key: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return { allowed: true };

  if (record.lockoutUntil > now) {
    const waitMinutes = Math.ceil((record.lockoutUntil - now) / 60000);
    return { allowed: false, waitMinutes };
  }

  if (record.lockoutUntil > 0 && record.lockoutUntil <= now) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(key: string): { locked: boolean; waitMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, lockoutUntil: 0 };
  record.count += 1;

  if (record.count >= 5) {
    record.lockoutUntil = now + 15 * 60 * 1000; // 15 mins
    loginAttempts.set(key, record);
    return { locked: true, waitMinutes: 15 };
  }

  loginAttempts.set(key, record);
  return { locked: false };
}

function clearRateLimit(key: string) {
  loginAttempts.delete(key);
}

/**
 * Validates password meets minimum security standards (minimum 8 characters).
 */
export async function validatePasswordStrength(password: string): Promise<{ valid: boolean; error?: string }> {
  if (!password || password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long." };
  }
  return { valid: true };
}

/**
 * Hashes a plain password with random salt using scrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plain password against stored salt:hash string.
 */
export async function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  try {
    const [salt, key] = combinedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Signs and packages session payload into a compact token.
 */
function signSession(payload: Omit<AdminSession, "exp">, durationSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + durationSeconds;
  const data = JSON.stringify({ ...payload, exp });
  const base64Data = Buffer.from(data).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(base64Data)
    .digest("base64url");
  return `${base64Data}.${signature}`;
}

/**
 * Verifies signature and expiration of session token.
 */
function verifySessionToken(token: string): AdminSession | null {
  try {
    const [base64Data, signature] = token.split(".");
    if (!base64Data || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(base64Data)
      .digest("base64url");

    if (
      signature.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
    ) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(base64Data, "base64url").toString("utf8")
    ) as AdminSession;

    if (session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated admin session from cookies and optionally validates against DB.
 */
export async function getAdminSession(verifyDb: boolean = true): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = verifySessionToken(token);
    if (!session) return null;

    // Cross-check with DB to ensure account still exists and is active
    if (verifyDb) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (!user) {
        // User was deleted from DB - revoke session
        cookieStore.delete(COOKIE_NAME);
        return null;
      }

      // Update session with latest role & name from database
      return {
        ...session,
        name: user.name || session.name,
        role: user.role,
        email: user.email,
      };
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Authenticates admin credentials, handles rate limiting, sets session cookie.
 */
export async function loginAdminAction(data: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    if (!email || !password) {
      return { success: false, error: "Please enter both email and password." };
    }

    // 1. Rate limiting check
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many failed login attempts. Please try again in ${rateLimit.waitMinutes} minute(s).`,
      };
    }

    // 2. Look up user by email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let authenticatedUser: typeof users.$inferSelect | null = null;

    if (!existingUser) {
      // 3. Auto-provision first SuperAdmin if database has no users
      const allUsers = await db.select().from(users).limit(1);
      const isFirstUser = allUsers.length === 0;

      if (isFirstUser) {
        const strength = await validatePasswordStrength(password);
        if (!strength.valid) {
          return { success: false, error: strength.error };
        }

        const hashedPassword = await hashPassword(password);
        const namePart = email.split("@")[0] || "admin";
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const [newUser] = await db
          .insert(users)
          .values({
            name: formattedName || "Admin User",
            email,
            passwordHash: hashedPassword,
            role: "SuperAdmin",
          })
          .returning();
        authenticatedUser = newUser;
      } else {
        recordFailedAttempt(email);
        return { success: false, error: "Invalid credentials." };
      }
    } else {
      // User exists. Check password.
      if (!existingUser.passwordHash) {
        // First-time password set for existing invited user
        const strength = await validatePasswordStrength(password);
        if (!strength.valid) {
          return { success: false, error: strength.error };
        }

        const hashedPassword = await hashPassword(password);
        const [updatedUser] = await db
          .update(users)
          .set({ passwordHash: hashedPassword })
          .where(eq(users.id, existingUser.id))
          .returning();
        authenticatedUser = updatedUser;
      } else {
        const isMatch = await verifyPassword(password, existingUser.passwordHash);
        if (!isMatch) {
          const attempt = recordFailedAttempt(email);
          if (attempt.locked) {
            return {
              success: false,
              error: `Too many failed attempts. Account locked for ${attempt.waitMinutes} minutes.`,
            };
          }
          return { success: false, error: "Invalid credentials." };
        }
        authenticatedUser = existingUser;
      }
    }

    if (!authenticatedUser) {
      return { success: false, error: "Authentication failed." };
    }

    // Clear failed attempts on success
    clearRateLimit(email);

    // 4. Create session token (30 days if rememberMe, otherwise 24 hours)
    const durationSeconds = data.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const token = signSession(
      {
        userId: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.name || "Admin",
        role: authenticatedUser.role,
      },
      durationSeconds
    );

    // 5. Set HttpOnly session cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      maxAge: durationSeconds,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return { success: true };
  } catch (err: any) {
    console.error("[loginAdminAction] Login error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during login." };
  }
}

/**
 * Allows the active logged-in admin to update their own password.
 */
export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession(true);
    if (!session) {
      return { success: false, error: "You must be logged in to change your password." };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user || !user.passwordHash) {
      return { success: false, error: "User not found or password not initialized." };
    }

    // Verify current password
    const isMatch = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Current password does not match." };
    }

    // Validate new password
    const strength = await validatePasswordStrength(data.newPassword);
    if (!strength.valid) {
      return { success: false, error: strength.error };
    }

    // Hash and update
    const newHash = await hashPassword(data.newPassword);
    await db
      .update(users)
      .set({ passwordHash: newHash })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (err: any) {
    console.error("[changePasswordAction] Error:", err);
    return { success: false, error: err.message || "Failed to update password." };
  }
}

/**
 * Clears the admin session cookie and logs out.
 */
export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}
