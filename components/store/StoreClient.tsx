"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";
import { motion, Variants } from "motion/react";
import { TebexCategory } from "@/lib/tebex";
import { AddToCartButton } from "./AddToCartButton";
import { parsePackageDescription } from "@/lib/parsers/description-parser";
import { ProductCard } from "./ProductCard";

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
          <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((p, i) => (
                <ProductCard
                  key={p.id || i}
                  id={p.id}
                  name={p.name}
                  image={p.image}
                  price={p.total_price}
                  currency={p.currency}
                  categoryName={p.categoryName}
                  description={p.description}
                />
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
