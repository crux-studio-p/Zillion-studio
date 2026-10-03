// components/hero/BlurWords.tsx
"use client";
import { motion, type Variants } from "motion/react";
import { EASE_OUT } from "@/lib/hero-timing";

const word: Variants = {
  hidden: (rise: number) => ({
    opacity: 0,
    filter: "blur(12px)",
    y: rise,
    transition: { duration: 0.25 },
  }),
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

type Props = {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  play?: boolean; // false → reverses to hidden (used for scroll-back)
  rise?: number; // starting y offset in px
  accent?: string[]; // words (punctuation ignored) drawn in the accent colour
};

export function BlurWords({
  text,
  delay = 0,
  stagger = 0.07,
  className,
  play = true,
  rise = 8,
  accent,
}: Props) {
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        animate={play ? "show" : "hidden"}
        variants={{
          hidden: {},
          show: { transition: { delayChildren: delay, staggerChildren: stagger } },
        }}
      >
        {words.map((w, i) => (
          <motion.span
            key={i}
            custom={rise}
            variants={word}
            className={`inline-block whitespace-pre will-change-[filter,transform] ${
              accent?.includes(w.replace(/[,.]$/, "")) ? "text-[#9d2520]" : ""
            }`}
          >
            {i < words.length - 1 ? `${w} ` : w}
          </motion.span>
        ))}
      </motion.span>
    </span>
  );
}
