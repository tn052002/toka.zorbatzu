'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ScreenLayout from '@/components/ScreenLayout';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import type { Domain } from '@/lib/moment/types';
import { useI18n } from '@/lib/i18n/useI18n';

export default function DomainPage() {
  const router = useRouter();
  const { draft, initDraft, setDomain } = useDraftMoment();
  const [otherText, setOtherText] = useState('');
  const { t } = useI18n();

  const domains: Array<{ label: string; value: Domain }> = useMemo(
    () => [
      { label: t('domain_work'), value: 'work' },
      { label: t('domain_money'), value: 'money' },
      { label: t('domain_relationship'), value: 'relationship' },
      { label: t('domain_health'), value: 'health' },
      { label: t('domain_project'), value: 'project' },
      { label: t('domain_inner'), value: 'inner' },
    ],
    [t]
  );

  useEffect(() => {
    const seeded = initDraft();
    if (seeded.domain === 'other') {
      setOtherText(seeded.domain_other_text ?? '');
    }
  }, [initDraft]);

  const isOtherSelected = draft?.domain === 'other';
  const canContinueOther = isOtherSelected && otherText.trim().length > 0;

  const handleSelect = (value: Domain) => {
    if (value === 'other') {
      // Select other and let user type, no auto-advance.
      setDomain('other', otherText);
      return;
    }

    setDomain(value);
    router.push('/moment/question');
  };

  const handleOtherChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOtherText(value);
    setDomain('other', value);
  };

  return (
    <ScreenLayout
      // Recommendation: drop eyebrow here for a cleaner, more premium feel.
      // eyebrow={t('eyebrow_moment')}
      title={t('domain_title')}
      description={t('domain_desc')}
      footer={
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            {t('domain_back')}
          </Link>

          {/* Only show Next when Other is selected */}
          {isOtherSelected ? (
            <button
              type="button"
              onClick={() => router.push('/moment/question')}
              disabled={!canContinueOther}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                canContinueOther
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'border-slate-100 bg-slate-50 text-slate-400'
              }`}
            >
              {t('domain_next')}
            </button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {domains.map((domain) => (
            <button
              key={domain.value}
              type="button"
              onClick={() => handleSelect(domain.value)}
              className={`rounded-2xl border px-4 py-4 text-left text-sm transition
                hover:bg-slate-50 active:scale-[0.99]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40
                ${
                  draft?.domain === domain.value
                    ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
            >
              {domain.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => handleSelect('other')}
            className={`col-span-2 rounded-2xl border px-4 py-4 text-left text-sm transition
              hover:bg-slate-50 active:scale-[0.99]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40
              ${
                isOtherSelected
                  ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
          >
            {t('domain_other')}
          </button>
        </div>

        {isOtherSelected ? (
          <input
            autoFocus
            value={otherText}
            onChange={handleOtherChange}
            placeholder={t('domain_other_placeholder')}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700
              focus:outline-none focus:ring-2 focus:ring-slate-400/30"
          />
        ) : null}
      </div>
    </ScreenLayout>
  );
}
