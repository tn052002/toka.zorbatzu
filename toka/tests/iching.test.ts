import { describe, expect, it } from 'vitest';
import { applyRelating, lineFromValue, linesToHexagramId } from '../src/lib/iching';

const line = (value: 6 | 7 | 8 | 9) => lineFromValue(value);

const linesFromBinary = (binary: string) =>
  binary.split('').map((bit) => line(bit === '1' ? 7 : 8));

describe('applyRelating', () => {
  it('flips changing lines', () => {
    const lines = [line(6), line(7), line(8), line(9), line(6), line(9)];
    const relating = applyRelating(lines);

    expect(relating.map((l) => l.value)).toEqual([7, 7, 8, 8, 7, 8]);
    expect(relating.map((l) => l.changing)).toEqual([false, false, false, false, false, false]);
  });
});

describe('linesToHexagramId', () => {
  it('maps well-known hexagrams', () => {
    expect(linesToHexagramId(linesFromBinary('111111'))).toBe(1);
    expect(linesToHexagramId(linesFromBinary('000000'))).toBe(2);
    expect(linesToHexagramId(linesFromBinary('010001'))).toBe(3);
    expect(linesToHexagramId(linesFromBinary('101010'))).toBe(64);
  });
});
