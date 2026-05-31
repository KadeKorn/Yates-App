# ARCHITECTURE

## Architecture summary

Use a thin screen layer, reusable presentational components, a repository layer for all database access, and small domain services for queueing, summaries, and comparisons.

## Guiding decisions

| Decision | Recommendation |
|---|---|
| Router | Expo Router |
| Language | TypeScript, strict mode |
| Persistence | expo-sqlite |
| Data access | Repository pattern only |
| Primary ID strategy | TEXT UUIDs |
| Timestamp format | ISO 8601 strings |
| UI state | Local component state + hooks |
| Sync | None in MVP |
| Web | Not targeted in MVP |

## Architecture diagram

```mermaid
flowchart TD
    U[User] --> R[Expo Router screens]
    R --> C[UI components]
    R --> H[Hooks]
    H --> Q[Queue service]
    H --> S[Summary formatter]
    H --> P[Progress comparison service]
    H --> Repo[Repository layer]
    Repo --> DBClient[SQLite client]
    DBClient --> DB[(SQLite database)]
    DB --> T1[workout_templates]
    DB --> T2[workout_template_exercises]
    DB --> T3[workout_logs]
    DB --> T4[exercise_logs]
    DB --> T5[exercise_sets]

## Workout save data flow

```mermaid
sequenceDiagram
    participant User
    participant Screen as Workout Logger
    participant Repo as Workout Repository
    participant DB as SQLite Transaction
    participant Home as Home Screen

    User->>Screen: Enter sets, notes, carry-forward flags
    User->>Screen: Tap Complete Workout
    Screen->>Repo: saveCompletedWorkout(draft)
    Repo->>DB: begin exclusive transaction
    DB->>DB: insert workout_log
    DB->>DB: insert exercise_logs
    DB->>DB: insert exercise_sets
    DB->>DB: generate and save summary
    DB->>DB: commit
    Repo-->>Screen: success
    Screen-->>Home: refresh latest logs and next-up card
