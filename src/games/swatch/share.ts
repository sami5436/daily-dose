import { buildShare } from "@/lib/share";
import { MAX_ROUND_SCORE, ROUNDS } from "./color";

const SEGMENTS = 5;

/** Five-segment bar, one filled segment per 2 points. */
export function scoreBar(score: number): string {
  const filled = Math.min(SEGMENTS, Math.max(0, Math.round((score / MAX_ROUND_SCORE) * SEGMENTS)));
  return "🟣".repeat(filled) + "⚪".repeat(SEGMENTS - filled);
}

export function sum(scores: number[]): number {
  return Math.round(scores.reduce((a, b) => a + b, 0) * 10) / 10;
}

export function swatchShare(dayNumber: number, scores: number[]): string {
  const total = sum(scores).toFixed(1);
  return buildShare({
    game: "Swatch",
    dayNumber,
    headline: `Swatch #${dayNumber} ${total}/${ROUNDS * MAX_ROUND_SCORE}`,
    lines: scores.map((s, i) => `${i + 1}. ${scoreBar(s)} ${s.toFixed(1)}`),
  });
}
