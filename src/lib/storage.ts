"use client";

import { useEffect, useState } from "react";

/**
 * A small useState wrapper that persists the value to localStorage under `key`.
 * SSR-safe: it reads from storage only after mount to avoid hydration mismatch.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Ignore malformed/unavailable storage and keep the initial value.
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be full or disabled; fail silently.
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}

export const STORAGE_KEYS = {
  selected: "bingo:selectedFacts",
  custom: "bingo:customFacts",
  count: "bingo:cardCount",
  title: "bingo:title",
  cards: "bingo:generatedCards",
} as const;
