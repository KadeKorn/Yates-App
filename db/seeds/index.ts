import type { SQLiteDatabase } from 'expo-sqlite';

import {
  planCTemplateExerciseSeeds,
  planCTemplateSeeds,
  type SeedTemplateExerciseRecord,
  type SeedTemplateRecord,
} from '@/db/seeds/plan-c';

function toSqliteBoolean(value: boolean): number {
  return value ? 1 : 0;
}

async function upsertSeedTemplate(
  database: SQLiteDatabase,
  template: SeedTemplateRecord
): Promise<void> {
  await database.runAsync(
    `INSERT INTO workout_templates (id, code, name, order_index, is_active)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       code = excluded.code,
       name = excluded.name,
       order_index = excluded.order_index,
       is_active = excluded.is_active;`,
    template.id,
    template.code,
    template.name,
    template.orderIndex,
    toSqliteBoolean(template.isActive)
  );
}

async function upsertSeedTemplateExercise(
  database: SQLiteDatabase,
  exercise: SeedTemplateExerciseRecord
): Promise<void> {
  await database.runAsync(
    `INSERT INTO workout_template_exercises (id, template_id, name, order_index, is_active)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       template_id = excluded.template_id,
       name = excluded.name,
       order_index = excluded.order_index,
       is_active = excluded.is_active;`,
    exercise.id,
    exercise.templateId,
    exercise.name,
    exercise.orderIndex,
    toSqliteBoolean(exercise.isActive)
  );
}

export async function runSeeds(database: SQLiteDatabase): Promise<void> {
  await database.withTransactionAsync(async () => {
    for (const template of planCTemplateSeeds) {
      await upsertSeedTemplate(database, template);
    }

    for (const exercise of planCTemplateExerciseSeeds) {
      await upsertSeedTemplateExercise(database, exercise);
    }
  });
}
