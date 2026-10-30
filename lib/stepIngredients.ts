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

function matchIngredientInStep(text: string, ingredient: string): boolean {
  const key = ingredient.toLowerCase();
  if (text.includes(key)) {
    return true;
  }

  const short = key.split(/[\s_-]+/).pop();
  return Boolean(short && short.length > 2 && text.includes(short));
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
  const matched = recipeIngredients.filter(
    (ingredient) => !isEquipmentLabel(ingredient) && matchIngredientInStep(text, ingredient),
  );
  if (matched.length > 0) {
    return withoutEquipment(matched, excludeTool);
  }

  const fromRecipe = withoutEquipment(recipeIngredients, excludeTool);
  return fromRecipe;
}

/** Ingredient label for chips / UI copy — falls back to first food ingredient. */
export function resolveStepIngredient(step: Step, recipeIngredients: string[]): string {
  const list = listStepIngredients(step, recipeIngredients);
  const foodOnly = withoutEquipment(recipeIngredients);
  return list[0] ?? foodOnly[0] ?? recipeIngredients[0] ?? 'ingredient';
}
