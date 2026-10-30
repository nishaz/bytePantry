import { runDb } from './database';
import { initFridgeTable } from './fridgeDb';
import { initProfileTable } from './profile';
import type { Recipe, RecipeRow, Step } from '../types/recipe';

function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    ingredients: JSON.parse(row.ingredients) as string[],
    steps: JSON.parse(row.steps) as Step[],
    source: row.source,
    createdAt: row.createdAt,
  };
}

const STARTER_RECIPES: Omit<Recipe, 'id' | 'createdAt'>[] = [
  {
    title: 'Spinach omelette',
    ingredients: ['eggs', 'spinach', 'cheese', 'milk', 'butter'],
    steps: [
      { text: 'Whisk the eggs with a splash of milk', action: 'mix', ingredient: 'eggs, milk', tool: 'bowl' },
      { text: 'Melt the butter and wilt the spinach', action: 'fry', ingredient: 'butter, spinach', tool: 'pan' },
      { text: 'Pour in the eggs and scatter the cheese', action: 'pour', ingredient: 'eggs, cheese', tool: 'pan' },
      { text: 'Cook for 2 minutes, then fold it onto a plate', action: 'fry', ingredient: 'eggs', tool: 'pan' },
    ],
    source: 'sample',
  },
  {
    title: 'Garlic tomato pasta',
    ingredients: ['pasta', 'tomato', 'garlic', 'onion', 'olive oil', 'cheese'],
    steps: [
      { text: 'Chop the onion and garlic', action: 'chop', ingredient: 'onion, garlic', tool: 'cutting board' },
      { text: 'Fry the garlic and onion in olive oil', action: 'fry', ingredient: 'garlic, onion, olive oil', tool: 'pan' },
      { text: 'Stir in the chopped tomatoes and simmer for 10 minutes', action: 'stir', ingredient: 'tomato', tool: 'pot' },
      { text: 'Bake with cheese on top for 15 minutes', action: 'bake', ingredient: 'pasta, cheese', tool: 'oven' },
    ],
    source: 'sample',
  },
];

/** First launch only: give the kitchen two recipes so the home screen isn't empty. */
async function seedStarterRecipes(): Promise<void> {
  await runDb(async (db) => {
    const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM recipes');
    if ((count?.count ?? 0) > 0) return;
    let t = Date.now();
    for (const recipe of STARTER_RECIPES) {
      t -= 1000;
      await db.runAsync(
        `INSERT INTO recipes (id, title, ingredients, steps, source, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        createRecipeId(),
        recipe.title,
        JSON.stringify(recipe.ingredients),
        JSON.stringify(recipe.steps),
        recipe.source,
        t,
      );
    }
  });
}

let initPromise: Promise<void> | null = null;

export async function initDb(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await runDb(async (db) => {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS recipes (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            ingredients TEXT NOT NULL,
            steps TEXT NOT NULL,
            source TEXT NOT NULL,
            createdAt INTEGER NOT NULL
          );
        `);
      });
      await initFridgeTable();
      await initProfileTable();
      await seedStarterRecipes();
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  await runDb((db) =>
    db.runAsync(
      `INSERT OR REPLACE INTO recipes (id, title, ingredients, steps, source, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      recipe.id,
      recipe.title,
      JSON.stringify(recipe.ingredients),
      JSON.stringify(recipe.steps),
      recipe.source,
      recipe.createdAt,
    ),
  );
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  return runDb(async (db) => {
    const row = await db.getFirstAsync<RecipeRow>('SELECT * FROM recipes WHERE id = ?', id);
    return row ? rowToRecipe(row) : null;
  });
}

export async function listRecipes(): Promise<Recipe[]> {
  return runDb(async (db) => {
    const rows = await db.getAllAsync<RecipeRow>('SELECT * FROM recipes ORDER BY createdAt DESC');
    return rows.map(rowToRecipe);
  });
}

export function createRecipeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
