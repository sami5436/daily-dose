import type { Metadata } from "next";
import { SwatchGame } from "@/games/swatch/SwatchGame";

export const metadata: Metadata = {
  title: "Swatch | Daily Dose",
  description: "Remember the color, then rebuild it. Five rounds a day.",
};

export default function SwatchPage() {
  return <SwatchGame />;
}
