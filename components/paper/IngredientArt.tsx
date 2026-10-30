import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { paper } from '../../lib/theme';

/**
 * Paper cut-out ingredient library.
 * Every piece is drawn on a 48×48 grid from the shared `paper` palette, so a palette swap
 * restyles all art at once. Add a new ingredient = add one draw function + its aliases.
 */

type P = typeof paper;
type Draw = (p: P) => ReactNode;

const ART: Record<string, Draw> = {
  tomato: (p) => (
    <>
      <Circle cx="24" cy="27" r="16" fill={p.red} />
      <Path d="M24 12l3 5 5-2-3 5 5 2-6 1-4 4-4-4-6-1 5-2-3-5 5 2z" fill={p.green} />
      <Ellipse cx="17" cy="25" rx="3" ry="5" fill={p.card} opacity={0.5} />
    </>
  ),
  tomato_sauce: (p) => (
    <>
      <Rect x="12" y="10" width="24" height="6" rx="2" fill={p.green} />
      <Path d="M11 16h26v22a6 6 0 0 1-6 6H17a6 6 0 0 1-6-6z" fill={p.red} />
      <Rect x="14" y="24" width="20" height="10" rx="2" fill={p.card} />
      <Circle cx="24" cy="29" r="3" fill={p.red} />
    </>
  ),
  onion: (p) => (
    <>
      <Path d="M24 5c3 6 17 11 17 24 0 9-8 14-17 14S7 38 7 29C7 16 21 11 24 5z" fill={p.purple} />
      <Path d="M24 12v28M17 20c-3 6-3 13 0 19M31 20c3 6 3 13 0 19" stroke={p.card} strokeWidth={2} fill="none" opacity={0.55} />
    </>
  ),
  garlic: (p) => (
    <>
      <Path d="M24 6c3 4 15 9 15 22a15 15 0 0 1-30 0C9 15 21 10 24 6z" fill={p.cream} stroke={p.ink} strokeWidth={2} />
      <Path d="M24 14v26M17 20c-2 6-2 13 1 19M31 20c2 6 2 13-1 19" stroke={p.ink} strokeWidth={1.5} fill="none" opacity={0.35} />
    </>
  ),
  egg: (p) => (
    <>
      <Path d="M24 6c9 0 15 13 15 22a15 15 0 0 1-30 0c0-9 6-22 15-22z" fill={p.cream} stroke={p.ink} strokeWidth={2} />
      <Ellipse cx="19" cy="22" rx="3" ry="5" fill={p.card} />
    </>
  ),
  milk: (p) => (
    <>
      <Path d="M15 14l5-8h8l5 8v29H15z" fill={p.cream} stroke={p.ink} strokeWidth={2} />
      <Rect x="15" y="22" width="18" height="10" fill={p.blue} />
      <Path d="M15 14h18" stroke={p.ink} strokeWidth={2} />
    </>
  ),
  cheese: (p) => (
    <>
      <Path d="M5 38L24 10l19 10v18z" fill={p.yellow} />
      <Path d="M5 38L24 10l19 10" fill="none" stroke={p.orange} strokeWidth={3} />
      <Circle cx="22" cy="30" r="3.5" fill={p.orange} />
      <Circle cx="33" cy="26" r="2.5" fill={p.orange} />
      <Circle cx="34" cy="34" r="2" fill={p.orange} />
    </>
  ),
  butter: (p) => (
    <>
      <Path d="M6 26l10-10h26v14L32 40H6z" fill={p.yellow} />
      <Path d="M6 26h26v14M32 26l10-10" stroke={p.orange} strokeWidth={2} fill="none" />
      <Rect x="4" y="38" width="40" height="5" rx="2.5" fill={p.card} stroke={p.ink} strokeWidth={1.5} />
    </>
  ),
  spinach: (p) => (
    <>
      <Path d="M24 44C8 35 6 16 24 4c18 12 16 31 0 40z" fill={p.green} />
      <Path d="M24 42V10M24 22l-7-5M24 30l8-6" stroke={p.card} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
    </>
  ),
  herbs: (p) => (
    <>
      <Path d="M24 44V18M24 30l-9-8M24 24l9-8" stroke={p.greenDeep} strokeWidth={2.5} strokeLinecap="round" />
      <Ellipse cx="14" cy="20" rx="6" ry="4" fill={p.green} transform="rotate(-35 14 20)" />
      <Ellipse cx="34" cy="14" rx="6" ry="4" fill={p.green} transform="rotate(35 34 14)" />
      <Ellipse cx="24" cy="12" rx="4" ry="7" fill={p.green} />
      <Ellipse cx="16" cy="32" rx="5" ry="3.5" fill={p.green} transform="rotate(-20 16 32)" />
    </>
  ),
  carrot: (p) => (
    <>
      <Path d="M30 14l6 6L12 44c-4 2-8-2-6-6z" fill={p.orange} />
      <Path d="M14 30l5 2M20 24l4 2M10 37l4 1" stroke={p.card} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
      <Path d="M33 17c0-8 3-12 6-13-1 5 0 8 3 9-3 1-6 3-9 4zM33 17c-4-4-4-9-2-12 1 5 4 7 2 12z" fill={p.green} />
    </>
  ),
  lemon: (p) => (
    <>
      <Ellipse cx="24" cy="26" rx="17" ry="13" fill={p.yellow} />
      <Path d="M5 26l3-3v6zM43 26l-3-3v6z" fill={p.yellow} />
      <Ellipse cx="18" cy="22" rx="5" ry="2.5" fill={p.card} opacity={0.55} />
    </>
  ),
  lime: (p) => (
    <>
      <Ellipse cx="24" cy="26" rx="16" ry="13" fill={p.green} />
      <Path d="M6 26l3-3v6zM42 26l-3-3v6z" fill={p.green} />
      <Ellipse cx="18" cy="22" rx="5" ry="2.5" fill={p.card} opacity={0.5} />
    </>
  ),
  bread: (p) => (
    <>
      <Path d="M6 34c0-14 8-22 18-22s18 8 18 22v4H6z" fill={p.orange} />
      <Path d="M14 22l4 6M22 18l4 7M31 19l4 7" stroke={p.cream} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  pasta: (p) => (
    <>
      <Path d="M10 40L36 8M14 42L40 10M8 36L32 6M18 42L42 14" stroke={p.yellow} strokeWidth={4} strokeLinecap="round" />
      <Rect x="17" y="19" width="14" height="8" rx="3" fill={p.blue} transform="rotate(-50 24 23)" />
    </>
  ),
  rice: (p) => (
    <>
      <Path d="M10 20h28l-3 22H13z" fill={p.card} stroke={p.ink} strokeWidth={2} />
      <Path d="M10 20c2-8 26-8 28 0z" fill={p.cream} />
      <Ellipse cx="18" cy="16" rx="1.6" ry="2.6" fill={p.card} />
      <Ellipse cx="24" cy="14" rx="1.6" ry="2.6" fill={p.card} />
      <Ellipse cx="30" cy="16" rx="1.6" ry="2.6" fill={p.card} />
      <Rect x="13" y="28" width="22" height="6" fill={p.red} />
    </>
  ),
  flour: (p) => (
    <>
      <Path d="M12 14l4-6h16l4 6-2 30H14z" fill={p.cream} stroke={p.ink} strokeWidth={2} />
      <Path d="M12 14h24" stroke={p.ink} strokeWidth={2} />
      <Path d="M20 24c4-4 8 4 8 4-4 4-8-4-8-4z" fill={p.yellow} />
      <Rect x="17" y="32" width="14" height="4" rx="2" fill={p.blue} />
    </>
  ),
  sugar: (p) => (
    <>
      <Rect x="10" y="14" width="28" height="28" rx="4" fill={p.card} stroke={p.ink} strokeWidth={2} />
      <Rect x="14" y="10" width="20" height="6" rx="2" fill={p.blue} />
      <Rect x="17" y="22" width="6" height="6" fill={p.cream} stroke={p.ink} strokeWidth={1.2} />
      <Rect x="25" y="28" width="6" height="6" fill={p.cream} stroke={p.ink} strokeWidth={1.2} />
    </>
  ),
  salt: (p) => (
    <>
      <Path d="M16 16h16l2 26H14z" fill={p.card} stroke={p.ink} strokeWidth={2} />
      <Path d="M16 16c0-6 16-6 16 0z" fill={p.steel} stroke={p.ink} strokeWidth={2} />
      <Circle cx="21" cy="11" r="1" fill={p.ink} />
      <Circle cx="27" cy="11" r="1" fill={p.ink} />
      <Rect x="16" y="26" width="16" height="6" fill={p.blue} />
    </>
  ),
  oil: (p) => (
    <>
      <Path d="M20 4h8v8l5 7v23a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3V19l5-7z" fill={p.yellow} />
      <Rect x="19" y="2" width="10" height="5" rx="1.5" fill={p.green} />
      <Rect x="17" y="24" width="14" height="10" rx="2" fill={p.card} />
      <Ellipse cx="24" cy="29" rx="3" ry="3.5" fill={p.green} />
    </>
  ),
  mushroom: (p) => (
    <>
      <Path d="M6 24C6 13 14 6 24 6s18 7 18 18z" fill={p.brown} />
      <Rect x="18" y="24" width="12" height="17" rx="5" fill={p.cream} stroke={p.ink} strokeWidth={1.5} />
      <Circle cx="16" cy="16" r="2.5" fill={p.cream} />
      <Circle cx="28" cy="12" r="2" fill={p.cream} />
      <Circle cx="33" cy="19" r="1.8" fill={p.cream} />
    </>
  ),
  potato: (p) => (
    <>
      <Path d="M8 26c0-10 10-16 20-14s14 10 12 18-12 12-20 10S8 34 8 26z" fill={p.brown} />
      <Circle cx="18" cy="22" r="1.5" fill={p.ink} opacity={0.4} />
      <Circle cx="30" cy="28" r="1.5" fill={p.ink} opacity={0.4} />
      <Circle cx="24" cy="34" r="1.2" fill={p.ink} opacity={0.4} />
      <Ellipse cx="20" cy="18" rx="4" ry="2" fill={p.card} opacity={0.35} />
    </>
  ),
  apple: (p) => (
    <>
      <Path d="M24 16c-6-5-17-2-17 10 0 11 8 18 12 18 2 0 3-1 5-1s3 1 5 1c4 0 12-7 12-18 0-12-11-15-17-10z" fill={p.red} />
      <Path d="M24 16c0-4 1-8 4-10" stroke={p.ink} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <Path d="M26 10c4-5 10-4 11-2-4 3-8 3-11 2z" fill={p.green} />
      <Ellipse cx="15" cy="24" rx="2.5" ry="4.5" fill={p.card} opacity={0.5} />
    </>
  ),
  banana: (p) => (
    <>
      <Path d="M8 14c2 16 14 26 32 22-2 6-10 9-18 7C12 40 6 28 8 14z" fill={p.yellow} />
      <Path d="M8 14c-1-3 0-6 2-6 1 2 1 4-2 6z" fill={p.brown} />
      <Path d="M12 20c3 10 12 17 24 17" stroke={p.orange} strokeWidth={2} fill="none" opacity={0.6} />
    </>
  ),
  strawberry: (p) => (
    <>
      <Path d="M24 44C12 36 8 26 10 20c2-5 8-6 14-4 6-2 12-1 14 4 2 6-2 16-14 24z" fill={p.red} />
      <Path d="M14 16l4-6 6 5 6-5 4 6-10 2z" fill={p.green} />
      <Circle cx="18" cy="24" r="1.2" fill={p.cream} />
      <Circle cx="26" cy="22" r="1.2" fill={p.cream} />
      <Circle cx="30" cy="28" r="1.2" fill={p.cream} />
      <Circle cx="21" cy="32" r="1.2" fill={p.cream} />
      <Circle cx="25" cy="38" r="1.2" fill={p.cream} />
    </>
  ),
  chicken: (p) => (
    <>
      <Path d="M28 8c8 0 14 6 14 14 0 10-10 14-16 12l-8 8-6-6 8-8c-4-6 0-20 8-20z" fill={p.orange} />
      <Path d="M18 34l-6 6" stroke={p.cream} strokeWidth={5} strokeLinecap="round" />
      <Circle cx="10" cy="42" r="3.5" fill={p.cream} />
      <Circle cx="13" cy="45" r="3" fill={p.cream} />
      <Ellipse cx="30" cy="16" rx="5" ry="3" fill={p.yellow} opacity={0.6} />
    </>
  ),
  bell_pepper: (p) => (
    <>
      <Path d="M12 18c0-6 6-8 12-6 6-2 12 0 12 6 2 10-2 24-12 24S10 28 12 18z" fill={p.red} />
      <Path d="M24 12V6c0-2 3-3 5-2" stroke={p.green} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M24 14v26" stroke={p.redDeep} strokeWidth={1.6} opacity={0.5} />
      <Ellipse cx="17" cy="22" rx="2.5" ry="5" fill={p.card} opacity={0.45} />
    </>
  ),
  chili: (p) => (
    <>
      <Path d="M30 12c6 2 8 8 4 16-4 8-14 14-26 14 8-4 14-10 16-18 1-6 2-12 6-12z" fill={p.red} />
      <Path d="M30 12c0-4 2-7 6-8" stroke={p.green} strokeWidth={3} strokeLinecap="round" fill="none" />
    </>
  ),
  broccoli: (p) => (
    <>
      <Path d="M20 26h8l2 18H18z" fill={p.greenDeep} />
      <Circle cx="16" cy="20" r="8" fill={p.green} />
      <Circle cx="32" cy="20" r="8" fill={p.green} />
      <Circle cx="24" cy="13" r="9" fill={p.green} />
      <Circle cx="21" cy="11" r="2" fill={p.greenDeep} opacity={0.5} />
      <Circle cx="31" cy="19" r="2" fill={p.greenDeep} opacity={0.5} />
    </>
  ),
  corn: (p) => (
    <>
      <Path d="M24 4c7 0 10 10 10 20s-3 18-10 18-10-8-10-18S17 4 24 4z" fill={p.yellow} />
      <Path d="M18 12h12M16 20h16M16 28h16M18 36h12M24 6v34" stroke={p.orange} strokeWidth={1.5} opacity={0.6} />
      <Path d="M14 24c-6 6-6 16 4 20 2-6 2-12-4-20zM34 24c6 6 6 16-4 20-2-6-2-12 4-20z" fill={p.green} />
    </>
  ),
  cucumber: (p) => (
    <>
      <Rect x="6" y="18" width="36" height="13" rx="6.5" fill={p.green} transform="rotate(-30 24 24)" />
      <Path d="M14 30l2-1M22 25l2-1M30 20l2-1" stroke={p.card} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
    </>
  ),
  avocado: (p) => (
    <>
      <Path d="M24 4c8 0 10 12 14 20 4 10-4 20-14 20S6 34 10 24c4-8 6-20 14-20z" fill={p.greenDeep} />
      <Path d="M24 9c6 0 7 10 10 16 3 8-3 15-10 15s-13-7-10-15c3-6 4-16 10-16z" fill="#CFE3A0" />
      <Circle cx="24" cy="30" r="6" fill={p.brown} />
    </>
  ),
  chocolate: (p) => (
    <>
      <Rect x="10" y="8" width="28" height="34" rx="3" fill={p.panIn} />
      <Path d="M10 19h28M10 30h28M24 8v34" stroke={p.ink} strokeWidth={2} />
      <Path d="M10 30l28-22v34H10z" fill={p.red} opacity={0.9} />
    </>
  ),
  water: (p) => (
    <>
      <Path d="M24 6c6 10 14 16 14 24a14 14 0 0 1-28 0c0-8 8-14 14-24z" fill={p.blue} />
      <Ellipse cx="19" cy="30" rx="3" ry="5" fill={p.card} opacity={0.55} />
    </>
  ),
  yogurt: (p) => (
    <>
      <Path d="M12 16h24l-3 26H15z" fill={p.card} stroke={p.ink} strokeWidth={2} />
      <Rect x="10" y="11" width="28" height="6" rx="2" fill={p.blue} />
      <Circle cx="24" cy="29" r="5" fill="#E8A8B8" />
    </>
  ),
  meat: (p) => (
    <>
      <Path d="M8 24c0-10 10-16 22-14s12 12 8 20-14 10-22 8S8 32 8 24z" fill="#D9646B" />
      <Path d="M14 22c6-6 18-6 22 2" stroke={p.cream} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Circle cx="30" cy="30" r="4" fill={p.cream} />
    </>
  ),
  fish: (p) => (
    <>
      <Path d="M6 24c6-10 20-12 30-2l6-6v16l-6-6C26 36 12 34 6 24z" fill={p.blue} />
      <Circle cx="14" cy="22" r="2" fill={p.ink} />
      <Path d="M20 18c3 4 3 8 0 12" stroke={p.card} strokeWidth={2} fill="none" opacity={0.6} />
    </>
  ),
};

const ALIASES: Record<string, string> = {
  tomatoes: 'tomato', 'cherry tomato': 'tomato', 'cherry tomatoes': 'tomato',
  sauce: 'tomato_sauce', 'tomato sauce': 'tomato_sauce', passata: 'tomato_sauce', marinara: 'tomato_sauce', ketchup: 'tomato_sauce', 'tomato paste': 'tomato_sauce',
  onions: 'onion', shallot: 'onion', shallots: 'onion', 'spring onion': 'herbs', scallion: 'herbs', leek: 'herbs',
  eggs: 'egg', yolk: 'egg',
  cream: 'milk', 'heavy cream': 'milk', 'oat milk': 'milk',
  parmesan: 'cheese', mozzarella: 'cheese', cheddar: 'cheese', feta: 'cheese', ricotta: 'cheese',
  greens: 'spinach', kale: 'spinach', lettuce: 'spinach', cabbage: 'spinach', salad: 'spinach', arugula: 'spinach', rocket: 'spinach',
  basil: 'herbs', parsley: 'herbs', cilantro: 'herbs', coriander: 'herbs', mint: 'herbs', thyme: 'herbs', rosemary: 'herbs', dill: 'herbs', herb: 'herbs',
  carrots: 'carrot', lemons: 'lemon', 'lemon juice': 'lemon', limes: 'lime', 'lime juice': 'lime',
  toast: 'bread', bun: 'bread', buns: 'bread', baguette: 'bread', tortilla: 'bread', breadcrumbs: 'bread',
  spaghetti: 'pasta', noodles: 'pasta', penne: 'pasta', macaroni: 'pasta', ramen: 'pasta', linguine: 'pasta', fettuccine: 'pasta', lasagna: 'pasta',
  'brown rice': 'rice', oats: 'rice', quinoa: 'rice',
  'all-purpose flour': 'flour', cornstarch: 'flour', 'baking powder': 'flour', 'baking soda': 'flour',
  'brown sugar': 'sugar', honey: 'sugar', syrup: 'sugar',
  pepper: 'salt', 'black pepper': 'salt', 'salt and pepper': 'salt', spices: 'salt', paprika: 'salt', cumin: 'salt',
  'olive oil': 'oil', 'vegetable oil': 'oil', 'sesame oil': 'oil', vinegar: 'oil', 'soy sauce': 'oil',
  mushrooms: 'mushroom', potatoes: 'potato', 'sweet potato': 'potato',
  apples: 'apple', bananas: 'banana', strawberries: 'strawberry', berries: 'strawberry', blueberries: 'strawberry',
  'chicken breast': 'chicken', 'chicken thigh': 'chicken', turkey: 'chicken',
  beef: 'meat', pork: 'meat', bacon: 'meat', sausage: 'meat', ham: 'meat', 'ground beef': 'meat', steak: 'meat',
  salmon: 'fish', tuna: 'fish', shrimp: 'fish', prawns: 'fish',
  'bell pepper': 'bell_pepper', 'red pepper': 'bell_pepper', capsicum: 'bell_pepper', peppers: 'bell_pepper',
  chilli: 'chili', chilies: 'chili', jalapeno: 'chili', 'chili flakes': 'chili',
  zucchini: 'cucumber', courgette: 'cucumber', cucumbers: 'cucumber',
  avocados: 'avocado', cocoa: 'chocolate', 'chocolate chips': 'chocolate',
  stock: 'water', broth: 'water', 'chicken stock': 'water',
  'greek yogurt': 'yogurt', yoghurt: 'yogurt', 'sour cream': 'yogurt',
};

export type IngredientKey = keyof typeof ART;

/** Map any free-text ingredient ("2 cloves garlic, minced") to an art key, or null. */
export function resolveIngredientKey(raw: string): string | null {
  const text = raw.toLowerCase().replace(/[^a-z\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  if (ART[text]) return text;
  if (ALIASES[text]) return ALIASES[text];

  // Longest multi-word alias contained in the text wins ("olive oil" before "oil").
  const phrases = Object.keys(ALIASES)
    .filter((a) => a.includes(' '))
    .sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    if (text.includes(phrase)) return ALIASES[phrase];
  }
  const words = text.split(' ').reverse();
  for (const word of words) {
    if (ART[word]) return word;
    if (ALIASES[word]) return ALIASES[word];
    const singular = word.endsWith('es') ? word.slice(0, -2) : word.endsWith('s') ? word.slice(0, -1) : word;
    if (ART[singular]) return singular;
    if (ALIASES[singular]) return ALIASES[singular];
  }
  return null;
}

export function hasIngredientArt(raw: string): boolean {
  return resolveIngredientKey(raw) !== null;
}

function FallbackJar({ p, letter }: { p: P; letter: string }) {
  return (
    <>
      <Rect x="13" y="8" width="22" height="7" rx="2" fill={p.red} />
      <Path d="M11 15h26v24a5 5 0 0 1-5 5H16a5 5 0 0 1-5-5z" fill={p.cream} stroke={p.ink} strokeWidth={2} />
      <Rect x="14" y="22" width="20" height="14" rx="2" fill={p.card} />
      <SvgText x="24" y="33.5" fontSize="11" fontWeight="bold" fill={p.ink} textAnchor="middle">
        {letter}
      </SvgText>
    </>
  );
}

interface IngredientArtProps {
  name: string;
  size?: number;
  /** Draw the soft paper drop shadow (on by default). */
  shadow?: boolean;
}

export function IngredientArt({ name, size = 48, shadow = true }: IngredientArtProps) {
  const key = resolveIngredientKey(name);
  const draw = key ? ART[key] : null;
  const body = draw ? draw(paper) : <FallbackJar p={paper} letter={(name.trim()[0] ?? '?').toUpperCase()} />;
  const silhouette = draw ? draw(SHADOW_PALETTE) : <FallbackJar p={SHADOW_PALETTE} letter="" />;

  return (
    <Svg width={size} height={size} viewBox="-1 -1 51 51">
      {shadow ? (
        <G opacity={0.2} transform="translate(2 3)">
          {silhouette}
        </G>
      ) : null}
      {body}
    </Svg>
  );
}

/** Every colour flattened to ink: used to draw the silhouette shadow under each piece. */
const SHADOW_PALETTE = Object.fromEntries(Object.keys(paper).map((k) => [k, paper.ink])) as unknown as P;

export const INGREDIENT_KEYS = Object.keys(ART);
