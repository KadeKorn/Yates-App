# CONTRIBUTING

## Before making changes

1. Read:
   - `README.md`
   - `PRODUCT_SPEC.md`
   - `ARCHITECTURE.md`
   - `TASKLIST.md`
   - `UI_RULES.md`
   - `CODING_STANDARDS.md`
2. Pick one task or subtask.
3. Confirm whether the change affects schema, routing, queue logic, or summary formatting.

## Change protocol

1. Make the smallest change that satisfies the acceptance criteria.
2. Keep route files focused on composition and navigation.
3. Keep DB logic in repositories.
4. If the schema changes:
   - add or update migration
   - update docs
   - add validation coverage
5. If UI changes:
   - manually verify on device
   - update snapshots only if intentional and small
6. If queue logic changes:
   - add or update fixture-based tests

## Review checklist

| Check | Required |
|---|---|
| Lint passes | Yes |
| Typecheck passes | Yes |
| Targeted tests pass | Yes |
| Validation scripts pass | Yes |
| Manual device check done | Yes |
| Docs updated if behavior changed | Yes |

## Codex-specific contribution pattern

When using Codex:

1. Prompt one task at a time.
2. Require a changed-file list before or with implementation.
3. Require checks run.
4. Review every diff manually.
5. Never merge unreviewed agent output because it “seems fine.”

## Example commit messages

```txt
chore(repo): document expo sqlite architecture
feat(db): add sqlite bootstrap and migrations
feat(seed): seed plan c workout templates
feat(home): show latest logs by workout day
feat(logger): save completed workouts and summaries
feat(history): add exercise history and comparison
feat(templates): allow template rename add remove reorder
feat(queue): recommend next workout and carry forward notes
test(queue): add fixture-based queue validation
docs(spec): clarify logger acceptance criteria
```
