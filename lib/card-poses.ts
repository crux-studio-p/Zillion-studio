// lib/card-poses.ts
export const HERO = 6;
export const CARD = 134; // px, square. Measured from frame 6 (a lone card is ~134px).

export type Pose = { x: number; y: number; rotate: number; rotateY: number; scale: number };

// Resting fan at the end of the intro. Offsets are from the card's own box centre.
export const FAN: Pose[] = [
  { x: -249, y: 26, rotate: -9, rotateY: 22, scale: 1 },
  { x: -166, y: -8, rotate: -5, rotateY: 16, scale: 1 },
  { x: -83, y: 10, rotate: -3, rotateY: 10, scale: 1 },
  { x: 0, y: 14, rotate: -1, rotateY: 4, scale: 1 },
  { x: 83, y: 0, rotate: 2, rotateY: -4, scale: 1 },
  { x: 166, y: 10, rotate: 3, rotateY: -9, scale: 1 },
  { x: 249, y: 4, rotate: 6, rotateY: -14, scale: 1 },
];

type P = { cx: number; cy: number; dx: number; dy: number; dr?: number; dry?: number; s: number };

// cx/cy = centre of the group; dx/dy/dr/dry = per-card step from the middle card.
const stage = ({ cx, cy, dx, dy, dr = 0, dry = 0, s }: P): Pose[] =>
  FAN.map((_, i) => ({
    x: cx + (i - 3) * dx,
    y: cy + (i - 3) * dy,
    rotate: (i - 3) * dr,
    rotateY: (i - 3) * dry,
    scale: s,
  }));

export const STOPS = [0, 0.1, 0.18, 0.3, 0.41, 0.47, 0.53, 0.6, 0.7, 0.85, 1];

export const STAGES: Pose[][] = [
  FAN, //                                                                    0.00 hero final
  stage({ cx: -7, cy: 5, dx: 45, dy: -1, dr: 1.5, dry: -4, s: 1 }), //      0.10 frame 2
  stage({ cx: -5, cy: 17, dx: 23, dy: -1, dr: 0.8, dry: -2.2, s: 1 }), //   0.18 frame 3
  stage({ cx: -13, cy: 24, dx: 11, dy: 0, dr: 0.4, dry: -1.2, s: 1 }), //   0.30 frame 4
  stage({ cx: -19, cy: 45, dx: 2.3, dy: 0, s: 1.1 }), //                    0.41 frame 5
  stage({ cx: -22, cy: 53, dx: 0, dy: 0, s: 1 }), //                        0.47 frame 6: one card
  stage({ cx: -12, cy: 56, dx: 5.7, dy: 2.5, s: 1 }), //                    0.53 frame 7
  stage({ cx: 16, cy: 64, dx: 13.7, dy: 5.5, s: 1.07 }), //                 0.60 frame 8
  stage({ cx: 57, cy: 81, dx: 28, dy: 10.8, s: 1.15 }), //                  0.70 frame 9
  stage({ cx: 230, cy: 144,   dx: 85,  dy: 32,   s: 1.3  }),  //            0.85 approx. of previous frame 10
  stage({ cx: 326, cy: 168.5, dx: 117, dy: 38.5, s: 1.35 }),  //            1.00 final: matches original
];
