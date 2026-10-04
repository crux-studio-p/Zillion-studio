import Link from "next/link";
import { ArrowLeft, Trash2, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";

// Placeholder dummy data
const DUMMY_CART_ITEMS = [
  {
    id: "1",
    name: "Zillion Inventory UI",
    category: "FiveM UI Scripts",
    price: 15.0,
    qty: 1,
    image: "/affiliate-program-bg.png",
  },
  {
    id: "2",
    name: "Premium Admin Dashboard",
    category: "Web Interfaces",
    price: 35.0,
    qty: 1,
    image: "/affiliate-program-bg.png",
  }
];

export default function CartPage() {
  const subtotal = DUMMY_CART_ITEMS.reduce((sum, item) => sum + (item.price * item.qty), 0);

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

      {DUMMY_CART_ITEMS.length === 0 ? (
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
        <div className="flex flex-col gap-12">
          {/* Cart Table (Desktop) */}
          <div className="hidden md:block w-full">
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="flex flex-col">
              {DUMMY_CART_ITEMS.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 py-8 border-b border-border items-center group">
                  {/* Product Details */}
                  <div className="col-span-6 flex items-center gap-6">
                    <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-muted border border-border shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Category: {item.category}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 font-medium text-foreground">
                    ${item.price.toFixed(2)}
                  </div>

                  {/* Qty */}
                  <div className="col-span-2 flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden">
                      <button className="px-3 py-1.5 text-muted-foreground hover:bg-muted transition-colors hover:text-foreground">−</button>
                      <span className="px-2 text-sm font-medium w-8 text-center">{item.qty}</span>
                      <button className="px-3 py-1.5 text-muted-foreground hover:bg-muted transition-colors hover:text-foreground">+</button>
                    </div>
                  </div>

                  {/* Total & Remove */}
                  <div className="col-span-2 flex items-center justify-end gap-6">
                    <span className="font-bold text-foreground">${(item.price * item.qty).toFixed(2)}</span>
                    <button className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart List (Mobile) */}
          <div className="md:hidden flex flex-col gap-6">
            {DUMMY_CART_ITEMS.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 p-4 border border-border rounded-2xl bg-card">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground leading-tight">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                    <div className="font-bold text-foreground mt-2">${item.price.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden">
                    <button className="px-3 py-1 text-muted-foreground hover:bg-muted transition-colors hover:text-foreground">−</button>
                    <span className="px-2 text-sm font-medium w-8 text-center">{item.qty}</span>
                    <button className="px-3 py-1 text-muted-foreground hover:bg-muted transition-colors hover:text-foreground">+</button>
                  </div>
                  <button className="p-2 text-muted-foreground hover:text-destructive bg-muted rounded-full transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary Box */}
          <div className="bg-card border border-border rounded-[24px] p-6 md:p-10 flex flex-col md:flex-row justify-between gap-10">
            
            {/* Delivery Info (Digital Goods) */}
            <div className="flex-1 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Delivery Method</h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-start gap-4 p-4 border border-primary/30 bg-primary/5 rounded-2xl cursor-pointer transition-colors hover:bg-primary/10">
                  <div className="mt-0.5">
                    <div className="h-5 w-5 rounded-full border-4 border-primary bg-background shadow-[0_0_10px_rgba(92,200,184,0.3)]"></div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <Zap size={16} className="text-primary" />
                      Instant Digital Delivery <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">FREE</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Assets are automatically linked to your FiveM Keymaster account via Tebex immediately after payment.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Total Summary */}
            <div className="md:w-[400px] flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">${subtotal.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-primary font-medium">Free</span>
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-2xl font-black text-foreground">${subtotal.toFixed(2)} <span className="text-base text-muted-foreground font-medium">USD</span></span>
                </div>
              </div>

              <button className="w-full bg-primary text-primary-foreground font-bold text-lg py-4 rounded-xl shadow-[0_0_30px_rgba(92,200,184,0.2)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                <ShieldCheck size={20} />
                Checkout Securely
              </button>

              <p className="text-xs text-muted-foreground text-center">
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
