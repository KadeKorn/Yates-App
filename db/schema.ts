export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS workout_templates (
    id TEXT PRIMARY KEY NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
  );`,
  `CREATE TABLE IF NOT EXISTS workout_template_exercises (
    id TEXT PRIMARY KEY NOT NULL,
    template_id TEXT NOT NULL,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE RESTRICT
  );`,
  `CREATE TABLE IF NOT EXISTS workout_logs (
    id TEXT PRIMARY KEY NOT NULL,
    template_id TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT,
    status TEXT NOT NULL,
    summary TEXT,
    FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE RESTRICT
  );`,
  `CREATE TABLE IF NOT EXISTS exercise_logs (
    id TEXT PRIMARY KEY NOT NULL,
    workout_log_id TEXT NOT NULL,
    template_exercise_id TEXT NOT NULL,
    exercise_name_snapshot TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    notes TEXT,
    carry_forward INTEGER NOT NULL DEFAULT 0,
    carry_forward_note TEXT,
    FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (template_exercise_id) REFERENCES workout_template_exercises(id) ON DELETE RESTRICT
  );`,
  `CREATE TABLE IF NOT EXISTS exercise_sets (
    id TEXT PRIMARY KEY NOT NULL,
    exercise_log_id TEXT NOT NULL,
    set_index INTEGER NOT NULL,
    set_type TEXT NOT NULL DEFAULT 'working',
    weight_text TEXT NOT NULL,
    reps_text TEXT NOT NULL,
    side TEXT,
    note TEXT,
    FOREIGN KEY (exercise_log_id) REFERENCES exercise_logs(id) ON DELETE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS idx_workout_templates_order_index
    ON workout_templates(order_index);`,
  `CREATE INDEX IF NOT EXISTS idx_workout_template_exercises_template_order_index
    ON workout_template_exercises(template_id, order_index);`,
  `CREATE INDEX IF NOT EXISTS idx_workout_logs_template_completed_at
    ON workout_logs(template_id, completed_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout_log
    ON exercise_logs(workout_log_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exercise_logs_template_exercise
    ON exercise_logs(template_exercise_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout_order_index
    ON exercise_logs(workout_log_id, order_index);`,
  `CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise_log_set_index
    ON exercise_sets(exercise_log_id, set_index);`,
] as const;
