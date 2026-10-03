// components/reviews/Testimonials.tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, useAnimationFrame, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlurWords } from "@/components/hero/BlurWords";
import { REVIEWS, REVIEWS_SECTION, type Review } from "@/lib/content";
import { EASE_OUT } from "@/lib/hero-timing";

const CARD_MAX = 383; // px
const CARD_H = 236;
const GAP = 16;
const SPEED = 35; // px per second, right to left. A guess: tune it.
const SETS = 3;
const MIN_ITEMS = 8; // per set, so the track always covers wide screens

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Card({ r, w, hidden }: { r: Review; w: number; hidden: boolean }) {
  return (
    <figure
      aria-hidden={hidden || undefined}
      className="flex shrink-0 flex-col items-center rounded-2xl bg-[#e3e1d1] px-8 pb-[15px] pt-4"
      style={{ width: w, height: CARD_H }}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e5e0b8] text-foreground">
        {/* Material "format_quote". If it looks the wrong way round, add rotate-180. */}
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path fill="currentColor" d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
      </span>

      <blockquote className="flex flex-1 items-center">
        <p className="text-center text-[14px] leading-[18.5px] text-foreground">{r.text}</p>
      </blockquote>

      <figcaption className="flex shrink-0 items-center gap-[9px]">
        {r.avatar ? (
          <Image src={r.avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#d8d3a8] text-[11px] font-medium text-neutral-800">
            {initials(r.name)}
          </span>
        )}
        <span className="text-left">
          <span className="block text-[12px] leading-[15px] text-foreground">{r.name}</span>
          <span className="block text-[9.5px] leading-[14px] text-muted-foreground">{r.meta}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials({ reviews = REVIEWS }: { reviews?: Review[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const offset = useMotionValue(0); // px; increases → cards move left
  const speed = useRef(0);
  const paused = useRef(false);
  const nudging = useRef(false);
  const [cardW, setCardW] = useState(CARD_MAX);

  const reduce = useReducedMotion();
  const inView = useInView(root, { margin: "200px 0px" });
  const inViewRef = useRef(false);
  inViewRef.current = inView;

  const n = reviews.length;
  const L = n ? Math.ceil(MIN_ITEMS / n) * n : 0; // cards per set
  const pitch = cardW + GAP;
  const W = L * pitch; // width of one set

  const wRef = useRef(W);
  wRef.current = W;
  const pitchRef = useRef(pitch);
  pitchRef.current = pitch;

  // Card width: fixed 383px, shrinking on small screens.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setCardW(Math.round(Math.min(CARD_MAX, e.contentRect.width * 0.82))),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const write = useCallback(() => {
    const el = track.current;
    const w = wRef.current;
    if (!el || !w) return;
    const x = ((offset.get() % w) + w) % w;
    el.style.transform = `translate3d(${-x}px, 0, 0)`;
  }, [offset]);

  useEffect(() => {
    write();
  }, [W, write]);

  useAnimationFrame((_, delta) => {
    if (!inViewRef.current) return;
    const dt = Math.min(delta, 50); // don't jump after a background tab
    if (!nudging.current) {
      const target = reduce || paused.current ? 0 : SPEED;
      speed.current += (target - speed.current) * Math.min(1, dt / 250); // ease in/out
      offset.set(offset.get() + (speed.current * dt) / 1000);
    }
    write();
  });

  const step = (dir: 1 | -1) => {
    if (nudging.current) return;
    nudging.current = true;
    animate(offset, offset.get() + dir * pitchRef.current, {
      duration: reduce ? 0 : 0.6,
      ease: EASE_OUT,
      onComplete: () => {
        nudging.current = false;
      },
    });
  };

  if (!n) return null; // never show an empty section

  return (
    <section
      ref={root}
      aria-label={REVIEWS_SECTION.eyebrow}
      className="relative w-full overflow-hidden bg-transparent pb-[52px] pt-[50px] text-foreground"
    >
      <div className="text-center">
        <p className="text-[11px] font-normal uppercase leading-[14px] tracking-[0.18em]">
          {REVIEWS_SECTION.eyebrow}
        </p>
        <h2 className="mt-[14px] text-[32px] font-normal leading-[38px] tracking-[-0.03em]">
          <BlurWords text={REVIEWS_SECTION.heading} play={inView} stagger={0.06} />
        </h2>
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Customer reviews"
        className="relative mt-[26px] overflow-hidden"
        style={{ height: CARD_H }}
        onPointerEnter={() => {
          paused.current = true;
        }}
        onPointerLeave={() => {
          paused.current = false;
        }}
      >
        <div
          ref={track}
          className="absolute top-0 flex will-change-transform"
          style={{ left: "50%", marginLeft: -cardW / 2 - W, gap: GAP }}
        >
          {Array.from({ length: SETS * L }, (_, k) => (
            <Card
              key={k}
              r={reviews[k % n]}
              w={cardW}
              // only one real copy of each review is exposed to assistive tech
              hidden={!(k >= L && k < L + n)}
            />
          ))}
        </div>
      </div>

      <div className="mt-[35px] flex justify-center gap-[11px]">
        <button
          type="button"
          aria-label="Previous review"
          onClick={() => step(-1)}
          className="grid h-8 w-8 place-items-center rounded-lg bg-[#0d0d0d] text-primary-foreground transition-transform active:scale-95"
        >
          <ArrowLeft size={12} />
        </button>
        <button
          type="button"
          aria-label="Next review"
          onClick={() => step(1)}
          className="grid h-8 w-8 place-items-center rounded-lg bg-[#0d0d0d] text-primary-foreground transition-transform active:scale-95"
        >
          <ArrowRight size={12} />
        </button>
      </div>
    </section>
  );
}
