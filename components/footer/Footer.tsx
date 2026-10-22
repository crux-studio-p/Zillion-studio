// components/footer/Footer.tsx
import Link from "next/link";
import { BRAND } from "@/lib/content";

const COLS = [
  {
    heading: "Store",
    links: [
      { label: "All products", href: "/store" },
      { label: "Scripts", href: "/scripts" },
      { label: "Templates", href: "/templates" },
      { label: "Bundles", href: "/store" },
    ],
  },
  {
    heading: "Follow",
    links: [
      { label: "X / Twitter", href: "#" },
      { label: "Discord", href: "#" },
      { label: "TikTok", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Affiliate program", href: "/affiliate-program" },
      { label: "Blog", href: "/blog" },
      { label: "Support", href: "/support" },
    ],
  },
];

const CTAS = [
  { label: "Browse the store", sub: "Find your next script", href: "/store" },
  { label: "Join Discord", sub: "Get help & updates", href: "#" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden bg-[#f2f2f0] dark:bg-[#121212] text-foreground border-t border-transparent dark:border-white/5 transition-colors">

      {/* ── top content row ─────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 sm:px-12 pt-16 sm:pt-20 sm:flex-row sm:gap-12 lg:gap-16 justify-between">

        {/* brand block */}
        <div className="flex shrink-0 flex-col gap-3.5 sm:w-72">
          <Link href="/" className="flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-tight text-foreground">
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path d="M3 4l10 3-4 5zM14 9l7-1-3 7zM9 14l4 6-7-1z" fill="#5cc8b8" />
            </svg>
            {BRAND}
          </Link>
          <p className="text-sm sm:text-[14.5px] leading-relaxed text-muted-foreground">
            Premium FiveM scripts and Tebex store templates, built for serious server owners.
          </p>
        </div>

        {/* nav columns */}
        <div className="flex flex-1 flex-wrap gap-x-12 sm:gap-x-16 gap-y-10 justify-start sm:justify-center">
          {COLS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4">
              <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm sm:text-[15px] text-muted-foreground transition-colors hover:text-foreground font-medium"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA block */}
        <div className="flex shrink-0 flex-col gap-6 sm:w-64">
          {CTAS.map((c) => (
            <Link key={c.label} href={c.href} className="group flex items-start gap-3.5">
              <span className="mt-0.5 grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110 shadow-xs">
                <svg viewBox="0 0 12 12" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path d="M2 10L10 2M10 2H4M10 2v6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>
                <span className="block text-sm sm:text-[16px] font-bold leading-snug text-foreground group-hover:underline">
                  {c.label}
                </span>
                <span className="block text-xs sm:text-[13px] text-muted-foreground mt-0.5">{c.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── big wordmark ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none mt-12 flex w-full select-none justify-center"
      >
        <p
          className="whitespace-nowrap font-black text-neutral-900/10 dark:text-white/5 translate-y-[10%]"
          style={{ 
            fontSize: "max(160px, 22vw)", 
            lineHeight: 0.75,
            letterSpacing: "0.08em",
          }}
        >
          Zillion
        </p>
      </div>

      {/* ── bottom bar ─────────────────────────────────────
      <div className="flex items-center justify-between border-t border-black/[0.07] px-6 py-4">
        <p className="text-[10px] text-neutral-400">
          {BRAND} ©{year} &nbsp;·&nbsp;{" "}
          <Link href="#" className="hover:text-neutral-700">Privacy policy</Link>
        </p>
        <p className="text-[10px] text-neutral-400">All rights reserved.</p>
      </div> */}
    </footer>
  );
}
