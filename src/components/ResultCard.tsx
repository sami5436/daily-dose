"use client";

import { getGame } from "@/lib/games";
import { shareText } from "@/lib/share";
import { BG } from "./colors";
import { Button } from "./Button";
import { useToast } from "./Toast";

type Props = {
  gameId: string;
  headline: string;
  summary: string;
  score: number;
  maxScore: number;
  /** Overrides the big number, e.g. "X" for a loss. */
  scoreText?: string;
  /** Output of buildShare. */
  share: string;
};

export function ResultCard({ gameId, headline, summary, score, maxScore, scoreText, share }: Props) {
  const game = getGame(gameId);
  const toast = useToast();
  if (!game) return null;

  async function onShare() {
    const outcome = await shareText(share);
    if (outcome === "copied") toast("Copied!");
    else if (outcome === "failed") toast("Couldn't share");
  }

  return (
    <section
      aria-label="Result"
      className={`${BG[game.color]} chunk rounded-card p-6 text-center text-[#1d1b16]`}
    >
      <h2 className="font-display text-3xl font-extrabold tracking-tight">{headline}</h2>
      <p className="tabular mt-1 font-display text-6xl font-extrabold tracking-tighter">
        {scoreText ?? score}
        <span className="text-3xl opacity-60">/{maxScore}</span>
      </p>
      <p className="mt-2 text-base font-semibold">{summary}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onShare}>Share</Button>
        <Button variant="ghost" href="/">
          Back to hub
        </Button>
      </div>
    </section>
  );
}
