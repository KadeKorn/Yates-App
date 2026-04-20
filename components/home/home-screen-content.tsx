import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import type { NextRecommendedWorkoutDay } from '@/db/repositories/template-repository';
import type { TemplateLatestCompletedWorkout } from '@/db/repositories/workout-log-repository';
import { useColorScheme } from '@/hooks/use-color-scheme';

type HomeScreenContentProps = {
  error: Error | null;
  isLoading: boolean;
  latestPerTemplate: TemplateLatestCompletedWorkout[];
  nextWorkout: NextRecommendedWorkoutDay | null;
  onTemplatePress: (templateId: string) => void;
};

type HomePalette = {
  accent: string;
  border: string;
  muted: string;
  surface: string;
  surfaceMuted: string;
};

function formatCompletedDate(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function getPalette(colorScheme: 'light' | 'dark'): HomePalette {
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
    surface: '#171B20',
    surfaceMuted: '#11151A',
    border: '#2A3138',
    muted: '#93A0AB',
    accent: '#D7F75B',
  };
}

export function HomeScreenContent({
  error,
  isLoading,
  latestPerTemplate,
  nextWorkout,
  onTemplatePress,
}: HomeScreenContentProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const palette = getPalette(colorScheme);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator color={palette.accent} />
        <ThemedText style={[styles.loadingText, { color: palette.muted }]}>
          Loading Home
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText type="subtitle">Home</ThemedText>
        <ThemedText style={[styles.errorText, { color: palette.muted }]}>
          Unable to load workout data right now.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <ThemedText style={[styles.caption, { color: palette.muted }]}>
            Home
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            HIT Log
          </ThemedText>
        </View>

        <ThemedView
          style={[
            styles.nextUpCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}>
          <ThemedText style={[styles.sectionLabel, { color: palette.accent }]}>
            Next Up
          </ThemedText>
          {nextWorkout ? (
            <>
              <ThemedText type="subtitle" style={styles.nextUpName}>
                {nextWorkout.recommendedTemplate.name}
              </ThemedText>
              <ThemedText style={[styles.supportingText, { color: palette.muted }]}>
                {nextWorkout.queueReason === 'first-active-template'
                  ? 'Starting from the first active workout in the split.'
                  : 'Queued from the latest completed workout.'}
              </ThemedText>
            </>
          ) : (
            <ThemedText style={[styles.supportingText, { color: palette.muted }]}>
              No active workout templates are available yet.
            </ThemedText>
          )}
        </ThemedView>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Latest Logs
          </ThemedText>
          <ThemedText style={[styles.caption, { color: palette.muted }]}>
            Active templates
          </ThemedText>
        </View>

        <View style={styles.cardList}>
          {latestPerTemplate.map((template) => {
            const latestWorkout = template.latestCompletedWorkout;

            return (
              <Pressable
                key={template.templateId}
                accessibilityRole="button"
                accessibilityLabel={`Open ${template.templateName} workout logger`}
                onPress={() => onTemplatePress(template.templateId)}
                style={[
                  styles.templateCard,
                  {
                    backgroundColor: latestWorkout ? palette.surface : palette.surfaceMuted,
                    borderColor: palette.border,
                  },
                ]}>
                <View style={styles.templateHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.templateName}>
                    {template.templateName}
                  </ThemedText>
                  <ThemedText style={[styles.templateCode, { color: palette.muted }]}>
                    {template.templateCode.toUpperCase()}
                  </ThemedText>
                </View>

                {latestWorkout ? (
                  <View style={styles.summaryBlock}>
                    <ThemedText style={[styles.summaryMeta, { color: palette.muted }]}>
                      Last completed {formatCompletedDate(latestWorkout.completedAt)}
                    </ThemedText>
                    <ThemedText style={[styles.summaryText, { color: theme.text }]}>
                      {latestWorkout.summary?.trim() || 'Completed workout summary unavailable.'}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.summaryBlock}>
                    <ThemedText style={[styles.summaryMeta, { color: palette.muted }]}>
                      No completed workouts yet
                    </ThemedText>
                    <ThemedText style={[styles.summaryText, { color: theme.text }]}>
                      This template is active and ready when you log the first completed session.
                    </ThemedText>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontSize: 13,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardList: {
    gap: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 16,
  },
  errorText: {
    textAlign: 'center',
  },
  header: {
    gap: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  nextUpCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  nextUpName: {
    fontSize: 24,
    lineHeight: 30,
  },
  screen: {
    flex: 1,
  },
  sectionHeader: {
    gap: 4,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  summaryBlock: {
    gap: 6,
  },
  summaryMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
  },
  supportingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  templateCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    gap: 10,
  },
  templateCode: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  templateHeader: {
    gap: 4,
  },
  templateName: {
    fontSize: 18,
    lineHeight: 24,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
  },
});
