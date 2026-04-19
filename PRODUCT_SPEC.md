# PRODUCT_SPEC

## Title

HIT Log

## One-sentence summary

A mobile-first, dark-mode workout logger for HIT / Dorian Yates style training that queues the next workout day, lets the user log fast with minimal typing, and shows the latest and previous performance for each exercise.

## Product goals

| Goal | Meaning in practice |
|---|---|
| Fast logging | The user can open a workout day and enter working sets in seconds. |
| Local-first | The app works fully offline and feels instant in the gym. |
| Preserve log fidelity | Store the user's weight and rep notation exactly as entered. |
| Queue-based guidance | Show which workout day should be done next and relevant elapsed-time context. |
| Useful history | Show most recent and previous exercise performances clearly. |
| Editable templates | Workout day templates can be changed without code changes. |

## MVP scope

### In scope
- Plan C seed templates
- Home dashboard with next-up and latest logs
- Workout logger with multiple sets
- Text-friendly weight and rep entry
- Exercise history
- Template editor
- Local SQLite persistence
- Carry-forward notes and selected exercise carryover
- Simple progress comparison markers

### Out of scope
- Cloud sync
- Authentication
- Calendar scheduling engine
- AI coaching
- Wearables
- Voice logging
- Remote notifications
- Obsidian sync
- Search/filter UI

## Primary user jobs

The user should be able to:

1. Open the app and instantly see what workout day is next.
2. Tap a quick-start card and begin logging.
3. Enter weight and reps with minimal typing.
4. Compare today’s performance to the prior relevant performance.
5. Finish the workout and save a readable summary.
6. Edit workout day templates without touching code.

## Product principles

1. Do not normalize away the user’s notation. Store raw `weight_text` and `reps_text`.
2. Templates drive logging.
3. History is linked to a stable template exercise slot.
4. Queue over calendar for MVP.
5. Dark, minimal, thumb-friendly UI.

## Template semantics

These rules must stay consistent throughout the repo:

- **Rename** preserves the same `template_exercise_id` and keeps history attached.
- **Remove** marks the exercise slot inactive so old history remains intact.
- **Replace with a new movement** creates a new exercise slot rather than mutating old history into a different movement.

## Workout day seeds

| Template code | Name | Seed exercises |
|---|---|---|
| day1 | Day 1 – Chest + Back | Chest Press, Chest Fly, Seated Row, Lat Pulldown, Ab Rotation Machine, DB Shrugs, Back Extensions |
| day2 | Day 2 – Legs | Bulgarian Split Squat, Leg Extension, Seated Leg Curl, Seated Leg Press, Calf Raise |
| day5 | Day 5 – Shoulders + Arms | Overhead Press, Lateral Raise, Triceps, DB Curls, Curl Machine |

## Supported logging notation

| Field | Examples |
|---|---|
| weight_text | 125, 45s, 3 plates per side, bodyweight + 25 |
| reps_text | 8, 10, 20 per leg, 10 per side |
| set_type | working, drop, burnout, warmup |
| side | L, R, both, per_leg, per_side |

## Core MVP screens

| Screen | Purpose |
|---|---|
| Home | Show next-up day, quick-start actions, latest logs, carry-forward notes, recent highlights |
| Workout Logger | Log one workout day fast |
| Exercise History | Show latest and previous performances for one exercise |
| Templates | View and edit workout day templates |

## V2 screens

| Screen | Purpose |
|---|---|
| Search | Search exercises and filter history |
| Calendar | Browse workout history by day |

## Acceptance criteria for MVP features

| Feature | Done when |
|---|---|
| Template editor | User can rename, add, remove, and reorder exercises for any day template, and order persists after restart. |
| Latest-log queries | Home shows the latest completed workout for each template after app restart, with date and readable summary. |
| Workout logger | User can log multiple sets per exercise, use text-friendly inputs, add notes, mark set types, and save a completed workout atomically. |
| Exercise history | User can open an exercise and see the most recent result first, followed by earlier results in reverse chronological order. |
| Queue | Home recommends the next workout day in split order, shows elapsed time, and can surface carry-forward notes or exercises. |
| Carry-forward | User can mark an exercise or note to carry forward and see it next time that workout day is opened. |
| Progress comparison | Latest versus previous comparison is visible in history and may optionally appear inline in the logger. |

## Progress rules for MVP

A performance improvement marker is allowed if any of these are true:

1. Same weight, higher reps.
2. Clearly heavier weight for the same exercise and set type.
3. Same movement and notation, with no ambiguity from a changed exercise identity.

Do not attempt estimated 1RM, RIR, or effort prediction in MVP.

## Expected output examples

### Readable workout summary

```txt
Day 1 – Chest + Back
Chest Press: 125 x 8
Drop Set: 55 x 9
Chest Fly: 135 x 10
Seated Row: 125 x 10
Lat Pulldown: 125 x 10
Ab Rotation Machine (L): 105 x 10
Ab Rotation Machine (R): 105 x 10
DB Shrugs: 45s x 26
Back Extensions: 40 x 20
```

### Example latest-log card text

```txt
Day 2 – Legs
Last completed: 2026-04-13
Leg Extension: 180 x 15
Bulgarian Split Squat: 30 x 20 per leg
Seated Leg Curl: 115 x 10
```

## Non-goals for MVP

Do not add cloud sync, auth, a heavy analytics layer, auto-progression math, or a scheduling engine before the core logger, latest-log queries, history, template editor, and queue are solid.
