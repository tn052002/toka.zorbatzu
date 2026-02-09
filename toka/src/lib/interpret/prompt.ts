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
    ? `Relating (${input.relating.layman_title}): ${input.relating.present_state
        .map((item) => `- ${item}`)
        .join(' ')}`
    : 'Relating: null';

  return `You are a mirror-only reflection engine for TOKA. Provide neutral, present-tense observations only.
Never give advice, instructions, or predictions.
Do not use banned phrases: ${bannedList.join(', ')}.

Domain: ${input.domain}
Question: ${input.question_text}

Primary (${input.primary.layman_title}): ${input.primary.present_state
    .map((item) => `- ${item}`)
    .join(' ')}

Movement overlays:
${movementAnchors || 'None'}

${relatingAnchors}

Return JSON only. The response MUST match this schema exactly:
{
  "mirror_map": {
    "you_described": ["", "", ""],
    "two_pulls": ["", ""],
    "cost_to_lose": ["", ""],
    "unknowns": ["", ""]
  },
  "cold_mirror_sentence": "",
  "opening_question": ""
}`;
};
