import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import type { LatestExercisePerformance } from '@/db/repositories/exercise-log-repository';
import type { WorkoutLoggerExerciseDraft } from '@/hooks/use-workout-logger-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ProgressionSuggestion } from '@/lib/progression/get-progression-suggestion';

import { ExerciseSetRow } from './exercise-set-row';

type ExerciseLogCardProps = {
  exercise: WorkoutLoggerExerciseDraft;
  latestPerformance: LatestExercisePerformance | null;
  palette: {
    accent: string;
    border: string;
    muted: string;
    surface: string;
    surfaceMuted: string;
  };
  progressionSuggestion: ProgressionSuggestion | null;
  onAddSet: () => void;
  onFieldFocus: (input: TextInput | null) => void;
  onOpenHistory: () => void;
  onRemoveSet: (setId: string) => void;
  onToggleExerciseNote: () => void;
  onToggleSetNote: (setId: string) => void;
  onUpdateExerciseNotes: (value: string) => void;
  onUpdateSetField: (
    setId: string,
    field: 'note' | 'repsText' | 'setType' | 'weightText',
    value: string
  ) => void;
};

export function ExerciseLogCard({
  exercise,
  latestPerformance,
  palette,
  progressionSuggestion,
  onAddSet,
  onFieldFocus,
  onOpenHistory,
  onRemoveSet,
  onToggleExerciseNote,
  onToggleSetNote,
  onUpdateExerciseNotes,
  onUpdateSetField,
}: ExerciseLogCardProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const latestSets = getCompactLatestSets(latestPerformance);
  const exerciseNoteInputRef = useRef<TextInput | null>(null);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <ThemedText type="subtitle" style={styles.title}>
            {exercise.name}
          </ThemedText>
          <ThemedText style={[styles.supportingText, { color: palette.muted }]}>
            Exercise {exercise.orderIndex}
          </ThemedText>
        </View>

        {latestPerformance || progressionSuggestion ? (
          <View style={styles.metaRow}>
            {latestPerformance ? (
              <View
                style={[
                  styles.lastTimeBlock,
                  {
                    backgroundColor: palette.surfaceMuted,
                    borderColor: palette.border,
                  },
                ]}>
                <View style={styles.metaHeader}>
                  <ThemedText style={[styles.lastTimeLabel, { color: palette.accent }]}>
                    Last time
                  </ThemedText>
                  <ThemedText style={[styles.lastTimeDate, { color: palette.muted }]}>
                    {formatCompletedDate(latestPerformance.completedAt)}
                  </ThemedText>
                </View>
                {latestSets.map((set) => (
                  <ThemedText key={set.id} style={[styles.lastTimeText, { color: theme.text }]}>
                    {formatCompactSetLine(set)}
                  </ThemedText>
                ))}
                {latestPerformance.notes ? (
                  <ThemedText style={[styles.lastTimeMeta, { color: palette.muted }]}>
                    Includes notes
                  </ThemedText>
                ) : null}
              </View>
            ) : null}

            {progressionSuggestion ? (
              <View
                style={[
                  styles.suggestionBlock,
                  {
                    backgroundColor: palette.surfaceMuted,
                    borderColor: palette.border,
                  },
                ]}>
                <ThemedText style={[styles.lastTimeLabel, { color: palette.accent }]}>
                  Suggestion
                </ThemedText>
                <ThemedText style={[styles.suggestionText, { color: theme.text }]}>
                  {progressionSuggestion.label}
                </ThemedText>
                <ThemedText style={[styles.suggestionMeta, { color: palette.muted }]}>
                  Target {progressionSuggestion.targetRepRangeText}
                </ThemedText>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.setList}>
        {exercise.sets.map((set) => (
          <ExerciseSetRow
            key={set.id}
            palette={palette}
            set={set}
            onFieldFocus={onFieldFocus}
            onFieldChange={(field, value) => onUpdateSetField(set.id, field, value)}
            onRemove={() => onRemoveSet(set.id)}
            onToggleNote={() => onToggleSetNote(set.id)}
          />
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          onPress={onAddSet}
          style={[
            styles.actionButton,
            {
              backgroundColor: palette.surfaceMuted,
              borderColor: palette.border,
            },
          ]}>
          <ThemedText style={[styles.actionText, { color: palette.accent }]}>Add set</ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onOpenHistory}
          style={[
            styles.actionButton,
            {
              backgroundColor: palette.surfaceMuted,
              borderColor: palette.border,
            },
          ]}>
          <ThemedText style={[styles.actionText, { color: palette.accent }]}>View history</ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onToggleExerciseNote}
          style={[
            styles.actionButton,
            {
              backgroundColor: palette.surfaceMuted,
              borderColor: palette.border,
            },
          ]}>
          <ThemedText style={[styles.actionText, { color: palette.accent }]}>
            {exercise.isNoteExpanded || exercise.notes.trim() ? 'Hide exercise note' : 'Add exercise note'}
          </ThemedText>
        </Pressable>
      </View>

      {(exercise.isNoteExpanded || exercise.notes.trim()) && (
        <TextInput
          accessibilityLabel={`${exercise.name} note`}
          multiline
          placeholder="Optional exercise note"
          placeholderTextColor={palette.muted}
          style={[
            styles.noteInput,
            {
              backgroundColor: palette.surfaceMuted,
              borderColor: palette.border,
              color: theme.text,
            },
          ]}
          value={exercise.notes}
          onChangeText={onUpdateExerciseNotes}
          onFocus={() => onFieldFocus(exerciseNoteInputRef.current)}
          ref={exerciseNoteInputRef}
        />
      )}
    </View>
  );
}

function getCompactLatestSets(
  latestPerformance: LatestExercisePerformance | null
): LatestExercisePerformance['sets'] {
  if (!latestPerformance) {
    return [];
  }

  return [...latestPerformance.sets]
    .filter((set) => set.setType !== 'warmup')
    .sort((left, right) => {
      const leftPriority = getCompactSetPriority(left.setType);
      const rightPriority = getCompactSetPriority(right.setType);

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.setIndex - right.setIndex;
    })
    .slice(0, 2);
}

function getCompactSetPriority(setType: string): number {
  switch (setType) {
    case 'working':
      return 0;
    case 'burnout':
      return 1;
    default:
      return 2;
  }
}

function formatCompletedDate(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function formatCompactSetLine(set: LatestExercisePerformance['sets'][number]): string {
  const setLabel = set.setType === 'working' ? '' : `${set.setType} `;
  return `${setLabel}${set.weightText} x ${set.repsText}`;
}

const styles = StyleSheet.create({
  actionButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  header: {
    gap: 10,
  },
  lastTimeBlock: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    minWidth: 0,
    padding: 10,
  },
  lastTimeDate: {
    fontSize: 12,
    lineHeight: 16,
  },
  lastTimeLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.9,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  lastTimeMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  lastTimeText: {
    fontSize: 14,
    lineHeight: 18,
  },
  metaHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaRow: {
    gap: 8,
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 96,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  suggestionBlock: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    gap: 3,
    minWidth: 0,
    padding: 10,
  },
  suggestionMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  setList: {
    gap: 10,
  },
  supportingText: {
    fontSize: 14,
    lineHeight: 18,
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
  },
  titleBlock: {
    gap: 4,
  },
});
