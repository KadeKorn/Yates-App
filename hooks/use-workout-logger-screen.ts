import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getProgressionConfig } from '@/data/progression-defaults';
import { bootstrapDatabase } from '@/db/bootstrap';
import {
  ExerciseLogRepository,
  TemplateRepository,
  WorkoutLoggerRepository,
} from '@/db/repositories';
import type { LatestExercisePerformance } from '@/db/repositories/exercise-log-repository';
import type {
  ActiveTemplateExercise,
  ActiveWorkoutTemplateDetail,
} from '@/db/repositories/template-repository';
import type {
  SaveWorkoutDraftInput,
  WorkoutLoggerDraft,
} from '@/db/repositories/workout-logger-repository';
import { getProgressionSuggestion, type ProgressionSuggestion } from '@/lib/progression/get-progression-suggestion';

export const SET_TYPE_OPTIONS = ['working','burnout', 'warmup'] as const;

export type SetTypeOption = (typeof SET_TYPE_OPTIONS)[number];

export type WorkoutLoggerSetDraft = {
  id: string;
  isNoteExpanded: boolean;
  note: string;
  repsText: string;
  setType: SetTypeOption;
  weightText: string;
};

export type WorkoutLoggerExerciseDraft = {
  id: string;
  isNoteExpanded: boolean;
  name: string;
  notes: string;
  orderIndex: number;
  sets: WorkoutLoggerSetDraft[];
  templateExerciseId: string;
};

type SaveWorkoutParams = {
  onComplete?: () => void;
};

type UseWorkoutLoggerScreenResult = {
  error: Error | null;
  exercises: WorkoutLoggerExerciseDraft[];
  isLoading: boolean;
  isSaving: boolean;
  latestPerformanceByExerciseId: Record<string, LatestExercisePerformance>;
  progressionSuggestionByExerciseId: Record<string, ProgressionSuggestion>;
  saveError: string | null;
  template: ActiveWorkoutTemplateDetail | null;
  addSet: (exerciseId: string) => void;
  dismissSaveError: () => void;
  removeSet: (exerciseId: string, setId: string) => void;
  flushDraftSave: () => Promise<void>;
  saveWorkout: (params?: SaveWorkoutParams) => Promise<void>;
  toggleExerciseNote: (exerciseId: string) => void;
  toggleSetNote: (exerciseId: string, setId: string) => void;
  updateExerciseNotes: (exerciseId: string, value: string) => void;
  updateSetField: (
    exerciseId: string,
    setId: string,
    field: 'note' | 'repsText' | 'setType' | 'weightText',
    value: string
  ) => void;
};

function createDraftId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptySetDraft(copyFrom?: WorkoutLoggerSetDraft): WorkoutLoggerSetDraft {
  return {
    id: createDraftId('set-draft'),
    setType: copyFrom?.setType ?? 'working',
    weightText: '',
    repsText: '',
    note: '',
    isNoteExpanded: copyFrom?.isNoteExpanded ?? false,
  };
}

function createExerciseDraft(exercise: ActiveTemplateExercise): WorkoutLoggerExerciseDraft {
  return {
    id: createDraftId('exercise-draft'),
    templateExerciseId: exercise.id,
    name: exercise.name,
    orderIndex: exercise.orderIndex,
    notes: '',
    isNoteExpanded: false,
    sets: [createEmptySetDraft()],
  };
}

function createSetDraftFromSavedSet(
  set: WorkoutLoggerDraft['exercises'][number]['sets'][number]
): WorkoutLoggerSetDraft {
  return {
    id: createDraftId('set-draft'),
    setType: SET_TYPE_OPTIONS.includes(set.setType as SetTypeOption)
      ? (set.setType as SetTypeOption)
      : 'working',
    weightText: set.weightText,
    repsText: set.repsText,
    note: set.note ?? '',
    isNoteExpanded: false,
  };
}

function createExerciseDraftFromTemplateAndDraft(
  exercise: ActiveTemplateExercise,
  draftExercise: WorkoutLoggerDraft['exercises'][number] | null
): WorkoutLoggerExerciseDraft {
  if (!draftExercise) {
    return createExerciseDraft(exercise);
  }

  const restoredSets = draftExercise.sets
    .sort((left, right) => left.setIndex - right.setIndex)
    .map(createSetDraftFromSavedSet);

  return {
    id: createDraftId('exercise-draft'),
    templateExerciseId: exercise.id,
    name: exercise.name,
    orderIndex: exercise.orderIndex,
    notes: draftExercise.notes ?? '',
    isNoteExpanded: false,
    sets: restoredSets.length > 0 ? restoredSets : [createEmptySetDraft()],
  };
}

