import { describe, expect, it } from "vitest";
import { addDays, dayKey, dayNumber, pick, rngFor, shuffle } from "./daily";

describe("dayKey", () => {
  it("formats local date with padding", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("dayNumber", () => {
  it("is 1 on launch day regardless of time", () => {
    expect(dayNumber(new Date(2026, 10, 7, 0, 0))).toBe(1);
    expect(dayNumber(new Date(2026, 10, 7, 23, 59))).toBe(1);
  });

  it("increments daily", () => {
    expect(dayNumber(new Date(2026, 10, 8))).toBe(2);
    expect(dayNumber(new Date(2027, 10, 7))).toBe(366);
  });

  it("is stable across DST changes", () => {
    // Spring forward (US) 2027-03-14, fall back 2027-11-07.
    expect(dayNumber(new Date(2027, 2, 14, 12))).toBe(
      dayNumber(new Date(2027, 2, 13, 12)) + 1,
    );
    expect(dayNumber(new Date(2027, 10, 8, 0, 30))).toBe(
      dayNumber(new Date(2027, 10, 7, 23, 30)) + 1,
    );
  });
});

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("rngFor", () => {
  it("is deterministic per game and day", () => {
    const a = rngFor("hunch", "2026-11-07");
    const b = rngFor("hunch", "2026-11-07");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("differs across games and days", () => {
    expect(rngFor("hunch", "2026-11-07")()).not.toBe(rngFor("swatch", "2026-11-07")());
    expect(rngFor("hunch", "2026-11-07")()).not.toBe(rngFor("hunch", "2026-11-08")());
  });

  it("stays in [0, 1)", () => {
    const r = rngFor("x", "y");
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("pick and shuffle", () => {
  it("pick returns an element deterministically", () => {
    const arr = ["a", "b", "c", "d"];
    expect(pick(rngFor("g", "k"), arr)).toBe(pick(rngFor("g", "k"), arr));
    expect(arr).toContain(pick(rngFor("g", "k"), arr));
  });

  it("shuffle is a deterministic permutation and does not mutate", () => {
    const arr = [1, 2, 3, 4, 5, 6];
    const s = shuffle(rngFor("g", "k"), arr);
    expect(s).toEqual(shuffle(rngFor("g", "k"), arr));
    expect([...s].sort()).toEqual(arr);
    expect(arr).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
