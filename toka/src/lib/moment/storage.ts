import type { DraftMoment } from './types';

export const DRAFT_KEY = 'toka:draft';

const asString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

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

const migrateAiOutput = (value: unknown): DraftMoment['ai_output'] | undefined => {
  if (isV2AiOutput(value)) {
    return value;
  }
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const legacy = value as {
    mirror_map?: {
      you_described?: unknown;
      two_pulls?: unknown;
      cost_to_lose?: unknown;
      unknowns?: unknown;
    };
    opening_question?: unknown;
    cold_mirror_sentence?: unknown;
  };

  const youDescribed = Array.isArray(legacy.mirror_map?.you_described)
    ? legacy.mirror_map?.you_described
    : [];
  const twoPulls = Array.isArray(legacy.mirror_map?.two_pulls)
    ? legacy.mirror_map?.two_pulls
    : [];
  const costToLose = Array.isArray(legacy.mirror_map?.cost_to_lose)
    ? legacy.mirror_map?.cost_to_lose
    : [];
  const unknowns = Array.isArray(legacy.mirror_map?.unknowns)
    ? legacy.mirror_map?.unknowns
    : [];

  const whatIsUnfolding = asString(youDescribed[0]) || asString(twoPulls[0]) || asString(costToLose[0]);
  const whereYouStand = asString(youDescribed[1]) || asString(twoPulls[1]) || asString(unknowns[0]);
  const tensionToNotice = asString(costToLose[1]) || asString(unknowns[1]) || asString(youDescribed[2]);
  const closingQuestion = asString(legacy.opening_question) || asString(legacy.cold_mirror_sentence);

  if (!whatIsUnfolding && !whereYouStand && !tensionToNotice && !closingQuestion) {
    return undefined;
  }

  return {
    narrative: {
      what_is_unfolding: whatIsUnfolding || 'The question names a present tension.',
      where_you_stand: whereYouStand || 'You appear to be balancing more than one pull.',
      tension_to_notice: tensionToNotice || 'The central tension remains active in this moment.',
    },
    closing_question: closingQuestion || 'What part of this feels most alive right now?',
  };
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
    const aiOutput = migrateAiOutput((parsed as { ai_output?: unknown }).ai_output);
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
