import { describe, expect, it } from 'vitest';
import { interpretInputSchema, interpretOutputSchema } from '../src/lib/interpret/schema';
import { hasBannedLanguage } from '../src/lib/interpret/postcheck';

const inputSample = {
  domain: 'work',
  question_text: 'I am unsure about the balance between ambition and stability.',
  primary: {
    layman_title: 'Initiate',
    present_state: ['Energy is active.', 'Momentum is visible.', 'Direction is present.'],
  },
  movement: {
    changing_lines: [2],
    overlays: {
      '2': ['Movement is subtle.', 'Timing remains open.'],
    },
  },
  relating: null,
};

describe('interpret schemas', () => {
  it('validates input shape', () => {
    expect(() => interpretInputSchema.parse(inputSample)).not.toThrow();
  });

  it('validates output shape and banned language scan', () => {
    const outputSample = {
      mirror_map: {
        you_described: ['The question holds a balance.', 'Stability is present.', 'Ambition is present.'],
        two_pulls: ['One pull is outward.', 'Another pull is inward.'],
        cost_to_lose: ['Change may unsettle patterns.', 'Holding may preserve a known rhythm.'],
        unknowns: ['The timing is unclear.', 'The outcome is open.'],
      },
      cold_mirror_sentence: 'You are holding two truths at once.',
      opening_question: 'What part of this feels most alive right now?',
    };

    expect(() => interpretOutputSchema.parse(outputSample)).not.toThrow();
    expect(hasBannedLanguage(outputSample)).toBe(false);
  });
});
