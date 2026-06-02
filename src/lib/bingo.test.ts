import { describe, expect, it } from "vitest";
import { FREE_SPACE, SEED_FACTS } from "@/data/facts";
import {
  CELL_COUNT,
  CENTER_INDEX,
  generateCards,
  NotEnoughFactsError,
  REQUIRED_FACTS,
} from "@/lib/bingo";

describe("generateCards", () => {
  it("throws when there are fewer than the required number of facts", () => {
    expect(() => generateCards(SEED_FACTS.slice(0, 5), 3)).toThrow(
      NotEnoughFactsError,
    );
  });

  it("produces cards with 25 cells and FREE SPACE in the center", () => {
    const { cards } = generateCards(SEED_FACTS, 5);
    expect(cards).toHaveLength(5);
    for (const card of cards) {
      expect(card.cells).toHaveLength(CELL_COUNT);
      expect(card.cells[CENTER_INDEX]).toBe(FREE_SPACE);
      // No fact other than the center should be FREE SPACE.
      const frees = card.cells.filter((c) => c === FREE_SPACE);
      expect(frees).toHaveLength(1);
      // Non-center cells are unique within a card.
      const others = card.cells.filter((_, i) => i !== CENTER_INDEX);
      expect(new Set(others).size).toBe(REQUIRED_FACTS);
    }
  });

  it("generates unique card layouts", () => {
    const { cards } = generateCards(SEED_FACTS, 30);
    const keys = new Set(cards.map((c) => c.cells.join("|")));
    expect(keys.size).toBe(cards.length);
  });

  it("works with exactly the required number of facts", () => {
    const { cards, warning } = generateCards(
      SEED_FACTS.slice(0, REQUIRED_FACTS),
      10,
    );
    expect(cards).toHaveLength(10);
    expect(warning).toBeUndefined();
    const keys = new Set(cards.map((c) => c.cells.join("|")));
    expect(keys.size).toBe(10);
  });
});
