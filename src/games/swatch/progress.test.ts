import { describe, expect, it } from "vitest";
import { parseProgress } from "./progress";

const good = { guess: { h: 10, s: 20, b: 30 }, score: 7.5 };

describe("parseProgress", () => {
  it("accepts valid progress and keeps shown", () => {
    expect(parseProgress({ rounds: [good], shown: 1 })).toEqual({ rounds: [good], shown: 1 });
  });
  it("accepts an empty day", () => {
    expect(parseProgress({ rounds: [] })).toEqual({ rounds: [], shown: undefined });
  });
  it("trims to five rounds", () => {
    expect(parseProgress({ rounds: Array(8).fill(good) })?.rounds).toHaveLength(5);
  });
  it("rejects non-objects and non-arrays", () => {
    expect(parseProgress(null)).toBeNull();
    expect(parseProgress("x")).toBeNull();
    expect(parseProgress({ rounds: "nope" })).toBeNull();
    expect(parseProgress({})).toBeNull();
  });
  it("rejects out-of-range or non-finite values", () => {
    expect(parseProgress({ rounds: [{ ...good, score: Infinity }] })).toBeNull();
    expect(parseProgress({ rounds: [{ ...good, score: NaN }] })).toBeNull();
    expect(parseProgress({ rounds: [{ ...good, score: 99 }] })).toBeNull();
    expect(parseProgress({ rounds: [{ ...good, guess: { h: 400, s: 0, b: 0 } }] })).toBeNull();
    expect(parseProgress({ rounds: [{ ...good, guess: { h: 1, s: -1, b: 0 } }] })).toBeNull();
    expect(parseProgress({ rounds: [{ ...good, guess: { h: 1, s: 1 } }] })).toBeNull();
    expect(parseProgress({ rounds: [null] })).toBeNull();
  });
});
