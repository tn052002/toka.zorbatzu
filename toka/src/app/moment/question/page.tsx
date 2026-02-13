'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ScreenLayout from '@/components/ScreenLayout';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import { useI18n } from '@/lib/i18n/useI18n';

export default function QuestionPage() {
  const router = useRouter();
  const { initDraft, setQuestion } = useDraftMoment();
  const [value, setValue] = useState('');
  const { t } = useI18n();

  useEffect(() => {
    const seeded = initDraft();
    setValue(seeded.question_text ?? '');
  }, [initDraft]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    setValue(text);
    setQuestion(text);
  };

  const canContinue = value.trim().length >= 5;

  return (
    <ScreenLayout
      // eyebrow={t('eyebrow_moment')}
      title={t('question_title')}
      description={t('question_desc')}
      footer={
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/moment/domain" className="hover:text-slate-700">
            {t('question_back')}
          </Link>
          <button
            type="button"
            onClick={() => router.push('/moment/cast')}
            disabled={!canContinue}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              canContinue
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-slate-100 bg-slate-50 text-slate-400'
            }`}
          >
            {t('question_next')}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
          {t('question_label')}
        </label> */}
        <textarea
          value={value}
          onChange={handleChange}
          className="min-h-[140px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-inner"
          placeholder={t('question_placeholder')}
        />
        {/* <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/moment/domain" className="hover:text-slate-700">
            {t('question_back')}
          </Link>
          <button
            type="button"
            onClick={() => router.push('/moment/cast')}
            disabled={!canContinue}
            className={`rounded-full border px-3 py-1 ${
              canContinue
                ? 'border-slate-200 bg-white text-slate-700'
                : 'border-slate-100 bg-slate-50 text-slate-400'
            }`}
          >
            {t('question_next')}
          </button>
        </div> */}
      </div>
    </ScreenLayout>
  );
}
