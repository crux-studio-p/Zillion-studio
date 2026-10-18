// components/community/TopCustomers.tsx
"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useRef } from "react";
import { Crown } from "lucide-react";
import { BlurWords } from "@/components/hero/BlurWords";
import { EASE_OUT } from "@/lib/hero-timing";
import {
  TOP_CUSTOMERS,
  TOP_CUSTOMERS_SECTION,
  type TopCustomer,
} from "@/lib/content";

function getInitials(name: string) {
  if (!name) return "U";
  const clean = name.replace(/[^a-zA-Z0-9]/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTES = [
  "from-[#f97316] to-[#c2410c]", // Top Customer: Amber/Orange
  "from-[#334155] to-[#1e293b]", // Card 1: Slate
  "from-[#7c3aed] to-[#5b21b6]", // Card 2: Purple (Civ_ironhead style)
  "from-[#059669] to-[#047857]", // Card 3: Emerald
  "from-[#ec4899] to-[#be185d]", // Card 4: Rose
];

export function TopCustomers({
  customers = TOP_CUSTOMERS,
}: {
  customers?: TopCustomer[];
}) {
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { once: true, margin: "0px 0px -60px 0px" });
  const shouldReduceMotion = useReducedMotion();

  // Strictly enforce only the top 5 customers
  const top5 = customers.slice(0, 5);
  if (!top5.length) return null;

  const topCustomer = top5[0];
  const otherCustomers = top5.slice(1, 5);

  // Duplicate items for a seamless -50% infinite translation loop
  const marqueeItems = [
    ...otherCustomers,
    ...otherCustomers,
    ...otherCustomers,
    ...otherCustomers,
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 18, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.15 : 0.35,
        ease: EASE_OUT,
      },
    },
  };

  return (
    <section
      ref={root}
      aria-label={TOP_CUSTOMERS_SECTION.eyebrow}
      className="w-full bg-transparent px-6 pb-[56px] pt-[40px] text-foreground"
    >
      {/* Keyframe styles for right-to-left seamless infinite marquee scroll */}
      <style jsx global>{`
        @keyframes scrollLeftBand {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .marquee-scroll-band {
          display: flex;
          width: max-content;
          animation: scrollLeftBand 56s linear infinite;
        }
        .marquee-scroll-band:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-scroll-band {
            animation: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center">
          <p className="text-[12px] font-normal uppercase leading-[16px] tracking-[0.18em] text-muted-foreground">
            {TOP_CUSTOMERS_SECTION.eyebrow}
          </p>
          <h2 className="mt-[14px] text-[38px] font-normal leading-[44px] tracking-[-0.035em] text-foreground sm:text-[46px] sm:leading-[52px]">
            <BlurWords
              text={TOP_CUSTOMERS_SECTION.heading}
              play={inView}
              stagger={0.06}
            />
          </h2>
          {TOP_CUSTOMERS_SECTION.subheading && (
            <p className="mt-2.5 text-[14px] font-normal leading-[20px] text-muted-foreground">
              {TOP_CUSTOMERS_SECTION.subheading}
            </p>
          )}
        </div>

        {/* Featured Top Customer Capsule */}
        {topCustomer && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="mt-8 flex justify-center"
          >
            <motion.div
              variants={itemVariants}
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, -4, 0],
                    }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              className="relative inline-flex items-center gap-4 rounded-full border border-orange-500/40 bg-card/90 px-6 py-3 shadow-[0_8px_30px_-6px_rgba(249,115,22,0.2)] backdrop-blur-md cursor-default will-change-transform"
            >
              {/* Subtle ambient radiant glow behind top customer pill */}
              <div
                className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-60 blur-md"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(249,115,22,0.22) 0%, transparent 75%)",
                }}
              />

              {/* Avatar with Overlapping Crown Badge */}
              <div className="relative">
                <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-full ring-2 ring-orange-500/50 shadow-md">
                  {topCustomer.avatar ? (
                    <Image
                      src={topCustomer.avatar}
                      alt={topCustomer.username}
                      fill
                      sizes="52px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${AVATAR_PALETTES[0]} text-base font-bold text-white shadow-inner`}
                    >
                      {getInitials(topCustomer.username)}
                    </div>
                  )}
                </div>

                {/* Orange Crown Badge overlapping avatar top-right */}
                <div className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-white shadow-sm ring-2 ring-card">
                  <Crown className="h-2.5 w-2.5 fill-white text-white" />
                </div>
              </div>

              {/* Customer Info: TOP CUSTOMER tag + Name strictly */}
              <div className="flex flex-col text-left pr-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                  TOP CUSTOMER
                </span>
                <span className="text-[16px] font-bold tracking-tight text-foreground sm:text-[18px]">
                  {topCustomer.username}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 4 Customers Infinite Marquee Band (Right to Left) */}
        <div
          className="relative mt-7 w-full overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          <div className="marquee-scroll-band flex items-center gap-3.5 py-1 will-change-transform">
            {marqueeItems.map((c, index) => {
              const palette =
                AVATAR_PALETTES[((index % otherCustomers.length) + 1) % AVATAR_PALETTES.length];

              return (
                <div
                  key={`marquee-customer-${index}`}
                  className="flex w-[220px] sm:w-[240px] shrink-0 items-center gap-3.5 rounded-2xl border border-border/80 bg-card/85 px-4 py-3 shadow-xs backdrop-blur-md cursor-default"
                >
                  {/* Profile Picture / Avatar */}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/70 shadow-xs">
                    {c.avatar ? (
                      <Image
                        src={c.avatar}
                        alt={c.username}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${palette} text-xs font-bold text-white shadow-inner`}
                      >
                        {getInitials(c.username)}
                      </div>
                    )}
                  </div>

                  {/* Customer Name Strictly */}
                  <span className="truncate text-[13.5px] font-semibold text-foreground">
                    {c.username}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}



