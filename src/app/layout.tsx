import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Network Bingo Generator",
  description:
    "Create and print randomized Human/Network Bingo cards for your icebreaker event.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
