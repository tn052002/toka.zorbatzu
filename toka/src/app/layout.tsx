import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import HeaderBar from '@/components/HeaderBar';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TOKA',
  description: 'A calm, mobile-first moment companion.',
  applicationName: 'TOKA',
  manifest: '/manifest.webmanifest',
  themeColor: '#0f172a',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${sourceSans.variable} min-h-screen bg-[radial-gradient(1400px_circle_at_top,_#ffffff,_#f1f5f9_55%,_#e2e8f0_100%)] font-[var(--font-source-sans)] text-slate-900`}
      >
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-16 pt-10">
          <HeaderBar />
          {children}
        </div>
      </body>
    </html>
  );
}
