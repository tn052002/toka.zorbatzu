'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

export default function DevNav() {
  const { m } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      setShow(false);
      return;
    }
    const query = new URLSearchParams(window.location.search);
    setShow(query.get('dev') === '1');
  }, []);

  if (!show) {
    return null;
  }

  return (
    <nav className="mb-4 flex items-center gap-2 text-xs">
      <Link href="/?dev=1" className="rounded-md border border-text/20 px-2 py-1 hover:border-text/40">
        {m.common.devNavGate}
      </Link>
      <Link href="/cast?dev=1" className="rounded-md border border-text/20 px-2 py-1 hover:border-text/40">
        {m.common.devNavCast}
      </Link>
      <Link href="/mirror?dev=1" className="rounded-md border border-text/20 px-2 py-1 hover:border-text/40">
        {m.common.devNavMirror}
      </Link>
    </nav>
  );
}
