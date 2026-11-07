@AGENTS.md

# Daily Dose

Personal hub of original daily games. Next.js 16 App Router + Tailwind v4, installable PWA, no backend. pnpm.

## Rules
- Original games only: our own names, words, puzzles and visuals. Never copy another game's name, art, word list or exact share format.
- Daily content is date-seeded (`src/lib/daily.ts`) so everyone gets the same puzzle without a server.
- All persistence goes through `src/lib/storage.ts` (safe localStorage wrapper). Never touch `localStorage` directly in games.
- Every game exports a share string built with `src/lib/share.ts`.
- No em dashes anywhere (copy, comments, commits).
- Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/`.

## Commands
- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm test` (vitest)

## Layout
- `src/app/<game>/page.tsx` route per game, `src/games/<game>/` logic + components + tests.
- `src/components/` shared UI, `src/lib/` shared logic.

## Design system: tactile / playful
Feels like a well-made board game box: chunky, physical, confident. Not a SaaS dashboard.

- **Type:** display `Bricolage Grotesque` (700/800, tight tracking) for headings, game names, big numbers. Body `Figtree` (400/600). Tabular numerals for scores.
- **Surfaces:** paper background `--paper #F4EFE6`, cards `--card #FFFDF8`, ink `--ink #1D1B16`, muted ink `--ink-2 #6B6457`, hairline `--line #E2DACB`.
- **Chunk:** interactive cards and buttons get a 2px `--ink` border and a hard offset shadow `0 4px 0 var(--ink)`. On press: `translateY(3px)` and shadow `0 1px 0`. No blur shadows, no gradients, no glassmorphism.
- **Radius:** card 20px, button 14px, tile 10px, pill 999px.
- **Game colors (flat, one per game):** marigold `#F5B731`, tomato `#F2643D`, mint `#3FBF8F`, sky `#4DA3F0`, grape `#9B7BEA`, bubblegum `#F07FB0`. Text on them is `--ink`.
  - Hunch: marigold. Swatch: grape. Wayfarer (countries): sky. Deep Cut (trivia): tomato. Sprint (math): mint. Tangle (theme grid): bubblegum.
- **Feedback states:** hit = mint, near = marigold, miss = `--ink-2` at low contrast fill `#D9D1C2`.
- **Spacing:** 4px base; page gutter 16px mobile, 24px desktop; max content width 720px for games, 960px for hub.
- **Motion:** 120 to 200ms ease-out, springy press. Respect `prefers-reduced-motion`.
- **Dark mode:** paper `#16140F`, card `#221F18`, ink `#F4EFE6`, line `#3A352B`; shadows become `0 4px 0 #000` with border `#F4EFE6`.
- **Copy voice:** short, warm, a little cheeky. Sentence case. No emoji in UI chrome except the streak flame.
