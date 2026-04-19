import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import type { SetTypeOption, WorkoutLoggerSetDraft } from '@/hooks/use-workout-logger-screen';
import { SET_TYPE_OPTIONS } from '@/hooks/use-workout-logger-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ExerciseSetRowProps = {
  palette: {
    accent: string;
    border: string;
    muted: string;
    surface: string;
    surfaceMuted: string;
  };
  set: WorkoutLoggerSetDraft;
  onFieldChange: (
    field: 'note' | 'repsText' | 'setType' | 'weightText',
    value: string
  ) => void;
  onToggleNote: () => void;
};

function getSetTypeLabel(setType: SetTypeOption): string {
  switch (setType) {
    case 'warmup':
      return 'Warmup';
    case 'drop':
      return 'Drop';
    case 'burnout':
      return 'Burnout';
    default:
      return 'Working';
  }
}

export function ExerciseSetRow({
  palette,
  set,
  onFieldChange,
  onToggleNote,
}: ExerciseSetRowProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.surfaceMuted,
          borderColor: palette.border,
        },
      ]}>
      <View style={styles.chipRow}>
        {SET_TYPE_OPTIONS.map((setType) => {
          const isActive = set.setType === setType;

          return (
            <Pressable
              key={setType}
              accessibilityRole="button"
              accessibilityLabel={`Set type ${getSetTypeLabel(setType)}`}
              onPress={() => onFieldChange('setType', setType)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? palette.accent : 'transparent',
                  borderColor: isActive ? palette.accent : palette.border,
                },
              ]}>
              <ThemedText
                style={[
                  styles.chipText,
                  {
                    color: isActive ? '#151718' : palette.muted,
                  },
                ]}>
                {getSetTypeLabel(setType)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.fieldRow}>
        <View style={styles.fieldBlock}>
          <ThemedText style={[styles.fieldLabel, { color: palette.muted }]}>Weight</ThemedText>
          <TextInput
            accessibilityLabel="Set weight"
            placeholder="125"
            placeholderTextColor={palette.muted}
            style={[
              styles.input,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
                color: theme.text,
              },
            ]}
            value={set.weightText}
            onChangeText={(value) => onFieldChange('weightText', value)}
          />
        </View>

        <View style={styles.fieldBlock}>
          <ThemedText style={[styles.fieldLabel, { color: palette.muted }]}>Reps</ThemedText>
          <TextInput
            accessibilityLabel="Set reps"
            placeholder="8"
            placeholderTextColor={palette.muted}
            style={[
              styles.input,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
                color: theme.text,
              },
            ]}
            value={set.repsText}
            onChangeText={(value) => onFieldChange('repsText', value)}
          />
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={onToggleNote} style={styles.noteToggle}>
        <ThemedText style={[styles.noteToggleText, { color: palette.accent }]}>
          {set.isNoteExpanded || set.note.trim() ? 'Hide set note' : 'Add set note'}
        </ThemedText>
      </Pressable>

      {(set.isNoteExpanded || set.note.trim()) && (
        <TextInput
          accessibilityLabel="Set note"
          multiline
          placeholder="Optional set note"
          placeholderTextColor={palette.muted}
          style={[
            styles.noteInput,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              color: theme.text,
            },
          ]}
          value={set.note}
          onChangeText={(value) => onFieldChange('note', value)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  fieldBlock: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 88,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  noteToggle: {
    alignSelf: 'flex-start',
  },
  noteToggleText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});
