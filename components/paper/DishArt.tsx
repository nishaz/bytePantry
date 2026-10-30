import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { paper as p } from '../../lib/theme';

export type DishKind = 'pasta' | 'soup' | 'salad' | 'omelette' | 'rice' | 'sandwich' | 'pie' | 'smoothie' | 'bowl';

const RULES: [RegExp, DishKind][] = [
  [/omelet|frittata|scrambl|egg|pancake|crepe/, 'omelette'],
  [/pasta|spaghetti|noodle|ramen|penne|mac|lasagn|linguine|carbonara/, 'pasta'],
  [/soup|stew|broth|chowder|curry|chili|dal/, 'soup'],
  [/salad|slaw|bowl of greens/, 'salad'],
  [/rice|risotto|paella|biryani|fried rice|poke/, 'rice'],
  [/sandwich|toast|burger|wrap|taco|bagel|panini/, 'sandwich'],
  [/pie|cake|tart|cookie|brownie|muffin|bread|bake/, 'pie'],
  [/smoothie|shake|juice|latte|drink/, 'smoothie'],
];

export function dishKindFor(title: string): DishKind {
  const t = title.toLowerCase();
  for (const [re, kind] of RULES) {
    if (re.test(t)) return kind;
  }
  return 'bowl';
}

/** Accent colour that suits each dish, used for recipe card backgrounds. */
export function dishColor(kind: DishKind): string {
  switch (kind) {
    case 'pasta':
    case 'pie':
      return p.yellow;
    case 'soup':
    case 'smoothie':
      return p.red;
    case 'salad':
    case 'rice':
      return p.green;
    case 'omelette':
      return p.orange;
    case 'sandwich':
      return p.blue;
    default:
      return p.purple;
  }
}

function Bowl({ fill }: { fill: string }) {
  return (
    <>
      <Path d="M8 34h64c0 18-14 30-32 30S8 52 8 34z" fill={p.card} />
      <Path d="M14 48c8 4 44 4 52 0" stroke={fill} strokeWidth={3} fill="none" opacity={0.6} />
    </>
  );
}

function Body({ kind }: { kind: DishKind }) {
  switch (kind) {
    case 'pasta':
      return (
        <>
          <Path d="M12 34c4-14 52-16 56 0z" fill={p.yellow} />
          <Path d="M18 30c8-6 14 2 22-2s14 2 22-2M20 24c6-4 12 2 18-1s12 1 18-1" stroke={p.cream} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Circle cx="34" cy="26" r="5" fill={p.red} />
          <Circle cx="48" cy="28" r="4" fill={p.red} />
          <Path d="M40 20c2-3 6-3 6 0-3 2-5 2-6 0z" fill={p.green} />
          <Bowl fill={p.red} />
        </>
      );
    case 'soup':
      return (
        <>
          <Ellipse cx="40" cy="34" rx="30" ry="7" fill={p.red} />
          <Circle cx="30" cy="33" r="2.5" fill={p.cream} />
          <Circle cx="46" cy="35" r="2" fill={p.green} />
          <Path d="M30 22c-4-4 4-8 0-12M44 22c-4-4 4-8 0-12" stroke={p.card} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Bowl fill={p.orange} />
        </>
      );
    case 'salad':
      return (
        <>
          <Path d="M12 34c2-10 10-16 18-12 4-8 16-8 20 0 8-4 18 2 18 12z" fill={p.green} />
          <Circle cx="28" cy="28" r="5" fill={p.red} />
          <Circle cx="50" cy="27" r="4" fill={p.yellow} />
          <Path d="M36 22c4-4 8-2 8 2-4 2-6 1-8-2z" fill={p.greenDeep} />
          <Bowl fill={p.green} />
        </>
      );
    case 'omelette':
      return (
        <>
          <Ellipse cx="38" cy="42" rx="32" ry="20" fill={p.ink} />
          <Rect x="64" y="38" width="16" height="7" rx="3.5" fill={p.ink} transform="rotate(-15 64 40)" />
          <Ellipse cx="38" cy="40" rx="27" ry="15" fill={p.panIn} />
          <Path d="M17 40c2-10 14-13 23-11 12 2 18 6 18 11s-9 11-21 10c-11 0-22-3-20-10z" fill={p.cream} />
          <Circle cx="37" cy="39" r="7" fill={p.yellow} />
          <Path d="M24 34c3-2 5 0 4 2-1.5 2-4.5.5-4-2zM48 44c3-1.5 4.5 1 3 2.5-1.5 1.5-4 0-3-2.5z" fill={p.green} />
        </>
      );
    case 'rice':
      return (
        <>
          <Path d="M12 34c2-14 54-14 56 0z" fill={p.card} />
          <Circle cx="30" cy="27" r="1.5" fill={p.kraftDeep} />
          <Circle cx="44" cy="25" r="1.5" fill={p.kraftDeep} />
          <Path d="M46 30c4-6 12-6 14 0z" fill={p.orange} />
          <Path d="M22 30c2-5 8-5 10 0z" fill={p.green} />
          <Bowl fill={p.blue} />
        </>
      );
    case 'sandwich':
      return (
        <>
          <Path d="M12 50h56l-4 8H16z" fill={p.orange} />
          <Path d="M10 46c10-4 50-4 60 0l-2 4H12z" fill={p.green} />
          <Rect x="14" y="40" width="52" height="6" rx="2" fill={p.red} />
          <Rect x="12" y="35" width="56" height="6" rx="2" fill={p.yellow} />
          <Path d="M12 36c0-14 56-14 56 0z" fill={p.orange} />
          <Circle cx="30" cy="27" r="1.4" fill={p.cream} />
          <Circle cx="42" cy="25" r="1.4" fill={p.cream} />
          <Circle cx="52" cy="29" r="1.4" fill={p.cream} />
        </>
      );
    case 'pie':
      return (
        <>
          <Path d="M8 46h64l-6 12H14z" fill={p.brown} />
          <Path d="M10 46c4-18 56-18 60 0z" fill={p.orange} />
          <Path d="M20 40l10-8M34 40l10-10M48 40l10-8" stroke={p.yellow} strokeWidth={4} strokeLinecap="round" />
          <Path d="M8 46c6 3 10-3 16 0s10-3 16 0 10-3 16 0 10-3 16 0" stroke={p.cream} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      );
    case 'smoothie':
      return (
        <>
          <Path d="M24 18h32l-5 44H29z" fill={p.card} stroke={p.ink} strokeWidth={2} />
          <Path d="M26 30h28l-3 30H29z" fill={p.red} />
          <Path d="M44 18l6-14" stroke={p.yellow} strokeWidth={4} strokeLinecap="round" />
          <Circle cx="56" cy="20" r="6" fill={p.yellow} />
        </>
      );
    default:
      return (
        <>
          <Path d="M12 34c4-12 52-12 56 0z" fill={p.orange} />
          <Circle cx="32" cy="28" r="4" fill={p.green} />
          <Circle cx="46" cy="27" r="4" fill={p.red} />
          <Bowl fill={p.purple} />
        </>
      );
  }
}

/** Plated-dish illustration chosen from the recipe title. */
export function DishArt({ title, size = 80 }: { title: string; size?: number }) {
  const kind = dishKindFor(title);
  return (
    <Svg width={size} height={size * 0.85} viewBox="0 0 80 68">
      <G opacity={0.18} transform="translate(3 3)">
        <Ellipse cx="40" cy="52" rx="34" ry="12" fill={p.ink} />
      </G>
      <Body kind={kind} />
    </Svg>
  );
}
