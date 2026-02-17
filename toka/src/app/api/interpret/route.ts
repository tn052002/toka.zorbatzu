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

const buildFallback = (input: InterpretInput): InterpretOutput => {
  const base = input.question_text.trim() || 'This moment is still forming.';
  const fragments = base.split(/[.!?]/).map((s) => s.trim()).filter(Boolean);
  const first = fragments[0] ?? base;
  const second = fragments[1] ?? first;
  const third = fragments[2] ?? first;

  const paraphrase = (text: string) => {
    if (!text) return 'The question describes a present tension.';
    if (text.length < 8) return `The question centers on ${text.toLowerCase()}.`;
    return `The question centers on ${text.charAt(0).toLowerCase()}${text.slice(1)}.`;
  };

  return {
    narrative: {
      what_is_unfolding: paraphrase(first),
      where_you_stand: paraphrase(second),
      tension_to_notice: paraphrase(third),
    },
    closing_question: 'What part of this feels most alive right now?',
  };
};

const extractJson = (text: string) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in response.');
  }
  return text.slice(start, end + 1);
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
  const text = (data.output_text as string) ?? '';
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
      { error: 'Invalid input', details: error instanceof z.ZodError ? error.flatten() : undefined },
      { status: 400 },
    );
  }

  let output: InterpretOutput | null = null;

  const firstAttempt = await requestOpenAI(parsedInput, false);
  if (firstAttempt) {
    const result = interpretOutputSchema.safeParse(firstAttempt);
    if (result.success && !hasBannedLanguage(result.data)) {
      output = result.data;
    }
  }

  if (!output) {
    const secondAttempt = await requestOpenAI(parsedInput, true);
    if (secondAttempt) {
      const result = interpretOutputSchema.safeParse(secondAttempt);
      if (result.success && !hasBannedLanguage(result.data)) {
        output = result.data;
      }
    }
  }

  if (!output) {
    output = buildFallback(parsedInput);
  }

  return NextResponse.json(output);
}
