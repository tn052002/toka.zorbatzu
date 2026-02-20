'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { castPattern, generateMirror, resetSession } from '@/lib/toka/machine';
import { loadSession, type TokaSession } from '@/lib/session';

type DebugPanelProps = {
  onSessionChange?: (session: TokaSession) => void;
};

export default function DebugPanel({ onSessionChange }: DebugPanelProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [session, setSession] = useState<TokaSession | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const on = query.get('dev') === '1';
    setEnabled(on);
    if (on) {
      const s = loadSession();
      setSession(s);
      onSessionChange?.(s);
    }
  }, [onSessionChange]);

  const json = useMemo(() => {
    if (!session) {
      return '';
    }
    return JSON.stringify(session, null, 2);
  }, [session]);

  if (!enabled || !session) {
    return null;
  }

  return (
    <section className="mb-4 rounded-md border border-text/15 bg-white/50 p-3">
      <div className="mb-2 text-xs text-text/70">Debug state: {session.state}</div>
      <pre className="max-h-48 overflow-auto rounded-sm border border-text/10 bg-white/55 p-2 text-[10px] leading-relaxed text-text/75">
        {json}
      </pre>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            const next = resetSession();
            setSession(next);
            onSessionChange?.(next);
          }}
          className="rounded-md border border-text/20 px-2 py-1 text-xs"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => {
            const result = castPattern();
            setSession(result.session);
            onSessionChange?.(result.session);
          }}
          disabled={!session.input.decision.trim()}
          className="rounded-md border border-text/20 px-2 py-1 text-xs disabled:opacity-40"
        >
          Simulate Cast
        </button>
        <button
          type="button"
          onClick={() => {
            const result = generateMirror();
            setSession(result.session);
            onSessionChange?.(result.session);
            if (result.ok) {
              router.push('/mirror?dev=1');
            }
          }}
          disabled={session.state !== 'casted' || !session.cast?.primaryHexagramId}
          className="rounded-md border border-text/20 px-2 py-1 text-xs disabled:opacity-40"
        >
          Go Mirror
        </button>
      </div>
    </section>
  );
}
