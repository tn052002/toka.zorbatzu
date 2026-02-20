export const STORAGE_KEYS = {
  draft: 'toka_v3:decision_draft',
  cast: 'toka_v3:cast_snapshot',
};

export type EmotionKey =
  | 'calm'
  | 'anxious'
  | 'curious'
  | 'determined'
  | 'fearful'
  | 'conflicted';

export type DecisionDraft = {
  decision: string;
  bestCase: string;
  worstCase: string;
  knownVariables: string;
  emotions: EmotionKey[];
  intensity: number;
};

export type CastSnapshot = {
  lineValues: Array<6 | 7 | 8 | 9>;
  primaryHexagram: string;
  changingLines: number[];
  resultingHexagram: string;
};

export const DEFAULT_DRAFT: DecisionDraft = {
  decision: '',
  bestCase: '',
  worstCase: '',
  knownVariables: '',
  emotions: [],
  intensity: 3,
};

export const DEFAULT_CAST: CastSnapshot = {
  lineValues: [7, 8, 9, 7, 8, 6],
  primaryHexagram: 'Hexagram 31 (placeholder)',
  changingLines: [3, 6],
  resultingHexagram: 'Hexagram 62 (placeholder)',
};
