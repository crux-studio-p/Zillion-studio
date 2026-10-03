"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";
import { BRAND } from "@/lib/content";

const AMOUNTS = [10, 25, 50, 100];

export default function GiftCardPage() {
  const [amount, setAmount] = useState(25);

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-foreground">
      <Nav />
      
      <main className="flex-1 px-6 pb-24 pt-[160px]">
        <div className="mx-auto max-w-4xl">
          
          <div className="flex flex-col gap-12 md:flex-row md:items-start md:gap-16">
            
            {/* ── Visual Card ────────────────────────────────────── */}
            <div className="flex-1">
              <div className="relative mx-auto aspect-[1.6/1] w-full max-w-[460px] overflow-hidden rounded-2xl bg-[#0a0a0a] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex flex-col justify-between border border-white/10 ring-1 ring-border">
                {/* Subtle texture/gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />
                
                {/* Logo */}
                <div className="relative flex items-center gap-2 text-primary-foreground">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                    <path d="M3 4l10 3-4 5zM14 9l7-1-3 7zM9 14l4 6-7-1z" fill="#5cc8b8" />
                  </svg>
                  <span className="text-[16px] font-semibold tracking-tight">{BRAND}</span>
                </div>

                <div className="relative mt-auto">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                    Gift Card
                  </p>
                  <div className="text-5xl font-light tracking-tighter text-primary-foreground">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={amount}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="inline-block"
                      >
                        £{amount}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Denomination Picker ────────────────────────────── */}
            <div className="flex-1 md:pt-4">
              <h1 className="text-3xl font-normal tracking-[-0.02em] md:text-4xl">Send a Gift Card</h1>
              <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
                Give the perfect gift to a server owner. Gift cards are delivered instantly by email and can be redeemed on any script or template in the store.
              </p>

              <div className="mt-8">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                  Select Amount
                </label>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {AMOUNTS.map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`rounded-xl border py-3.5 text-[14px] font-medium transition-all ${
                        amount === val
                          ? "border-neutral-900 bg-primary text-primary-foreground shadow-md"
                          : "border-border bg-muted text-muted-foreground hover:border-black/10 hover:bg-muted/80"
                      }`}
                    >
                      £{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                type="button"
                className="mt-10 flex w-full items-center justify-center rounded-xl bg-[#5cc8b8] py-4 text-[13px] font-bold text-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-100"
              >
                Purchase for £{amount}
              </button>

              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                Payments are securely processed by Tebex.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
