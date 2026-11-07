"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/GameShell";
import { ResultCard } from "@/components/ResultCard";
import { useToast } from "@/components/Toast";
import { dayKey, dayNumber } from "@/lib/daily";
import { getProgress, getResult, saveProgress, saveResult } from "@/lib/storage";
import { Board, Tile } from "./Board";
import { Keyboard } from "./Keyboard";
import {
  MAX_GUESSES,
  WORD_LENGTH,
  answerFor,
  buildHunchShare,
  keyStates,
  outcomeOf,
  resultFor,
  scoreGuess,
} from "./logic";
import { HUNCH_CSS } from "./styles";
import { VALID } from "./valid";

type Progress = { guesses: string[] };

const FLIP_MS = (WORD_LENGTH - 1) * 250 + 500;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Rules() {
  return (
    <>
      <p>
        Find today&apos;s secret five-letter word in six tries. Every guess must be a real word.
      </p>
      <p>After each guess, the tiles tell you how close you were:</p>
      <div className="flex w-[240px] gap-[6px]" aria-hidden>
        {[..."CRANE"].map((ch, i) => (
          <div key={i} className="w-full">
            <Tile letter={ch} index={i} mark={(["hit", "miss", "near", "miss", "miss"] as const)[i]} size="mini" />
          </div>
        ))}
      </div>
      <ul className="list-disc space-y-1 pl-5">
        <li><b>Green</b>: right letter, right spot (C).</li>
        <li><b>Yellow</b>: it&apos;s in the word, just not there (A).</li>
        <li><b>Grey</b>: not in the word at all.</li>
      </ul>
      <p>One new word a day. Same word for everyone. No pressure (some pressure).</p>
    </>
  );
}

export function Hunch() {
  const toast = useToast();
  // Today's key is read after mount: dayKey() depends on the clock, which prerender forbids.
  const [key, setKey] = useState("");
  const [ready, setReady] = useState(false);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [bounceRow, setBounceRow] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");
  const [finished, setFinished] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const answer = key ? answerFor(key) : "";
  const outcome = outcomeOf(guesses, answer);
  const revealing = revealRow !== null;
  const locked = outcome !== "playing" || revealing;

  // Restore saved progress after mount (storage is client-only).
  useEffect(() => {
    function restore() {
      const today = dayKey();
      const todayAnswer = answerFor(today);
      const saved = getProgress<Progress>("hunch", today);
      const restored = (saved?.guesses ?? []).filter((g) => /^[A-Z]{5}$/.test(g)).slice(0, MAX_GUESSES);
      // Trim anything after a win so a stale save cannot extend a finished game.
      const end = restored.findIndex((g) => g === todayAnswer);
      const guessesNow = end >= 0 ? restored.slice(0, end + 1) : restored;
      setKey(today);
      setGuesses(guessesNow);
      if (outcomeOf(guessesNow, todayAnswer) !== "playing") {
        finish(guessesNow, today, todayAnswer);
        setFinished(true);
      }
      setReady(true);
    }
    restore();
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function finish(final: string[], day: string, correct: string) {
    if (getResult("hunch", day)) return;
    const { score, summary } = resultFor(final, correct);
    saveResult("hunch", day, {
      completed: true,
      score,
      maxScore: MAX_GUESSES,
      summary,
      share: buildHunchShare(final, correct, dayNumber()),
      finishedAt: new Date().toISOString(),
    });
  }

  const submit = useCallback(() => {
    if (current.length < WORD_LENGTH) {
      setShakeRow(guesses.length);
      toast("Need five letters");
      timers.current.push(setTimeout(() => setShakeRow(null), 400));
      return;
    }
    if (!VALID.has(current)) {
      setShakeRow(guesses.length);
      toast("Not in our dictionary");
      timers.current.push(setTimeout(() => setShakeRow(null), 400));
      return;
    }
    const next = [...guesses, current];
    const row = guesses.length;
    const marks = scoreGuess(current, answer);
    setGuesses(next);
    setCurrent("");
    saveProgress<Progress>("hunch", key, { guesses: next });
    const wait = prefersReducedMotion() ? 0 : FLIP_MS;
    setRevealRow(row);
    timers.current.push(
      setTimeout(() => {
        setRevealRow(null);
        const spoken = [...current].map((ch, i) => `${ch} ${marks[i]}`).join(", ");
        setAnnounce(`Row ${row + 1}: ${spoken}.`);
        const result = outcomeOf(next, answer);
        if (result !== "playing") {
          if (result === "won") setBounceRow(row);
          finish(next, key, answer);
          setFinished(true);
          setAnnounce(
            `Row ${row + 1}: ${spoken}. ${result === "won" ? `You got it in ${next.length}.` : `The word was ${answer}.`}`,
          );
        }
      }, wait),
    );
  }, [current, guesses, answer, key, toast]);

  const onKey = useCallback(
    (k: string) => {
      if (locked) return;
      if (k === "Enter") submit();
      else if (k === "Backspace") setCurrent((c) => c.slice(0, -1));
      else if (/^[A-Z]$/.test(k)) setCurrent((c) => (c.length < WORD_LENGTH ? c + k : c));
    },
    [locked, submit],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector("dialog[open]")) return;
      const t = e.target;
      // Let a focused button handle its own Enter or Space.
      if (e.key === "Enter" && t instanceof HTMLElement && t.closest("button, a")) return;
      if (e.key === "Enter" || e.key === "Backspace") {
        onKey(e.key);
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        onKey(e.key.toUpperCase());
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKey]);

  // Keys take on their colors only once the flip has finished.
  const settled = revealing ? guesses.slice(0, -1) : guesses;
  const states = keyStates(settled, answer);
  const result = finished && !revealing ? resultFor(guesses, answer) : null;

  return (
    <GameShell gameId="hunch" rules={<Rules />}>
      <style>{HUNCH_CSS}</style>
      <div className="flex flex-1 flex-col gap-5">
        {ready ? (
          <Board
            guesses={guesses}
            current={current}
            answer={answer}
            revealRow={revealRow}
            shakeRow={shakeRow}
            bounceRow={bounceRow}
          />
        ) : (
          <div className="min-h-[300px]" aria-busy />
        )}
        {result ? (
          <ResultCard
            gameId="hunch"
            headline={outcome === "won" ? "Nailed it" : "So close"}
            summary={result.summary}
            score={result.score}
            maxScore={MAX_GUESSES}
            share={buildHunchShare(guesses, answer, dayNumber())}
          />
        ) : (
          <Keyboard states={states} disabled={!ready || locked} onKey={onKey} />
        )}
        <div role="status" aria-live="polite" className="sr-only">
          {announce}
        </div>
      </div>
    </GameShell>
  );
}
