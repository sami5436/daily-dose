"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dayKey, dayNumber } from "@/lib/daily";
import { GAMES, LIVE_GAMES, type Game } from "@/lib/games";
import { completedToday, getResult, streak, subscribe, type GameResult } from "@/lib/storage";
import { BG } from "./colors";

type HubState = {
  date: string;
  dose: number;
  streak: number;
  done: number;
  results: Record<string, GameResult | null>;
};

function read(): HubState {
  const now = new Date();
  const key = dayKey(now);
  return {
    date: now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    dose: dayNumber(now),
    streak: streak(key),
    done: completedToday(LIVE_GAMES.map((g) => g.id), key),
    results: Object.fromEntries(GAMES.map((g) => [g.id, getResult(g.id, key)])),
  };
}

/** Local date and saved results exist only in the browser, so state fills in after mount. */
function useHubState(): HubState | null {
  const [state, setState] = useState<HubState | null>(null);
  useEffect(() => {
    const sync = () => setState(read());
    sync();
    return subscribe(sync);
  }, []);
  return state;
}

function GameCard({ game, index, result }: { game: Game; index: number; result: GameResult | null }) {
  const num = String(index + 1).padStart(2, "0");
  const base = `${BG[game.color]} relative flex min-h-40 flex-col justify-between rounded-card p-4 text-[#1d1b16] md:min-h-48 md:p-5`;
  const body = (
    <>
      <span className="tabular w-fit rounded-pill border-2 border-[#1d1b16] bg-[#fffdf8] px-2 py-0.5 font-display text-xs font-bold text-[#1d1b16]">
        No. {num}
      </span>
      <div>
        <h2 className="font-display text-2xl font-extrabold leading-none tracking-tight md:text-3xl">
          {game.name}
        </h2>
        <p className="mt-1.5 text-sm font-semibold leading-snug opacity-80">{game.tagline}</p>
      </div>
    </>
  );

  if (game.status === "soon") {
    return (
      <div aria-disabled="true" className={`${base} border-2 border-dashed border-ink-2 opacity-45`}>
        {body}
        <span className="absolute right-3 top-3 rounded-pill bg-[#1d1b16] px-2.5 py-0.5 font-display text-xs font-bold text-[#f4efe6]">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={game.href}
      className={`${base} chunk md:hover:-rotate-[1.5deg] md:hover:-translate-y-0.5 md:even:hover:rotate-[1.5deg]`}
    >
      {body}
      <span
        className={`absolute right-3 top-3 max-w-[60%] truncate rounded-pill px-2.5 py-0.5 font-display text-xs font-bold ${
          result?.completed ? "bg-[#1d1b16] text-[#f4efe6]" : "bg-[#fffdf8] text-[#1d1b16] border-2 border-[#1d1b16]"
        }`}
      >
        {result?.completed ? `✓ ${result.summary}` : "Play"}
      </span>
    </Link>
  );
}

export function Hub() {
  const state = useHubState();
  const total = LIVE_GAMES.length;

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col px-4 pb-10 pt-8 md:px-6 md:pt-14">
      <header className="mb-8 md:mb-12">
        <h1 className="font-display text-6xl font-extrabold leading-[0.85] tracking-tighter md:text-8xl">
          Daily
          <br />
          Dose<span className="text-tomato">.</span>
        </h1>
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-ink-2">
          <span className="min-h-6">{state?.date ?? " "}</span>
          <span className="tabular rounded-pill border-2 border-ink px-3 py-0.5 font-display text-sm font-bold text-ink">
            Dose #{state?.dose ?? "-"}
          </span>
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {GAMES.map((game, i) => (
          <li key={game.id} className="flex flex-col [&>*]:flex-1">
            <GameCard game={game} index={i} result={state?.results[game.id] ?? null} />
          </li>
        ))}
      </ul>

      <footer className="mt-10 flex items-center justify-between gap-4 rounded-card border-2 border-line bg-card px-5 py-4 md:mt-14">
        <p className="flex items-center gap-3 font-display text-xl font-extrabold tracking-tight">
          <span aria-hidden className="text-2xl">🔥</span>
          <span className="tabular">{state?.streak ?? 0}-day streak</span>
        </p>
        <p className="tabular font-semibold text-ink-2">
          {state?.done ?? 0} of {total} today
        </p>
      </footer>
    </div>
  );
}
