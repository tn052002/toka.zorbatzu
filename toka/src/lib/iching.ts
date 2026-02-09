export type YinYang = 'yin' | 'yang';

export type LineValue = 6 | 7 | 8 | 9;

export type Line = {
  value: LineValue;
  yinYang: YinYang;
  changing: boolean;
};

const KING_WEN_PAIRS: Array<[string, number]> = [
  ['111111', 1],
  ['000000', 2],
  ['010001', 3],
  ['100010', 4],
  ['010111', 5],
  ['111010', 6],
  ['000010', 7],
  ['010000', 8],
  ['110111', 9],
  ['111011', 10],
  ['000111', 11],
  ['111000', 12],
  ['111101', 13],
  ['101111', 14],
  ['000100', 15],
  ['001000', 16],
  ['011001', 17],
  ['100110', 18],
  ['000011', 19],
  ['110000', 20],
  ['101001', 21],
  ['100101', 22],
  ['100000', 23],
  ['000001', 24],
  ['111001', 25],
  ['100111', 26],
  ['100001', 27],
  ['011110', 28],
  ['010010', 29],
  ['101101', 30],
  ['011100', 31],
  ['001110', 32],
  ['111100', 33],
  ['001111', 34],
  ['101000', 35],
  ['000101', 36],
  ['110101', 37],
  ['101011', 38],
  ['010100', 39],
  ['001010', 40],
  ['100011', 41],
  ['110001', 42],
  ['011111', 43],
  ['111110', 44],
  ['011000', 45],
  ['000110', 46],
  ['011010', 47],
  ['010110', 48],
  ['011101', 49],
  ['101110', 50],
  ['001001', 51],
  ['100100', 52],
  ['110100', 53],
  ['001011', 54],
  ['001101', 55],
  ['101100', 56],
  ['110110', 57],
  ['011011', 58],
  ['110010', 59],
  ['010011', 60],
  ['110011', 61],
  ['001100', 62],
  ['010101', 63],
  ['101010', 64]
];

const KING_WEN_BY_BINARY: number[] = (() => {
  const map = Array(64).fill(0) as number[];
  for (const [binary, id] of KING_WEN_PAIRS) {
    map[parseInt(binary, 2)] = id;
  }
  return map;
})();

export function lineFromValue(value: LineValue): Line {
  const yinYang: YinYang = value === 7 || value === 9 ? 'yang' : 'yin';
  const changing = value === 6 || value === 9;
  return { value, yinYang, changing };
}

/**
 * Cast six lines (bottom to top) using the three-coin method.
 */
export function castQuick(): Line[] {
  const lines: Line[] = [];
  for (let i = 0; i < 6; i += 1) {
    let sum = 0;
    for (let toss = 0; toss < 3; toss += 1) {
      sum += Math.random() < 0.5 ? 2 : 3;
    }
    lines.push(lineFromValue(sum as LineValue));
  }
  return lines;
}

/**
 * Return relating lines by flipping changing lines (6 -> 7, 9 -> 8).
 */
export function applyRelating(lines: Line[]): Line[] {
  return lines.map((line) => {
    if (!line.changing) {
      return line;
    }

    const nextValue = line.value === 6 ? 7 : 8;
    return lineFromValue(nextValue);
  });
}

/**
 * Convert lines to King Wen hexagram id (1..64).
 * Lines are expected bottom-to-top.
 */
export function linesToHexagramId(lines: Line[]): number {
  if (lines.length !== 6) {
    throw new Error('Expected exactly 6 lines.');
  }

  const binary = lines.map((line) => (line.yinYang === 'yang' ? '1' : '0')).join('');
  const index = parseInt(binary, 2);
  const id = KING_WEN_BY_BINARY[index];

  if (!id) {
    throw new Error(`No King Wen id found for binary ${binary}.`);
  }

  return id;
}
