import { Stack, router, useLocalSearchParams } from 'expo-router';

import { WorkoutLoggerScreenContent } from '@/components/workout-logger/workout-logger-screen-content';
import { useWorkoutLoggerScreen } from '@/hooks/use-workout-logger-screen';

export default function WorkoutLoggerRoute() {
  const params = useLocalSearchParams<{ templateId?: string | string[] }>();
  const templateId = typeof params.templateId === 'string' ? params.templateId : '';
  const {
    template,
    exercises,
    isLoading,
    isSaving,
    latestPerformanceByExerciseId,
    progressionSuggestionByExerciseId,
    error,
    saveError,
    addSet,
    dismissSaveError,
    removeSet,
    saveWorkout,
    toggleExerciseNote,
    toggleSetNote,
    updateExerciseNotes,
    updateSetField,
  } = useWorkoutLoggerScreen(templateId);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Workout Logger',
          headerBackTitle: 'Logger',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#0F1216',
          },
          headerTintColor: '#F3F5F7',
          headerTitleStyle: {
            color: '#F3F5F7',
            fontSize: 18,
            fontWeight: '700',
          },
        }}
      />
      <WorkoutLoggerScreenContent
        error={error}
        exercises={exercises}
        isLoading={isLoading}
        isSaving={isSaving}
        latestPerformanceByExerciseId={latestPerformanceByExerciseId}
        progressionSuggestionByExerciseId={progressionSuggestionByExerciseId}
        saveError={saveError}
        template={template}
        onAddSet={addSet}
        onDismissSaveError={dismissSaveError}
        onOpenHistory={(templateExerciseId) =>
          router.push({
            pathname: '/history/[templateExerciseId]',
            params: { templateExerciseId },
          })
        }
        onRemoveSet={removeSet}
        onSaveWorkout={() =>
          void saveWorkout({
            onComplete: () => {
              router.replace('/(tabs)');
            },
          })
        }
        onToggleExerciseNote={toggleExerciseNote}
        onToggleSetNote={toggleSetNote}
        onUpdateExerciseNotes={updateExerciseNotes}
        onUpdateSetField={updateSetField}
      />
    </>
  );
}
