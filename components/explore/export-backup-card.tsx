import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWorkoutJsonExport } from '@/hooks/use-workout-json-export';

type ExplorePalette = {
  accent: string;
  border: string;
  danger: string;
  muted: string;
  surface: string;
  surfaceMuted: string;
};

function getPalette(colorScheme: 'light' | 'dark'): ExplorePalette {
  if (colorScheme === 'light') {
    return {
      surface: '#F3F5F7',
      surfaceMuted: '#E8EDF1',
      border: '#D5DDE5',
      muted: '#5E6A75',
      accent: '#0A7EA4',
      danger: '#B42318',
    };
  }

  return {
    surface: '#171B20',
    surfaceMuted: '#11151A',
    border: '#2A3138',
    muted: '#93A0AB',
    accent: '#D7F75B',
    danger: '#FF9A8A',
  };
}

export function ExportBackupCard() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const palette = getPalette(colorScheme);
  const { error, exportJsonBackup, isExporting, result, status } = useWorkoutJsonExport();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <ThemedText style={[styles.caption, { color: palette.muted }]}>
            Explore
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            Backup
          </ThemedText>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <IconSymbol name="square.and.arrow.up" size={24} color={palette.accent} />
            </View>
            <View style={styles.cardTitleBlock}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                JSON Export
              </ThemedText>
              <ThemedText style={[styles.supportingText, { color: palette.muted }]}>
                Workout history, templates, and drafts.
              </ThemedText>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Export workout data as JSON"
            disabled={isExporting}
            onPress={exportJsonBackup}
            style={({ pressed }) => [
              styles.exportButton,
              {
                backgroundColor: palette.accent,
                opacity: isExporting ? 0.7 : pressed ? 0.84 : 1,
              },
            ]}>
            {isExporting ? (
              <ActivityIndicator color={colorScheme === 'light' ? '#FFFFFF' : '#11151A'} />
            ) : (
              <IconSymbol
                name="square.and.arrow.up"
                size={20}
                color={colorScheme === 'light' ? '#FFFFFF' : '#11151A'}
              />
            )}
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.exportButtonText,
                { color: colorScheme === 'light' ? '#FFFFFF' : '#11151A' },
              ]}>
              {isExporting ? 'Exporting' : 'Export JSON Backup'}
            </ThemedText>
          </Pressable>

          {status === 'success' && result ? (
            <View
              style={[
                styles.statusPanel,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.border,
                },
              ]}>
              <ThemedText type="defaultSemiBold" style={styles.statusTitle}>
                Export ready
              </ThemedText>
              <ThemedText style={[styles.statusText, { color: palette.muted }]}>
                {result.fileName}
              </ThemedText>
              <View style={styles.countGrid}>
                <ThemedText style={[styles.countText, { color: theme.text }]}>
                  Templates: {result.counts.workoutTemplates}
                </ThemedText>
                <ThemedText style={[styles.countText, { color: theme.text }]}>
                  Template exercises: {result.counts.workoutTemplateExercises}
                </ThemedText>
                <ThemedText style={[styles.countText, { color: theme.text }]}>
                  Workout logs: {result.counts.workoutLogs}
                </ThemedText>
                <ThemedText style={[styles.countText, { color: theme.text }]}>
                  Exercise logs: {result.counts.exerciseLogs}
                </ThemedText>
                <ThemedText style={[styles.countText, { color: theme.text }]}>
                  Exercise sets: {result.counts.exerciseSets}
                </ThemedText>
              </View>
            </View>
          ) : null}

          {status === 'error' && error ? (
            <View
              style={[
                styles.statusPanel,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.border,
                },
              ]}>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.statusTitle, { color: palette.danger }]}>
                Export failed
              </ThemedText>
              <ThemedText style={[styles.statusText, { color: palette.muted }]}>
                {error.message}
              </ThemedText>
            </View>
          ) : null}
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
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  cardTitleBlock: {
    flex: 1,
    gap: 3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 16,
  },
  countGrid: {
    gap: 4,
  },
  countText: {
    fontSize: 14,
    lineHeight: 20,
  },
  exportButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
  },
  exportButtonText: {
    fontSize: 15,
    lineHeight: 20,
  },
  header: {
    gap: 4,
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {
    flex: 1,
  },
  statusPanel: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  supportingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
  },
});
