import { assessWeightPace } from './health';
import { recommendTraining } from './training';
import { AppState, DailyPlanItem, DailyTrainingPlan } from './types';

export type DailyPlanProgress = {
  minimumAchieved: boolean;
  idealAchieved: boolean;
  minimumCompleted: number;
  minimumTotal: number;
  idealCompleted: number;
  idealTotal: number;
  optionalCompleted: number;
};

export type PlanAdjustment = { lighter?: boolean; availableMinutes?: number; avoidTraining?: boolean; note?: string };

const item = (planId: string, suffix: string, value: Omit<DailyPlanItem, 'id' | 'source'>): DailyPlanItem => ({ id: `${planId}-${suffix}`, source: 'generated', ...value });

export function buildDailyTrainingPlan({ state, checkInId, now = new Date() }: { state: AppState; checkInId?: string; now?: Date }): DailyTrainingPlan {
  const date = now.toISOString().slice(0, 10);
  const planId = `plan-${date}`;
  const checkIn = [...state.checkIns].reverse().find((entry) => entry.id === checkInId || (entry.mode === 'training' && entry.createdAt.slice(0, 10) === date));
  const recommendation = recommendTraining({ checkIn, measurements: state.measurements, recoveries: state.recoveries, workouts: state.workouts, heightCm: state.heightCm, targetWeightKg: state.targetWeightKg, now });
  const pace = assessWeightPace({ adultConfirmed: state.adultConfirmed, heightCm: state.heightCm, targetWeightKg: state.targetWeightKg, targetDate: state.targetWeightDate, measurements: state.measurements, now });
  const currentWeekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  currentWeekStart.setUTCDate(currentWeekStart.getUTCDate() - ((currentWeekStart.getUTCDay() + 6) % 7));
  const previousWeekStart = new Date(currentWeekStart.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const weeklyLevel = [...state.weeklyAdjustments].filter((entry) => entry.weekStart === previousWeekStart && (entry.decision === 'accepted' || entry.decision === 'edited') && entry.acceptedLevel).sort((a, b) => (b.decidedAt ?? b.createdAt).localeCompare(a.decidedAt ?? a.createdAt))[0]?.acceptedLevel;
  const createdAt = now.toISOString();
  const base = { id: planId, date, createdAt, updatedAt: createdAt, checkInId: checkIn?.id };

  if (recommendation.status === 'stop' || pace.status === 'blocked') {
    return { ...base, status: 'safety-hold', items: [
      item(planId, 'minimum-safety', { category: 'recovery', tier: 'minimum', title: '運動を始めない安全判断', description: recommendation.status === 'stop' ? recommendation.reason : pace.message }),
      item(planId, 'minimum-reflection', { category: 'reflection', tier: 'minimum', title: '体調と判断を短く振り返る' }),
    ] };
  }

  const structuredRecovery = Boolean(checkIn?.training && (checkIn.training.fatigue >= 5 || checkIn.training.soreness >= 6 || checkIn.training.sleepQuality <= 1));
  if (recommendation.status === 'recover' || structuredRecovery) {
    return { ...base, status: 'active', items: [
      item(planId, 'minimum-recovery', { category: 'recovery', tier: 'minimum', title: '5分の回復チェック', description: '痛みを増やさない範囲で呼吸と可動域を確認します。' }),
      item(planId, 'minimum-reflection', { category: 'reflection', tier: 'minimum', title: '今日の状態を振り返る' }),
      item(planId, 'ideal-sleep', { category: 'sleep', tier: 'ideal', title: '今夜の休息時間を先に確保する' }),
      item(planId, 'optional-measurement', { category: 'measurement', tier: 'optional', title: '必要なら体重を記録する' }),
    ] };
  }

  return { ...base, status: 'active', items: [
    item(planId, 'minimum-training', { category: 'training', tier: 'minimum', title: `最低ライン：${Math.min(5, recommendation.minutes)}分だけ動く`, description: recommendation.steps[0] }),
    item(planId, 'minimum-reflection', { category: 'reflection', tier: 'minimum', title: '終わった状態を短く記録する' }),
    item(planId, 'ideal-training', { category: 'training', tier: 'ideal', title: `理想ライン：${weeklyLevel === 'lighter' ? '軽めの' : weeklyLevel === 'slightly-more' ? '少し多めの' : ''}${recommendation.title}`, description: recommendation.reason }),
    item(planId, 'ideal-recovery', { category: 'recovery', tier: 'ideal', title: 'RPEと回復状態まで確認する' }),
    item(planId, 'optional-measurement', { category: 'measurement', tier: 'optional', title: '必要なら体重を記録する' }),
  ] };
}

export function planProgress(plan: DailyTrainingPlan): DailyPlanProgress {
  const minimum = plan.items.filter((entry) => entry.tier === 'minimum');
  const ideal = plan.items.filter((entry) => entry.tier === 'ideal');
  const optional = plan.items.filter((entry) => entry.tier === 'optional');
  const minimumAchieved = minimum.length > 0 && minimum.every((entry) => Boolean(entry.completedAt));
  return {
    minimumAchieved,
    idealAchieved: minimumAchieved && ideal.length > 0 && ideal.every((entry) => Boolean(entry.completedAt)),
    minimumCompleted: minimum.filter((entry) => entry.completedAt).length,
    minimumTotal: minimum.length,
    idealCompleted: ideal.filter((entry) => entry.completedAt).length,
    idealTotal: ideal.length,
    optionalCompleted: optional.filter((entry) => entry.completedAt).length,
  };
}

export function completePlanItem(plan: DailyTrainingPlan, itemId: string, at = new Date()): DailyTrainingPlan {
  const completedAt = at.toISOString();
  const next = { ...plan, updatedAt: completedAt, items: plan.items.map((entry) => entry.id === itemId ? { ...entry, completedAt } : entry) };
  return { ...next, status: plan.status === 'safety-hold' ? 'safety-hold' : planProgress(next).minimumAchieved ? 'completed' : 'active' };
}

export function adjustDailyPlan(plan: DailyTrainingPlan, adjustment: PlanAdjustment): DailyTrainingPlan {
  const updatedAt = new Date().toISOString();
  if (plan.status === 'safety-hold') return { ...plan, updatedAt, adjustment: { ...plan.adjustment, note: adjustment.note } };
  if (adjustment.avoidTraining) {
    const reflection = plan.items.find((entry) => entry.category === 'reflection' && entry.tier === 'minimum');
    const replacement: DailyPlanItem[] = [
      { id: `${plan.id}-minimum-user-rest`, category: 'recovery', tier: 'minimum', title: '今日は運動せず回復を優先する', source: 'user-edited' },
      reflection ? { ...reflection, source: 'user-edited' } : { id: `${plan.id}-minimum-reflection`, category: 'reflection', tier: 'minimum', title: '今日の状態を振り返る', source: 'user-edited' },
      ...plan.items.filter((entry) => entry.tier === 'optional'),
    ];
    return { ...plan, status: 'active', updatedAt, items: replacement, adjustment: { lighter: adjustment.lighter, availableMinutes: adjustment.availableMinutes, avoidedTraining: true, note: adjustment.note?.trim() || undefined } };
  }
  const available = adjustment.availableMinutes ? Math.max(5, Math.min(20, adjustment.availableMinutes)) : undefined;
  const items = plan.items.map((entry) => entry.tier === 'ideal' && entry.category === 'training' && (adjustment.lighter || available)
    ? { ...entry, source: 'user-edited' as const, title: `理想ライン：${adjustment.lighter ? '軽めの' : ''}${available ?? 10}分セッション` }
    : entry);
  return { ...plan, updatedAt, items, adjustment: { lighter: adjustment.lighter, availableMinutes: available, avoidedTraining: false, note: adjustment.note?.trim() || undefined } };
}

export function upsertDailyTrainingPlan(plans: DailyTrainingPlan[], next: DailyTrainingPlan): DailyTrainingPlan[] {
  const current = plans.find((plan) => plan.date === next.date);
  if (!current) return [...plans, next];
  const completedByMeaning = new Map(current.items.filter((entry) => entry.completedAt).map((entry) => [`${entry.tier}:${entry.category}:${entry.title}`, entry.completedAt]));
  const merged = { ...next, id: current.id, createdAt: current.createdAt, items: next.items.map((entry) => ({ ...entry, completedAt: completedByMeaning.get(`${entry.tier}:${entry.category}:${entry.title}`) ?? entry.completedAt })) };
  return plans.map((plan) => plan.date === next.date ? merged : plan);
}
