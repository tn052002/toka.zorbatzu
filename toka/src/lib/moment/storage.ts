import type { DraftMoment } from './types';

export const DRAFT_KEY = 'toka:draft';

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
    return {
      ...parsed,
      tensions: Array.isArray(parsed.tensions) ? parsed.tensions : [],
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
