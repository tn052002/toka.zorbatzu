'use client';

export const MOMENT_KEY = 'toka_v2:moment_draft';
export const MOMENT_READING_KEY = 'toka_v2:moment_reading';

export type CastMode = 'quick' | 'ritual';
export type LinePolarity = 'yin' | 'yang';
export type LineValue = 6 | 7 | 8 | 9;

export type CastLineInput = {
  polarity: LinePolarity;
  moving: boolean;
};

export type MomentDraft = {
  question: string;
  questionTimestamp: string;
  domain: string | null;
};

export type MomentReading = {
  question: string;
  questionTimestamp: string;
  domain: string | null;
  mode: CastMode;
  castedAt: string;
  lineValues: LineValue[];
  mainHexId: number;
  movingLinePositions: number[];
  relatingHexId: number | null;
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

export function castLineToValue(line: CastLineInput): LineValue {
  if (line.polarity === 'yin' && line.moving) {
    return 6;
  }
  if (line.polarity === 'yang' && line.moving) {
    return 9;
  }
  if (line.polarity === 'yang') {
    return 7;
  }
  return 8;
}

export function linesToValues(lines: CastLineInput[]): LineValue[] {
  return lines.map(castLineToValue);
}

export function linesToMainHexId(lineValues: LineValue[]): number {
  if (lineValues.length !== 6) {
    return 0;
  }
  const binary = lineValues.map((value) => (value === 7 || value === 9 ? '1' : '0')).join('');
  const id = KING_WEN_BY_BINARY[parseInt(binary, 2)];
  return id || 0;
}

export function linesToRelatingHexId(lines: CastLineInput[], movingLinePositions: number[]): number | null {
  if (lines.length !== 6 || movingLinePositions.length === 0) {
    return null;
  }
  const flipped: CastLineInput[] = lines.map((line, index) => {
    const position = index + 1;
    if (!movingLinePositions.includes(position)) {
      return line;
    }
    return {
      ...line,
      polarity: (line.polarity === 'yin' ? 'yang' : 'yin') as LinePolarity,
      moving: false,
    };
  });
  const relating = linesToMainHexId(linesToValues(flipped));
  return relating || null;
}

export function buildMomentReading(args: {
  draft: MomentDraft | null;
  mode: CastMode;
  castLines: CastLineInput[];
}): MomentReading {
  const movingLinePositions = args.castLines
    .map((line, index) => (line.moving ? index + 1 : 0))
    .filter((value) => value > 0);

  const lineValues = linesToValues(args.castLines);
  const mainHexId = linesToMainHexId(lineValues);
  const relatingHexId = linesToRelatingHexId(args.castLines, movingLinePositions);

  return {
    question: args.draft?.question ?? '',
    questionTimestamp: args.draft?.questionTimestamp ?? new Date().toISOString(),
    domain: args.draft?.domain ?? null,
    mode: args.mode,
    castedAt: new Date().toISOString(),
    lineValues,
    mainHexId,
    movingLinePositions,
    relatingHexId,
  };
}
