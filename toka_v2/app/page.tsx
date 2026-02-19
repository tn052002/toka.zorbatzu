'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();

  const enter = () => {
    router.push('/moment');
  };

  return (
    <main className="home-root">
      <button
        type="button"
        aria-label={t('enterAria')}
        className="orb-button"
        onClick={enter}
      >
        <span className="orb-halo" />
        <span className="orb-core" />
      </button>

      <p className="hint">{t('touchToEnter')}</p>
    </main>
  );
}
