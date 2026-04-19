import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { bootstrapDatabase } from '@/db/bootstrap';
import { TemplateRepository, WorkoutLogRepository } from '@/db/repositories';
import type { NextRecommendedWorkoutDay } from '@/db/repositories/template-repository';
import type { TemplateLatestCompletedWorkout } from '@/db/repositories/workout-log-repository';

type HomeScreenDataState = {
  error: Error | null;
  isLoading: boolean;
  latestPerTemplate: TemplateLatestCompletedWorkout[];
  nextWorkout: NextRecommendedWorkoutDay | null;
};

export function useHomeScreenData(): HomeScreenDataState {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextWorkout, setNextWorkout] = useState<NextRecommendedWorkoutDay | null>(null);
  const [latestPerTemplate, setLatestPerTemplate] = useState<TemplateLatestCompletedWorkout[]>([]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let isMounted = true;

    async function loadHomeScreenData(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        const database = await bootstrapDatabase();
        const templateRepository = new TemplateRepository(database);
        const workoutLogRepository = new WorkoutLogRepository(database);

        const [recommendedWorkout, latestCompletedPerTemplate] = await Promise.all([
          templateRepository.getNextRecommendedWorkoutDay(),
          workoutLogRepository.getLatestCompletedWorkoutsPerTemplate(),
        ]);

        if (!isMounted) {
          return;
        }

        setNextWorkout(recommendedWorkout);
        setLatestPerTemplate(latestCompletedPerTemplate);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          loadError instanceof Error ? loadError : new Error('Unable to load the Home screen.')
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadHomeScreenData();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  return {
    isLoading,
    error,
    nextWorkout,
    latestPerTemplate,
  };
}
