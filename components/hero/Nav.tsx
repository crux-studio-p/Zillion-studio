// components/hero/Nav.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, Menu, ShoppingBag, Sun, Moon, User, X, LogOut, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { EASE_OUT, T } from "@/lib/hero-timing";
import { CartDrawer } from "@/components/store/CartDrawer";
import { BRAND, NAV_LINKS } from "@/lib/content";
import { getCart } from "@/app/actions/cart";

import Link from "next/link";

function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-semibold tracking-tight hover:opacity-80 transition-opacity ${className}`}>
      <svg viewBox="0 0 24 24" className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden="true">
        <path d="M3 4l10 3-4 5zM14 9l7-1-3 7zM9 14l4 6-7-1z" fill="#5cc8b8" />
      </svg>
      {BRAND}
    </Link>
  );
}

const ICON_BTN = "grid place-items-center rounded-full bg-card text-foreground shadow-sm";

export function Nav() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{username?: string, id?: string} | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("/store");
  const [cartCount, setCartCount] = useState<number>(0);

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const refreshCart = useCallback(async () => {
    try {
      const cart = await getCart();
      const count =
        cart?.packages?.reduce(
          (sum: number, item: any) => sum + (item.in_basket?.quantity || item.quantity || 1),
          0
        ) ?? 0;
      setCartCount(count);
    } catch {
      // Ignore background fetch error
    }
  }, []);

  useEffect(() => {
    refreshCart();

    const handleUpdate = () => {
      refreshCart();
    };

    window.addEventListener("cart-updated", handleUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleUpdate);
    };
  }, [refreshCart]);

  useEffect(() => {
    if (!isCartOpen) {
      refreshCart();
    }
  }, [isCartOpen, refreshCart]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setAuthLoading(false));
  }, []);

  // lock page scroll while the menu is open; Escape closes it
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <>
      <div className="fixed left-0 top-0 z-50 w-full text-foreground">
        {/* Seamless gradient blur (no box/hard edges) */}
        <div
          className="pointer-events-none absolute left-0 top-0 z-[-1] h-[90px] w-full backdrop-blur-md lg:h-[120px]"
          style={{
            maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
          }}
        />
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[94px] lg:px-[46px]"
        >
          <Logo className="text-[18px] lg:text-[22px]" />

          <nav aria-label="Primary" className="flex items-center gap-3 lg:gap-[31px]">
            <ul className="hidden items-center gap-5 text-[16px] font-medium lg:flex xl:text-[18.5px]">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.label}
                  initial={{ opacity: 0, filter: "blur(8px)", x: 12 }}
                  animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                  transition={{
                    delay: T.nav + (NAV_LINKS.length - 1 - i) * 0.07,
                    duration: 0.6,
                    ease: EASE_OUT,
                  }}
                >
                  <a href={l.href} className="flex items-center gap-1 whitespace-nowrap hover:opacity-60">
                    {l.icon === "chat" && <MessageCircle size={8} fill="currentColor" aria-hidden="true" />}
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="Shopping Cart"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: T.nav, duration: 0.5, ease: EASE_OUT }}
                className={`${ICON_BTN} relative h-10 w-10`}
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </motion.button>

              <div className="hidden items-center gap-2 lg:flex">
                {authLoading ? (
                  <div className="h-10 w-[72px] animate-pulse rounded-full bg-card/40" />
                ) : user ? (
                  <div className="group relative">
                    <motion.button
                      type="button"
                      aria-label="Account"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: EASE_OUT }}
                      className="flex h-10 items-center gap-2 rounded-full bg-card px-4 text-[14.5px] font-semibold text-foreground shadow-sm transition-colors hover:bg-card/80"
                    >
                      <User size={16} />
                      <span className="max-w-[120px] truncate">{user.username || "Account"}</span>
                    </motion.button>
                    {/* Dropdown for logout */}
                    <div className="absolute right-0 top-full hidden pt-2 group-hover:block">
                      <div className="flex w-[140px] flex-col rounded-xl border border-border/50 bg-card p-2 shadow-xl">
                        <a 
                          href="/api/auth/logout" 
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                        >
                          <LogOut size={16} />
                          Logout
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.a
                    href={`/api/auth/login?returnUrl=${encodeURIComponent(currentPath)}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: T.nav + 0.05, duration: 0.5, ease: EASE_OUT }}
                    className="flex h-10 items-center justify-center rounded-full bg-primary px-5 text-[14.5px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-85"
                  >
                    Login
                  </motion.a>
                )}

                <motion.button
                  type="button"
                  aria-label="Toggle theme"
                  onClick={toggleTheme}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: T.nav + 0.1, duration: 0.5, ease: EASE_OUT }}
                  className={`${ICON_BTN} h-10 w-10 hover:opacity-80 transition-opacity`}
                >
                  {mounted && resolvedTheme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                </motion.button>
              </div>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen(true)}
                className={`${ICON_BTN} h-10 w-10 lg:hidden`}
              >
                <Menu size={18} />
              </button>
            </div>
          </nav>
        </motion.header>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-background/95 px-4 pb-6 backdrop-blur-xl sm:px-6 lg:hidden"
          >
            <div className="flex h-[56px] sm:h-[64px] shrink-0 items-center justify-between border-b border-border/40">
              <Logo className="text-[18px]" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className={`${ICON_BTN} h-10 w-10`}
                autoFocus
              >
                <X size={18} />
              </button>
            </div>

            <ul className="my-auto flex flex-1 min-h-0 flex-col overflow-y-auto py-2">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.35, ease: EASE_OUT }}
                >
                  <a
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 border-b border-border/30 py-2 sm:py-2.5 text-[28px] sm:text-[21px] font-medium tracking-tight text-foreground/90 transition-colors hover:text-foreground"
                  >
                    {l.icon === "chat" && <MessageCircle size={15} fill="currentColor" aria-hidden="true" />}
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="mt-auto shrink-0 flex flex-col gap-2.5 pt-3 border-t border-border/40">
              {user && (
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-card border border-border">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground shrink-0">
                    <User size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground leading-none mb-0.5">Signed in as</p>
                    <p className="text-xs font-semibold text-foreground truncate">{user.username || "Account"}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {user ? (
                  <a 
                    href="/api/auth/logout" 
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </a>
                ) : (
                  <a 
                    href={`/api/auth/login?returnUrl=${encodeURIComponent(currentPath)}`} 
                    className="flex h-11 flex-1 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-85"
                  >
                    Login
                  </a>
                )}
                <button
                  type="button"
                  aria-label="Toggle theme"
                  onClick={toggleTheme}
                  className={`${ICON_BTN} h-11 w-11 shrink-0 hover:opacity-80 transition-opacity`}
                >
                  {mounted && resolvedTheme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
