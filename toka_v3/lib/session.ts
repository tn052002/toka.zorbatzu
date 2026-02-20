'use client';

import type { EmotionKey } from '@/lib/storage';

export type SessionState = 'input' | 'casted' | 'mirrored';

export type TokaInput = {
  decision: string;
  stakesBest: string;
  stakesWorst: string;
  variables: string;
  emotions: EmotionKey[];
  intensity: number;
};

export type TokaCast = {
  primaryHexagramId: number;
  changingLines: number[];
  resultingHexagramId: number;
};

export type TokaSession = {
  state: SessionState;
  input: TokaInput;
  cast: TokaCast | null;
  createdAt: string;
  updatedAt: string;
};

const SESSION_KEY = 'toka_v3:session';

export function createEmptySession(): TokaSession {
  const now = new Date().toISOString();
  return {
    state: 'input',
    input: {
      decision: '',
      stakesBest: '',
      stakesWorst: '',
      variables: '',
      emotions: [],
      intensity: 3,
    },
    cast: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadSession(): TokaSession {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return createEmptySession();
    }
    const parsed = JSON.parse(raw) as Partial<TokaSession>;
    const base = createEmptySession();
    return {
      ...base,
      ...parsed,
      input: {
        ...base.input,
        ...(parsed.input ?? {}),
      },
      cast: parsed.cast ?? null,
      updatedAt: parsed.updatedAt ?? base.updatedAt,
      createdAt: parsed.createdAt ?? base.createdAt,
    };
  } catch {
    return createEmptySession();
  }
}

export function saveSession(session: TokaSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}
