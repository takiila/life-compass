import { planProgress } from './dailyTrainingPlan';
import { DailyTrainingPlan, JourneyEvent, WeeklyAdjustment, WeeklyRewardClaim } from './types';

export const WEEKLY_REWARD_RULE = { minimumDays: 4, idealDaysAlternative: 2 } as const;
export const WEEKLY_REWARD_IDS = ['steady-traveler', 'recovery-sage', 'ideal-spark'] as const;

export function planRewardSourceId(planId: string, kind: 'plan-minimum' | 'plan-ideal' | 'plan-optional') {
  return `${planId}:${kind.replace('plan-', '')}`;
}

export function pendingDailyPlanRewards(plan: DailyTrainingPlan, events: JourneyEvent[]): JourneyEvent['kind'][] {
  const progress = planProgress(plan);
  const has = (kind: 'plan-minimum' | 'plan-ideal' | 'plan-optional') => events.some((event) => event.kind === kind && event.sourceId === planRewardSourceId(plan.id, kind));
  const pending: JourneyEvent['kind'][] = [];
  if (progress.minimumAchieved && !has('plan-minimum')) pending.push('plan-minimum');
  if (progress.idealAchieved && !has('plan-ideal')) pending.push('plan-ideal');
  if (progress.optionalCompleted > 0 && !has('plan-optional')) pending.push('plan-optional');
  return pending;
}

export function weeklyRewardEligibility(summary: WeeklyAdjustment['summary'], claims: WeeklyRewardClaim[], weekStart: string) {
  const alreadyClaimed = claims.some((claim) => claim.weekStart === weekStart);
  const eligibleByProgress = summary.minimumDays >= WEEKLY_REWARD_RULE.minimumDays || summary.idealDays >= WEEKLY_REWARD_RULE.idealDaysAlternative;
  const index = [...weekStart].reduce((sum, character) => sum + character.charCodeAt(0), 0) % WEEKLY_REWARD_IDS.length;
  return { eligible: eligibleByProgress && !alreadyClaimed, alreadyClaimed, rewardId: eligibleByProgress ? WEEKLY_REWARD_IDS[index] : undefined };
}
