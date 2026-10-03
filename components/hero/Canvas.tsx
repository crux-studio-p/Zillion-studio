// components/hero/Canvas.tsx
import type { ReactNode } from "react";

// A box that is (100vw/k) × (100vh/k) design-px, scaled by k, so it covers the viewport exactly.
export function Canvas({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`absolute left-0 top-0 origin-top-left ${className}`}
      style={{
        width: "calc(100vw / var(--k))",
        height: "calc(100vh / var(--k))",
        transform: "scale(var(--k))",
      }}
    >
      {children}
    </div>
  );
}
