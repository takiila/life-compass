import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup } from '../src/domain/backup';
import { DEFAULT_STATE } from '../src/domain/defaults';

describe('backup schema', () => {
  it('round-trips AppBackupV3', () => { const backup = createBackup(DEFAULT_STATE, 'test'); expect(backup.version).toBe(3); expect(parseBackup(JSON.parse(JSON.stringify(backup)))).toEqual(backup); });
  it('does not export restore-before-import snapshots', () => {
    const backup = createBackup({
      ...DEFAULT_STATE,
      restoreSnapshots: [{ id: 'snapshot-1', createdAt: new Date().toISOString(), payload: JSON.stringify({ private: 'old data' }) }],
    });
    expect(backup.state.restoreSnapshots).toEqual([]);
  });
  it('rejects unsafe weight values', () => { const backup = createBackup({ ...DEFAULT_STATE, measurements: [{ id: 'x', measuredAt: new Date().toISOString(), weightKg: -1, source: 'manual' }] }); expect(() => parseBackup(backup)).toThrow(); });
  it('rejects duplicate IDs and orphan health references', () => {
    const measuredAt = new Date().toISOString();
    const duplicate = createBackup({ ...DEFAULT_STATE, measurements: [{ id: 'same', measuredAt, weightKg: 70, source: 'manual' }, { id: 'same', measuredAt, weightKg: 69, source: 'manual' }] });
    expect(() => parseBackup(duplicate)).toThrow(/duplicate id/);
    const orphan = createBackup({ ...DEFAULT_STATE, healthSamples: [{ externalId: 'missing', provider: 'healthkit', sampleType: 'weight', importedAt: measuredAt }] });
    expect(() => parseBackup(orphan)).toThrow(/orphan health reference/);
  });
  it('converts a legacy v1 weight backup through the v3 validator', () => {
    const parsed = parseBackup({ version: 1, data: { onboardingComplete: true, weightEntries: [{ id: 'old', date: '2026-08-01', weight: 70 }] } });
    expect(parsed.version).toBe(3);
    expect(parsed.state.measurements[0]).toMatchObject({ id: 'old', weightKg: 70, source: 'legacy' });
  });
  it('migrates an older v2 backup while preserving existing records', () => {
    const old = JSON.parse(JSON.stringify(createBackup({
      ...DEFAULT_STATE,
      studySessions: [{ id: 'study-old', startedAt: '2026-08-25T03:00:00Z', minutes: 10, completed: true }],
      workouts: [{ id: 'workout-old', startedAt: '2026-08-25T03:00:00Z', completedAt: '2026-08-25T03:10:00Z', focus: '全身', minutes: 10, sets: [], safeCompletion: true, source: 'manual' }],
      journey: [{ id: 'journey-old', createdAt: '2026-08-25T03:10:00Z', mode: 'training', kind: 'workout', xp: 18, title: '安全なセッション' }],
    }))) as { version: number; state: Record<string, unknown> };
    old.version = 2;
    old.state.schemaVersion = 2;
    delete old.state.formHistory;
    delete old.state.dailyTrainingPlans;
    delete old.state.dailyReflections;
    delete old.state.weeklyAdjustments;
    const inventory = old.state.journeyInventory as Record<string, unknown>;
    delete inventory.weeklyRewardClaims;
    const parsed = parseBackup(old);
    expect(parsed.version).toBe(3);
    expect(parsed.state.schemaVersion).toBe(3);
    expect(parsed.state.formHistory).toEqual([]);
    expect(parsed.state.dailyTrainingPlans).toEqual([]);
    expect(parsed.state.dailyReflections).toEqual([]);
    expect(parsed.state.weeklyAdjustments).toEqual([]);
    expect(parsed.state.journeyInventory.weeklyRewardClaims).toEqual([]);
    expect(parsed.state.studySessions[0].id).toBe('study-old');
    expect(parsed.state.workouts[0].id).toBe('workout-old');
    expect(parsed.state.journey[0].id).toBe('journey-old');
  });
  it('round-trips form history and tutorial completion', () => {
    const viewedAt = '2026-08-25T03:00:00+09:00';
    const backup = createBackup({
      ...DEFAULT_STATE,
      formHistory: [{ id: 'form-1', guideId: 'supported-squat', title: '支持ありスクワット', viewedAt }],
      journeyInventory: { ...DEFAULT_STATE.journeyInventory, tutorialCompletedAt: viewedAt },
    });
    expect(parseBackup(backup).state).toMatchObject({ formHistory: backup.state.formHistory, journeyInventory: { tutorialCompletedAt: viewedAt } });
  });
  it('round-trips new daily and weekly collections', () => {
    const createdAt = '2026-08-31T03:00:00Z';
    const backup = createBackup({
      ...DEFAULT_STATE,
      dailyTrainingPlans: [{ id: 'plan-1', date: '2026-08-31', createdAt, updatedAt: createdAt, status: 'active', items: [] }],
      dailyReflections: [{ id: 'reflection-1', date: '2026-08-31', planId: 'plan-1', createdAt, nutrition: 3, sleep: 4, fatigue: 2, mood: 4, minimumAchieved: true, idealAchieved: false }],
      weeklyAdjustments: [{ id: 'week-1', weekStart: '2026-08-25', createdAt, summary: { minimumDays: 4, idealDays: 2, reflectionDays: 4, workoutMinutes: 80 }, proposal: { level: 'maintain', reason: '安定しています。' }, decision: 'accepted', acceptedLevel: 'maintain', decidedAt: createdAt }],
      journeyInventory: { ...DEFAULT_STATE.journeyInventory, weeklyRewardClaims: [{ weekStart: '2026-08-25', rewardId: 'week-1', claimedAt: createdAt }] },
    });
    expect(parseBackup(backup)).toEqual(backup);
  });
  it('rejects a v2 envelope with an invalid export date after migration', () => {
    const old = JSON.parse(JSON.stringify(createBackup(DEFAULT_STATE))) as { version: number; exportedAt: string; state: Record<string, unknown> };
    old.version = 2;
    old.exportedAt = 'not-a-date';
    old.state.schemaVersion = 2;
    expect(() => parseBackup(old)).toThrow(/invalid date/);
  });
});
