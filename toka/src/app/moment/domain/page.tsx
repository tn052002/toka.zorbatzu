'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ScreenLayout from '@/components/ScreenLayout';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import type { Domain } from '@/lib/moment/types';

const domains: Array<{ label: string; value: Domain }> = [
  { label: 'Work', value: 'work' },
  { label: 'Money', value: 'money' },
  { label: 'Relationship', value: 'relationship' },
  { label: 'Health', value: 'health' },
  { label: 'Project', value: 'project' },
  { label: 'Inner life', value: 'inner' },
];

export default function DomainPage() {
  const router = useRouter();
  const { draft, initDraft, setDomain } = useDraftMoment();
  const [otherText, setOtherText] = useState('');

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
      eyebrow="Moment"
      title="Name the domain"
      description="Pick the space that holds your attention."
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
            Other domain...
          </button>
        </div>

        {isOtherSelected ? (
          <input
            value={otherText}
            onChange={handleOtherChange}
            placeholder="Describe the domain in your own words."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
          />
        ) : null}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            Back home
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
            Question
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
}
