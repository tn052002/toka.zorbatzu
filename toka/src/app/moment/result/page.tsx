'use client';

import Link from 'next/link';
import ScreenLayout from '@/components/ScreenLayout';
import meanings from '@/data/hex_meanings.json';
import { useEffect, useState } from 'react';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';
import { buildInterpretInput, requestInterpretation } from '@/lib/interpret/client';

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

const store = meanings as MeaningsStore;

const fallbackMovement = [
  'Movement is present, but may be hard to name clearly.',
  'More than one interpretation may fit this moment.',
];

const getHex = (id: number): HexMeaning => {
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

const getMovement = (line: number): string[] => {
  const items = store.line_position_overlay[String(line)];
  if (items && items.length >= 2) {
    return items.slice(0, 2);
  }
  return fallbackMovement;
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

  useEffect(() => {
    if (!draft) {
      initDraft();
    }
  }, [draft, initDraft]);

  if (!draft) {
    return null;
  }

  const primaryId = draft.primary_hex_id;
  const relatingId = draft.relating_hex_id ?? null;
  const changingLines = draft.changing_lines ?? [];

  const primary = typeof primaryId === 'number' ? getHex(primaryId) : getHex(0);
  const relating = typeof relatingId === 'number' ? getHex(relatingId) : null;
  const hasCast = typeof primaryId === 'number';
  const mirror = draft.ai_output?.mirror_map;

  const fallbackMirror = {
    you_described: [
      'The question describes a present tension.',
      'A central theme appears in the way it is phrased.',
      'The situation reads as active and still forming.',
    ],
    two_pulls: ['Two directions appear at once.', 'Both pulls feel present.'],
    cost_to_lose: ['Letting go changes the current balance.', 'Holding on keeps a known rhythm.'],
    unknowns: ['Some parts of the picture remain open.', 'The timing is still unclear.'],
  };

  const coldSentence =
    draft.ai_output?.cold_mirror_sentence ?? 'You are holding two truths at once.';
  const openingQuestion =
    draft.ai_output?.opening_question ?? 'What part of this feels most alive right now?';

  const handleRetry = async () => {
    if (!draft || retrying) {
      return;
    }
    const input = buildInterpretInput(draft);
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
      eyebrow="Moment"
      title="Result"
      description="Primary, movement, and relating — drawn from the meaning store."
    >
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
          Meanings v{store.version}
        </p>
        {!hasCast ? (
          <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cast missing</p>
            <p className="mt-2 text-sm text-slate-700">
              This moment does not have cast data yet.
            </p>
            <Link
              href="/moment/cast"
              className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
            >
              Return to cast
            </Link>
          </section>
        ) : null}
        {hasCast ? (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Primary</p>
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
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Movement</p>
              {changingLines.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">
                  No changing lines appeared in this cast.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {changingLines.map((line) => (
                    <div key={`line-${line}`} className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Line {line}
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600">
                        {getMovement(line).map((item, index) => (
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Relating</p>
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
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mirror</p>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                You described
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
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Two pulls</p>
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
                Cost to lose
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
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Unknowns</p>
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
                {retrying ? 'Reflecting...' : 'Retry mirror'}
              </button>
            ) : null}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cold sentence</p>
          <p className="mt-2 text-sm text-slate-700">{coldSentence}</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Opening question</p>
          <p className="mt-2 text-sm text-slate-700">{openingQuestion}</p>
        </section>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/moment/cast" className="hover:text-slate-700">
            Back
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700"
          >
            Home
          </Link>
        </div>
      </div>
    </ScreenLayout>
  );
}
