import { PLAN_C_EXERCISE_IDS } from '@/db/seeds/plan-c';

export type ProgressionConfig = {
  suggestedIncrement: string;
  targetRepMax: number;
  targetRepMin: number;
};

const DEFAULT_PROGRESSION_CONFIG: ProgressionConfig = {
  targetRepMin: 8,
  targetRepMax: 10,
  suggestedIncrement: '5',
};

const progressionDefaultsByTemplateExerciseId: Record<string, ProgressionConfig> = {
  [PLAN_C_EXERCISE_IDS.day1ChestPress]: {
    targetRepMin: 8,
    targetRepMax: 10,
    suggestedIncrement: '5',
  },
  [PLAN_C_EXERCISE_IDS.day1ChestFly]: {
    targetRepMin: 8,
    targetRepMax: 10,
    suggestedIncrement: '10',
  },
  [PLAN_C_EXERCISE_IDS.day1SeatedRow]: {
    targetRepMin: 8,
    targetRepMax: 10,
    suggestedIncrement: '5',
  },
  [PLAN_C_EXERCISE_IDS.day1LatPulldown]: {
    targetRepMin: 8,
    targetRepMax: 10,
    suggestedIncrement: '5',
  },
  [PLAN_C_EXERCISE_IDS.day1AbRotationMachine]: {
    targetRepMin: 10,
    targetRepMax: 15,
    suggestedIncrement: '5',
  },
  [PLAN_C_EXERCISE_IDS.day1DbShrugs]: {
    targetRepMin: 12,
    targetRepMax: 20,
    suggestedIncrement: '5s',
  },
  [PLAN_C_EXERCISE_IDS.day1BackExtensions]: {
    targetRepMin: 12,
    targetRepMax: 20,
    suggestedIncrement: '5',
  },
  [PLAN_C_EXERCISE_IDS.day2BulgarianSplitSquat]: {
    targetRepMin: 10,
    targetRepMax: 15,
    suggestedIncrement: '5s',
  },
  [PLAN_C_EXERCISE_IDS.day2LegExtension]: {
    targetRepMin: 10,
    targetRepMax: 15,
    suggestedIncrement: '10',
  },
  [PLAN_C_EXERCISE_IDS.day2SeatedLegCurl]: {
    targetRepMin: 8,
    targetRepMax: 12,
    suggestedIncrement: '10',
  },
  [PLAN_C_EXERCISE_IDS.day2SeatedLegPress]: {
    targetRepMin: 10,
    targetRepMax: 15,
    suggestedIncrement: '25',
  },
  [PLAN_C_EXERCISE_IDS.day2CalfRaise]: {
    targetRepMin: 10,
    targetRepMax: 15,
    suggestedIncrement: '10',
  },
  [PLAN_C_EXERCISE_IDS.day5OverheadPress]: {
    targetRepMin: 8,
    targetRepMax: 10,
    suggestedIncrement: '5',
  },
  [PLAN_C_EXERCISE_IDS.day5LateralRaise]: {
    targetRepMin: 10,
    targetRepMax: 15,
    suggestedIncrement: '5s',
  },
  [PLAN_C_EXERCISE_IDS.day5Triceps]: {
    targetRepMin: 8,
    targetRepMax: 12,
    suggestedIncrement: '5',
  },
  [PLAN_C_EXERCISE_IDS.day5DbCurls]: {
    targetRepMin: 8,
    targetRepMax: 12,
    suggestedIncrement: '5s',
  },
  [PLAN_C_EXERCISE_IDS.day5RearDeltMachine]: {
    targetRepMin: 10,
    targetRepMax: 15,
    suggestedIncrement: '10',
  },
  [PLAN_C_EXERCISE_IDS.day5CurlMachine]: {
    targetRepMin: 8,
    targetRepMax: 12,
    suggestedIncrement: '5',
  },
};

export function getProgressionConfig(templateExerciseId: string): ProgressionConfig {
  return progressionDefaultsByTemplateExerciseId[templateExerciseId] ?? DEFAULT_PROGRESSION_CONFIG;
}
