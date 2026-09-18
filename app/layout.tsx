import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nostalgia Music',
  description: 'A single-page nostalgia music stream featuring a floating glass vinyl player, atmospheric background scenery, and YouTube playlist audio.',
  openGraph: {
    title: 'Nostalgia Music',
    description: 'A single-page nostalgia music stream featuring a floating glass vinyl player, atmospheric background scenery, and YouTube playlist audio.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: '#08080a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#08080a] text-[#f3f4f6] min-h-dvh overflow-hidden select-none">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
