import { HealthImportResult } from './health';

export async function importHealthData(): Promise<HealthImportResult> {
  return { available: false, measurements: [], workouts: [], refs: [], message: 'HealthKit / Health ConnectはiOS・Android版で利用できます。' };
}
