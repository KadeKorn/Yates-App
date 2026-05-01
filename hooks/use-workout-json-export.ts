import { useCallback, useState } from 'react';

import {
  exportWorkoutDataToJsonFile,
  type WorkoutJsonExportResult,
} from '@/lib/export/workout-json-export';

type WorkoutJsonExportStatus = 'idle' | 'exporting' | 'success' | 'error';

type WorkoutJsonExportState = {
  error: Error | null;
  exportJsonBackup: () => Promise<void>;
  isExporting: boolean;
  result: WorkoutJsonExportResult | null;
  status: WorkoutJsonExportStatus;
};

export function useWorkoutJsonExport(): WorkoutJsonExportState {
  const [status, setStatus] = useState<WorkoutJsonExportStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<WorkoutJsonExportResult | null>(null);

  const exportJsonBackup = useCallback(async () => {
    try {
      setStatus('exporting');
      setError(null);
      setResult(null);

      const exportResult = await exportWorkoutDataToJsonFile();

      setResult(exportResult);
      setStatus('success');
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError
          : new Error('Unable to export workout data.')
      );
      setStatus('error');
    }
  }, []);

  return {
    status,
    error,
    result,
    isExporting: status === 'exporting',
    exportJsonBackup,
  };
}
