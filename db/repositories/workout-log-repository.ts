import type { SQLiteDatabase } from 'expo-sqlite';

export type CompletedWorkoutSummary = {
  completedAt: string;
  startedAt: string | null;
  status: 'completed';
  summary: string | null;
  templateCode: string;
  templateId: string;
  templateName: string;
  templateOrderIndex: number;
  workoutLogId: string;
};

export type TemplateLatestCompletedWorkout = {
  latestCompletedWorkout: CompletedWorkoutSummary | null;
  templateCode: string;
  templateId: string;
  templateName: string;
  templateOrderIndex: number;
};

type LatestCompletedWorkoutRow = {
  completed_at: string;
  started_at: string | null;
  summary: string | null;
  template_code: string;
  template_id: string;
  template_name: string;
  template_order_index: number;
  workout_log_id: string;
};

type TemplateLatestCompletedWorkoutRow = {
  completed_at: string | null;
  started_at: string | null;
  summary: string | null;
  template_code: string;
  template_id: string;
  template_name: string;
  template_order_index: number;
  workout_log_id: string | null;
};

export class WorkoutLogRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  getClient(): SQLiteDatabase {
    return this.database;
  }

  async getLatestCompletedWorkoutOverall(): Promise<CompletedWorkoutSummary | null> {
    const row = await this.database.getFirstAsync<LatestCompletedWorkoutRow>(
      `SELECT
         wl.id AS workout_log_id,
         wl.started_at,
         wl.completed_at,
         wl.summary,
         wt.id AS template_id,
         wt.code AS template_code,
         wt.name AS template_name,
         wt.order_index AS template_order_index
       FROM workout_logs wl
       INNER JOIN workout_templates wt ON wt.id = wl.template_id
       WHERE wl.status = 'completed'
         AND wl.completed_at IS NOT NULL
       ORDER BY wl.completed_at DESC, wl.id DESC
       LIMIT 1;`
    );

    return row ? this.mapCompletedWorkoutSummary(row) : null;
  }

  async getLatestCompletedWorkoutsPerTemplate(): Promise<TemplateLatestCompletedWorkout[]> {
    const rows = await this.database.getAllAsync<TemplateLatestCompletedWorkoutRow>(
      `SELECT
         wt.id AS template_id,
         wt.code AS template_code,
         wt.name AS template_name,
         wt.order_index AS template_order_index,
         wl.id AS workout_log_id,
         wl.started_at,
         wl.completed_at,
         wl.summary
       FROM workout_templates wt
       LEFT JOIN workout_logs wl
         ON wl.id = (
           SELECT candidate.id
           FROM workout_logs candidate
           WHERE candidate.template_id = wt.id
             AND candidate.status = 'completed'
             AND candidate.completed_at IS NOT NULL
           ORDER BY candidate.completed_at DESC, candidate.id DESC
           LIMIT 1
         )
       WHERE wt.is_active = 1
       ORDER BY wt.order_index ASC, wt.id ASC;`
    );

    return rows.map((row) => ({
      templateId: row.template_id,
      templateCode: row.template_code,
      templateName: row.template_name,
      templateOrderIndex: row.template_order_index,
      latestCompletedWorkout: row.workout_log_id
        ? this.mapCompletedWorkoutSummary({
            workout_log_id: row.workout_log_id,
            started_at: row.started_at,
            completed_at: row.completed_at as string,
            summary: row.summary,
            template_id: row.template_id,
            template_code: row.template_code,
            template_name: row.template_name,
            template_order_index: row.template_order_index,
          })
        : null,
    }));
  }

  private mapCompletedWorkoutSummary(row: LatestCompletedWorkoutRow): CompletedWorkoutSummary {
    return {
      workoutLogId: row.workout_log_id,
      templateId: row.template_id,
      templateCode: row.template_code,
      templateName: row.template_name,
      templateOrderIndex: row.template_order_index,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      status: 'completed',
      summary: row.summary,
    };
  }
}
