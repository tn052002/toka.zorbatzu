import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import PWARegister from '@/components/PWARegister';

const sans = localFont({
  src: '../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2',
  variable: '--font-sans',
  display: 'swap',
});

const serif = localFont({
  src: '../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2',
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TOKA',
  description: 'Quiet intelligence for decisions that matter.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-512.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.svg', type: 'image/svg+xml' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TOKA',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F4F1EA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} bg-bg font-sans text-text antialiased`}>
        <I18nProvider>
          <PWARegister />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
