// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "NeighborLink",
  description: "Buy, sell, and connect with your neighborhood.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <Header />
        {children}
      </body>
    </html>
  );
}
