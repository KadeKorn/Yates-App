# UI_RULES

## Core UI posture

This app should feel like a gym tool, not a spreadsheet.

## Rules

1. Default to dark mode.
2. Prefer one primary action per screen.
3. Use large typography for workout names, current set values, and prior-performance references.
4. Make logging flows one-hand friendly.
5. Keep the logger vertically scannable:
   - exercise name
   - last result
   - set rows
   - note toggle
6. Keep special-set actions close to the set rows:
   - add drop set
   - add burnout set
7. Avoid modal-heavy flows for common actions.
8. Home screen order:
   - next up
   - quick start cards
   - latest logs
   - carry-forward notes
   - recent highlights
9. Template editing can be slower than logging, but never confusing.
10. Every critical action must have readable text or an accessible label.

## Screen-specific rules

| Screen | UI rule |
|---|---|
| Home | Show the next-up card first |
| Workout Logger | No hidden save action; the complete workout action must be obvious |
| Exercise History | Most recent performance first; comparison cues should be obvious |
| Templates | Reorder affordance must be explicit |

## Logging-row rules

- One working set row is visible by default.
- “Add set” should duplicate the last row shape.
- Chips are preferred over dropdowns for set type.
- `weight_text` and `reps_text` must be plain text inputs.
- Last performance should sit directly under the exercise title when useful during logging.
