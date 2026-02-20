'use client';

import Container from '@/components/Container';
import { useI18n } from '@/lib/i18n';

export default function OfflinePage() {
  const { m } = useI18n();

  return (
    <main className="toka-page fade-in">
      <Container className="max-w-md">
        <section className="rounded-md border border-text/15 bg-white/40 p-6 text-center">
          <h1 className="font-serif text-2xl">{m.offline.title}</h1>
          <p className="mt-3 text-sm text-text/75">{m.offline.body}</p>
        </section>
      </Container>
    </main>
  );
}
