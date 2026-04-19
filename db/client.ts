import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_NAME = 'hit-log.db';

let databasePromise: Promise<SQLiteDatabase> | null = null;

type JournalModeRow = {
  journal_mode: string;
};

export async function openDatabaseClient(): Promise<SQLiteDatabase> {
  return openDatabaseAsync(DATABASE_NAME);
}

export async function configureDatabaseClient(database: SQLiteDatabase): Promise<void> {
  await database.execAsync('PRAGMA foreign_keys = ON;');

  try {
    await database.getFirstAsync<JournalModeRow>('PRAGMA journal_mode = WAL;');
  } catch {
    // Some platforms may not support switching journal mode. Startup should continue.
  }
}

export async function getDatabaseClient(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const database = await openDatabaseClient();
      await configureDatabaseClient(database);
      return database;
    })().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}
