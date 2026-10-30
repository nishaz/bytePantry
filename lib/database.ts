import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DB_NAME = 'pixel-pantry.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let opening: Promise<SQLite.SQLiteDatabase> | null = null;

/** Web OPFS allows only one sync access handle per file — queue async work. */
let webQueue: Promise<unknown> = Promise.resolve();

function withWebLock<T>(task: () => Promise<T>): Promise<T> {
  if (Platform.OS !== 'web') {
    return task();
  }
  const run = webQueue.then(task, task);
  webQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  if (!opening) {
    opening = SQLite.openDatabaseAsync(DB_NAME)
      .then((db) => {
        dbInstance = db;
        return db;
      })
      .catch((error) => {
        opening = null;
        throw error;
      });
  }
  return opening;
}

/** Run DB work serialized on web (avoids OPFS Access Handle conflicts). */
export async function runDb<T>(fn: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  return withWebLock(async () => fn(await getDb()));
}
