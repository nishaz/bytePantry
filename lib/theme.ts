/**
 * Kraft-paper cut-out theme.
 * `paper` is the palette every illustration draws from, so art and UI stay in sync.
 */
export const paper = {
  kraft: '#EADBC3',
  kraftDeep: '#DCC8A8',
  card: '#FFF8EC',
  ink: '#2B2320',
  inkSoft: '#6B5A4E',
  panIn: '#4A3B33',
  cream: '#FFF3DA',
  red: '#E2553B',
  redDeep: '#B23A22',
  orange: '#E8843A',
  yellow: '#F2B33D',
  amberText: '#8A5A12',
  green: '#5E9C58',
  greenDeep: '#3E7340',
  blue: '#7FB1D8',
  purple: '#9B6FB0',
  brown: '#B98657',
  steel: '#C9C4BA',
  shadow: 'rgba(43,35,32,0.22)',
  shadowStrong: 'rgba(43,35,32,0.32)',
} as const;

/** Legacy keys kept so older components keep compiling, remapped to the kraft palette. */
export const colors = {
  bg: paper.kraft,
  paper: paper.kraft,
  card: paper.card,
  ink: paper.ink,
  muted: paper.inkSoft,
  line: paper.kraftDeep,
  berry: paper.red,
  butter: paper.yellow,
  butterText: paper.ink,
  wall: paper.kraft,
  iconBox: paper.kraftDeep,
  counter: paper.brown,
  sage: paper.green,
  chip: paper.ink,
  chipText: paper.card,
  steel: paper.steel,
  overlay: paper.card,
  tileIconPink: '#E8A8B8',
  tileIconGreen: '#8FB87A',
  tileIconGold: paper.yellow,
} as const;

export const fonts = {
  display: 'Gluten_800ExtraBold',
  body: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyRegular: 'Nunito_400Regular',
} as const;

export const radii = {
  card: 28,
  tile: 18,
  field: 16,
  thumb: 12,
  button: 999,
} as const;

/** Slightly uneven corners make shapes look hand-cut. */
export const cutCorners = {
  a: { borderTopLeftRadius: 22, borderTopRightRadius: 28, borderBottomRightRadius: 20, borderBottomLeftRadius: 26 },
  b: { borderTopLeftRadius: 16, borderTopRightRadius: 12, borderBottomRightRadius: 18, borderBottomLeftRadius: 14 },
  c: { borderTopLeftRadius: 14, borderTopRightRadius: 18, borderBottomRightRadius: 12, borderBottomLeftRadius: 16 },
  d: { borderTopLeftRadius: 26, borderTopRightRadius: 30, borderBottomRightRadius: 24, borderBottomLeftRadius: 28 },
} as const;

export type CutShape = keyof typeof cutCorners;

export function formatSource(source: string): string {
  switch (source) {
    case 'manual':
      return 'Typed in';
    case 'voice':
      return 'Voice note';
    case 'link':
      return 'From a link';
    case 'sample':
      return 'Starter recipe';
    default:
      return source;
  }
}

export function estimateRecipeMinutes(stepCount: number): number {
  return Math.max(10, stepCount * 9);
}

export function formatRecipeMeta(source: string, stepCount: number): string {
  return `${formatSource(source)} · ${estimateRecipeMinutes(stepCount)} min`;
}
