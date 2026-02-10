import meaningsEn from '@/data/hex_meanings_en.json';
import meaningsVi from '@/data/hex_meanings_vi.json';
import type { InterpretInput, InterpretOutput } from './schema';
import type { DraftMoment } from '@/lib/moment/types';

type MeaningsStore = typeof meaningsEn;

const fallbackMovementByLang: Record<'en' | 'vi', string[]> = {
  en: [
    'Movement is present, but may be hard to name clearly.',
    'More than one interpretation may fit this moment.',
  ],
  vi: ['Có chuyển động, nhưng khó gọi tên rõ.', 'Nhiều cách hiểu có thể cùng phù hợp.'],
};

const getHex = (id: number, store: MeaningsStore, fallbackMovement: string[]) => {
  const found = store.hexagrams?.[String(id)];
  if (found) {
    return found;
  }
  const fallback = store.fallback?.hexagram;
  return {
    id: 0,
    layman_title: fallback?.layman_title ?? 'Unclear Pattern',
    traditional: {},
    present_state: fallback?.present_state ?? fallbackMovement,
    keywords: [],
    domains_hint: [],
  };
};

const getOverlay = (line: number, store: MeaningsStore, fallback: string[]) => {
  const items = store.line_position_overlay?.[String(line)];
  if (items && items.length >= 2) {
    return items.slice(0, 2);
  }
  return fallback;
};

const getMeaningsForLang = (lang: 'en' | 'vi') => (lang === 'vi' ? meaningsVi : meaningsEn);

export const buildInterpretInput = (
  draft: DraftMoment,
  lang: 'en' | 'vi',
): InterpretInput | null => {
  if (!draft.domain || !draft.question_text || !draft.primary_hex_id) {
    return null;
  }

  const store = getMeaningsForLang(lang);
  const fallbackMovement = fallbackMovementByLang[lang] ?? fallbackMovementByLang.en;
  const primary = getHex(draft.primary_hex_id, store, fallbackMovement);
  const relating = typeof draft.relating_hex_id === 'number'
    ? getHex(draft.relating_hex_id, store, fallbackMovement)
    : null;

  const changingLines = draft.changing_lines ?? [];
  const overlays: Record<string, string[]> = {};
  changingLines.forEach((line) => {
    overlays[String(line)] = getOverlay(line, store, fallbackMovement);
  });

  return {
    domain: draft.domain,
    question_text: draft.question_text,
    primary: {
      layman_title: primary.layman_title,
      present_state: primary.present_state,
    },
    movement: {
      changing_lines: changingLines,
      overlays,
    },
    relating: relating
      ? {
          layman_title: relating.layman_title,
          present_state: relating.present_state,
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
