import { getCategoriesWithPackages } from "@/lib/tebex";
import { StoreClient } from "@/components/store/StoreClient";

export const metadata = {
  title: "Store - Zillion Studio",
  description: "Browse our complete collection of premium FiveM scripts and server resources.",
};

export default async function StorePage() {
  // Fetch data directly on the server
  const categories = await getCategoriesWithPackages();

  return <StoreClient categories={categories} />;
}
