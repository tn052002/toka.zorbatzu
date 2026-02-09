import type { InterpretOutput } from './schema';

const bannedPattern = /(should|must|need to|recommend|try to|avoid|will happen|you will|going to|soon|next week)/i;

export const hasBannedLanguage = (output: InterpretOutput): boolean => {
  const texts: string[] = [
    ...output.mirror_map.you_described,
    ...output.mirror_map.two_pulls,
    ...output.mirror_map.cost_to_lose,
    ...output.mirror_map.unknowns,
    output.cold_mirror_sentence,
    output.opening_question,
  ];

  return texts.some((text) => bannedPattern.test(text));
};
