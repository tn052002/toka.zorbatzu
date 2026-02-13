'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ScreenLayout from '@/components/ScreenLayout';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import { loadDraft } from '@/lib/moment/storage';
import { useI18n } from '@/lib/i18n/useI18n';

export default function Home() {
  const { resetDraft } = useDraftMoment();
  const router = useRouter();
  const [hasDraft, setHasDraft] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setHasDraft(Boolean(loadDraft()));
  }, []);

  return (
  <ScreenLayout
    title={t('home_title')}
    description={t('home_desc')}
    variant="default"
    tone="glass"
  >
    <div className="space-y-4">

      {/* PRIMARY CTA */}
      <Link
        href="/moment/domain"
        onClick={() => resetDraft()}
        className="flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-4 text-sm text-white shadow-sm transition hover:bg-slate-800"
      >
        <span>{t('home_start')}</span>
        <span className="text-lg">→</span>
      </Link>

      {/* SECONDARY */}
      {hasDraft && (
        <button
          type="button"
          onClick={() => router.push('/moment/result')}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
        >
          {t('home_revisit')}
        </button>
      )}

      {/* WHISPER NOTE */}
      <p className="pt-2 text-center text-xs text-slate-500">
        {t('home_no_login')}
      </p>

    </div>
  </ScreenLayout>
);

}
