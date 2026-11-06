import { runDb } from './database';

/** The four things you can plan for each day, in display order. */
export const MEAL_SLOTS = [
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'dessert', label: 'Dessert' },
  { key: 'extras', label: 'Extras' },
] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number]['key'];

export interface PlannedMeal {
  /** Local date, YYYY-MM-DD. */
  day: string;
  slot: MealSlot;
  recipeId: string;
}

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface PlanDay {
  key: string;
  date: Date;
  /** "Today", "Tomorrow", then the weekday name. */
  name: string;
  /** "Today", then "Tue", "Wed"… */
  short: string;
  /** "Tue 3 Nov" */
  full: string;
  index: number;
}

const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Today plus the next six days: opened on a Tuesday, the week runs to next Monday. */
export function rollingWeek(now = new Date()): PlanDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const wd = date.getDay();
    return {
      key: dayKey(date),
      date,
      index: i,
      name: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : LONG[wd],
      short: i === 0 ? 'Today' : SHORT[wd],
      full: `${SHORT[wd]} ${date.getDate()} ${MONTHS[date.getMonth()]}`,
    };
  });
}

export function weekRangeLabel(days: PlanDay[]): string {
  return days.length ? `${days[0].full} – ${days[days.length - 1].full}` : '';
}

export async function initMealPlanTable(): Promise<void> {
  await runDb(async (db) => {
    // One row per recipe in a slot, so lunch can hold a main and a side.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_plan_items (
        day TEXT NOT NULL,
        slot TEXT NOT NULL,
        recipeId TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (day, slot, recipeId)
      );
    `);
    // Bring over plans saved by the first version (one recipe per slot), once.
    const old = await db.getFirstAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'meal_plan'");
    if (old) {
      await db.execAsync(
        'INSERT OR IGNORE INTO meal_plan_items (day, slot, recipeId, position) SELECT day, slot, recipeId, 0 FROM meal_plan; DROP TABLE meal_plan;',
      );
    }
    // Keep the table small: forget plans more than a month old.
    await db.runAsync('DELETE FROM meal_plan_items WHERE day < ?', dayKey(new Date(Date.now() - 31 * 86400000)));
  });
}

/** Every planned recipe between two days, in the order they were added to each slot. */
export async function listPlan(fromDay: string, toDay: string): Promise<PlannedMeal[]> {
  return runDb((db) =>
    db.getAllAsync<PlannedMeal>(
      'SELECT day, slot, recipeId FROM meal_plan_items WHERE day >= ? AND day <= ? ORDER BY day, slot, position',
      fromDay,
      toDay,
    ),
  );
}

export async function addPlanned(day: string, slot: MealSlot, recipeId: string): Promise<void> {
  await runDb((db) =>
    db.runAsync(
      `INSERT OR IGNORE INTO meal_plan_items (day, slot, recipeId, position)
       VALUES (?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM meal_plan_items WHERE day = ? AND slot = ?))`,
      day,
      slot,
      recipeId,
      day,
      slot,
    ),
  );
}

export async function removePlanned(day: string, slot: MealSlot, recipeId: string): Promise<void> {
  await runDb((db) => db.runAsync('DELETE FROM meal_plan_items WHERE day = ? AND slot = ? AND recipeId = ?', day, slot, recipeId));
}

/** Group rows into `day|slot` → recipe ids. */
export function groupPlan(rows: PlannedMeal[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const r of rows) (out[`${r.day}|${r.slot}`] ??= []).push(r.recipeId);
  return out;
}
