"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { addPackageToBasket, createBasket, getAuthUrls, updatePackageQuantity, TEBEX_PUBLIC_TOKEN } from "@/lib/tebex";

/**
 * Retrieves the current basket identifier from cookies, or creates a new one.
 */
async function getOrCreateBasketIdent() {
  const cookieStore = await cookies();
  let basketIdent = cookieStore.get("tebex_basket")?.value;

  if (!basketIdent) {
    const basket = await createBasket();
    basketIdent = basket.ident;
    
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

export async function addToCart(packageId: number) {
  try {
    const basketIdent = await getOrCreateBasketIdent();
    await addPackageToBasket(basketIdent, packageId, 1);
    
    revalidatePath("/", "layout"); // Revalidate layout to update cart UI everywhere
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add to cart:", error);
    return { success: false, error: error.message };
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

    const res = await fetch(`https://headless.tebex.io/api/accounts/${TEBEX_PUBLIC_TOKEN}/baskets/${basketIdent}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
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
