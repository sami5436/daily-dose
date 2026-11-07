"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { getGame } from "@/lib/games";
import { BG } from "./colors";
import { Modal } from "./Modal";

type Props = {
  gameId: string;
  /** Contents of the "How to play" modal. */
  rules: ReactNode;
  children: ReactNode;
};

export function GameShell({ gameId, rules, children }: Props) {
  const game = getGame(gameId);
  const [rulesOpen, setRulesOpen] = useState(false);
  if (!game) return null;

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-4 pb-10 pt-4 md:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="chunk rounded-button bg-card px-4 py-2 font-display text-sm font-bold"
        >
          <span aria-hidden>←</span> Hub
        </Link>
        <h1
          className={`${BG[game.color]} chunk rounded-pill px-5 py-1.5 font-display text-xl font-extrabold tracking-tight text-[#1d1b16]`}
        >
          {game.name}
        </h1>
        <button
          type="button"
          onClick={() => setRulesOpen(true)}
          className="chunk cursor-pointer rounded-button bg-card px-4 py-2 font-display text-sm font-bold"
        >
          How to play
        </button>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <Modal open={rulesOpen} onClose={() => setRulesOpen(false)} title={`How to play ${game.name}`}>
        {rules}
      </Modal>
    </div>
  );
}
