 'use client';

import { useI18n } from '@/lib/i18n';

export default function MomentPage() {
  const { t } = useI18n();

  return (
    <main className="moment-root">
      {t('momentEntry')}
    </main>
  );
}
