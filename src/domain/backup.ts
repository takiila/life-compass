import { z } from 'zod';

import { DEFAULT_STATE, createId } from './defaults';
import { AppBackupV3, AppState, BodyMeasurement, WorkoutSession } from './types';

const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'invalid date');
const id = z.string().min(1).max(160);
const score = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
const trainingCondition = z.object({ sleepQuality: score, fatigue: score, mood: score, soreness: z.number().min(0).max(10), urgentSymptom: z.boolean() });
const planItem = z.object({
  id,
  category: z.enum(['training', 'recovery', 'nutrition', 'sleep', 'measurement', 'reflection']),
  tier: z.enum(['minimum', 'ideal', 'optional']),
  title: z.string().min(1).max(240),
  description: z.string().max(1000).optional(),
  completedAt: dateString.optional(),
  source: z.enum(['generated', 'user-edited']),
});
const weeklyLevel = z.enum(['lighter', 'maintain', 'slightly-more']);

const stateSchema = z.object({
  schemaVersion: z.literal(3), mode: z.enum(['study', 'training']), onboardingComplete: z.boolean(), adultConfirmed: z.boolean(),
  environment: z.object({ pwaInstalled: z.boolean(), materialPlaced: z.boolean(), trainingGearPlaced: z.boolean(), cueTime: z.string().max(20).optional() }),
  studyGoal: z.object({ qualificationName: z.string().min(1).max(160), targetDate: dateString.optional(), material: z.string().min(1).max(500), smallestAction: z.string().min(1).max(500), weeklyMinutes: z.number().int().min(10).max(10_080), topics: z.array(z.object({ id, name: z.string().min(1).max(120), progress: z.number().min(0).max(100) })).max(100) }).optional(),
  heightCm: z.number().positive().max(260).optional(), targetWeightKg: z.number().positive().max(500).optional(), targetWeightDate: dateString.optional(),
  checkIns: z.array(z.object({ id, mode: z.enum(['study', 'training']), createdAt: dateString, energy: score, availableMinutes: z.union([z.literal(2), z.literal(5), z.literal(10), z.literal(15), z.literal(25), z.literal(35)]), note: z.string().max(1000).optional(), training: trainingCondition.optional() })).max(100_000),
  studySessions: z.array(z.object({ id, startedAt: dateString, minutes: z.number().int().min(1).max(1440), topic: z.string().max(120).optional(), note: z.string().max(2000).optional(), completed: z.boolean() })).max(100_000),
  measurements: z.array(z.object({ id, measuredAt: dateString, weightKg: z.number().positive().max(500), source: z.enum(['manual', 'healthkit', 'health-connect', 'legacy']), externalId: z.string().max(240).optional() })).max(100_000),
  workouts: z.array(z.object({ id, startedAt: dateString, completedAt: dateString, focus: z.string().min(1).max(240), minutes: z.number().int().min(1).max(1440), sets: z.array(z.object({ reps: z.number().int().min(0).max(10_000), weightKg: z.number().min(0).max(2000).optional(), rpe: z.number().min(0).max(10) })).max(1000), safeCompletion: z.boolean(), source: z.enum(['manual', 'healthkit', 'health-connect', 'legacy']), externalId: z.string().max(240).optional() })).max(100_000),
  recoveries: z.array(z.object({ id, createdAt: dateString, area: z.enum(['chest', 'back', 'legs', 'shoulders', 'arms', 'core']), soreness: z.number().min(0).max(10), intensity: z.number().min(0).max(10), note: z.string().max(2000).optional() })).max(100_000),
  dailyTrainingPlans: z.array(z.object({ id, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), createdAt: dateString, updatedAt: dateString, checkInId: id.optional(), status: z.enum(['active', 'safety-hold', 'completed']), items: z.array(planItem).max(100), adjustment: z.object({ lighter: z.boolean().optional(), availableMinutes: z.number().int().min(1).max(1440).optional(), avoidedTraining: z.boolean().optional(), note: z.string().max(1000).optional() }).optional() })).max(100_000),
  dailyReflections: z.array(z.object({ id, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), planId: id.optional(), createdAt: dateString, nutrition: score, sleep: score, fatigue: score, mood: score, minimumAchieved: z.boolean(), idealAchieved: z.boolean(), note: z.string().max(2000).optional() })).max(100_000),
  weeklyAdjustments: z.array(z.object({ id, weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), createdAt: dateString, summary: z.object({ minimumDays: z.number().int().min(0).max(7), idealDays: z.number().int().min(0).max(7), reflectionDays: z.number().int().min(0).max(7), workoutMinutes: z.number().int().nonnegative(), weightTrendKgPerWeek: z.number().optional() }), proposal: z.object({ level: weeklyLevel, reason: z.string().min(1).max(1000) }), decision: z.enum(['pending', 'accepted', 'edited', 'rejected']), acceptedLevel: weeklyLevel.optional(), decidedAt: dateString.optional() })).max(10_000),
  formHistory: z.array(z.object({ id, guideId: id, title: z.string().min(1).max(160), viewedAt: dateString })).max(100_000).default([]),
  journey: z.array(z.object({ id, createdAt: dateString, mode: z.enum(['study', 'training', 'shared']), kind: z.enum(['check-in', 'study', 'workout', 'recovery', 'form', 'rest', 'knowledge', 'plan-minimum', 'plan-ideal', 'plan-optional', 'daily-reflection', 'weekly-review']), xp: z.number().int().min(0).max(18), title: z.string().min(1).max(240), sourceId: id.optional() })).max(100_000),
  journeyInventory: z.object({ spentCoins: z.number().int().nonnegative(), ownedCosmetics: z.array(id), unlockedRewards: z.array(id), completedTrials: z.array(id), nebulaRuns: z.array(z.object({ id, completedAt: dateString, safeReturn: z.boolean() })), weeklyRewardClaims: z.array(z.object({ weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), rewardId: id, claimedAt: dateString })).max(10_000), tutorialCompletedAt: dateString.optional() }),
  healthSamples: z.array(z.object({ externalId: z.string().min(1).max(240), provider: z.enum(['healthkit', 'health-connect']), sampleType: z.enum(['weight', 'workout']), importedAt: dateString })).max(200_000),
  notification: z.object({ enabled: z.boolean(), hour: z.number().int().min(0).max(23), minute: z.number().int().min(0).max(59), mode: z.enum(['study', 'training']) }), settings: z.object({ reducedMotion: z.boolean(), haptics: z.boolean() }),
  restoreAudits: z.array(z.object({ id, restoredAt: dateString, sourceVersion: z.number().int().positive(), counts: z.record(z.string(), z.number().int().nonnegative()) })).max(5),
  restoreSnapshots: z.array(z.object({ id, createdAt: dateString, payload: z.string().min(2) })).max(5).default([]), legacyMigratedAt: dateString.optional(),
}).superRefine((state, context) => {
  const collections = [state.checkIns, state.studySessions, state.measurements, state.workouts, state.recoveries, state.dailyTrainingPlans, state.dailyReflections, state.weeklyAdjustments, state.formHistory, state.journey, state.journeyInventory.nebulaRuns];
  for (const collection of collections) {
    const seen = new Set<string>();
    for (const item of collection) { if (seen.has(item.id)) context.addIssue({ code: 'custom', message: `duplicate id: ${item.id}` }); seen.add(item.id); }
  }
  const imported = new Set([...state.measurements.flatMap((item) => item.externalId ? [`${item.source}:${item.externalId}`] : []), ...state.workouts.flatMap((item) => item.externalId ? [`${item.source}:${item.externalId}`] : [])]);
  for (const ref of state.healthSamples) if (!imported.has(`${ref.provider}:${ref.externalId}`)) context.addIssue({ code: 'custom', message: `orphan health reference: ${ref.externalId}` });
});

