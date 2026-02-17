'use client';

import Link from 'next/link';
import ScreenLayout from '@/components/ScreenLayout';
import meaningsEn from '@/data/hex_meanings_en.json';
import meaningsVi from '@/data/hex_meanings_vi.json';
import { useEffect, useState } from 'react';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import { buildInterpretInput, requestInterpretation } from '@/lib/interpret/client';
import { useI18n } from '@/lib/i18n/useI18n';
import { normalizeHexMeaning, type HexMeaningNormalized } from '@/lib/hex/normalize';

type HexTraditional = {
  name_en?: string;
  pinyin?: string;
  han_viet?: string;
};

type MeaningsStore = {
  version: string;
  hexagrams: Record<string, unknown>;
  line_position_overlay: Record<string, string[]>;
  fallback?: unknown;
};

const storeForLang = (lang: 'en' | 'vi') =>
  (lang === 'vi' ? meaningsVi : meaningsEn) as MeaningsStore;

const formatTraditional = (traditional: HexTraditional) => {
  const parts: string[] = [];
  if (traditional.han_viet) {
    parts.push(traditional.han_viet);
  }
  if (traditional.pinyin) {
    parts.push(`(${traditional.pinyin})`);
  }
  if (traditional.name_en) {
    parts.push(parts.length > 0 ? `- ${traditional.name_en}` : traditional.name_en);
  }
  return parts.join(' ');
};

