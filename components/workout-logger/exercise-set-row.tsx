import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SetTypeOption, WorkoutLoggerSetDraft } from '@/hooks/use-workout-logger-screen';
import { SET_TYPE_OPTIONS } from '@/hooks/use-workout-logger-screen';

type ExerciseSetRowProps = {
  palette: {
    accent: string;
    border: string;
    muted: string;
    surface: string;
    surfaceMuted: string;
  };
  set: WorkoutLoggerSetDraft;
  onFieldFocus: (input: TextInput | null) => void;
  onFieldChange: (
    field: 'note' | 'repsText' | 'setType' | 'weightText',
    value: string
  ) => void;
  onRemove: () => void;
  onToggleNote: () => void;
};

function getSetTypeLabel(setType: SetTypeOption): string {
  switch (setType) {
    case 'warmup':
      return 'Warmup';
    case 'burnout':
      return 'Burnout';
    default:
      return 'Working';
  }
}

export function ExerciseSetRow({
  palette,
  set,
  onFieldFocus,
  onFieldChange,
  onRemove,
  onToggleNote,
}: ExerciseSetRowProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const weightInputRef = useRef<TextInput | null>(null);
  const repsInputRef = useRef<TextInput | null>(null);
  const noteInputRef = useRef<TextInput | null>(null);

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
            onFocus={() => onFieldFocus(weightInputRef.current)}
            ref={weightInputRef}
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
            onFocus={() => onFieldFocus(repsInputRef.current)}
            ref={repsInputRef}
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable accessibilityRole="button" onPress={onToggleNote} style={styles.noteToggle}>
          <ThemedText style={[styles.noteToggleText, { color: palette.accent }]}>
            {set.isNoteExpanded || set.note.trim() ? 'Hide set note' : 'Add set note'}
          </ThemedText>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={onRemove} style={styles.removeButton}>
          <ThemedText style={[styles.removeText, { color: palette.muted }]}>Remove set</ThemedText>
        </Pressable>
      </View>

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
          onFocus={() => onFieldFocus(noteInputRef.current)}
          ref={noteInputRef}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    gap: 10,
    padding: 12,
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
    gap: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
    minHeight: 36,
    justifyContent: 'center',
  },
  noteToggleText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  removeButton: {
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