const backupSchema = z.object({ format: z.literal('life-compass-backup'), version: z.literal(3), exportedAt: dateString, note: z.string().max(80).optional(), state: stateSchema });

export function normalizeStateV3(value: unknown): AppState {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const inventory = raw.journeyInventory && typeof raw.journeyInventory === 'object' ? raw.journeyInventory as Record<string, unknown> : {};
  return stateSchema.parse({
    ...DEFAULT_STATE, ...raw, schemaVersion: 3,
    environment: { ...DEFAULT_STATE.environment, ...(raw.environment as object | undefined) },
    journeyInventory: { ...DEFAULT_STATE.journeyInventory, ...inventory, weeklyRewardClaims: inventory.weeklyRewardClaims ?? [] },
    notification: { ...DEFAULT_STATE.notification, ...(raw.notification as object | undefined) },
    settings: { ...DEFAULT_STATE.settings, ...(raw.settings as object | undefined) },
    formHistory: raw.formHistory ?? [], dailyTrainingPlans: raw.dailyTrainingPlans ?? [], dailyReflections: raw.dailyReflections ?? [], weeklyAdjustments: raw.weeklyAdjustments ?? [], restoreAudits: raw.restoreAudits ?? [], restoreSnapshots: raw.restoreSnapshots ?? [],
  }) as AppState;
}

