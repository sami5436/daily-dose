"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { GameShell } from "@/components/GameShell";
import { ResultCard } from "@/components/ResultCard";
import { dayKey, dayNumber } from "@/lib/daily";
import { getProgress, getResult, saveProgress, saveResult } from "@/lib/storage";
import { MAX_ROUND_SCORE, ROUNDS, dailyColors, hsbToCss, scoreColors, verdict, type HSB } from "./color";
import { sum, swatchShare } from "./share";
import { parseProgress, type Played, type Progress } from "./progress";
import { Sliders } from "./Sliders";
import styles from "./sliders.module.css";

type Phase = "memorize" | "build" | "reveal";

const SHOW_SECONDS = 3;
const START: HSB = { h: 180, s: 50, b: 50 };

const RULES = (
  <>
    <p>Five colors a day. Each one flashes for three seconds, then it is gone.</p>
    <p>Rebuild it from memory with the Hue, Saturation and Brightness sliders, then lock it in.</p>
    <p>Each round scores up to 10. The closer your eye, the higher the score. Perfect day is 50.</p>
  </>
);

function Swatch({ color, label, className = "" }: { color: HSB; label?: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label ?? "Color swatch"}
      className={`chunk rounded-card ${className}`}
      style={{ background: hsbToCss(color) }}
    />
  );
}

export function SwatchGame() {
  const [key, setKey] = useState<string | null>(null);
  const [rounds, setRounds] = useState<Played[]>([]);
  const [phase, setPhase] = useState<Phase>("memorize");
  const [guess, setGuess] = useState<HSB>(START);
  const [secondsLeft, setSecondsLeft] = useState(SHOW_SECONDS);

  const colors = useMemo(() => (key ? dailyColors(key) : []), [key]);
  const index = rounds.length;
  const finished = index >= ROUNDS;

  useEffect(() => {
    const load = () => {
      const k = dayKey();
      const saved = parseProgress(getProgress<unknown>("swatch", k));
      const restored = saved?.rounds ?? [];
      setRounds(restored);
      // The color for this round was already shown before the reload: no second look.
      if (saved && saved.shown === restored.length && restored.length < ROUNDS) setPhase("build");
      setKey(k);
    };
    load();
  }, []);

  // Memorize phase: tick the visible countdown and hide the color after 3 seconds.
  useEffect(() => {
    if (!key || finished || phase !== "memorize") return;
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    const done = setTimeout(() => setPhase("build"), SHOW_SECONDS * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [key, finished, phase, index]);

  // Remember that this round's color has been shown, so reloading cannot replay it.
  useEffect(() => {
    if (!key || finished || phase !== "memorize") return;
    saveProgress<Progress>("swatch", key, { rounds, shown: index });
  }, [key, finished, phase, index, rounds]);

  const lockIn = useCallback(() => {
    if (!key) return;
    const score = scoreColors(colors[index], guess);
    const next = [...rounds, { guess, score }];
    setRounds(next);
    saveProgress<Progress>("swatch", key, { rounds: next, shown: index });
    setPhase("reveal");
    if (next.length === ROUNDS) {
      const scores = next.map((r) => r.score);
      const total = sum(scores);
      saveResult("swatch", key, {
        completed: true,
        score: total,
        maxScore: ROUNDS * MAX_ROUND_SCORE,
        summary: `${total.toFixed(1)} / ${ROUNDS * MAX_ROUND_SCORE}`,
        share: swatchShare(dayNumber(), scores),
        finishedAt: new Date().toISOString(),
      });
    }
  }, [key, colors, index, guess, rounds]);

  function nextColor() {
    setGuess(START);
    setSecondsLeft(SHOW_SECONDS);
    setPhase("memorize");
  }

  if (!key) {
    return (
      <GameShell gameId="swatch" rules={RULES}>
        <p className="text-center text-ink-2">Mixing paint...</p>
      </GameShell>
    );
  }

  if (finished && phase !== "reveal") {
    const scores = rounds.map((r) => r.score);
    const total = sum(scores);
    const saved = getResult("swatch", key);
    return (
      <GameShell gameId="swatch" rules={RULES}>
        <div className="space-y-6">
          <ResultCard
            gameId="swatch"
            headline={total >= 40 ? "Eagle eyes" : total >= 25 ? "Nice palette" : "Good effort"}
            summary={`Best round: ${Math.max(...scores).toFixed(1)} (${verdict(Math.max(...scores))})`}
            score={total}
            maxScore={ROUNDS * MAX_ROUND_SCORE}
            share={saved?.share ?? swatchShare(dayNumber(), scores)}
          />
          <ol className="space-y-3">
            {rounds.map((r, i) => (
              <li key={i} className="chunk flex items-center gap-3 rounded-card bg-card p-3">
                <span className="tabular w-5 font-display font-bold">{i + 1}</span>
                <Swatch color={colors[i]} label={`Round ${i + 1} target`} className="h-12 flex-1 !rounded-tile !shadow-none" />
                <Swatch color={r.guess} label={`Round ${i + 1} yours`} className="h-12 flex-1 !rounded-tile !shadow-none" />
                <span className="tabular w-12 text-right font-display text-lg font-extrabold">
                  {r.score.toFixed(1)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </GameShell>
    );
  }

  const progressDots = (
    <p className="tabular mb-3 text-center font-display text-sm font-bold text-ink-2">
      Color {Math.min(phase === "reveal" ? index : index + 1, ROUNDS)} of {ROUNDS}
    </p>
  );

  if (phase === "reveal") {
    const last = rounds[rounds.length - 1];
    const target = colors[rounds.length - 1];
    return (
      <GameShell gameId="swatch" rules={RULES}>
        {progressDots}
        <div className="grid grid-cols-2 gap-4">
          <figure className="min-w-0">
            <Swatch color={target} label="Target color" className="h-40 w-full" />
            <figcaption className="mt-3 text-center font-display text-sm font-bold">Target</figcaption>
          </figure>
          <figure className="min-w-0">
            <Swatch color={last.guess} label="Your color" className="h-40 w-full" />
            <figcaption className="mt-3 text-center font-display text-sm font-bold">Yours</figcaption>
          </figure>
        </div>
        <p className="mt-6 text-center font-display text-3xl font-extrabold tracking-tight">
          {verdict(last.score)}
        </p>
        <p className="tabular text-center font-display text-5xl font-extrabold tracking-tighter">
          {last.score.toFixed(1)}
          <span className="text-2xl opacity-60">/{MAX_ROUND_SCORE}</span>
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="game" color="grape" onClick={nextColor}>
            {finished ? "See results" : "Next color"}
          </Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "memorize") {
    return (
      <GameShell gameId="swatch" rules={RULES}>
        {progressDots}
        <Swatch color={colors[index]} label="Color to remember" className="h-56" />
        <div
          className="mt-5 h-4 overflow-hidden rounded-pill border-2 border-ink bg-card"
          aria-hidden
        >
          <div key={index} className={`${styles.bar} h-full bg-grape`} />
        </div>
        <p className="tabular mt-3 text-center font-display text-lg font-bold" role="timer">
          Memorize it: {secondsLeft}
        </p>
      </GameShell>
    );
  }

  return (
    <GameShell gameId="swatch" rules={RULES}>
      {progressDots}
      <Swatch color={guess} label="Your color so far" className="h-32" />
      <div className="mt-5">
        <Sliders value={guess} onChange={setGuess} />
      </div>
      <div className="mt-5 flex justify-center">
        <Button variant="game" color="grape" onClick={lockIn}>
          Lock it in
        </Button>
      </div>
    </GameShell>
  );
}
