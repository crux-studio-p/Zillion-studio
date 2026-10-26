"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Star, 
  ChevronRight, 
  X, 
  ShoppingBag, 
  Plus, 
  Layers, 
  History, 
  HelpCircle,
  Loader2,
  Calendar,
  Tag,
  Gift,
  User,
  Sparkles
} from "lucide-react";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";
import { Faq } from "@/components/faq/Faq";
import { motion, AnimatePresence, Variants } from "motion/react";
import { submitReview, getApprovedReviews } from "@/lib/actions/review.actions";
import { addToCart } from "@/app/actions/cart";
import { toast } from "sonner";
import { TebexPackage } from "@/lib/tebex";
import { ProductChangelog } from "@/lib/db/schema";
import { parsePackageDescription } from "@/lib/parsers/description-parser";
import { EASE_OUT } from "@/lib/hero-timing";

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

export function ProductDetailClient({ 
  pkg, 
  changelogs = [] 
}: { 
  pkg: TebexPackage & { categoryName?: string };
  changelogs?: ProductChangelog[];
}) {
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [openChangelogIndex, setOpenChangelogIndex] = useState<number | null>(0);
  
  // Gifting state
  const [purchaseMode, setPurchaseMode] = useState<"self" | "gift">("self");
  const [recipientUsername, setRecipientUsername] = useState("");
  
  // Parse description content into structured sections
  const parsed = useMemo(() => {
    return parsePackageDescription(pkg.description || "");
  }, [pkg.description]);

  // Database changelogs take priority over description parsed changelogs
  const activeChangelogs = useMemo(() => {
    if (changelogs && changelogs.length > 0) {
      return changelogs.map((c) => ({
        id: c.id,
        version: c.version,
        date: c.releaseDate,
        title: c.title,
        changes: c.changes || [],
        bodyHtml: c.bodyHtml || "",
      }));
    }
    // Fallback if not yet migrated in DB
    return parsed.changelog.map((c, i) => ({
      id: `desc-${i}`,
      version: c.version,
      date: c.date,
      title: null,
      changes: c.changes || [],
      bodyHtml: c.bodyHtml || "",
    }));
  }, [changelogs, parsed.changelog]);

  const latestVersion = useMemo(() => {
    return activeChangelogs.length > 0 ? activeChangelogs[0].version : parsed.version;
  }, [activeChangelogs, parsed.version]);

  const lastUpdated = useMemo(() => {
    return activeChangelogs.length > 0 ? activeChangelogs[0].date : parsed.lastUpdated;
  }, [activeChangelogs, parsed.lastUpdated]);

  useEffect(() => {
    getApprovedReviews(pkg.id.toString()).then(setProductReviews);
  }, [pkg.id]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const currencySymbol = pkg.currency === "EUR" ? "€" : pkg.currency === "GBP" ? "£" : "$";
  const priceDisplay = pkg.total_price === 0 ? "Free" : `${currencySymbol}${pkg.total_price.toFixed(2)}`;
  
  const mediaUrls = pkg.media && pkg.media.length > 0 
    ? pkg.media.filter(m => m.type === "image").map(m => m.url) 
    : (pkg.image ? [pkg.image] : []);

  // Features: use parsed features if present, otherwise fallback
  const features = parsed.features.length > 0 ? parsed.features : [
    "Full source code access",
    "Optimized 0.00ms resmon",
    "Drag & drop functionality",
    "Stash & trunk systems included",
    "Built-in crafting system",
  ];

  // Combine description parsed reviews with DB approved reviews
  const allReviews = useMemo(() => {
    const fromDescription = parsed.reviews.map((r, i) => ({
      id: `desc-${i}`,
      name: r.author,
      text: r.bodyHtml.replace(/<[^>]*>/g, ""),
      rating: r.rating || 5,
      createdAt: r.date ? new Date(r.date) : new Date(),
      isCurated: true,
    }));
    return [...fromDescription, ...productReviews];
  }, [parsed.reviews, productReviews]);

  const reviewScore = useMemo(() => {
    if (allReviews.length === 0) return 5;
    const sum = allReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return Number((sum / allReviews.length).toFixed(1));
  }, [allReviews]);

  const handleAddToCart = async () => {
    if (purchaseMode === "gift" && !recipientUsername.trim()) {
      toast.error("Recipient Username Required", {
        description: "Please enter the FiveM / Cfx.re username of the person receiving this gift.",
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/store";
      const targetUser = purchaseMode === "gift" ? recipientUsername.trim() : undefined;
      const res = await addToCart(pkg.id, currentPath, targetUser);
      if (res.success) {
        if (targetUser) {
          toast.success(`Gift for @${targetUser} added to cart!`, {
            description: "Asset license will be automatically granted to their Cfx.re account.",
          });
        } else {
          toast.success(`"${pkg.name}" added to cart!`);
        }
        window.dispatchEvent(new Event("cart-updated"));
      } else if (res.requiresAuth) {
        toast.error("FiveM Login Required", {
          description: "Connect your FiveM / Cfx.re account to add items to your cart.",
          action: {
            label: "Sign In",
            onClick: () => {
              window.location.href = res.authUrl || `/api/auth/login?returnUrl=${encodeURIComponent(currentPath)}`;
            },
          },
          duration: 7000,
        });
      } else {
        toast.error(res.error || "Failed to add to cart");
      }
    } catch {
      toast.error("An error occurred while adding to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-foreground">
      <Nav />

      <main className="flex-1 px-6 pb-32 pt-[140px]">
        <motion.div 
          className="mx-auto max-w-6xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Breadcrumb */}
          <motion.div variants={fadeUp}>
            <Link
              href="/store"
              className="mb-10 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={14} /> Back to store
            </Link>
          </motion.div>

          <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-20">
            {/* ── Left: Image showcase (Sticky on desktop) ── */}
            <motion.div variants={fadeUp} className="w-full lg:sticky lg:top-[120px] lg:w-[55%] flex flex-col gap-4">
              
              {/* Main Image Container */}
              <div className="relative w-full">
                <div
                  className="relative flex w-full overflow-hidden rounded-3xl bg-muted shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  {mediaUrls.length > 0 ? (
                    <img 
                      src={mediaUrls[activeIndex]} 
                      alt={pkg.name} 
                      className="w-full h-auto block object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center text-muted-foreground text-sm font-medium">
                      No Image
                    </div>
                  )}
                </div>
                
                {/* Prev Button */}
                {mediaUrls.length > 1 && (
                  <button 
                    onClick={() => setActiveIndex((prev) => (prev === 0 ? mediaUrls.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm text-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
                    aria-label="Previous image"
                  >
                    <ChevronRight size={18} strokeWidth={2.5} className="mr-0.5 rotate-180" />
                  </button>
                )}

                {/* Next Button */}
                {mediaUrls.length > 1 && (
                  <button 
                    onClick={() => setActiveIndex((prev) => (prev === mediaUrls.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm text-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} strokeWidth={2.5} className="ml-0.5" />
                  </button>
                )}
              </div>
              
              {/* Thumbnails */}
              {mediaUrls.length > 1 && (
                <div className="flex flex-wrap items-center justify-start gap-3">
                  {mediaUrls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`relative aspect-square w-16 overflow-hidden rounded-xl border-[2.5px] transition-all duration-300 ${
                        i === activeIndex 
                          ? "border-primary opacity-100 scale-105" 
                          : "border-transparent opacity-40 hover:opacity-80"
                      }`}
                    >
                      <img 
                        src={url} 
                        alt={`Thumbnail ${i}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── Right: Details & Checkout ── */}
            <motion.div variants={fadeUp} className="w-full lg:w-[45%] lg:pt-4">
              
              {/* Badges Bar (Category, Version, Updated) */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  {pkg.categoryName || "Package"}
                </span>

                {latestVersion && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                    <Tag size={10} />
                    {latestVersion}
                  </span>
                )}

                {lastUpdated && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Calendar size={11} />
                    {lastUpdated}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="mt-3 text-4xl font-semibold leading-[1.15] tracking-tight text-foreground md:text-5xl">
                {pkg.name}
              </h1>

              {/* Framework Badges */}
              {parsed.compat.frameworks.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-medium text-muted-foreground">Compatible with:</span>
                  {parsed.compat.frameworks.map((fw) => (
                    <span
                      key={fw}
                      className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground border border-border shadow-xs"
                    >
                      {fw}
                    </span>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                <span className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  {priceDisplay}
                </span>
                {pkg.total_price > 0 ? (
                  <span className="rounded-full bg-muted px-3 py-1 text-[12px] font-semibold text-muted-foreground border border-border">
                    One-time payment
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[12px] font-bold text-emerald-600 border border-emerald-500/20">
                    Free Download
                  </span>
                )}
              </div>

              {/* Purchase Mode & Gifting Config */}
              <div className="mt-8 rounded-2xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur-xs transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Purchase Type
                  </span>
                  {purchaseMode === "gift" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                      <Sparkles size={11} /> FiveM Keymaster Gift
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Delivered to your account
                    </span>
                  )}
                </div>

                <div className="relative grid grid-cols-2 gap-1.5 p-1 bg-muted/80 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setPurchaseMode("self")}
                    className={`relative flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-semibold transition-colors duration-200 outline-none select-none ${
                      purchaseMode === "self"
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {purchaseMode === "self" && (
                      <motion.div
                        layoutId="purchaseModePill"
                        className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <User size={15} />
                      <span>For Myself</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!pkg.disable_gifting) setPurchaseMode("gift");
                    }}
                    disabled={pkg.disable_gifting}
                    className={`relative flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-semibold transition-colors duration-200 outline-none select-none ${
                      purchaseMode === "gift"
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    }`}
                  >
                    {purchaseMode === "gift" && (
                      <motion.div
                        layoutId="purchaseModePill"
                        className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Gift size={15} />
                      <span>Gift to Friend</span>
                    </span>
                  </button>
                </div>

                {pkg.disable_gifting && (
                  <p className="mt-2 text-[11px] text-muted-foreground text-center">
                    Gifting is not enabled for this package by store policy.
                  </p>
                )}

                <AnimatePresence>
                  {purchaseMode === "gift" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                            <span>Recipient's FiveM / Cfx.re Username</span>
                          </label>
                          <span className="text-[10.5px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                            Cfx.re Account
                          </span>
                        </div>

                        <div className="relative flex items-center">
                          <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted-foreground font-semibold text-sm">
                            @
                          </div>
                          <input
                            type="text"
                            value={recipientUsername}
                            onChange={(e) => setRecipientUsername(e.target.value)}
                            placeholder="e.g. JohnDoe"
                            className="w-full rounded-xl border border-border bg-background/90 pl-8 pr-3.5 py-2.5 text-[14px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>

                        <div className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3 text-[12px] leading-relaxed text-muted-foreground border border-border/80">
                          <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
                          <span>
                            This script will be delivered directly to this player's <strong className="text-foreground">Cfx.re Keymaster</strong> (<span className="underline decoration-dotted">keymaster.fivem.net</span>) under <strong className="text-foreground">Granted Assets</strong>.
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Add to Cart Button */}
              <div className="mt-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || (purchaseMode === "gift" && !recipientUsername.trim())}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-[14px] font-bold text-primary-foreground shadow-lg shadow-primary/15 transition-transform hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {purchaseMode === "gift" ? "Adding Gift to Cart..." : "Adding to Cart..."}
                    </>
                  ) : purchaseMode === "gift" ? (
                    <>
                      <Gift size={18} />
                      {recipientUsername.trim() ? `Gift to @${recipientUsername.trim()} • ${priceDisplay}` : `Enter Cfx.re Username to Gift`}
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      Add to Cart • {priceDisplay}
                    </>
                  )}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
                  <ShieldCheck size={14} className="text-primary" />
                  Secure checkout powered by Tebex • Instant delivery
                </div>
              </div>

              <div className="mt-10 h-px w-full bg-border" />

              {/* Overview Section */}
              <div className="mt-10">
                <h3 className="text-[16px] font-semibold tracking-tight text-foreground">
                  Overview
                </h3>
                <div 
                  className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: parsed.descriptionHtml || pkg.description }}
                />
              </div>

              {/* Features List ("What's included") */}
              <div className="mt-10 rounded-2xl border border-border bg-muted/60 p-6 backdrop-blur-xs">
                <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
                  What's included
                </h3>
                <ul className="mt-5 space-y-3">
                  {features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[13.5px] text-muted-foreground"
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dependencies Card (if any) */}
              {parsed.compat.dependencies.length > 0 && (
                <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-primary" />
                    <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
                      Dependencies & Requirements
                    </h3>
                  </div>
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {parsed.compat.dependencies.map((dep, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-xl bg-muted px-3 py-1.5 text-[12px] border border-border"
                      >
                        <span className="font-semibold text-foreground">{dep.name}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            dep.required
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          }`}
                        >
                          {dep.required ? "Required" : "Optional"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </div>

          {/* ── Product Changelog / Release History Section ── */}
          {activeChangelogs.length > 0 && (
            <motion.div variants={fadeUp} className="mt-28">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <History size={18} />
                    <span className="text-[12px] font-bold uppercase tracking-widest">Version History</span>
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    Release Changelog
                  </h2>
                </div>
                {latestVersion && (
                  <span className="text-[13px] font-medium text-muted-foreground">
                    Latest: {latestVersion}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {activeChangelogs.map((entry, idx) => {
                  const isOpen = openChangelogIndex === idx;
                  return (
                    <div 
                      key={entry.id || idx}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-colors"
                    >
                      <button
                        onClick={() => setOpenChangelogIndex(isOpen ? null : idx)}
                        className="flex w-full items-center justify-between p-5 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[13px] font-bold text-primary border border-primary/20">
                            {entry.version}
                          </span>
                          {entry.date && (
                            <span className="text-[13px] text-muted-foreground">
                              {entry.date}
                            </span>
                          )}
                          {entry.title && (
                            <span className="text-[13px] font-medium text-foreground hidden sm:inline">
                              • {entry.title}
                            </span>
                          )}
                        </div>
                        <ChevronRight 
                          size={18} 
                          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} 
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1, transition: { duration: 0.25, ease: EASE_OUT } }}
                            exit={{ height: 0, opacity: 0, transition: { duration: 0.15 } }}
                            className="overflow-hidden border-t border-border bg-muted/30 px-6 py-4"
                          >
                            {entry.title && (
                              <p className="text-[14px] font-semibold text-foreground mb-3 sm:hidden">
                                {entry.title}
                              </p>
                            )}
                            {entry.changes.length > 0 ? (
                              <ul className="space-y-2">
                                {entry.changes.map((change, cIdx) => (
                                  <li key={cIdx} className="flex items-start gap-2.5 text-[13.5px] text-muted-foreground">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    <span>{change}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div 
                                className="text-[13.5px] text-muted-foreground prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: entry.bodyHtml }}
                              />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Product-Specific FAQ Section (if specified in package) ── */}
          {parsed.faq.length > 0 && (
            <motion.div variants={fadeUp} className="mt-28">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-primary">
                  <HelpCircle size={18} />
                  <span className="text-[12px] font-bold uppercase tracking-widest">Product FAQ</span>
                </div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs divide-y divide-border">
                {parsed.faq.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="flex w-full items-center justify-between gap-4 text-left font-medium text-[15px] text-foreground hover:text-primary transition-colors"
                      >
                        <span>{item.question}</span>
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                          <Plus size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`} />
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1, transition: { duration: 0.25, ease: EASE_OUT } }}
                            exit={{ height: 0, opacity: 0, transition: { duration: 0.15 } }}
                            className="overflow-hidden pt-3 text-[13.5px] leading-relaxed text-muted-foreground"
                          >
                            <div dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Product Reviews Section ── */}
          <motion.div variants={fadeUp} className="mt-28">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Customer Reviews</h2>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < Math.round(reviewScore) ? "currentColor" : "none"} 
                        className={i >= Math.round(reviewScore) ? "text-neutral-600" : ""}
                      />
                    ))}
                  </div>
                  <span className="text-[13px] font-medium text-muted-foreground">
                    {reviewScore} / 5 • Based on {allReviews.length} {allReviews.length === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setIsReviewModalOpen(true);
                }}
                className="rounded-full border border-border bg-card px-4 py-2 text-[12px] font-semibold text-foreground transition-all hover:bg-muted shadow-xs hover:scale-105 active:scale-95"
              >
                Write a review
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allReviews.length === 0 ? (
                <p className="text-[13px] text-muted-foreground col-span-full">No reviews yet. Be the first to review!</p>
              ) : (
                allReviews.map((review) => (
                  <div key={review.id} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-0.5 text-yellow-400">
                        {[...Array(5)].map((_, idx) => (
                          <Star 
                            key={idx} 
                            size={12} 
                            fill={idx < review.rating ? "currentColor" : "none"} 
                            className={idx >= review.rating ? "text-neutral-700" : ""} 
                          />
                        ))}
                      </div>
                      {review.isCurated && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <p className="flex-1 text-[13.5px] leading-relaxed text-muted-foreground">
                      "{review.text}"
                    </p>
                    <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">{review.name}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

        </motion.div>
      </main>

      {/* Global Store FAQ */}
      <Faq />
      <Footer />

      {/* Write Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div key="review-modal" className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[500px] overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Write a Review</h3>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6"
                  >
                    <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                      <Check size={32} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-[16px] font-bold text-foreground mb-2">Review Submitted!</h4>
                    <p className="text-[13px] text-muted-foreground mb-6">
                      Thank you for your feedback! Your review is currently pending approval by an admin.
                    </p>
                    <button 
                      onClick={() => setIsReviewModalOpen(false)}
                      className="rounded-full bg-primary px-8 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <form 
                    className="flex flex-col gap-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      startTransition(async () => {
                        const res = await submitReview({
                          tebexPackageId: pkg.id.toString(),
                          name: reviewName,
                          text: reviewText,
                          rating: reviewRating,
                        });
                        if (res.success) {
                          setIsSuccess(true);
                          setReviewName("");
                          setReviewText("");
                          setReviewRating(5);
                        }
                      });
                    }}
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-foreground">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. John Doe" 
                        className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-foreground">Rating</label>
                      <div className="flex gap-1 text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            type="button" 
                            onClick={() => setReviewRating(star)}
                            className={`hover:scale-110 transition-transform ${star <= reviewRating ? "text-yellow-400" : "text-muted"}`}
                          >
                            <Star size={24} fill="currentColor" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-foreground">Your Review</label>
                      <textarea 
                        required
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        placeholder="What did you think about this product?" 
                        className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="mt-2 flex justify-end gap-3">
                      <button 
                        type="button" 
                        disabled={isPending}
                        onClick={() => setIsReviewModalOpen(false)}
                        className="rounded-full px-5 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isPending}
                        className="rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {isPending ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
