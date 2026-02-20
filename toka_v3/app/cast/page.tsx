'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ButtonPrimary from '@/components/ButtonPrimary';
import Container from '@/components/Container';
import DebugPanel from '@/components/DebugPanel';
import DevNav from '@/components/DevNav';
import Divider from '@/components/Divider';
import SectionCard from '@/components/SectionCard';
import { useI18n } from '@/lib/i18n';
import hexagramTrigrams from '@/lib/data/hexagram_trigrams.json';
import hexagramsEn from '@/lib/data/hexagrams_en.json';
import hexagramsVi from '@/lib/data/hexagrams_vi.json';
import trigramsEn from '@/lib/data/trigrams_en.json';
import trigramsVi from '@/lib/data/trigrams_vi.json';
import { loadSession, saveSession, type TokaSession } from '@/lib/session';
import { castPattern, generateMirror } from '@/lib/toka/machine';

type HexagramTrigramMap = {
  id: number;
  lower: string;
  upper: string;
};

type HexagramEn = {
  id: number;
  hanzi: string;
  pinyin: string;
  name_en: string;
  archetype: string;
  keywords: string[];
};

type HexagramVi = {
  id: number;
  hanzi: string;
  pinyin: string;
  name_vi: string;
  archetype: string;
  keywords: string[];
};

type TrigramEn = {
  id: string;
  hanzi: string;
  pinyin: string;
  name_en: string;
  element: string;
  keywords: string[];
};

type TrigramVi = {
  id: string;
  hanzi: string;
  pinyin: string;
  name_vi: string;
  element: string;
  keywords: string[];
};

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (
    value &&
    typeof value === 'object' &&
    'default' in value &&
    Array.isArray((value as { default?: unknown }).default)
  ) {
    return (value as { default: T[] }).default;
  }
  return [];
}

