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
  const { t } = useI18n();
  const router = useRouter();
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
      return t('castLabelYinMoving');
    }
    if (line.polarity === 'yang' && line.moving) {
      return t('castLabelYangMoving');
    }
    if (line.polarity === 'yin') {
      return t('castLabelYin');
    }
    return t('castLabelYang');
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
        return <p className="cast-control-hint">{t('castHintRitualNext')}</p>;
      }
      return <p className="cast-control-progress">{t('castProgressFormat').replace('{n}', String(step))}</p>;
    }
    if (step === 0) {
      return <p className="cast-control-hint">{t('castHintQuick')}</p>;
    }
    if (isAutoCasting && step < 6) {
      return <p className="cast-control-empty" aria-hidden="true">&nbsp;</p>;
    }
    return <p className="cast-control-empty" aria-hidden="true">&nbsp;</p>;
  }, [isAutoCasting, mode, step, t]);

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
          <p className="cast-question-text">{payload?.question || t('castNoQuestion')}</p>
        </section>

        <section className="cast-controls">
          <div className="cast-mode-selector" role="tablist" aria-label={t('castModeAria')}>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'quick'}
              className={mode === 'quick' ? 'cast-mode-tab active' : 'cast-mode-tab'}
              onClick={() => resetForMode('quick')}
            >
              {t('castModeQuick')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'ritual'}
              className={mode === 'ritual' ? 'cast-mode-tab active' : 'cast-mode-tab'}
              onClick={() => resetForMode('ritual')}
            >
              {t('castModeRitual')}
            </button>
          </div>

          <div className="cast-orb-control">
            <BreathingOrb
              className={mode === 'quick' && isAutoCasting && step < 6 ? 'cast-orb cast-orb-disabled' : 'cast-orb'}
              onClick={onOrbTap}
              ariaLabel={t('castOrbAria')}
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
            {t('castViewResult')}
          </button>
          <button type="button" className="moment-back-link" onClick={() => router.push('/moment')}>
            {t('castHome')}
          </button>
        </div>
      </div>
    </main>
  );
}
