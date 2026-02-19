'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { MOMENT_READING_KEY, type MomentReading } from '@/lib/momentReading';
import meaningsEn from '@/data/hex_meanings_en.json';
import meaningsVi from '@/data/hex_meanings_vi.json';

type HexStore = {
  hexagrams: Record<string, { laymantitle?: string }>;
  fallback?: { laymantitle?: string };
};

function getLaymanTitle(id: number | null, store: HexStore): string {
  if (typeof id !== 'number' || id <= 0) {
    return store.fallback?.laymantitle || '';
  }
  return store.hexagrams[String(id)]?.laymantitle || store.fallback?.laymantitle || '';
}

export default function ReadingPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [reading, setReading] = useState<MomentReading | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(MOMENT_READING_KEY);
      if (!raw) {
        setReading(null);
        return;
      }
      setReading(JSON.parse(raw) as MomentReading);
    } catch {
      setReading(null);
    }
  }, []);

  const store = (lang === 'vi' ? meaningsVi : meaningsEn) as HexStore;
  const locale = lang === 'vi' ? 'vi-VN' : 'en-US';

  const questionAtText = useMemo(() => {
    if (!reading?.questionTimestamp) {
      return t('readingNone');
    }
    return new Date(reading.questionTimestamp).toLocaleString(locale);
  }, [locale, reading?.questionTimestamp, t]);

  const castedAtText = useMemo(() => {
    if (!reading?.castedAt) {
      return t('readingNone');
    }
    return new Date(reading.castedAt).toLocaleString(locale);
  }, [locale, reading?.castedAt, t]);

  const mainTitle = getLaymanTitle(reading?.mainHexId ?? null, store);
  const relatingTitle = getLaymanTitle(reading?.relatingHexId ?? null, store);

  return (
    <main className="moment-root" style={{ paddingInline: 16 }}>
      <div className="moment-shell">
        <section className="moment-section moment-section-primary" style={{ marginTop: 0 }}>
          <p className="moment-label">{t('readingTitle')}</p>
          {!reading ? (
            <p className="moment-question" style={{ marginTop: 10 }}>{t('readingNoData')}</p>
          ) : (
            <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
              <p className="moment-question">{reading.question || t('readingNone')}</p>
              <p className="moment-label">{t('readingQuestion')}: {reading.question || t('readingNone')}</p>
              <p className="moment-label">{t('readingQuestionTimestamp')}: {questionAtText}</p>
              <p className="moment-label">{t('readingDomain')}: {reading.domain || t('readingNone')}</p>
              <p className="moment-label">{t('readingMode')}: {reading.mode}</p>
              <p className="moment-label">{t('readingCastedAt')}: {castedAtText}</p>
              <p className="moment-label">{t('readingLineValues')}: [{reading.lineValues.join(', ')}]</p>
              <p className="moment-label">{t('readingMainHexId')}: {reading.mainHexId || 0}</p>
              <p className="moment-label">{mainTitle}</p>
              <p className="moment-label">
                {t('readingMovingLines')}: {reading.movingLinePositions.length ? reading.movingLinePositions.join(', ') : t('readingNone')}
              </p>
              <p className="moment-label">{t('readingRelatingHexId')}: {reading.relatingHexId ?? t('readingNone')}</p>
              <p className="moment-label">{relatingTitle || t('readingNone')}</p>
            </div>
          )}
        </section>

        <div className="moment-actions">
          <button type="button" className="moment-confirm-btn" onClick={() => router.push('/cast')}>
            {t('readingBackToCast')}
          </button>
          <button type="button" className="moment-back-link" onClick={() => router.push('/')}>
            {t('readingBackHome')}
          </button>
        </div>
      </div>
    </main>
  );
}
