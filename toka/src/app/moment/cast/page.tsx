'use client';

import CastRitual from '@/components/CastRitual';
import ScreenLayout from '@/components/ScreenLayout';
import { useI18n } from '@/lib/i18n/useI18n';

export default function CastPage() {
  const { t } = useI18n();

  return (
    <ScreenLayout
      eyebrow={t('eyebrow_moment')}
      title={t('cast_title')}
      description={t('cast_desc')}
    >
      <CastRitual />
    </ScreenLayout>
  );
}
