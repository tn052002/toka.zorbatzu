'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { castLineValue, castQuickValues, computeCastResult } from '@/lib/iching/cast';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import type { LineValue } from '@/lib/iching';
import LoadingModal from '@/components/LoadingModal';
import { buildInterpretInput, requestInterpretation } from '@/lib/interpret/client';
import { useI18n } from '@/lib/i18n/useI18n';

type Mode = 'quick' | 'ritual';

export default function CastRitual() {
  const router = useRouter();
  const {
    initDraft,
    setCastMode,
    setCastResult,
    setLines,
    clearCastResult,
    setAiOutput,
    setAiStatus,
  } = useDraftMoment();
  const [mode, setMode] = useState<Mode>('quick');
  const [ritualLines, setRitualLines] = useState<LineValue[]>([]);
  const [loading, setLoading] = useState(false);
  const { lang, t } = useI18n();

  const describeLine = (value: LineValue) => {
    const isYang = value === 7 || value === 9;
    const changing = value === 6 || value === 9;
    return {
      label: isYang ? t('cast_yang') : t('cast_yin'),
      changing,
    };
  };

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

  const handleQuickCast = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const lines = castQuickValues();
    const result = computeCastResult(lines);
    setCastMode('quick');
    const nextDraft = setCastResult(result);
    const input = buildInterpretInput(nextDraft, lang);
    if (input) {
      setAiStatus('loading');
      try {
        const output = await requestInterpretation(input);
        if (output) {
          setAiOutput(output);
        } else {
          setAiStatus('error');
        }
      } catch {
        setAiStatus('error');
      }
    } else {
      setAiStatus('error');
    }
    setLoading(false);
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

  const handleRitualComplete = async () => {
    if (!ritualResult) {
      return;
    }
    if (loading) {
      return;
    }
    setLoading(true);
    setCastMode('ritual');
    const nextDraft = setCastResult(ritualResult);
    const input = buildInterpretInput(nextDraft, lang);
    if (input) {
      setAiStatus('loading');
      try {
        const output = await requestInterpretation(input);
        if (output) {
          setAiOutput(output);
        } else {
          setAiStatus('error');
        }
      } catch {
        setAiStatus('error');
      }
    } else {
      setAiStatus('error');
    }
    setLoading(false);
    router.push('/moment/result');
  };

  return (
    <div className="space-y-5">
      <LoadingModal open={loading} text={t('loading_reflecting')} />
      <div className="flex rounded-full border border-slate-200 bg-white p-1 text-xs text-slate-500">
        {(['quick', 'ritual'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMode(option);
              setCastMode(option);
            }}
            disabled={loading}
            className={`flex-1 rounded-full px-3 py-2 transition ${
              mode === option ? 'bg-slate-900 text-white' : 'text-slate-500'
            }`}
          >
            {option === 'quick' ? t('cast_quick') : t('cast_ritual')}
          </button>
        ))}
      </div>

      {mode === 'quick' ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          {t('cast_quick_text')}
          <button
            type="button"
            onClick={handleQuickCast}
            disabled={loading}
            className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-sm text-white disabled:bg-slate-400"
          >
            {t('cast_quick_button')}
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
                  disabled={loading}
                  className={`flex min-h-[90px] flex-col items-center justify-center rounded-2xl border px-3 py-3 text-xs ${
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                    {t('cast_line')} {index + 1}
                  </span>
                  <span className="mt-2 inline-flex h-2 w-10 rounded-full bg-slate-200" />
                  <span className="mt-2 text-xs">
                    {status ? status.label : isActive ? t('cast_tap') : t('cast_waiting')}
                  </span>
                  {status?.changing ? (
                    <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-slate-300">
                      {t('cast_changing')}
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
              disabled={loading}
              className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
            >
              {t('cast_reset')}
            </button>
            <button
              type="button"
              onClick={handleRitualComplete}
              disabled={!ritualComplete || loading}
              className={`flex-1 rounded-full px-3 py-2 text-xs ${
                ritualComplete && !loading
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {t('cast_reveal')}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {t('cast_hint')}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/moment/question"
          className={`hover:text-slate-700 ${loading ? 'pointer-events-none opacity-50' : ''}`}
        >
          {t('cast_back')}
        </Link>
        <button
          type="button"
          onClick={() => router.push('/moment/result')}
          disabled={loading}
          className={`rounded-full border px-3 py-1 ${
            loading
              ? 'border-slate-100 bg-slate-50 text-slate-400'
              : 'border-slate-200 bg-white text-slate-700'
          }`}
        >
          {t('cast_result')}
        </button>
      </div>
    </div>
  );
}
