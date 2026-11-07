import type { Mark } from "./logic";
import { TILE_BG } from "./Board";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

type Props = {
  states: Record<string, Mark>;
  disabled?: boolean;
  onKey: (key: string) => void;
};

export function Keyboard({ states, disabled, onKey }: Props) {
  return (
    <div className="mx-auto mt-auto flex w-full max-w-[500px] flex-col gap-[6px] pt-4" aria-label="Keyboard">
      {ROWS.map((row, i) => (
        <div key={row} className="flex justify-center gap-[5px]">
          {i === 2 && <Key label="Enter" wide disabled={disabled} onPress={() => onKey("Enter")} />}
          {[...row].map((ch) => (
            <Key
              key={ch}
              label={ch}
              mark={states[ch]}
              disabled={disabled}
              onPress={() => onKey(ch)}
            />
          ))}
          {i === 2 && <Key label="⌫" aria="Backspace" wide disabled={disabled} onPress={() => onKey("Backspace")} />}
        </div>
      ))}
    </div>
  );
}

type KeyProps = {
  label: string;
  aria?: string;
  mark?: Mark;
  wide?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function Key({ label, aria, mark, wide, disabled, onPress }: KeyProps) {
  const text = mark === "miss" ? "text-ink-2" : mark ? "text-[#1d1b16]" : "text-ink";
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      aria-label={aria ?? (mark ? `${label}, ${mark}` : label)}
      className={`${text} ${
        wide ? "flex-[1.6] text-xs" : "flex-1 text-base"
      } h-12 min-w-0 cursor-pointer select-none rounded-tile border-2 border-ink px-0 font-display font-bold shadow-[0_3px_0_var(--shadow-ink)] transition-transform duration-100 active:translate-y-[2px] active:shadow-[0_1px_0_var(--shadow-ink)] disabled:cursor-default focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink`}
      style={{ background: mark ? TILE_BG[mark] : "var(--card)" }}
    >
      {label}
    </button>
  );
}
