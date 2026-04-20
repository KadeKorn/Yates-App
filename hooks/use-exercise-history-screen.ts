import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { bootstrapDatabase } from '@/db/bootstrap';
import { ExerciseLogRepository } from '@/db/repositories';
import type { ExerciseHistoryEntry } from '@/db/repositories/exercise-log-repository';

type UseExerciseHistoryScreenResult = {
  error: Error | null;
  historyEntries: ExerciseHistoryEntry[];
  isLoading: boolean;
};

export function useExerciseHistoryScreen(
  templateExerciseId: string
): UseExerciseHistoryScreenResult {
  const isFocused = useIsFocused();
  const [historyEntries, setHistoryEntries] = useState<ExerciseHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let isMounted = true;

    async function loadExerciseHistory(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        if (!templateExerciseId) {
          setHistoryEntries([]);
          setError(new Error('Exercise history is unavailable for this route.'));
          return;
        }

        const database = await bootstrapDatabase();
        const exerciseLogRepository = new ExerciseLogRepository(database);
        const loadedHistory = await exerciseLogRepository.getExerciseHistoryByTemplateExerciseId(
          templateExerciseId
        );

        if (!isMounted) {
          return;
        }

        setHistoryEntries(loadedHistory);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setHistoryEntries([]);
        setError(
          loadError instanceof Error ? loadError : new Error('Unable to load exercise history.')
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadExerciseHistory();

    return () => {
      isMounted = false;
    };
  }, [isFocused, templateExerciseId]);

  return {
    error,
    historyEntries,
    isLoading,
  };
}
