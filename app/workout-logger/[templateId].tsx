import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';

import { WorkoutLoggerScreenContent } from '@/components/workout-logger/workout-logger-screen-content';
import { useWorkoutLoggerScreen } from '@/hooks/use-workout-logger-screen';

export default function WorkoutLoggerRoute() {
  const isBackNavigatingRef = useRef(false);
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
    flushDraftSave,
    removeSet,
    saveWorkout,
    toggleExerciseNote,
    toggleSetNote,
    updateExerciseNotes,
    updateSetField,
  } = useWorkoutLoggerScreen(templateId);

  async function handleBackPress(): Promise<void> {
    if (isBackNavigatingRef.current) {
      return;
    }

    isBackNavigatingRef.current = true;
    Keyboard.dismiss();

    try {
      try {
        await flushDraftSave();
      } catch (flushError) {
        console.error('Unable to flush workout draft before navigating back.', flushError);
      }

      if (typeof router.canGoBack === 'function' && router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } finally {
      isBackNavigatingRef.current = false;
    }
  }

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
          headerLeft: ({ tintColor }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              onPress={() => {
                void handleBackPress();
              }}
              style={styles.backButton}>
              <MaterialIcons
                color={tintColor ?? '#F3F5F7'}
                name="chevron-left"
                size={32}
              />
            </Pressable>
          ),
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
        onOpenHistory={(templateExerciseId) => {
          void (async () => {
            await flushDraftSave();

            router.push({
              pathname: '/history/[templateExerciseId]',
              params: { templateExerciseId },
            });
          })();
        }}
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

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginLeft: -8,
    width: 44,
  },
});
