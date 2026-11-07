import { MAX_ROUND_SCORE, ROUNDS, type HSB } from "./color";

export type Played = { guess: HSB; score: number };
export type Progress = {
  rounds: Played[];
  /** Index of the round whose color has already been shown, so a reload cannot show it twice. */
  shown?: number;
};

function inRange(v: unknown, max: number): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max;
}

function validHsb(v: unknown): v is HSB {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return inRange(c.h, 360) && inRange(c.s, 100) && inRange(c.b, 100);
}

/** Returns clean progress, or null when the stored value is malformed. */
export function parseProgress(raw: unknown): Progress | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { rounds, shown } = raw as Record<string, unknown>;
  if (!Array.isArray(rounds)) return null;
  const kept = rounds.slice(0, ROUNDS);
  const clean: Played[] = [];
  for (const r of kept) {
    if (typeof r !== "object" || r === null) return null;
    const { guess, score } = r as Record<string, unknown>;
    if (!validHsb(guess) || !inRange(score, MAX_ROUND_SCORE)) return null;
    clean.push({ guess, score });
  }
  const validShown = typeof shown === "number" && Number.isInteger(shown) ? shown : undefined;
  return { rounds: clean, shown: validShown };
}
