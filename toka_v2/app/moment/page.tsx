'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

const BREATH_PAUSE_SECONDS = 5;

export default function MomentPage() {
  const { t } = useI18n();
  const [showBreathPause, setShowBreathPause] = useState(true);
  const [remaining, setRemaining] = useState(BREATH_PAUSE_SECONDS);

  useEffect(() => {
    if (!showBreathPause) {
      return;
    }
    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setShowBreathPause(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [showBreathPause]);

  const closePause = () => {
    setShowBreathPause(false);
  };

  return (
    <>
      <main className="moment-root">{t('momentEntry')}</main>

      {showBreathPause ? (
        <div className="breath-overlay" role="dialog" aria-modal="true" aria-label={t('breathTitle')}>
          <div className="breath-modal">
            <p className="breath-title">{t('breathTitle')}</p>
            <p className="breath-body">{t('breathBody')}</p>
            <p className="breath-count">
              {remaining} {t('breathSeconds')}
            </p>
            <button type="button" onClick={closePause} className="breath-skip">
              {t('breathSkip')}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
