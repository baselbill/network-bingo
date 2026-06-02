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

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  label: {
    fontSize: 9,
    color: "#666",
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
}: {
  card: BingoCard;
  title?: string;
  label: string;
}) {
  const rows = chunk(card.cells, GRID_SIZE);
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{title || "Network Bingo"}</Text>
        <Text style={styles.label}>{label}</Text>
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
                  <Text style={isFree ? styles.freeText : styles.cellText}>
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
}: {
  cards: BingoCard[];
  title?: string;
}) {
  return (
    <Document title={title || "Network Bingo"}>
      {cards.map((card, i) => (
        <CardPage
          key={card.id}
          card={card}
          title={title}
          label={`Card ${i + 1} of ${cards.length}`}
        />
      ))}
    </Document>
  );
}

/** Builds the PDF and triggers a browser download. */
export async function downloadCardsPdf(cards: BingoCard[], title?: string) {
  const blob = await pdf(
    <BingoDocument cards={cards} title={title} />,
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
