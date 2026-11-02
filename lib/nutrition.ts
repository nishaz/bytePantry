import { resolveIngredientKey } from '../components/paper/IngredientArt';

/** Per-serving nutrition shown on the recipe card. */
export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  /** True when the numbers came from the estimator rather than the cook. */
  estimated: boolean;
}

export const NUTRIENT_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fiber', label: 'Fibre', unit: 'g' },
] as const;
export type NutrientKey = (typeof NUTRIENT_FIELDS)[number]['key'];

/**
 * Rough per-100g values (kcal, protein, carbs, fat, fibre), the weight of "one" of the thing,
 * and the weight of a cup. Values are typical USDA-style figures; good enough for a fun card.
 */
type Row = [kcal: number, protein: number, carbs: number, fat: number, fiber: number, eachG: number, cupG: number];

const FOOD: Record<string, Row> = {
  tomato: [18, 0.9, 3.9, 0.2, 1.2, 120, 180],
  tomato_sauce: [30, 1.4, 6, 0.2, 1.5, 100, 245],
  onion: [40, 1.1, 9.3, 0.1, 1.7, 110, 160],
  garlic: [149, 6.4, 33, 0.5, 2.1, 4, 136],
  egg: [143, 12.6, 0.7, 9.5, 0, 50, 243],
  milk: [61, 3.2, 4.8, 3.3, 0, 240, 244],
  cheese: [400, 25, 1.3, 33, 0, 30, 113],
  butter: [717, 0.9, 0.1, 81, 0, 14, 227],
  spinach: [23, 2.9, 3.6, 0.4, 2.2, 30, 30],
  herbs: [30, 2, 5, 0.5, 3, 5, 20],
  carrot: [41, 0.9, 9.6, 0.2, 2.8, 60, 128],
  lemon: [29, 1.1, 9.3, 0.3, 2.8, 60, 244],
  lime: [30, 0.7, 10.5, 0.2, 2.8, 45, 244],
  bread: [265, 9, 49, 3.2, 2.7, 30, 45],
  pasta: [371, 13, 75, 1.5, 3.2, 85, 100],
  rice: [360, 7, 79, 0.6, 1.3, 75, 185],
  flour: [364, 10, 76, 1, 2.7, 125, 125],
  sugar: [387, 0, 100, 0, 0, 4, 200],
  salt: [0, 0, 0, 0, 0, 1, 288],
  oil: [884, 0, 0, 100, 0, 14, 218],
  mushroom: [22, 3.1, 3.3, 0.3, 1, 18, 70],
  potato: [77, 2, 17, 0.1, 2.2, 200, 150],
  apple: [52, 0.3, 14, 0.2, 2.4, 180, 125],
  banana: [89, 1.1, 23, 0.3, 2.6, 120, 150],
  strawberry: [32, 0.7, 7.7, 0.3, 2, 12, 150],
  chicken: [165, 31, 0, 3.6, 0, 170, 140],
  bell_pepper: [31, 1, 6, 0.3, 2.1, 120, 150],
  chili: [40, 1.9, 8.8, 0.4, 1.5, 15, 75],
  broccoli: [34, 2.8, 6.6, 0.4, 2.6, 300, 90],
  corn: [86, 3.3, 19, 1.4, 2, 100, 150],
  cucumber: [15, 0.7, 3.6, 0.1, 0.5, 300, 120],
  avocado: [160, 2, 8.5, 14.7, 6.7, 150, 150],
  chocolate: [546, 4.9, 61, 31, 7, 10, 170],
  water: [0, 0, 0, 0, 0, 240, 240],
  yogurt: [75, 6, 5, 3, 0, 170, 245],
  meat: [250, 26, 0, 17, 0, 150, 225],
  fish: [180, 22, 0, 10, 0, 150, 140],
  pumpkin: [30, 1, 7.5, 0.2, 2, 400, 245],
  butternut_squash: [45, 1, 12, 0.1, 2, 700, 140],
  sweet_potato: [86, 1.6, 20, 0.1, 3, 130, 133],
  zucchini: [17, 1.2, 3.1, 0.3, 1, 200, 124],
  eggplant: [25, 1, 6, 0.2, 3, 450, 82],
  cauliflower: [25, 1.9, 5, 0.3, 2, 575, 107],
  cabbage: [25, 1.3, 6, 0.1, 2.5, 900, 89],
  lettuce: [15, 1.4, 2.9, 0.2, 1.3, 300, 50],
  peas: [81, 5.4, 14, 0.4, 5, 100, 145],
  green_beans: [31, 1.8, 7, 0.2, 2.7, 100, 110],
  asparagus: [20, 2.2, 3.9, 0.1, 2.1, 16, 134],
  celery: [16, 0.7, 3, 0.2, 1.6, 40, 100],
  beetroot: [43, 1.6, 10, 0.2, 2.8, 80, 136],
  radish: [16, 0.7, 3.4, 0.1, 1.6, 5, 116],
  spring_onion: [32, 1.8, 7.3, 0.2, 2.6, 15, 100],
  leek: [61, 1.5, 14, 0.3, 1.8, 90, 89],
  ginger: [80, 1.8, 18, 0.8, 2, 10, 96],
  olive: [115, 0.8, 6, 11, 3.2, 4, 135],
  pickle: [12, 0.3, 2.3, 0.2, 1, 35, 150],
  orange: [47, 0.9, 12, 0.1, 2.4, 130, 180],
  grapes: [69, 0.7, 18, 0.2, 0.9, 5, 150],
  pineapple: [50, 0.5, 13, 0.1, 1.4, 900, 165],
  mango: [60, 0.8, 15, 0.4, 1.6, 200, 165],
  peach: [39, 0.9, 10, 0.3, 1.5, 150, 155],
  pear: [57, 0.4, 15, 0.1, 3.1, 180, 140],
  cherry: [63, 1, 16, 0.2, 2.1, 8, 150],
  blueberry: [57, 0.7, 14, 0.3, 2.4, 1, 148],
  raspberry: [52, 1.2, 12, 0.7, 6.5, 2, 123],
  watermelon: [30, 0.6, 7.6, 0.2, 0.4, 280, 152],
  kiwi: [61, 1.1, 15, 0.5, 3, 75, 180],
  coconut: [230, 2.3, 6, 24, 2.2, 400, 240],
  pomegranate: [83, 1.7, 19, 1.2, 4, 280, 174],
  cream: [340, 2.8, 2.7, 36, 0, 15, 238],
  cream_cheese: [342, 6, 4, 34, 0, 28, 232],
  mozzarella: [280, 28, 3, 17, 0, 125, 113],
  parmesan: [431, 38, 4, 29, 0, 5, 100],
  feta: [264, 14, 4, 21, 0, 30, 150],
  ice_cream: [207, 3.5, 24, 11, 0.7, 70, 132],
  tofu: [76, 8, 1.9, 4.8, 0.3, 400, 252],
  shrimp: [99, 24, 0.2, 0.3, 0, 15, 145],
  bacon: [541, 37, 1.4, 42, 0, 10, 90],
  sausage: [300, 12, 2, 27, 0, 75, 135],
  beans: [127, 8.7, 23, 0.5, 6.4, 240, 180],
  chickpeas: [164, 8.9, 27, 2.6, 7.6, 240, 164],
  lentils: [352, 25, 63, 1, 11, 190, 192],
  nuts: [600, 20, 20, 52, 8, 1.2, 140],
  peanut_butter: [588, 25, 20, 50, 6, 16, 258],
  oats: [389, 17, 66, 7, 10.6, 40, 90],
  honey: [304, 0.3, 82, 0, 0, 21, 340],
  maple_syrup: [260, 0, 67, 0.1, 0, 20, 315],
  soy_sauce: [53, 8, 4.9, 0.6, 0.8, 16, 255],
  vinegar: [18, 0, 0, 0, 0, 15, 240],
  spices: [300, 10, 55, 8, 25, 2.5, 100],
  vanilla: [288, 0, 13, 0, 0, 4, 208],
  tortilla: [310, 8, 52, 7, 3.5, 45, 90],
  noodles: [380, 10, 75, 4, 3, 85, 100],
  stock: [5, 0.6, 0.4, 0.2, 0, 240, 240],
  coffee: [2, 0.1, 0, 0, 0, 240, 240],
  tea: [1, 0, 0.3, 0, 0, 240, 240],
  sesame: [573, 18, 23, 50, 12, 9, 144],
  breadcrumbs: [395, 13, 72, 5, 4.5, 30, 108],
};

