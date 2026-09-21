export type Action = 'chop' | 'stir' | 'bake' | 'pour' | 'fry' | 'mix';

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
  createdAt: number;
}

export interface RecipeRow {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  source: string;
  createdAt: number;
}
