// components/hero/Hero.tsx
"use client";
import { useRef, useState } from "react";
import { MotionConfig, useMotionValueEvent, useScroll } from "motion/react";
import { HERO } from "@/lib/content";
import { Canvas } from "./Canvas";
import { CardStack } from "./CardStack";
import { HeroCopy } from "./HeroCopy";
import { Nav } from "./Nav";
import { SceneTwo } from "./SceneTwo";
import { useHeroLayout } from "./useHeroLayout";



export default function Hero() {
  const layout = useHeroLayout();
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const [sceneTwo, setSceneTwo] = useState(false);
  const [tags, setTags] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setSceneTwo(v >= 0.4);
    setTags(v >= 0.93);
  });

  const go = (top: number) => window.scrollTo({ top, behavior: "smooth" });

  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      {/* real heading for crawlers and screen readers; the animated copy is aria-hidden */}
      <h1 className="sr-only">{HERO.headline.join(" ")}</h1>
      <div
        ref={track}
        className="relative text-foreground"
        style={{ height: "calc(100lvh + 1100px * var(--k, 1))" }}
      >
        <div className="sticky top-0 overflow-hidden" style={{ height: "100lvh" }}>
          {layout && (
            <Canvas layout={layout}>
              <CardStack layout={layout} progress={scrollYProgress} />
              <SceneTwo
                layout={layout}
                show={sceneTwo}
                tags={tags}
                onUp={() => go(0)}
                onDown={() => go((track.current?.offsetHeight ?? 0) - window.innerHeight)}
              />
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
      </div>
    </MotionConfig>
  );
}
