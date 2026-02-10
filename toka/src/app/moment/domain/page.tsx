'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ScreenLayout from '@/components/ScreenLayout';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import type { Domain } from '@/lib/moment/types';
import { useI18n } from '@/lib/i18n/useI18n';

export default function DomainPage() {
  const router = useRouter();
  const { draft, initDraft, setDomain } = useDraftMoment();
  const [otherText, setOtherText] = useState('');
  const { t } = useI18n();

  const domains: Array<{ label: string; value: Domain }> = [
    { label: t('domain_work'), value: 'work' },
    { label: t('domain_money'), value: 'money' },
    { label: t('domain_relationship'), value: 'relationship' },
    { label: t('domain_health'), value: 'health' },
    { label: t('domain_project'), value: 'project' },
    { label: t('domain_inner'), value: 'inner' },
  ];

  useEffect(() => {
    const seeded = initDraft();
    if (seeded.domain === 'other') {
      setOtherText(seeded.domain_other_text ?? '');
    }
  }, [initDraft]);

  const handleSelect = (value: Domain) => {
    if (value === 'other') {
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

  const isOtherSelected = draft?.domain === 'other';
  const canContinue = draft?.domain !== null;

  return (
    <ScreenLayout
      eyebrow={t('eyebrow_moment')}
      title={t('domain_title')}
      description={t('domain_desc')}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {domains.map((domain) => (
            <button
              key={domain.value}
              type="button"
              onClick={() => handleSelect(domain.value)}
              className={`rounded-2xl border px-3 py-4 text-left ${
                draft?.domain === domain.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {domain.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSelect('other')}
            className={`col-span-2 rounded-2xl border px-3 py-4 text-left ${
              isOtherSelected
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-dashed border-slate-300 bg-slate-50 text-slate-500'
            }`}
          >
            {t('domain_other')}
          </button>
        </div>

        {isOtherSelected ? (
          <input
            value={otherText}
            onChange={handleOtherChange}
            placeholder={t('domain_other_placeholder')}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
          />
        ) : null}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            {t('domain_back')}
          </Link>
          <button
            type="button"
            onClick={() => router.push('/moment/question')}
            disabled={!canContinue}
            className={`rounded-full border px-3 py-1 ${
              canContinue
                ? 'border-slate-200 bg-white text-slate-700'
                : 'border-slate-100 bg-slate-50 text-slate-400'
            }`}
          >
            {t('domain_next')}
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
}
