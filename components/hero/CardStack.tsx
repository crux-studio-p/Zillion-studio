// components/hero/CardStack.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue, type Variants } from "motion/react";
import { EASE_OUT, T } from "@/lib/hero-timing";
import { HERO, STOPS, type Pose } from "@/lib/card-poses";
import { CARDS } from "@/lib/content";
import type { Layout } from "@/lib/hero-layout";

const BACKGROUNDS = Array(7).fill("url(/affiliate-program-bg.png) center/cover");

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
type Delta = { x: number[]; y: number[]; rotate: number[]; rotateY: number[]; scale: number[] };

function Card({
  i,
  layout,
  phase,
  progress,
  delta,
  intro,
  startSettled,
}: {
  i: number;
  layout: Layout;
  phase: Phase;
  progress: MotionValue<number>;
  delta: Delta;
  intro: Variants;
  startSettled: boolean;
}) {
  const x = useTransform(progress, STOPS, delta.x);
  const y = useTransform(progress, STOPS, delta.y);
  const rotate = useTransform(progress, STOPS, delta.rotate);
  const rotateY = useTransform(progress, STOPS, delta.rotateY);
  const scale = useTransform(progress, STOPS, delta.scale);

  const { w, h } = layout.card;
  const halfX = w / 2;
  const halfY = h / 2;

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        rotateY,
        scale,
        zIndex: i,
        transformOrigin: `${halfX + layout.fan[i].x}px ${halfY + layout.fan[i].y}px`,
        transformStyle: "preserve-3d",
        width: w,
        height: h,
        marginLeft: -halfX,
      }}
      className="absolute left-1/2 top-0"
    >
      <motion.div
        custom={i}
        variants={intro}
        initial={startSettled ? "fanned" : "hidden"}
        animate={phase}
        style={{ background: BACKGROUNDS[i] }}
        role="img"
        aria-label={`${CARDS[i].category}: ${CARDS[i].title}`}
        className="absolute inset-0 rounded-2xl shadow-[0_20px_40px_-14px_rgba(0,0,0,0.35)]"
      >
        {i === HERO && (
          <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase text-white/80">
            {CARDS[i].category}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

export function CardStack({ layout, progress }: { layout: Layout; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("centered");
  const settled = useRef(false);

  /* eslint-disable react-hooks/exhaustive-deps */
  const intro = useMemo(() => makeIntro(layout.fan), [layout.key]);
  const deltas = useMemo<Delta[]>(
    () =>
      layout.fan.map((fan, i) => ({
        x: layout.stages.map((s) => s[i].x - fan.x),
        y: layout.stages.map((s) => s[i].y - fan.y),
        rotate: layout.stages.map((s) => s[i].rotate - fan.rotate),
        rotateY: layout.stages.map((s) => s[i].rotateY - fan.rotateY),
        scale: layout.stages.map((s) => s[i].scale),
      })),
    [layout.key],
  );
  /* eslint-enable react-hooks/exhaustive-deps */

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
          progress={progress}
          delta={deltas[i]}
          intro={intro}
          startSettled={settled.current}
        />
      ))}
    </div>
  );
}
