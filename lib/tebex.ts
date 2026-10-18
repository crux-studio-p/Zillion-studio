export const TEBEX_PUBLIC_TOKEN = process.env.TEBEX_PUBLIC_TOKEN!;

if (!TEBEX_PUBLIC_TOKEN) {
  console.warn("TEBEX_PUBLIC_TOKEN is not set in environment variables");
}

/**
 * Creates a new basket in Tebex.
 */
export async function createBasket(): Promise<any> {
  const res = await fetch(`https://headless.tebex.io/api/accounts/${TEBEX_PUBLIC_TOKEN}/baskets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      complete_url: `${process.env.NEXT_PUBLIC_APP_URL}/store/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/store/cancel`,
      complete_auto_redirect: true,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create basket: ${errorText}`);
  }

  const json = await res.json();
  console.log("=== Tebex createBasket Response ===");
  console.log(JSON.stringify(json, null, 2));
  return json.data;
}

/**
 * Retrieves an existing basket by its identifier. Returns null if not found or expired.
 */
export async function getBasket(ident: string): Promise<any | null> {
  const res = await fetch(`https://headless.tebex.io/api/accounts/${TEBEX_PUBLIC_TOKEN}/baskets/${ident}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404 || res.status === 422 || res.status === 410) {
      return null;
    }
    const errorText = await res.text();
    console.warn(`Failed to fetch basket ${ident} (${res.status}): ${errorText}`);
    return null;
  }

  const json = await res.json();
  return json.data;
}

/**
 * Retrieves authentication URLs for a given basket.
 */
export async function getAuthUrls(ident: string, returnUrl: string): Promise<any[]> {
  const res = await fetch(
    `https://headless.tebex.io/api/accounts/${TEBEX_PUBLIC_TOKEN}/baskets/${ident}/auth?returnUrl=${encodeURIComponent(returnUrl)}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get auth urls: ${errorText}`);
  }

  const json = await res.json();
  return json;
}

/**
 * Type definitions for Tebex Packages and Categories
 */
export interface TebexPackage {
  id: number;
  name: string;
  description: string;
  image: string;
  base_price: number;
  total_price: number;
  currency: string;
  sales_tax: number;
  discount: number;
  media?: { url: string; type: string }[];
}

export interface TebexCategory {
  id: number;
  name: string;
  packages: TebexPackage[];
}

/**
 * Retrieves all categories and their nested packages.
 */
export async function getCategoriesWithPackages(): Promise<TebexCategory[]> {
  const res = await fetch(`https://headless.tebex.io/api/accounts/${TEBEX_PUBLIC_TOKEN}/categories?includePackages=1`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch categories: ${errorText}`);
  }

  const json = await res.json();
  console.log("=== Tebex getCategoriesWithPackages Response ===");
  // Only log the number of categories and packages to avoid huge logs
  console.log(`Fetched ${json.data.length} categories.`);
  return json.data;
}

/**
 * Adds a specific package to the basket.
 */
export async function addPackageToBasket(ident: string, packageId: number, quantity: number = 1): Promise<any> {
  const res = await fetch(`https://headless.tebex.io/api/baskets/${ident}/packages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      package_id: packageId,
      quantity,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const raw = await res.text();
    let detail = raw;
    try {
      const parsed = JSON.parse(raw);
      detail = parsed.detail || parsed.message || parsed.title || raw;
    } catch {}
    const err = new Error(detail);
    (err as any).status = res.status;
    (err as any).raw = raw;
    throw err;
  }

  const json = await res.json();
  return json.data;
}

/**
 * Removes a package from the basket by setting its quantity to 0, or by using a delete endpoint if supported.
 * Note: Tebex Headless API uses PUT to update quantity.
 */
export async function updatePackageQuantity(ident: string, packageId: number, quantity: number): Promise<any> {
  const res = await fetch(`https://headless.tebex.io/api/baskets/${ident}/packages/${packageId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update package quantity: ${errorText}`);
  }

  const json = await res.json();
  return json.data;
}

