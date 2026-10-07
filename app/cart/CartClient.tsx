"use client";

import Link from "next/link";
import { ArrowLeft, Trash2, ShieldCheck, Zap, Loader2, Tag, X } from "lucide-react";
import Image from "next/image";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";
import { useState, useEffect } from "react";
import { getCart, removeFromCart, applyCoupon, removeCoupon } from "@/app/actions/cart";
import { toast } from "sonner";

export function CartClient({ initialCart }: { initialCart: any }) {
  const [cart, setCart] = useState<any>(initialCart);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [removingCouponCode, setRemovingCouponCode] = useState<string | null>(null);

  const fetchCart = async () => {
    const data = await getCart();
    setCart(data);
  };

  const handleRemove = async (packageId: number) => {
    setUpdatingId(packageId);
    const res = await removeFromCart(packageId);
    if (res.success) {
      toast.success("Item removed from cart");
      await fetchCart();
    } else {
      toast.error(res.error || "Failed to remove item");
    }
    setUpdatingId(null);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    const res = await applyCoupon(couponCode.trim());
    if (res.success) {
      toast.success("Coupon applied!");
      setCouponCode("");
      await fetchCart();
    } else {
      toast.error(res.error || "Invalid coupon code");
    }
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = async (code: string) => {
    setRemovingCouponCode(code);
    const res = await removeCoupon(code);
    if (res.success) {
      toast.success("Coupon removed");
      await fetchCart();
    } else {
      toast.error(res.error || "Failed to remove coupon");
    }
    setRemovingCouponCode(null);
  };

  const cartItems = cart?.packages || [];
  const coupons = cart?.coupons || [];
  const subtotal = cart?.total_price ?? cart?.price ?? 0;
  const currency = cart?.currency || "USD";
  const checkoutUrl = cart?.links?.checkout || "#";

  return (
    <>
    <Nav />
    <div className="min-h-screen pt-[100px] md:pt-[160px] pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          My Cart
        </h1>
        <Link 
          href="/store"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full border border-border hover:bg-muted"
        >
          <ArrowLeft size={16} /> Continue shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-border rounded-[24px]">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4">
            <Trash2 size={24} />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link 
            href="/store"
            className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-full shadow-[0_0_20px_rgba(92,200,184,0.15)] hover:scale-[1.02] transition-transform"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column - Cart Items */}
          <div className="flex-1 w-full bg-card border border-border rounded-[24px] p-6 md:p-8 shadow-sm">
            {/* Cart Table (Desktop) */}
            <div className="hidden md:block w-full">
              <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-5">Product</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              <div className="flex flex-col">
                {cartItems.map((item: any) => {
                  const price = item.in_basket?.price ?? item.price ?? item.base_price ?? 0;
                  const qty = item.in_basket?.quantity ?? item.qty ?? 1;
                  const total = price * qty;
                  
                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-4 py-6 border-b border-border items-center group last:border-0 last:pb-0">
                      {/* Product Details */}
                      <div className="col-span-5 flex items-center gap-6">
                        <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-muted border border-border shrink-0">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">No image</div>
                          )}
                        </div>
                        <div className="min-w-0 pr-4">
                          <h3 className="text-base font-semibold text-foreground truncate">{item.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">Item ID: {item.id}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-sm font-medium text-foreground whitespace-nowrap">
                        {price === 0 ? "Free" : `${price.toFixed(2)} ${currency}`}
                      </div>

                      {/* Qty */}
                      <div className="col-span-2 flex items-center gap-4">
                        <div className="flex items-center border border-border rounded-lg bg-background px-3 py-1.5">
                          <span className="text-sm font-medium">{qty}</span>
                        </div>
                      </div>

                      {/* Total & Remove */}
                      <div className="col-span-3 flex items-center justify-end gap-4">
                        <span className="font-bold text-foreground text-sm whitespace-nowrap">
                          {total === 0 ? "Free" : `${total.toFixed(2)} ${currency}`}
                        </span>
                        <button 
                          onClick={() => handleRemove(item.id)}
                          disabled={updatingId === item.id}
                          className="p-2 -mr-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 shrink-0"
                        >
                          {updatingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart List (Mobile) */}
            <div className="md:hidden flex flex-col gap-6">
              {cartItems.map((item: any) => {
                const price = item.in_basket?.price ?? item.price ?? item.base_price ?? 0;
                const qty = item.in_basket?.quantity ?? item.qty ?? 1;
                const total = price * qty;
                
                return (
                  <div key={item.id} className="flex flex-col gap-4 p-4 border border-border rounded-2xl bg-background">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">No image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground leading-tight">{item.name}</h3>
                        <div className="font-bold text-foreground mt-2 text-sm">
                          {total === 0 ? "Free" : `${total.toFixed(2)} ${currency}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center border border-border rounded-lg bg-muted/50 px-3 py-1">
                        <span className="text-xs font-medium">Qty: {qty}</span>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.id)}
                        disabled={updatingId === item.id}
                        className="p-2 text-muted-foreground hover:text-destructive bg-muted rounded-full transition-colors disabled:opacity-50"
                      >
                        {updatingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Checkout Summary Box */}
          <div className="w-full lg:w-[420px] shrink-0 sticky top-[120px]">
            <div className="bg-card border border-border rounded-[24px] p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
              {/* Coupon Code Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Tag size={16} className="text-primary" /> Promotional Code
                </h3>
                
                {coupons.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {coupons.map((c: any) => (
                      <div key={c.code} className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                        <div>
                          <span className="font-bold text-[13px] text-primary">{c.code}</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveCoupon(c.code)}
                          disabled={removingCouponCode === c.code}
                          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          {removingCouponCode === c.code ? <Loader2 size={14} className="animate-spin" /> : <X size={16} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter coupon code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="bg-foreground text-background px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-foreground/90 disabled:opacity-50 w-[80px] flex justify-center items-center"
                  >
                    {applyingCoupon ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                  </button>
                </form>
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">
                    {subtotal === 0 ? "Free" : `${subtotal.toFixed(2)} ${currency}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-primary font-medium">Free</span>
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-2xl font-black text-foreground">
                    {subtotal === 0 ? "Free" : `${subtotal.toFixed(2)}`} <span className="text-base text-muted-foreground font-medium">{subtotal !== 0 && currency}</span>
                  </span>
                </div>
              </div>

              <a 
                href={checkoutUrl}
                className="w-full bg-primary text-primary-foreground font-bold text-[15px] py-4 rounded-xl shadow-[0_0_20px_rgba(92,200,184,0.15)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck size={20} />
                Checkout Securely
              </a>

              <p className="text-[11px] text-muted-foreground text-center">
                Secure checkout provided by Tebex. You will be redirected to complete your purchase.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
}
