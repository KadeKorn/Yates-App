export const PLAN_C_TEMPLATE_IDS = {
  day1: 'seed-template-day1',
  day2: 'seed-template-day2',
  day5: 'seed-template-day5',
} as const;

export const PLAN_C_EXERCISE_IDS = {
  day1ChestPress: 'seed-exercise-day1-chest-press',
  day1ChestFly: 'seed-exercise-day1-chest-fly',
  day1SeatedRow: 'seed-exercise-day1-seated-row',
  day1LatPulldown: 'seed-exercise-day1-lat-pulldown',
  day1AbRotationMachine: 'seed-exercise-day1-ab-rotation-machine',
  day1DbShrugs: 'seed-exercise-day1-db-shrugs',
  day1BackExtensions: 'seed-exercise-day1-back-extensions',
  day2BulgarianSplitSquat: 'seed-exercise-day2-bulgarian-split-squat',
  day2LegExtension: 'seed-exercise-day2-leg-extension',
  day2SeatedLegCurl: 'seed-exercise-day2-seated-leg-curl',
  day2SeatedLegPress: 'seed-exercise-day2-seated-leg-press',
  day2CalfRaise: 'seed-exercise-day2-calf-raise',
  day5OverheadPress: 'seed-exercise-day5-overhead-press',
  day5LateralRaise: 'seed-exercise-day5-lateral-raise',
  day5Triceps: 'seed-exercise-day5-triceps',
  day5DbCurls: 'seed-exercise-day5-db-curls',
  day5CurlMachine: 'seed-exercise-day5-curl-machine',
} as const;

export type SeedTemplateRecord = {
  code: string;
  id: string;
  isActive: boolean;
  name: string;
  orderIndex: number;
};

export type SeedTemplateExerciseRecord = {
  id: string;
  isActive: boolean;
  name: string;
  orderIndex: number;
  templateId: string;
};

export const planCTemplateSeeds: readonly SeedTemplateRecord[] = [
  {
    id: PLAN_C_TEMPLATE_IDS.day1,
    code: 'day1',
    name: 'Day 1 - Chest + Back',
    orderIndex: 1,
    isActive: true,
  },
  {
    id: PLAN_C_TEMPLATE_IDS.day2,
    code: 'day2',
    name: 'Day 2 - Legs',
    orderIndex: 2,
    isActive: true,
  },
  {
    id: PLAN_C_TEMPLATE_IDS.day5,
    code: 'day3',
    name: 'Day 3 - Shoulders + Arms',
    orderIndex: 3,
    isActive: true,
  },
] as const;

export const planCTemplateExerciseSeeds: readonly SeedTemplateExerciseRecord[] = [
  {
    id: PLAN_C_EXERCISE_IDS.day1ChestPress,
    templateId: PLAN_C_TEMPLATE_IDS.day1,
    name: 'Chest Press',
    orderIndex: 1,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day1ChestFly,
    templateId: PLAN_C_TEMPLATE_IDS.day1,
    name: 'Chest Fly',
    orderIndex: 2,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day1SeatedRow,
    templateId: PLAN_C_TEMPLATE_IDS.day1,
    name: 'Seated Row',
    orderIndex: 3,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day1LatPulldown,
    templateId: PLAN_C_TEMPLATE_IDS.day1,
    name: 'Lat Pulldown',
    orderIndex: 4,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day1AbRotationMachine,
    templateId: PLAN_C_TEMPLATE_IDS.day1,
    name: 'Ab Rotation Machine',
    orderIndex: 5,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day1DbShrugs,
    templateId: PLAN_C_TEMPLATE_IDS.day1,
    name: 'DB Shrugs',
    orderIndex: 6,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day1BackExtensions,
    templateId: PLAN_C_TEMPLATE_IDS.day1,
    name: 'Back Extensions',
    orderIndex: 7,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day2BulgarianSplitSquat,
    templateId: PLAN_C_TEMPLATE_IDS.day2,
    name: 'Bulgarian Split Squat',
    orderIndex: 1,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day2LegExtension,
    templateId: PLAN_C_TEMPLATE_IDS.day2,
    name: 'Leg Extension',
    orderIndex: 2,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day2SeatedLegCurl,
    templateId: PLAN_C_TEMPLATE_IDS.day2,
    name: 'Seated Leg Curl',
    orderIndex: 3,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day2SeatedLegPress,
    templateId: PLAN_C_TEMPLATE_IDS.day2,
    name: 'Seated Leg Press',
    orderIndex: 4,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day2CalfRaise,
    templateId: PLAN_C_TEMPLATE_IDS.day2,
    name: 'Calf Raise',
    orderIndex: 5,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day5OverheadPress,
    templateId: PLAN_C_TEMPLATE_IDS.day5,
    name: 'Overhead Press',
    orderIndex: 1,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day5LateralRaise,
    templateId: PLAN_C_TEMPLATE_IDS.day5,
    name: 'Lateral Raise',
    orderIndex: 2,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day5Triceps,
    templateId: PLAN_C_TEMPLATE_IDS.day5,
    name: 'Triceps',
    orderIndex: 3,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day5DbCurls,
    templateId: PLAN_C_TEMPLATE_IDS.day5,
    name: 'DB Curls',
    orderIndex: 4,
    isActive: true,
  },
  {
    id: PLAN_C_EXERCISE_IDS.day5CurlMachine,
    templateId: PLAN_C_TEMPLATE_IDS.day5,
    name: 'Curl Machine',
    orderIndex: 5,
    isActive: true,
  },
] as const;
