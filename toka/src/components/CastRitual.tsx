'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { castLineValue, castQuickValues, computeCastResult } from '@/lib/iching/cast';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import type { LineValue } from '@/lib/iching';

type Mode = 'quick' | 'ritual';

const describeLine = (value: LineValue) => {
  const isYang = value === 7 || value === 9;
  const changing = value === 6 || value === 9;
  return {
    label: isYang ? 'Yang — unbroken' : 'Yin — broken',
    changing,
  };
};

export default function CastRitual() {
  const router = useRouter();
  const { initDraft, setCastMode, setCastResult, setLines, clearCastResult } =
    useDraftMoment();
  const [mode, setMode] = useState<Mode>('quick');
  const [ritualLines, setRitualLines] = useState<LineValue[]>([]);

  useEffect(() => {
    const seeded = initDraft();
    if (seeded.cast_mode) {
      setMode(seeded.cast_mode);
    }
    if (seeded.lines && seeded.lines.length > 0) {
      setRitualLines(seeded.lines as LineValue[]);
    }
  }, [initDraft]);

  const nextIndex = ritualLines.length;
  const ritualComplete = ritualLines.length === 6;

  const handleQuickCast = () => {
    const lines = castQuickValues();
    const result = computeCastResult(lines);
    setCastMode('quick');
    setCastResult(result);
    router.push('/moment/result');
  };

  const handleFlip = (index: number) => {
    if (index !== ritualLines.length || ritualComplete) {
      return;
    }
    const nextValue = castLineValue();
    setRitualLines((current) => {
      const next = [...current, nextValue];
      setLines(next);
      return next;
    });
  };

  const handleRitualReset = () => {
    setRitualLines([]);
    setCastMode('ritual');
    clearCastResult();
    setLines([]);
  };

  const ritualResult = useMemo(() => {
    if (!ritualComplete) {
      return null;
    }
    return computeCastResult(ritualLines);
  }, [ritualComplete, ritualLines]);

  const handleRitualComplete = () => {
    if (!ritualResult) {
      return;
    }
    setCastMode('ritual');
    setCastResult(ritualResult);
    router.push('/moment/result');
  };

  return (
    <div className="space-y-5">
      <div className="flex rounded-full border border-slate-200 bg-white p-1 text-xs text-slate-500">
        {(['quick', 'ritual'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMode(option);
              setCastMode(option);
            }}
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
            onClick={handleQuickCast}
            className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
          >
            Quick cast
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }, (_, index) => {
              const value = ritualLines[index];
              const status = value ? describeLine(value) : null;
              const isActive = index === nextIndex && !ritualComplete;
              return (
                <button
                  key={`line-${index}`}
                  type="button"
                  onClick={() => handleFlip(index)}
                  className={`flex min-h-[90px] flex-col items-center justify-center rounded-2xl border px-3 py-3 text-xs ${
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                    Line {index + 1}
                  </span>
                  <span className="mt-2 inline-flex h-2 w-10 rounded-full bg-slate-200" />
                  <span className="mt-2 text-xs">
                    {status ? status.label : isActive ? 'Tap to cast' : 'Awaiting'}
                  </span>
                  {status?.changing ? (
                    <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-slate-300">
                      Changing
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRitualReset}
              className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
            >
              Reset ritual
            </button>
            <button
              type="button"
              onClick={handleRitualComplete}
              disabled={!ritualComplete}
              className={`flex-1 rounded-full px-3 py-2 text-xs ${
                ritualComplete ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              Reveal result
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Tap each line from the bottom. Each tap reveals the next line.
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
