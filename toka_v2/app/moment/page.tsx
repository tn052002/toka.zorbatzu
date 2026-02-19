'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import BreathingOrb from '@/components/BreathingOrb';

const BREATH_PAUSE_SECONDS = 5;
const MOMENT_KEY = 'toka_v2:moment_draft';

export default function MomentPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [showBreathPause, setShowBreathPause] = useState(true);
  const [remaining, setRemaining] = useState(BREATH_PAUSE_SECONDS);
  const [question, setQuestion] = useState('');
  const [isCustomQuestion, setIsCustomQuestion] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [enteredAt] = useState(() => new Date());

  const enteredAtText = useMemo(() => {
    return new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(enteredAt);
  }, [enteredAt, lang]);

  useEffect(() => {
    if (!isCustomQuestion) {
      setQuestion(t('momentDefaultQuestion'));
    }
  }, [t, isCustomQuestion]);

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

  const openQuestionModal = () => {
    setDraftQuestion('');
    setShowQuestionModal(true);
  };

  const saveQuestion = () => {
    const next = draftQuestion.trim();
    if (next) {
      setQuestion(next);
      setIsCustomQuestion(true);
    }
    setShowQuestionModal(false);
  };

  const handleConfirm = () => {
    const payload = {
      question: question.trim(),
      domain: selectedDomain || null,
    };
    window.localStorage.setItem(MOMENT_KEY, JSON.stringify(payload));
    router.push('/cast');
  };

  const handleBack = () => {
    router.push('/');
  };

  const domains = [
    { value: 'career', label: t('domainCareer') },
    { value: 'money', label: t('domainMoney') },
    { value: 'relationship', label: t('domainRelationship') },
    { value: 'health', label: t('domainHealth') },
    { value: 'project', label: t('domainProject') },
    { value: 'self', label: t('domainSelf') },
  ];

  return (
    <>
      <main className="moment-root">
        <div className="moment-shell">
          <div className="moment-orb-wrap">
            <BreathingOrb className="moment-orb" />
          </div>

          <section className="moment-section moment-section-primary">
            <p className="moment-entered-at">{enteredAtText}</p>
            <p className="moment-label">{t('momentQuestionLabel')}</p>
            <p className="moment-question">{question}</p>
            <button type="button" className="moment-link-btn" onClick={openQuestionModal}>
              {t('momentCustomQuestion')}
            </button>
          </section>

          <section className="moment-section">
            <div className="moment-domain-head">
              <p className="moment-label">{t('momentDomainTitle')}</p>
              <span className="moment-optional">{t('momentDomainOptional')}</span>
            </div>
            <div className="moment-domain-grid">
              {domains.map((item) => {
                const active = selectedDomain === item.value;
                const muted = Boolean(selectedDomain) && !active;
                return (
                  <button
                    type="button"
                    key={item.value}
                    className={active ? 'domain-chip active' : muted ? 'domain-chip muted' : 'domain-chip'}
                    onClick={() => setSelectedDomain((current) => (current === item.value ? '' : item.value))}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="moment-actions">
            <button type="button" className="moment-back-link" onClick={handleBack}>
              {t('momentBack')}
            </button>
            <button type="button" className="moment-confirm-btn" onClick={handleConfirm}>
              {t('momentConfirm')}
            </button>
          </div>
        </div>
      </main>

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

      {showQuestionModal ? (
        <div className="breath-overlay" role="dialog" aria-modal="true" aria-label={t('momentQuestionModalTitle')}>
          <div className="breath-modal question-modal">
            <p className="breath-title">{t('momentQuestionModalTitle')}</p>
            <textarea
              className="question-textarea"
              placeholder={t('momentDefaultQuestion')}
              value={draftQuestion}
              onChange={(event) => setDraftQuestion(event.target.value)}
            />
            <div className="question-actions">
              <button type="button" className="question-btn ghost" onClick={() => setShowQuestionModal(false)}>
                {t('momentCancel')}
              </button>
              <button type="button" className="question-btn solid" onClick={saveQuestion}>
                {t('momentSaveQuestion')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
