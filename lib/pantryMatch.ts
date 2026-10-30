import { resolveIngredientKey } from '../components/paper/IngredientArt';
import type { FridgeItem } from '../types/fridge';
import type { Recipe } from '../types/recipe';

/** Staples we assume every kitchen has, so they never block "you can cook this". */
const PANTRY_STAPLES = new Set(['salt', 'oil', 'water', 'sugar', 'flour']);

function keyFor(name: string): string {
  return resolveIngredientKey(name) ?? name.trim().toLowerCase();
}

export interface RecipeMatch {
  recipe: Recipe;
  have: number;
  total: number;
  missing: string[];
  /** True when the recipe uses something that expires within 2 days. */
  usesExpiring: boolean;
}

export function matchRecipe(recipe: Recipe, fridge: FridgeItem[]): RecipeMatch {
  const fridgeKeys = new Set(fridge.map((item) => keyFor(item.spriteName || item.name)));
  fridge.forEach((item) => fridgeKeys.add(keyFor(item.name)));
  const expiringKeys = new Set(
    fridge.filter((item) => item.daysUntilExpiry <= 2).map((item) => keyFor(item.name)),
  );

  const missing: string[] = [];
  let have = 0;
  let usesExpiring = false;
  for (const ingredient of recipe.ingredients) {
    const key = keyFor(ingredient);
    if (fridgeKeys.has(key) || PANTRY_STAPLES.has(key)) {
      have += 1;
      if (expiringKeys.has(key)) usesExpiring = true;
    } else {
      missing.push(ingredient);
    }
  }
  return { recipe, have, total: recipe.ingredients.length, missing, usesExpiring };
}

/** Best recipe to cook right now: fewest missing items, then rescues expiring food. */
export function pickCookNow(recipes: Recipe[], fridge: FridgeItem[]): RecipeMatch | null {
  const matches = recipes.map((recipe) => matchRecipe(recipe, fridge));
  matches.sort((a, b) => {
    if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
    if (a.usesExpiring !== b.usesExpiring) return a.usesExpiring ? -1 : 1;
    return b.have - a.have;
  });
  return matches[0] ?? null;
}
