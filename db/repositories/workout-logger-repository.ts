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

export type WorkoutLoggerDraftSet = {
  id: string;
  note: string | null;
  repsText: string;
  setIndex: number;
  setType: string;
  weightText: string;
};

export type WorkoutLoggerDraftExercise = {
  exerciseLogId: string;
  exerciseNameSnapshot: string;
  notes: string | null;
  orderIndex: number;
  sets: WorkoutLoggerDraftSet[];
  templateExerciseId: string;
};

export type WorkoutLoggerDraft = {
  exercises: WorkoutLoggerDraftExercise[];
  startedAt: string | null;
  templateId: string;
  workoutLogId: string;
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

export type SaveWorkoutDraftInput = {
  exercises: WorkoutLoggerExerciseInput[];
  startedAt: string;
  templateId: string;
};

type ActiveDraftWorkoutRow = {
  workout_log_id: string;
};

type WorkoutLoggerDraftRow = {
  exercise_log_id: string | null;
  exercise_name_snapshot: string | null;
  exercise_note: string | null;
  exercise_order_index: number | null;
  reps_text: string | null;
  set_id: string | null;
  set_index: number | null;
  set_note: string | null;
  set_type: string | null;
  started_at: string | null;
  template_exercise_id: string | null;
  weight_text: string | null;
  workout_log_id: string;
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

  async getActiveDraftByTemplateId(templateId: string): Promise<WorkoutLoggerDraft | null> {
    const rows = await this.database.getAllAsync<WorkoutLoggerDraftRow>(
      `SELECT
         wl.id AS workout_log_id,
         wl.started_at,
         el.id AS exercise_log_id,
         el.template_exercise_id,
         el.exercise_name_snapshot,
         el.order_index AS exercise_order_index,
         el.notes AS exercise_note,
         es.id AS set_id,
         es.set_index,
         es.set_type,
         es.weight_text,
         es.reps_text,
         es.note AS set_note
       FROM workout_logs wl
       LEFT JOIN exercise_logs el ON el.workout_log_id = wl.id
       LEFT JOIN exercise_sets es ON es.exercise_log_id = el.id
       WHERE wl.id = (
         SELECT candidate.id
         FROM workout_logs candidate
         WHERE candidate.template_id = ?
           AND candidate.status = 'draft'
           AND candidate.completed_at IS NULL
         ORDER BY candidate.started_at DESC, candidate.id DESC
         LIMIT 1
       )
       ORDER BY el.order_index ASC, el.id ASC, es.set_index ASC, es.id ASC;`,
      templateId
    );

    if (rows.length === 0) {
      return null;
    }

    const firstRow = rows[0];
    await this.deleteOlderDrafts(templateId, firstRow.workout_log_id);

    const exercisesByLogId = new Map<string, WorkoutLoggerDraftExercise>();

    for (const row of rows) {
      if (!row.exercise_log_id || !row.template_exercise_id) {
        continue;
      }

      const existingExercise = exercisesByLogId.get(row.exercise_log_id);

      if (!existingExercise) {
        exercisesByLogId.set(row.exercise_log_id, {
          exerciseLogId: row.exercise_log_id,
          templateExerciseId: row.template_exercise_id,
          exerciseNameSnapshot: row.exercise_name_snapshot ?? '',
          orderIndex: row.exercise_order_index ?? 0,
          notes: row.exercise_note,
          sets: [],
        });
      }

      if (row.set_id) {
        exercisesByLogId.get(row.exercise_log_id)?.sets.push({
          id: row.set_id,
          setIndex: row.set_index ?? 1,
          setType: row.set_type ?? 'working',
          weightText: row.weight_text ?? '',
          repsText: row.reps_text ?? '',
          note: row.set_note,
        });
      }
    }

    return {
      workoutLogId: firstRow.workout_log_id,
      templateId,
      startedAt: firstRow.started_at,
      exercises: Array.from(exercisesByLogId.values()),
    };
  }

  async saveDraft(input: SaveWorkoutDraftInput): Promise<string> {
    let workoutLogId = '';

    await this.database.withTransactionAsync(async () => {
      const activeDraft = await this.getActiveDraftWorkout(input.templateId);

      workoutLogId = activeDraft?.workout_log_id ?? createEntityId('workout-log');

      if (!activeDraft) {
        await this.database.runAsync(
          `INSERT INTO workout_logs (id, template_id, started_at, completed_at, status, summary)
           VALUES (?, ?, ?, NULL, 'draft', NULL);`,
          workoutLogId,
          input.templateId,
          input.startedAt
        );
      } else {
        await this.database.runAsync(
          `UPDATE workout_logs
           SET started_at = COALESCE(started_at, ?),
               completed_at = NULL,
               status = 'draft',
               summary = NULL
           WHERE id = ?;`,
          input.startedAt,
          workoutLogId
        );
      }

      await this.deleteWorkoutChildren(workoutLogId);
      await this.insertWorkoutChildren(workoutLogId, input.exercises);
      await this.deleteOlderDrafts(input.templateId, workoutLogId);
    });

    return workoutLogId;
  }

  async deleteActiveDraftByTemplateId(templateId: string): Promise<void> {
    await this.database.withTransactionAsync(async () => {
      await this.database.runAsync(
        `DELETE FROM exercise_sets
         WHERE exercise_log_id IN (
           SELECT el.id
           FROM exercise_logs el
           INNER JOIN workout_logs wl ON wl.id = el.workout_log_id
           WHERE wl.template_id = ?
             AND wl.status = 'draft'
             AND wl.completed_at IS NULL
         );`,
        templateId
      );

      await this.database.runAsync(
        `DELETE FROM exercise_logs
         WHERE workout_log_id IN (
           SELECT id
           FROM workout_logs
           WHERE template_id = ?
             AND status = 'draft'
             AND completed_at IS NULL
         );`,
        templateId
      );

      await this.database.runAsync(
        `DELETE FROM workout_logs
         WHERE template_id = ?
           AND status = 'draft'
           AND completed_at IS NULL;`,
        templateId
      );
    });
  }

  async completeWorkout(input: CompleteWorkoutInput): Promise<CompleteWorkoutResult> {
    let workoutLogId = '';
    const summary = buildWorkoutSummary(input.templateName, input.exercises);
    let exerciseLogCount = 0;
    let exerciseSetCount = 0;

    await this.database.withTransactionAsync(async () => {
      const activeDraft = await this.getActiveDraftWorkout(input.templateId);
      workoutLogId = activeDraft?.workout_log_id ?? createEntityId('workout-log');

      if (activeDraft) {
        await this.database.runAsync(
          `UPDATE workout_logs
           SET started_at = COALESCE(started_at, ?),
               completed_at = ?,
               status = ?,
               summary = ?
           WHERE id = ?;`,
          input.startedAt,
          input.completedAt,
          input.status,
          summary,
          workoutLogId,
        );
        await this.deleteWorkoutChildren(workoutLogId);
      } else {
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
      }

      const insertedCounts = await this.insertWorkoutChildren(workoutLogId, input.exercises);
      exerciseLogCount = insertedCounts.exerciseLogCount;
      exerciseSetCount = insertedCounts.exerciseSetCount;

      await this.deleteOlderDrafts(input.templateId, workoutLogId);
    });

    return {
      workoutLogId,
      summary,
      exerciseLogCount,
      exerciseSetCount,
    };
  }

  private async getActiveDraftWorkout(templateId: string): Promise<ActiveDraftWorkoutRow | null> {
    return this.database.getFirstAsync<ActiveDraftWorkoutRow>(
      `SELECT id AS workout_log_id
       FROM workout_logs
       WHERE template_id = ?
         AND status = 'draft'
         AND completed_at IS NULL
       ORDER BY started_at DESC, id DESC
       LIMIT 1;`,
      templateId
    );
  }

  private async deleteWorkoutChildren(workoutLogId: string): Promise<void> {
    await this.database.runAsync(
      `DELETE FROM exercise_sets
       WHERE exercise_log_id IN (
         SELECT id
         FROM exercise_logs
         WHERE workout_log_id = ?
       );`,
      workoutLogId
    );

    await this.database.runAsync(
      `DELETE FROM exercise_logs
       WHERE workout_log_id = ?;`,
      workoutLogId
    );
  }

  private async deleteOlderDrafts(templateId: string, keepWorkoutLogId: string): Promise<void> {
    await this.database.runAsync(
      `DELETE FROM exercise_sets
       WHERE exercise_log_id IN (
         SELECT el.id
         FROM exercise_logs el
         INNER JOIN workout_logs wl ON wl.id = el.workout_log_id
         WHERE wl.template_id = ?
           AND wl.status = 'draft'
           AND wl.completed_at IS NULL
           AND wl.id <> ?
       );`,
      templateId,
      keepWorkoutLogId
    );

    await this.database.runAsync(
      `DELETE FROM exercise_logs
       WHERE workout_log_id IN (
         SELECT id
         FROM workout_logs
         WHERE template_id = ?
           AND status = 'draft'
           AND completed_at IS NULL
           AND id <> ?
       );`,
      templateId,
      keepWorkoutLogId
    );

    await this.database.runAsync(
      `DELETE FROM workout_logs
       WHERE template_id = ?
         AND status = 'draft'
         AND completed_at IS NULL
         AND id <> ?;`,
      templateId,
      keepWorkoutLogId
    );
  }

  private async insertWorkoutChildren(
    workoutLogId: string,
    exercises: WorkoutLoggerExerciseInput[]
  ): Promise<{ exerciseLogCount: number; exerciseSetCount: number }> {
    let exerciseLogCount = 0;
    let exerciseSetCount = 0;

    for (const exercise of exercises) {
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

    return { exerciseLogCount, exerciseSetCount };
  }
}
