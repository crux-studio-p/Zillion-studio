// components/hero/SceneTwo.tsx
"use client";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EASE_OUT } from "@/lib/hero-timing";
import { SCENE_TWO } from "@/lib/content";
import type { Layout } from "@/lib/hero-layout";
import { BlurWords } from "./BlurWords";
import { Cta } from "./Cta";
import { MentionTag } from "./MentionTag";

type Props = { layout: Layout; show: boolean; tags: boolean; onUp: () => void; onDown: () => void };

export function SceneTwo({ layout, show, tags, onUp, onDown }: Props) {
  const t = layout.two;
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <motion.p
        initial={{ opacity: 0, filter: "blur(6px)", y: 40 }}
        animate={
          show
            ? { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.7, ease: EASE_OUT } }
            : { opacity: 0, filter: "blur(6px)", y: 40, transition: { duration: 0.25 } }
        }
        className="absolute font-semibold uppercase tracking-[0.22em]"
        style={{ left: t.left, top: t.eyebrowTop, fontSize: t.eyebrowSize }}
      >
        {SCENE_TWO.eyebrow}
      </motion.p>

      <h2
        className="absolute font-medium tracking-[-0.04em]"
        style={{ left: t.left, top: t.headTop, width: t.headW, fontSize: t.headSize, lineHeight: t.headLH }}
      >
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

      <div
        className="absolute text-neutral-800"
        style={{ left: t.left, top: t.subTop, width: t.subW, fontSize: t.subSize, lineHeight: t.subLH }}
      >
        <BlurWords text={SCENE_TWO.subtitle} play={show} delay={1.3} stagger={0.04} />
      </div>

      <div className="absolute" style={{ left: t.left, top: t.ctaTop }}>
        <Cta
          primary={SCENE_TWO.primary}
          secondary={SCENE_TWO.secondary}
          play={show}
          delay={2.4}
          size={t.ctaSize}
          className="pointer-events-auto"
        />
      </div>

      {tags && (
        <div>
          <MentionTag label={SCENE_TWO.tags[0]} delay={0} rotate={-5} className="bg-[#8c2723]" style={t.tags[0]} />
          <MentionTag label={SCENE_TWO.tags[1]} delay={0.15} rotate={-4} className="bg-[#141414]" style={t.tags[1]} />
        </div>
      )}

      {t.pager && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.4, delay: show ? 1.2 : 0 }}
          style={{ pointerEvents: show ? "auto" : "none", right: t.pager.right, top: t.pager.top }}
          className="absolute flex flex-col gap-[5px]"
        >
          <button type="button" aria-label="Previous section" onClick={onUp} className="grid h-6 w-6 place-items-center rounded-full bg-card text-foreground shadow-sm">
            <ChevronUp size={12} />
          </button>
          <button type="button" aria-label="Next section" onClick={onDown} className="grid h-6 w-6 place-items-center rounded-full bg-card text-foreground shadow-sm">
            <ChevronDown size={12} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
