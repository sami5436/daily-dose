import type { HTMLAttributes } from "react";

/** Flat paper card with a hairline border. Add `chunk` via className for interactive ones. */
export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border-2 border-line bg-card p-5 ${className}`}
      {...rest}
    />
  );
}