export interface TebexCouponItem {
  id: number;
  code: string;
  effective?: {
    type: string;
    packages: number[];
    categories: number[];
  };
  discount: {
    type: "value" | "percentage" | string;
    percentage: number;
    value: number;
  };
  expire?: {
    redeem_unlimited: string | boolean;
    expire_never: string | boolean;
    limit: number;
    date: string;
  };
  basket_type?: string;
  start_date?: string;
  user_limit?: number;
  minimum?: number;
  username?: string | null;
  note?: string;
}

/**
 * Retrieves active public coupons configured on the Tebex store account using the Plugin API.
 * Requires TEBEX_SERVER_SECRET (Game Server Secret Key) in environment variables.
 */
export async function getStoreCoupons(): Promise<TebexCouponItem[]> {
  const secret = process.env.TEBEX_SERVER_SECRET || process.env.TEBEX_PLUGIN_SECRET;
  if (!secret) {
    return [];
  }

  try {
    const res = await fetch("https://plugin.tebex.io/coupons", {
      headers: {
        "X-Tebex-Secret": secret,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 403) {
        console.warn("[Tebex] Coupon API returned 403: Verify TEBEX_SERVER_SECRET is a valid Game Server Secret Key.");
      }
      return [];
    }

    const json = await res.json();
    const list: TebexCouponItem[] = json.data || [];
    const now = new Date();

    return list.filter((item) => {
      // Exclude username-restricted coupons from public display
      if (item.username) return false;

      // Check expiry date
      if (item.expire) {
        const isNever = item.expire.expire_never === "true" || item.expire.expire_never === true;
        if (!isNever && item.expire.date) {
          const exp = new Date(item.expire.date);
          if (!isNaN(exp.getTime()) && exp.getTime() < now.getTime()) {
            return false;
          }
        }
      }

      return true;
    });
  } catch (error) {
    console.error("[Tebex] Failed to fetch coupons:", error);
    return [];
  }
}

export interface TebexGiftCard {
  id: number;
  code: string;
  balance: {
    starting: string | number;
    remaining: string | number;
    currency: string;
  };
  note?: string;
  void: boolean;
}

/**
 * Looks up a gift card's balance and details via the Tebex Plugin API.
 * Requires TEBEX_SERVER_SECRET in environment variables.
 */
export async function lookupGiftCard(code: string): Promise<TebexGiftCard | null> {
  const secret = process.env.TEBEX_SERVER_SECRET || process.env.TEBEX_PLUGIN_SECRET;
  if (!secret) {
    throw new Error("Server secret key (TEBEX_SERVER_SECRET) is required to look up gift cards. Please add it to your .env file.");
  }

  const cleanCode = code.replace(/[\s-]/g, "").trim();
  if (!cleanCode) {
    throw new Error("Gift card code is required.");
  }

  try {
    // Primary endpoint: lookup by card number
    const res = await fetch(`https://plugin.tebex.io/gift-cards/lookup/${encodeURIComponent(cleanCode)}`, {
      headers: {
        "X-Tebex-Secret": secret,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }

    // Fallback: list cards and find match
    const listRes = await fetch("https://plugin.tebex.io/gift-cards", {
      headers: {
        "X-Tebex-Secret": secret,
      },
      cache: "no-store",
    });

    if (listRes.ok) {
      const listJson = await listRes.json();
      const cards: TebexGiftCard[] = listJson.data || [];
      const match = cards.find(
        (c) => c.code?.replace(/[\s-]/g, "").toLowerCase() === cleanCode.toLowerCase()
      );
      if (match) return match;
    }

    if (res.status === 404) {
      return null;
    }

    const errorText = await res.text();
    throw new Error(`Failed to lookup gift card: ${errorText || res.statusText}`);
  } catch (err: any) {
    console.error("[Tebex] Gift card lookup error:", err);
    throw err;
  }
}
