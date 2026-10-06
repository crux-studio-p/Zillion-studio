import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createBasket, getAuthUrls } from "@/lib/tebex";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    let basketIdent = cookieStore.get("tebex_basket")?.value;
    let isNewBasket = false;

    if (!basketIdent) {
      const basket = await createBasket();
      basketIdent = basket.ident;
      isNewBasket = true;
    }

    const returnUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    // Fetch authentication links
    const authUrls = await getAuthUrls(basketIdent, returnUrl);

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
