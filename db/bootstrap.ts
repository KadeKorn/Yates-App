import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabaseClient } from '@/db/client';
import { runMigrations } from '@/db/migrations';

let bootstrapPromise: Promise<SQLiteDatabase> | null = null;

export async function bootstrapDatabase(): Promise<SQLiteDatabase> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const database = await getDatabaseClient();
      await runMigrations(database);
      return database;
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}
