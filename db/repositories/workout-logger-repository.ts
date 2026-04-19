import type { SQLiteDatabase } from 'expo-sqlite';

type WorkoutLoggerExerciseSetInput = {
  note: string | null;
  repsText: string;
  setType: string;
  weightText: string;
};

type WorkoutLoggerExerciseInput = {
  exerciseName: string;
  notes: string | null;
  orderIndex: number;
  sets: WorkoutLoggerExerciseSetInput[];
  templateExerciseId: string;
};

export type CompleteWorkoutInput = {
  completedAt: string;
  exercises: WorkoutLoggerExerciseInput[];
  startedAt: string;
  status: 'completed';
  templateId: string;
  templateName: string;
};

export type CompleteWorkoutResult = {
  exerciseLogCount: number;
  exerciseSetCount: number;
  summary: string;
  workoutLogId: string;
};

function createEntityId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function formatSetTypeLabel(setType: string): string {
  switch (setType) {
    case 'warmup':
      return 'Warmup';
    case 'drop':
      return 'Drop';
    case 'burnout':
      return 'Burnout';
    default:
      return 'Working';
  }
}

function buildWorkoutSummary(templateName: string, exercises: WorkoutLoggerExerciseInput[]): string {
  const lines = [templateName];

  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      const setLabel = set.setType === 'working' ? '' : ` (${formatSetTypeLabel(set.setType)})`;
      lines.push(
        `${exercise.exerciseName}${setLabel}: ${set.weightText} x ${set.repsText}`
      );
    }
  }

  return lines.join('\n');
}

export class WorkoutLoggerRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  getClient(): SQLiteDatabase {
    return this.database;
  }

  async completeWorkout(input: CompleteWorkoutInput): Promise<CompleteWorkoutResult> {
    const workoutLogId = createEntityId('workout-log');
    const summary = buildWorkoutSummary(input.templateName, input.exercises);
    let exerciseLogCount = 0;
    let exerciseSetCount = 0;

    await this.database.withTransactionAsync(async () => {
      await this.database.runAsync(
        `INSERT INTO workout_logs (id, template_id, started_at, completed_at, status, summary)
         VALUES (?, ?, ?, ?, ?, ?);`,
        workoutLogId,
        input.templateId,
        input.startedAt,
        input.completedAt,
        input.status,
        summary
      );

      for (const exercise of input.exercises) {
        const exerciseLogId = createEntityId('exercise-log');

        await this.database.runAsync(
          `INSERT INTO exercise_logs (
             id,
             workout_log_id,
             template_exercise_id,
             exercise_name_snapshot,
             order_index,
             notes,
             carry_forward,
             carry_forward_note
           )
           VALUES (?, ?, ?, ?, ?, ?, 0, NULL);`,
          exerciseLogId,
          workoutLogId,
          exercise.templateExerciseId,
          exercise.exerciseName,
          exercise.orderIndex,
          normalizeOptionalText(exercise.notes)
        );

        exerciseLogCount += 1;

        for (const [index, set] of exercise.sets.entries()) {
          await this.database.runAsync(
            `INSERT INTO exercise_sets (
               id,
               exercise_log_id,
               set_index,
               set_type,
               weight_text,
               reps_text,
               side,
               note
             )
             VALUES (?, ?, ?, ?, ?, ?, NULL, ?);`,
            createEntityId('exercise-set'),
            exerciseLogId,
            index + 1,
            set.setType,
            set.weightText,
            set.repsText,
            normalizeOptionalText(set.note)
          );

          exerciseSetCount += 1;
        }
      }
    });

    return {
      workoutLogId,
      summary,
      exerciseLogCount,
      exerciseSetCount,
    };
  }
}
