import type { Metadata } from "next";
import { Hunch } from "@/games/hunch/Hunch";

export const metadata: Metadata = {
  title: "Hunch",
  description: "Guess today's five-letter word in six tries.",
};

export default function HunchPage() {
  return <Hunch />;
}
