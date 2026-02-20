'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ButtonPrimary from '@/components/ButtonPrimary';
import Chip from '@/components/Chip';
import Container from '@/components/Container';
import DebugPanel from '@/components/DebugPanel';
import DevNav from '@/components/DevNav';
import Divider from '@/components/Divider';
import LocaleToggle from '@/components/LocaleToggle';
import SectionCard from '@/components/SectionCard';
import { useI18n } from '@/lib/i18n';
import type { EmotionKey } from '@/lib/storage';
import { loadSession, type TokaInput, type TokaSession } from '@/lib/session';
import { castPattern, submitInput } from '@/lib/toka/machine';

const EMOTION_KEYS: EmotionKey[] = ['calm', 'anxious', 'curious', 'determined', 'fearful', 'conflicted'];

export default function DecisionGatePage() {
  const router = useRouter();
  const { m } = useI18n();
  const [draft, setDraft] = useState<TokaInput>({
    decision: '',
    stakesBest: '',
    stakesWorst: '',
    variables: '',
    emotions: [],
    intensity: 3,
  });
  const [showStakes, setShowStakes] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showEmotion, setShowEmotion] = useState(false);

  useEffect(() => {
    const session = loadSession();
    setDraft(session.input);
  }, []);

  const emotionLabels = useMemo(
    () =>
      new Map<EmotionKey, string>([
        ['calm', 'Calm'],
        ['anxious', 'Anxious'],
        ['curious', 'Curious'],
        ['determined', 'Determined'],
        ['fearful', 'Fearful'],
        ['conflicted', 'Conflicted'],
      ]),
    [],
  );

  const updateField = <K extends keyof TokaInput>(key: K, value: TokaInput[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const toggleEmotion = (key: EmotionKey) => {
    setDraft((current) => {
      const exists = current.emotions.includes(key);
      return {
        ...current,
        emotions: exists ? current.emotions.filter((item) => item !== key) : [...current.emotions, key],
      };
    });
  };

  const goCast = () => {
    const submitted = submitInput(draft);
    if (!submitted.ok) {
      return;
    }
    const casted = castPattern();
    if (!casted.ok) {
      return;
    }
    router.push('/cast');
  };

  return (
    <main className="toka-page fade-in">
      <Container>
        <DevNav />
        <DebugPanel onSessionChange={(session: TokaSession) => setDraft(session.input)} />

        <header className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl leading-tight">{m.common.appName}</h1>
              <p className="mt-1 text-sm text-text/75">{m.common.tagline}</p>
            </div>
            <LocaleToggle />
          </div>
          <Divider />
          <p className="text-sm text-accent">{m.gate.subtitle}</p>
        </header>

        <section className="mt-4 space-y-4">
          <SectionCard>
            <label className="mb-2 block text-sm text-text/80" htmlFor="decision">
              {m.gate.decisionLabel}
            </label>
            <textarea
              id="decision"
              rows={5}
              placeholder={m.gate.decisionPlaceholder}
              value={draft.decision}
              onChange={(event) => updateField('decision', event.target.value)}
            />
          </SectionCard>

          <SectionCard>
            <button
              type="button"
              className="w-full text-left text-sm font-medium text-text"
              onClick={() => setShowStakes((value) => !value)}
            >
              {m.gate.stakesTitle}
            </button>
            {showStakes ? (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-text/75" htmlFor="best-case">
                    {m.gate.stakesBestLabel}
                  </label>
                  <input
                    id="best-case"
                    type="text"
                    value={draft.stakesBest}
                    onChange={(event) => updateField('stakesBest', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text/75" htmlFor="worst-case">
                    {m.gate.stakesWorstLabel}
                  </label>
                  <input
                    id="worst-case"
                    type="text"
                    value={draft.stakesWorst}
                    onChange={(event) => updateField('stakesWorst', event.target.value)}
                  />
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard>
            <button
              type="button"
              className="w-full text-left text-sm font-medium text-text"
              onClick={() => setShowVariables((value) => !value)}
            >
              {m.gate.variablesLabel}
            </button>
            {showVariables ? (
              <div className="mt-3 space-y-2">
                <textarea
                  rows={4}
                  placeholder={m.gate.variablesPlaceholder}
                  value={draft.variables}
                  onChange={(event) => updateField('variables', event.target.value)}
                />
                <p className="text-xs text-text/65">{m.gate.variablesHint}</p>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard>
            <button
              type="button"
              className="w-full text-left text-sm font-medium text-text"
              onClick={() => setShowEmotion((value) => !value)}
            >
              {m.gate.emotionTitle}
            </button>
            {showEmotion ? (
              <div className="mt-3 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {EMOTION_KEYS.map((emotion) => (
                    <Chip
                      key={emotion}
                      selected={draft.emotions.includes(emotion)}
                      onClick={() => toggleEmotion(emotion)}
                    >
                      {emotionLabels.get(emotion) ?? emotion}
                    </Chip>
                  ))}
                </div>
                <div>
                  <label className="mb-2 block text-xs text-text/75" htmlFor="intensity">
                    {m.gate.intensityLabel}: {draft.intensity}
                  </label>
                  <input
                    id="intensity"
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={draft.intensity}
                    onChange={(event) => updateField('intensity', Number(event.target.value))}
                  />
                </div>
              </div>
            ) : null}
          </SectionCard>

          <ButtonPrimary className="w-full" onClick={goCast}>
            {m.gate.castCta}
          </ButtonPrimary>
        </section>
      </Container>
    </main>
  );
}
