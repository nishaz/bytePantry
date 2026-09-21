import * as SQLite from 'expo-sqlite';

import type { Recipe, RecipeRow, Step } from '../types/recipe';

const DB_NAME = 'pixel-pantry.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

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

export async function initDb(): Promise<void> {
  const db = await getDb();
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
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO recipes (id, title, ingredients, steps, source, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    recipe.id,
    recipe.title,
    JSON.stringify(recipe.ingredients),
    JSON.stringify(recipe.steps),
    recipe.source,
    recipe.createdAt,
  );
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE id = ?',
    id,
  );
  return row ? rowToRecipe(row) : null;
}

export async function listRecipes(): Promise<Recipe[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RecipeRow>(
    'SELECT * FROM recipes ORDER BY createdAt DESC',
  );
  return rows.map(rowToRecipe);
}

export function createRecipeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
