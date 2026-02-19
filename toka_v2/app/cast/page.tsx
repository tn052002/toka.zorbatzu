'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import BreathingOrb from '@/components/BreathingOrb';
import { useI18n } from '@/lib/i18n';

const MOMENT_KEY = 'toka_v2:moment_draft';
const CAST_KEY = 'toka_v2:cast_result';

type Mode = 'quick' | 'ritual';
type Polarity = 'yin' | 'yang';
type Line = {
  polarity: Polarity;
  moving: boolean;
};

type CastCopy = {
  modeQuick: string;
  modeRitual: string;
  hintQuick: string;
  hintRitual: string;
  viewResult: string;
  home: string;
  labelYin: string;
  labelYang: string;
  labelYinMoving: string;
  labelYangMoving: string;
  progress: (n: number) => string;
  noQuestion: string;
};

const copyByLang: Record<'en' | 'vi', CastCopy> = {
  en: {
    modeQuick: 'quick',
    modeRitual: 'ritual',
    hintQuick: 'Tap to cast',
    hintRitual: 'Tap to cast next line',
    viewResult: 'View result',
    home: 'Home',
    labelYin: 'Yin',
    labelYang: 'Yang',
    labelYinMoving: 'Moving yin',
    labelYangMoving: 'Moving yang',
    progress: (n) => `${n}/6`,
    noQuestion: 'No question found.',
  },
  vi: {
    modeQuick: 'nhanh',
    modeRitual: 'từng hào',
    hintQuick: 'Chạm để gieo',
    hintRitual: 'Chạm để gieo hào tiếp theo',
    viewResult: 'Xem kết quả',
    home: 'Trang chủ',
    labelYin: 'Âm',
    labelYang: 'Dương',
    labelYinMoving: 'Âm (biến)',
    labelYangMoving: 'Dương (biến)',
    progress: (n) => `${n}/6`,
    noQuestion: 'Không có câu hỏi.',
  },
};

function createRandomLine(): Line {
  const roll = Math.floor(Math.random() * 4);
  if (roll === 0) {
    return { polarity: 'yin', moving: false };
  }
  if (roll === 1) {
    return { polarity: 'yang', moving: false };
  }
  if (roll === 2) {
    return { polarity: 'yin', moving: true };
  }
  return { polarity: 'yang', moving: true };
}

function createHexagram(): Line[] {
  return Array.from({ length: 6 }, () => createRandomLine());
}

