// components/gallery/useGalleryLayout.ts
"use client";
import { useEffect, useState, type RefObject } from "react";
import { computeLayout, type Layout } from "@/lib/gallery-layout";

export function useGalleryLayout(root: RefObject<HTMLElement | null>): Layout | null {
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    
    let lastW = 0, lastH = 0;
    const update = (w: number, h: number) => {
      if (w === 0 || h === 0) return;
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return;
      lastW = w; lastH = h;
      const next = computeLayout(w, h);
      setLayout(prev => prev && prev.key === next.key ? prev : next);
    };
    
    const ro = new ResizeObserver(([e]) => {
      update(e.contentRect.width, e.contentRect.height);
    });
    
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    update(rect.width, rect.height);
    
    return () => ro.disconnect();
  }, [root]);

  return layout;
}
