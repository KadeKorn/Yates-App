import type { SQLiteDatabase } from 'expo-sqlite';

export class ExerciseLogRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  getClient(): SQLiteDatabase {
    return this.database;
  }
}
