import { HomeScreenContent } from '@/components/home/home-screen-content';
import { useHomeScreenData } from '@/hooks/use-home-screen-data';

export default function HomeScreen() {
  const { error, isLoading, latestPerTemplate, nextWorkout } = useHomeScreenData();

  return (
    <HomeScreenContent
      error={error}
      isLoading={isLoading}
      latestPerTemplate={latestPerTemplate}
      nextWorkout={nextWorkout}
    />
  );
}
