'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ButtonPrimary from '@/components/ButtonPrimary';
import Container from '@/components/Container';
import DebugPanel from '@/components/DebugPanel';
import DevNav from '@/components/DevNav';
import Divider from '@/components/Divider';
import SectionCard from '@/components/SectionCard';
import { useI18n } from '@/lib/i18n';
import { loadSession, type TokaSession } from '@/lib/session';
import { generateMirror } from '@/lib/toka/machine';

export default function CastPage() {
  const router = useRouter();
  const { m } = useI18n();
  const [session, setSession] = useState<TokaSession | null>(null);

  useEffect(() => {
    const loaded = loadSession();
    setSession(loaded);
    if (!loaded.input.decision.trim()) {
      router.replace('/');
    }
  }, [router]);

  if (!session) {
    return null;
  }

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
          </SectionCard>

          <SectionCard>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">{m.cast.primaryHexagram}:</span>{' '}
                {session.cast?.primaryHexagramId ?? m.cast.unknown}
              </p>
              <p>
                <span className="font-medium">{m.cast.changingLines}:</span>{' '}
                {session.cast?.changingLines?.length ? session.cast.changingLines.join(', ') : m.cast.unknown}
              </p>
              <p>
                <span className="font-medium">{m.cast.resultingHexagram}:</span>{' '}
                {session.cast?.resultingHexagramId ?? m.cast.unknown}
              </p>
              <p>
                <span className="font-medium">{m.cast.lineValues}:</span>{' '}
                [7, 8, 9, 7, 8, 6]
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
          >
            {m.cast.mirrorCta}
          </ButtonPrimary>
        </section>
      </Container>
    </main>
  );
}
