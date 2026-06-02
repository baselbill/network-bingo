import { FREE_SPACE } from "@/data/facts";

export const GRID_SIZE = 5;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE; // 25
export const CENTER_INDEX = Math.floor(CELL_COUNT / 2); // 12
export const REQUIRED_FACTS = CELL_COUNT - 1; // 24 (center is FREE SPACE)

export type BingoCard = {
  id: string;
  // Always CELL_COUNT entries, row-major. cells[freeSpaceIndex] === FREE_SPACE.
  cells: string[];
  freeSpaceIndex: number;
};

export class NotEnoughFactsError extends Error {
  constructor(available: number) {
    super(
      `Select at least ${REQUIRED_FACTS} facts to fill a 5x5 card (the center is a free space). You currently have ${available}.`,
    );
    this.name = "NotEnoughFactsError";
  }
}

/** Returns a new array shuffled with the Fisher-Yates algorithm. */
export function shuffle<T>(input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Builds a single card layout from a fact pool. */
function buildCard(
  facts: string[],
  id: string,
  freeSpaceIndex: number,
): BingoCard {
  const picked = shuffle(facts).slice(0, REQUIRED_FACTS);
  const cells: string[] = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    if (i === freeSpaceIndex) {
      cells.push(FREE_SPACE);
    } else {
      // Pull from picked, skipping the slot reserved for free space.
      cells.push(picked[i < freeSpaceIndex ? i : i - 1]);
    }
  }
  return { id, cells, freeSpaceIndex };
}

export type GenerateOptions = {
  /** When true, FREE SPACE is placed at a random cell instead of the center. */
  randomizeFreeSpace?: boolean;
};

export type GenerateResult = {
  cards: BingoCard[];
  /** Set when fewer unique cards could be produced than requested. */
  warning?: string;
};

/**
 * Generates `count` bingo cards. Each card is a 5x5 grid with FREE SPACE in the
 * center (or at a random position when `randomizeFreeSpace` is set). The
 * remaining 24 cells are a random selection/arrangement of `facts`. Cards are
 * guaranteed unique up to a capped number of retries.
 */
export function generateCards(
  facts: string[],
  count: number,
  options: GenerateOptions = {},
): GenerateResult {
  const pool = facts.filter((f) => f.trim().length > 0 && f !== FREE_SPACE);
  if (pool.length < REQUIRED_FACTS) {
    throw new NotEnoughFactsError(pool.length);
  }
  const safeCount = Math.max(0, Math.floor(count));

  const cards: BingoCard[] = [];
  const seen = new Set<string>();
  const maxAttempts = safeCount * 25 + 100;
  let attempts = 0;

  while (cards.length < safeCount && attempts < maxAttempts) {
    attempts++;
    const freeIdx = options.randomizeFreeSpace
      ? Math.floor(Math.random() * CELL_COUNT)
      : CENTER_INDEX;
    const card = buildCard(pool, `card-${cards.length + 1}`, freeIdx);
    const key = card.cells.join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    cards.push(card);
  }

  if (cards.length < safeCount) {
    return {
      cards,
      warning: `Only ${cards.length} unique card(s) could be generated from this fact pool. Add more facts to create greater variety.`,
    };
  }
  return { cards };
}
