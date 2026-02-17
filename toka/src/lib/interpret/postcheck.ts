import type { InterpretOutput } from './schema';

const bannedPattern = /(should|must|need to|recommend|try to|avoid|will happen|you will|going to|soon|next week)/i;

export const hasBannedLanguage = (output: InterpretOutput): boolean => {
  const texts: string[] = [
    output.narrative.what_is_unfolding,
    output.narrative.where_you_stand,
    output.narrative.tension_to_notice,
    output.closing_question,
  ];

  return texts.some((text) => bannedPattern.test(text));
};
