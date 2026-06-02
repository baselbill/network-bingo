"use client";

import { useMemo, useState } from "react";
import { CURATED_EXTRAS, FUNNY_FACTS, RARE_FACTS, SEED_FACTS } from "@/data/facts";
import { REQUIRED_FACTS, shuffle } from "@/lib/bingo";
import { STORAGE_KEYS, usePersistentState } from "@/lib/storage";

type Props = {
  customFacts: string[];
  setCustomFacts: React.Dispatch<React.SetStateAction<string[]>>;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
};

/** A user-saved, named collection of selected facts. */
type SavedList = { name: string; facts: string[] };

// All built-in facts, used to decide which loaded facts need to become
// "custom" entries so they render as checkboxes.
const BUILT_IN_FACTS = new Set([
  ...SEED_FACTS,
  ...CURATED_EXTRAS,
  ...RARE_FACTS,
  ...FUNNY_FACTS,
]);

type Group = {
  name: string;
  facts: string[];
  defaultOpen: boolean;
};

const STATIC_GROUPS: Group[] = [
  { name: "Event facts", facts: SEED_FACTS, defaultOpen: true },
  { name: "Curated extras", facts: CURATED_EXTRAS, defaultOpen: false },
  { name: "Rare & unusual", facts: RARE_FACTS, defaultOpen: false },
  { name: "Funny & quirky", facts: FUNNY_FACTS, defaultOpen: false },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function FactSelector({
  customFacts,
  setCustomFacts,
  selected,
  setSelected,
}: Props) {
  const [newFact, setNewFact] = useState("");
  const [listName, setListName] = useState("");
  const [savedLists, setSavedLists] = usePersistentState<SavedList[]>(
    STORAGE_KEYS.savedLists,
    [],
  );
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(STATIC_GROUPS.filter((g) => g.defaultOpen).map((g) => g.name)),
  );

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const groups: Group[] = useMemo(() => {
    const base = STATIC_GROUPS.map((g) => ({ ...g }));
    if (customFacts.length > 0) {
      base.splice(1, 0, {
        name: "Your custom facts",
        facts: customFacts,
        defaultOpen: true,
      });
    }
    return base;
  }, [customFacts]);

  const allFacts = useMemo(
    () => [...new Set(groups.flatMap((g) => g.facts))],
    [groups],
  );

  function toggleGroup(name: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function toggle(fact: string) {
    setSelected((prev) =>
      prev.includes(fact) ? prev.filter((f) => f !== fact) : [...prev, fact],
    );
  }

  function selectAll() {
    setSelected(allFacts);
  }

  function clearAll() {
    setSelected([]);
  }

  function addCustom() {
    // Accept one fact per line so users can paste a whole batch at once.
    const lines = newFact
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const toAdd = lines.filter(
      (f, i) =>
        lines.indexOf(f) === i && // de-dupe within the pasted batch
        !customFacts.includes(f) &&
        !BUILT_IN_FACTS.has(f),
    );
    if (toAdd.length > 0) {
      setCustomFacts((prev) => [...prev, ...toAdd]);
      setOpenGroups((prev) => new Set([...prev, "Your custom facts"]));
    }
    // Select every entered fact (existing or new).
    setSelected((prev) => {
      const set = new Set(prev);
      lines.forEach((f) => set.add(f));
      return [...set];
    });
    setNewFact("");
  }

  function drawRandom(n: number) {
    const available = allFacts.filter((f) => !selectedSet.has(f));
    const draw = shuffle(available).slice(0, n);
    if (draw.length > 0) setSelected((prev) => [...prev, ...draw]);
  }

  function saveCurrentList() {
    const name = listName.trim();
    if (!name || selected.length === 0) return;
    setSavedLists((prev) => {
      const without = prev.filter((l) => l.name !== name);
      return [...without, { name, facts: [...selected] }];
    });
    setListName("");
  }

  function loadList(list: SavedList) {
    // Any saved fact that isn't built-in must become a custom entry so it
    // shows up as a checkbox after loading.
    const unknown = list.facts.filter(
      (f) => !BUILT_IN_FACTS.has(f) && !customFacts.includes(f),
    );
    if (unknown.length > 0) {
      setCustomFacts((prev) => [...prev, ...unknown]);
      setOpenGroups((prev) => new Set([...prev, "Your custom facts"]));
    }
    setSelected([...list.facts]);
  }

  function deleteList(name: string) {
    setSavedLists((prev) => prev.filter((l) => l.name !== name));
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
          onClick={() => drawRandom(10)}
          className="rounded border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-100"
        >
          + Draw 10 random
        </button>
      </div>

      <div className="mb-5">
        <textarea
          value={newFact}
          onChange={(e) => setNewFact(e.target.value)}
          onKeyDown={(e) => {
            // Ctrl/Cmd+Enter adds; plain Enter inserts a new line.
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              addCustom();
            }
          }}
          rows={3}
          placeholder={
            'Add your own facts — one per line, e.g.\n"Has met a world leader"\n"Can ride a unicycle"'
          }
          className="w-full resize-y rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            One fact per line. Press Ctrl/⌘ + Enter to add.
          </span>
          <button
            onClick={addCustom}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add facts
          </button>
        </div>
      </div>

      {/* Saved lists: save the current selection under a name and reload it. */}
      <div className="mb-5 rounded border border-slate-200 bg-slate-50 p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Saved lists
        </h3>
        <div className="flex gap-2">
          <input
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveCurrentList()}
            placeholder="Name this list, e.g. “Sales kickoff 2026”"
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
          <button
            onClick={saveCurrentList}
            disabled={!listName.trim() || selected.length === 0}
            className="rounded border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save current ({selected.length})
          </button>
        </div>
        {savedLists.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {savedLists.map((list) => (
              <li
                key={list.name}
                className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-sm"
              >
                <span className="truncate">
                  <span className="font-medium">{list.name}</span>
                  <span className="ml-1.5 text-xs text-slate-400">
                    {list.facts.length} facts
                  </span>
                </span>
                <span className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => loadList(list)}
                    className="rounded border border-slate-200 px-2 py-0.5 text-xs hover:bg-slate-100"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteList(list.name)}
                    className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-1">
        {groups.map((group) => {
          const isOpen = openGroups.has(group.name);
          const groupSelected = group.facts.filter((f) => selectedSet.has(f)).length;

          function selectGroupAll() {
            setSelected((prev) => [
              ...prev,
              ...group.facts.filter((f) => !prev.includes(f)),
            ]);
          }
          function clearGroup() {
            setSelected((prev) => prev.filter((f) => !group.facts.includes(f)));
          }

          return (
            <div key={group.name} className="rounded border border-slate-200">
              <button
                onClick={() => toggleGroup(group.name)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  {group.name}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                    {groupSelected}/{group.facts.length}
                  </span>
                </span>
                <ChevronIcon open={isOpen} />
              </button>

              {isOpen && (
                <div className="border-t border-slate-200 px-3 pb-3 pt-2">
                  <div className="mb-2 flex gap-2">
                    <button
                      onClick={selectGroupAll}
                      className="rounded border border-slate-200 px-2 py-0.5 text-xs hover:bg-slate-100"
                    >
                      All
                    </button>
                    <button
                      onClick={clearGroup}
                      className="rounded border border-slate-200 px-2 py-0.5 text-xs hover:bg-slate-100"
                    >
                      None
                    </button>
                  </div>
                  <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {group.facts.map((fact) => (
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
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
