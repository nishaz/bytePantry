/** Scale the amounts in free-text ingredient lines ("1 1/2 cups flour", "200g pasta", "2-3 cloves garlic"). */

const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '¼': 0.25,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

const NICE_FRACTIONS: [number, string][] = [
  [0.125, '⅛'],
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
];

// whole + fraction ("1 1/2", "1½"), plain fraction ("3/4"), decimal or integer ("1.5", "200"), or a unicode fraction.
const NUMBER = String.raw`(?:\d+\s+\d+\/\d+|\d+\s*[½¼¾⅓⅔⅛⅜⅝⅞]|\d+\/\d+|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞])`;
const LEADING = new RegExp(String.raw`^(${NUMBER})(?:\s*(?:-|–|to)\s*(${NUMBER}))?`);

function parseNumber(text: string): number {
  const t = text.trim();
  const mixed = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const wholeUnicode = t.match(/^(\d+)\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/);
  if (wholeUnicode) return Number(wholeUnicode[1]) + UNICODE_FRACTIONS[wholeUnicode[2]];
  const frac = t.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  if (UNICODE_FRACTIONS[t] !== undefined) return UNICODE_FRACTIONS[t];
  return Number(t);
}

export function formatAmount(value: number): string {
  if (value >= 10) return String(Math.round(value));
  const whole = Math.floor(value);
  const rest = value - whole;
  if (rest < 0.06) return String(whole || (value > 0 ? '¼' : '0'));
  if (rest > 0.94) return String(whole + 1);
  for (const [n, glyph] of NICE_FRACTIONS) {
    if (Math.abs(rest - n) < 0.045) return whole ? `${whole}${glyph}` : glyph;
  }
  return String(Math.round(value * 10) / 10);
}

/** Multiply the leading amount of an ingredient line by `factor`. Lines without a number are returned as-is. */
export function scaleIngredient(line: string, factor: number): string {
  if (factor === 1) return line;
  const match = line.match(LEADING);
  if (!match) return line;
  const low = parseNumber(match[1]) * factor;
  const high = match[2] ? parseNumber(match[2]) * factor : null;
  const amount = high !== null ? `${formatAmount(low)}-${formatAmount(high)}` : formatAmount(low);
  return amount + line.slice(match[0].length);
}

/** Pull a serving count out of text like "Serves 4", "for 2 people", "4 servings", "Yield: 6". */
export function parseServings(value: unknown): number | null {
  if (typeof value === 'number' && value > 0) return Math.round(value);
  const text = Array.isArray(value) ? value.join(' ') : typeof value === 'string' ? value : '';
  if (!text) return null;
  const m =
    text.match(/\b(?:serves|servings?|yield|makes|for)\s*:?\s*(\d{1,2})\b/i) ??
    text.match(/\b(\d{1,2})\s*(?:servings?|people|persons|portions)\b/i) ??
    text.match(/^\s*(\d{1,2})\s*$/);
  const n = m ? Number(m[1]) : NaN;
  return n > 0 && n <= 50 ? n : null;
}

export const DEFAULT_SERVINGS = 2;
