import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildInterpretPrompt } from '@/lib/interpret/prompt';
import {
  interpretInputSchema,
  interpretOutputSchema,
  type InterpretInput,
  type InterpretOutput,
} from '@/lib/interpret/schema';
import { hasBannedLanguage } from '@/lib/interpret/postcheck';

const OPENAI_URL = 'https://api.openai.com/v1/responses';
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';
const MAX_ATTEMPTS = 1;
const OUTPUT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['narrative', 'closing_question'],
  properties: {
    narrative: {
      type: 'object',
      additionalProperties: false,
      required: ['what_is_unfolding', 'where_you_stand', 'tension_to_notice'],
      properties: {
        what_is_unfolding: { type: 'string' },
        where_you_stand: { type: 'string' },
        tension_to_notice: { type: 'string' },
      },
    },
    closing_question: { type: 'string' },
  },
} as const;

const extractJson = (text: string) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in response.');
  }
  return text.slice(start, end + 1);
};

const extractOutputText = (data: unknown): string => {
  if (!data || typeof data !== 'object') {
    return '';
  }
  const root = data as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: unknown }> }>;
  };
  if (typeof root.output_text === 'string' && root.output_text.trim()) {
    return root.output_text;
  }
  const chunks = (root.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => (typeof content.text === 'string' ? content.text : ''))
    .filter(Boolean);
  return chunks.join('\n').trim();
};

const requestOpenAI = async (input: InterpretInput, strict = false) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const systemPrefix = strict
    ? 'Remove advice and predictions; use only reflection. Output JSON only.'
    : 'Output JSON only.';

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      text: {
        format: {
          type: 'json_schema',
          name: 'toka_interpret_output',
          schema: OUTPUT_JSON_SCHEMA,
          strict: true,
        },
      },
      input: [
        {
          role: 'system',
          content: systemPrefix,
        },
        {
          role: 'user',
          content: buildInterpretPrompt(input),
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const parsed = (data as { output_parsed?: unknown }).output_parsed;
  if (parsed && typeof parsed === 'object') {
    return parsed;
  }
  const text = extractOutputText(data);
  if (!text) {
    return null;
  }

  const jsonText = extractJson(text);
  return JSON.parse(jsonText);
};

export async function POST(request: Request) {
  let parsedInput: InterpretInput;
  try {
    const body = await request.json();
    parsedInput = interpretInputSchema.parse(body);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid v2 interpret input', details: error instanceof z.ZodError ? error.flatten() : undefined },
      { status: 400 },
    );
  }

  let output: InterpretOutput | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const candidate = await requestOpenAI(parsedInput, attempt > 1);
    if (!candidate) {
      continue;
    }
    const result = interpretOutputSchema.safeParse(candidate);
    if (result.success && !hasBannedLanguage(result.data)) {
      output = result.data;
      break;
    }
  }

  if (!output) {
    return NextResponse.json(
      { error: 'Interpretation unavailable' },
      { status: 502 },
    );
  }

  return NextResponse.json(output);
}
