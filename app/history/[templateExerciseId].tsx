import { useLocalSearchParams } from 'expo-router';

import { ExerciseHistoryScreenContent } from '@/components/history/exercise-history-screen-content';
import { useExerciseHistoryScreen } from '@/hooks/use-exercise-history-screen';

export default function ExerciseHistoryRoute() {
  const params = useLocalSearchParams<{ templateExerciseId?: string | string[] }>();
  const templateExerciseId =
    typeof params.templateExerciseId === 'string' ? params.templateExerciseId : '';
  const { error, historyEntries, isLoading } = useExerciseHistoryScreen(templateExerciseId);

  return (
    <ExerciseHistoryScreenContent
      error={error}
      historyEntries={historyEntries}
      isLoading={isLoading}
    />
  );
}
