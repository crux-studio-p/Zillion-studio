"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";
import { BRAND } from "@/lib/content";
import { CreditCard, Gift, Search, ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { checkGiftCardBalance } from "@/app/actions/cart";
import { toast } from "sonner";
import Link from "next/link";

const AMOUNTS = [10, 25, 50, 100];

export default function GiftCardPage() {
  const [activeTab, setActiveTab] = useState<"purchase" | "balance">("purchase");
  const [amount, setAmount] = useState(25);

  // Balance checking state
  const [cardNumber, setCardNumber] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [cardResult, setCardResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Format card number with spaces (e.g. 0127 0244 7210 1111)
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
    if (raw.length <= 16) {
      const parts = raw.match(/.{1,4}/g);
      setCardNumber(parts ? parts.join(" ") : raw);
    }
  };

  const handleCheckBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber.trim()) {
      toast.error("Please enter a gift card code.");
      return;
    }

    setIsChecking(true);
    setErrorMsg(null);
    setCardResult(null);

    try {
      const res = await checkGiftCardBalance(cardNumber);
      if (res.success && res.card) {
        setCardResult(res.card);
        toast.success("Gift card found!");
      } else {
        setErrorMsg(res.error || "Gift card not found or inactive.");
        toast.error(res.error || "Gift card not found.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      toast.error("Failed to check gift card balance.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopyCode = () => {
    if (!cardResult?.code) return;
    navigator.clipboard.writeText(cardResult.code);
    setCopied(true);
    toast.success("Card code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Nav />
      
      <main className="flex-1 px-6 pb-24 pt-[130px] md:pt-[160px]">
        <div className="mx-auto max-w-4xl">
          
          {/* ── Mode Switcher Tab ────────────────────────────── */}
          <div className="flex justify-center mb-10">
            <div className="relative inline-flex p-1.5 rounded-2xl bg-card border border-border shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("purchase")}
                className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  activeTab === "purchase"
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "purchase" && (
                  <motion.div
                    layoutId="activeGiftCardTab"
                    className="absolute inset-0 rounded-xl bg-foreground shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Gift size={15} />
                  Send a Gift Card
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("balance")}
                className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  activeTab === "balance"
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "balance" && (
                  <motion.div
                    layoutId="activeGiftCardTab"
                    className="absolute inset-0 rounded-xl bg-foreground shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Search size={15} />
                  Check Card Balance
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-12 md:flex-row md:items-start md:gap-16">
            
            {/* ── Visual Card Preview ────────────────────────────── */}
            <div className="flex-1">
              <div className="relative mx-auto aspect-[1.6/1] w-full max-w-[460px] overflow-hidden rounded-3xl bg-card p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-between border border-border ring-1 ring-border">
                {/* Holographic / Emerald ambient mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-primary/[0.03] to-transparent opacity-80" />
                <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />

                {/* Top Row: Logo & Chip */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                      <path d="M3 4l10 3-4 5zM14 9l7-1-3 7zM9 14l4 6-7-1z" fill="#5cc8b8" />
                    </svg>
                    <span className="text-[16px] font-bold tracking-tight">{BRAND}</span>
                  </div>

                  {/* Smart chip icon */}
                  <div className="h-7 w-10 rounded-md border border-white/20 bg-gradient-to-tr from-white/10 to-white/5 flex items-center justify-center">
                    <div className="h-3 w-5 border border-white/30 rounded-[2px]" />
                  </div>
                </div>

                {/* Middle: Live Card Number */}
                <div className="relative my-auto pt-4">
                  <p className="font-mono text-sm sm:text-base tracking-[0.25em] text-foreground/90 font-semibold truncate">
                    {cardNumber ? cardNumber : "•••• •••• •••• ••••"}
                  </p>
                </div>

                {/* Bottom Row: Amount / Balance & Label */}
                <div className="relative flex items-end justify-between">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {activeTab === "purchase" ? "Gift Card Value" : "Remaining Balance"}
                    </p>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                      {activeTab === "purchase" ? (
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={amount}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="inline-block"
                          >
                            €{amount}
                          </motion.span>
                        </AnimatePresence>
                      ) : cardResult ? (
                        <span className="text-primary">
                          {cardResult.balance?.currency || "€"}{cardResult.balance?.remaining ?? cardResult.balance?.value ?? "0.00"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">€--.--</span>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {cardResult?.void ? "Void" : "Official Gift Voucher"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Tab Content Right Column ────────────────────────── */}
            <div className="flex-1 md:pt-2">
              {activeTab === "purchase" ? (
                /* Purchase Denomination Flow */
                <div>
                  <h1 className="text-3xl font-bold tracking-[-0.02em] md:text-4xl text-foreground">
                    Send a Gift Card
                  </h1>
                  <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
                    Give the perfect gift to a FiveM server owner. Gift cards are delivered instantly by email and can be redeemed on any script or asset in the store.
                  </p>

                  <div className="mt-8">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Select Amount
                    </label>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {AMOUNTS.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className={`rounded-xl border py-3 text-[14px] font-bold transition-all ${
                            amount === val
                              ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(92,200,184,0.25)] scale-[1.02]"
                              : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          }`}
                        >
                          €{val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href={`/cart`}
                    className="mt-8 flex w-full items-center justify-center rounded-xl bg-primary py-4 text-[14px] font-extrabold text-primary-foreground shadow-[0_0_20px_rgba(92,200,184,0.2)] transition-transform hover:scale-[1.02] active:scale-100"
                  >
                    Purchase for €{amount}
                  </Link>

                  <p className="mt-4 text-center text-[11px] text-muted-foreground">
                    Gift cards can be managed or created in your Tebex Creator Panel under Engagement → Gift Cards.
                  </p>
                </div>
              ) : (
                /* Balance Checker Flow */
                <div>
                  <h1 className="text-3xl font-bold tracking-[-0.02em] md:text-4xl text-foreground">
                    Check Gift Card Balance
                  </h1>
                  <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
                    Enter your gift card number below to check your current available funds, original balance, and validity.
                  </p>

                  <form onSubmit={handleCheckBalance} className="mt-6 space-y-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                        Gift Card Code
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. 0127 0244 7210 1111"
                          value={cardNumber}
                          onChange={handleCardInputChange}
                          className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm sm:text-base font-mono tracking-wider outline-none focus:border-primary transition-colors text-foreground pr-10"
                        />
                        {cardNumber && (
                          <button
                            type="button"
                            onClick={() => { setCardNumber(""); setCardResult(null); setErrorMsg(null); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isChecking || !cardNumber.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground text-background py-3.5 text-[14px] font-bold transition-all hover:bg-foreground/90 disabled:opacity-50"
                    >
                      {isChecking ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Checking with Tebex...
                        </>
                      ) : (
                        <>
                          <Search size={16} />
                          Check Balance
                        </>
                      )}
                    </button>
                  </form>

                  {/* Result Box */}
                  <AnimatePresence>
                    {cardResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="mt-6 p-5 rounded-2xl border border-primary/30 bg-primary/[0.04] space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                            <CheckCircle2 size={14} /> {cardResult.void ? "Card Voided" : "Active & Valid"}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                            {copied ? "Copied" : "Copy Code"}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60">
                          <div>
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                              Remaining Balance
                            </span>
                            <span className="text-2xl font-black text-foreground">
                              {cardResult.balance?.currency || "€"}
                              {cardResult.balance?.remaining ?? cardResult.balance?.value ?? "0.00"}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                              Starting Balance
                            </span>
                            <span className="text-lg font-bold text-muted-foreground">
                              {cardResult.balance?.currency || "€"}
                              {cardResult.balance?.starting ?? "0.00"}
                            </span>
                          </div>
                        </div>

                        {cardResult.note && (
                          <p className="text-xs text-muted-foreground italic">
                            Note: {cardResult.note}
                          </p>
                        )}

                        <Link
                          href="/cart"
                          className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:scale-[1.01] transition-transform"
                        >
                          Redeem Card at Checkout <ArrowRight size={14} />
                        </Link>
                      </motion.div>
                    )}

                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="mt-6 p-4 rounded-xl border border-destructive/30 bg-destructive/[0.06] text-destructive text-xs flex items-start gap-2.5"
                      >
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Lookup Failed</p>
                          <p className="mt-0.5 text-muted-foreground">{errorMsg}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
