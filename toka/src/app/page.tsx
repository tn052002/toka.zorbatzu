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
    >
      <div className="space-y-4">
        <Link
          href="/moment/domain"
          onClick={() => resetDraft()}
          className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-4 text-sm text-slate-700"
        >
          <span>{t('home_start')}</span>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {t('home_go')}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => router.push('/moment/result')}
          disabled={!hasDraft}
          className={`w-full rounded-2xl border px-4 py-3 text-xs ${
            hasDraft
              ? 'border-slate-200/70 bg-white text-slate-500'
              : 'border-slate-100 bg-slate-50 text-slate-400'
          }`}
        >
          {t('home_revisit')}
        </button>
        <div className="rounded-2xl border border-slate-200/60 bg-slate-50 px-4 py-4 text-xs text-slate-500">
          {t('home_no_login')}
        </div>
      </div>
    </ScreenLayout>
  );
}
