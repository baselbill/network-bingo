"use client";

import { useMemo, useState } from "react";
import { CURATED_EXTRAS, SEED_FACTS } from "@/data/facts";
import { REQUIRED_FACTS, shuffle } from "@/lib/bingo";

type Props = {
  customFacts: string[];
  setCustomFacts: React.Dispatch<React.SetStateAction<string[]>>;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
};

export function FactSelector({
  customFacts,
  setCustomFacts,
  selected,
  setSelected,
}: Props) {
  const [newFact, setNewFact] = useState("");

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // All facts shown in the picker, de-duplicated, preserving group order.
  const allFacts = useMemo(() => {
    const seen = new Set<string>();
    const result: { fact: string; group: string }[] = [];
    const push = (fact: string, group: string) => {
      const f = fact.trim();
      if (!f || seen.has(f)) return;
      seen.add(f);
      result.push({ fact: f, group });
    };
    SEED_FACTS.forEach((f) => push(f, "Event facts"));
    customFacts.forEach((f) => push(f, "Your custom facts"));
    CURATED_EXTRAS.forEach((f) => push(f, "Curated extras"));
    return result;
  }, [customFacts]);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const { fact, group } of allFacts) {
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(fact);
    }
    return map;
  }, [allFacts]);

  function toggle(fact: string) {
    setSelected((prev) =>
      prev.includes(fact) ? prev.filter((f) => f !== fact) : [...prev, fact],
    );
  }

  function selectAll() {
    setSelected(allFacts.map((f) => f.fact));
  }

  function clearAll() {
    setSelected([]);
  }

  function addCustom() {
    const f = newFact.trim();
    if (!f) return;
    if (!customFacts.includes(f) && !SEED_FACTS.includes(f)) {
      setCustomFacts((prev) => [...prev, f]);
    }
    setSelected((prev) => (prev.includes(f) ? prev : [...prev, f]));
    setNewFact("");
  }

  function drawRandomExtras(n: number) {
    const available = CURATED_EXTRAS.filter((f) => !selectedSet.has(f));
    const draw = shuffle(available).slice(0, n);
    if (draw.length === 0) return;
    setSelected((prev) => [...prev, ...draw]);
  }

  const count = selected.length;
  const enough = count >= REQUIRED_FACTS;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">1. Choose your facts</h2>
        <div
          className={[
            "rounded-full px-3 py-1 text-sm font-medium",
            enough
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800",
          ].join(" ")}
        >
          {count} selected
          {!enough && ` — need ${REQUIRED_FACTS - count} more`}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={selectAll}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          Select all
        </button>
        <button
          onClick={clearAll}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          Clear
        </button>
        <button
          onClick={() => drawRandomExtras(10)}
          className="rounded border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-100"
        >
          + Draw 10 random extras
        </button>
      </div>

      <div className="mb-5 flex gap-2">
        <input
          value={newFact}
          onChange={(e) => setNewFact(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Add your own fact, e.g. “Has met a world leader”"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
        />
        <button
          onClick={addCustom}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add
        </button>
      </div>

      <div className="space-y-5">
        {Array.from(grouped.entries()).map(([group, facts]) => (
          <div key={group}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {group}
            </h3>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {facts.map((fact) => (
                <li key={fact}>
                  <label className="flex cursor-pointer items-start gap-2 rounded border border-transparent px-2 py-1.5 text-sm hover:border-slate-200 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(fact)}
                      onChange={() => toggle(fact)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                    />
                    <span>{fact}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
