// components/gallery/ArcGallery.tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAnimationFrame, useInView, useReducedMotion } from "motion/react";
import { BlurWords } from "@/components/hero/BlurWords";
import { GALLERY, PRODUCTS as DEFAULT_PRODUCTS } from "@/lib/content";
import { useGalleryLayout } from "./useGalleryLayout";

const RADIUS = 12; // card corner radius
const STEP = 21; // degrees between neighbours
const COUNT = 14; // 14 × 21° = 294°, so the wrap point is off-screen
const SPAN = STEP * COUNT;
const SPEED = 4; // degrees per second, right to left.

const wrap = (a: number) => ((((a + SPAN / 2) % SPAN) + SPAN) % SPAN) - SPAN / 2;

export type GalleryProduct = {
  category: string;
  title: string;
  image: string;
  id?: number;
};

export function ArcGallery({ products }: { products?: GalleryProduct[] }) {
  const root = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const offset = useRef(0); // degrees; decreases over time
  const speed = useRef(0); // eased current speed
  const paused = useRef(false);
  const layout = useGalleryLayout(root);

  const reduce = useReducedMotion();
  const inView = useInView(root, { margin: "200px 0px" });
  const inViewRef = useRef(false);
  inViewRef.current = inView;

  // Fallback to default products if no dynamic products are passed
  const displayProducts = products && products.length > 0 
    ? products 
    : DEFAULT_PRODUCTS.map(p => ({
        category: p.category,
        title: p.title,
        image: "/affiliate-program-bg.png", // Default image
      }));

  const positionCards = useCallback(() => {
    if (!layout) return;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const a = wrap(i * STEP + offset.current);
      const rad = (a * Math.PI) / 180;
      const x = layout.arc.cx + layout.arc.r * Math.sin(rad) - layout.card.w / 2;
      const y = layout.arc.cy - layout.arc.r * Math.cos(rad) - layout.card.h / 2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${a}deg)`;
    });
  }, [layout]);

  useEffect(() => {
    positionCards();
  }, [positionCards]);

  useAnimationFrame((_, delta) => {
    if (!inViewRef.current || !layout) return;
    const dt = Math.min(delta, 50); // don't jump after a background tab
    const target = reduce || paused.current ? 0 : SPEED;
    speed.current += (target - speed.current) * Math.min(1, dt / 250); // ease in/out
    offset.current -= (speed.current * dt) / 1000;
    positionCards();
  });

  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };

  return (
    <section
      ref={root}
      aria-label="Latest products"
      className="relative h-[600px] md:h-screen min-h-[560px] w-full overflow-hidden bg-transparent"
    >
      {layout && (
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: layout.W,
            height: layout.H,
            transform: `scale(${layout.k})`,
          }}
        >
          <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
            <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent_0%,black_20%,black_80%,transparent_100%)]">
              {Array.from({ length: COUNT }, (_, i) => {
                const p = displayProducts[i % displayProducts.length];
                const dup = i >= displayProducts.length;
                return (
                  <Link
                    key={i}
                    ref={(el) => {
                      cards.current[i] = el;
                    }}
                    href={p.id ? `/store/package/${p.id}` : "#"}
                    aria-label={`${p.category}: ${p.title}`}
                    aria-hidden={dup || undefined}
                    tabIndex={dup ? -1 : undefined}
                    onPointerEnter={pause}
                    onPointerLeave={resume}
                    onFocus={pause}
                    onBlur={resume}
                    className="absolute left-0 top-0 block will-change-transform"
                    style={{ width: layout.card.w, height: layout.card.h }}
                  >
                    <span
                      className="absolute inset-0 block overflow-hidden bg-card"
                      style={{ borderRadius: RADIUS }}
                    >
                      <Image src={p.image} alt={p.title} fill sizes="300px" className="object-cover" />
                      <span className="absolute bottom-2.5 left-3 text-[10px] font-bold uppercase tracking-wide text-white drop-shadow-md z-10">
                        {p.category}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div
            className="absolute text-center flex flex-col items-center"
            style={{ 
              left: layout.text.cx, 
              top: layout.text.top, 
              width: layout.text.w, 
              transform: "translateX(-50%)" 
            }}
          >
            <h2 className="font-medium text-foreground" style={{ fontSize: layout.text.headSize, lineHeight: layout.text.headLH + "px" }}>
              <BlurWords text={GALLERY.heading} play={inView} stagger={0.06} />
            </h2>
            <div
              className="mt-1.5 block text-muted-foreground"
              style={{ width: layout.text.subW, fontSize: layout.text.subSize, lineHeight: layout.text.subLH + "px" }}
            >
              <BlurWords
                text={GALLERY.subtitle}
                play={inView}
                delay={0.4}
                stagger={0.03}
              />
            </div>
            <div className="mt-[18px]">
              <Link
                href={GALLERY.cta.href}
                className={`inline-grid place-items-center rounded-full bg-primary font-medium text-primary-foreground ${
                  layout.text.ctaSize === "md" ? "h-[40px] px-6 text-[14px]" : "h-[21px] px-3.5 text-[11px]"
                }`}
              >
                {GALLERY.cta.label}
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
