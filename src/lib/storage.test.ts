import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completedToday,
  getProgress,
  getResult,
  saveProgress,
  saveResult,
  streak,
  subscribe,
  type GameResult,
} from "./storage";

class MemoryStorage {
  private m = new Map<string, string>();
  get length() {
    return this.m.size;
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
}

const res = (completed = true): GameResult => ({
  completed,
  score: 4,
  maxScore: 6,
  summary: "4/6",
  share: "x",
  finishedAt: "2026-11-07T10:00:00.000Z",
});

beforeEach(() => {
  vi.stubGlobal("window", {
    localStorage: new MemoryStorage(),
    addEventListener: () => {},
    removeEventListener: () => {},
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("results", () => {
  it("round-trips and namespaces by game and day", () => {
    saveResult("hunch", "2026-11-07", res());
    expect(getResult("hunch", "2026-11-07")).toEqual(res());
    expect(getResult("hunch", "2026-11-08")).toBeNull();
    expect(getResult("swatch", "2026-11-07")).toBeNull();
    expect(window.localStorage.getItem("dd:v1:result:hunch:2026-11-07")).not.toBeNull();
  });

  it("notifies subscribers on save", () => {
    const fn = vi.fn();
    const off = subscribe(fn);
    saveResult("hunch", "2026-11-07", res());
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    saveResult("hunch", "2026-11-08", res());
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("survives corrupt JSON", () => {
    window.localStorage.setItem("dd:v1:result:hunch:2026-11-07", "{nope");
    expect(getResult("hunch", "2026-11-07")).toBeNull();
  });
});

describe("progress", () => {
  it("round-trips generic JSON", () => {
    saveProgress("hunch", "2026-11-07", { guesses: ["crane"] });
    expect(getProgress("hunch", "2026-11-07")).toEqual({ guesses: ["crane"] });
  });
});

describe("streak", () => {
  it("is 0 with nothing saved", () => {
    expect(streak("2026-11-10")).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    saveResult("hunch", "2026-11-08", res());
    saveResult("swatch", "2026-11-09", res());
    saveResult("hunch", "2026-11-10", res());
    expect(streak("2026-11-10")).toBe(3);
  });

  it("falls back to yesterday when today is empty", () => {
    saveResult("hunch", "2026-11-08", res());
    saveResult("hunch", "2026-11-09", res());
    expect(streak("2026-11-10")).toBe(2);
  });

  it("breaks on a gap", () => {
    saveResult("hunch", "2026-11-05", res());
    saveResult("hunch", "2026-11-07", res());
    saveResult("hunch", "2026-11-08", res());
    expect(streak("2026-11-08")).toBe(2);
    expect(streak("2026-11-12")).toBe(0);
  });

  it("ignores incomplete results and crosses month ends", () => {
    saveResult("hunch", "2026-11-30", res());
    saveResult("hunch", "2026-12-01", res());
    saveResult("hunch", "2026-12-02", res(false));
    expect(streak("2026-12-02")).toBe(2);
  });
});

describe("completedToday", () => {
  it("counts only completed games for the day", () => {
    saveResult("hunch", "2026-11-07", res());
    saveResult("swatch", "2026-11-07", res(false));
    expect(completedToday(["hunch", "swatch"], "2026-11-07")).toBe(1);
  });
});

describe("SSR safety", () => {
  it("no-ops without window", () => {
    vi.unstubAllGlobals();
    expect(typeof window).toBe("undefined");
    expect(getResult("hunch", "2026-11-07")).toBeNull();
    expect(() => saveResult("hunch", "2026-11-07", res())).not.toThrow();
    expect(() => saveProgress("hunch", "k", {})).not.toThrow();
    expect(getProgress("hunch", "k")).toBeNull();
    expect(streak("2026-11-07")).toBe(0);
    expect(completedToday(["hunch"], "2026-11-07")).toBe(0);
    expect(() => subscribe(() => {})()).not.toThrow();
  });
});
