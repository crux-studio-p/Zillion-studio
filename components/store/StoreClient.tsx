"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";
import { motion, Variants } from "motion/react";
import { TebexCategory } from "@/lib/tebex";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
};

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function StoreClient({ categories }: { categories: TebexCategory[] }) {
  // We want to filter out categories that have no packages
  const activeCategories = categories.filter(c => c.packages && c.packages.length > 0);
  
  const categoryNames = ["All", ...activeCategories.map(c => c.name)];
  const [activeCategory, setActiveCategory] = useState("All");

  // Flatten packages for "All", otherwise get packages of active category
  const filteredPackages = activeCategory === "All"
    ? activeCategories.flatMap(c => c.packages.map(p => ({ ...p, categoryName: c.name })))
    : activeCategories.find(c => c.name === activeCategory)?.packages.map(p => ({ ...p, categoryName: activeCategory })) || [];

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-foreground">
      <Nav />
      
      <main className="flex-1 px-6 pb-24 pt-[100px] md:pt-[160px]">
        <motion.div 
          className="mx-auto max-w-5xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-12">
            <h1 className="text-4xl font-normal tracking-[-0.03em] md:text-5xl">Store</h1>
            <p className="mt-4 text-[14px] leading-[1.6] text-muted-foreground max-w-lg">
              Browse our complete collection of premium FiveM scripts, Tebex store templates, and server resources.
            </p>
          </motion.div>

          {/* Filters */}
          {activeCategories.length > 0 && (
            <motion.div variants={fadeUp} className="mb-10 flex flex-wrap gap-2">
              {categoryNames.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`rounded-full px-4 py-2 text-[12px] font-medium transition-colors ${
                    activeCategory === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {c}
                </button>
              ))}
            </motion.div>
          )}

          {/* Grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((p, i) => (
                <Link key={p.id || i} href={`/store/${slugify(p.name)}-${p.id}`} className="group flex flex-col gap-5">
                  {/* Product Cover */}
                  <div className="relative w-full overflow-hidden rounded-[24px] transition-all duration-300 group-hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-muted">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-auto block" />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center text-muted-foreground text-sm font-medium">
                        No Image
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100">
                      <span className="rounded-full bg-white/95 px-5 py-2.5 text-[12px] font-bold text-foreground shadow-md transition-transform hover:scale-105">
                        View package
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col px-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[18px] font-bold tracking-tight text-foreground leading-snug">
                          {p.name}
                        </h3>
                        <p className="mt-1 text-[13px] font-semibold text-muted-foreground tracking-wide uppercase">
                          {p.categoryName}
                        </p>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <span className="text-[20px] md:text-[22px] font-normal tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                          {p.total_price === 0 ? "Free" : `$${p.total_price.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No packages available at the moment.
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
