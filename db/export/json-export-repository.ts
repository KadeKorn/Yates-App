import type { SQLiteDatabase } from 'expo-sqlite';

export type ExportWorkoutTemplateRow = {
  code: string;
  id: string;
  is_active: number;
  name: string;
  order_index: number;
};

export type ExportWorkoutTemplateExerciseRow = {
  id: string;
  is_active: number;
  name: string;
  order_index: number;
  template_id: string;
};

export type ExportWorkoutLogRow = {
  completed_at: string | null;
  id: string;
  started_at: string | null;
  status: string;
  summary: string | null;
  template_id: string;
};

export type ExportExerciseLogRow = {
  carry_forward: number;
  carry_forward_note: string | null;
  exercise_name_snapshot: string;
  id: string;
  notes: string | null;
  order_index: number;
  template_exercise_id: string;
  workout_log_id: string;
};

export type ExportExerciseSetRow = {
  exercise_log_id: string;
  id: string;
  note: string | null;
  reps_text: string;
  set_index: number;
  set_type: string;
  side: string | null;
  weight_text: string;
};

export type WorkoutJsonExportData = {
  exerciseLogs: ExportExerciseLogRow[];
  exerciseSets: ExportExerciseSetRow[];
  workoutLogs: ExportWorkoutLogRow[];
  workoutTemplateExercises: ExportWorkoutTemplateExerciseRow[];
  workoutTemplates: ExportWorkoutTemplateRow[];
};

export class JsonExportRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async getWorkoutJsonExportData(): Promise<WorkoutJsonExportData> {
    const [
      workoutTemplates,
      workoutTemplateExercises,
      workoutLogs,
      exerciseLogs,
      exerciseSets,
    ] = await Promise.all([
      this.getWorkoutTemplates(),
      this.getWorkoutTemplateExercises(),
      this.getWorkoutLogs(),
      this.getExerciseLogs(),
      this.getExerciseSets(),
    ]);

    return {
      workoutTemplates,
      workoutTemplateExercises,
      workoutLogs,
      exerciseLogs,
      exerciseSets,
    };
  }

  private async getWorkoutTemplates(): Promise<ExportWorkoutTemplateRow[]> {
    return this.database.getAllAsync<ExportWorkoutTemplateRow>(
      `SELECT
         id,
         code,
         name,
         order_index,
         is_active
       FROM workout_templates
       ORDER BY order_index ASC, id ASC;`
    );
  }

  private async getWorkoutTemplateExercises(): Promise<ExportWorkoutTemplateExerciseRow[]> {
    return this.database.getAllAsync<ExportWorkoutTemplateExerciseRow>(
      `SELECT
         id,
         template_id,
         name,
         order_index,
         is_active
       FROM workout_template_exercises
       ORDER BY template_id ASC, order_index ASC, id ASC;`
    );
  }

  private async getWorkoutLogs(): Promise<ExportWorkoutLogRow[]> {
    return this.database.getAllAsync<ExportWorkoutLogRow>(
      `SELECT
         id,
         template_id,
         started_at,
         completed_at,
         status,
         summary
       FROM workout_logs
       ORDER BY started_at ASC, completed_at ASC, id ASC;`
    );
  }

  private async getExerciseLogs(): Promise<ExportExerciseLogRow[]> {
    return this.database.getAllAsync<ExportExerciseLogRow>(
      `SELECT
         id,
         workout_log_id,
         template_exercise_id,
         exercise_name_snapshot,
         order_index,
         notes,
         carry_forward,
         carry_forward_note
       FROM exercise_logs
       ORDER BY workout_log_id ASC, order_index ASC, id ASC;`
    );
  }

  private async getExerciseSets(): Promise<ExportExerciseSetRow[]> {
    return this.database.getAllAsync<ExportExerciseSetRow>(
      `SELECT
         id,
         exercise_log_id,
         set_index,
         set_type,
         weight_text,
         reps_text,
         side,
         note
       FROM exercise_sets
       ORDER BY exercise_log_id ASC, set_index ASC, id ASC;`
    );
  }
}
