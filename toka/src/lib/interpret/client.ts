import meaningsEn from '@/data/hex_meanings_en.json';
import meaningsVi from '@/data/hex_meanings_vi.json';
import type { InterpretInput, InterpretOutput } from './schema';
import type { DraftMoment } from '@/lib/moment/types';

type MeaningsStore = {
  version: string;
  hexagrams: Record<string, HexMeaningV2>;
  line_position_overlay?: Record<string, string[]>;
  fallback?: HexMeaningV2;
};

type HexMeaningV2 = {
  id: number;
  laymantitle: string;
  core_image: string;
  structure: {
    core_structure: string[];
    structural_nature: string[];
    inherent_tension: string;
  };
  keywords: string[];
  domains_hint: string[];
};

const fallbackMovementByLang: Record<'en' | 'vi', string[]> = {
  en: [
    'Movement is present, but may be hard to name clearly.',
    'More than one interpretation may fit this moment.',
  ],
  vi: ['Có chuyển động, nhưng khó gọi tên rõ.', 'Nhiều cách hiểu có thể cùng phù hợp.'],
};

const getHex = (id: number, store: MeaningsStore): HexMeaningV2 => {
  const found = store.hexagrams[String(id)];
  if (found) {
    return found;
  }

  const fallback = store.fallback;
  if (!fallback) {
    throw new Error(`Missing fallback hex meaning for id ${id}.`);
  }
  return { ...fallback, id };
};

const getOverlay = (line: number, store: MeaningsStore, fallback: string[]) => {
  const linePositionOverlay = store.line_position_overlay as Record<string, string[]> | undefined;
  const items = linePositionOverlay?.[String(line)];
  if (items && items.length >= 2) {
    return items.slice(0, 2);
  }
  return fallback;
};

const getMeaningsForLang = (lang: 'en' | 'vi'): MeaningsStore =>
  (lang === 'vi' ? (meaningsVi as MeaningsStore) : (meaningsEn as MeaningsStore));

export const buildInterpretInput = (
  draft: DraftMoment,
  lang: 'en' | 'vi',
): InterpretInput | null => {
  if (!draft.domain || !draft.question_text || !draft.primary_hex_id) {
    return null;
  }

  const store = getMeaningsForLang(lang);
  const fallbackMovement = fallbackMovementByLang[lang] ?? fallbackMovementByLang.en;
  const primary = getHex(draft.primary_hex_id, store);
  const relating = typeof draft.relating_hex_id === 'number'
    ? getHex(draft.relating_hex_id, store)
    : null;

  const changingLines = draft.changing_lines ?? [];
  const tensions = Array.isArray(draft.tensions) ? draft.tensions.filter(Boolean) : [];
  const overlays: Record<string, string[]> = {};
  changingLines.forEach((line) => {
    overlays[String(line)] = getOverlay(line, store, fallbackMovement);
  });

  return {
    domain: draft.domain,
    question_text: draft.question_text,
    tensions,
    primary: {
      id: primary.id,
      laymantitle: primary.laymantitle,
      core_image: primary.core_image,
      structure: primary.structure,
      keywords: primary.keywords,
      domains_hint: primary.domains_hint,
    },
    movement: {
      changing_lines: changingLines,
      overlays,
    },
    relating: relating
      ? {
          id: relating.id,
          laymantitle: relating.laymantitle,
          core_image: relating.core_image,
          structure: relating.structure,
          keywords: relating.keywords,
          domains_hint: relating.domains_hint,
        }
      : null,
  };
};

export const requestInterpretation = async (input: InterpretInput): Promise<InterpretOutput | null> => {
  const response = await fetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as InterpretOutput;
  return data ?? null;
};
