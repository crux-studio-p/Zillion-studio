// components/faq/Faq.tsx
"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BlurWords } from "@/components/hero/BlurWords";
import { FAQ_ITEMS, FAQ_SECTION, type FaqItem } from "@/lib/content";
import { EASE_OUT } from "@/lib/hero-timing";

function Item({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-black/[0.07] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-[15px] font-medium leading-[1.3] text-foreground">
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f0f0ec] text-muted-foreground"
        >
          <Plus size={12} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.35, ease: EASE_OUT } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[13px] leading-[1.6] text-muted-foreground">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq({ items = FAQ_ITEMS }: { items?: FaqItem[] }) {
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { once: true, margin: "0px 0px -80px 0px" });
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => setOpen((prev) => (prev === i ? null : i));

  // split into two columns
  const mid = Math.ceil(items.length / 2);
  const left = items.slice(0, mid);
  const right = items.slice(mid);

  return (
    <section
      ref={root}
      aria-label={FAQ_SECTION.eyebrow}
      className="w-full bg-transparent px-6 pb-[70px] pt-[50px] text-foreground"
    >
      <div className="mx-auto max-w-4xl">
        {/* header */}
        <div className="mb-[36px] flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-normal uppercase leading-[14px] tracking-[0.18em] text-muted-foreground">
              {FAQ_SECTION.eyebrow}
            </p>
            <h2 className="mt-[14px] text-[32px] font-normal leading-[38px] tracking-[-0.03em]">
              <BlurWords text={FAQ_SECTION.heading} play={inView} stagger={0.06} />
            </h2>
          </div>
          <Link
            href={FAQ_SECTION.cta.href}
            className="mt-4 sm:mt-0 inline-grid h-[30px] place-items-center rounded-full bg-primary px-4 text-[11px] font-medium text-primary-foreground shrink-0"
          >
            {FAQ_SECTION.cta.label}
          </Link>
        </div>

        {/* two-column accordion */}
        <div className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
          <div>
            {left.map((item, i) => (
              <Item
                key={i}
                item={item}
                open={open === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
          <div>
            {right.map((item, i) => (
              <Item
                key={i + mid}
                item={item}
                open={open === i + mid}
                onToggle={() => toggle(i + mid)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
