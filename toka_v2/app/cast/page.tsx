'use client';

import { useEffect, useState } from 'react';

const MOMENT_KEY = 'toka_v2:moment_draft';

export default function CastPlaceholderPage() {
  const [payload, setPayload] = useState<{ question?: string; domain?: string | null } | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(MOMENT_KEY);
      if (raw) {
        setPayload(JSON.parse(raw));
      }
    } catch {
      setPayload(null);
    }
  }, []);

  return (
    <main className="moment-root" style={{ textAlign: 'center', paddingInline: 16 }}>
      <div className="moment-shell" style={{ gap: 10 }}>
        <section className="moment-section" style={{ textAlign: 'left' }}>
          <p className="moment-label">Cast Placeholder</p>
          <p className="moment-question" style={{ marginTop: 10 }}>{payload?.question || 'No question found.'}</p>
          <p style={{ margin: '8px 0 0', color: 'rgba(234,242,255,.72)', fontSize: 13 }}>
            Domain: {payload?.domain || 'none'}
          </p>
        </section>
      </div>
    </main>
  );
}