// Grams per unit. Volume units are converted through the food's cup weight (1 cup = 16 tbsp = 48 tsp).
const WEIGHT_UNITS: [RegExp, number][] = [
  [/^(kg|kilos?|kilograms?)$/, 1000],
  [/^(g|gr|grams?|gm)$/, 1],
  [/^(mg)$/, 0.001],
  [/^(lbs?|pounds?)$/, 454],
  [/^(oz|ounces?)$/, 28.35],
];
const VOLUME_UNITS: [RegExp, number][] = [
  [/^(cups?|c)$/, 1],
  [/^(tbsps?|tablespoons?|tbs|tbl)$/, 1 / 16],
  [/^(tsps?|teaspoons?)$/, 1 / 48],
  [/^(ml|millilit(er|re)s?)$/, 1 / 240],
  [/^(l|lit(er|re)s?)$/, 1000 / 240],
  [/^(fl\.? ?oz)$/, 1 / 8],
];
const OTHER_UNITS: [RegExp, (row: Row) => number][] = [
  [/^(pinch(es)?|dash(es)?)$/, () => 0.4],
  [/^(handfuls?)$/, () => 30],
  [/^(slices?)$/, (r) => Math.min(r[5], 30)],
  [/^(cans?|tins?)$/, () => 400],
  [/^(bunch(es)?)$/, () => 100],
  [/^(cloves?)$/, () => 4],
  [/^(sticks?)$/, () => 113],
  [/^(blocks?|packs?|packets?)$/, () => 250],
  [/^(bags?)$/, () => 200],
  [/^(cubes?)$/, () => 10],
];

