// lib/content.ts
export const BRAND = "Zillion Studios";

export type NavLink = { label: string; href: string; icon?: "chat" };

// Routes are placeholders: point them at real pages.
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/store" },
  { label: "Bundle", href: "/store" },
  { label: "Subscription", href: "/subscription" },
  { label: "Free", href: "/store" },
  { label: "Gift card", href: "/giftcard" },
  { label: "Affiliate program", href: "/affiliate-program" },
  { label: "Blog", href: "/blog" }
];

export const HERO = {
  headline: ["Scripts and templates", "for your FiveM server."],
  subtitle:
    "Ready-to-install FiveM scripts and Tebex store templates, with documentation and updates included.",
  primary: "Browse the store",
  secondary: "Join Discord",
  tags: ["@owner", "@developer"],
};

export type HeadlineLine = { text: string; accent?: string[] };

export const SCENE_TWO = {
  eyebrow: "Marketplace",
  headline: [
    { text: "Build, Launch," },
    { text: "& grow your", accent: ["&", "grow", "your"] },
    { text: "FiveM server." },
  ] as HeadlineLine[],
  subtitle:
    "Production-ready FiveM scripts, Tebex store templates and server resources. Pay through Tebex, get updates, and get help in our Discord.",
  primary: "Browse the store",
  secondary: "Become an affiliate",
  tags: ["@designer", "@streamer"],
};

// Card slots. Replace title/image with real product covers (1:1, 800×800).
// Order = back to front in the stack; the last one is the hero card.
export const CARDS: { category: string; title: string }[] = [
  { category: "Script", title: "Product name" },
  { category: "Script", title: "Product name" },
  { category: "Tebex template", title: "Product name" },
  { category: "Script", title: "Product name" },
  { category: "Bundle", title: "Product name" },
  { category: "UI / HUD", title: "Product name" },
  { category: "Featured script", title: "Product name" },
];

export const META = {
  title: "Zillion Studios: FiveM Scripts & Tebex Templates",
  description:
    "Buy premium FiveM scripts, Tebex store templates and server resources. Secure checkout through Tebex, with updates and support in Discord.",
};

export const FOOTER =
  "Zillion Studios. All trademarks belong to Zillion.";

export type Product = {
  title: string;
  category: string;
  href: string;
  image?: string; // landscape, 16:9, e.g. /products/inventory.webp (1920x1080)
  fallback: string; // CSS background used until an image exists
  price?: string; // e.g. "£14.99"
};

export const GALLERY = {
  heading: "Browse the latest drops.",
  subtitle: "New FiveM scripts, Tebex templates and bundles, ready to drop into your server.",
  cta: { label: "Shop all products", href: "/store" },
};

// Hrefs are placeholders: point them at real product pages.
export const PRODUCTS: Product[] = [
  { category: "Script", title: "Product name", href: "/store/example", fallback: "linear-gradient(160deg,#8aa6c1,#2b3a55)", price: "£14.99" },
  { category: "Tebex template", title: "Product name", href: "/store/example", fallback: "linear-gradient(160deg,#e8c9a0,#b0603a)", price: "£29.99" },
  { category: "Script", title: "Product name", href: "/store/example", fallback: "linear-gradient(160deg,#9ec5a1,#2f5d3a)", price: "£9.99" },
  { category: "Bundle", title: "Product name", href: "/store/example", fallback: "linear-gradient(160deg,#c9b8e8,#4b3a7a)", price: "£49.99" },
  { category: "UI / HUD", title: "Product name", href: "/store/example", fallback: "linear-gradient(160deg,#f2d27a,#b5791c)", price: "£19.99" },
  { category: "Script", title: "Product name", href: "/store/example", fallback: "linear-gradient(160deg,#f0a9a0,#8a2d2d)", price: "£12.99" },
  { category: "Tebex template", title: "Product name", href: "/store/example", fallback: "linear-gradient(160deg,#a9d6e8,#1c5a7a)", price: "£24.99" },
];

export type Review = {
  name: string;
  meta: string; // e.g. role or server name
  text: string;
  avatar?: string; // optional image URL; initials are used otherwise
};

export const REVIEWS_SECTION = {
  eyebrow: "Reviews",
  heading: "What server owners say",
};

// PLACEHOLDERS: replace with real, approved reviews before launch.
export const REVIEWS: Review[] = [
  { name: "Customer name", meta: "Role / server name", text: "Placeholder review 1. Replace this with a real, approved customer review before launch. Keep it to about three lines." },
  { name: "Customer name", meta: "Role / server name", text: "Placeholder review 2. Replace this with a real, approved customer review before launch. Keep it to about three lines." },
  { name: "Customer name", meta: "Role / server name", text: "Placeholder review 3. Replace this with a real, approved customer review before launch. Keep it to about three lines." },
  { name: "Customer name", meta: "Role / server name", text: "Placeholder review 4. Replace this with a real, approved customer review before launch. Keep it to about three lines." },
  { name: "Customer name", meta: "Role / server name", text: "Placeholder review 5. Replace this with a real, approved customer review before launch. Keep it to about three lines." },
  { name: "Customer name", meta: "Role / server name", text: "Placeholder review 6. Replace this with a real, approved customer review before launch. Keep it to about three lines." },
];

// ---------------------------------------------------------------------------
// Top Customers
// ---------------------------------------------------------------------------
export type TopCustomer = {
  username: string;       // display name
  avatar?: string;        // optional image URL; initials used otherwise
  purchases: number;      // total items purchased (placeholder)
  spent?: string;         // formatted spend, e.g. "£420" (optional — hide if not wanted)
};

export const TOP_CUSTOMERS_SECTION = {
  eyebrow: "Community",
  heading: "Top customers this month.",
};

// PLACEHOLDERS: replace with live data from your database/Tebex before launch.
export const TOP_CUSTOMERS: TopCustomer[] = [
  { username: "Customer", purchases: 12, spent: "£360" },
  { username: "Customer", purchases: 10, spent: "£300" },
  { username: "Customer", purchases: 9, spent: "£270" },
  { username: "Customer", purchases: 8, spent: "£240" },
  { username: "Customer", purchases: 7, spent: "£210" },
  { username: "Customer", purchases: 6, spent: "£180" },
  { username: "Customer", purchases: 5, spent: "£150" },
  { username: "Customer", purchases: 4, spent: "£120" },
];

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
export type FaqItem = { q: string; a: string };

export const FAQ_SECTION = {
  eyebrow: "FAQ",
  heading: "Common questions.",
  cta: { label: "Still have questions? Join Discord", href: "#" },
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "What do I get after purchasing?",
    a: "You receive an immediate download link via Tebex. All scripts include documentation and access to our Discord support channel.",
  },
  {
    q: "Do the scripts work on ESX and QBCore?",
    a: "Each product page states which frameworks are supported. Most of our scripts ship with both ESX and QBCore configs out of the box.",
  },
  {
    q: "How do updates work?",
    a: "Updates are free for the lifetime of the product. You'll get a notification in Discord and a new download link in your Tebex account.",
  },
  {
    q: "Can I use these on a resell server?",
    a: "No. Licences are per-server, non-transferable, and may not be resold or redistributed. See the full terms on each product page.",
  },
  {
    q: "Do you offer refunds?",
    a: "Refunds are handled through Tebex's buyer-protection policy. Contact support within 14 days if you encounter an issue we can't resolve.",
  },
  {
    q: "How do I become an affiliate?",
    a: "Fill in the affiliate application form, wait for admin approval, and you'll receive a personalised coupon code and a 15% commission on each sale.",
  },
];
