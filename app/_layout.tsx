import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { getDatabaseClient } from '@/db/client';
import { ExerciseLogRepository } from '@/db/repositories/exercise-log-repository';
import { TemplateRepository } from '@/db/repositories/template-repository';
import { WorkoutLogRepository } from '@/db/repositories/workout-log-repository';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDatabaseBootstrap } from '@/hooks/use-database-bootstrap';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { error, isReady } = useDatabaseBootstrap();
  const colorScheme = useColorScheme();
  const navigationTheme =
    colorScheme === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: Colors.dark.background,
            border: '#262C33',
            card: '#11151A',
            notification: Colors.dark.tint,
            primary: Colors.dark.tint,
            text: Colors.dark.text,
          },
        }
      : DefaultTheme;

  useEffect(() => {
    if (!isReady || error) return;

    (async () => {
      try {
        const db = await getDatabaseClient();

        const workoutRepo = new WorkoutLogRepository(db);
        const templateRepo = new TemplateRepository(db);
        const exerciseRepo = new ExerciseLogRepository(db);

        const latestOverall = await workoutRepo.getLatestCompletedWorkoutOverall();
        const latestPerTemplate = await workoutRepo.getLatestCompletedWorkoutsPerTemplate();
        const nextWorkout = await templateRepo.getNextRecommendedWorkoutDay();

        console.log('🔥 LATEST OVERALL:', latestOverall);
        console.log('🔥 LATEST PER TEMPLATE:', latestPerTemplate);
        console.log('🔥 NEXT WORKOUT:', nextWorkout);

        // Optional later:
        // const history = await exerciseRepo.getExerciseHistoryByTemplateExerciseId('seed-exercise-day1-chest-press');
        // console.log('🔥 HISTORY:', history);

        void exerciseRepo;
      } catch (err) {
        console.error('❌ DEBUG ERROR:', err);
      }
    })();
  }, [isReady, error]);

  if (error) {
    throw error;
  }

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
