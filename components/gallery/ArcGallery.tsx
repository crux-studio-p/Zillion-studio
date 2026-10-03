// components/gallery/ArcGallery.tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAnimationFrame, useInView, useReducedMotion } from "motion/react";
import { BlurWords } from "@/components/hero/BlurWords";
import { GALLERY, PRODUCTS } from "@/lib/content";

// Design space: the 1147×777 reference frame.
const REF_W = 1147;
const REF_H = 777;
const R = 700; // circle radius
const ARC_TOP_Y = 303; // centre of the top card
const CARD_W = 218;
const CARD_H = 138;
const RADIUS = 12; // card corner radius
const STEP = 21; // degrees between neighbours
const COUNT = 14; // 14 × 21° = 294°, so the wrap point is off-screen
const SPAN = STEP * COUNT;
const SPEED = 4; // degrees per second, right to left. A guess: tune it.

const wrap = (a: number) => ((((a + SPAN / 2) % SPAN) + SPAN) % SPAN) - SPAN / 2;

export function ArcGallery() {
  const root = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const offset = useRef(0); // degrees; decreases over time
  const speed = useRef(0); // eased current speed
  const paused = useRef(false);
  const geo = useRef<{ cx: number; cy: number } | null>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  const reduce = useReducedMotion();
  const inView = useInView(root, { margin: "200px 0px" });
  const inViewRef = useRef(false);
  inViewRef.current = inView;

  // Fit-contain scale from the section's measured size.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      if (e.contentRect.width > 0 && e.contentRect.height > 0) {
        setBox({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rawS = box ? Math.min(box.w / REF_W, box.h / REF_H) : 1;
  const s = rawS > 0 ? rawS : 1; // Prevent division by zero
  const stageW = box ? box.w / s : REF_W;
  const stageH = box ? box.h / s : REF_H;
  const offY = (stageH - REF_H) / 2; // keep the composition vertically centred
  const cx = stageW / 2;
  const cy = ARC_TOP_Y + R + offY;

  const layout = useCallback(() => {
    const g = geo.current;
    if (!g) return;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const a = wrap(i * STEP + offset.current);
      const rad = (a * Math.PI) / 180;
      const x = g.cx + R * Math.sin(rad) - CARD_W / 2;
      const y = g.cy - R * Math.cos(rad) - CARD_H / 2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${a}deg)`;
    });
  }, []);

  useEffect(() => {
    geo.current = { cx, cy };
    layout();
  }, [cx, cy, layout]);

  useAnimationFrame((_, delta) => {
    if (!inViewRef.current) return;
    const dt = Math.min(delta, 50); // don't jump after a background tab
    const target = reduce || paused.current ? 0 : SPEED;
    speed.current += (target - speed.current) * Math.min(1, dt / 250); // ease in/out
    offset.current -= (speed.current * dt) / 1000;
    layout();
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
      className="relative h-screen min-h-[560px] w-full overflow-hidden bg-transparent"
    >


      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: stageW,
          height: stageH,
          transform: `scale(${s})`,
          visibility: box ? "visible" : "hidden",
        }}
      >
        {Array.from({ length: COUNT }, (_, i) => {
          const p = PRODUCTS[i % PRODUCTS.length];
          const dup = i >= PRODUCTS.length;
          return (
            <Link
              key={i}
              ref={(el) => {
                cards.current[i] = el;
              }}
              href={p.href}
              aria-label={`${p.category}: ${p.title}`}
              aria-hidden={dup || undefined}
              tabIndex={dup ? -1 : undefined}
              onPointerEnter={pause}
              onPointerLeave={resume}
              onFocus={pause}
              onBlur={resume}
              className="absolute left-0 top-0 block will-change-transform"
              style={{ width: CARD_W, height: CARD_H }}
            >
              <span
                className="absolute inset-0 block overflow-hidden"
                style={{ borderRadius: RADIUS, background: p.fallback }}
              >
                <Image src="/affiliate-program-bg.png" alt="" fill sizes="300px" className="object-cover" />
                <span className="absolute bottom-2.5 left-3 text-[10px] font-bold uppercase tracking-wide text-white drop-shadow-md z-10">
                  {p.category}
                </span>
              </span>
            </Link>
          );
        })}

        <div
          className="absolute text-center"
          style={{ left: cx, top: 504 + offY, width: 240, transform: "translateX(-50%)" }}
        >
          <h2 className="text-[15px] font-medium leading-[15px] text-foreground">
            <BlurWords text={GALLERY.heading} play={inView} stagger={0.06} />
          </h2>
          <BlurWords
            text={GALLERY.subtitle}
            play={inView}
            delay={0.4}
            stagger={0.03}
            className="mx-auto mt-1.5 block w-[215px] text-[12px] leading-[15px] text-muted-foreground"
          />
          <div className="mt-[18px]">
            <Link
              href={GALLERY.cta.href}
              className="inline-grid h-[21px] place-items-center rounded-full bg-primary px-3.5 text-[11px] font-medium text-primary-foreground"
            >
              {GALLERY.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
