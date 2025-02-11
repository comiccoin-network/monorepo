import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext"; // This will now correctly resolve
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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
