import type { SQLiteDatabase } from 'expo-sqlite';

export class TemplateRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  getClient(): SQLiteDatabase {
    return this.database;
  }
}
