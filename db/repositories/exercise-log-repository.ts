import type { SQLiteDatabase } from 'expo-sqlite';

export type ExerciseHistorySet = {
  id: string;
  note: string | null;
  repsText: string;
  setIndex: number;
  setType: string;
  side: string | null;
  weightText: string;
};

export type ExerciseHistoryEntry = {
  carryForward: boolean;
  carryForwardNote: string | null;
  completedAt: string;
  exerciseLogId: string;
  exerciseNameSnapshot: string;
  notes: string | null;
  orderIndex: number;
  sets: ExerciseHistorySet[];
  startedAt: string | null;
  templateCode: string;
  templateExerciseId: string;
  templateId: string;
  templateName: string;
  workoutLogId: string;
};

export type LatestExercisePerformance = {
  completedAt: string;
  exerciseLogId: string;
  exerciseNameSnapshot: string;
  notes: string | null;
  sets: ExerciseHistorySet[];
  templateExerciseId: string;
  workoutLogId: string;
};

export type LatestWorkingSet = {
  completedAt: string;
  exerciseLogId: string;
  repsText: string;
  setId: string;
  setIndex: number;
  templateExerciseId: string;
  weightText: string;
  workoutLogId: string;
};

type ExerciseHistoryRow = {
  carry_forward: number;
  carry_forward_note: string | null;
  completed_at: string;
  exercise_log_id: string;
  exercise_name_snapshot: string;
  exercise_note: string | null;
  exercise_order_index: number;
  reps_text: string | null;
  set_id: string | null;
  set_index: number | null;
  set_note: string | null;
  set_side: string | null;
  set_type: string | null;
  started_at: string | null;
  template_code: string;
  template_exercise_id: string;
  template_id: string;
  template_name: string;
  weight_text: string | null;
  workout_log_id: string;
};

type LatestExercisePerformanceRow = {
  completed_at: string;
  exercise_log_id: string;
  exercise_name_snapshot: string;
  exercise_note: string | null;
  reps_text: string | null;
  set_id: string | null;
  set_index: number | null;
  set_note: string | null;
  set_side: string | null;
  set_type: string | null;
  template_exercise_id: string;
  weight_text: string | null;
  workout_log_id: string;
};

type LatestWorkingSetRow = {
  completed_at: string;
  exercise_log_id: string;
  reps_text: string;
  set_id: string;
  set_index: number;
  template_exercise_id: string;
  weight_text: string;
  workout_log_id: string;
};