export default function CastPlaceholderPage() {
  const { lang } = useI18n();
  const router = useRouter();
  const copy = copyByLang[lang];
  const [payload, setPayload] = useState<{ question?: string; domain?: string | null } | null>(null);
  const [mode, setMode] = useState<Mode>('quick');
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<Line[]>(() => createHexagram());
  const [isAutoCasting, setIsAutoCasting] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const isComplete = step === 6;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(MOMENT_KEY);
      if (raw) {
        setPayload(JSON.parse(raw));
      }
    } catch {
      setPayload(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const resetForMode = (nextMode: Mode) => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setMode(nextMode);
    setStep(0);
    setLines(createHexagram());
    setIsAutoCasting(false);
  };

  const onOrbTap = () => {
    if (isComplete) {
      return;
    }
    if (mode === 'ritual') {
      if (step < 6) {
        setStep((current) => Math.min(6, current + 1));
      }
      return;
    }
    if (step !== 0 || isAutoCasting) {
      return;
    }

    setIsAutoCasting(true);
    setStep(1);
    intervalRef.current = window.setInterval(() => {
      setStep((current) => {
        if (current >= 6) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsAutoCasting(false);
          return 6;
        }
        const next = current + 1;
        if (next >= 6) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsAutoCasting(false);
        }
        return next;
      });
    }, 1000);
  };

  const renderLineLabel = (line: Line | null) => {
    if (!line) {
      return '';
    }
    if (line.polarity === 'yin' && line.moving) {
      return copy.labelYinMoving;
    }
    if (line.polarity === 'yang' && line.moving) {
      return copy.labelYangMoving;
    }
    if (line.polarity === 'yin') {
      return copy.labelYin;
    }
    return copy.labelYang;
  };

  const handleViewResult = () => {
    if (!isComplete) {
      return;
    }
    window.localStorage.setItem(
      CAST_KEY,
      JSON.stringify({
        question: payload?.question ?? '',
        domain: payload?.domain ?? null,
        mode,
        lines,
      }),
    );
  };

  const controlContent = useMemo(() => {
    if (mode === 'ritual') {
      if (step === 0) {
        return <p className="cast-control-hint">{copy.hintRitual}</p>;
      }
      return <p className="cast-control-progress">{copy.progress(step)}</p>;
    }
    if (step === 0) {
      return <p className="cast-control-hint">{copy.hintQuick}</p>;
    }
    if (isAutoCasting && step < 6) {
      return <p className="cast-control-empty" aria-hidden="true">&nbsp;</p>;
    }
    return <p className="cast-control-empty" aria-hidden="true">&nbsp;</p>;
  }, [copy, isAutoCasting, mode, step]);

  const lineRows = useMemo(() => {
    return [5, 4, 3, 2, 1, 0].map((lineIndex) => {
      const rowOrder = lineIndex + 1;
      const revealed = step >= rowOrder;
      const line = revealed ? lines[lineIndex] : null;
      return {
        key: lineIndex,
        line,
        revealed,
      };
    });
  }, [lines, step]);

  return (
    <main className="cast-root">
      <div className="cast-stage-shell">
        <section className="cast-question-row">
          <p className="cast-question-text">{payload?.question || copy.noQuestion}</p>
        </section>

        <section className="cast-controls">
          <div className="cast-mode-selector" role="tablist" aria-label="Casting mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'quick'}
              className={mode === 'quick' ? 'cast-mode-tab active' : 'cast-mode-tab'}
              onClick={() => resetForMode('quick')}
            >
              {copy.modeQuick}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'ritual'}
              className={mode === 'ritual' ? 'cast-mode-tab active' : 'cast-mode-tab'}
              onClick={() => resetForMode('ritual')}
            >
              {copy.modeRitual}
            </button>
          </div>

          <div className="cast-orb-control">
            <BreathingOrb
              className={mode === 'quick' && isAutoCasting && step < 6 ? 'cast-orb cast-orb-disabled' : 'cast-orb'}
              onClick={onOrbTap}
              ariaLabel="Cast lines"
              disabled={mode === 'quick' && isAutoCasting && step < 6}
            />
          </div>

          <div className="cast-control-slot">{controlContent}</div>
        </section>

        <section className="cast-hexagram-panel" aria-live="polite">
          {lineRows.map((row) => {
            const lineClass = !row.line
              ? 'cast-line-glyph placeholder'
              : row.line.polarity === 'yang'
                ? row.line.moving
                  ? 'cast-line-glyph yang moving revealed'
                  : 'cast-line-glyph yang revealed'
                : row.line.moving
                  ? 'cast-line-glyph yin moving revealed'
                  : 'cast-line-glyph yin revealed';
            return (
              <div className="cast-line-row" key={row.key}>
                <div className={lineClass}>
                  {(row.line?.polarity === 'yin' || !row.line) ? (
                    <>
                      <span className="cast-line-segment" />
                      <span className="cast-line-gap" />
                      <span className="cast-line-segment" />
                    </>
                  ) : (
                    <span className="cast-line-segment full" />
                  )}
                </div>
                <span className={row.line?.moving ? 'cast-line-label moving' : 'cast-line-label'}>
                  {row.line ? renderLineLabel(row.line) : null}
                </span>
              </div>
            );
          })}
        </section>

        <div className="cast-actions">
          <button
            type="button"
            className="moment-confirm-btn cast-result-bottom-btn"
            onClick={handleViewResult}
            disabled={!isComplete}
            aria-disabled={!isComplete}
          >
            {copy.viewResult}
          </button>
          <button type="button" className="moment-back-link" onClick={() => router.push('/')}>
            {copy.home}
          </button>
        </div>
      </div>
    </main>
  );
}
