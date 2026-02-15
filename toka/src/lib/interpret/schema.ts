import { z } from 'zod';

export const domainSchema = z.enum([
  'work',
  'money',
  'relationship',
  'health',
  'project',
  'inner',
  'other',
]);

export const interpretInputSchema = z.object({
  domain: domainSchema,
  question_text: z.string().min(1),
  tensions: z.array(z.string()).optional().default([]),
  primary: z.object({
    layman_title: z.string(),
    present_state: z.array(z.string()).length(3),
  }),
  movement: z.object({
    changing_lines: z.array(z.number().int().min(1).max(6)),
    overlays: z.record(z.string(), z.array(z.string()).length(2)),
  }),
  relating: z
    .object({
      layman_title: z.string(),
      present_state: z.array(z.string()).length(3),
    })
    .nullable(),
});

export const interpretOutputSchema = z.object({
  mirror_map: z.object({
    you_described: z.array(z.string()).length(3),
    two_pulls: z.array(z.string()).length(2),
    cost_to_lose: z.array(z.string()).length(2),
    unknowns: z.array(z.string()).length(2),
  }),
  cold_mirror_sentence: z.string(),
  opening_question: z.string(),
});

export type InterpretInput = z.infer<typeof interpretInputSchema>;
export type InterpretOutput = z.infer<typeof interpretOutputSchema>;
