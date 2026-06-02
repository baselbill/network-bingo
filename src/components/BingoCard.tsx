import { FREE_SPACE } from "@/data/facts";
import { GRID_SIZE, type BingoCard as BingoCardType } from "@/lib/bingo";

export const DEFAULT_FACT_FONT_SIZE = 11;

type Props = {
  card: BingoCardType;
  title?: string;
  /** Sequence label shown on the card, e.g. "Card 3 of 30". */
  label?: string;
  /** Font size (px) used for the fact text in each cell. */
  factFontSize?: number;
};

/** Renders a single 5x5 bingo card for on-screen preview and printing. */
export function BingoCard({
  card,
  title,
  label,
  factFontSize = DEFAULT_FACT_FONT_SIZE,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[680px] rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      {(title || label) && (
        <div className="mb-3 flex items-baseline justify-between gap-2">
          {title && (
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          )}
          {label && <span className="text-xs text-slate-500">{label}</span>}
        </div>
      )}

      {/* Write-in area for the player to fill in by hand. */}
      <div className="mb-3 flex gap-6 text-sm">
        <div className="flex flex-1 items-end gap-1.5">
          <span className="font-medium text-slate-700">Name:</span>
          <span className="flex-1 border-b border-slate-400">&nbsp;</span>
        </div>
        <div className="flex flex-1 items-end gap-1.5">
          <span className="font-medium text-slate-700">Team:</span>
          <span className="flex-1 border-b border-slate-400">&nbsp;</span>
        </div>
      </div>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {card.cells.map((cell, i) => {
          const isFree = cell === FREE_SPACE;
          return (
            <div
              key={i}
              className={[
                "flex aspect-square items-center justify-center rounded border p-1 text-center leading-tight",
                isFree
                  ? "border-amber-300 bg-amber-50 font-bold text-amber-700"
                  : "border-slate-300 bg-white text-slate-800",
              ].join(" ")}
            >
              {isFree ? (
                <span className="flex flex-col items-center gap-0.5 uppercase tracking-wide">
                  <span className="text-base leading-none">★</span>
                  <span>Free</span>
                  <span>Space</span>
                </span>
              ) : (
                <span
                  className="line-clamp-6"
                  style={{ fontSize: `${factFontSize}px` }}
                >
                  {cell}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
