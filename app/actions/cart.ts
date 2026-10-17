"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { addPackageToBasket, createBasket, getAuthUrls, updatePackageQuantity, getBasket, TEBEX_PUBLIC_TOKEN } from "@/lib/tebex";

/**
 * Retrieves the current basket identifier from cookies, or creates a new one.
 */
async function getOrCreateBasketIdent(): Promise<string> {
  const cookieStore = await cookies();
  let basketIdent = cookieStore.get("tebex_basket")?.value;

  if (basketIdent) {
    const basket = await getBasket(basketIdent);
    if (!basket) {
      basketIdent = undefined;
      cookieStore.delete("tebex_basket");
    }
  }

  if (!basketIdent) {
    const basket = await createBasket();
    basketIdent = basket.ident;
    
    if (!basketIdent) {
      throw new Error("Failed to create basket ident");
    }

    cookieStore.set("tebex_basket", basketIdent, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return basketIdent;
}

export async function addToCart(packageId: number, returnUrl?: string) {
  try {
    let basketIdent = await getOrCreateBasketIdent();
    try {
      await addPackageToBasket(basketIdent, packageId, 1);
    } catch (err: any) {
      const isLoginRequired =
        err?.status === 422 &&
        (err?.message?.toLowerCase().includes("login") || err?.raw?.toLowerCase().includes("login"));

      if (isLoginRequired) {
        let authUrl: string | undefined;
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const returnTarget = returnUrl
            ? (returnUrl.startsWith("http") ? returnUrl : `${appUrl}${returnUrl.startsWith("/") ? "" : "/"}${returnUrl}`)
            : `${appUrl}/store`;

          const authUrls = await getAuthUrls(basketIdent, returnTarget);
          if (authUrls && authUrls.length > 0) {
            authUrl = authUrls[0].url;
          }
        } catch (authErr) {
          console.error("Failed to generate auth url:", authErr);
        }

        return {
          success: false,
          requiresAuth: true,
          authUrl: authUrl || `/api/auth/login?returnUrl=${encodeURIComponent(returnUrl || "/store")}`,
          error: "Please sign in with FiveM to add items to your cart.",
        };
      }

      // In case basket became invalid (e.g. 404/410), recreate and retry once
      if (err?.status === 404 || err?.status === 410) {
        const cookieStore = await cookies();
        cookieStore.delete("tebex_basket");
        basketIdent = await getOrCreateBasketIdent();
        await addPackageToBasket(basketIdent, packageId, 1);
      } else {
        throw err;
      }
    }
    
    revalidatePath("/", "layout"); // Revalidate layout to update cart UI everywhere
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add to cart:", error.message || error);
    return { success: false, error: error.message || "Failed to add to cart" };
  }
}

export async function removeFromCart(packageId: number) {
  try {
    const cookieStore = await cookies();
    const basketIdent = cookieStore.get("tebex_basket")?.value;

    if (!basketIdent) {
      return { success: false, error: "No active basket" };
    }

    // Try deleting using the DELETE method as per standard REST (or we can use updatePackageQuantity with 0)
    const res = await fetch(`https://headless.tebex.io/api/baskets/${basketIdent}/packages/${packageId}`, {
      method: "DELETE",
      cache: "no-store"
    });

    if (!res.ok) {
        // Fallback to setting quantity to 0 if DELETE fails
        await updatePackageQuantity(basketIdent, packageId, 0);
    }
    
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to remove from cart:", error);
    return { success: false, error: error.message };
  }
}

export async function getCart() {
  try {
    const cookieStore = await cookies();
    const basketIdent = cookieStore.get("tebex_basket")?.value;

    if (!basketIdent) {
      return null;
    }

    const basket = await getBasket(basketIdent);
    if (!basket) {
      cookieStore.delete("tebex_basket");
      return null;
    }

    return basket;
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error("Failed to fetch cart:", error);
    return null;
  }
}

export async function applyCoupon(couponCode: string) {
  try {
    const cookieStore = await cookies();
    const basketIdent = cookieStore.get("tebex_basket")?.value;
    if (!basketIdent) {
      throw new Error("No basket found");
    }

    const res = await fetch(`https://headless.tebex.io/api/baskets/${basketIdent}/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coupon_code: couponCode }),
      cache: "no-store"
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to apply coupon`);
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeCoupon(couponCode: string) {
  try {
    const cookieStore = await cookies();
    const basketIdent = cookieStore.get("tebex_basket")?.value;
    if (!basketIdent) {
      throw new Error("No basket found");
    }

    const res = await fetch(`https://headless.tebex.io/api/baskets/${basketIdent}/coupons/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coupon_code: couponCode }),
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`Failed to remove coupon`);
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
