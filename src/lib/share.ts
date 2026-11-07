export type ShareInput = {
  game: string;
  dayNumber: number;
  result: string;
  lines: string[];
};

export function buildShare({ game, dayNumber, result, lines }: ShareInput): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "dailydose";
  return [`${game} #${dayNumber} · ${result}`, ...lines, "", site].join("\n");
}

export type ShareOutcome = "shared" | "copied" | "failed" | "cancelled";

export async function shareText(text: string): Promise<ShareOutcome> {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share({ text });
      return "shared";
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      return "failed";
    }
  }
  return "failed";
}
