import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBasket } from "@/lib/tebex";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const basketIdent = cookieStore.get("tebex_basket")?.value;

    if (!basketIdent) {
      return NextResponse.json({ authenticated: false });
    }

    const basket = await getBasket(basketIdent);
    
    if (!basket) {
      const response = NextResponse.json({ authenticated: false });
      response.cookies.delete("tebex_basket");
      return response;
    }

    // The user is authenticated if the basket is tied to a username
    if (basket.username || basket.username_id) {
      return NextResponse.json({
        authenticated: true,
        user: {
          username: basket.username,
          id: basket.username_id
        }
      });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error("Session check error:", error);
    const response = NextResponse.json({ authenticated: false });
    response.cookies.delete("tebex_basket");
    return response;
  }
}
