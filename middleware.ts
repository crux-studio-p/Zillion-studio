import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "7e9b4f2c8d1a3e5069b2d8f4c7a1e3b5a6c9d2f8e1b4a7c0d3e6f9b2a5c8d1e4";

const COOKIE_NAME = "zillion_admin_session";

/**
 * Verifies HMAC SHA-256 signature and expiration of session token using Web Crypto API (Edge-safe).
 */
async function verifyEdgeToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [base64Data, signature] = parts;
    if (!base64Data || !signature) return false;

    // 1. Decode payload and verify expiration
    const base64Standard = base64Data
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(base64Data.length + ((4 - (base64Data.length % 4)) % 4), "=");
    
    const jsonStr = atob(base64Standard);
    const payload = JSON.parse(jsonStr);

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    // 2. Verify HMAC SHA-256 signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const computedSigBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(base64Data)
    );

    const computedBytes = new Uint8Array(computedSigBuffer);
    let binary = "";
    for (let i = 0; i < computedBytes.byteLength; i++) {
      binary += String.fromCharCode(computedBytes[i]);
    }

    const computedSig = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return computedSig === signature;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(COOKIE_NAME)?.value;

  const isLoginPage = pathname === "/admin/login";
  const isProtectedAdmin = pathname.startsWith("/admin") && !isLoginPage;

  const isValid = sessionToken ? await verifyEdgeToken(sessionToken) : false;

  // 1. Redirect unauthenticated users to login
  if (isProtectedAdmin && !isValid) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect logged-in users away from login page to dashboard
  if (isLoginPage && isValid) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
