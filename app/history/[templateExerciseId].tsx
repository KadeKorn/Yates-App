import { Stack, useLocalSearchParams } from 'expo-router';

import { ExerciseHistoryScreenContent } from '@/components/history/exercise-history-screen-content';
import { useExerciseHistoryScreen } from '@/hooks/use-exercise-history-screen';

export default function ExerciseHistoryRoute() {
  const params = useLocalSearchParams<{ templateExerciseId?: string | string[] }>();
  const templateExerciseId =
    typeof params.templateExerciseId === 'string' ? params.templateExerciseId : '';
  const { error, historyEntries, isLoading } = useExerciseHistoryScreen(templateExerciseId);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Exercise History',
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
      <ExerciseHistoryScreenContent
        error={error}
        historyEntries={historyEntries}
        isLoading={isLoading}
      />
    </>
  );
}
