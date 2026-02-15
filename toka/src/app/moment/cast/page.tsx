'use client';

import Link from 'next/link';
import CastRitual from '@/components/CastRitual';
import ScreenLayout from '@/components/ScreenLayout';
import { useI18n } from '@/lib/i18n/useI18n';

export default function CastPage() {
  const { t } = useI18n();

  return (
    <ScreenLayout
      // eyebrow={t('eyebrow_moment')}
      title={t('cast_title')}
      // description={t('cast_desc')}
      footer= {
      <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/moment/domain" className="hover:text-slate-700">
            {t('cast_back')}
          </Link>
          
        </div>
      }
    >
      <CastRitual />
    </ScreenLayout>
  );
}
