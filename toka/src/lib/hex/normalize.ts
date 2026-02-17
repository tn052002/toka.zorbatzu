export type HexMeaningNormalized = {
  id?: number;
  laymantitle: string;
  traditional?: { name_en?: string; pinyin?: string; han_viet?: string };
  core_image?: { vi?: string; en?: string } | null;
  structure?: {
    core_structure?: string[];
    structural_nature?: string[];
    inherent_tension?: string;
  } | null;
  keywords?: string[];
  domains_hint?: string[];
  // TODO: remove legacy present_state after migration complete.
  present_state?: string[] | null;
};

export function normalizeHexMeaning(hex: any): HexMeaningNormalized {
  return {
    id: hex?.id,
    laymantitle: hex?.laymantitle ?? hex?.layman_title ?? '',
    traditional: hex?.traditional ?? undefined,
    core_image: hex?.core_image ?? null,
    structure: hex?.structure ?? null,
    keywords: Array.isArray(hex?.keywords) ? hex.keywords : [],
    domains_hint: Array.isArray(hex?.domains_hint) ? hex.domains_hint : [],
    present_state: Array.isArray(hex?.present_state) ? hex.present_state : null,
  };
}
