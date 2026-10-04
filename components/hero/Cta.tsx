// components/hero/Cta.tsx
"use client";
import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/hero-timing";

type Props = {
  primary: string;
  secondary?: string;
  delay?: number;
  play?: boolean;
  size?: "sm" | "md";
  className?: string;
};

const SIZE = {
  sm: "h-[27px] px-5 text-[11px]",
  md: "h-[40px] px-6 text-[13px]",
};

export function Cta({ primary, secondary, delay = 0, play = true, size = "sm", className = "" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
      animate={
        play
          ? { opacity: 1, filter: "blur(0px)", y: 0, transition: { delay, duration: 0.7, ease: EASE_OUT } }
          : { opacity: 0, filter: "blur(10px)", y: 10, transition: { duration: 0.25 } }
      }
      className={`flex items-center gap-3 ${className}`}
    >
      <a
        href="#"
        className={`grid place-items-center rounded-full bg-primary font-medium text-primary-foreground ${SIZE[size]}`}
      >
        {primary}
      </a>
      {secondary && (
        <a
          href="#"
          className={`grid place-items-center rounded-full bg-black/[0.04] text-neutral-700 ${SIZE[size]}`}
        >
          {secondary}
        </a>
      )}
    </motion.div>
  );
}
