import type { SQLiteDatabase } from 'expo-sqlite';

export class WorkoutLogRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  getClient(): SQLiteDatabase {
    return this.database;
  }
}