const NUMBER = String.raw`(\d+\s+\d+\/\d+|\d+\s*[½¼¾⅓⅔⅛]|\d+\/\d+|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛])`;
const FRAC: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };

function toNumber(t: string): number {
  const s = t.trim();
  let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = s.match(/^(\d+)\s*([½¼¾⅓⅔⅛])$/);
  if (m) return Number(m[1]) + FRAC[m[2]];
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  return FRAC[s] ?? Number(s);
}

/** Best-guess grams for one ingredient line, or null when the food is unknown. */
export function gramsFor(line: string): { key: string; grams: number } | null {
  const key = resolveIngredientKey(line);
  if (!key || !FOOD[key]) return null;
  const row = FOOD[key];
  const text = line.toLowerCase().replace(/\(.*?\)/g, ' ').trim();
  if (/to taste|for serving|to serve|optional|garnish/.test(text) && !/^\d/.test(text)) return { key, grams: 0 };

  const m = text.match(new RegExp(String.raw`^${NUMBER}(?:\s*(?:-|–|to)\s*${NUMBER})?\s*([a-z.]+(?:\s?oz)?)?`));
  if (!m) {
    // No amount: assume one of it, capped so "salt" or "a cabbage" doesn't dominate.
    return { key, grams: Math.min(row[5], 150) };
  }
  const low = toNumber(m[1]);
  const amount = m[2] ? (low + toNumber(m[2])) / 2 : low;
  const unit = (m[3] ?? '').replace(/\.$/, '');
  for (const [re, g] of WEIGHT_UNITS) if (re.test(unit)) return { key, grams: amount * g };
  for (const [re, cups] of VOLUME_UNITS) if (re.test(unit)) return { key, grams: amount * cups * row[6] };
  for (const [re, fn] of OTHER_UNITS) if (re.test(unit)) return { key, grams: amount * fn(row) };
  return { key, grams: amount * row[5] };
}

/** Per-serving estimate from free-text ingredient lines. Unknown foods are skipped. */
export function estimateNutrition(ingredients: string[], servings: number): Nutrition {
  const total = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  for (const line of ingredients) {
    const hit = gramsFor(line);
    if (!hit) continue;
    const [kcal, protein, carbs, fat, fiber] = FOOD[hit.key];
    const f = hit.grams / 100;
    total.calories += kcal * f;
    total.protein += protein * f;
    total.carbs += carbs * f;
    total.fat += fat * f;
    total.fiber += fiber * f;
  }
  const per = Math.max(1, servings);
  return {
    calories: Math.round(total.calories / per / 5) * 5,
    protein: Math.round(total.protein / per),
    carbs: Math.round(total.carbs / per),
    fat: Math.round(total.fat / per),
    fiber: Math.round(total.fiber / per),
    estimated: true,
  };
}

/** How many of the ingredient lines the estimator recognised (for an honest "based on 8 of 10" note). */
export function nutritionCoverage(ingredients: string[]): { known: number; total: number } {
  return { known: ingredients.filter((line) => gramsFor(line) !== null).length, total: ingredients.length };
}
