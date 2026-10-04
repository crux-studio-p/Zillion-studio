"use client";

import { use, useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, ShieldCheck, Star, ChevronRight, X, ShoppingBag } from "lucide-react";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";
import { Faq } from "@/components/faq/Faq";
import { motion, AnimatePresence, Variants } from "motion/react";
import { submitReview, getApprovedReviews } from "@/lib/actions/review.actions";

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

// Mock data: In a real app, you'd fetch the product by ID
const MOCK_PRODUCT = {
  title: "Zillion Inventory UI",
  category: "UI / HUD",
  price: "£19.99",
  fallback: "linear-gradient(160deg,#8aa6c1,#2b3a55)",
  description:
    "A meticulously crafted inventory system for FiveM. Featuring drag-and-drop mechanics, metadata support, weapon attachments, and a stunning glassmorphic interface that instantly elevates your server's production value.",
  features: [
    "Full source code access",
    "Optimized 0.00ms resmon",
    "Drag & drop functionality",
    "Stash & trunk systems included",
    "Built-in crafting system",
  ],
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  const [productReviews, setProductReviews] = useState<any[]>([]);
  
  useEffect(() => {
    getApprovedReviews(id).then(setProductReviews);
  }, [id]);

  const [activeIndex, setActiveIndex] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

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
            className="mb-10 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-neutral-900"
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
                  className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl bg-muted shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <Image 
                    src="/affiliate-program-bg.png" 
                    alt="Product Preview" 
                    fill 
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                    style={{ filter: activeIndex !== 1 ? `hue-rotate(${activeIndex * 40}deg)` : 'none' }}
                    priority
                  />
                </div>
                
                {/* Prev Button */}
                <button 
                  onClick={() => setActiveIndex((prev) => (prev === 1 ? 5 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronRight size={18} strokeWidth={2.5} className="mr-0.5 rotate-180" />
                </button>

                {/* Next Button */}
                <button 
                  onClick={() => setActiveIndex((prev) => (prev === 5 ? 1 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} strokeWidth={2.5} className="ml-0.5" />
                </button>
              </div>
              
              {/* Thumbnails */}
              <div className="flex flex-wrap items-center justify-start gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative aspect-square w-16 overflow-hidden rounded-xl border-[2.5px] transition-all duration-300 ${
                      i === activeIndex 
                        ? "border-neutral-300 opacity-100" 
                        : "border-transparent opacity-40 hover:opacity-80"
                    }`}
                  >
                    <Image 
                      src="/affiliate-program-bg.png" 
                      alt={`Thumbnail ${i}`} 
                      fill 
                      sizes="64px"
                      className="object-cover" 
                      style={{ filter: i !== 1 ? `hue-rotate(${i * 40}deg)` : 'none' }}
                    />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ── Right: Details & Checkout ── */}
            <motion.div variants={fadeUp} className="w-full lg:w-[45%] lg:pt-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#5cc8b8]">
                {MOCK_PRODUCT.category}
              </span>

              <h1 className="mt-3 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-5xl">
                {MOCK_PRODUCT.title}
              </h1>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-3xl font-light tracking-tighter text-foreground">
                  {MOCK_PRODUCT.price}
                </span>
                <span className="mb-1.5 text-[13px] text-muted-foreground">
                  one-time payment
                </span>
              </div>

              <div className="mt-10">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-[14px] font-bold text-primary-foreground shadow-lg transition-transform hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98]">
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
                  <ShieldCheck size={14} className="text-primary" />
                  Secure checkout, instant delivery to your email.
                </div>
              </div>

              <div className="mt-14 h-px w-full bg-black/5" />

              <div className="mt-14">
                <h3 className="text-[16px] font-semibold tracking-tight">
                  Overview
                </h3>
                <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground">
                  {MOCK_PRODUCT.description}
                </p>
              </div>

              <div className="mt-12 rounded-2xl border border-border bg-muted p-6">
                <h3 className="text-[14px] font-semibold tracking-tight">
                  What's included
                </h3>
                <ul className="mt-5 space-y-3">
                  {MOCK_PRODUCT.features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[13.5px] text-muted-foreground"
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#5cc8b8]/20 text-[#298f80]">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* ── Product Reviews Section ── */}
          <motion.div variants={fadeUp} className="mt-32">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Customer Reviews</h2>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-[13px] font-medium text-muted-foreground">Based on {productReviews.length} reviews</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setIsReviewModalOpen(true);
                }}
                className="rounded-full border border-border px-4 py-2 text-[12px] font-semibold transition-colors hover:bg-black/5"
              >
                Write a review
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {productReviews.length === 0 ? (
                <p className="text-[13px] text-muted-foreground col-span-full">No reviews yet. Be the first to review!</p>
              ) : (
                productReviews.map((review) => (
                  <div key={review.id} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex gap-0.5 text-yellow-400 mb-4">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={12} fill={idx < review.rating ? "currentColor" : "none"} className={idx >= review.rating ? "text-neutral-700" : ""} />
                      ))}
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
                          tebexPackageId: id,
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
                            className={`hover:scale-110 transition-transform ${star <= reviewRating ? 'text-yellow-400' : 'text-muted'}`}
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
