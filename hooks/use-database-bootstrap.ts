import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { bootstrapDatabase } from '@/db/bootstrap';

type BootstrapState = {
  error: Error | null;
  isReady: boolean;
};

let splashScreenPromise: Promise<void> | undefined;

function ensureSplashScreenIsPrevented(): Promise<void> {
  if (!splashScreenPromise) {
    splashScreenPromise = SplashScreen.preventAutoHideAsync()
      .then(() => undefined)
      .catch(() => undefined);
  }

  return splashScreenPromise;
}

export function useDatabaseBootstrap(): BootstrapState {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeDatabase(): Promise<void> {
      try {
        await ensureSplashScreenIsPrevented();
        await bootstrapDatabase();

        if (isMounted) {
          setIsReady(true);
        }
      } catch (bootstrapError) {
        if (isMounted) {
          setError(
            bootstrapError instanceof Error
              ? bootstrapError
              : new Error('Database bootstrap failed.')
          );
        }
      } finally {
        await SplashScreen.hideAsync()
          .then(() => undefined)
          .catch(() => undefined);
      }
    }

    void initializeDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  return { error, isReady };
}