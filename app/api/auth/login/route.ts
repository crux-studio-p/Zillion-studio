import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createBasket, getAuthUrls, getBasket } from "@/lib/tebex";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    let basketIdent = cookieStore.get("tebex_basket")?.value;
    let isNewBasket = false;

    if (basketIdent) {
      const existing = await getBasket(basketIdent);
      if (!existing) {
        basketIdent = undefined;
      }
    }

    if (!basketIdent) {
      const basket = await createBasket();
      basketIdent = basket.ident;
      isNewBasket = true;
    }

    if (!basketIdent) {
      throw new Error("Could not create or find basket ident");
    }

    const { searchParams } = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin || "http://localhost:3000";
    const returnParam = searchParams.get("returnUrl");
    const returnUrl = returnParam 
      ? (returnParam.startsWith("http") ? returnParam : `${origin}${returnParam.startsWith("/") ? "" : "/"}${returnParam}`)
      : `${origin}/store`;
    
    // Fetch authentication links
    let authUrls: any[];
    try {
      authUrls = await getAuthUrls(basketIdent, returnUrl);
    } catch {
      // If fetching auth urls fails with existing basket, fallback to fresh basket
      const basket = await createBasket();
      if (!basket?.ident) {
        throw new Error("Could not create fresh basket ident");
      }
      basketIdent = basket.ident as string;
      isNewBasket = true;
      authUrls = await getAuthUrls(basketIdent, returnUrl);
    }

    if (!basketIdent) {
      throw new Error("Basket identifier is missing");
    }

    if (authUrls && authUrls.length > 0) {
      // Redirect to the first available authentication provider
      const response = NextResponse.redirect(authUrls[0].url);
      
      if (isNewBasket) {
        response.cookies.set("tebex_basket", basketIdent, { 
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax"
        });
      }
      
      return response;
    } else {
      throw new Error("No authentication providers returned from Tebex.");
    }
  } catch (error: any) {
    console.error("Authentication Error:", error);
    // Redirect to home with error query param for toast
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}?error=auth_failed`);
  }
}
