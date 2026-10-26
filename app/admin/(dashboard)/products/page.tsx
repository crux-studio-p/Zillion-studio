import { getCategoriesWithPackages } from "@/lib/tebex";
import { getChangelogMetadataByProduct } from "@/lib/actions/changelog.actions";
import { ProductsManager, AdminProductItem } from "./ProductsManager";
import { Layers, History, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  let products: AdminProductItem[] = [];
  let errorMsg: string | null = null;

  try {
    const categories = await getCategoriesWithPackages();
    products = categories.flatMap((c) =>
      c.packages.map((p) => ({
        id: p.id,
        name: p.name,
        categoryName: c.name,
        image: p.image,
        description: p.description,
        total_price: p.total_price,
        currency: p.currency,
      }))
    );
  } catch (err: any) {
    console.error("[ProductsAdminPage] Failed to fetch Tebex packages:", err);
    errorMsg = err.message || "Failed to connect to Tebex API. Please check TEBEX_PUBLIC_TOKEN.";
  }

  const changelogMeta = await getChangelogMetadataByProduct();

  const totalProducts = products.length;
  const productsWithReleases = products.filter(
    (p) => (changelogMeta[p.id.toString()]?.count || 0) > 0
  ).length;

  return (
    <div className="max-w-6xl space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <History size={22} className="text-primary" />
            Product Changelogs
          </h1>
          <p className="text-[13px] text-neutral-400 mt-1">
            Manage release versions, updates, and changelogs stored in PostgreSQL for all store resources.
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1c1c1c] border border-white/5 px-3.5 py-1.5 rounded-xl text-[12px]">
            <Layers size={14} className="text-neutral-400" />
            <span className="text-neutral-400">Total Products:</span>
            <span className="font-semibold text-neutral-200">{totalProducts}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1c1c1c] border border-white/5 px-3.5 py-1.5 rounded-xl text-[12px]">
            <CheckCircle size={14} className="text-emerald-400" />
            <span className="text-neutral-400">With Changelogs:</span>
            <span className="font-semibold text-emerald-400">{productsWithReleases}</span>
          </div>
        </div>
      </div>

      {errorMsg ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
          <p className="font-semibold">Unable to load Tebex products</p>
          <p className="mt-1 text-red-300/80">{errorMsg}</p>
        </div>
      ) : (
        <ProductsManager products={products} changelogMeta={changelogMeta} />
      )}
    </div>
  );
}
