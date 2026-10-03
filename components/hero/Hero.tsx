// components/hero/Hero.tsx
"use client";
import { useRef, useState } from "react";
import { MotionConfig, useMotionValueEvent, useScroll } from "motion/react";
import { CardStack } from "./CardStack";
import { HeroCopy } from "./HeroCopy";
import { Nav } from "./Nav";
import { SceneTwo } from "./SceneTwo";
import { Canvas } from "./Canvas";
import { useDesignScale } from "./useDesignScale";

// Swap for: backgroundImage: "url(/silk.jpg)", backgroundSize: "cover"
const SILK = `
  radial-gradient(1200px 600px at 20% 10%, #eaeae5 0%, transparent 60%),
  radial-gradient(900px 500px at 80% 30%, #ebebeb 0%, transparent 60%),
  linear-gradient(120deg, #e2e2dd, #e6e6e1 40%, #dcdcd7 70%, #eaeae5)
`;

export default function Hero() {
  useDesignScale();
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
      <div
        ref={track}
        className="relative text-foreground"
        style={{ height: "calc(100vh + 1100px)" }}
      >
        <div className="sticky top-0 h-screen overflow-hidden" style={{ background: SILK }}>
          <Canvas>
            <CardStack progress={scrollYProgress} />
            <SceneTwo
              show={sceneTwo}
              tags={tags}
              onUp={() => go(0)}
              onDown={() => go((track.current?.offsetHeight ?? 0) - window.innerHeight)}
            />
          </Canvas>
        </div>
        <div className="pointer-events-none absolute inset-0 z-30">
          <Canvas>
            <HeroCopy />
          </Canvas>
        </div>
      </div>
    </MotionConfig>
  );
}
