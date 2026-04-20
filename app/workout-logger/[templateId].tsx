import { router, useLocalSearchParams } from 'expo-router';

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
    error,
    saveError,
    addSet,
    dismissSaveError,
    saveWorkout,
    toggleExerciseNote,
    toggleSetNote,
    updateExerciseNotes,
    updateSetField,
  } = useWorkoutLoggerScreen(templateId);

  return (
    <WorkoutLoggerScreenContent
      error={error}
      exercises={exercises}
      isLoading={isLoading}
      isSaving={isSaving}
      latestPerformanceByExerciseId={latestPerformanceByExerciseId}
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
  );
}
