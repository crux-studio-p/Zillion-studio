// components/hero/Hero.tsx
"use client";
import { MotionConfig } from "motion/react";
import { HERO } from "@/lib/content";
import { Canvas } from "./Canvas";
import { CardStack } from "./CardStack";
import { HeroCopy } from "./HeroCopy";
import { Nav } from "./Nav";
import { useHeroLayout } from "./useHeroLayout";

export default function Hero({ cards }: { cards?: { category: string; title: string; image: string }[] }) {
  const layout = useHeroLayout();

  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      {/* real heading for crawlers and screen readers; the animated copy is aria-hidden */}
      <h1 className="sr-only">{HERO.headline.join(" ")}</h1>
      <section
        className="relative text-foreground overflow-hidden"
        style={{ height: "100lvh" }}
      >
        <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]">
          {layout && (
            <Canvas layout={layout}>
              <CardStack layout={layout} cards={cards} />
            </Canvas>
          )}
        </div>
        {layout && (
          <div className="pointer-events-none absolute inset-0 z-30">
            <Canvas layout={layout}>
              <HeroCopy layout={layout} />
            </Canvas>
          </div>
        )}
      </section>
    </MotionConfig>
  );
}

