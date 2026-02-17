import type { InterpretInput } from './schema';

const bannedList = [
  'should',
  'must',
  'need to',
  'recommend',
  'try to',
  'avoid',
  'will happen',
  'you will',
  'going to',
  'soon',
  'next week',
];

export const buildInterpretPrompt = (input: InterpretInput) => {
  const getMeaningTitle = (
    meaning: NonNullable<InterpretInput['relating']> | InterpretInput['primary'],
  ) => meaning.layman_title || meaning.laymantitle || 'Unnamed Pattern';

  const formatMeaning = (meaning: NonNullable<InterpretInput['relating']> | InterpretInput['primary']) => {
    const idLine = typeof meaning.id === 'number' ? [`id: ${meaning.id}`] : [];
    const coreImageParts = [
      meaning.core_image?.vi,
      meaning.core_image?.en,
    ].filter(Boolean) as string[];
    const coreStructure = meaning.structure?.core_structure ?? [];
    const structuralNature = meaning.structure?.structural_nature ?? [];
    const inherentTension = meaning.structure?.inherent_tension ?? '';
    const keywords = meaning.keywords ?? [];
    const domainsHint = meaning.domains_hint ?? [];

    const lines = [
      ...idLine,
      ...coreImageParts,
      ...coreStructure,
      ...structuralNature,
      inherentTension,
      ...keywords.map((item) => `keyword: ${item}`),
      ...domainsHint.map((item) => `domain_hint: ${item}`),
    ].filter(Boolean);
    return lines.map((item) => `- ${item}`).join(' ');
  };

  const movementAnchors = input.movement.changing_lines
    .map((line) => ({
      line,
      overlay: input.movement.overlays[String(line)] ?? [],
    }))
    .map(({ line, overlay }) => {
      const bullets = overlay.map((item: string) => `- ${item}`).join(' ');
      return `Line ${line}: ${bullets}`;
    })
    .join('\n');

  const relatingAnchors = input.relating
    ? `Relating (${getMeaningTitle(input.relating)}): ${formatMeaning(input.relating) || '- None'}`
    : 'Relating: null';

  const tensions = Array.isArray(input.tensions) ? input.tensions.filter(Boolean) : [];
  const tensionsBlock =
    tensions.length > 0
      ? `\nDeclared tensions (optional): ${tensions.join(', ')}
Use these as a psychological distortion vector to sharpen diagnosis and questioning.
Do NOT treat them as facts. Do NOT moralize. Still no advice/prediction.\n`
      : '';

  return `You are a mirror-only reflection engine for TOKA. Provide neutral, present-tense observations only.
Never give advice, instructions, or predictions.
Do not use banned phrases: ${bannedList.join(', ')}.

Domain: ${input.domain}
Question: ${input.question_text}
${tensionsBlock}

Primary (${getMeaningTitle(input.primary)}): ${formatMeaning(input.primary) || '- None'}

Movement overlays:
${movementAnchors || 'None'}

${relatingAnchors}

Return JSON only. The response MUST match this schema exactly:
{
  "narrative": {
    "what_is_unfolding": "",
    "where_you_stand": "",
    "tension_to_notice": ""
  },
  "closing_question": ""
}`;
};
