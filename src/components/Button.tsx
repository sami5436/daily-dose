import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { GameColor } from "@/lib/games";
import { BG } from "./colors";

type Variant = "primary" | "game" | "ghost";

type Props = {
  variant?: Variant;
  /** Fill color for the "game" variant. */
  color?: GameColor;
  /** Renders a link instead of a button. */
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const BASE =
  "chunk inline-flex items-center justify-center gap-2 rounded-button px-5 py-3 font-display text-base font-bold tracking-tight select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

function surface(variant: Variant, color: GameColor): string {
  if (variant === "primary") return "bg-ink text-paper";
  if (variant === "game") return `${BG[color]} text-[#1d1b16]`;
  return "bg-card text-ink";
}

export function Button({
  variant = "primary",
  color = "marigold",
  href,
  className = "",
  children,
  ...rest
}: Props) {
  const cls = `${BASE} ${surface(variant, color)} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
