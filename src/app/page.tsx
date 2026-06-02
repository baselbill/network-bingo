"use client";

import { useState } from "react";
import { FactSelector } from "@/components/FactSelector";
import { BingoCard, DEFAULT_FACT_FONT_SIZE } from "@/components/BingoCard";
import { SEED_FACTS } from "@/data/facts";
import {
  generateCards,
  NotEnoughFactsError,
  REQUIRED_FACTS,
  type BingoCard as BingoCardType,
  type GenerateOptions,
} from "@/lib/bingo";
import { downloadCardsPdf } from "@/lib/pdf";
import { STORAGE_KEYS, usePersistentState } from "@/lib/storage";

export default function Home() {
  const [title, setTitle] = usePersistentState<string>(
    STORAGE_KEYS.title,
    "Network Bingo",
  );
  const [customFacts, setCustomFacts] = usePersistentState<string[]>(
    STORAGE_KEYS.custom,
    [],
  );
  const [selected, setSelected] = usePersistentState<string[]>(
    STORAGE_KEYS.selected,
    SEED_FACTS,
  );
  const [count, setCount] = usePersistentState<number>(STORAGE_KEYS.count, 20);
  const [randomizeFreeSpace, setRandomizeFreeSpace] =
    usePersistentState<boolean>(STORAGE_KEYS.randomizeFreeSpace, false);
  const [factFontSize, setFactFontSize] = usePersistentState<number>(
    STORAGE_KEYS.fontSize,
    DEFAULT_FACT_FONT_SIZE,
  );

  const [cards, setCards] = useState<BingoCardType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  function handleGenerate() {
    setError(null);
    setWarning(null);
    try {
      const opts: GenerateOptions = { randomizeFreeSpace };
      const result = generateCards(selected, count, opts);
      setCards(result.cards);
      setWarning(result.warning ?? null);
      try {
        window.localStorage.setItem(
          STORAGE_KEYS.cards,
          JSON.stringify({ title, cards: result.cards, factFontSize }),
        );
      } catch {
        // Non-fatal: print view simply won't have pre-stored cards.
      }
    } catch (e) {
      if (e instanceof NotEnoughFactsError) setError(e.message);
      else setError("Something went wrong while generating cards.");
      setCards([]);
    }
  }

  function openPrintView() {
    window.open("/print", "_blank");
  }

  async function handleDownloadPdf() {
    if (cards.length === 0) return;
    setPdfBusy(true);
    try {
      await downloadCardsPdf(cards, title, factFontSize);
    } catch {
      setError("Failed to build the PDF. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  }

  const canGenerate = selected.length >= REQUIRED_FACTS;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Network Bingo Generator
        </h1>
        <p className="mt-1 text-slate-600">
          Pick your facts, then generate and print a stack of unique
          icebreaker bingo cards.
        </p>
      </header>

      <div className="space-y-6">
        <FactSelector
          customFacts={customFacts}
          setCustomFacts={setCustomFacts}
          selected={selected}
          setSelected={setSelected}
        />

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">2. Generate cards</h2>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col text-sm">
              <span className="mb-1 font-medium text-slate-700">
                Event title (printed on each card)
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-64 rounded border border-slate-300 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 font-medium text-slate-700">
                Number of cards
              </span>
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
                }
                className="w-32 rounded border border-slate-300 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              />
            </label>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="rounded bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Generate {count} card{count === 1 ? "" : "s"}
            </button>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2.5">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={randomizeFreeSpace}
                onChange={(e) => setRandomizeFreeSpace(e.target.checked)}
              />
              <div
                className={[
                  "h-5 w-9 rounded-full transition-colors",
                  randomizeFreeSpace ? "bg-indigo-600" : "bg-slate-300",
                ].join(" ")}
              />
              <div
                className={[
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  randomizeFreeSpace ? "translate-x-4" : "translate-x-0.5",
                ].join(" ")}
              />
            </div>
            <span className="text-sm text-slate-700">
              Randomize FREE SPACE position
              <span className="ml-1.5 text-xs text-slate-400">
                (default: center)
              </span>
            </span>
          </label>

          <div className="mt-4">
            <label className="flex flex-col text-sm">
              <span className="mb-1 font-medium text-slate-700">
                Fact font size on printout:{" "}
                <span className="font-normal text-slate-500">
                  {factFontSize}px
                </span>
              </span>
              <input
                type="range"
                min={7}
                max={16}
                step={1}
                value={factFontSize}
                onChange={(e) => setFactFontSize(Number(e.target.value))}
                className="w-64 accent-indigo-600"
              />
            </label>
            <p className="mt-1 text-xs text-slate-400">
              Larger text is easier to read; smaller text fits longer facts.
            </p>
          </div>

          {!canGenerate && (
            <p className="mt-3 text-sm text-amber-700">
              Select at least {REQUIRED_FACTS} facts to generate a 5x5 card.
            </p>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {warning && <p className="mt-3 text-sm text-amber-700">{warning}</p>}
        </section>

        {cards.length > 0 && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                3. Print or export ({cards.length} cards)
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={openPrintView}
                  className="rounded border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  Open print view
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={pdfBusy}
                  className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-slate-300"
                >
                  {pdfBusy ? "Building PDF…" : "Download PDF"}
                </button>
              </div>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Preview of the first card:
            </p>
            <BingoCard
              card={cards[0]}
              title={title}
              label="Card 1 preview"
              factFontSize={factFontSize}
            />
          </section>
        )}
      </div>

      <footer className="mt-12 text-center text-xs text-slate-400">
        Your selections are saved in this browser. Network Bingo Generator.
      </footer>
    </main>
  );
}
