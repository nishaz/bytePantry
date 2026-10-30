import type { FridgeItem, FridgeItemRow, StorageLocation } from '../types/fridge';

import { runDb } from './database';

interface SeedItem {
  spriteName: string;
  name: string;
  category: string;
  amount: string;
  days: number;
  location: StorageLocation;
}

const SEED_ITEMS: SeedItem[] = [
  { spriteName: 'spinach', name: 'Spinach', category: 'Produce', amount: '1 bag', days: 0, location: 'fridge' },
  { spriteName: 'milk', name: 'Milk', category: 'Dairy', amount: '1/2 carton', days: 1, location: 'fridge' },
  { spriteName: 'tomato', name: 'Tomato', category: 'Produce', amount: '3', days: 3, location: 'fridge' },
  { spriteName: 'cheese', name: 'Cheese', category: 'Dairy', amount: '200 g', days: 5, location: 'fridge' },
  { spriteName: 'egg', name: 'Eggs', category: 'Protein', amount: '6 left', days: 9, location: 'fridge' },
  { spriteName: 'butter', name: 'Butter', category: 'Dairy', amount: '1 block', days: 14, location: 'fridge' },
  { spriteName: 'garlic', name: 'Garlic', category: 'Produce', amount: '1 bulb', days: 20, location: 'cupboard' },
  { spriteName: 'onion', name: 'Onion', category: 'Produce', amount: '2', days: 12, location: 'cupboard' },
  { spriteName: 'pasta', name: 'Pasta', category: 'Grains', amount: '500 g', days: 300, location: 'cupboard' },
  { spriteName: 'rice', name: 'Rice', category: 'Grains', amount: '1 kg', days: 400, location: 'cupboard' },
  { spriteName: 'tomato sauce', name: 'Passata', category: 'Sauces', amount: '2 jars', days: 180, location: 'cupboard' },
  { spriteName: 'olive oil', name: 'Olive oil', category: 'Sauces', amount: '3/4 bottle', days: 365, location: 'cupboard' },
  { spriteName: 'flour', name: 'Flour', category: 'Baking', amount: '1 bag', days: 200, location: 'cupboard' },
];

/** Shelf a thing naturally sits on, used to arrange the open fridge / cupboard. */
export function shelfFor(item: Pick<FridgeItem, 'category' | 'location'>): string {
  if (item.location === 'fridge') {
    if (item.category === 'Dairy' || item.category === 'Sauces') return 'Top shelf';
    if (item.category === 'Produce') return 'Crisper drawer';
    return 'Bottom shelf';
  }
  if (item.category === 'Sauces') return 'Jars & bottles';
  if (item.category === 'Produce') return 'Veg basket';
  return 'Dry goods';
}

export function defaultLocationFor(category: string): StorageLocation {
  return ['Grains', 'Baking', 'Sauces'].includes(category) ? 'cupboard' : 'fridge';
}

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

function daysUntil(expiresOn: string): number {
  const target = new Date(`${expiresOn}T12:00:00`).getTime();
  const today = new Date(`${dayKey(new Date())}T12:00:00`).getTime();
  return Math.round((target - today) / 86400000);
}

function rowToItem(row: FridgeItemRow): FridgeItem {
  const expiresOn = row.expiresOn ?? dateInDays(row.daysUntilExpiry);
  const location: StorageLocation =
    row.location === 'cupboard' || row.location === 'fridge' ? row.location : defaultLocationFor(row.category);
  return { ...row, expiresOn, location, daysUntilExpiry: daysUntil(expiresOn) };
}

export async function initFridgeTable(): Promise<void> {
  await runDb(async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fridge_items (
        id TEXT PRIMARY KEY NOT NULL,
        spriteName TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        amount TEXT NOT NULL,
        daysUntilExpiry INTEGER NOT NULL,
        posX REAL NOT NULL,
        posY REAL NOT NULL
      );
    `);

    // Migration: real expiry dates + where the item is stored.
    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(fridge_items)');
    const names = new Set(columns.map((c) => c.name));
    if (!names.has('expiresOn')) {
      await db.execAsync('ALTER TABLE fridge_items ADD COLUMN expiresOn TEXT');
      const rows = await db.getAllAsync<{ id: string; daysUntilExpiry: number }>(
        'SELECT id, daysUntilExpiry FROM fridge_items',
      );
      for (const row of rows) {
        await db.runAsync('UPDATE fridge_items SET expiresOn = ? WHERE id = ?', dateInDays(row.daysUntilExpiry), row.id);
      }
    }
    if (!names.has('location')) {
      await db.execAsync('ALTER TABLE fridge_items ADD COLUMN location TEXT');
      await db.execAsync(
        "UPDATE fridge_items SET location = CASE WHEN category IN ('Grains','Baking','Sauces') THEN 'cupboard' ELSE 'fridge' END",
      );
    }

    const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM fridge_items');
    if ((count?.count ?? 0) > 0) {
      return;
    }

    for (const item of SEED_ITEMS) {
      await db.runAsync(
        `INSERT INTO fridge_items (id, spriteName, name, category, amount, daysUntilExpiry, posX, posY, expiresOn, location)
         VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
        createFridgeItemId(),
        item.spriteName,
        item.name,
        item.category,
        item.amount,
        item.days,
        dateInDays(item.days),
        item.location,
      );
    }
  });
}

export async function listFridgeItems(): Promise<FridgeItem[]> {
  return runDb(async (db) => {
    const rows = await db.getAllAsync<FridgeItemRow>('SELECT * FROM fridge_items ORDER BY name ASC');
    return rows.map(rowToItem).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  });
}

export interface NewFridgeItem {
  name: string;
  category: string;
  amount: string;
  days: number;
  location: StorageLocation;
}

export async function addFridgeItem(item: NewFridgeItem): Promise<void> {
  await runDb((db) =>
    db.runAsync(
      `INSERT INTO fridge_items (id, spriteName, name, category, amount, daysUntilExpiry, posX, posY, expiresOn, location)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      createFridgeItemId(),
      item.name.toLowerCase(),
      item.name,
      item.category,
      item.amount,
      item.days,
      dateInDays(item.days),
      item.location,
    ),
  );
}

export async function updateFridgeItem(id: string, item: NewFridgeItem): Promise<void> {
  await runDb((db) =>
    db.runAsync(
      `UPDATE fridge_items SET spriteName = ?, name = ?, category = ?, amount = ?, daysUntilExpiry = ?, expiresOn = ?, location = ?
       WHERE id = ?`,
      item.name.toLowerCase(),
      item.name,
      item.category,
      item.amount,
      item.days,
      dateInDays(item.days),
      item.location,
      id,
    ),
  );
}

export async function removeFridgeItem(id: string): Promise<void> {
  await runDb((db) => db.runAsync('DELETE FROM fridge_items WHERE id = ?', id));
}

/** Kept for the legacy draggable fridge view. */
export async function updateFridgeItemPosition(id: string, posX: number, posY: number): Promise<void> {
  await runDb((db) => db.runAsync('UPDATE fridge_items SET posX = ?, posY = ? WHERE id = ?', posX, posY, id));
}

export function createFridgeItemId(): string {
  return `fridge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
