export type Domain = 'work' | 'money' | 'relationship' | 'health' | 'project' | 'inner' | 'other';

export type DraftMoment = {
  id: string;
  created_at: string;
  domain: Domain | null;
  domain_other_text?: string;
  question_text: string;
  tensions?: string[];
  cast_mode: 'quick' | 'ritual' | null;
  lines?: number[];
  changing_lines?: number[];
  primary_hex_id?: number;
  relating_hex_id?: number | null;
  ai_output?: {
    narrative: {
      what_is_unfolding: string;
      where_you_stand: string;
      tension_to_notice: string;
    };
    closing_question: string;
  };
  ai_status?: 'idle' | 'loading' | 'ready' | 'error';
};
