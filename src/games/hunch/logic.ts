import { pick, rngFor } from "@/lib/daily";
import { buildShare } from "@/lib/share";
import { ANSWERS } from "./answers";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export type Mark = "hit" | "near" | "miss";

export function answerFor(key: string): string {
  return pick(rngFor("hunch", key), ANSWERS);
}

/** Two-pass scoring: exact hits claim their letters first, then near marks use what is left. */
export function scoreGuess(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(guess.length).fill("miss");
  const left: Record<string, number> = {};
  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) marks[i] = "hit";
    else left[answer[i]] = (left[answer[i]] ?? 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (marks[i] === "hit") continue;
    if (left[guess[i]] > 0) {
      marks[i] = "near";
      left[guess[i]]--;
    }
  }
  return marks;
}

const RANK: Record<Mark, number> = { miss: 0, near: 1, hit: 2 };

/** Best known state per letter across all guesses. */
export function keyStates(guesses: readonly string[], answer: string): Record<string, Mark> {
  const out: Record<string, Mark> = {};
  for (const g of guesses) {
    scoreGuess(g, answer).forEach((m, i) => {
      const prev = out[g[i]];
      if (!prev || RANK[m] > RANK[prev]) out[g[i]] = m;
    });
  }
  return out;
}

export type Outcome = "playing" | "won" | "lost";

export function outcomeOf(guesses: readonly string[], answer: string): Outcome {
  if (guesses[guesses.length - 1] === answer) return "won";
  return guesses.length >= MAX_GUESSES ? "lost" : "playing";
}

const GLYPH: Record<Mark, string> = { hit: "🟢", near: "🟡", miss: "⚫" };

export function buildHunchShare(guesses: readonly string[], answer: string, dayNumber: number): string {
  const won = outcomeOf(guesses, answer) === "won";
  return buildShare({
    game: "Hunch",
    dayNumber,
    result: won ? `${guesses.length} ${guesses.length === 1 ? "try" : "tries"}` : "missed",
    lines: guesses.map((g) =>
      scoreGuess(g, answer)
        .map((m) => GLYPH[m])
        .join(""),
    ),
  });
}

export function resultFor(guesses: readonly string[], answer: string) {
  const won = outcomeOf(guesses, answer) === "won";
  return {
    score: won ? 7 - guesses.length : 0,
    summary: won ? `Got it in ${guesses.length}` : `Missed: ${answer}`,
  };
}
