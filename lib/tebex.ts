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
 * Retrieves an existing basket by its identifier.
 */
export async function getBasket(ident: string): Promise<any> {
  const res = await fetch(`https://headless.tebex.io/api/accounts/${TEBEX_PUBLIC_TOKEN}/baskets/${ident}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch basket ${ident}`);
  }

  const json = await res.json();
  console.log(`=== Tebex getBasket (${ident}) Response ===`);
  console.log(JSON.stringify(json, null, 2));
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
  console.log(`=== Tebex getAuthUrls (${ident}) Response ===`);
  console.log(JSON.stringify(json, null, 2));
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
    const errorText = await res.text();
    throw new Error(`Failed to add package to basket: ${errorText}`);
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
