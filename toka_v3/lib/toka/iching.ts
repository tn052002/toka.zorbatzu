'use client';

export type YinYang = 'yin' | 'yang';
export type LineValue = 6 | 7 | 8 | 9;

export type Line = {
  value: LineValue;
  yinYang: YinYang;
  changing: boolean;
};

export type CastComputation = {
  lineValues: LineValue[];
  primaryHexagramId: number;
  changingLines: number[];
  resultingHexagramId: number;
};

const KING_WEN_PAIRS: Array<[string, number]> = [
  ['111111', 1], ['000000', 2], ['100010', 3], ['010001', 4], ['111010', 5], ['010111', 6], ['010000', 7],
  ['000010', 8], ['111011', 9], ['110111', 10], ['111000', 11], ['000111', 12], ['101111', 13], ['111101', 14],
  ['001000', 15], ['000100', 16], ['100110', 17], ['011001', 18], ['110000', 19], ['000011', 20], ['100101', 21],
  ['101001', 22], ['000001', 23], ['100000', 24], ['100111', 25], ['111001', 26], ['100001', 27], ['011110', 28],
  ['010010', 29], ['101101', 30], ['001110', 31], ['011100', 32], ['001111', 33], ['111100', 34], ['000101', 35],
  ['101000', 36], ['101011', 37], ['110101', 38], ['001010', 39], ['010100', 40], ['110001', 41], ['100011', 42],
  ['111110', 43], ['011111', 44], ['000110', 45], ['011000', 46], ['010110', 47], ['011010', 48], ['101110', 49],
  ['011101', 50], ['100100', 51], ['001001', 52], ['001011', 53], ['110100', 54], ['101100', 55], ['001101', 56],
  ['011011', 57], ['110110', 58], ['010011', 59], ['110010', 60], ['110011', 61], ['001100', 62], ['101010', 63],
  ['010101', 64],
];

const KING_WEN_BY_BINARY: number[] = (() => {
  const map = Array(64).fill(0) as number[];
  for (const [binary, id] of KING_WEN_PAIRS) {
    map[parseInt(binary, 2)] = id;
  }
  return map;
})();

export function lineFromValue(value: LineValue): Line {
  return {
    value,
    yinYang: value === 7 || value === 9 ? 'yang' : 'yin',
    changing: value === 6 || value === 9,
  };
}

export function castLineValue(): LineValue {
  let sum = 0;
  for (let i = 0; i < 3; i += 1) {
    sum += Math.random() < 0.5 ? 2 : 3;
  }
  return sum as LineValue;
}

export function castQuickValues(): LineValue[] {
  return Array.from({ length: 6 }, () => castLineValue());
}

export function applyRelating(lines: Line[]): Line[] {
  return lines.map((line) => {
    if (!line.changing) {
      return line;
    }
    const nextValue = line.value === 6 ? 7 : 8;
    return lineFromValue(nextValue);
  });
}

export function linesToHexagramId(lines: Line[]): number {
  if (lines.length !== 6) {
    throw new Error('Expected exactly 6 lines.');
  }
  const binary = lines.map((line) => (line.yinYang === 'yang' ? '1' : '0')).join('');
  const id = KING_WEN_BY_BINARY[parseInt(binary, 2)];
  if (!id) {
    throw new Error(`No King Wen id found for binary ${binary}.`);
  }
  return id;
}

export function computeCast(lineValues: LineValue[]): CastComputation {
  if (lineValues.length !== 6) {
    throw new Error('Expected 6 line values.');
  }
  const lineObjects = lineValues.map((value) => lineFromValue(value));
  const changingLines = lineObjects
    .map((line, index) => (line.changing ? index + 1 : null))
    .filter((line): line is number => line !== null);
  const primaryHexagramId = linesToHexagramId(lineObjects);
  let resultingHexagramId = primaryHexagramId;
  if (changingLines.length > 0) {
    resultingHexagramId = linesToHexagramId(applyRelating(lineObjects));
  }
  return {
    lineValues,
    primaryHexagramId,
    changingLines,
    resultingHexagramId,
  };
}
