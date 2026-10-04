// lib/hero-layout.ts
import { CARD, FAN, STAGES, type Pose } from "@/lib/card-poses";

export type Profile = "desktop" | "mobile";

// Position bits for a floating element, in design px.
export type Place = { top: number; left?: number | string; right?: number; marginLeft?: number };

export type Layout = {
  key: string;
  profile: Profile;
  k: number; // design px → real px
  W: number; // design width
  H: number; // design height of the SMALL viewport (what's always visible)
  HL: number; // design height of the LARGE viewport (the pinned stage)
  card: { w: number; h: number };
  fan: Pose[];
  stages: Pose[][];
  cardsTop: number;
  hero: {
    headTop: number;
    headSize: number;
    headLH: number;
    subTop: number;
    subSize: number;
    subLH: number | null;
    subW: number | null;
    ctaTop: number;
    ctaSize: "sm" | "md";
    tag1: Place;
    tag2: Place;
  };
  two: {
    left: number;
    eyebrowTop: number;
    eyebrowSize: number;
    headTop: number;
    headSize: number;
    headLH: number;
    headW: number;
    subTop: number;
    subSize: number;
    subLH: number;
    subW: number;
    ctaTop: number;
    ctaSize: "sm" | "md";
    tags: [Place, Place];
    pager: { right: number; top: number } | null;
  };
};

const keyOf = (p: Profile, k: number, W: number, H: number, HL: number) =>
  `${p}-${k.toFixed(3)}-${Math.round(W)}-${Math.round(H)}-${Math.round(HL)}`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const scalePose = (p: Pose, m: number): Pose => ({ ...p, x: p.x * m, y: p.y * m });
const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  rotate: lerp(a.rotate, b.rotate, t),
  rotateY: lerp(a.rotateY, b.rotateY, t),
  scale: lerp(a.scale, b.scale, t),
});

// A uniform diagonal cascade, centred on card 3.
const cascade = (cx: number, cy: number, dx: number, dy: number, s: number): Pose[] =>
  FAN.map((_, i) => ({ x: cx + (i - 3) * dx, y: cy + (i - 3) * dy, rotate: 0, rotateY: 0, scale: s }));

function desktop(w: number, hs: number, hl: number): Layout {
  const k = Math.min(w / 920, hs / 550);
  const W = w / k;
  const H = hs / k;
  const HL = hl / k;
  return {
    key: keyOf("desktop", k, W, H, HL),
    profile: "desktop",
    k,
    W,
    H,
    HL,
    card: { w: CARD * 1.7, h: CARD * 1.1 },
    fan: FAN,
    stages: STAGES,
    cardsTop: 260,
    hero: {
      headTop: 105,
      headSize: 50,
      headLH: 1.08,
      subTop: 422,
      subSize: 10,
      subLH: null,
      subW: null,
      ctaTop: 472,
      ctaSize: "sm",
      tag1: { left: "50%", marginLeft: -218, top: 199 },
      tag2: { left: "50%", marginLeft: 249, top: 213 },
    },
    two: {
      left: 64,
      eyebrowTop: 60,
      eyebrowSize: 9,
      headTop: 83,
      headSize: 46,
      headLH: 1.09,
      headW: 330,
      subTop: 261,
      subSize: 10,
      subLH: 1.45,
      subW: 172,
      ctaTop: 356,
      ctaSize: "sm",
      tags: [
        { left: "50%", marginLeft: -20, top: 242 },
        { left: "50%", marginLeft: 225, top: 322 },
      ],
      pager: { right: 44, top: 285 },
    },
  };
}

function mobile(w: number, hs: number, hl: number): Layout {
  const k = Math.min(w / 390, hs / 660);
  const W = w / k;
  const H = hs / k;
  const HL = hl / k;

  const m = 0.7; // fan scale relative to desktop
  const card = { w: Math.round(CARD * 1.7 * m), h: Math.round(CARD * 1.1 * m) };
  const fan = FAN.map((p) => scalePose(p, m));

  // Vertical anchors. Scene 1 block is now ~420 design px tall; scene 2 ~680.
  // Centre each in the small viewport (28 = bias for the fixed nav), never above 80.
  const base1 = Math.max(80, (H - 420) / 2 + 28);
  const base2 = Math.max(80, (H - 680) / 2 + 28);
  const cardsTop = base1 + 290;
  const boxMid = cardsTop + card.h / 2;

  // Final scene-two cascade: card 0's centre lands 380px below the scene-two block's top.
  const dy = 32;
  const y0 = base2 + 380 - boxMid; // card 0's centre, relative to the card box's centre
  const final = cascade(116, y0 + 3 * dy, 62, dy, 1.7);

  // Early stages reuse the desktop collapse sequence at fan scale; the last two are ours.
  const early = STAGES.slice(0, 9).map((st) => st.map((p) => scalePose(p, m)));
  const late = early[8].map((p, i) => lerpPose(p, final[i], 0.75));

  const colW = 342;
  const padX = Math.max(24, (W - colW) / 2);

  return {
    key: keyOf("mobile", k, W, H, HL),
    profile: "mobile",
    k,
    W,
    H,
    HL,
    card,
    fan,
    stages: [...early, late, final],
    cardsTop,
    hero: {
      headTop: base1,
      headSize: 42,
      headLH: 1.08,
      subTop: base1 + 104,
      subSize: 15,
      subLH: 1.4,
      subW: Math.min(340, W - 40),
      ctaTop: base1 + 172,
      ctaSize: "md",
      tag1: { left: "50%", marginLeft: -170, top: base1 + 236 },
      tag2: { left: "50%", marginLeft: 110, top: base1 + 254 },
    },
    two: {
      left: padX,
      eyebrowTop: base2,
      eyebrowSize: 11,
      headTop: base2 + 24,
      headSize: 42,
      headLH: 1.09,
      headW: colW,
      subTop: base2 + 160,
      subSize: 15,
      subLH: 1.45,
      subW: colW,
      ctaTop: base2 + 240,
      ctaSize: "md",
      tags: [
        { left: "50%", marginLeft: -150, top: base2 + 300 },
        { left: "50%", marginLeft: 90, top: base2 + 400 },
      ],
      pager: null, // thumbs scroll; the chevrons would only crowd the cascade
    },
  };
}

// w, hs, hl are real px: width, SMALL viewport height, LARGE viewport height.
export function computeLayout(w: number, hs: number, hl: number): Layout {
  const hlSafe = Math.max(hl, hs);
  return w / hs < 1 ? mobile(w, hs, hlSafe) : desktop(w, hs, hlSafe);
}
