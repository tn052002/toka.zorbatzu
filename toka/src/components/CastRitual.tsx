'use client';

import Link from 'next/link';
import { useState } from 'react';

type Mode = 'quick' | 'ritual';

const initialLines = Array.from({ length: 6 }, () => false);

export default function CastRitual() {
  const [mode, setMode] = useState<Mode>('quick');
  const [lines, setLines] = useState<boolean[]>(initialLines);

  const toggleLine = (index: number) => {
    setLines((current) =>
      current.map((value, idx) => (idx === index ? !value : value)),
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex rounded-full border border-slate-200 bg-white p-1 text-xs text-slate-500">
        {(['quick', 'ritual'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={`flex-1 rounded-full px-3 py-2 capitalize transition ${
              mode === option ? 'bg-slate-900 text-white' : 'text-slate-500'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {mode === 'quick' ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          Tap to cast all six lines at once. The hexagram will appear instantly.
          <button
            type="button"
            className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
          >
            Quick cast
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {lines.map((isYang, index) => (
              <button
                key={`line-${index}`}
                type="button"
                onClick={() => toggleLine(index)}
                className="flex min-h-[80px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-600"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Line {index + 1}
                </span>
                <span className="mt-2 inline-flex h-2 w-10 rounded-full bg-slate-200" />
                <span className="mt-2 text-xs">
                  {isYang ? 'Yang — unbroken' : 'Yin — broken'}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Tap each line to flip between yin and yang. Start from the bottom.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link href="/moment/question" className="hover:text-slate-700">
          Back
        </Link>
        <Link
          href="/moment/result"
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700"
        >
          Result
        </Link>
      </div>
    </div>
  );
}
