import { describe, expect, it } from "vitest";
import { addDays } from "@/lib/daily";
import { ANSWERS } from "./answers";
import { answerFor, buildHunchShare, keyStates, outcomeOf, resultFor, scoreGuess } from "./logic";
import { VALID } from "./valid";

describe("scoreGuess", () => {
  it("marks all hits", () => {
    expect(scoreGuess("CRANE", "CRANE")).toEqual(["hit", "hit", "hit", "hit", "hit"]);
  });
  it("marks near and miss", () => {
    expect(scoreGuess("PLANT", "ALARM")).toEqual(["miss", "hit", "hit", "miss", "miss"]);
  });
  it("handles duplicates in the guess (LEVEL vs LLAMA)", () => {
    expect(scoreGuess("LEVEL", "LLAMA")).toEqual(["hit", "miss", "miss", "miss", "near"]);
  });
  it("handles duplicates in the answer (BABES vs ABBEY)", () => {
    expect(scoreGuess("BABES", "ABBEY")).toEqual(["near", "near", "hit", "hit", "miss"]);
  });
  it("lets hits claim letters before near marks", () => {
    expect(scoreGuess("SPEED", "ABIDE")).toEqual(["miss", "miss", "near", "miss", "near"]);
  });
});

describe("keyStates", () => {
  it("keeps the best state per letter", () => {
    const s = keyStates(["LEVEL", "LLAMA"], "LLAMA");
    expect(s.L).toBe("hit");
    expect(s.E).toBe("miss");
  });
});

describe("outcome and result", () => {
  it("detects win, loss and play", () => {
    expect(outcomeOf(["CRANE"], "CRANE")).toBe("won");
    expect(outcomeOf(["AAAAA"], "CRANE")).toBe("playing");
    expect(outcomeOf(Array(6).fill("AAAAA"), "CRANE")).toBe("lost");
  });
  it("scores 7 minus guesses on a win, 0 on a loss", () => {
    expect(resultFor(["AAAAA", "BBBBB", "CRANE"], "CRANE")).toEqual({ score: 4, summary: "Got it in 3" });
    expect(resultFor(Array(6).fill("AAAAA"), "CRANE")).toEqual({ score: 0, summary: "Missed: CRANE" });
  });
  it("builds share text with our glyphs", () => {
    const s = buildHunchShare(["PLANT", "ALARM"], "ALARM", 4);
    expect(s).toContain("Hunch #4 2/6");
    expect(s).toContain("⚫🟢🟢⚫⚫");
    expect(s).toContain("🟢🟢🟢🟢🟢");
  });
  it("shows X on a loss", () => {
    expect(buildHunchShare(Array(6).fill("AAAAA"), "CRANE", 1)).toContain("Hunch #1 X/6");
  });
});

describe("word lists", () => {
  it("has a healthy pool", () => {
    expect(ANSWERS.length).toBeGreaterThanOrEqual(400);
  });
  it("answers are five uppercase letters and unique", () => {
    for (const w of ANSWERS) expect(w).toMatch(/^[A-Z]{5}$/);
    expect(new Set(ANSWERS).size).toBe(ANSWERS.length);
  });
  it("all answers are valid guesses", () => {
    for (const w of ANSWERS) expect(VALID.has(w)).toBe(true);
  });
  it("daily pick is deterministic and varies", () => {
    expect(answerFor("2026-11-07")).toBe(answerFor("2026-11-07"));
    const picks = new Set(Array.from({ length: 30 }, (_, i) => answerFor(addDays("2026-11-07", i))));
    expect(picks.size).toBeGreaterThan(20);
  });
});
