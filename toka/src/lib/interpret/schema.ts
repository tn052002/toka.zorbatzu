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

const meaningInputSchema = z.object({
  id: z.number().int().positive().optional(),
  layman_title: z.string().optional(),
  laymantitle: z.string().optional(),
  core_image: z
    .object({
      vi: z.string().optional(),
      en: z.string().optional(),
    })
    .nullable()
    .optional(),
  structure: z
    .object({
      core_structure: z.array(z.string()).optional(),
      structural_nature: z.array(z.string()).optional(),
      inherent_tension: z.string().optional(),
    })
    .nullable()
    .optional(),
  keywords: z.array(z.string()).optional(),
  domains_hint: z.array(z.string()).optional(),
});

export const interpretInputSchema = z.object({
  domain: domainSchema,
  question_text: z.string().min(1),
  tensions: z.array(z.string()).optional().default([]),
  primary: meaningInputSchema,
  movement: z.object({
    changing_lines: z.array(z.number().int().min(1).max(6)),
    overlays: z.record(z.string(), z.array(z.string()).length(2)),
  }),
  relating: meaningInputSchema.nullable(),
});

export const interpretOutputSchema = z.object({
  narrative: z.object({
    what_is_unfolding: z.string(),
    where_you_stand: z.string(),
    tension_to_notice: z.string(),
  }),
  closing_question: z.string(),
});

export type InterpretInput = z.infer<typeof interpretInputSchema>;
export type InterpretOutput = z.infer<typeof interpretOutputSchema>;
