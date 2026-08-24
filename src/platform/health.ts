import { BodyMeasurement, HealthSampleRef, WorkoutSession } from '@/src/domain/types';

export type HealthImportResult = {
  available: boolean;
  provider?: 'healthkit' | 'health-connect';
  measurements: BodyMeasurement[];
  workouts: WorkoutSession[];
  refs: HealthSampleRef[];
  message: string;
};

export { importHealthData } from './health-provider';