function createExerciseDraftsFromTemplateAndDraft(
  templateExercises: ActiveTemplateExercise[],
  draft: WorkoutLoggerDraft | null
): WorkoutLoggerExerciseDraft[] {
  const draftExerciseByTemplateExerciseId = new Map(
    draft?.exercises.map((exercise) => [exercise.templateExerciseId, exercise]) ?? []
  );

  return templateExercises.map((exercise) =>
    createExerciseDraftFromTemplateAndDraft(
      exercise,
      draftExerciseByTemplateExerciseId.get(exercise.id) ?? null
    )
  );
}

function normalizeOptionalText(value: string): string | null {
  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

function hasMeaningfulSetData(set: WorkoutLoggerSetDraft): boolean {
  return (
    set.weightText.trim().length > 0 ||
    set.repsText.trim().length > 0 ||
    set.note.trim().length > 0
  );
}

function hasMeaningfulExerciseData(exercise: WorkoutLoggerExerciseDraft): boolean {
  return (
    exercise.notes.trim().length > 0 ||
    exercise.sets.some(hasMeaningfulSetData)
  );
}

function hasMeaningfulWorkoutData(exercises: WorkoutLoggerExerciseDraft[]): boolean {
  return exercises.some(hasMeaningfulExerciseData);
}

function isValidSetDraft(set: WorkoutLoggerSetDraft): boolean {
  return set.weightText.trim().length > 0 && set.repsText.trim().length > 0;
}

function buildDraftSaveExercises(
  exercises: WorkoutLoggerExerciseDraft[]
): SaveWorkoutDraftInput['exercises'] {
  return exercises
    .map((exercise) => ({
      exerciseName: exercise.name,
      notes: normalizeOptionalText(exercise.notes),
      orderIndex: exercise.orderIndex,
      templateExerciseId: exercise.templateExerciseId,
      sets: exercise.sets
        .filter(hasMeaningfulSetData)
        .map((set) => ({
          setType: set.setType,
          weightText: set.weightText,
          repsText: set.repsText,
          note: normalizeOptionalText(set.note),
        })),
    }))
    .filter((exercise) => exercise.notes || exercise.sets.length > 0);
}

function buildCompletedSaveExercises(exercises: WorkoutLoggerExerciseDraft[]) {
  return exercises
    .map((exercise) => ({
      exerciseName: exercise.name,
      notes: normalizeOptionalText(exercise.notes),
      orderIndex: exercise.orderIndex,
      templateExerciseId: exercise.templateExerciseId,
      sets: exercise.sets
        .filter(isValidSetDraft)
        .map((set) => ({
          setType: set.setType,
          weightText: set.weightText.trim(),
          repsText: set.repsText.trim(),
          note: normalizeOptionalText(set.note),
        })),
    }))
    .filter((exercise) => exercise.sets.length > 0);
}

function buildProgressionSuggestionByExerciseId(
  templateExercises: ActiveTemplateExercise[],
  latestWorkingSetByExerciseId: Record<
    string,
    {
      repsText: string;
    }
  >
): Record<string, ProgressionSuggestion> {
  const suggestions: Record<string, ProgressionSuggestion> = {};

  for (const exercise of templateExercises) {
    const latestWorkingSet = latestWorkingSetByExerciseId[exercise.id];

    if (!latestWorkingSet) {
      continue;
    }

    const suggestion = getProgressionSuggestion({
      config: getProgressionConfig(exercise.id),
      repsText: latestWorkingSet.repsText,
    });

    if (suggestion) {
      suggestions[exercise.id] = suggestion;
    }
  }

  return suggestions;
}

export function useWorkoutLoggerScreen(templateId: string): UseWorkoutLoggerScreenResult {
  const isFocused = useIsFocused();
  const [template, setTemplate] = useState<ActiveWorkoutTemplateDetail | null>(null);
  const [exercises, setExercises] = useState<WorkoutLoggerExerciseDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [latestPerformanceByExerciseId, setLatestPerformanceByExerciseId] = useState<
    Record<string, LatestExercisePerformance>
  >({});
  const [progressionSuggestionByExerciseId, setProgressionSuggestionByExerciseId] = useState<
    Record<string, ProgressionSuggestion>
  >({});
  const [error, setError] = useState<Error | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDraftSaveRef = useRef<Promise<void> | null>(null);
  const skipNextAutosaveRef = useRef(true);
  const isCompletingWorkoutRef = useRef(false);
  const templateRef = useRef<ActiveWorkoutTemplateDetail | null>(null);
  const exercisesRef = useRef<WorkoutLoggerExerciseDraft[]>([]);

  useEffect(() => {
    templateRef.current = template;
  }, [template]);

  useEffect(() => {
    exercisesRef.current = exercises;
  }, [exercises]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let isMounted = true;

    async function loadTemplate(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);
        setSaveError(null);

        const database = await bootstrapDatabase();
        const templateRepository = new TemplateRepository(database);
        const exerciseLogRepository = new ExerciseLogRepository(database);
        const workoutLoggerRepository = new WorkoutLoggerRepository(database);
        const loadedTemplate = await templateRepository.getActiveTemplateById(templateId);

        if (!isMounted) {
          return;
        }

        if (!loadedTemplate) {
          setTemplate(null);
          setExercises([]);
          setLatestPerformanceByExerciseId({});
          setProgressionSuggestionByExerciseId({});
          setError(new Error('Workout template not found.'));
          return;
        }

        const templateExerciseIds = loadedTemplate.exercises.map((exercise) => exercise.id);
        const [latestPerformance, latestWorkingSetByExerciseId] = await Promise.all([
          exerciseLogRepository.getLatestPerformanceByTemplateExerciseIds(templateExerciseIds),
          exerciseLogRepository.getLatestWorkingSetByTemplateExerciseIds(templateExerciseIds),
        ]);
        const activeDraft = await workoutLoggerRepository.getActiveDraftByTemplateId(templateId);

        if (!isMounted) {
          return;
        }

        skipNextAutosaveRef.current = true;
        isCompletingWorkoutRef.current = false;
        setTemplate(loadedTemplate);
        setExercises(createExerciseDraftsFromTemplateAndDraft(loadedTemplate.exercises, activeDraft));
        setLatestPerformanceByExerciseId(latestPerformance);
        setProgressionSuggestionByExerciseId(
          buildProgressionSuggestionByExerciseId(
            loadedTemplate.exercises,
            latestWorkingSetByExerciseId
          )
        );
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setProgressionSuggestionByExerciseId({});
        setError(
          loadError instanceof Error ? loadError : new Error('Unable to load the workout logger.')
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTemplate();

    return () => {
      isMounted = false;
    };
  }, [isFocused, templateId]);

  const persistDraft = useCallback(
    async (
      templateToSave: ActiveWorkoutTemplateDetail | null,
      exercisesToSave: WorkoutLoggerExerciseDraft[]
    ): Promise<void> => {
      if (!templateToSave || isCompletingWorkoutRef.current) {
        return;
      }

      const database = await bootstrapDatabase();
      const workoutLoggerRepository = new WorkoutLoggerRepository(database);

      if (!hasMeaningfulWorkoutData(exercisesToSave)) {
        await workoutLoggerRepository.deleteActiveDraftByTemplateId(templateToSave.id);
        return;
      }

      await workoutLoggerRepository.saveDraft({
        templateId: templateToSave.id,
        startedAt: new Date().toISOString(),
        exercises: buildDraftSaveExercises(exercisesToSave),
      });
    },
    []
  );

  const flushDraftSave = useCallback(async (): Promise<void> => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }

    const pendingDraftSave = pendingDraftSaveRef.current;

    if (pendingDraftSave) {
      await pendingDraftSave;
    }

    if (!skipNextAutosaveRef.current) {
      const draftSave = persistDraft(templateRef.current, exercisesRef.current).finally(() => {
        if (pendingDraftSaveRef.current === draftSave) {
          pendingDraftSaveRef.current = null;
        }
      });

      pendingDraftSaveRef.current = draftSave;
      await draftSave;
    }
  }, [persistDraft]);

  useEffect(() => {
    if (!template || isLoading) {
      return;
    }

    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      autosaveTimeoutRef.current = null;

      const draftSave = persistDraft(templateRef.current, exercisesRef.current)
        .catch((draftSaveError) => {
          console.error('Unable to autosave workout draft.', draftSaveError);
        })
        .finally(() => {
          if (pendingDraftSaveRef.current === draftSave) {
            pendingDraftSaveRef.current = null;
          }
        });

      pendingDraftSaveRef.current = draftSave;
    }, 650);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    };
  }, [exercises, isLoading, persistDraft, template]);

  function updateExercise(
    exerciseId: string,
    updater: (exercise: WorkoutLoggerExerciseDraft) => WorkoutLoggerExerciseDraft
  ): void {
    setExercises((currentExercises) =>
      currentExercises.map((exercise) =>
        exercise.id === exerciseId ? updater(exercise) : exercise
      )
    );
  }

  function updateSetField(
    exerciseId: string,
    setId: string,
    field: 'note' | 'repsText' | 'setType' | 'weightText',
    value: string
  ): void {
    if (field === 'setType' && !SET_TYPE_OPTIONS.includes(value as SetTypeOption)) {
      return;
    }

    setSaveError(null);

    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) =>
        set.id === setId
          ? {
              ...set,
              [field]: value,
            }
          : set
      ),
    }));
  }

  function updateExerciseNotes(exerciseId: string, value: string): void {
    setSaveError(null);

    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      notes: value,
    }));
  }

  function addSet(exerciseId: string): void {
    setSaveError(null);

    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: [...exercise.sets, createEmptySetDraft(exercise.sets[exercise.sets.length - 1])],
    }));
  }

  function removeSet(exerciseId: string, setId: string): void {
    setSaveError(null);

    updateExercise(exerciseId, (exercise) => {
      if (exercise.sets.length <= 1) {
        return {
          ...exercise,
          sets: [createEmptySetDraft()],
        };
      }

      const remainingSets = exercise.sets.filter((set) => set.id !== setId);

      return {
        ...exercise,
        sets: remainingSets.length > 0 ? remainingSets : [createEmptySetDraft()],
      };
    });
  }

  function toggleExerciseNote(exerciseId: string): void {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      isNoteExpanded: !exercise.isNoteExpanded,
    }));
  }

  function toggleSetNote(exerciseId: string, setId: string): void {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) =>
        set.id === setId
          ? {
              ...set,
              isNoteExpanded: !set.isNoteExpanded,
            }
          : set
      ),
    }));
  }

  function dismissSaveError(): void {
    setSaveError(null);
  }

  async function saveWorkout(params?: SaveWorkoutParams): Promise<void> {
    if (!template || isSaving) {
      return;
    }

    const exercisesToSave = buildCompletedSaveExercises(exercises);

    const totalValidSets = exercisesToSave.reduce((count, exercise) => count + exercise.sets.length, 0);

    if (totalValidSets === 0) {
      setSaveError('Add at least one set with weight and reps before completing the workout.');
      return;
    }

    try {
      isCompletingWorkoutRef.current = true;
      setIsSaving(true);
      setSaveError(null);
      await flushDraftSave();

      const database = await bootstrapDatabase();
      const workoutLoggerRepository = new WorkoutLoggerRepository(database);
      const savedAt = new Date().toISOString();

      await workoutLoggerRepository.completeWorkout({
        templateId: template.id,
        templateName: template.name,
        startedAt: savedAt,
        completedAt: savedAt,
        status: 'completed',
        exercises: exercisesToSave,
      });

      params?.onComplete?.();
    } catch (saveWorkoutError) {
      setSaveError(
        saveWorkoutError instanceof Error
          ? saveWorkoutError.message
          : 'Unable to complete the workout right now.'
      );
    } finally {
      setIsSaving(false);
      isCompletingWorkoutRef.current = false;
    }
  }

  return {
    template,
    exercises,
    isLoading,
    isSaving,
    latestPerformanceByExerciseId,
    progressionSuggestionByExerciseId,
    error,
    saveError,
    addSet,
    dismissSaveError,
    flushDraftSave,
    removeSet,
    saveWorkout,
    toggleExerciseNote,
    toggleSetNote,
    updateExerciseNotes,
    updateSetField,
  };
}
