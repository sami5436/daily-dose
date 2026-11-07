import { describe, expect, it } from "vitest";
import {
  ROUNDS,
  dailyColors,
  deltaE2000,
  hsbToRgb,
  rgbToLab,
  scoreFromDeltaE,
  type Lab,
} from "./color";

const close = (a: number, b: number, d = 0.01) => expect(Math.abs(a - b)).toBeLessThan(d);

describe("hsbToRgb", () => {
  it.each([
    [{ h: 0, s: 100, b: 100 }, [255, 0, 0]],
    [{ h: 120, s: 100, b: 100 }, [0, 255, 0]],
    [{ h: 240, s: 100, b: 100 }, [0, 0, 255]],
    [{ h: 60, s: 100, b: 50 }, [127.5, 127.5, 0]],
    [{ h: 200, s: 0, b: 40 }, [102, 102, 102]],
    [{ h: 300, s: 100, b: 0 }, [0, 0, 0]],
  ])("%j", (hsb, [r, g, b]) => {
    const out = hsbToRgb(hsb);
    close(out.r, r);
    close(out.g, g);
    close(out.b, b);
  });
});

describe("rgbToLab", () => {
  it.each([
    [[255, 255, 255], [100, 0, 0]],
    [[0, 0, 0], [0, 0, 0]],
    [[255, 0, 0], [53.24, 80.09, 67.2]],
    [[0, 255, 0], [87.73, -86.18, 83.18]],
    [[0, 0, 255], [32.3, 79.19, -107.86]],
  ])("%j", ([r, g, b], [L, a, bb]) => {
    const lab = rgbToLab({ r, g, b });
    close(lab.L, L, 0.05);
    close(lab.a, a, 0.05);
    close(lab.b, bb, 0.05);
  });
});

const lab = (L: number, a: number, b: number): Lab => ({ L, a, b });

describe("deltaE2000 (Sharma test data)", () => {
  const pairs: [Lab, Lab, number][] = [
    [lab(50, 2.6772, -79.7751), lab(50, 0, -82.7485), 2.0425],
    [lab(50, 3.1571, -77.2803), lab(50, 0, -82.7485), 2.8615],
    [lab(50, 2.8361, -74.02), lab(50, 0, -82.7485), 3.4412],
    [lab(50, -1.3802, -84.2814), lab(50, 0, -82.7485), 1.0],
    [lab(50, 0, 0), lab(50, -1, 2), 2.3669],
    [lab(50, -1, 2), lab(50, 0, 0), 2.3669],
    [lab(50, 2.5, 0), lab(73, 25, -18), 27.1492],
    [lab(50, 2.5, 0), lab(61, -5, 29), 22.8977],
    [lab(50, 2.5, 0), lab(56, -27, -3), 31.903],
    [lab(50, 2.5, 0), lab(58, 24, 15), 19.4535],
  ];
  it.each(pairs)("%j vs %j", (a, b, expected) => {
    expect(Math.abs(deltaE2000(a, b) - expected)).toBeLessThan(0.0001);
  });
});

describe("scoreFromDeltaE", () => {
  it("hits the anchor points", () => {
    expect(scoreFromDeltaE(0)).toBe(10);
    close(scoreFromDeltaE(5), 8, 0.1);
    close(scoreFromDeltaE(15), 5, 0.2);
    expect(scoreFromDeltaE(40)).toBe(0);
    expect(scoreFromDeltaE(100)).toBe(0);
  });
  it("is monotonic non-increasing and bounded", () => {
    let prev = 10;
    for (let d = 0; d <= 120; d += 0.5) {
      const s = scoreFromDeltaE(d);
      expect(s).toBeLessThanOrEqual(prev);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(10);
      prev = s;
    }
  });
});

describe("dailyColors", () => {
  it("is deterministic with 5 valid colors per day", () => {
    const a = dailyColors("2026-11-07");
    expect(a).toEqual(dailyColors("2026-11-07"));
    expect(a).toHaveLength(ROUNDS);
    for (const c of a) {
      expect(c.h).toBeGreaterThanOrEqual(0);
      expect(c.h).toBeLessThan(360);
      expect(c.s).toBeGreaterThanOrEqual(25);
      expect(c.s).toBeLessThanOrEqual(100);
      expect(c.b).toBeGreaterThanOrEqual(25);
      expect(c.b).toBeLessThanOrEqual(100);
    }
  });
  it("varies by day and keeps hues apart", () => {
    expect(dailyColors("2026-11-08")).not.toEqual(dailyColors("2026-11-07"));
    for (let d = 1; d <= 60; d++) {
      const hs = dailyColors(`2026-12-${String(d).padStart(2, "0")}`).map((c) => c.h);
      for (let i = 0; i < hs.length; i++)
        for (let j = i + 1; j < hs.length; j++) {
          const diff = Math.abs(hs[i] - hs[j]);
          expect(Math.min(diff, 360 - diff)).toBeGreaterThan(20);
        }
    }
  });
});