export default function ResultPage() {
  const { draft, initDraft, setAiOutput, setAiStatus, resetDraft } = useDraftMoment();
  const [retrying, setRetrying] = useState(false);
  const [showDoctrine, setShowDoctrine] = useState(false);
  const { lang, t } = useI18n();

  useEffect(() => {
    if (!draft) {
      initDraft();
    }
  }, [draft, initDraft]);

  if (!draft) {
    return null;
  }

  const store = storeForLang(lang);
  const primaryId = draft.primary_hex_id;
  const relatingId = draft.relating_hex_id ?? null;
  const hasSecondary =
    typeof primaryId === 'number' && typeof relatingId === 'number' && relatingId !== primaryId;
  const interpretationReady = Boolean(draft.ai_output);
  const fallbackId = '0';
  const fallbackHex = store.hexagrams?.[fallbackId] ?? store.fallback ?? {};
  const normalizedFallback = normalizeHexMeaning(fallbackHex ?? {});
  const primaryHexRaw =
    typeof primaryId === 'number' ? store.hexagrams?.[String(primaryId)] ?? fallbackHex : fallbackHex;
  const relatingHexRaw =
    hasSecondary && typeof relatingId === 'number'
      ? store.hexagrams?.[String(relatingId)] ?? fallbackHex
      : null;
  const primary = normalizeHexMeaning(primaryHexRaw ?? {});
  const relating = relatingHexRaw ? normalizeHexMeaning(relatingHexRaw ?? {}) : null;
  const hasCast = typeof primaryId === 'number';

  const getDoctrineRows = (hex: HexMeaningNormalized) => {
    const image = (lang === 'vi' ? hex.core_image?.vi : hex.core_image?.en) ?? '';
    return [
      { label: t('result.doctrine.coreImage'), values: image ? [image] : [] },
      { label: t('result.doctrine.coreStructure'), values: hex.structure?.core_structure ?? [] },
      { label: t('result.doctrine.structuralNature'), values: hex.structure?.structural_nature ?? [] },
      {
        label: t('result.doctrine.inherentTension'),
        values: hex.structure?.inherent_tension ? [hex.structure.inherent_tension] : [],
      },
    ];
  };

  const getHexSubtitle = (
    hex: HexMeaningNormalized,
    idOverride?: number | null,
  ) => {
    const id = hex.id ?? idOverride ?? undefined;
    const traditional = formatTraditional((hex.traditional ?? {}) as HexTraditional);
    if (id && traditional) {
      return `#${id} ${traditional}`;
    }
    if (id) {
      return `#${id}`;
    }
    return traditional;
  };

  const fallbackNarrative = {
    whatIsUnfolding: t('mirror_placeholder_1'),
    whereYouStand: t('mirror_placeholder_2'),
    tensionToNotice: t('mirror_placeholder_3'),
    closingQuestion: t('opening_placeholder'),
  };
  const narrative = draft.ai_output?.narrative;
  const whatIsUnfolding = narrative?.what_is_unfolding ?? fallbackNarrative.whatIsUnfolding;
  const whereYouStand = narrative?.where_you_stand ?? fallbackNarrative.whereYouStand;
  const tensionToNotice = narrative?.tension_to_notice ?? fallbackNarrative.tensionToNotice;
  const closingQuestion = draft.ai_output?.closing_question ?? fallbackNarrative.closingQuestion;

  const handleRetry = async () => {
    if (!draft || retrying) {
      return;
    }
    const input = buildInterpretInput(draft, lang);
    if (!input) {
      return;
    }
    setRetrying(true);
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
    } finally {
      setRetrying(false);
    }
  };

  return (
    <ScreenLayout 
      title={t('result_title')} 
      description={t('result_desc')}
      footer= {<div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/moment/cast" className="hover:text-slate-700">
            {t('result_back')}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700"
          >
            {t('result_home')}
          </Link>
        </div> }
      >  
      <div className="space-y-6">
        {!hasCast ? (
          <section className="rounded-full border border-slate-200/70 bg-white px-4 py-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('cast_missing_title')}</p>
            <p className="mt-2 text-sm text-slate-700">{t('cast_missing_body')}</p>
            <Link
              href="/moment/domain"
              onClick={() => resetDraft()}
              className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
            >
              {t('cast_missing_cta')}
            </Link>
          </section>
        ) : null}

        {hasCast ? (
          <>
            <div className="space-y-2">
              <p className="px-1 text-[11px] uppercase tracking-[0.32em] text-slate-400">
                {t('result.mirrorEyebrow')}
              </p>
              <section className="rounded-2xl border border-slate-200/70 bg-slate-50/55 px-4 py-5">
                <div className="space-y-4 pt-1">
                {interpretationReady ? (
                  <>
                    <div className="space-y-3 text-sm text-slate-700">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                          {t('result.narrative.whatIsUnfolding')}
                        </p>
                        <p className="rounded-md bg-slate-100/35 px-2 py-2">{whatIsUnfolding}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                          {t('result.narrative.whereYouStand')}
                        </p>
                        <p className="rounded-md bg-slate-100/35 px-2 py-2">{whereYouStand}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                          {t('result.narrative.tensionToNotice')}
                        </p>
                        <p className="rounded-md bg-slate-100/35 px-2 py-2">{tensionToNotice}</p>
                      </div>
                    </div>
                    <div className="px-2 space-y-1 text-sm text-slate-700">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                        {t('result.narrative.closingQuestion')}
                      </p>
                      <p>{closingQuestion}</p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500">{t('common.analyzing')}</p>
                    {draft.ai_status === 'error' || (!retrying && draft.ai_status !== 'loading') ? (
                      <button
                        type="button"
                        onClick={handleRetry}
                        disabled={retrying}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 disabled:text-slate-400"
                      >
                        {retrying ? t('mirror_retrying') : t('mirror_retry')}
                      </button>
                    ) : null}
                  </div>
                )}
                </div>
              </section>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="px-1 text-[11px] uppercase tracking-[0.32em] text-slate-400">
                  {t('result.underlyingStructure')}
                </p>
                <button
                  type="button"
                  onClick={() => setShowDoctrine((current) => !current)}
                  className="rounded-md border border-slate-300/70 px-2.5 py-1 text-xs text-slate-700 transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
                >
                  {showDoctrine ? t('common.collapse') : t('common.reveal')}
                </button>
              </div>
              {showDoctrine ? (
                <div className="space-y-4 px-2 text-sm text-slate-600">
                  <div className="rounded-xl border border-slate-200/70 bg-white/55 p-4 space-y-3">
                    <div className="space-y-2 border-b border-slate-200/70 pb-3">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                        {t('result.primaryLabel')}
                      </p>
                      <div className="space-y-1">
                        <p className="text-base font-medium text-slate-800">
                          {primary.laymantitle || normalizedFallback.laymantitle}
                        </p>
                        <p className="text-xs text-slate-500">{getHexSubtitle(primary, primaryId)}</p>
                      </div>
                    </div>
                    {getDoctrineRows(primary).map((row) => {
                      if (row.values.length === 0) {
                        return null;
                      }
                      return (
                        <div key={`primary-${row.label}`} className="space-y-1">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{row.label}</p>
                          {row.values.map((value, index) => (
                            <p key={`primary-${row.label}-${index}`} className="text-sm text-slate-700">
                              {value}
                            </p>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  {relating && hasSecondary ? (
                    <div className="rounded-xl border border-slate-200/70 bg-white/55 p-4 space-y-3">
                      <div className="space-y-2 border-b border-slate-200/70 pb-3">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                          {t('result.secondaryLabel')}
                        </p>
                        <div className="space-y-1">
                          <p className="text-base font-medium text-slate-800">
                            {relating.laymantitle || normalizedFallback.laymantitle}
                          </p>
                          <p className="text-xs text-slate-500">{getHexSubtitle(relating, relatingId)}</p>
                        </div>
                      </div>
                      {getDoctrineRows(relating).map((row) => {
                        if (row.values.length === 0) {
                          return null;
                        }
                        return (
                          <div key={`relating-${row.label}`} className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{row.label}</p>
                            {row.values.map((value, index) => (
                              <p key={`relating-${row.label}-${index}`} className="text-sm text-slate-700">
                                {value}
                              </p>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </ScreenLayout>
  );
}
