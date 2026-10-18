// components/hero/CardStack.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT, T } from "@/lib/hero-timing";
import { HERO, type Pose } from "@/lib/card-poses";
import { CARDS as DEFAULT_CARDS } from "@/lib/content";
import type { Layout } from "@/lib/hero-layout";
import Link from "next/link";
import { preload } from "react-dom";

export type HeroCard = {
  id?: number;
  category: string;
  title: string;
  image: string;
};

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function makeIntro(fan: Pose[]): Variants {
  return {
    hidden: (i: number) =>
      i === HERO
        ? { x: 0, y: 420, rotate: 16, rotateY: 0, opacity: 1 }
        : { x: 0, y: 0, rotate: 0, rotateY: 0, opacity: 0 },
    centered: (i: number) =>
      i === HERO
        ? { x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 1.6, ease: EASE_OUT, delay: T.heroRise } }
        : { opacity: 0 },
    stacked: (i: number) => ({
      x: -(HERO - i) * 5,
      y: 0,
      rotate: 0,
      rotateY: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: EASE_OUT, delay: (HERO - i) * 0.05 },
    }),
    fanned: (i: number) => ({
      x: fan[i].x,
      y: fan[i].y,
      rotate: fan[i].rotate,
      rotateY: fan[i].rotateY,
      opacity: 1,
      transition: { type: "spring", stiffness: 80, damping: 13, delay: (HERO - i) * 0.04 },
    }),
  };
}

type Phase = "centered" | "stacked" | "fanned";

function Card({
  i,
  layout,
  phase,
  intro,
  startSettled,
  cardData,
}: {
  i: number;
  layout: Layout;
  phase: Phase;
  intro: Variants;
  startSettled: boolean;
  cardData: HeroCard;
}) {
  // Highly optimized image preloading (Next.js automatically injects <link rel="preload"> in the <head>)
  preload(cardData.image, { as: "image", fetchPriority: "high" });

  const { w, h } = layout.card;
  const halfX = w / 2;
  const href = cardData.id ? `/store/${slugify(cardData.title)}-${cardData.id}` : "/store";

  return (
    <div
      style={{
        zIndex: i,
        transformStyle: "preserve-3d",
        width: w,
        height: h,
        marginLeft: -halfX,
      }}
      className="absolute left-1/2 top-0"
    >
      <Link
        href={href}
        className="block h-full w-full cursor-pointer"
      >
        <motion.div
          custom={i}
          variants={intro}
          initial={startSettled ? "fanned" : "hidden"}
          animate={phase}
          style={{ background: `url(${cardData.image}) center/cover` }}
          role="img"
          aria-label={`${cardData.category}: ${cardData.title}`}
          className="absolute inset-0 rounded-2xl shadow-[0_20px_40px_-14px_rgba(0,0,0,0.35)] bg-card"
        >
          {i === HERO && (
            <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase text-white/80">
              {cardData.category}
            </span>
          )}
        </motion.div>
      </Link>
    </div>
  );
}

export function CardStack({ layout, cards }: { layout: Layout; cards?: HeroCard[] }) {
  const reduce = useReducedMotion();
  
  // Use dynamic cards or fallback to defaults
  const stackCards = useMemo(() => {
    if (cards && cards.length >= 7) return cards.slice(0, 7);
    if (cards && cards.length > 0) {
      return Array(7).fill(0).map((_, i) => cards[i % cards.length]);
    }
    return Array(7).fill(0).map((_, i) => ({
      id: undefined,
      category: DEFAULT_CARDS[i]?.category || "Product",
      title: DEFAULT_CARDS[i]?.title || "Title",
      image: "/affiliate-program-bg.png",
    }));
  }, [cards]);

  const [phase, setPhase] = useState<Phase>("centered");
  const settled = useRef(false);

  const intro = useMemo(() => makeIntro(layout.fan), [layout.key]);

  useEffect(() => {
    if (reduce) {
      settled.current = true;
      setPhase("fanned");
      return;
    }
    const a = setTimeout(() => setPhase("stacked"), T.stack * 1000);
    const b = setTimeout(() => setPhase("fanned"), T.fan * 1000);
    const c = setTimeout(() => {
      settled.current = true;
    }, (T.fan + 1.8) * 1000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(c);
    };
  }, [reduce]);

  return (
    <div
      className="absolute inset-x-0"
      style={{ top: layout.cardsTop, height: layout.card.h, perspective: 1200 }}
    >
      {layout.fan.map((_, i) => (
        <Card
          key={`${layout.key}-${i}`}
          i={i}
          layout={layout}
          phase={phase}
          intro={intro}
          startSettled={settled.current}
          cardData={stackCards[i]}
        />
      ))}
    </div>
  );
}
