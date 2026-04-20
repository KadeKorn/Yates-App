import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import type { LatestExercisePerformance } from '@/db/repositories/exercise-log-repository';
import type { ActiveWorkoutTemplateDetail } from '@/db/repositories/template-repository';
import type { WorkoutLoggerExerciseDraft } from '@/hooks/use-workout-logger-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ProgressionSuggestion } from '@/lib/progression/get-progression-suggestion';

import { ExerciseLogCard } from './exercise-log-card';

type WorkoutLoggerScreenContentProps = {
  error: Error | null;
  exercises: WorkoutLoggerExerciseDraft[];
  isLoading: boolean;
  isSaving: boolean;
  latestPerformanceByExerciseId: Record<string, LatestExercisePerformance>;
  progressionSuggestionByExerciseId: Record<string, ProgressionSuggestion>;
  saveError: string | null;
  template: ActiveWorkoutTemplateDetail | null;
  onAddSet: (exerciseId: string) => void;
  onDismissSaveError: () => void;
  onOpenHistory: (templateExerciseId: string) => void;
  onSaveWorkout: () => void;
  onToggleExerciseNote: (exerciseId: string) => void;
  onToggleSetNote: (exerciseId: string, setId: string) => void;
  onUpdateExerciseNotes: (exerciseId: string, value: string) => void;
  onUpdateSetField: (
    exerciseId: string,
    setId: string,
    field: 'note' | 'repsText' | 'setType' | 'weightText',
    value: string
  ) => void;
};

type LoggerPalette = {
  accent: string;
  border: string;
  muted: string;
  surface: string;
  surfaceMuted: string;
};

function getPalette(colorScheme: 'light' | 'dark'): LoggerPalette {
  if (colorScheme === 'light') {
    return {
      surface: '#F3F5F7',
      surfaceMuted: '#E8EDF1',
      border: '#D5DDE5',
      muted: '#5E6A75',
      accent: '#0A7EA4',
    };
  }

  return {
    surface: '#1C1F22',
    surfaceMuted: '#17191C',
    border: '#2B3035',
    muted: '#8D98A3',
    accent: '#D7F75B',
  };
}

export function WorkoutLoggerScreenContent({
  error,
  exercises,
  isLoading,
  isSaving,
  latestPerformanceByExerciseId,
  progressionSuggestionByExerciseId,
  saveError,
  template,
  onAddSet,
  onDismissSaveError,
  onOpenHistory,
  onSaveWorkout,
  onToggleExerciseNote,
  onToggleSetNote,
  onUpdateExerciseNotes,
  onUpdateSetField,
}: WorkoutLoggerScreenContentProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const palette = getPalette(colorScheme);

  if (isLoading) {
    return (
      <ThemedView style={styles.centeredState}>
        <ActivityIndicator color={palette.accent} />
        <ThemedText style={[styles.stateText, { color: palette.muted }]}>
          Loading workout logger
        </ThemedText>
      </ThemedView>
    );
  }

  if (error || !template) {
    return (
      <ThemedView style={styles.centeredState}>
        <ThemedText type="subtitle">Workout Logger</ThemedText>
        <ThemedText style={[styles.stateText, { color: palette.muted }]}>
          {error?.message ?? 'Workout template unavailable.'}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="title" style={styles.title}>
              {template.name}
            </ThemedText>
            <ThemedText style={[styles.supportingText, { color: palette.muted }]}>
              Log the sets you complete. Empty rows are skipped when you save.
            </ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Complete workout"
            disabled={isSaving}
            onPress={onSaveWorkout}
            style={[
              styles.completeButton,
              {
                backgroundColor: palette.accent,
                opacity: isSaving ? 0.7 : 1,
              },
            ]}>
            <ThemedText style={styles.completeButtonText}>
              {isSaving ? 'Saving...' : 'Complete workout'}
            </ThemedText>
          </Pressable>
        </View>

        {saveError ? (
          <Pressable
            accessibilityRole="button"
            onPress={onDismissSaveError}
            style={[
              styles.validationCard,
              {
                backgroundColor: palette.surfaceMuted,
                borderColor: palette.border,
              },
            ]}>
            <ThemedText style={[styles.validationText, { color: theme.text }]}>
              {saveError}
            </ThemedText>
          </Pressable>
        ) : null}

        <View style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <ExerciseLogCard
              key={exercise.id}
              exercise={exercise}
              latestPerformance={latestPerformanceByExerciseId[exercise.templateExerciseId] ?? null}
              progressionSuggestion={
                progressionSuggestionByExerciseId[exercise.templateExerciseId] ?? null
              }
              palette={palette}
              onAddSet={() => onAddSet(exercise.id)}
              onOpenHistory={() => onOpenHistory(exercise.templateExerciseId)}
              onToggleExerciseNote={() => onToggleExerciseNote(exercise.id)}
              onToggleSetNote={(setId) => onToggleSetNote(exercise.id, setId)}
              onUpdateExerciseNotes={(value) => onUpdateExerciseNotes(exercise.id, value)}
              onUpdateSetField={(setId, field, value) =>
                onUpdateSetField(exercise.id, setId, field, value)
              }
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centeredState: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  completeButton: {
    alignItems: 'center',
    borderRadius: 16,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  completeButtonText: {
    color: '#151718',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  content: {
    gap: 18,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  exerciseList: {
    gap: 16,
  },
  header: {
    gap: 16,
  },
  headerText: {
    gap: 8,
  },
  screen: {
    flex: 1,
  },
  stateText: {
    textAlign: 'center',
  },
  supportingText: {
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
  },
  validationCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  validationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