```

## Folder structure

app/
  _layout.tsx
  index.tsx
  workout/
    [templateCode].tsx
  exercise/
    [templateExerciseId].tsx
  templates/
    index.tsx
    [templateCode].tsx

components/
  WorkoutDayCard.tsx
  NextUpCard.tsx
  LatestLogCard.tsx
  ExerciseLogRow.tsx
  SetRow.tsx
  SetTypeChip.tsx
  HistoryCard.tsx
  NoteField.tsx
  TemplateExerciseRow.tsx

constants/
  theme.ts
  tokens.ts

db/
  client.ts
  migrate.ts
  schema.ts
  repositories/
    templates.ts
    workoutLogs.ts
    latestLogs.ts
    history.ts
    queue.ts

hooks/
  useBootstrap.ts
  useLatestLogs.ts
  useQueue.ts
  useWorkoutDraft.ts

lib/
  ids.ts
  summary.ts
  comparison.ts
  exerciseDisplay.ts

data/
  planCSeed.ts

types/
  domain.ts
  db.ts

scripts/
  validate-db.ts
  validate-seed.ts
  validate-queue.ts
  validate-summary.ts

## Component list

| Component | Role |
|---|---|
| WorkoutDayCard | Quick-start card for a workout day |
| NextUpCard | Home card showing queue recommendation |
| LatestLogCard | Shows latest completed log for one day |
| ExerciseLogRow | Main logger row for one exercise |
| SetRow | One editable set row |
| SetTypeChip | Working/drop/burnout selector |
| HistoryCard | History entry with comparison marker |
| NoteField | Reusable notes input |
| TemplateExerciseRow | Template editor row with reorder controls |

## Database schema

| Table | Key columns | Notes |
|---|---|---|
| workout_templates | id, code, name, order_index, is_active | One row per workout day |
| workout_template_exercises | id, template_id, name, order_index, is_active | Stable exercise slots inside a template |
| workout_logs | id, template_id, started_at, completed_at, status, summary | Parent workout session row |
| exercise_logs | id, workout_log_id, template_exercise_id, exercise_name_snapshot, order_index, notes, carry_forward, carry_forward_note | One row per exercise in a workout |
| exercise_sets | id, exercise_log_id, set_index, set_type, weight_text, reps_text, side, note | One row per logged set |

## Schema sketch

```sql
CREATE TABLE IF NOT EXISTS workout_templates (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS workout_template_exercises (
  id TEXT PRIMARY KEY NOT NULL,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workout_logs (
  id TEXT PRIMARY KEY NOT NULL,
  template_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,
  summary TEXT,
  FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id TEXT PRIMARY KEY NOT NULL,
  workout_log_id TEXT NOT NULL,
  template_exercise_id TEXT,
  exercise_name_snapshot TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  notes TEXT,
  carry_forward INTEGER NOT NULL DEFAULT 0,
  carry_forward_note TEXT,
  FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE,
  FOREIGN KEY (template_exercise_id) REFERENCES workout_template_exercises(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS exercise_sets (
  id TEXT PRIMARY KEY NOT NULL,
  exercise_log_id TEXT NOT NULL,
  set_index INTEGER NOT NULL,
  set_type TEXT NOT NULL,
  weight_text TEXT NOT NULL,
  reps_text TEXT NOT NULL,
  side TEXT,
  note TEXT,
  FOREIGN KEY (exercise_log_id) REFERENCES exercise_logs(id) ON DELETE CASCADE
);
```

## Template data semantics

- Renaming an exercise preserves the same `template_exercise_id`.
- Removing an exercise marks it inactive.
- Replacing a movement creates a new exercise slot.
- History must never be destructively overwritten by template editing.

## Queue logic

The queue algorithm is a product recommendation, not a strict scheduler.

1. Keep a fixed split order: `day1 -> day2 -> day5`.
2. If there are no completed workouts, queue `day1`.
3. Otherwise, find the most recent completed workout overall and queue the next template in the split order.
4. Show:
   - next workout day
   - last completed workout day
   - elapsed days since last workout
   - elapsed days since this specific day was last trained
5. If the previous matching workout contains `carry_forward = 1`, surface those notes or exercise reminders in the draft.
6. Keep full calendar scheduling out of MVP.

## Sample SQL queries

### Latest completed log per template

```sql
SELECT
  wt.id,
  wt.code,
  wt.name,
  wt.order_index,
  wl.completed_at,
  wl.summary
FROM workout_templates wt
LEFT JOIN workout_logs wl
  ON wl.id = (
    SELECT id
    FROM workout_logs x
    WHERE x.template_id = wt.id
      AND x.status = 'completed'
    ORDER BY x.completed_at DESC
    LIMIT 1
  )
WHERE wt.is_active = 1
ORDER BY wt.order_index ASC;
```

### Exercise history for one template exercise

```sql
SELECT
  wl.completed_at,
  es.set_type,
  es.weight_text,
  es.reps_text,
  es.side,
  el.notes
FROM exercise_logs el
JOIN workout_logs wl
  ON wl.id = el.workout_log_id
JOIN exercise_sets es
  ON es.exercise_log_id = el.id
WHERE el.template_exercise_id = ?
  AND wl.status = 'completed'
ORDER BY wl.completed_at DESC, es.set_index ASC;
```

### Most recent completed workout overall

```sql
SELECT
  wl.id,
  wt.code,
  wt.name,
  wl.completed_at
FROM workout_logs wl
JOIN workout_templates wt
  ON wt.id = wl.template_id
WHERE wl.status = 'completed'
ORDER BY wl.completed_at DESC
LIMIT 1;
```

### Seed template upsert

```sql
INSERT INTO workout_templates (id, code, name, order_index, is_active)
VALUES (?, ?, ?, ?, 1)
ON CONFLICT(code) DO UPDATE SET
  name = excluded.name,
  order_index = excluded.order_index,
  is_active = 1;
```

## Transaction patterns

| Operation | Pattern |
|---|---|
| Bootstrap DB | `execAsync()` for PRAGMAs and `CREATE TABLE IF NOT EXISTS` |
| Save completed workout | `withExclusiveTransactionAsync(async txn => ...)` |
| Template reorder | Exclusive transaction; rewrite all active `order_index` values together |
| User-input writes | `runAsync()` with bound params |
| Reads | `getFirstAsync()` / `getAllAsync()` |
| Bulk schema migrations | `execAsync()` only for static SQL, never user input |

## Migration strategy

1. Keep current version in `PRAGMA user_version`.
2. Write one migration per version.
3. Never edit old migrations after they ship.
4. For simple adds or renames, use supported ALTER TABLE operations.
5. For complex changes:
   - create a new table
   - copy and transform data
   - recreate indexes and foreign keys
   - drop old table
   - rename new table
6. Run seeds idempotently after migrations.
7. Keep migration-side SQL deterministic and free of user input.

## Validation scripts

| Script | Purpose |
|---|---|
| validate-db.ts | Tables, indexes, PRAGMAs, and foreign keys exist |
| validate-seed.ts | Plan C templates and exercises are present exactly once |
| validate-queue.ts | Queue returns the correct next day for several fixture states |
| validate-summary.ts | Workout summary formatter matches expected text style |

## Canonical enum values

### workout_logs.status
- in_progress
- completed
- abandoned

### exercise_sets.set_type
- warmup
- working
- drop
- burnout

### exercise_sets.side
- left
- right
- bilateral
- per_leg
- per_side

## Recommended indexes

- workout_templates(code) unique
- workout_logs(template_id, completed_at desc)
- workout_logs(status, completed_at desc)
- exercise_logs(template_exercise_id, workout_log_id)
- exercise_sets(exercise_log_id, set_index)