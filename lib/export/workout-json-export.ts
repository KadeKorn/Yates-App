import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { bootstrapDatabase } from '@/db/bootstrap';
import { JsonExportRepository, type WorkoutJsonExportData } from '@/db/export';

const APP_NAME = 'HIT Log';
const EXPORT_VERSION = 1;
const EXPORT_SOURCE = 'local-sqlite';

export type WorkoutJsonExportMetadata = {
  appName: string;
  exportedAt: string;
  exportVersion: number;
  source: string;
};

export type WorkoutJsonExportPayload = {
  data: WorkoutJsonExportData;
  metadata: WorkoutJsonExportMetadata;
};

export type WorkoutJsonExportCounts = {
  exerciseLogs: number;
  exerciseSets: number;
  workoutLogs: number;
  workoutTemplateExercises: number;
  workoutTemplates: number;
};

export type WorkoutJsonExportResult = {
  counts: WorkoutJsonExportCounts;
  fileName: string;
  fileUri: string;
};

function createExportFileName(exportedAt: string): string {
  const safeTimestamp = exportedAt.replace(/[:.]/g, '-');

  return `hit-log-export-${safeTimestamp}.json`;
}

function getCounts(data: WorkoutJsonExportData): WorkoutJsonExportCounts {
  return {
    workoutTemplates: data.workoutTemplates.length,
    workoutTemplateExercises: data.workoutTemplateExercises.length,
    workoutLogs: data.workoutLogs.length,
    exerciseLogs: data.exerciseLogs.length,
    exerciseSets: data.exerciseSets.length,
  };
}

export async function buildWorkoutJsonExportPayload(): Promise<WorkoutJsonExportPayload> {
  const database = await bootstrapDatabase();
  const exportRepository = new JsonExportRepository(database);
  const data = await exportRepository.getWorkoutJsonExportData();
  const exportedAt = new Date().toISOString();

  return {
    metadata: {
      appName: APP_NAME,
      exportVersion: EXPORT_VERSION,
      exportedAt,
      source: EXPORT_SOURCE,
    },
    data,
  };
}

export async function exportWorkoutDataToJsonFile(): Promise<WorkoutJsonExportResult> {
  const payload = await buildWorkoutJsonExportPayload();
  const fileName = createExportFileName(payload.metadata.exportedAt);
  const file = new File(Paths.document, fileName);
  const json = JSON.stringify(payload, null, 2);

  file.create();
  file.write(json);

  const isSharingAvailable = await Sharing.isAvailableAsync();

  if (!isSharingAvailable) {
    throw new Error('The native share sheet is not available on this device.');
  }

  await Sharing.shareAsync(file.uri, {
    UTI: 'public.json',
    mimeType: 'application/json',
  });

  return {
    fileName,
    fileUri: file.uri,
    counts: getCounts(payload.data),
  };
}
