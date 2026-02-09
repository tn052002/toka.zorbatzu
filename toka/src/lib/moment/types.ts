export type Domain = 'work' | 'money' | 'relationship' | 'health' | 'project' | 'inner' | 'other';

export type DraftMoment = {
  id: string;
  created_at: string;
  domain: Domain | null;
  domain_other_text?: string;
  question_text: string;
  cast_mode: 'quick' | 'ritual' | null;
  lines?: number[];
  changing_lines?: number[];
  primary_hex_id?: number;
  relating_hex_id?: number | null;
};
