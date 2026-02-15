'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import { loadDraft } from '@/lib/moment/storage';
import { useI18n } from '@/lib/i18n/useI18n';

export default function Home() {
  const { resetDraft } = useDraftMoment();
  const router = useRouter();
  const [hasDraft, setHasDraft] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const draft = loadDraft();
    const resumable = Boolean(
      draft &&
        (draft.domain ||
          (draft.question_text && draft.question_text.trim().length > 0) ||
          typeof draft.primary_hex_id === 'number'),
    );
    setHasDraft(resumable);
  }, []);

  return (
    <main className="flex min-h-[60vh] flex-1 flex-col pt-16">
      <div className="space-y-3">
      <Link
        href="/moment/domain"
        onClick={() => resetDraft()}
        className="block rounded-2xl bg-slate-900 px-5 py-4 text-sm text-white shadow-sm transition hover:bg-slate-800"
      >
        {t('home_start')}
      </Link>

      {hasDraft && (
        <button
          type="button"
          onClick={() => router.push('/moment/result')}
          className="text-sm text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700 px-5"
        >
          {t('home_revisit')}
        </button>
      )}
      </div>

      <p className="mt-8 text-[11px] text-slate-400 text-center">
        {t('home_no_login')}
      </p>
    </main>
  );

}
