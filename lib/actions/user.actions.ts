"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAdminSession, hashPassword, validatePasswordStrength } from "@/lib/auth/admin-auth";

export type AdminUserRole = "SuperAdmin" | "Admin" | "Editor" | "Support" | "Developer";

export interface AdminUserListItem {
  id: string;
  name: string | null;
  email: string;
  role: AdminUserRole;
  createdAt: Date;
  hasPassword: boolean;
}

/**
 * Retrieves all registered admin users.
 */
export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  try {
    const list = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .orderBy(asc(users.createdAt));

    return list.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as AdminUserRole,
      createdAt: u.createdAt,
      hasPassword: Boolean(u.passwordHash),
    }));
  } catch (error) {
    console.error("[getAdminUsers] Error:", error);
    return [];
  }
}

/**
 * Creates and invites a new administrator user.
 */
export async function createAdminUserAction(data: {
  name: string;
  email: string;
  role: AdminUserRole;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession(true);
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    if (session.role !== "SuperAdmin" && session.role !== "Admin") {
      return { success: false, error: "Insufficient permissions. Only Admins can invite team members." };
    }

    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();

    if (!email) {
      return { success: false, error: "Email address is required." };
    }

    // Check password strength
    const strength = await validatePasswordStrength(data.password);
    if (!strength.valid) {
      return { success: false, error: strength.error };
    }

    // Check if user already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return { success: false, error: "A user with this email address already exists." };
    }

    const hashedPassword = await hashPassword(data.password);

    await db.insert(users).values({
      name: name || email.split("@")[0],
      email,
      role: data.role,
      passwordHash: hashedPassword,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("[createAdminUserAction] Error:", error);
    return { success: false, error: error.message || "Failed to create user." };
  }
}

/**
 * Updates a user's role.
 */
export async function updateUserRoleAction(data: {
  userId: string;
  role: AdminUserRole;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession(true);
    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    if (session.role !== "SuperAdmin") {
      return { success: false, error: "Only SuperAdmins can modify user roles." };
    }

    await db
      .update(users)
      .set({ role: data.role })
      .where(eq(users.id, data.userId));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("[updateUserRoleAction] Error:", error);
    return { success: false, error: error.message || "Failed to update role." };
  }
}

/**
 * Deletes an admin user (prevents deleting oneself).
 */
export async function deleteAdminUserAction(data: {
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession(true);
    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    if (session.role !== "SuperAdmin") {
      return { success: false, error: "Only SuperAdmins can remove team members." };
    }

    if (session.userId === data.userId) {
      return { success: false, error: "You cannot delete your own account." };
    }

    await db.delete(users).where(eq(users.id, data.userId));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteAdminUserAction] Error:", error);
    return { success: false, error: error.message || "Failed to delete user." };
  }
}
