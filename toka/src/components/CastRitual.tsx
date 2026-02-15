'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [displayLines, setDisplayLines] = useState<LineValue[]>([]);
  const [isComputingLine, setIsComputingLine] = useState(false);
  const [loading, setLoading] = useState(false);
  const quickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initializedRef = useRef(false);
  const { lang, t } = useI18n();

  const describeLine = (value: LineValue) => {
    if (value === 7) {
      return t('cast_line_value_yang');
    }
    if (value === 8) {
      return t('cast_line_value_yin');
    }
    if (value === 9) {
      return t('cast_line_value_yang_changing');
    }
    return t('cast_line_value_yin_changing');
  };

  useEffect(() => {
    return () => {
      if (quickTimerRef.current) {
        clearInterval(quickTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    const seeded = initDraft();
    if (seeded.cast_mode) {
      setMode(seeded.cast_mode);
    }
    if (seeded.lines && seeded.lines.length > 0) {
      setDisplayLines(seeded.lines as LineValue[]);
    }
  }, [initDraft]);

  const ritualComplete = displayLines.length === 6;
  const hasStarted = displayLines.length > 0;

  const startQuickReveal = () => {
    if (loading || isComputingLine || hasStarted) {
      return;
    }
    if (quickTimerRef.current) {
      clearInterval(quickTimerRef.current);
      quickTimerRef.current = null;
    }
    setCastMode('quick');
    clearCastResult();
    setIsComputingLine(true);
    const quickValues = castQuickValues();
    let pointer = 0;
    quickTimerRef.current = setInterval(() => {
      pointer += 1;
      const next = quickValues.slice(0, pointer);
      setDisplayLines(next);
      setLines(next);

      if (pointer >= quickValues.length) {
        if (quickTimerRef.current) {
          clearInterval(quickTimerRef.current);
          quickTimerRef.current = null;
        }
        setIsComputingLine(false);
      }
    }, 1000);
  };

  const handleRitualFlip = () => {
    if (loading || mode !== 'ritual' || isComputingLine || ritualComplete) {
      return;
    }
    setCastMode('ritual');
    setIsComputingLine(true);
    setTimeout(() => {
      const nextValue = castLineValue();
      setDisplayLines((current) => {
        const next = [...current, nextValue];
        setLines(next);
        return next;
      });
      setIsComputingLine(false);
    }, 120);
  };

  const castResult = useMemo(() => {
    if (!ritualComplete) {
      return null;
    }
    return computeCastResult(displayLines);
  }, [displayLines, ritualComplete]);

  const handleReveal = async () => {
    if (!castResult || loading || isComputingLine) {
      return;
    }
    setLoading(true);
    setCastMode(mode);
    const nextDraft = setCastResult(castResult);
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
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    router.push('/moment/result');
  };

  const handlePrimaryAction = () => {
    if (ritualComplete) {
      void handleReveal();
      return;
    }
    if (mode === 'quick') {
      startQuickReveal();
      return;
    }
    handleRitualFlip();
  };

  return (
    <div className="space-y-7 pt-2">
      <LoadingModal open={loading} text={t('loading_reflecting')} />
      <div>
      <div className="inline-flex rounded-full border border-slate-200/70 bg-white p-0.5 text-[11px] text-slate-500">
        {(['quick', 'ritual'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMode(option);
              setCastMode(option);
              setDisplayLines([]);
              setLines([]);
              clearCastResult();
              if (quickTimerRef.current) {
                clearInterval(quickTimerRef.current);
                quickTimerRef.current = null;
              }
              setIsComputingLine(false);
            }}
            disabled={loading || isComputingLine}
            className={`rounded-full px-2.5 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 ${
              mode === option ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {option === 'quick' ? t('cast_quick') : t('cast_ritual')}
          </button>
        ))}
      </div>
      </div>

      {/* <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
        {mode === 'quick' ? t('cast_quick_helper') : t('cast_ritual_helper')}
      </div> */}

      <div className="space-y-4">
        <div className="flex flex-col-reverse gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          {Array.from({ length: 6 }, (_, index) => {
            const value = displayLines[index];
            const isYang = value === 7 || value === 9;
            const isChanging = value === 6 || value === 9;

            return (
              <div
                key={`line-${index}`}
                className={`flex min-h-[44px] items-center justify-between rounded-xl bg-white px-3 py-2 ${
                  mode === 'ritual'
                    ? `transition-opacity duration-500 ${value ? 'opacity-100' : 'opacity-70'}`
                    : ''
                }`}
              >
                <span className="text-xs text-slate-500">
                  {index + 1}
                </span>
                <div className="flex items-center gap-3">
                  {value ? (
                    isYang ? (
                      <span
                        className={`h-1 w-16 rounded-full ${
                          isChanging ? 'bg-slate-900' : 'bg-slate-700'
                        }`}
                      />
                    ) : (
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-1 w-7 rounded-full ${
                            isChanging ? 'bg-slate-900' : 'bg-slate-700'
                          }`}
                        />
                        <span
                          className={`h-1 w-7 rounded-full ${
                            isChanging ? 'bg-slate-900' : 'bg-slate-700'
                          }`}
                        />
                      </span>
                    )
                  ) : (
                    <span className="h-1 w-16 rounded-full bg-slate-200" />
                  )}
                  <span className="w-[110px] text-left text-xs text-slate-600">
                    {value ? describeLine(value) : t('cast_waiting')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={loading || isComputingLine}
          className={`w-full rounded-full px-4 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 disabled:bg-slate-200 disabled:text-slate-400 ${
            ritualComplete || hasStarted ? 'bg-slate-900 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {ritualComplete
            ? t('cast_view_reading')
            : mode === 'quick'
              ? t('cast.confirm')
              : t('cast_draw_next_line')}
        </button>
      </div>
    </div>
  );
}
