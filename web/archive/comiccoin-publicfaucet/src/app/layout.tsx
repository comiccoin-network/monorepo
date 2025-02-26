// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/layout.tsx
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ComicCoin Faucet",
  description: "Turn your comic books into digital gold with ComicCoin",
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
