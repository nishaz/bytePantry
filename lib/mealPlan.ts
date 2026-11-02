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
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_plan (
        day TEXT NOT NULL,
        slot TEXT NOT NULL,
        recipeId TEXT NOT NULL,
        PRIMARY KEY (day, slot)
      );
    `);
    // Keep the table small: forget plans more than a month old.
    await db.runAsync('DELETE FROM meal_plan WHERE day < ?', dayKey(new Date(Date.now() - 31 * 86400000)));
  });
}

export async function listPlan(fromDay: string, toDay: string): Promise<PlannedMeal[]> {
  return runDb((db) =>
    db.getAllAsync<PlannedMeal>('SELECT day, slot, recipeId FROM meal_plan WHERE day >= ? AND day <= ?', fromDay, toDay),
  );
}

export async function setPlanned(day: string, slot: MealSlot, recipeId: string): Promise<void> {
  await runDb((db) =>
    db.runAsync('INSERT OR REPLACE INTO meal_plan (day, slot, recipeId) VALUES (?, ?, ?)', day, slot, recipeId),
  );
}

export async function clearPlanned(day: string, slot: MealSlot): Promise<void> {
  await runDb((db) => db.runAsync('DELETE FROM meal_plan WHERE day = ? AND slot = ?', day, slot));
}
