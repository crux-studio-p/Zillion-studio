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
    const res = await addToCart(packageId);
    
    if (res.success) {
      toast.success("Added to cart successfully");
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
