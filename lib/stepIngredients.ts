import type { Step } from '../types/recipe';

const EQUIPMENT_PHRASES = [
  'cutting board',
  'cutting_board',
  'chopping board',
  'blender',
  'oven',
  'stovetop',
  'saucepan',
  'skillet',
  'frying pan',
  'fry pan',
  'mixing bowl',
  'baking sheet',
  'sheet pan',
];

const EQUIPMENT_WORDS = new Set([
  'board',
  'pan',
  'pot',
  'oven',
  'blender',
  'stove',
  'skillet',
  'saucepan',
  'knife',
  'spatula',
  'whisk',
  'tongs',
  'grater',
  'peeler',
]);

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, ' ');
}

/** Tools / surfaces — shown as equipment in the scene, not as ingredient sprites. */
export function isEquipmentLabel(label: string): boolean {
  const n = normalizeLabel(label);
  if (!n) {
    return false;
  }

  for (const phrase of EQUIPMENT_PHRASES) {
    if (n === phrase || n.includes(phrase)) {
      return true;
    }
  }

  if (EQUIPMENT_WORDS.has(n)) {
    return true;
  }

  if (/\bboard\b/.test(n) && !/\bbread\b/.test(n)) {
    return true;
  }

  return false;
}

function withoutEquipment(labels: string[], extraExclude: string[] = []): string[] {
  const exclude = new Set(extraExclude.map(normalizeLabel));
  const seen = new Set<string>();

  return labels.filter((label) => {
    const key = normalizeLabel(label);
    if (!key || exclude.has(key) || isEquipmentLabel(label)) {
      return false;
    }
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

const PREP_ONLY =
  /^(diced|chopped|minced|sliced|grated|peeled|crushed|drained|rinsed|halved|quartered|softened|melted|beaten|to taste|optional|finely chopped|roughly chopped|thinly sliced|for serving|to serve|divided)$/i;

const AMOUNT_WORDS =
  /^(\d+([./]\d+)?|[½¼¾⅓⅔⅛]|x|cups?|tbsps?|tablespoons?|tsps?|teaspoons?|g|kg|ml|l|oz|lbs?|pinch|handful|cloves?|cans?|tins?|packs?|packets?|bunch|large|medium|small|of|a|an|fresh|whole|big)$/i;

/** Words that name the food in an ingredient line: "250g pack tomatoey cooked lentils" → ["tomatoey", "cooked", "lentils"]. */
function foodWords(ingredient: string): string[] {
  const head = ingredient.toLowerCase().replace(/\(.*?\)/g, ' ').split(/[,;]/)[0];
  return head
    .replace(/[^a-z\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !AMOUNT_WORDS.test(w));
}

function stem(word: string): string {
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('oes')) return word.slice(0, -2);
  if (word.endsWith('es') && /(ch|sh|ss|x)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

/** Whole-word, plural-insensitive match on the ingredient's main word ("aubergines" ↔ "aubergine", never "oil" in "boil"). */
function matchIngredientInStep(text: string, ingredient: string): boolean {
  if (PREP_ONLY.test(ingredient.trim())) return false;
  const words = foodWords(ingredient);
  if (words.length === 0) return false;
  const main = stem(words[words.length - 1]);
  const body = main.endsWith('y') ? `${main.slice(0, -1)}(?:y|ies)` : `${main}(?:s|es)?`;
  const re = new RegExp(`\\b${body}\\b`, 'i');
  return re.test(text);
}

function splitIngredientField(raw: string): string[] {
  return raw
    .split(/\s*(?:,|&|\+| and )\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Food ingredients to show in the cook scene (never tools like cutting board). */
export function listStepIngredients(step: Step, recipeIngredients: string[]): string[] {
  const excludeTool = step.tool.trim() ? [step.tool.trim()] : [];

  if (step.ingredient.trim()) {
    const explicit = splitIngredientField(step.ingredient);
    const filtered = withoutEquipment(explicit, excludeTool);
    if (filtered.length > 0) {
      return filtered;
    }
  }

  const text = step.text.toLowerCase();
  // Steps that use "everything" or "all the ingredients" really do mean all of them.
  if (/\b(all (of )?the ingredients|everything)\b/.test(text)) {
    return withoutEquipment(recipeIngredients.filter((i) => !PREP_ONLY.test(i.trim())), excludeTool);
  }
  const matched = recipeIngredients.filter(
    (ingredient) => !isEquipmentLabel(ingredient) && matchIngredientInStep(text, ingredient),
  );
  if (matched.length > 0) {
    return withoutEquipment(matched, excludeTool);
  }

  // Nothing named ("Simmer for 10 minutes"): show no list rather than every ingredient in the recipe.
  return [];
}

/** Ingredient label for chips / UI copy — falls back to first food ingredient. */
export function resolveStepIngredient(step: Step, recipeIngredients: string[]): string {
  const list = listStepIngredients(step, recipeIngredients);
  const foodOnly = withoutEquipment(recipeIngredients);
  return list[0] ?? foodOnly[0] ?? recipeIngredients[0] ?? 'ingredient';
}
