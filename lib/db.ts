import { runDb } from './database';
import { initFridgeTable } from './fridgeDb';
import { initMealPlanTable } from './mealPlan';
import { initProfileTable } from './profile';
import type { Recipe, RecipeRow, Step } from '../types/recipe';
import type { Nutrition } from './nutrition';

function parseNutrition(raw: string | null | undefined): Nutrition | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Nutrition;
  } catch {
    return null;
  }
}

/** Cook a recipe this many times to unlock its collectible card. */
export const CARD_UNLOCK_COOKS = 3;

function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    ingredients: JSON.parse(row.ingredients) as string[],
    steps: JSON.parse(row.steps) as Step[],
    source: row.source,
    sourceUrl: row.sourceUrl ?? null,
    servings: row.servings ?? null,
    nutrition: parseNutrition(row.nutrition),
    timesCooked: row.timesCooked ?? 0,
    createdAt: row.createdAt,
  };
}

const STARTER_RECIPES: Omit<Recipe, 'id' | 'createdAt'>[] = [
  {
    title: 'Spinach omelette',
    ingredients: ['2 eggs', '1 handful spinach', '30g cheese', '1 tbsp milk', '1 tsp butter'],
    servings: 1,
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
    ingredients: ['200g pasta', '3 tomatoes', '2 cloves garlic', '1 onion', '2 tbsp olive oil', '40g cheese'],
    servings: 2,
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
        `INSERT INTO recipes (id, title, ingredients, steps, source, servings, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        createRecipeId(),
        recipe.title,
        JSON.stringify(recipe.ingredients),
        JSON.stringify(recipe.steps),
        recipe.source,
        recipe.servings ?? null,
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
        const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(recipes)');
        if (!columns.some((c) => c.name === 'sourceUrl')) {
          await db.execAsync('ALTER TABLE recipes ADD COLUMN sourceUrl TEXT');
        }
        if (!columns.some((c) => c.name === 'servings')) {
          await db.execAsync('ALTER TABLE recipes ADD COLUMN servings INTEGER');
        }
        if (!columns.some((c) => c.name === 'nutrition')) {
          await db.execAsync('ALTER TABLE recipes ADD COLUMN nutrition TEXT');
        }
        if (!columns.some((c) => c.name === 'timesCooked')) {
          await db.execAsync('ALTER TABLE recipes ADD COLUMN timesCooked INTEGER NOT NULL DEFAULT 0');
        }
      });
      await initFridgeTable();
      await initProfileTable();
      await initMealPlanTable();
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
      `INSERT OR REPLACE INTO recipes (id, title, ingredients, steps, source, sourceUrl, servings, nutrition, timesCooked, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      recipe.id,
      recipe.title,
      JSON.stringify(recipe.ingredients),
      JSON.stringify(recipe.steps),
      recipe.source,
      recipe.sourceUrl ?? null,
      recipe.servings ?? null,
      recipe.nutrition ? JSON.stringify(recipe.nutrition) : null,
      recipe.timesCooked ?? 0,
      recipe.createdAt,
    ),
  );
}

/** Count a finished cook. Returns the new total. */
export async function recordCook(id: string): Promise<number> {
  return runDb(async (db) => {
    await db.runAsync('UPDATE recipes SET timesCooked = COALESCE(timesCooked, 0) + 1 WHERE id = ?', id);
    const row = await db.getFirstAsync<{ timesCooked: number }>('SELECT timesCooked FROM recipes WHERE id = ?', id);
    return row?.timesCooked ?? 0;
  });
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

export async function deleteRecipe(id: string): Promise<void> {
  await runDb((db) => db.runAsync('DELETE FROM recipes WHERE id = ?', id));
}

export function createRecipeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
