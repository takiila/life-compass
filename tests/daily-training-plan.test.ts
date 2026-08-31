import { describe, expect, it } from 'vitest';

import { adjustDailyPlan, buildDailyTrainingPlan, completePlanItem, planProgress, upsertDailyTrainingPlan } from '../src/domain/dailyTrainingPlan';
import { DEFAULT_STATE } from '../src/domain/defaults';
import { DailyCheckIn, DailyTrainingPlan } from '../src/domain/types';

const now = new Date('2026-08-31T12:00:00+09:00');
const checkIn = (overrides: Partial<DailyCheckIn> = {}): DailyCheckIn => ({
  id: 'check-1', mode: 'training', createdAt: now.toISOString(), energy: 4, availableMinutes: 25,
  training: { sleepQuality: 4, fatigue: 2, mood: 4, soreness: 1, urgentSymptom: false },
  ...overrides,
});

describe('daily Training plan', () => {
  it('builds a normal plan with visible minimum and ideal tiers', () => {
    const plan = buildDailyTrainingPlan({ state: { ...DEFAULT_STATE, checkIns: [checkIn()] }, now });
    expect(plan.status).toBe('active');
    expect(plan.items.some((item) => item.tier === 'minimum' && item.category === 'training')).toBe(true);
    expect(plan.items.some((item) => item.tier === 'ideal')).toBe(true);
  });

  it('replaces forced training with recovery when energy or soreness is poor', () => {
    const low = checkIn({ energy: 1, training: { sleepQuality: 2, fatigue: 5, mood: 2, soreness: 7, urgentSymptom: false } });
    const plan = buildDailyTrainingPlan({ state: { ...DEFAULT_STATE, checkIns: [low] }, now });
    expect(plan.items.filter((item) => item.tier === 'minimum').map((item) => item.category)).toContain('recovery');
    expect(plan.items.some((item) => item.tier === 'minimum' && item.category === 'training')).toBe(false);
  });

  it('creates a safety hold that adjustment cannot turn back into training', () => {
    const urgent = checkIn({ training: { sleepQuality: 4, fatigue: 2, mood: 3, soreness: 1, urgentSymptom: true } });
    const plan = buildDailyTrainingPlan({ state: { ...DEFAULT_STATE, checkIns: [urgent] }, now });
    const adjusted = adjustDailyPlan(plan, { lighter: false, availableMinutes: 35, avoidTraining: false });
    expect(adjusted.status).toBe('safety-hold');
    expect(adjusted.items.some((item) => item.category === 'training')).toBe(false);
  });

  it('requires minimum before ideal and accepts recovery/rest as minimum success', () => {
    const plan = buildDailyTrainingPlan({ state: { ...DEFAULT_STATE, checkIns: [checkIn({ energy: 1 })] }, now });
    const ideal = plan.items.find((item) => item.tier === 'ideal');
    const withIdeal = ideal ? completePlanItem(plan, ideal.id, now) : plan;
    expect(planProgress(withIdeal).idealAchieved).toBe(false);
    const completed = withIdeal.items.filter((item) => item.tier === 'minimum').reduce((current, item) => completePlanItem(current, item.id, now), withIdeal);
    expect(planProgress(completed).minimumAchieved).toBe(true);
  });

  it('keeps one plan per date and preserves completed equivalent items on regeneration', () => {
    const original = buildDailyTrainingPlan({ state: { ...DEFAULT_STATE, checkIns: [checkIn()] }, now });
    const completed = completePlanItem(original, original.items[0].id, now);
    const regenerated = buildDailyTrainingPlan({ state: { ...DEFAULT_STATE, checkIns: [checkIn({ id: 'check-2' })] }, now });
    const plans = upsertDailyTrainingPlan([completed], regenerated);
    expect(plans).toHaveLength(1);
    expect(plans[0].items.some((item) => item.title === completed.items[0].title && item.completedAt)).toBe(true);
  });

  it('records the user choice to avoid training without calling it a failure', () => {
    const plan = buildDailyTrainingPlan({ state: { ...DEFAULT_STATE, checkIns: [checkIn()] }, now });
    const adjusted = adjustDailyPlan(plan, { avoidTraining: true, note: '今日は休む' });
    expect(adjusted.adjustment).toMatchObject({ avoidedTraining: true, note: '今日は休む' });
    expect(adjusted.items.some((item) => item.tier === 'minimum' && item.category === 'recovery')).toBe(true);
    expect(adjusted.items.some((item) => item.category === 'training')).toBe(false);
  });

  it('uses only an accepted previous weekly choice in the next plan', () => {
    const weeklyAdjustments = [{ id: 'week', weekStart: '2026-08-24', createdAt: now.toISOString(), summary: { minimumDays: 4, idealDays: 2, reflectionDays: 4, workoutMinutes: 80 }, proposal: { level: 'maintain' as const, reason: '安定' }, decision: 'edited' as const, acceptedLevel: 'lighter' as const, decidedAt: now.toISOString() }];
    const plan = buildDailyTrainingPlan({ state: { ...DEFAULT_STATE, checkIns: [checkIn()], weeklyAdjustments }, now });
    expect(plan.items.find((item) => item.tier === 'ideal' && item.category === 'training')?.title).toContain('軽め');
    const pending = buildDailyTrainingPlan({ state: { ...DEFAULT_STATE, checkIns: [checkIn()], weeklyAdjustments: weeklyAdjustments.map((entry) => ({ ...entry, decision: 'pending' as const, acceptedLevel: undefined })) }, now });
    expect(pending.items.find((item) => item.tier === 'ideal' && item.category === 'training')?.title).not.toContain('軽め');
    const stale = buildDailyTrainingPlan({ state: { ...DEFAULT_STATE, checkIns: [checkIn()], weeklyAdjustments: weeklyAdjustments.map((entry) => ({ ...entry, weekStart: '2026-08-10' })) }, now });
    expect(stale.items.find((item) => item.tier === 'ideal' && item.category === 'training')?.title).not.toContain('軽め');
  });
});
