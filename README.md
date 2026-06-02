# Network Bingo Generator

A web app for organizers to create and print randomized **Network / Human
Bingo** cards — the classic icebreaker where people mingle to find someone who
matches each prompt on their grid.

## Features

- **Curate your facts** — start from the built-in event facts, pull from a
  curated pool of ~50 fun networking prompts, or add your own.
- **Bulk generate** — produce any number of cards at once (up to 500).
- **Unique cards** — every card is a 5×5 grid with `FREE SPACE` in the center
  and a guaranteed-unique shuffle of the selected facts.
- **Print or export** — open a print-optimized view (one card per page) or
  download a multi-page **PDF**.
- **Saved locally** — your selections persist in the browser via `localStorage`.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

1. **Choose your facts** — tick the prompts you want (need at least 24 to fill a
   5×5 card; the center is always a free space). Add custom facts or draw random
   extras.
2. **Generate cards** — set an event title and how many cards you need, then
   click *Generate*.
3. **Print or export** — *Open print view* (then print / save as PDF via the
   browser) or *Download PDF* directly.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run lint` | Lint |

## Tech

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- Tailwind CSS
- [`@react-pdf/renderer`](https://react-pdf.org/) for PDF export
- Vitest for unit tests

The app is fully client-side (no backend or database) and deploys cleanly to
platforms like Vercel.

## Project structure

```
src/
  app/
    page.tsx        # Organizer dashboard (pick facts → generate → export)
    print/page.tsx  # Print-optimized view (one card per page)
    layout.tsx, globals.css
  components/
    FactSelector.tsx
    BingoCard.tsx   # Single 5x5 card (screen + print)
  data/facts.ts     # Seed facts + curated extras
  lib/
    bingo.ts        # Card generation (shuffle, uniqueness) — unit tested
    pdf.tsx         # PDF document + download
    storage.ts      # localStorage persistence hook
```
