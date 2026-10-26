"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  History, 
  ExternalLink, 
  Tag, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import { ProductChangelogModal } from "./ProductChangelogModal";
import { useRouter } from "next/navigation";

export interface AdminProductItem {
  id: number;
  name: string;
  categoryName?: string;
  image?: string;
  description?: string;
  total_price: number;
  currency: string;
}

interface ProductsManagerProps {
  products: AdminProductItem[];
  changelogMeta: Record<
    string,
    { count: number; latestVersion: string | null; lastUpdated: string | null }
  >;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function ProductsManager({ products, changelogMeta }: ProductsManagerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeModalProduct, setActiveModalProduct] = useState<AdminProductItem | null>(null);

  // Extract unique categories
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.categoryName).filter(Boolean) as string[])),
  ];

  // Filter products
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || p.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Category Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#181818] p-4 rounded-2xl border border-white/5">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by script name, ID or category..."
            className="w-full bg-[#121212] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-[13px] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-white/15 text-white font-semibold"
                  : "bg-white/5 text-neutral-400 hover:text-neutral-200 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table Container */}
      <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/5 text-[12px] font-medium text-neutral-400 bg-[#161616]">
                <th className="py-3.5 px-5 font-semibold">Product</th>
                <th className="py-3.5 px-5 font-semibold">Tebex ID</th>
                <th className="py-3.5 px-5 font-semibold">Category</th>
                <th className="py-3.5 px-5 font-semibold">Current Version</th>
                <th className="py-3.5 px-5 font-semibold">Changelog DB</th>
                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-neutral-300 divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const meta = changelogMeta[product.id.toString()] || {
                    count: 0,
                    latestVersion: null,
                    lastUpdated: null,
                  };
                  const storeHref = `/store/${slugify(product.name)}-${product.id}`;

                  return (
                    <tr 
                      key={product.id} 
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Product Name & Thumbnail */}
                      <td className="py-3.5 px-5 font-medium text-neutral-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Layers size={16} className="text-neutral-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-100 flex items-center gap-2">
                              <span>{product.name}</span>
                              <Link
                                href={storeHref}
                                target="_blank"
                                className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-primary transition-opacity"
                                title="View on store"
                              >
                                <ExternalLink size={12} />
                              </Link>
                            </div>
                            <span className="text-[11px] text-neutral-500">
                              {product.total_price === 0 ? "Free" : `$${product.total_price.toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tebex Package ID */}
                      <td className="py-3.5 px-5 font-mono text-[12px] text-neutral-400">
                        {product.id}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] font-medium text-neutral-300">
                          {product.categoryName || "General"}
                        </span>
                      </td>

                      {/* Current Version */}
                      <td className="py-3.5 px-5">
                        {meta.latestVersion ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11.5px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                            <Tag size={10} />
                            {meta.latestVersion}
                          </span>
                        ) : (
                          <span className="text-[12px] text-neutral-500 italic">
                            No version yet
                          </span>
                        )}
                      </td>

                      {/* Changelog Entries Count */}
                      <td className="py-3.5 px-5">
                        {meta.count > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={11} /> {meta.count} {meta.count === 1 ? "release" : "releases"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 text-neutral-400">
                            <Clock size={11} /> 0 entries
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setActiveModalProduct(product)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <History size={13} className="text-primary" />
                          Manage Changelogs
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {activeModalProduct && (
        <ProductChangelogModal
          isOpen={!!activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          product={activeModalProduct}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
