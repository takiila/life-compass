import { Platform } from 'react-native';

import { createId } from '@/src/domain/defaults';
import { HealthImportResult } from './health';

export async function importHealthData(since = new Date(Date.now() - 28 * 86_400_000)): Promise<HealthImportResult> {
  if (Platform.OS === 'android') {
    try {
      const health = await import('react-native-health-connect');
      await health.initialize();
      await health.requestPermission([
        { accessType: 'read', recordType: 'Weight' },
        { accessType: 'read', recordType: 'ExerciseSession' },
      ]);
      const range = { operator: 'between' as const, startTime: since.toISOString(), endTime: new Date().toISOString() };
      const weights = await health.readRecords('Weight', { timeRangeFilter: range });
      const exercises = await health.readRecords('ExerciseSession', { timeRangeFilter: range });
      const importedAt = new Date().toISOString();
      return {
        available: true,
        provider: 'health-connect',
        measurements: weights.records.map((sample) => ({ id: createId('hc-weight'), measuredAt: sample.time, weightKg: sample.weight.inKilograms, source: 'health-connect', externalId: sample.metadata?.id ?? `weight:${sample.time}:${sample.weight.inKilograms}` })),
        workouts: exercises.records.map((sample) => ({ id: createId('hc-workout'), startedAt: sample.startTime, completedAt: sample.endTime, focus: sample.exerciseType ? `Health Connect: ${sample.exerciseType}` : 'Health Connect workout', minutes: Math.max(1, Math.round((new Date(sample.endTime).getTime() - new Date(sample.startTime).getTime()) / 60_000)), sets: [], safeCompletion: true, source: 'health-connect', externalId: sample.metadata?.id ?? `workout:${sample.startTime}:${sample.endTime}:${sample.exerciseType}` })),
        refs: [
          ...weights.records.map((sample) => ({ externalId: sample.metadata?.id ?? `weight:${sample.time}:${sample.weight.inKilograms}`, provider: 'health-connect' as const, sampleType: 'weight' as const, importedAt })),
          ...exercises.records.map((sample) => ({ externalId: sample.metadata?.id ?? `workout:${sample.startTime}:${sample.endTime}:${sample.exerciseType}`, provider: 'health-connect' as const, sampleType: 'workout' as const, importedAt })),
        ],
        message: '許可された体重とワークアウトを読み取りました。書き込みは行っていません。',
      };
    } catch (error) {
      return { available: false, measurements: [], workouts: [], refs: [], message: `Health Connectを読み取れませんでした: ${error instanceof Error ? error.message : 'unknown error'}` };
    }
  }
  if (Platform.OS === 'ios') {
    try {
      const healthkit = await import('@kingstinct/react-native-healthkit');
      await healthkit.requestAuthorization({ toRead: ['HKQuantityTypeIdentifierBodyMass', 'HKWorkoutTypeIdentifier'] });
      const filter = { date: { startDate: since, endDate: new Date() } };
      const weights = await healthkit.queryQuantitySamples('HKQuantityTypeIdentifierBodyMass', { filter, limit: -1, ascending: true, unit: 'kg' });
      const workouts = await healthkit.queryWorkoutSamples({ filter, limit: -1, ascending: true });
      const importedAt = new Date().toISOString();
      return {
        available: true,
        provider: 'healthkit',
        measurements: weights.map((sample) => ({ id: createId('hk-weight'), measuredAt: sample.startDate.toISOString(), weightKg: sample.quantity, source: 'healthkit', externalId: sample.uuid })),
        workouts: workouts.map((sample) => ({ id: createId('hk-workout'), startedAt: sample.startDate.toISOString(), completedAt: sample.endDate.toISOString(), focus: `HealthKit: ${sample.workoutActivityType}`, minutes: Math.max(1, Math.round((sample.endDate.getTime() - sample.startDate.getTime()) / 60_000)), sets: [], safeCompletion: true, source: 'healthkit', externalId: sample.uuid })),
        refs: [
          ...weights.map((sample) => ({ externalId: sample.uuid, provider: 'healthkit' as const, sampleType: 'weight' as const, importedAt })),
          ...workouts.map((sample) => ({ externalId: sample.uuid, provider: 'healthkit' as const, sampleType: 'workout' as const, importedAt })),
        ],
        message: '許可された体重とワークアウトを読み取りました。書き込みは行っていません。',
      };
    } catch (error) {
      return { available: false, measurements: [], workouts: [], refs: [], message: `HealthKitを読み取れませんでした: ${error instanceof Error ? error.message : 'unknown error'}` };
    }
  }
  return { available: false, measurements: [], workouts: [], refs: [], message: 'このOSでは健康データ連携を利用できません。' };
}
