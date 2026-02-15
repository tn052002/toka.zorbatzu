'use client';

import { useEffect, useState } from 'react';
import { clearDraft, loadDraft, saveDraft } from './storage';
import type { DraftMoment, Domain } from './types';

type DraftActions = {
  initDraft: () => DraftMoment;
  setDomain: (domain: Domain, otherText?: string) => DraftMoment;
  setQuestion: (text: string) => DraftMoment;
  toggleTension: (key: string) => void;
  clearTensions: () => void;
  setCastMode: (mode: DraftMoment['cast_mode']) => DraftMoment;
  setCastResult: (result: {
    lines: number[];
    changing_lines: number[];
    primary_hex_id: number;
    relating_hex_id: number | null;
  }) => DraftMoment;
  setLines: (lines: number[]) => DraftMoment;
  setAiStatus: (status: DraftMoment['ai_status']) => DraftMoment;
  setAiOutput: (output: DraftMoment['ai_output']) => DraftMoment;
  clearCastResult: () => DraftMoment;
  resetDraft: () => void;
};

type DraftStore = {
  draft: DraftMoment | null;
} & DraftActions;

let currentDraft: DraftMoment | null = null;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const ensureDraft = (): DraftMoment => {
  if (!currentDraft) {
    const loaded = loadDraft();
    currentDraft =
      loaded ??
      ({
        id: generateId(),
        created_at: new Date().toISOString(),
        domain: null,
        question_text: '',
        tensions: [],
        cast_mode: null,
      } satisfies DraftMoment);
  }
  if (!Array.isArray(currentDraft.tensions)) {
    currentDraft = { ...currentDraft, tensions: [] };
  }
  return currentDraft;
};

const updateDraft = (next: DraftMoment) => {
  currentDraft = next;
  saveDraft(next);
  notify();
};

export const useDraftMoment = (): DraftStore => {
  const [draft, setDraft] = useState<DraftMoment | null>(() => {
    return typeof window === 'undefined' ? null : loadDraft();
  });

  useEffect(() => {
    const handle = () => setDraft(currentDraft);
    listeners.add(handle);
    if (!currentDraft) {
      currentDraft = loadDraft();
      setDraft(currentDraft);
    }
    return () => {
      listeners.delete(handle);
    };
  }, []);

  const initDraft = () => {
    const draftValue = ensureDraft();
    updateDraft(draftValue);
    return draftValue;
  };

  const setDomain = (domain: Domain, otherText?: string) => {
    const base = ensureDraft();
    const next: DraftMoment = {
      ...base,
      domain,
      domain_other_text: otherText,
    };
    updateDraft(next);
    return next;
  };

  const setQuestion = (text: string) => {
    const base = ensureDraft();
    const next: DraftMoment = { ...base, question_text: text };
    updateDraft(next);
    return next;
  };

  const toggleTension = (key: string) => {
    const base = ensureDraft();
    const current = Array.isArray(base.tensions) ? base.tensions : [];
    const hasKey = current.includes(key);
    const tensions = hasKey ? current.filter((item) => item !== key) : [...current, key];
    const next: DraftMoment = { ...base, tensions };
    updateDraft(next);
  };

  const clearTensions = () => {
    const base = ensureDraft();
    const next: DraftMoment = { ...base, tensions: [] };
    updateDraft(next);
  };

  const setCastMode = (mode: DraftMoment['cast_mode']) => {
    const base = ensureDraft();
    const next: DraftMoment = { ...base, cast_mode: mode };
    updateDraft(next);
    return next;
  };

  const setCastResult = (result: {
    lines: number[];
    changing_lines: number[];
    primary_hex_id: number;
    relating_hex_id: number | null;
  }) => {
    const base = ensureDraft();
    const next: DraftMoment = {
      ...base,
      ...result,
      ai_output: undefined,
      ai_status: 'idle',
    };
    updateDraft(next);
    return next;
  };

  const setLines = (lines: number[]) => {
    const base = ensureDraft();
    const next: DraftMoment = { ...base, lines };
    updateDraft(next);
    return next;
  };

  const setAiStatus = (status: DraftMoment['ai_status']) => {
    const base = ensureDraft();
    const next: DraftMoment = { ...base, ai_status: status };
    updateDraft(next);
    return next;
  };

  const setAiOutput = (output: DraftMoment['ai_output']) => {
    const base = ensureDraft();
    const next: DraftMoment = { ...base, ai_output: output, ai_status: 'ready' };
    updateDraft(next);
    return next;
  };

  const clearCastResult = () => {
    const base = ensureDraft();
    const next: DraftMoment = {
      ...base,
      lines: undefined,
      changing_lines: undefined,
      primary_hex_id: undefined,
      relating_hex_id: undefined,
    };
    updateDraft(next);
    return next;
  };

  const resetDraft = () => {
    currentDraft = null;
    clearDraft();
    notify();
  };

  return {
    draft,
    initDraft,
    setDomain,
    setQuestion,
    toggleTension,
    clearTensions,
    setCastMode,
    setCastResult,
    setLines,
    setAiStatus,
    setAiOutput,
    clearCastResult,
    resetDraft,
  };
};
