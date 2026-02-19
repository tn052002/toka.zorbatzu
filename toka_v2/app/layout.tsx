import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

export const metadata: Metadata = {
  title: 'TOKA v2',
  description: 'Breathing orb entry',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <AppHeader />
          {children}
          <AppFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
