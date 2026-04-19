import type { SQLiteDatabase } from 'expo-sqlite';

import { schemaStatements } from '@/db/schema';

export const SCHEMA_VERSION = 1;

type UserVersionRow = {
  user_version: number;
};

async function getUserVersion(database: SQLiteDatabase): Promise<number> {
  const result = await database.getFirstAsync<UserVersionRow>('PRAGMA user_version;');

  return result?.user_version ?? 0;
}

async function setUserVersion(database: SQLiteDatabase, version: number): Promise<void> {
  await database.execAsync(`PRAGMA user_version = ${version};`);
}

async function migrateToVersion1(database: SQLiteDatabase): Promise<void> {
  for (const statement of schemaStatements) {
    await database.execAsync(statement);
  }
}

export async function runMigrations(database: SQLiteDatabase): Promise<number> {
  let migratedVersion = SCHEMA_VERSION;

  await database.withTransactionAsync(async () => {
    const currentVersion = await getUserVersion(database);

    if (currentVersion >= SCHEMA_VERSION) {
      migratedVersion = currentVersion;
      return;
    }

    if (currentVersion < 1) {
      await migrateToVersion1(database);
    }

    await setUserVersion(database, SCHEMA_VERSION);
  });

  return migratedVersion;
}
