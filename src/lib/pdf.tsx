"use client";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { FREE_SPACE } from "@/data/facts";
import { GRID_SIZE, type BingoCard } from "@/lib/bingo";
import { DEFAULT_FACT_FONT_SIZE } from "@/components/BingoCard";

// The HTML preview uses px; the PDF uses pt on a smaller A4 grid. Scale the
// configured px size down so the two stay visually consistent.
const PDF_FONT_SCALE = 0.7;

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  label: {
    fontSize: 9,
    color: "#666",
  },
  writeIn: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 12,
  },
  writeInField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  writeInLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginRight: 4,
  },
  writeInLine: {
    flex: 1,
    borderBottom: "1pt solid #94a3b8",
    height: 12,
  },
  grid: {
    flexDirection: "column",
    borderTop: "1pt solid #cbd5e1",
    borderLeft: "1pt solid #cbd5e1",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: `${100 / GRID_SIZE}%`,
    aspectRatio: 1,
    borderRight: "1pt solid #cbd5e1",
    borderBottom: "1pt solid #cbd5e1",
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    fontSize: 7.5,
    textAlign: "center",
  },
  freeCell: {
    backgroundColor: "#fefce8",
    borderColor: "#fcd34d",
  },
  freeText: {
    color: "#92400e",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textAlign: "center",
    textTransform: "uppercase",
  },
});

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function CardPage({
  card,
  title,
  label,
  factFontSize,
}: {
  card: BingoCard;
  title?: string;
  label: string;
  factFontSize: number;
}) {
  const rows = chunk(card.cells, GRID_SIZE);
  const cellFontSize = factFontSize * PDF_FONT_SCALE;
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{title || "Network Bingo"}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.writeIn}>
        <View style={styles.writeInField}>
          <Text style={styles.writeInLabel}>Name:</Text>
          <View style={styles.writeInLine} />
        </View>
        <View style={styles.writeInField}>
          <Text style={styles.writeInLabel}>Team:</Text>
          <View style={styles.writeInLine} />
        </View>
      </View>
      <View style={styles.grid}>
        {rows.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => {
              const isFree = cell === FREE_SPACE;
              return (
                <View
                  key={c}
                  style={isFree ? [styles.cell, styles.freeCell] : styles.cell}
                >
                  <Text
                    style={
                      isFree
                        ? styles.freeText
                        : [styles.cellText, { fontSize: cellFontSize }]
                    }
                  >
                    {cell}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </Page>
  );
}

function BingoDocument({
  cards,
  title,
  factFontSize,
}: {
  cards: BingoCard[];
  title?: string;
  factFontSize: number;
}) {
  return (
    <Document title={title || "Network Bingo"}>
      {cards.map((card, i) => (
        <CardPage
          key={card.id}
          card={card}
          title={title}
          label={`Card ${i + 1} of ${cards.length}`}
          factFontSize={factFontSize}
        />
      ))}
    </Document>
  );
}

/** Builds the PDF and triggers a browser download. */
export async function downloadCardsPdf(
  cards: BingoCard[],
  title?: string,
  factFontSize: number = DEFAULT_FACT_FONT_SIZE,
) {
  const blob = await pdf(
    <BingoDocument cards={cards} title={title} factFontSize={factFontSize} />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(title || "network-bingo").replace(/\s+/g, "-").toLowerCase()}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
