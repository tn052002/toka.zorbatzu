'use client';

import Link from 'next/link';
import ScreenLayout from '@/components/ScreenLayout';
import meaningsEn from '@/data/hex_meanings_en.json';
import meaningsVi from '@/data/hex_meanings_vi.json';
import { useEffect, useState } from 'react';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import { buildInterpretInput, requestInterpretation } from '@/lib/interpret/client';
import { useI18n } from '@/lib/i18n/useI18n';

type HexTraditional = {
  name_en?: string;
  pinyin?: string;
  han_viet?: string;
};

type HexMeaning = {
  id: number;
  layman_title: string;
  traditional: HexTraditional;
  present_state: string[];
  keywords?: string[];
  domains_hint?: string[];
};

type MeaningsStore = {
  version: string;
  hexagrams: Record<string, HexMeaning>;
  line_position_overlay: Record<string, string[]>;
  fallback: { hexagram: { layman_title: string; present_state: string[] } };
};

const storeForLang = (lang: 'en' | 'vi') =>
  (lang === 'vi' ? meaningsVi : meaningsEn) as MeaningsStore;

const getHex = (id: number, store: MeaningsStore): HexMeaning => {
  const found = store.hexagrams[String(id)];
  if (found) {
    return found;
  }

  return {
    id: 0,
    layman_title: store.fallback.hexagram.layman_title,
    traditional: {},
    present_state: store.fallback.hexagram.present_state,
    keywords: [],
    domains_hint: [],
  };
};

const getMovement = (
  line: number,
  store: MeaningsStore,
  fallback: string[],
): string[] => {
  const items = store.line_position_overlay[String(line)];
  if (items && items.length >= 2) {
    return items.slice(0, 2);
  }
  return fallback;
};

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

export default function ResultPage() {
  const { draft, initDraft, setAiOutput, setAiStatus } = useDraftMoment();
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
  const changingLines = draft.changing_lines ?? [];

  const primary =
    typeof primaryId === 'number' ? getHex(primaryId, store) : getHex(0, store);
  const relating =
    typeof relatingId === 'number' ? getHex(relatingId, store) : null;
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
  const fallbackMovement = [t('movement_fallback_1'), t('movement_fallback_2')];

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
      eyebrow={t('eyebrow_moment')}
      title={t('result_title')}
      description={t('result_desc')}
    >
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
          {t('meanings_version', { version: store.version })}
        </p>
        {!hasCast ? (
          <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {t('cast_missing_title')}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {t('cast_missing_body')}
            </p>
            <Link
              href="/moment/cast"
              className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
            >
              {t('cast_missing_cta')}
            </Link>
          </section>
        ) : null}
        {hasCast ? (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {t('primary_label')}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {primary.layman_title}
              </p>
              {formatTraditional(primary.traditional) ? (
                <p className="mt-1 text-xs text-slate-400">
                  {formatTraditional(primary.traditional)}
                </p>
              ) : null}
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {primary.present_state.map((item, index) => (
                  <li key={`primary-${index}`} className="rounded-xl bg-slate-50 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {t('movement_label')}
              </p>
              {changingLines.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">
                  {t('movement_none')}
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {changingLines.map((line) => (
                    <div key={`line-${line}`} className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {t('cast_line')} {line}
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600">
                        {getMovement(line, store, fallbackMovement).map((item, index) => (
                          <li
                            key={`line-${line}-${index}`}
                            className="rounded-xl bg-slate-50 px-3 py-2"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {relating ? (
              <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {t('relating_label')}
                </p>
                <p className="mt-2 text-sm text-slate-700">{relating.layman_title}</p>
                {formatTraditional(relating.traditional) ? (
                  <p className="mt-1 text-xs text-slate-400">
                    {formatTraditional(relating.traditional)}
                  </p>
                ) : null}
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {relating.present_state.map((item, index) => (
                    <li key={`relating-${index}`} className="rounded-xl bg-slate-50 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : null}
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {t('mirror_label')}
          </p>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                {t('mirror_you_described')}
              </p>
              <ul className="mt-2 space-y-2">
                {(mirror?.you_described ?? fallbackMirror.you_described).map((item, index) => (
                  <li key={`mirror-you-${index}`} className="rounded-xl bg-slate-50 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                {t('mirror_two_pulls')}
              </p>
              <ul className="mt-2 space-y-2">
                {(mirror?.two_pulls ?? fallbackMirror.two_pulls).map((item, index) => (
                  <li key={`mirror-pulls-${index}`} className="rounded-xl bg-slate-50 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                {t('mirror_cost')}
              </p>
              <ul className="mt-2 space-y-2">
                {(mirror?.cost_to_lose ?? fallbackMirror.cost_to_lose).map((item, index) => (
                  <li key={`mirror-cost-${index}`} className="rounded-xl bg-slate-50 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                {t('mirror_unknowns')}
              </p>
              <ul className="mt-2 space-y-2">
                {(mirror?.unknowns ?? fallbackMirror.unknowns).map((item, index) => (
                  <li key={`mirror-unknown-${index}`} className="rounded-xl bg-slate-50 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {!draft.ai_output ? (
              <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 disabled:text-slate-400"
              >
                {retrying ? t('mirror_retrying') : t('mirror_retry')}
              </button>
            ) : null}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {t('cold_label')}
          </p>
          <p className="mt-2 text-sm text-slate-700">{coldSentence}</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {t('opening_label')}
          </p>
          <p className="mt-2 text-sm text-slate-700">{openingQuestion}</p>
        </section>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/moment/cast" className="hover:text-slate-700">
            {t('result_back')}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700"
          >
            {t('result_home')}
          </Link>
        </div>
      </div>
    </ScreenLayout>
  );
}
