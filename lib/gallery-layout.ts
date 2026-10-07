// lib/gallery-layout.ts
export type Profile = "desktop" | "mobile";

export type Layout = {
  key: string;
  profile: Profile;
  k: number;
  W: number;
  H: number;
  arc: {
    cx: number;
    cy: number;
    r: number;
  };
  card: { w: number; h: number };
  text: {
    cx: number;
    top: number;
    w: number;
    headSize: number;
    headLH: number;
    subSize: number;
    subLH: number;
    subW: number;
    ctaSize: "sm" | "md";
  };
};

const REF_W = 1147;
const REF_H = 777;
const REF_R = 700;
const CARD_W = 218;
const CARD_H = 138;

function desktop(w: number, h: number): Layout {
  const k = Math.min(w / REF_W, h / REF_H);
  const W = w / k;
  const H = h / k;
  const offY = (H - REF_H) / 2;

  return {
    key: `desktop-${k.toFixed(3)}-${Math.round(W)}-${Math.round(H)}`,
    profile: "desktop",
    k,
    W,
    H,
    arc: {
      cx: W / 2,
      cy: 303 + REF_R + offY,
      r: REF_R,
    },
    card: { w: CARD_W, h: CARD_H },
    text: {
      cx: W / 2,
      top: 504 + offY,
      w: 600,
      headSize: 42,
      headLH: 48,
      subSize: 18,
      subLH: 26,
      subW: 500,
      ctaSize: "md",
    },
  };
}

function mobile(w: number, h: number): Layout {
  const k = w / 390;
  const W = w / k;
  const H = h / k;
  
  const m = 0.65; // scale cards and radius for mobile
  const r = REF_R * m;
  const card = { w: Math.round(CARD_W * m), h: Math.round(CARD_H * m) };
  
  // Center vertically, with a slight padding from the top
  const textH = 120; // approx height of text block
  const totalH = card.h + 40 + textH;
  const base = Math.max(80, (H - totalH) / 2);
  const arcTop = base;

  return {
    key: `mobile-${k.toFixed(3)}-${Math.round(W)}-${Math.round(H)}`,
    profile: "mobile",
    k,
    W,
    H,
    arc: {
      cx: W / 2,
      cy: arcTop + r,
      r,
    },
    card,
    text: {
      cx: W / 2,
      top: arcTop + card.h + 50, // below the cards
      w: Math.min(330, W - 40),
      headSize: 28, // larger font on mobile
      headLH: 32,
      subSize: 14,
      subLH: 20,
      subW: Math.min(300, W - 40),
      ctaSize: "md",
    },
  };
}

export function computeLayout(w: number, h: number): Layout {
  return (w / h < 1 || w < 768) ? mobile(w, h) : desktop(w, h);
}
