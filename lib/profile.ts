import { runDb } from './database';

export interface Profile {
  xp: number;
  streak: number;
  lastCookDay: string | null;
  recipesCooked: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  /** XP earned inside the current level. */
  into: number;
  /** XP needed to finish the current level. */
  span: number;
}

const TITLES = ['Kitchen Newbie', 'Prep Cook', 'Home Cook', 'Line Cook', 'Sous Chef', 'Head Chef', 'Kitchen Legend'];

/** Each level needs 100 XP more than the last: 100, 200, 300… */
export function levelFor(xp: number): LevelInfo {
  let level = 1;
  let floor = 0;
  let span = 100;
  while (xp >= floor + span) {
    floor += span;
    level += 1;
    span = level * 100;
  }
  return { level, title: TITLES[Math.min(level - 1, TITLES.length - 1)], into: xp - floor, span };
}

export const XP_PER_STEP = 15;
export const XP_RECIPE_BONUS = 40;

function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime();
  return Math.round(ms / 86400000);
}

export async function initProfileTable(): Promise<void> {
  await runDb(async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY NOT NULL,
        xp INTEGER NOT NULL DEFAULT 0,
        streak INTEGER NOT NULL DEFAULT 0,
        lastCookDay TEXT,
        recipesCooked INTEGER NOT NULL DEFAULT 0
      );
      INSERT OR IGNORE INTO profile (id, xp, streak, lastCookDay, recipesCooked) VALUES (1, 0, 0, NULL, 0);
    `);
  });
}

export async function getProfile(): Promise<Profile> {
  const row = await runDb((db) =>
    db.getFirstAsync<Profile>('SELECT xp, streak, lastCookDay, recipesCooked FROM profile WHERE id = 1'),
  );
  const profile = row ?? { xp: 0, streak: 0, lastCookDay: null, recipesCooked: 0 };
  // A streak only survives if you cooked today or yesterday.
  if (profile.lastCookDay && daysBetween(profile.lastCookDay, dayKey()) > 1) {
    return { ...profile, streak: 0 };
  }
  return profile;
}

/** Add XP; the first cook of a new day extends (or restarts) the streak. */
export async function awardXp(amount: number, finishedRecipe = false): Promise<Profile> {
  const current = await getProfile();
  const today = dayKey();
  let streak = current.streak;
  if (current.lastCookDay !== today) {
    const gap = current.lastCookDay ? daysBetween(current.lastCookDay, today) : Infinity;
    streak = gap === 1 ? streak + 1 : 1;
  }
  const next: Profile = {
    xp: current.xp + amount,
    streak,
    lastCookDay: today,
    recipesCooked: current.recipesCooked + (finishedRecipe ? 1 : 0),
  };
  await runDb((db) =>
    db.runAsync(
      'UPDATE profile SET xp = ?, streak = ?, lastCookDay = ?, recipesCooked = ? WHERE id = 1',
      next.xp,
      next.streak,
      next.lastCookDay,
      next.recipesCooked,
    ),
  );
  return next;
}
