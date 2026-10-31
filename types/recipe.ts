export type Action = 'chop' | 'stir' | 'bake' | 'pour' | 'fry' | 'mix' | 'blend';

export interface Step {
  text: string;
  action: Action;
  ingredient: string;
  tool: string;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: Step[];
  source: string;
  /** Original link the recipe was imported from, if any. */
  sourceUrl?: string | null;
  /** How many people the recipe was written for. */
  servings?: number | null;
  createdAt: number;
}

export interface RecipeRow {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  source: string;
  sourceUrl?: string | null;
  servings?: number | null;
  createdAt: number;
}
