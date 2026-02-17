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
    parts.push(parts.length > 0 ? `— ${traditional.name_en}` : traditional.name_en);
  }
  return parts.join(' ');
};

const getMeaningLines = (hex: HexMeaningNormalized): string[] => {
  const v2Lines = [
    hex.core_image?.vi,
    hex.core_image?.en,
    ...(hex.structure?.core_structure ?? []),
    ...(hex.structure?.structural_nature ?? []),
    hex.structure?.inherent_tension,
  ].filter(Boolean) as string[];

  // TODO: remove legacy present_state fallback after migration complete.
  const legacyLines = Array.isArray(hex.present_state) ? hex.present_state : [];
  return v2Lines.length > 0 ? v2Lines : legacyLines;
};

export default function ResultPage() {
  const { draft, initDraft, setAiOutput, setAiStatus, resetDraft } = useDraftMoment();
  const [retrying, setRetrying] = useState(false);
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
  const primaryLines = getMeaningLines(primary);
  const relatingLines = relating ? getMeaningLines(relating) : [];
  const hasCast = typeof primaryId === 'number';
  const mirror = draft.ai_output?.mirror_map;

  const fallbackMirror = {
    you_described: [
      t('mirror_placeholder_1'),
      t('mirror_placeholder_2'),
      t('mirror_placeholder_3'),
    ],
    two_pulls: [t('mirror_placeholder_pull_1'), t('mirror_placeholder_pull_2')],
    cost_to_lose: [t('mirror_placeholder_cost_1'), t('mirror_placeholder_cost_2')],
    unknowns: [t('mirror_placeholder_unknown_1'), t('mirror_placeholder_unknown_2')],
  };

  const coldSentence = draft.ai_output?.cold_mirror_sentence ?? t('cold_placeholder');
  const openingQuestion = draft.ai_output?.opening_question ?? t('opening_placeholder');

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
          <section className="rounded-2xl border border-slate-200/70 bg-slate-50/55 px-4 py-5">
            <div className="space-y-6">
              <div className="space-y-4 pt-1">
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">
                  {t('result.mirrorEyebrow')}
                </p>
                {interpretationReady ? (
                  <>
                    <div className="space-y-3 text-sm text-slate-700">
                      <ul className="space-y-2">
                        {(mirror?.you_described ?? fallbackMirror.you_described).map((item, index) => (
                          <li key={`mirror-you-${index}`} className="rounded-md bg-slate-100/35 px-2 py-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {(mirror?.two_pulls ?? fallbackMirror.two_pulls).map((item, index) => (
                          <li key={`mirror-pulls-${index}`} className="rounded-md bg-slate-100/35 px-2 py-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {(mirror?.cost_to_lose ?? fallbackMirror.cost_to_lose).map((item, index) => (
                          <li key={`mirror-cost-${index}`} className="rounded-md bg-slate-100/35 px-2 py-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {(mirror?.unknowns ?? fallbackMirror.unknowns).map((item, index) => (
                          <li key={`mirror-unknown-${index}`} className="rounded-md bg-slate-100/35 px-2 py-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="px-2 space-y-3 text-sm text-slate-700">
                      <p>{coldSentence}</p>
                      <p>{openingQuestion}</p>
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

              <div className="text-sm text-slate-600">
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">
                  {t('result.primaryLabel')}
                </p>

                <p className="mt-3 text-base font-medium text-slate-700 px-2">
                  {primary.laymantitle || normalizedFallback.laymantitle}
                </p>
                {formatTraditional(primary.traditional ?? {}) ? (
                  <p className=" text-xs text-slate-400 px-2">
                    #{primary.id ?? normalizedFallback.id ?? 0} {formatTraditional(primary.traditional ?? {})}
                  </p>
                ) : null}
                
                <ul className="mt-2 text-sm text-slate-600">
                  {primaryLines.map((item, index) => (
                    <li key={`primary-${index}`} className="rounded-md bg-slate-100/45 px-2 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {relating && hasSecondary ? (
                <div className="text-sm text-slate-600">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">
                    {t('result.secondaryLabel')}
                  </p>
                  
                  <p className="mt-3 text-base font-medium text-slate-700 px-2">
                    {relating.laymantitle || normalizedFallback.laymantitle}
                  </p>

                  {formatTraditional(relating.traditional ?? {}) ? (
                    <p className="text-xs text-slate-400 px-2">
                      #{relating.id ?? normalizedFallback.id ?? 0} {formatTraditional(relating.traditional ?? {})}
                    </p>
                  ) : null}
                  
                  <ul className="mt-2 text-sm text-slate-600">
                    {relatingLines.map((item, index) => (
                      <li key={`relating-${index}`} className="rounded-md bg-slate-100/40 px-2 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {!hasSecondary ? <p className="text-xs text-slate-500">{t('result.noSecondary')}</p> : null}
            </div>
          </section>
        ) : null}
      </div>
    </ScreenLayout>
  );
}
