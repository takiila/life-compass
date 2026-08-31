import { assessWeightPace, calculateWeightTrend } from './health';
import { createId } from './defaults';
import { AppState, WeeklyAdjustment, WeeklyAdjustmentLevel } from './types';
import { planProgress } from './dailyTrainingPlan';

const weekEnd = (weekStart: string) => new Date(new Date(`${weekStart}T00:00:00Z`).getTime() + 7 * 86_400_000);
const inWeek = (value: string, weekStart: string) => {
  const time = new Date(value).getTime();
  return time >= new Date(`${weekStart}T00:00:00Z`).getTime() && time < weekEnd(weekStart).getTime();
};

export function summarizeTrainingWeek(state: AppState, weekStart: string): WeeklyAdjustment['summary'] {
  const plans = state.dailyTrainingPlans.filter((plan) => inWeek(`${plan.date}T00:00:00Z`, weekStart));
  const progress = plans.map(planProgress);
  return {
    minimumDays: progress.filter((entry) => entry.minimumAchieved).length,
    idealDays: progress.filter((entry) => entry.idealAchieved).length,
    reflectionDays: new Set(state.dailyReflections.filter((entry) => inWeek(`${entry.date}T00:00:00Z`, weekStart)).map((entry) => entry.date)).size,
    workoutMinutes: state.workouts.filter((entry) => inWeek(entry.completedAt, weekStart)).reduce((sum, entry) => sum + entry.minutes, 0),
    weightTrendKgPerWeek: calculateWeightTrend(state.measurements),
  };
}

export function proposeWeeklyAdjustment(state: AppState, weekStart: string, now = new Date()): WeeklyAdjustment {
  const summary = summarizeTrainingWeek(state, weekStart);
  const plans = state.dailyTrainingPlans.filter((plan) => inWeek(`${plan.date}T00:00:00Z`, weekStart));
  const safetyOrRecovery = plans.some((plan) => plan.status === 'safety-hold' || plan.items.some((entry) => entry.tier === 'minimum' && entry.category === 'recovery'));
  const pace = assessWeightPace({ adultConfirmed: state.adultConfirmed, heightCm: state.heightCm, targetWeightKg: state.targetWeightKg, targetDate: state.targetWeightDate, measurements: state.measurements, now });
  let level: WeeklyAdjustmentLevel = 'maintain';
  let reason = '記録をもう1週間集め、現在の量を維持します。';
  if (safetyOrRecovery) {
    level = 'lighter';
    reason = 'Safetyまたは回復を優先した日があるため、来週は少し軽くする案です。';
  } else if (summary.minimumDays >= 4 && summary.idealDays >= 2 && summary.reflectionDays >= 4 && !['review', 'blocked'].includes(pace.status)) {
    level = 'slightly-more';
    reason = '最低ラインと理想ラインが安全に安定したため、本人が望む場合だけ少し増やせます。';
  } else if (summary.minimumDays >= 3) {
    reason = '最低ラインは安定しています。理想ラインは余力確認中なので維持を提案します。';
  }
  return { id: createId('weekly-adjustment'), weekStart, createdAt: now.toISOString(), summary, proposal: { level, reason }, decision: 'pending' };
}

export function decideWeeklyAdjustment(adjustment: WeeklyAdjustment, input: { decision: 'accepted' | 'edited' | 'rejected'; level?: WeeklyAdjustmentLevel }, now = new Date()): WeeklyAdjustment {
  if (input.decision === 'rejected') return { ...adjustment, decision: 'rejected', acceptedLevel: undefined, decidedAt: now.toISOString() };
  return { ...adjustment, decision: input.decision, acceptedLevel: input.level ?? adjustment.proposal.level, decidedAt: now.toISOString() };
}

export function latestAcceptedAdjustment(adjustments: WeeklyAdjustment[]): WeeklyAdjustment | undefined {
  return [...adjustments].filter((entry) => (entry.decision === 'accepted' || entry.decision === 'edited') && entry.acceptedLevel).sort((a, b) => (b.decidedAt ?? b.createdAt).localeCompare(a.decidedAt ?? a.createdAt))[0];
}
