// components/hero/Nav.tsx
"use client";
import { motion } from "motion/react";
import { MessageCircle, Sun, User, ShoppingBag } from "lucide-react";
import { EASE_OUT, T } from "@/lib/hero-timing";
import { useState } from "react";
import { CartDrawer } from "@/components/store/CartDrawer";

import { BRAND, NAV_LINKS } from "@/lib/content";

export function Nav() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  return (
    <>
    <div className="fixed left-0 top-0 z-50 w-full text-foreground">
      {/* Seamless gradient blur (no box/hard edges) */}
      <div 
        className="absolute left-0 top-0 w-full h-[120px] backdrop-blur-md pointer-events-none z-[-1]"
        style={{ 
          maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)", 
          WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" 
        }}
      />
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-7xl h-[94px] items-center justify-between px-[46px]"
      >
        <div className="flex items-center gap-2 text-[22px] font-semibold tracking-tight">
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <path d="M3 4l10 3-4 5zM14 9l7-1-3 7zM9 14l4 6-7-1z" fill="#5cc8b8" />
          </svg>
          {BRAND}
        </div>

        <nav aria-label="Primary" className="flex items-center gap-[31px]">
          <ul className="flex items-center gap-5 text-[18.5px] font-medium">
            {NAV_LINKS.map((l, i) => (
              <motion.li
                key={l.label}
                initial={{ opacity: 0, filter: "blur(8px)", x: 12 }}
                animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                transition={{
                  delay: T.nav + (NAV_LINKS.length - 1 - i) * 0.07,
                  duration: 0.6,
                  ease: EASE_OUT,
                }}
              >
                <a href={l.href} className="flex items-center gap-1 hover:opacity-60">
                  {l.icon === "chat" && (
                    <MessageCircle size={8} fill="currentColor" aria-hidden="true" />
                  )}
                  {l.label}
                </a>
              </motion.li>
            ))}
          </ul>
          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Cart"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: T.nav, duration: 0.5, ease: EASE_OUT }}
              className="grid h-10 w-10 place-items-center rounded-full bg-card text-foreground shadow-sm relative"
            >
              <ShoppingBag size={18} />
              <span className="absolute -top-1 -right-1 h-[18px] w-[18px] rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-background">
                2
              </span>
            </motion.button>
            {[User, Sun].map((Icon, i) => (
              <motion.button
                key={i}
                type="button"
                aria-label={i === 0 ? "Account" : "Toggle theme"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: T.nav + 0.05, duration: 0.5, ease: EASE_OUT }}
                className="grid h-10 w-10 place-items-center rounded-full bg-card text-foreground shadow-sm"
              >
                <Icon size={18} />
              </motion.button>
            ))}
          </div>
        </nav>
      </motion.header>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
