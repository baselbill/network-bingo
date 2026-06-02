"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BingoCard, DEFAULT_FACT_FONT_SIZE } from "@/components/BingoCard";
import { STORAGE_KEYS } from "@/lib/storage";
import type { BingoCard as BingoCardType } from "@/lib/bingo";

type StoredCards = {
  title: string;
  cards: BingoCardType[];
  factFontSize?: number;
};

export default function PrintPage() {
  const [data, setData] = useState<StoredCards | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.cards);
      if (raw) setData(JSON.parse(raw) as StoredCards);
    } catch {
      // Ignore — handled by the empty state below.
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!data || data.cards.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold">No cards to print</h1>
        <p className="mb-6 text-slate-600">
          Generate some cards first, then open the print view.
        </p>
        <Link
          href="/"
          className="rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Back to generator
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <h1 className="text-xl font-bold">{data.title}</h1>
          <p className="text-sm text-slate-600">
            {data.cards.length} card{data.cards.length === 1 ? "" : "s"} ready —
            each prints on its own page.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Back
          </Link>
          <button
            onClick={() => window.print()}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {data.cards.map((card, i) => (
          <div key={card.id} className="print-card">
            <BingoCard
              card={card}
              title={data.title}
              label={`Card ${i + 1} of ${data.cards.length}`}
              factFontSize={data.factFontSize ?? DEFAULT_FACT_FONT_SIZE}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
