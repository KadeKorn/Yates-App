import type { ProgressionConfig } from '@/data/progression-defaults';

export type ProgressionSuggestion = {
  label: 'Hold weight' | 'Increase weight' | 'Match and beat reps';
  targetRepRangeText: string;
};

type ProgressionSuggestionInput = {
  config: ProgressionConfig;
  repsText: string;
};

function parseStrictNumericReps(repsText: string): number | null {
  const normalizedText = repsText.trim();

  if (!/^\d+$/.test(normalizedText)) {
    return null;
  }

  const parsedReps = Number.parseInt(normalizedText, 10);

  if (!Number.isFinite(parsedReps)) {
    return null;
  }

  return parsedReps;
}

export function getProgressionSuggestion(
  input: ProgressionSuggestionInput
): ProgressionSuggestion | null {
  const parsedReps = parseStrictNumericReps(input.repsText);

  if (parsedReps === null) {
    return null;
  }

  if (parsedReps < input.config.targetRepMin) {
    return {
      label: 'Hold weight',
      targetRepRangeText: `${input.config.targetRepMin}-${input.config.targetRepMax} reps`,
    };
  }

  if (parsedReps >= input.config.targetRepMax) {
    return {
      label: 'Increase weight',
      targetRepRangeText: `${input.config.targetRepMin}-${input.config.targetRepMax} reps`,
    };
  }

  return {
    label: 'Match and beat reps',
    targetRepRangeText: `${input.config.targetRepMin}-${input.config.targetRepMax} reps`,
  };
}
