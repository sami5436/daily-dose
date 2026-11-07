"use client";

import type { CSSProperties } from "react";
import { hsbToCss, type HSB } from "./color";
import styles from "./sliders.module.css";

type Props = {
  value: HSB;
  onChange: (next: HSB) => void;
};

const HUE_TRACK = `linear-gradient(to right, ${Array.from({ length: 13 }, (_, i) => `hsl(${i * 30} 100% 50%)`).join(", ")})`;

type Spec = {
  key: keyof HSB;
  label: string;
  max: number;
  track: string;
};

export function Sliders({ value, onChange }: Props) {
  const specs: Spec[] = [
    { key: "h", label: "Hue", max: 360, track: HUE_TRACK },
    {
      key: "s",
      label: "Saturation",
      max: 100,
      track: `linear-gradient(to right, ${hsbToCss({ ...value, s: 0 })}, ${hsbToCss({ ...value, s: 100 })})`,
    },
    {
      key: "b",
      label: "Brightness",
      max: 100,
      track: `linear-gradient(to right, ${hsbToCss({ ...value, b: 0 })}, ${hsbToCss({ ...value, b: 100 })})`,
    },
  ];

  return (
    <div className="space-y-2">
      {specs.map((s) => (
        <label key={s.key} className="block">
          <span className="flex justify-between font-display text-sm font-bold">
            {s.label}
            <span className="tabular text-ink-2">{Math.round(value[s.key])}</span>
          </span>
          <input
            type="range"
            min={0}
            max={s.max}
            step={1}
            value={value[s.key]}
            onChange={(e) => onChange({ ...value, [s.key]: Number(e.target.value) })}
            className={styles.range}
            style={{ "--track": s.track } as CSSProperties}
          />
        </label>
      ))}
    </div>
  );
}
