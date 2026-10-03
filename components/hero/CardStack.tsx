// components/hero/CardStack.tsx
"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue, type Variants } from "motion/react";
import { EASE_OUT, T } from "@/lib/hero-timing";
import { CARD, FAN, HERO, STAGES, STOPS } from "@/lib/card-poses";
import { CARDS } from "@/lib/content";

const BACKGROUNDS = Array(7).fill("url(/affiliate-program-bg.png) center/cover");

const intro: Variants = {
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
    x: FAN[i].x,
    y: FAN[i].y,
    rotate: FAN[i].rotate,
    rotateY: FAN[i].rotateY,
    opacity: 1,
    transition: { type: "spring", stiffness: 80, damping: 13, delay: (HERO - i) * 0.04 },
  }),
};

// Scroll deltas relative to the fan, precomputed once.
const DELTA = FAN.map((fan, i) => ({
  x: STAGES.map((s) => s[i].x - fan.x),
  y: STAGES.map((s) => s[i].y - fan.y),
  rotate: STAGES.map((s) => s[i].rotate - fan.rotate),
  rotateY: STAGES.map((s) => s[i].rotateY - fan.rotateY),
  scale: STAGES.map((s) => s[i].scale),
}));

type Phase = "centered" | "stacked" | "fanned";

function Card({ i, phase, progress }: { i: number; phase: Phase; progress: MotionValue<number> }) {
  const d = DELTA[i];
  const x = useTransform(progress, STOPS, d.x);
  const y = useTransform(progress, STOPS, d.y);
  const rotate = useTransform(progress, STOPS, d.rotate);
  const rotateY = useTransform(progress, STOPS, d.rotateY);
  const scale = useTransform(progress, STOPS, d.scale);
  
  const width = CARD * 1.7;
  const height = CARD * 1.1;
  const halfX = width / 2;
  const halfY = height / 2;

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        rotateY,
        scale,
        zIndex: i,
        transformOrigin: `${halfX + FAN[i].x}px ${halfY + FAN[i].y}px`,
        transformStyle: "preserve-3d",
        width,
        height,
        marginLeft: -halfX,
      }}
      className="absolute left-1/2 top-0"
    >
      <motion.div
        custom={i}
        variants={intro}
        initial="hidden"
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

export function CardStack({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("centered");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (reduce) {
      setPhase("fanned");
      return;
    }
    const a = setTimeout(() => setPhase("stacked"), T.stack * 1000);
    const b = setTimeout(() => setPhase("fanned"), T.fan * 1000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [reduce]);

  if (!mounted) return null;

  return (
    <div
      className="absolute inset-x-0 top-[260px] origin-top"
      style={{ perspective: 1200, height: CARD }}
    >
      {FAN.map((_, i) => (
        <Card key={i} i={i} phase={phase} progress={progress} />
      ))}
    </div>
  );
}
