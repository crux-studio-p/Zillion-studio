// components/hero/SceneTwo.tsx
"use client";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EASE_OUT } from "@/lib/hero-timing";
import { BlurWords } from "./BlurWords";
import { Cta } from "./Cta";
import { MentionTag } from "./MentionTag";

import { SCENE_TWO } from "@/lib/content";

type Props = { show: boolean; tags: boolean; onUp: () => void; onDown: () => void };

export function SceneTwo({ show, tags, onUp, onDown }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <motion.p
        initial={{ opacity: 0, filter: "blur(6px)", y: 40 }}
        animate={
          show
            ? { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.7, ease: EASE_OUT } }
            : { opacity: 0, filter: "blur(6px)", y: 40, transition: { duration: 0.25 } }
        }
        className="absolute left-16 top-[60px] text-[9px] font-semibold uppercase tracking-[0.22em]"
      >
        {SCENE_TWO.eyebrow}
      </motion.p>

      <h2 className="absolute left-16 top-[83px] w-[330px] text-[46px] font-medium leading-[1.09] tracking-[-0.04em]">
        {SCENE_TWO.headline.map((line, i) => {
          const wordsBefore = SCENE_TWO.headline
            .slice(0, i)
            .reduce((n, l) => n + l.text.split(" ").length, 0);
          return (
            <span key={i} className="block">
              <BlurWords
                text={line.text}
                play={show}
                delay={0.25 + wordsBefore * 0.12}
                stagger={0.12}
                rise={48}
                accent={line.accent}
              />
            </span>
          );
        })}
      </h2>

      <BlurWords
        text={SCENE_TWO.subtitle}
        play={show}
        delay={1.3}
        stagger={0.04}
        className="absolute left-16 top-[261px] w-[172px] text-[10px] leading-[1.45] text-neutral-800"
      />

      <Cta
        primary={SCENE_TWO.primary}
        secondary={SCENE_TWO.secondary}
        play={show}
        delay={2.4}
        className="pointer-events-auto absolute left-16 top-[356px] origin-left"
      />

      {tags && (
        <div>
          <MentionTag label={SCENE_TWO.tags[0]} delay={0} rotate={-5} className="left-1/2 top-[242px] -ml-[20px] bg-[#8c2723]" />
          <MentionTag label={SCENE_TWO.tags[1]} delay={0.15} rotate={-4} className="left-1/2 top-[322px] ml-[225px] bg-[#141414]" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.4, delay: show ? 1.2 : 0 }}
        style={{ pointerEvents: show ? "auto" : "none" }}
        className="absolute right-[44px] top-[285px] flex flex-col gap-[5px]"
      >
        <button type="button" aria-label="Previous section" onClick={onUp} className="grid h-6 w-6 place-items-center rounded-full bg-card text-foreground shadow-sm">
          <ChevronUp size={12} />
        </button>
        <button type="button" aria-label="Next section" onClick={onDown} className="grid h-6 w-6 place-items-center rounded-full bg-card text-foreground shadow-sm">
          <ChevronDown size={12} />
        </button>
      </motion.div>
    </div>
  );
}
