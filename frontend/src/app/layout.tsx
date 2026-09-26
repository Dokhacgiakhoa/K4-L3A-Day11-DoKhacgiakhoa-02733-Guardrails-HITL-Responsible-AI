import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VinBank AI Security — Cyber Battle Arena 2077',
  description: 'Gamified Red vs Blue Cyber Warfare Arena & Guardrails Pipeline for VinBank Lab Day 11',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,600;0,700;1,700&family=JetBrains+Mono:wght@400;600;700;800&family=Orbitron:wght@500;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050811] text-gray-100 min-h-screen antialiased select-none font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}
