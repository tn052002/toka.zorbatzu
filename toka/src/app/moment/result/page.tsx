'use client';

import Link from 'next/link';
import ScreenLayout from '@/components/ScreenLayout';
import meanings from '@/data/hex_meanings.json';
import { useEffect } from 'react';
import { useDraftMoment } from '@/lib/moment/useDraftMoment';

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
  const { draft, initDraft } = useDraftMoment();

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
          <p className="mt-2 text-sm text-slate-700">
            This section reflects what you wrote, in plain language.
          </p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cold sentence</p>
          <p className="mt-2 text-sm text-slate-700">You are holding two truths at once.</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Opening question</p>
          <p className="mt-2 text-sm text-slate-700">
            What part of this feels most alive right now?
          </p>
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
