"use client";

import { useState } from "react";
import { Check, Star, Zap, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";
import { Faq } from "@/components/faq/Faq";
import { motion } from "motion/react";

const PLANS = [
  {
    name: "Essential",
    desc: "Perfect for new server owners getting started.",
    price: { monthly: 9.99, annual: 99.99 },
    features: [
      "Access to 5 core scripts",
      "Standard support",
      "Community Discord role",
      "Cancel anytime",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    desc: "The complete toolkit for serious roleplay servers.",
    price: { monthly: 19.99, annual: 179.99 },
    features: [
      "Access to ALL current scripts & UIs",
      "All future updates included",
      "Priority ticket support",
      "Early beta access",
      "Pro Discord role",
    ],
    highlight: true,
  },
  {
    name: "Elite",
    desc: "For massive communities needing maximum performance.",
    price: { monthly: 49.99, annual: 449.99 },
    features: [
      "Everything in Pro",
      "1 Custom script modification/mo",
      "1-on-1 developer consultation",
      "Instant bug-fix priority",
      "Elite Discord role",
    ],
    highlight: false,
  },
];

export default function SubscriptionPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-foreground">
      <Nav />

      <main className="flex-1 px-6 pb-32 pt-[140px]">
        <div className="mx-auto max-w-6xl">
          {/* ── Header & Toggle ── */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-semibold tracking-tight text-foreground md:text-6xl lg:text-[72px] leading-[1.1]">
              Elevate your server.
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              Get unrestricted access to our entire catalog of premium FiveM resources. Choose the plan that fits your community's scale.
            </p>

            {/* Premium Toggle */}
            <div className="mx-auto inline-flex items-center rounded-full bg-card p-1 shadow-sm border border-border">
              <button
                onClick={() => setIsAnnual(false)}
                className={`relative px-6 py-2.5 text-[14px] font-semibold transition-colors ${
                  !isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-neutral-900"
                }`}
              >
                {!isAnnual && (
                  <motion.div
                    layoutId="toggle-bg"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">Monthly</span>
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`relative px-6 py-2.5 text-[14px] font-semibold transition-colors ${
                  isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-neutral-900"
                }`}
              >
                {isAnnual && (
                  <motion.div
                    layoutId="toggle-bg"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  Annually <span className="text-[#5cc8b8] bg-[#5cc8b8]/20 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider ml-1">Save 20%</span>
                </span>
              </button>
            </div>
          </div>

          {/* ── Pricing Grid ── */}
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 items-center">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[2.5rem] p-8 md:p-10 transition-transform duration-500 hover:-translate-y-2 ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground shadow-2xl scale-105 border border-neutral-800 z-10"
                    : "bg-card text-foreground shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#5cc8b8] to-[#3ca394] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary-foreground shadow-md">
                    <Star size={12} fill="currentColor" /> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`mb-3 text-2xl font-bold tracking-tight ${plan.highlight ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-[14px] leading-relaxed ${plan.highlight ? "text-neutral-400" : "text-muted-foreground"}`}>
                    {plan.desc}
                  </p>
                </div>

                <div className="mb-8 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-tighter">
                    £{isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className={`mb-1.5 text-[13px] font-medium ${plan.highlight ? "text-neutral-400" : "text-muted-foreground"}`}>
                    / {isAnnual ? "year" : "month"}
                  </span>
                </div>

                <ul className="mb-10 flex-1 space-y-4">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className={`flex items-start gap-3 text-[14px] ${plan.highlight ? "text-neutral-300" : "text-muted-foreground"}`}>
                      <div className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${plan.highlight ? "bg-[#5cc8b8]/20 text-[#5cc8b8]" : "bg-muted text-foreground"}`}>
                        <Check size={10} strokeWidth={3} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full rounded-2xl py-4.5 text-[14px] font-bold transition-all duration-300 hover:scale-[0.98] ${
                    plan.highlight
                      ? "bg-card text-foreground shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-neutral-100"
                      : "bg-muted text-foreground hover:bg-neutral-200"
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-20 flex items-center justify-center gap-2 text-[13px] font-medium text-muted-foreground">
            <ShieldCheck size={16} className="text-[#5cc8b8]" /> Secure 256-bit encryption via Tebex
          </div>
        </div>
      </main>

      <Faq />
      <Footer />
    </div>
  );
}