export class ExerciseLogRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  getClient(): SQLiteDatabase {
    return this.database;
  }

  async getExerciseHistoryByTemplateExerciseId(
    templateExerciseId: string
  ): Promise<ExerciseHistoryEntry[]> {
    const rows = await this.database.getAllAsync<ExerciseHistoryRow>(
      `SELECT
         el.id AS exercise_log_id,
         el.template_exercise_id,
         el.exercise_name_snapshot,
         el.order_index AS exercise_order_index,
         el.notes AS exercise_note,
         el.carry_forward,
         el.carry_forward_note,
         wl.id AS workout_log_id,
         wl.started_at,
         wl.completed_at,
         wt.id AS template_id,
         wt.code AS template_code,
         wt.name AS template_name,
         es.id AS set_id,
         es.set_index,
         es.set_type,
         es.weight_text,
         es.reps_text,
         es.side AS set_side,
         es.note AS set_note
       FROM exercise_logs el
       INNER JOIN workout_logs wl ON wl.id = el.workout_log_id
       INNER JOIN workout_templates wt ON wt.id = wl.template_id
       LEFT JOIN exercise_sets es ON es.exercise_log_id = el.id
       WHERE el.template_exercise_id = ?
         AND wl.status = 'completed'
         AND wl.completed_at IS NOT NULL
       ORDER BY wl.completed_at DESC, wl.id DESC, es.set_index ASC, es.id ASC;`,
      templateExerciseId
    );

    const historyByExerciseLogId = new Map<string, ExerciseHistoryEntry>();

    for (const row of rows) {
      const existingEntry = historyByExerciseLogId.get(row.exercise_log_id);

      if (!existingEntry) {
        historyByExerciseLogId.set(row.exercise_log_id, {
          exerciseLogId: row.exercise_log_id,
          workoutLogId: row.workout_log_id,
          templateId: row.template_id,
          templateCode: row.template_code,
          templateName: row.template_name,
          templateExerciseId: row.template_exercise_id,
          exerciseNameSnapshot: row.exercise_name_snapshot,
          orderIndex: row.exercise_order_index,
          notes: row.exercise_note,
          carryForward: row.carry_forward === 1,
          carryForwardNote: row.carry_forward_note,
          startedAt: row.started_at,
          completedAt: row.completed_at,
          sets: [],
        });
      }

      if (row.set_id) {
        historyByExerciseLogId.get(row.exercise_log_id)?.sets.push({
          id: row.set_id,
          setIndex: row.set_index as number,
          setType: row.set_type as string,
          weightText: row.weight_text as string,
          repsText: row.reps_text as string,
          side: row.set_side,
          note: row.set_note,
        });
      }
    }

    return Array.from(historyByExerciseLogId.values());
  }

  async getLatestPerformanceByTemplateExerciseIds(
    templateExerciseIds: string[]
  ): Promise<Record<string, LatestExercisePerformance>> {
    if (templateExerciseIds.length === 0) {
      return {};
    }

    const placeholders = templateExerciseIds.map(() => '?').join(', ');
    const rows = await this.database.getAllAsync<LatestExercisePerformanceRow>(
      `SELECT
         el.template_exercise_id,
         el.id AS exercise_log_id,
         el.exercise_name_snapshot,
         el.notes AS exercise_note,
         wl.id AS workout_log_id,
         wl.completed_at,
         es.id AS set_id,
         es.set_index,
         es.set_type,
         es.weight_text,
         es.reps_text,
         es.side AS set_side,
         es.note AS set_note
       FROM exercise_logs el
       INNER JOIN workout_logs wl ON wl.id = el.workout_log_id
       LEFT JOIN exercise_sets es ON es.exercise_log_id = el.id
       WHERE el.template_exercise_id IN (${placeholders})
         AND wl.status = 'completed'
         AND wl.completed_at IS NOT NULL
         AND NOT EXISTS (
           SELECT 1
           FROM exercise_logs newer
           INNER JOIN workout_logs newer_workout ON newer_workout.id = newer.workout_log_id
           WHERE newer.template_exercise_id = el.template_exercise_id
             AND newer_workout.status = 'completed'
             AND newer_workout.completed_at IS NOT NULL
             AND (
               newer_workout.completed_at > wl.completed_at
               OR (newer_workout.completed_at = wl.completed_at AND newer.id > el.id)
             )
         )
       ORDER BY wl.completed_at DESC, el.id DESC, es.set_index ASC, es.id ASC;`,
      ...templateExerciseIds
    );

    const latestPerformanceByTemplateExerciseId = new Map<string, LatestExercisePerformance>();

    for (const row of rows) {
      const existingPerformance = latestPerformanceByTemplateExerciseId.get(
        row.template_exercise_id
      );

      if (!existingPerformance) {
        latestPerformanceByTemplateExerciseId.set(row.template_exercise_id, {
          templateExerciseId: row.template_exercise_id,
          exerciseLogId: row.exercise_log_id,
          workoutLogId: row.workout_log_id,
          completedAt: row.completed_at,
          exerciseNameSnapshot: row.exercise_name_snapshot,
          notes: row.exercise_note,
          sets: [],
        });
      }

      if (row.set_id) {
        latestPerformanceByTemplateExerciseId.get(row.template_exercise_id)?.sets.push({
          id: row.set_id,
          setIndex: row.set_index as number,
          setType: row.set_type as string,
          weightText: row.weight_text as string,
          repsText: row.reps_text as string,
          side: row.set_side,
          note: row.set_note,
        });
      }
    }

    return Object.fromEntries(latestPerformanceByTemplateExerciseId.entries());
  }

  async getLatestWorkingSetByTemplateExerciseIds(
    templateExerciseIds: string[]
  ): Promise<Record<string, LatestWorkingSet>> {
    if (templateExerciseIds.length === 0) {
      return {};
    }

    const placeholders = templateExerciseIds.map(() => '?').join(', ');
    const rows = await this.database.getAllAsync<LatestWorkingSetRow>(
      `SELECT
         el.template_exercise_id,
         el.id AS exercise_log_id,
         wl.id AS workout_log_id,
         wl.completed_at,
         es.id AS set_id,
         es.set_index,
         es.weight_text,
         es.reps_text
       FROM exercise_logs el
       INNER JOIN workout_logs wl ON wl.id = el.workout_log_id
       INNER JOIN exercise_sets es ON es.exercise_log_id = el.id
       WHERE el.template_exercise_id IN (${placeholders})
         AND wl.status = 'completed'
         AND wl.completed_at IS NOT NULL
         AND es.set_type = 'working'
         AND NOT EXISTS (
           SELECT 1
           FROM exercise_logs newer
           INNER JOIN workout_logs newer_workout ON newer_workout.id = newer.workout_log_id
           INNER JOIN exercise_sets newer_set ON newer_set.exercise_log_id = newer.id
           WHERE newer.template_exercise_id = el.template_exercise_id
             AND newer_workout.status = 'completed'
             AND newer_workout.completed_at IS NOT NULL
             AND newer_set.set_type = 'working'
             AND (
               newer_workout.completed_at > wl.completed_at
               OR (newer_workout.completed_at = wl.completed_at AND newer.id > el.id)
               OR (
                 newer_workout.completed_at = wl.completed_at
                 AND newer.id = el.id
                 AND newer_set.set_index > es.set_index
               )
             )
         )
       ORDER BY wl.completed_at DESC, el.id DESC, es.set_index DESC, es.id DESC;`,
      ...templateExerciseIds
    );

    const latestWorkingSetByTemplateExerciseId = new Map<string, LatestWorkingSet>();

    for (const row of rows) {
      if (latestWorkingSetByTemplateExerciseId.has(row.template_exercise_id)) {
        continue;
      }

      latestWorkingSetByTemplateExerciseId.set(row.template_exercise_id, {
        templateExerciseId: row.template_exercise_id,
        exerciseLogId: row.exercise_log_id,
        workoutLogId: row.workout_log_id,
        completedAt: row.completed_at,
        setId: row.set_id,
        setIndex: row.set_index,
        weightText: row.weight_text,
        repsText: row.reps_text,
      });
    }

    return Object.fromEntries(latestWorkingSetByTemplateExerciseId.entries());
  }
}
