'use client';

import {
  clearSession,
  createEmptySession,
  loadSession,
  saveSession,
  type TokaInput,
  type TokaSession,
} from '@/lib/session';
import { castQuickValues, computeCast } from '@/lib/toka/iching';

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

  const cast = computeCast(castQuickValues());
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
