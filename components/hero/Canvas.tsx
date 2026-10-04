// components/hero/Canvas.tsx
import type { ReactNode } from "react";
import type { Layout } from "@/lib/hero-layout";

// A W × HL design-px box scaled by k, so it covers the pinned stage exactly.
export function Canvas({
  layout,
  children,
  className = "",
}: {
  layout: Layout;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute left-0 top-0 origin-top-left ${className}`}
      style={{ width: layout.W, height: layout.HL, transform: `scale(${layout.k})` }}
    >
      {children}
    </div>
  );
}
