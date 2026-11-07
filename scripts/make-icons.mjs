// Generates the PWA icons in public/icons and src/app/icon.png from inline SVG.
// Run with: pnpm icons
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const INK = "#1D1B16";
const PAPER = "#F4EFE6";
const MARIGOLD = "#F5B731";

// Chunky "D" on a 512 grid, centered, with a hard offset shadow like the UI.
const letter = (dx, dy, fill) =>
  `<path transform="translate(${dx} ${dy})" fill="${fill}" fill-rule="evenodd"
    d="M150 120h110c82 0 134 56 134 136s-52 136-134 136H150zM226 184v144h30c40 0 66-28 66-72s-26-72-66-72z"/>`;

// scale: shrink artwork toward center (maskable keeps content in the safe zone).
function svg({ rounded, scale }) {
  const clip = rounded
    ? `<rect x="16" y="16" width="480" height="480" rx="112" fill="${MARIGOLD}" stroke="${INK}" stroke-width="16"/>`
    : `<rect width="512" height="512" fill="${MARIGOLD}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${clip}
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    ${letter(0, 14, INK)}
    ${letter(0, 0, PAPER)}
  </g>
</svg>`;
}

mkdirSync("public/icons", { recursive: true });
const jobs = [
  ["public/icons/icon-512.png", 512, svg({ rounded: true, scale: 1 })],
  ["public/icons/icon-192.png", 192, svg({ rounded: true, scale: 1 })],
  ["public/icons/icon-maskable-512.png", 512, svg({ rounded: false, scale: 0.78 })],
  ["public/icons/apple-touch-icon.png", 180, svg({ rounded: false, scale: 0.9 })],
  ["src/app/icon.png", 64, svg({ rounded: true, scale: 1 })],
];
writeFileSync("public/icons/icon.svg", svg({ rounded: true, scale: 1 }));
for (const [path, size, markup] of jobs) {
  await sharp(Buffer.from(markup)).resize(size, size).png().toFile(path);
}
