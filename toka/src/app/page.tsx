'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ScreenLayout from '@/components/ScreenLayout';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import { loadDraft } from '@/lib/moment/storage';

export default function Home() {
  const { resetDraft } = useDraftMoment();
  const router = useRouter();
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    setHasDraft(Boolean(loadDraft()));
  }, []);

  return (
    <ScreenLayout
      title="Start a moment"
      description="Move through a short flow designed for calm clarity."
    >
      <div className="space-y-4">
        <Link
          href="/moment/domain"
          onClick={() => resetDraft()}
          className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-4 text-sm text-slate-700"
        >
          <span>Start a new Moment</span>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Go</span>
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
          Revisit last Moment
        </button>
        <div className="rounded-2xl border border-slate-200/60 bg-slate-50 px-4 py-4 text-xs text-slate-500">
          No login. Just a quiet place to gather and respond.
        </div>
      </div>
    </ScreenLayout>
  );
}
