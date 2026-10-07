"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Trash2, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart, removeFromCart } from "@/app/actions/cart";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const fetchCart = async () => {
    setLoading(true);
    const data = await getCart();
    setCart(data);
    setLoading(false);
  };

  const handleRemove = async (packageId: number) => {
    setRemovingId(packageId);
    const res = await removeFromCart(packageId);
    if (res.success) {
      toast.success("Item removed from cart");
      await fetchCart();
    } else {
      toast.error(res.error || "Failed to remove item");
    }
    setRemovingId(null);
  };

  const cartItems = cart?.packages || [];
  const subtotal = cart?.total_price ?? cart?.price ?? 0;
  const currency = cart?.currency || "USD";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative flex h-full w-full max-w-[420px] flex-col bg-card border-l border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <ShoppingBag size={18} />
                </div>
                <h2 className="text-[16px] font-semibold text-foreground">Your Cart</h2>
                <span className="flex h-5 items-center rounded-full bg-primary/20 px-2 text-[11px] font-bold text-primary">
                  {cartItems.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loading && !cart ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <ShoppingBag size={24} />
                  </div>
                  <p className="text-[15px] font-semibold text-foreground">Your cart is empty</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">Looks like you haven't added anything yet.</p>
                  <button 
                    onClick={onClose}
                    className="mt-6 rounded-full bg-muted px-6 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/80"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cartItems.map((item: any) => {
                    const price = item.in_basket?.price ?? item.price ?? item.base_price ?? 0;
                    const qty = item.in_basket?.quantity ?? item.qty ?? 1;
                    
                    return (
                      <div key={item.id} className="flex items-center gap-4 group">
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted border border-border shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <ShoppingBag size={20} className="text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-semibold text-foreground truncate">{item.name}</h4>
                          <p className="text-[13px] font-medium text-primary mt-0.5">
                            {price === 0 ? "Free" : `${price.toFixed(2)} ${currency}`}
                          </p>
                          {qty > 1 && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">Qty: {qty}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => handleRemove(item.id)}
                          disabled={removingId === item.id}
                          className="p-2 text-muted-foreground opacity-100 md:opacity-0 transition-all hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
                        >
                          {removingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between text-[14px]">
                  <span className="font-medium text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-foreground">
                    {subtotal === 0 ? "Free" : `${subtotal.toFixed(2)} ${currency}`}
                  </span>
                </div>
                <p className="mb-6 text-[11px] text-muted-foreground">
                  Taxes and discounts are calculated at checkout. Powered by Tebex.
                </p>
                <Link 
                  href="/cart"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-bold text-primary-foreground shadow-[0_0_20px_rgba(92,200,184,0.15)] transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(92,200,184,0.25)]"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
