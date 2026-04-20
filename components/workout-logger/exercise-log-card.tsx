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
  onOpenHistory: () => void;
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
  onOpenHistory,
  onToggleExerciseNote,
  onToggleSetNote,
  onUpdateExerciseNotes,
  onUpdateSetField,
}: ExerciseLogCardProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const latestSets = latestPerformance?.sets.slice(0, 2) ?? [];

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

        {latestPerformance ? (
          <View
            style={[
              styles.lastTimeBlock,
              {
                backgroundColor: palette.surfaceMuted,
                borderColor: palette.border,
              },
            ]}>
            <ThemedText style={[styles.lastTimeLabel, { color: palette.accent }]}>
              Last time
            </ThemedText>
            <ThemedText style={[styles.lastTimeDate, { color: palette.muted }]}>
              {formatCompletedDate(latestPerformance.completedAt)}
            </ThemedText>
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
            <ThemedText style={[styles.suggestionText, { color: theme.text }]}>
              Suggestion: {progressionSuggestion.label}
            </ThemedText>
            <ThemedText style={[styles.suggestionMeta, { color: palette.muted }]}>
              Target {progressionSuggestion.targetRepRangeText}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.setList}>
        {exercise.sets.map((set) => (
          <ExerciseSetRow
            key={set.id}
            palette={palette}
            set={set}
            onFieldChange={(field, value) => onUpdateSetField(set.id, field, value)}
            onToggleNote={() => onToggleSetNote(set.id)}
          />
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable accessibilityRole="button" onPress={onAddSet} style={styles.actionButton}>
          <ThemedText style={[styles.actionText, { color: palette.accent }]}>Add set</ThemedText>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={onOpenHistory} style={styles.actionButton}>
          <ThemedText style={[styles.actionText, { color: palette.accent }]}>View history</ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onToggleExerciseNote}
          style={styles.actionButton}>
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
        />
      )}
    </View>
  );
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
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  header: {
    gap: 8,
  },
  lastTimeBlock: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  lastTimeDate: {
    fontSize: 13,
    lineHeight: 18,
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
    lineHeight: 20,
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
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
    padding: 12,
  },
  suggestionMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  setList: {
    gap: 12,
  },
  supportingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
  },
  titleBlock: {
    gap: 4,
  },
});
