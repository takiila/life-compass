import { describe, expect, it } from 'vitest';

import { completePlanItem } from '../src/domain/dailyTrainingPlan';
import { pendingDailyPlanRewards, weeklyRewardEligibility } from '../src/domain/trainingRewards';
import { DailyTrainingPlan, JourneyEvent } from '../src/domain/types';

const now = new Date('2026-08-31T03:00:00Z');
const plan: DailyTrainingPlan = {
  id: 'plan-1', date: '2026-08-31', createdAt: now.toISOString(), updatedAt: now.toISOString(), status: 'active',
  items: [
    { id: 'min', category: 'recovery', tier: 'minimum', title: '休養を選ぶ', source: 'generated' },
    { id: 'ideal', category: 'sleep', tier: 'ideal', title: '休息を確保', source: 'generated' },
    { id: 'optional', category: 'measurement', tier: 'optional', title: '記録', source: 'generated' },
  ],
};

const event = (kind: JourneyEvent['kind'], sourceId: string): JourneyEvent => ({ id: `${kind}-1`, createdAt: now.toISOString(), mode: 'training', kind, xp: 8, title: kind, sourceId });

describe('layered Training rewards', () => {
  it('awards a recovery/rest minimum once and ideal as an additional reward', () => {
    const minimum = completePlanItem(plan, 'min', now);
    expect(pendingDailyPlanRewards(minimum, [])).toEqual(['plan-minimum']);
    expect(pendingDailyPlanRewards(minimum, [event('plan-minimum', 'plan-1:minimum')])).toEqual([]);
    const ideal = completePlanItem(minimum, 'ideal', now);
    expect(pendingDailyPlanRewards(ideal, [event('plan-minimum', 'plan-1:minimum')])).toEqual(['plan-ideal']);
  });

  it('caps optional reward per plan and never grants ideal before minimum', () => {
    const optional = completePlanItem(plan, 'optional', now);
    expect(pendingDailyPlanRewards(optional, [])).toEqual(['plan-optional']);
    expect(pendingDailyPlanRewards(optional, [event('plan-optional', 'plan-1:optional')])).toEqual([]);
  });

  it('makes weekly unlock finite and prevents a second claim for the same week', () => {
    const summary = { minimumDays: 4, idealDays: 0, reflectionDays: 4, workoutMinutes: 60 };
    const first = weeklyRewardEligibility(summary, [], '2026-08-25');
    expect(first.eligible).toBe(true);
    expect(first.rewardId).toBeTruthy();
    expect(weeklyRewardEligibility(summary, [{ weekStart: '2026-08-25', rewardId: first.rewardId!, claimedAt: now.toISOString() }], '2026-08-25').eligible).toBe(false);
  });
});
