import type { ReactNode } from 'react';
import './globals.css';
import Header from '@/components/Header';
import PremiumBanner from '@/components/PremiumBanner';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex flex-col">
        <Header />
        <PremiumBanner />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
