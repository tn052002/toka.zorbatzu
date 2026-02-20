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
import { loadSession, type TokaSession } from '@/lib/session';
import { castPattern, generateMirror } from '@/lib/toka/machine';

export default function CastPage() {
  const router = useRouter();
  const { m } = useI18n();
  const [session, setSession] = useState<TokaSession | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const revealTimer = useRef<number | null>(null);

  useEffect(() => {
    const loaded = loadSession();
    setSession(loaded);
    if (!loaded.input.decision.trim()) {
      router.replace('/');
    }
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

  if (!session) {
    return null;
  }

  const isFullyRevealed = revealedCount >= 6;
  const visibleValues = session.cast?.lineValues.slice(0, revealedCount) ?? [];
  const lineValueText = `[${Array.from({ length: 6 }, (_, index) => visibleValues[index] ?? '_').join(', ')}]`;
  const visibleChanging = session.cast?.changingLines.filter((line) => line <= revealedCount) ?? [];

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