export default function CastPage() {
  const router = useRouter();
  const { m, lang } = useI18n();
  const [session, setSession] = useState<TokaSession | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const revealTimer = useRef<number | null>(null);

  useEffect(() => {
    const loaded = loadSession();
    if (!loaded.input.decision.trim()) {
      router.replace('/');
      return;
    }
    // Guard against stale cast data in storage. Cast should only be created
    // when user taps "Reveal Pattern" on this page.
    if (loaded.state !== 'casted' && loaded.cast) {
      const sanitized: TokaSession = {
        ...loaded,
        state: 'input',
        cast: null,
        updatedAt: new Date().toISOString(),
      };
      saveSession(sanitized);
      setSession(sanitized);
      return;
    }
    setSession(loaded);
  }, [router]);

  useEffect(() => {
    if (!session?.cast) {
      setRevealedCount(0);
      setIsRevealing(false);
      return;
    }
    setRevealedCount(0);
    setIsRevealing(false);
  }, [session?.cast]);

  useEffect(() => {
    return () => {
      if (revealTimer.current !== null) {
        window.clearInterval(revealTimer.current);
      }
    };
  }, []);

  const localizedHexagrams = asArray<HexagramVi | HexagramEn>(lang === 'vi' ? hexagramsVi : hexagramsEn);
  const localizedTrigrams = asArray<TrigramVi | TrigramEn>(lang === 'vi' ? trigramsVi : trigramsEn);
  const trigramMappings = asArray<HexagramTrigramMap>(hexagramTrigrams);
  const hexById = new Map(localizedHexagrams.map((hex) => [hex.id, hex]));
  const trigramById = new Map(localizedTrigrams.map((trigram) => [trigram.id, trigram]));
  const hexTrigramById = new Map(trigramMappings.map((item) => [item.id, item]));

  if (!session) {
    return null;
  }

  const isFullyRevealed = revealedCount >= 6;
  const visibleValues = session.cast?.lineValues.slice(0, revealedCount) ?? [];
  const lineValueText = `[${Array.from({ length: 6 }, (_, index) => visibleValues[index] ?? '_').join(', ')}]`;
  const visibleChanging = session.cast?.changingLines.filter((line) => line <= revealedCount) ?? [];
  const trigramTitle = lang === 'vi' ? 'Quái' : 'Trigrams';
  const lowerTitle = lang === 'vi' ? 'Hạ quái' : 'Lower';
  const upperTitle = lang === 'vi' ? 'Thượng quái' : 'Upper';
  const elementTitle = lang === 'vi' ? 'Ngũ hành' : 'Element';
  const keywordsTitle = lang === 'vi' ? 'Từ khóa' : 'Keywords';

  const primaryHexId = session.cast?.primaryHexagramId;
  const resultingHexId = session.cast?.resultingHexagramId;
  const getHexagramById = (hexId: number) => hexById.get(hexId);
  const getTrigramByHexId = (hexId: number) => {
    const pairing = hexTrigramById.get(hexId);
    if (!pairing) {
      return null;
    }
    return {
      lower: trigramById.get(pairing.lower),
      upper: trigramById.get(pairing.upper),
    };
  };
  const primaryHex = isFullyRevealed && primaryHexId ? getHexagramById(primaryHexId) : null;
  const resultingHex = isFullyRevealed && resultingHexId ? getHexagramById(resultingHexId) : null;
  const primaryTrigrams = isFullyRevealed && primaryHexId ? getTrigramByHexId(primaryHexId) : null;
  const resultingTrigrams = isFullyRevealed && resultingHexId ? getTrigramByHexId(resultingHexId) : null;

  const startReveal = () => {
    if (isRevealing || isFullyRevealed) {
      return;
    }
    setIsRevealing(true);
    if (revealTimer.current !== null) {
      window.clearInterval(revealTimer.current);
    }
    revealTimer.current = window.setInterval(() => {
      setRevealedCount((current) => {
        if (current >= 6) {
          if (revealTimer.current !== null) {
            window.clearInterval(revealTimer.current);
          }
          setIsRevealing(false);
          return current;
        }
        const next = current + 1;
        if (next >= 6) {
          if (revealTimer.current !== null) {
            window.clearInterval(revealTimer.current);
          }
          setIsRevealing(false);
        }
        return next;
      });
    }, 320);
  };

  const revealPattern = () => {
    if (isRevealing || isFullyRevealed) {
      return;
    }
    if (!session.cast) {
      const result = castPattern();
      if (!result.ok || !result.session.cast) {
        return;
      }
      setSession(result.session);
      setRevealedCount(0);
      startReveal();
      return;
    }
    startReveal();
  };

  return (
    <main className="toka-page fade-in">
      <Container>
        <DevNav />
        <DebugPanel onSessionChange={setSession} />

        <header className="space-y-3">
          <h1 className="font-serif text-2xl">{m.cast.title}</h1>
          <Divider />
        </header>

        <section className="mt-4 space-y-4">
          <SectionCard>
            <p className="text-sm text-text/80">{m.cast.coinPlaceholder}</p>
            <div className="mt-3 h-24 rounded-md border border-text/20 bg-white/50 p-4">
              <div className="h-full w-full rounded-sm border border-text/15 bg-white/60 opacity-90 transition-opacity duration-calm" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-text/70">{revealedCount}/6</p>
              <button
                type="button"
                className="rounded-md border border-text/20 bg-white/70 px-3 py-1.5 text-xs text-text transition-colors duration-calm hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={revealPattern}
                disabled={isRevealing || isFullyRevealed}
              >
                {m.cast.revealPattern}
              </button>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">{m.cast.primaryHexagram}:</span>{' '}
                {isFullyRevealed ? session.cast?.primaryHexagramId ?? m.cast.unknown : m.cast.unknown}
              </p>
              <p>
                <span className="font-medium">{m.cast.changingLines}:</span>{' '}
                {visibleChanging.length ? visibleChanging.join(', ') : m.cast.unknown}
              </p>
              <p>
                <span className="font-medium">{m.cast.resultingHexagram}:</span>{' '}
                {isFullyRevealed ? session.cast?.resultingHexagramId ?? m.cast.unknown : m.cast.unknown}
              </p>
              <p>
                <span className="font-medium">{m.cast.lineValues}:</span>{' '}
                {lineValueText}
              </p>
            </div>
          </SectionCard>

          {primaryHex ? (
            <SectionCard title={m.cast.primaryHexagram}>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">ID:</span> {primaryHex.id}
                </p>
                <p>
                  <span className="font-medium">Hanzi:</span> {primaryHex.hanzi}
                </p>
                <p>
                  <span className="font-medium">Pinyin:</span> {primaryHex.pinyin}
                </p>
                <p>
                  <span className="font-medium">{lang === 'vi' ? 'Tên' : 'Name'}:</span>{' '}
                  {'name_vi' in primaryHex ? primaryHex.name_vi : primaryHex.name_en}
                </p>
                <p>
                  <span className="font-medium">{lang === 'vi' ? 'Mẫu hình' : 'Archetype'}:</span> {primaryHex.archetype}
                </p>
                <p>
                  <span className="font-medium">{keywordsTitle}:</span> {primaryHex.keywords.join(', ')}
                </p>
                {primaryTrigrams?.lower && primaryTrigrams?.upper ? (
                  <div className="space-y-2 rounded-md border border-text/15 bg-white/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-text/60">{trigramTitle}</p>
                    <p>
                      <span className="font-medium">{lowerTitle}:</span>{' '}
                      {'name_vi' in primaryTrigrams.lower ? primaryTrigrams.lower.name_vi : primaryTrigrams.lower.name_en}
                      {' · '}
                      {elementTitle}: {primaryTrigrams.lower.element}
                      {' · '}
                      {keywordsTitle}: {primaryTrigrams.lower.keywords.join(', ')}
                    </p>
                    <p>
                      <span className="font-medium">{upperTitle}:</span>{' '}
                      {'name_vi' in primaryTrigrams.upper ? primaryTrigrams.upper.name_vi : primaryTrigrams.upper.name_en}
                      {' · '}
                      {elementTitle}: {primaryTrigrams.upper.element}
                      {' · '}
                      {keywordsTitle}: {primaryTrigrams.upper.keywords.join(', ')}
                    </p>
                  </div>
                ) : null}
              </div>
            </SectionCard>
          ) : null}

          {resultingHex ? (
            <SectionCard title={m.cast.resultingHexagram}>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">ID:</span> {resultingHex.id}
                </p>
                <p>
                  <span className="font-medium">Hanzi:</span> {resultingHex.hanzi}
                </p>
                <p>
                  <span className="font-medium">Pinyin:</span> {resultingHex.pinyin}
                </p>
                <p>
                  <span className="font-medium">{lang === 'vi' ? 'Tên' : 'Name'}:</span>{' '}
                  {'name_vi' in resultingHex ? resultingHex.name_vi : resultingHex.name_en}
                </p>
                <p>
                  <span className="font-medium">{lang === 'vi' ? 'Mẫu hình' : 'Archetype'}:</span> {resultingHex.archetype}
                </p>
                <p>
                  <span className="font-medium">{keywordsTitle}:</span> {resultingHex.keywords.join(', ')}
                </p>
                {resultingTrigrams?.lower && resultingTrigrams?.upper ? (
                  <div className="space-y-2 rounded-md border border-text/15 bg-white/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-text/60">{trigramTitle}</p>
                    <p>
                      <span className="font-medium">{lowerTitle}:</span>{' '}
                      {'name_vi' in resultingTrigrams.lower ? resultingTrigrams.lower.name_vi : resultingTrigrams.lower.name_en}
                      {' · '}
                      {elementTitle}: {resultingTrigrams.lower.element}
                      {' · '}
                      {keywordsTitle}: {resultingTrigrams.lower.keywords.join(', ')}
                    </p>
                    <p>
                      <span className="font-medium">{upperTitle}:</span>{' '}
                      {'name_vi' in resultingTrigrams.upper ? resultingTrigrams.upper.name_vi : resultingTrigrams.upper.name_en}
                      {' · '}
                      {elementTitle}: {resultingTrigrams.upper.element}
                      {' · '}
                      {keywordsTitle}: {resultingTrigrams.upper.keywords.join(', ')}
                    </p>
                  </div>
                ) : null}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title={m.cast.summaryTitle}>
            <p className="text-sm text-text/80">{session.input.decision || m.cast.summaryFallback}</p>
            {session.input.stakesBest || session.input.stakesWorst ? (
              <p className="mt-2 text-xs text-text/70">
                {session.input.stakesBest ? `Best: ${session.input.stakesBest}` : ''}
                {session.input.stakesBest && session.input.stakesWorst ? ' | ' : ''}
                {session.input.stakesWorst ? `Worst: ${session.input.stakesWorst}` : ''}
              </p>
            ) : null}
          </SectionCard>

          <p className="text-sm text-accent">{m.cast.dynamicsCopy}</p>

          <ButtonPrimary
            className="w-full"
            onClick={() => {
              const result = generateMirror();
              if (!result.ok) {
                return;
              }
              router.push('/mirror');
            }}
            disabled={!isFullyRevealed}
          >
            {m.cast.mirrorCta}
          </ButtonPrimary>
        </section>
      </Container>
    </main>
  );
}
