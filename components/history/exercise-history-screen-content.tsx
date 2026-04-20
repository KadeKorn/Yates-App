import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import type { ExerciseHistoryEntry } from '@/db/repositories/exercise-log-repository';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ExerciseHistoryScreenContentProps = {
  error: Error | null;
  historyEntries: ExerciseHistoryEntry[];
  isLoading: boolean;
};

type HistoryPalette = {
  accent: string;
  border: string;
  muted: string;
  surface: string;
  surfaceMuted: string;
};

function getPalette(colorScheme: 'light' | 'dark'): HistoryPalette {
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

function formatSetLine(
  set: ExerciseHistoryEntry['sets'][number]
): string {
  const setPrefix = set.setType === 'working' ? `Set ${set.setIndex}` : `Set ${set.setIndex} (${set.setType})`;
  const sideSuffix = set.side ? ` [${set.side}]` : '';

  return `${setPrefix}: ${set.weightText} x ${set.repsText}${sideSuffix}`;
}

export function ExerciseHistoryScreenContent({
  error,
  historyEntries,
  isLoading,
}: ExerciseHistoryScreenContentProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const palette = getPalette(colorScheme);
  const latestEntry = historyEntries[0] ?? null;

  if (isLoading) {
    return (
      <ThemedView style={styles.centeredState}>
        <ActivityIndicator color={palette.accent} />
        <ThemedText style={[styles.stateText, { color: palette.muted }]}>
          Loading exercise history
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centeredState}>
        <ThemedText type="subtitle">Exercise History</ThemedText>
        <ThemedText style={[styles.stateText, { color: palette.muted }]}>
          {error.message}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={[styles.eyebrow, { color: palette.accent }]}>
            Exercise History
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            {latestEntry?.exerciseNameSnapshot ?? 'Exercise History'}
          </ThemedText>
          <ThemedText style={[styles.supportingText, { color: palette.muted }]}>
            Completed workout history, newest first.
          </ThemedText>
        </View>

        {historyEntries.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}>
            <ThemedText type="defaultSemiBold">No completed history yet</ThemedText>
            <ThemedText style={[styles.supportingText, { color: palette.muted }]}>
              Completed sets for this exercise will appear here after you save a workout.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.entryList}>
            {historyEntries.map((entry) => (
              <View
                key={entry.exerciseLogId}
                style={[
                  styles.entryCard,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  },
                ]}>
                <View style={styles.entryHeader}>
                  <ThemedText style={[styles.entryDate, { color: palette.accent }]}>
                    {formatCompletedDate(entry.completedAt)}
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.entryTitle}>
                    {entry.exerciseNameSnapshot}
                  </ThemedText>
                </View>

                <View style={styles.setList}>
                  {entry.sets.map((set) => (
                    <ThemedText key={set.id} style={[styles.setText, { color: theme.text }]}>
                      {formatSetLine(set)}
                    </ThemedText>
                  ))}
                </View>

                {entry.notes ? (
                  <View
                    style={[
                      styles.noteBlock,
                      {
                        backgroundColor: palette.surfaceMuted,
                        borderColor: palette.border,
                      },
                    ]}>
                    <ThemedText style={[styles.noteLabel, { color: palette.muted }]}>
                      Notes
                    </ThemedText>
                    <ThemedText style={[styles.noteText, { color: theme.text }]}>
                      {entry.notes}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centeredState: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    gap: 14,
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyState: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.9,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  entryCard: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.9,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  entryHeader: {
    gap: 4,
  },
  entryList: {
    gap: 12,
  },
  entryTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  header: {
    gap: 6,
  },
  noteBlock: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  screen: {
    flex: 1,
  },
  setList: {
    gap: 4,
  },
  setText: {
    fontSize: 15,
    lineHeight: 21,
  },
  stateText: {
    textAlign: 'center',
  },
  supportingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
  },
});
