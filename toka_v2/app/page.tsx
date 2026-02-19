'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import BreathingOrb from '@/components/BreathingOrb';

export default function HomePage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [typedQuote, setTypedQuote] = useState('');

  const quotes = useMemo(
    () =>
      lang === 'vi'
        ? [
            'Thấy nhịp trước khi thấy hướng.',
            'Đặt tên lực kéo đang vận hành.',
            'Giữ yên để hình thế tự hiện.',
            'Điểm nghẽn nhỏ đổi toàn cục.',
            'Đúng nhịp thì thế mở.',
          ]
        : [
            'See the rhythm before the direction.',
            'Name the force that is pulling now.',
            'Hold still and let the pattern appear.',
            'A small bottleneck shifts the whole field.',
            'When timing aligns, the path opens.',
          ],
    [lang],
  );

  useEffect(() => {
    setQuoteIndex(0);
  }, [lang]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % quotes.length);
    }, 5800);
    return () => window.clearInterval(timer);
  }, [quotes]);

  useEffect(() => {
    const full = quotes[quoteIndex] ?? '';
    setTypedQuote('');
    if (!full) {
      return;
    }

    let pointer = 0;
    const stepMs = Math.max(22, Math.floor(2200 / full.length));
    const typer = window.setInterval(() => {
      pointer += 1;
      setTypedQuote(full.slice(0, pointer));
      if (pointer >= full.length) {
        window.clearInterval(typer);
      }
    }, stepMs);

    return () => window.clearInterval(typer);
  }, [quoteIndex, quotes]);

  const enter = () => {
    router.push('/moment');
  };

  return (
    <main className="home-root">
      <div className="quote-loop" aria-live="polite">
        <p key={`${lang}-${quoteIndex}`} className="quote-line">
          {typedQuote}
        </p>
      </div>

      <BreathingOrb onClick={enter} ariaLabel={t('enterAria')} />

      <p className="hint">{t('touchToEnter')}</p>
    </main>
  );
}
