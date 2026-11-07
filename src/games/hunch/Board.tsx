import { MAX_GUESSES, WORD_LENGTH, scoreGuess, type Mark } from "./logic";

export const TILE_BG: Record<Mark, string> = {
  hit: "#3FBF8F",
  near: "#F5B731",
  miss: "var(--miss)",
};

const LABEL: Record<Mark, string> = { hit: "right spot", near: "wrong spot", miss: "not in word" };

type TileProps = {
  letter: string;
  mark?: Mark;
  /** Index within the row, used to stagger animations. */
  index: number;
  flip?: boolean;
  bounce?: boolean;
  size?: "board" | "mini";
};

export function Tile({ letter, mark, index, flip, bounce, size = "board" }: TileProps) {
  const filled = letter !== "";
  const textColor = mark === "miss" ? "text-ink" : mark ? "text-[#1d1b16]" : "text-ink";
  const border = mark || filled ? "border-ink" : "border-line";
  const anim = flip ? "hunch-flip" : bounce ? "hunch-bounce" : filled && !mark ? "hunch-pop" : "";
  return (
    <div
      role="img"
      aria-label={letter ? `${letter}, ${mark ? LABEL[mark] : "typed"}` : "empty"}
      className={`${anim} ${border} ${textColor} ${
        size === "board" ? "text-[clamp(1.5rem,9vw,2.25rem)]" : "text-xl"
      } flex aspect-square select-none items-center justify-center rounded-tile border-2 font-display font-extrabold`}
      style={{
        background: mark ? TILE_BG[mark] : filled ? "var(--card)" : "transparent",
        // Flip tiles start as plain card color, then take their mark color at the halfway point.
        ["--tile-bg" as string]: mark ? TILE_BG[mark] : "var(--card)",
        animationDelay: flip ? `${index * 250}ms` : bounce ? `${index * 90}ms` : undefined,
      }}
    >
      {letter}
    </div>
  );
}

type BoardProps = {
  guesses: readonly string[];
  current: string;
  answer: string;
  /** Row currently flipping, if any. */
  revealRow: number | null;
  shakeRow: number | null;
  bounceRow: number | null;
};

export function Board({ guesses, current, answer, revealRow, shakeRow, bounceRow }: BoardProps) {
  return (
    <div
      className="mx-auto grid w-full gap-[6px]"
      style={{ maxWidth: "min(330px, max(220px, calc((100svh - 360px) * 5 / 6)))" }}
      aria-label="Guess board"
    >
      {Array.from({ length: MAX_GUESSES }, (_, r) => {
        const guess = guesses[r];
        const marks = guess ? scoreGuess(guess, answer) : null;
        const text = guess ?? (r === guesses.length ? current : "");
        return (
          <div
            key={r}
            className={`grid grid-cols-5 gap-[6px] ${shakeRow === r ? "hunch-shake" : ""}`}
          >
            {Array.from({ length: WORD_LENGTH }, (_, c) => (
              <Tile
                key={c}
                letter={text[c] ?? ""}
                mark={marks?.[c]}
                index={c}
                flip={revealRow === r}
                bounce={bounceRow === r}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
