// components/hero/Cta.tsx
"use client";
import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/hero-timing";

type Props = {
  primary: string;
  secondary?: string;
  delay?: number;
  play?: boolean;
  className?: string;
};

export function Cta({ primary, secondary, delay = 0, play = true, className = "" }: Props) {
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
      <a href="#" className="grid h-[27px] place-items-center rounded-full bg-primary px-5 text-[11px] font-medium text-primary-foreground">
        {primary}
      </a>
      {secondary && (
        <a href="#" className="grid h-[27px] place-items-center rounded-full bg-black/[0.04] px-4 text-[11px] text-neutral-700">
          {secondary}
        </a>
      )}
    </motion.div>
  );
}
