'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ScreenLayout from '@/components/ScreenLayout';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';

export default function QuestionPage() {
  const router = useRouter();
  const { initDraft, setQuestion } = useDraftMoment();
  const [value, setValue] = useState('');

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
      eyebrow="Moment"
      title="Ask the core question"
      description="Write a single question you can carry gently."
    >
      <div className="space-y-4">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Question
        </label>
        <textarea
          value={value}
          onChange={handleChange}
          className="min-h-[140px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-inner"
          placeholder="What would make this choice feel aligned three weeks from now?"
        />
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/moment/domain" className="hover:text-slate-700">
            Back
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
            Cast
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
}
