import type { Nutrition } from '../lib/nutrition';

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
  /** Per-serving stats for the recipe card (estimated or typed in). */
  nutrition?: Nutrition | null;
  /** How many times the dish has been cooked to the end. The card unlocks at CARD_UNLOCK_COOKS. */
  timesCooked?: number;
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
  nutrition?: string | null;
  timesCooked?: number | null;
  createdAt: number;
}
