// components/community/TopCustomers.tsx
"use client";
import Image from "next/image";
import { useInView } from "motion/react";
import { useRef } from "react";
import { BlurWords } from "@/components/hero/BlurWords";
import {
  TOP_CUSTOMERS,
  TOP_CUSTOMERS_SECTION,
  type TopCustomer,
} from "@/lib/content";

const MEDAL = ["🥇", "🥈", "🥉"];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Row({
  c,
  rank,
}: {
  c: TopCustomer;
  rank: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-muted px-5 py-3.5">
      {/* rank */}
      <span className="w-6 shrink-0 text-center text-[13px] leading-none">
        {rank <= 3 ? MEDAL[rank - 1] : (
          <span className="text-[11px] font-medium text-neutral-400">
            {rank}
          </span>
        )}
      </span>

      {/* avatar */}
      {c.avatar ? (
        <Image
          src={c.avatar}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e0dfd5] text-[11px] font-medium text-neutral-700">
          {initials(c.username)}
        </span>
      )}

      {/* name */}
      <span className="flex-1 truncate text-[13px] font-medium text-foreground">
        {c.username}
      </span>

      {/* stats */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] text-muted-foreground">
          {c.purchases} {c.purchases === 1 ? "purchase" : "purchases"}
        </span>
        {c.spent && (
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">
            {c.spent}
          </span>
        )}
      </div>
    </div>
  );
}

export function TopCustomers({
  customers = TOP_CUSTOMERS,
}: {
  customers?: TopCustomer[];
}) {
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { once: true, margin: "0px 0px -80px 0px" });

  if (!customers.length) return null;

  // split into two columns
  const left = customers.slice(0, Math.ceil(customers.length / 2));
  const right = customers.slice(Math.ceil(customers.length / 2));

  return (
    <section
      ref={root}
      aria-label={TOP_CUSTOMERS_SECTION.eyebrow}
      className="w-full bg-transparent px-6 pb-[60px] pt-[50px] text-foreground"
    >
      {/* header */}
      <div className="mx-auto max-w-4xl">
        <div className="mb-[26px]">
          <p className="text-[11px] font-normal uppercase leading-[14px] tracking-[0.18em] text-muted-foreground">
            {TOP_CUSTOMERS_SECTION.eyebrow}
          </p>
          <h2 className="mt-[14px] text-[32px] font-normal leading-[38px] tracking-[-0.03em]">
            <BlurWords
              text={TOP_CUSTOMERS_SECTION.heading}
              play={inView}
              stagger={0.06}
            />
          </h2>
        </div>

        {/* two-column grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            {left.map((c, i) => (
              <Row key={i} c={c} rank={i + 1} />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {right.map((c, i) => (
              <Row key={i} c={c} rank={left.length + i + 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
