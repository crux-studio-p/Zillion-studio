// components/store/ProductCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { parsePackageDescription } from "@/lib/parsers/description-parser";
import { addToCart } from "@/app/actions/cart";
import { toast } from "sonner";

export type ProductCardProps = {
  id: number;
  name: string;
  image?: string;
  price: number;
  currency?: string;
  categoryName?: string;
  description?: string;
  accentColor?: string;
  deliveryText?: string;
  href?: string;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function AddToCartPlusButton({
  packageId,
  packageName,
}: {
  packageId: number;
  packageName: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === "loading") return;

    setStatus("loading");
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "/store";

    try {
      const res = await addToCart(packageId, currentPath);

      if (res.success) {
        setStatus("success");
        window.dispatchEvent(new Event("cart-updated"));
        toast.success(`Added ${packageName} to cart`);

        setTimeout(() => {
          setStatus("idle");
        }, 1600);
      } else if (res.requiresAuth) {
        setStatus("idle");
        toast.error("FiveM Login Required", {
          description:
            "Connect your FiveM / Cfx.re account to add items to your cart.",
          action: {
            label: "Sign In",
            onClick: () => {
              window.location.href =
                res.authUrl ||
                `/api/auth/login?returnUrl=${encodeURIComponent(currentPath)}`;
            },
          },
          duration: 7000,
        });
      } else {
        setStatus("idle");
        toast.error(res.error || "Failed to add to cart");
      }
    } catch {
      setStatus("idle");
      toast.error("Failed to add to cart");
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.88 }}
      aria-label={`Add ${packageName} to cart`}
      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 outline-none sm:h-8.5 sm:w-8.5 ${
        status === "success"
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "border-black/15 bg-card text-foreground hover:border-foreground hover:bg-foreground hover:text-background dark:border-white/20 dark:bg-card dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
          >
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
          </motion.div>
        )}

        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.6, rotate: 45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
          >
            <Plus className="h-4 w-4 stroke-[2.2]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle expanding ring pulse on successful add */}
      {status === "success" && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-500"
        />
      )}
    </motion.button>
  );
}

export function ProductCard({
  id,
  name,
  image,
  price,
  currency = "USD",
  categoryName,
  description = "",
  href,
}: ProductCardProps) {
  const cardHref = href || `/store/${slugify(name)}-${id}`;
  const parsed = parsePackageDescription(description || "");

  // Derive pills/tags from parsed description or fallback categories
  const tags: string[] = [];
  if (parsed.compat.frameworks.length > 0) {
    tags.push(...parsed.compat.frameworks);
  }
  if (parsed.version) {
    tags.push(parsed.version);
  }
  if (parsed.compat.dependencies.length > 0) {
    tags.push(
      ...parsed.compat.dependencies.slice(0, 2).map((d) => d.name)
    );
  }
  if (tags.length === 0) {
    if (categoryName) tags.push(categoryName);
    tags.push("FiveM", "Verified");
  }

  // Format price matching the image: e.g. "10$" or "Free"
  const formattedPrice =
    price === 0
      ? "Free"
      : currency === "EUR"
      ? `${Math.round(price)}€`
      : currency === "GBP"
      ? `£${Math.round(price)}`
      : `${Math.round(price)}$`;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-card p-3 sm:p-3.5 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_44px_-12px_rgba(0,0,0,0.12)]">
      {/* Top Image Container: Exact size of the image */}
      <Link href={cardHref} className="block w-full">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] bg-card">
          {/* Product Image filling the container */}
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
              No Image
            </div>
          )}
        </div>
      </Link>

      {/* Top-Right Price Tab: Attached directly to the card's top-right corner */}
      <div className="pointer-events-none absolute -top-1 -right-1 z-20 flex items-center justify-center rounded-bl-[24px] rounded-tr-[32px] bg-card pl-4 pr-5 pb-2 pt-3">
        <span className="text-[17px] font-medium tracking-tight text-foreground sm:text-[19px]">
          {formattedPrice}
        </span>
      </div>

      {/* Card Info Below Image */}
      <div className="mt-3.5 flex flex-col px-1">
        {/* Title and Plus Button Row */}
        <div className="flex items-center justify-between gap-3">
          <Link href={cardHref} className="min-w-0 flex-1">
            <h3 className="truncate text-[18px] font-medium tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-[20px]">
              {name}
            </h3>
          </Link>

          <AddToCartPlusButton packageId={id} packageName={name} />
        </div>

        {/* Tags / Frameworks Pills Row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pb-0.5">
          {tags.slice(0, 4).map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="rounded-md bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
