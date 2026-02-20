'use client';

import type { EmotionKey } from '@/lib/storage';
import type { LineValue } from '@/lib/toka/iching';

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
  lineValues: LineValue[];
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
    const normalizedValues =
      parsed.cast && Array.isArray(parsed.cast.lineValues)
        ? parsed.cast.lineValues.filter((value): value is LineValue => value === 6 || value === 7 || value === 8 || value === 9)
        : [];
    const cast =
      parsed.cast &&
      normalizedValues.length === 6 &&
      typeof parsed.cast.primaryHexagramId === 'number' &&
      Array.isArray(parsed.cast.changingLines) &&
      typeof parsed.cast.resultingHexagramId === 'number'
        ? {
            lineValues: normalizedValues,
            primaryHexagramId: parsed.cast.primaryHexagramId,
            changingLines: parsed.cast.changingLines.filter((line): line is number => Number.isInteger(line)),
            resultingHexagramId: parsed.cast.resultingHexagramId,
          }
        : null;

    return {
      ...base,
      ...parsed,
      input: {
        ...base.input,
        ...(parsed.input ?? {}),
      },
      cast,
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
