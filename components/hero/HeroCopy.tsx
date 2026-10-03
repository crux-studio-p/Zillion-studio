// components/hero/HeroCopy.tsx
"use client";
import { T } from "@/lib/hero-timing";
import { BlurWords } from "./BlurWords";
import { Cta } from "./Cta";
import { MentionTag } from "./MentionTag";

import { HERO } from "@/lib/content";

export function HeroCopy() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[560px]">
      <h1 className="absolute inset-x-0 top-[105px] text-center text-[50px] font-medium leading-[1.08] tracking-[-0.045em]">
        <span className="block">
          <BlurWords text={HERO.headline[0]} delay={T.headline} />
        </span>
        <span className="block">
          <BlurWords text={HERO.headline[1]} delay={T.headline + 0.45} />
        </span>
      </h1>

      <MentionTag
        label={HERO.tags[0]}
        delay={T.tag}
        rotate={-3}
        className="left-1/2 top-[199px] -ml-[218px] bg-[#2f5fe0]"
      />
      <MentionTag
        label={HERO.tags[1]}
        delay={T.tag2}
        rotate={8}
        tail="left"
        className="left-1/2 top-[213px] ml-[249px] bg-[#74b494]"
      />

      <BlurWords
        text={HERO.subtitle}
        delay={T.subtitle}
        stagger={0.04}
        className="absolute inset-x-0 top-[422px] text-center text-[10px] text-neutral-700"
      />

      <Cta
        primary={HERO.primary}
        secondary={HERO.secondary}
        delay={T.cta}
        className="pointer-events-auto absolute inset-x-0 top-[472px] justify-center"
      />
    </div>
  );
}
