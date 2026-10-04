// components/hero/HeroCopy.tsx
"use client";
import { T } from "@/lib/hero-timing";
import { HERO } from "@/lib/content";
import type { Layout } from "@/lib/hero-layout";
import { BlurWords } from "./BlurWords";
import { Cta } from "./Cta";
import { MentionTag } from "./MentionTag";

export function HeroCopy({ layout }: { layout: Layout }) {
  const h = layout.hero;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30" style={{ height: layout.HL }}>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 text-center font-medium tracking-[-0.045em]"
        style={{ top: h.headTop, fontSize: h.headSize, lineHeight: h.headLH }}
      >
        <span className="block">
          <BlurWords text={HERO.headline[0]} delay={T.headline} />
        </span>
        <span className="block">
          <BlurWords text={HERO.headline[1]} delay={T.headline + 0.45} />
        </span>
      </div>

      <MentionTag label={HERO.tags[0]} delay={T.tag} rotate={-3} className="bg-[#2f5fe0]" style={h.tag1} />
      <MentionTag label={HERO.tags[1]} delay={T.tag2} rotate={8} tail="left" className="bg-[#74b494]" style={h.tag2} />

      <div
        className="absolute inset-x-0 mx-auto text-center text-neutral-700"
        style={{
          top: h.subTop,
          fontSize: h.subSize,
          lineHeight: h.subLH ?? undefined,
          width: h.subW ?? undefined,
        }}
      >
        <BlurWords text={HERO.subtitle} delay={T.subtitle} stagger={0.04} />
      </div>

      <div className="absolute inset-x-0" style={{ top: h.ctaTop }}>
        <Cta
          primary={HERO.primary}
          secondary={HERO.secondary}
          delay={T.cta}
          size={h.ctaSize}
          className="pointer-events-auto justify-center"
        />
      </div>
    </div>
  );
}
