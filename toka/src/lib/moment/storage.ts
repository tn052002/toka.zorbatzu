import type { DraftMoment } from './types';

export const DRAFT_KEY = 'toka:draft';

const isV2AiOutput = (value: unknown): value is NonNullable<DraftMoment['ai_output']> => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as {
    narrative?: {
      what_is_unfolding?: unknown;
      where_you_stand?: unknown;
      tension_to_notice?: unknown;
    };
    closing_question?: unknown;
  };
  return Boolean(
    candidate.narrative
      && typeof candidate.narrative === 'object'
      && typeof candidate.narrative.what_is_unfolding === 'string'
      && typeof candidate.narrative.where_you_stand === 'string'
      && typeof candidate.narrative.tension_to_notice === 'string'
      && typeof candidate.closing_question === 'string',
  );
};

export const loadDraft = (): DraftMoment | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DraftMoment;
    const aiOutput = isV2AiOutput((parsed as { ai_output?: unknown }).ai_output)
      ? (parsed as { ai_output?: DraftMoment['ai_output'] }).ai_output
      : undefined;
    const aiStatus = aiOutput ? parsed.ai_status : parsed.ai_status === 'loading' ? 'idle' : parsed.ai_status;
    return {
      ...parsed,
      tensions: Array.isArray(parsed.tensions) ? parsed.tensions : [],
      ai_output: aiOutput,
      ai_status: aiStatus,
    };
  } catch {
    return null;
  }
};

export const saveDraft = (draft: DraftMoment): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
};

export const clearDraft = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(DRAFT_KEY);
};
