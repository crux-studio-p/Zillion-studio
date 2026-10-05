"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";
import { PRODUCTS } from "@/lib/content";
import { motion, Variants } from "motion/react";

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

const CATEGORIES = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

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
          <motion.div variants={fadeUp} className="mb-10 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
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

          {/* Grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <Link key={i} href={p.href} className="group flex flex-col gap-5">
                {/* Product Cover */}
                <div 
                  className="aspect-[4/3] w-full overflow-hidden rounded-[24px] transition-all duration-300 group-hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                  style={{ background: p.image ? `url(${p.image}) center/cover` : p.fallback }}
                >
                  {/* Hover Overlay */}
                  <div className="flex h-full w-full items-center justify-center bg-black/0 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100">
                    <span className="rounded-full bg-white/95 px-5 py-2.5 text-[12px] font-bold text-foreground shadow-md transition-transform hover:scale-105">
                      View product
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col px-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[18px] font-bold tracking-tight text-foreground leading-snug">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-[13px] font-semibold text-muted-foreground tracking-wide uppercase">
                        {p.category}
                      </p>
                    </div>
                    {p.price && (
                      <div className="shrink-0 pt-0.5">
                        <span className="text-[20px] md:text-[22px] font-normal tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                          {p.price}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
