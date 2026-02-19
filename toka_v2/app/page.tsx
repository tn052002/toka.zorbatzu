'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import BreathingOrb from '@/components/BreathingOrb';

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();

  const enter = () => {
    router.push('/moment');
  };

  return (
    <main className="home-root">
      <BreathingOrb onClick={enter} ariaLabel={t('enterAria')} className="home-orb" />

      <button type="button" className="hint hint-btn" onClick={enter}>
        {t('touchToEnter')}
      </button>
    </main>
  );
}
