import { rngFor } from "@/lib/daily";

export type HSB = { h: number; s: number; b: number };
export type RGB = { r: number; g: number; b: number };
export type Lab = { L: number; a: number; b: number };

export const ROUNDS = 5;
export const MAX_ROUND_SCORE = 10;

/** HSB (h 0-360, s and b 0-100) to sRGB with channels 0-255 (unrounded). */
export function hsbToRgb({ h, s, b }: HSB): RGB {
  const hh = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const val = b / 100;
  const f = (n: number) => {
    const k = (n + hh / 60) % 6;
    return (val - val * sat * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return { r: f(5), g: f(3), b: f(1) };
}

export function hsbToCss(c: HSB): string {
  const { r, g, b } = hsbToRgb(c);
  return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
}

function linearize(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** sRGB (0-255) to CIELAB under D65. */
export function rgbToLab({ r, g, b }: RGB): Lab {
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);
  const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / 0.95047;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb;
  const z = (0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** CIEDE2000 colour difference (Sharma, Wu, Dalal 2005). */
export function deltaE2000(l1: Lab, l2: Lab): number {
  const C1 = Math.hypot(l1.a, l1.b);
  const C2 = Math.hypot(l2.a, l2.b);
  const Cbar7 = ((C1 + C2) / 2) ** 7;
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + 25 ** 7)));
  const a1 = (1 + G) * l1.a;
  const a2 = (1 + G) * l2.a;
  const c1 = Math.hypot(a1, l1.b);
  const c2 = Math.hypot(a2, l2.b);
  const hue = (b: number, a: number) => (b === 0 && a === 0 ? 0 : (deg(Math.atan2(b, a)) + 360) % 360);
  const h1 = hue(l1.b, a1);
  const h2 = hue(l2.b, a2);

  const dL = l2.L - l1.L;
  const dC = c2 - c1;
  let dh = 0;
  if (c1 * c2 !== 0) {
    dh = h2 - h1;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(c1 * c2) * Math.sin(rad(dh / 2));

  const Lbar = (l1.L + l2.L) / 2;
  const cbar = (c1 + c2) / 2;
  let hbar = h1 + h2;
  if (c1 * c2 !== 0) {
    if (Math.abs(h1 - h2) > 180) hbar += h1 + h2 < 360 ? 360 : -360;
    hbar /= 2;
  }

  const T =
    1 -
    0.17 * Math.cos(rad(hbar - 30)) +
    0.24 * Math.cos(rad(2 * hbar)) +
    0.32 * Math.cos(rad(3 * hbar + 6)) -
    0.2 * Math.cos(rad(4 * hbar - 63));
  const dTheta = 30 * Math.exp(-(((hbar - 275) / 25) ** 2));
  const cbar7 = cbar ** 7;
  const Rc = 2 * Math.sqrt(cbar7 / (cbar7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbar - 50) ** 2) / Math.sqrt(20 + (Lbar - 50) ** 2);
  const Sc = 1 + 0.045 * cbar;
  const Sh = 1 + 0.015 * cbar * T;
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc;

  return Math.sqrt(
    (dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh),
  );
}

export function deltaEHsb(a: HSB, b: HSB): number {
  return deltaE2000(rgbToLab(hsbToRgb(a)), rgbToLab(hsbToRgb(b)));
}

/**
 * Round score 0.0 to 10.0 from a CIEDE2000 delta E.
 * 10 * exp(-dE / 22) gives dE 5 -> 8.0, 15 -> 5.1, 25 -> 3.2. Past dE 25 the
 * score fades linearly to exactly 0 at dE 40, so nothing is left to the long
 * tail and the curve stays continuous and monotonic.
 */
export function scoreFromDeltaE(dE: number): number {
  const d = Math.max(0, dE);
  const taper = d <= 25 ? 1 : Math.max(0, (40 - d) / 15);
  const raw = MAX_ROUND_SCORE * Math.exp(-d / 22) * taper;
  return Math.round(raw * 10) / 10;
}

export function scoreColors(target: HSB, guess: HSB): number {
  return scoreFromDeltaE(deltaEHsb(target, guess));
}

/** Five target colors for a day. Hues are spread around the wheel so no two rounds look alike. */
export function dailyColors(key: string): HSB[] {
  const rng = rngFor("swatch", key);
  const start = rng() * 360;
  const step = 360 / ROUNDS;
  const offsets = Array.from({ length: ROUNDS }, (_, i) => i);
  // Fisher-Yates so the hue order differs by day.
  for (let i = offsets.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [offsets[i], offsets[j]] = [offsets[j], offsets[i]];
  }
  return offsets.map((o) => ({
    h: Math.round((start + o * step + (rng() - 0.5) * step * 0.5) % 360),
    s: Math.round(25 + rng() * 75),
    b: Math.round(25 + rng() * 75),
  }));
}

export function verdict(score: number): string {
  if (score >= 9.5) return "Spot on";
  if (score >= 8) return "So close";
  if (score >= 6) return "Nice eye";
  if (score >= 4) return "Warm";
  if (score >= 2) return "Hmm, nope";
  return "Way off";
}
