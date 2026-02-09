import { applyRelating, lineFromValue, linesToHexagramId } from '../iching';
import type { LineValue } from '../iching';

export type CastResult = {
  lines: LineValue[];
  changing_lines: number[];
  primary_hex_id: number;
  relating_hex_id: number | null;
};

export const castLineValue = (): LineValue => {
  let sum = 0;
  for (let toss = 0; toss < 3; toss += 1) {
    sum += Math.random() < 0.5 ? 2 : 3;
  }
  return sum as LineValue;
};

export const castQuickValues = (): LineValue[] => {
  return Array.from({ length: 6 }, () => castLineValue());
};

export const computeCastResult = (lines: LineValue[]): CastResult => {
  if (lines.length !== 6) {
    throw new Error('Expected 6 lines to compute cast result.');
  }

  const lineObjects = lines.map((value) => lineFromValue(value));
  const changing_lines = lineObjects
    .map((line, index) => (line.changing ? index + 1 : null))
    .filter((value): value is number => value !== null);

  const primary_hex_id = linesToHexagramId(lineObjects);

  let relating_hex_id: number | null = null;
  if (changing_lines.length > 0) {
    const relatingLines = applyRelating(lineObjects);
    relating_hex_id = linesToHexagramId(relatingLines);
  }

  return {
    lines,
    changing_lines,
    primary_hex_id,
    relating_hex_id,
  };
};
