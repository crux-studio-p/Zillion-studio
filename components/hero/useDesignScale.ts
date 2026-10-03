// components/hero/useDesignScale.ts
"use client";
import { useEffect } from "react";

export const DESIGN_W = 920;
export const DESIGN_H = 550;

// Sets --k = min(width/920, height/550) on <html>. Fit-contain: nothing is ever cropped vertically.
export function useDesignScale() {
  useEffect(() => {
    const set = () => {
      const k = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
      document.documentElement.style.setProperty("--k", String(k));
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
}
