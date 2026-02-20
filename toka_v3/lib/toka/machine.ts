'use client';

import {
  clearSession,
  createEmptySession,
  loadSession,
  saveSession,
  type TokaCast,
  type TokaInput,
  type TokaSession,
} from '@/lib/session';

type TransitionResult = {
  ok: boolean;
  session: TokaSession;
  error?: string;
};

function updateAndPersist(session: TokaSession): TokaSession {
  const next: TokaSession = {
    ...session,
    updatedAt: new Date().toISOString(),
  };
  saveSession(next);
  return next;
}

function toHexId(value: number): number {
  return ((value % 64) + 64) % 64 || 64;
}

function hashFromInput(input: TokaInput): number {
  const source = `${input.decision}|${input.stakesBest}|${input.stakesWorst}|${input.variables}|${input.emotions.join(',')}|${input.intensity}`;
  let hash = 7;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 104729;
  }
  return hash;
}

function createDeterministicCast(input: TokaInput): TokaCast {
  const hash = hashFromInput(input);
  const primaryHexagramId = toHexId(hash);
  const resultingHexagramId = toHexId(hash + 17);
  const changingLines = [1, 2, 3, 4, 5, 6].filter((line) => ((hash >> line) & 1) === 1);
  return {
    primaryHexagramId,
    changingLines,
    resultingHexagramId,
  };
}

export function submitInput(payload: TokaInput): TransitionResult {
  const current = loadSession();
  if (!payload.decision.trim()) {
    return {
      ok: false,
      session: current,
      error: 'Decision is required.',
    };
  }

  const next = updateAndPersist({
    ...current,
    state: 'input',
    input: {
      ...payload,
      decision: payload.decision.trim(),
    },
    cast: null,
  });

  return { ok: true, session: next };
}

export function castPattern(): TransitionResult {
  const current = loadSession();
  if (!current.input.decision.trim()) {
    return {
      ok: false,
      session: current,
      error: 'Cannot cast without decision input.',
    };
  }

  const cast = createDeterministicCast(current.input);
  const next = updateAndPersist({
    ...current,
    state: 'casted',
    cast,
  });

  return { ok: true, session: next };
}

export function generateMirror(): TransitionResult {
  const current = loadSession();
  if (current.state !== 'casted' || !current.cast?.primaryHexagramId) {
    return {
      ok: false,
      session: current,
      error: 'Cannot mirror before cast is complete.',
    };
  }

  const next = updateAndPersist({
    ...current,
    state: 'mirrored',
  });

  return { ok: true, session: next };
}

export function resetSession(): TokaSession {
  clearSession();
  const empty = createEmptySession();
  saveSession(empty);
  return empty;
}
