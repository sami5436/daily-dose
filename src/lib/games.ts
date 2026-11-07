export type GameColor = "marigold" | "tomato" | "mint" | "sky" | "grape" | "bubblegum";

export type Game = {
  id: string;
  name: string;
  tagline: string;
  color: GameColor;
  href: string;
  status: "live" | "soon";
};

export const GAMES: readonly Game[] = [
  { id: "hunch", name: "Hunch", tagline: "Guess the five-letter word", color: "marigold", href: "/hunch", status: "live" },
  { id: "swatch", name: "Swatch", tagline: "Remember the color", color: "grape", href: "/swatch", status: "live" },
  { id: "wayfarer", name: "Wayfarer", tagline: "Name the countries nobody else does", color: "sky", href: "/wayfarer", status: "soon" },
  { id: "deepcut", name: "Deep Cut", tagline: "Rare answers score big", color: "tomato", href: "/deepcut", status: "soon" },
  { id: "sprint", name: "Sprint", tagline: "Mental math, three rounds", color: "mint", href: "/sprint", status: "soon" },
  { id: "tangle", name: "Tangle", tagline: "Untangle the theme", color: "bubblegum", href: "/tangle", status: "soon" },
];

export const LIVE_GAMES = GAMES.filter((g) => g.status === "live");

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
