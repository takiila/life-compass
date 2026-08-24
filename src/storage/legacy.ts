import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_STATE, createId } from '@/src/domain/defaults';
import { AppState, BodyMeasurement, RecoveryRecord, WorkoutSession } from '@/src/domain/types';

export const LEGACY_KEYS = [
  'training-compass-data-v1',
  'training-compass-economy-v1',
  'training-compass-feedback-preferences-v1',
  'training-compass-knowledge-library-v1',
  'training-compass-nebula-depths-v1',
  'training-compass-nebula-truth-v2',
  'training-compass-nebula-truth-v3',
  'training-compass-session-v1',
  'training-compass-stage-game-v1',
  'training-compass-traveler-profile-v1',
  'training-compass-backup-reminder-v1',
];

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => value && typeof value === 'object' ? value as UnknownRecord : {};
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

function legacyMeasurements(root: UnknownRecord): BodyMeasurement[] {
  const candidates = [...asArray(root.measurements), ...asArray(root.weightEntries), ...asArray(root.records)];
  return candidates.flatMap((item) => {
    const value = asRecord(item);
    const weight = Number(value.weightKg ?? value.weight);
    if (!Number.isFinite(weight) || weight <= 0) return [];
    const date = String(value.measuredAt ?? value.createdAt ?? value.date ?? new Date().toISOString());
    return [{ id: String(value.id ?? createId('legacy-weight')), measuredAt: date, weightKg: weight, source: 'legacy' as const }];
  });
}

function legacyWorkouts(root: UnknownRecord): WorkoutSession[] {
  return [...asArray(root.completedWorkouts), ...asArray(root.workouts)].map((item) => {
    const value = asRecord(item);
    const completedAt = String(value.completedAt ?? value.createdAt ?? new Date().toISOString());
    return {
      id: String(value.id ?? createId('legacy-workout')),
      startedAt: String(value.startedAt ?? completedAt),
      completedAt,
      focus: String(value.focus ?? value.title ?? '旧Training Compass'),
      minutes: Math.max(1, Number(value.minutes ?? value.durationMinutes ?? 10)),
      sets: [],
      safeCompletion: value.safeCompletion !== false,
      source: 'legacy' as const,
    };
  });
}

function legacyRecoveries(root: UnknownRecord): RecoveryRecord[] {
  return asArray(root.records).flatMap((item) => {
    const value = asRecord(item);
    const soreness = Number(value.soreness);
    if (!Number.isFinite(soreness)) return [];
    return [{
      id: String(value.id ?? createId('legacy-recovery')),
      createdAt: String(value.createdAt ?? new Date().toISOString()),
      area: 'core' as const,
      soreness: Math.max(0, Math.min(10, soreness)),
      intensity: Math.max(1, Math.min(5, Number(value.intensity ?? 3))),
      note: typeof value.note === 'string' ? value.note : undefined,
    }];
  });
}

export async function migrateLegacyState(): Promise<AppState | undefined> {
  const discovered = (await AsyncStorage.getAllKeys()).filter((key) => /^training-compass-.+-(?:v1|v2|v3)$/.test(key));
  const pairs = await AsyncStorage.multiGet([...new Set([...LEGACY_KEYS, ...discovered])]);
  const parsed = pairs.flatMap(([, value]) => {
    if (!value) return [];
    try { return [JSON.parse(value) as unknown]; } catch { return []; }
  });
  if (!parsed.length) return undefined;
  const primary = asRecord(parsed[0]);
  const profile = asRecord(primary.profile);
  const measurements = parsed.flatMap((value) => legacyMeasurements(asRecord(value)));
  const workouts = parsed.flatMap((value) => legacyWorkouts(asRecord(value)));
  const recoveries = parsed.flatMap((value) => legacyRecoveries(asRecord(value)));
  return {
    ...DEFAULT_STATE,
    onboardingComplete: Boolean(primary.onboardingComplete ?? primary.profile),
    adultConfirmed: false,
    heightCm: Number(profile.heightCm ?? primary.heightCm) || undefined,
    targetWeightKg: Number(primary.targetWeightKg ?? profile.targetWeightKg) || undefined,
    targetWeightDate: typeof primary.targetWeightDate === 'string' ? primary.targetWeightDate : undefined,
    measurements,
    workouts,
    recoveries,
    legacyMigratedAt: new Date().toISOString(),
  };
}
