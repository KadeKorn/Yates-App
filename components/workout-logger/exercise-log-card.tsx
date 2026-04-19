import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import type { WorkoutLoggerExerciseDraft } from '@/hooks/use-workout-logger-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { ExerciseSetRow } from './exercise-set-row';

type ExerciseLogCardProps = {
  exercise: WorkoutLoggerExerciseDraft;
  palette: {
    accent: string;
    border: string;
    muted: string;
    surface: string;
    surfaceMuted: string;
  };
  onAddSet: () => void;
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
  palette,
  onAddSet,
  onToggleExerciseNote,
  onToggleSetNote,
  onUpdateExerciseNotes,
  onUpdateSetField,
}: ExerciseLogCardProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

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
