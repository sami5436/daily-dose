import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Daily Dose: a few tiny games a day";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1D1B16";
const PAPER = "#F4EFE6";
const CARD = "#FFFDF8";

const TILES = [
  { letter: "H", color: "#F5B731", tilt: -6 },
  { letter: "S", color: "#9B7BEA", tilt: 4 },
  { letter: "W", color: "#4DA3F0", tilt: -3 },
  { letter: "D", color: "#F2643D", tilt: 5 },
  { letter: "S", color: "#3FBF8F", tilt: -5 },
  { letter: "T", color: "#F07FB0", tilt: 3 },
];

export default async function Image() {
  const [display, body] = await Promise.all([
    readFile(join(process.cwd(), "assets/BricolageGrotesque-800.ttf")),
    readFile(join(process.cwd(), "assets/Figtree-600.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "64px 72px",
          fontFamily: "Figtree",
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              borderRadius: 999,
              border: `3px solid ${INK}`,
              background: CARD,
              boxShadow: `0 5px 0 ${INK}`,
              fontSize: 26,
            }}
          >
            New puzzles every morning
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Bricolage",
              fontSize: 168,
              lineHeight: 0.9,
              letterSpacing: -6,
            }}
          >
            Daily Dose
          </div>
          <div style={{ fontSize: 40, marginTop: 20, color: "#6B6457" }}>
            A few tiny games a day. Play with friends.
          </div>
        </div>

        <div style={{ display: "flex", gap: 22 }}>
          {TILES.map((t, i) => (
            <div
              key={i}
              style={{
                width: 108,
                height: 108,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 24,
                border: `4px solid ${INK}`,
                background: t.color,
                boxShadow: `0 8px 0 ${INK}`,
                transform: `rotate(${t.tilt}deg)`,
                fontFamily: "Bricolage",
                fontSize: 64,
              }}
            >
              {t.letter}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: display, weight: 800, style: "normal" },
        { name: "Figtree", data: body, weight: 600, style: "normal" },
      ],
    },
  );
}
