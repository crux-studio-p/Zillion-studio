"use client";

import { useState } from "react";
import { addToCart } from "@/app/actions/cart";
import { toast } from "sonner";
import { ShoppingBag, Loader2 } from "lucide-react";

export function AddToCartButton({ packageId }: { packageId: number }) {
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/store";
    const res = await addToCart(packageId, currentPath);
    
    if (res.success) {
      toast.success("Added to cart successfully");
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
    
    setLoading(false);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      aria-label="Add to cart"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
    </button>
  );
}
