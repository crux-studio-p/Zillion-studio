// components/hero/MentionTag.tsx
"use client";
import type { CSSProperties } from "react";
import { motion } from "motion/react";

type Props = {
  label: string;
  delay: number;
  rotate?: number;
  tail?: "center" | "left";
  className?: string; // background colour
  style?: CSSProperties; // position (from the layout)
};

export function MentionTag({ label, delay, rotate = 0, tail = "center", className = "", style }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 8, rotate }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 16 }}
      style={{ transformOrigin: "bottom left", ...style }}
      className={`absolute rounded-xl px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-md ${className}`}
    >
      {label}
      <span
        aria-hidden="true"
        className={`absolute -bottom-1 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-inherit ${
          tail === "left" ? "left-3" : "left-1/2 -ml-1"
        }`}
      />
    </motion.div>
  );
}