export function createBackup(state: AppState, note?: string): AppBackupV3 { return { format: 'life-compass-backup', version: 3, exportedAt: new Date().toISOString(), note: note?.trim() || undefined, state }; }

function legacyBackup(value: unknown): AppBackupV3 | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const envelope = value as Record<string, unknown>;
  const candidate = (envelope.state ?? envelope.data ?? value) as Record<string, unknown>;
  if (!candidate || typeof candidate !== 'object') return undefined;
  const rawMeasurements = [...(Array.isArray(candidate.measurements) ? candidate.measurements : []), ...(Array.isArray(candidate.weightEntries) ? candidate.weightEntries : [])] as Record<string, unknown>[];
  const rawWorkouts = [...(Array.isArray(candidate.workouts) ? candidate.workouts : []), ...(Array.isArray(candidate.completedWorkouts) ? candidate.completedWorkouts : [])] as Record<string, unknown>[];
  const measurements: BodyMeasurement[] = rawMeasurements.flatMap((item) => { const weightKg = Number(item.weightKg ?? item.weight); return Number.isFinite(weightKg) && weightKg > 0 ? [{ id: String(item.id ?? createId('legacy-weight')), measuredAt: String(item.measuredAt ?? item.createdAt ?? item.date ?? new Date().toISOString()), weightKg, source: 'legacy' }] : []; });
  const workouts: WorkoutSession[] = rawWorkouts.map((item) => { const completedAt = String(item.completedAt ?? item.createdAt ?? new Date().toISOString()); return { id: String(item.id ?? createId('legacy-workout')), startedAt: String(item.startedAt ?? completedAt), completedAt, focus: String(item.focus ?? item.title ?? '旧Training Compass'), minutes: Math.max(1, Math.round(Number(item.minutes ?? item.durationMinutes ?? 10))), sets: [], safeCompletion: item.safeCompletion !== false, source: 'legacy' }; });
  if (!measurements.length && !workouts.length && envelope.version !== 1) return undefined;
  const state = normalizeStateV3({ ...DEFAULT_STATE, onboardingComplete: Boolean(candidate.onboardingComplete), measurements, workouts, legacyMigratedAt: new Date().toISOString() });
  return { format: 'life-compass-backup', version: 3, exportedAt: new Date().toISOString(), note: '旧Training Compassから変換', state };
}

export function parseBackup(value: unknown): AppBackupV3 {
  const current = backupSchema.safeParse(value);
  if (current.success) return current.data as AppBackupV3;
  if (value && typeof value === 'object') {
    const envelope = value as Record<string, unknown>;
    if (envelope.format === 'life-compass-backup' && envelope.version === 2 && envelope.state) {
      return backupSchema.parse({ format: 'life-compass-backup', version: 3, exportedAt: String(envelope.exportedAt), note: typeof envelope.note === 'string' ? envelope.note : undefined, state: normalizeStateV3(envelope.state) }) as AppBackupV3;
    }
  }
  const converted = legacyBackup(value);
  if (converted) return backupSchema.parse(converted) as AppBackupV3;
  throw current.error;
}

export function parseStateSnapshot(payload: string): AppState { return normalizeStateV3(JSON.parse(payload)); }
export function backupCounts(state: AppState): Record<string, number> { return { studySessions: state.studySessions.length, measurements: state.measurements.length, workouts: state.workouts.length, recoveries: state.recoveries.length, dailyTrainingPlans: state.dailyTrainingPlans.length, dailyReflections: state.dailyReflections.length, weeklyAdjustments: state.weeklyAdjustments.length, formHistory: state.formHistory.length, journey: state.journey.length }; }
