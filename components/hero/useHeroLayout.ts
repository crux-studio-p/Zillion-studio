// components/hero/useHeroLayout.ts
"use client";
import { useEffect, useState } from "react";
import { computeLayout, type Layout } from "@/lib/hero-layout";

function probe(height: string) {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `position:fixed;left:0;top:0;width:100vw;height:${height};visibility:hidden;pointer-events:none`;
  document.body.appendChild(el);
  return el;
}

export function useHeroLayout(): Layout | null {
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const small = probe("100svh");
    const large = probe("100lvh");

    const update = () => {
      const w = small.getBoundingClientRect().width || window.innerWidth;
      const hs = small.getBoundingClientRect().height || window.innerHeight;
      const hl = large.getBoundingClientRect().height || hs;
      const next = computeLayout(w, hs, hl);
      document.documentElement.style.setProperty("--k", String(next.k));
      setLayout((prev) => (prev && prev.key === next.key ? prev : next));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(small);
    ro.observe(large);
    return () => {
      ro.disconnect();
      small.remove();
      large.remove();
    };
  }, []);

  return layout;
}
