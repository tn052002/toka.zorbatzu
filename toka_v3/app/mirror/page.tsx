'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ButtonPrimary from '@/components/ButtonPrimary';
import Container from '@/components/Container';
import DebugPanel from '@/components/DebugPanel';
import DevNav from '@/components/DevNav';
import Divider from '@/components/Divider';
import SectionCard from '@/components/SectionCard';
import { useI18n } from '@/lib/i18n';
import { loadSession, type TokaSession } from '@/lib/session';
import { resetSession } from '@/lib/toka/machine';

export default function MirrorPage() {
  const router = useRouter();
  const { m } = useI18n();
  const [copied, setCopied] = useState(false);
  const [session, setSession] = useState<TokaSession | null>(null);

  useEffect(() => {
    const loaded = loadSession();
    setSession(loaded);
    if (loaded.state !== 'mirrored' || !loaded.cast?.primaryHexagramId) {
      router.replace('/cast');
    }
  }, [router]);

  if (!session) {
    return null;
  }

  const blocks = useMemo(
    () => [
      m.mirror.framing,
      m.mirror.power,
      m.mirror.risk,
      m.mirror.timing,
      m.mirror.bias,
      m.mirror.counterfactual,
    ],
    [m],
  );

  const clearAndReturn = () => {
    resetSession();
    window.sessionStorage.clear();
    router.push('/');
  };

  const copyText = async () => {
    const text = blocks.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="toka-page fade-in">
      <Container>
        <DevNav />
        <DebugPanel onSessionChange={setSession} />

        <header className="space-y-3">
          <h1 className="font-serif text-2xl">{m.mirror.title}</h1>
          <Divider />
        </header>

        <section className="mt-4 space-y-3">
          {blocks.slice(0, 5).map((title) => (
            <SectionCard key={title} title={title}>
              <p className="text-sm text-text/75">Placeholder reflection content.</p>
            </SectionCard>
          ))}

          <SectionCard title={m.mirror.counterfactual}>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border border-text/15 bg-white/40 p-3 text-sm">{m.mirror.scenarioA}</div>
              <div className="rounded-md border border-text/15 bg-white/40 p-3 text-sm">{m.mirror.scenarioB}</div>
              <div className="rounded-md border border-text/15 bg-white/40 p-3 text-sm">{m.mirror.scenarioC}</div>
            </div>
          </SectionCard>

          <div className="grid gap-2">
            <ButtonPrimary className="w-full" onClick={clearAndReturn}>
              {m.mirror.sitWithThis}
            </ButtonPrimary>
            <button
              type="button"
              onClick={copyText}
              className="rounded-md border border-text/20 px-4 py-2 text-sm text-text transition-colors duration-calm hover:border-text/40"
            >
              {copied ? m.mirror.copied : m.mirror.copy}
            </button>
          </div>
        </section>
      </Container>
    </main>
  );
}
