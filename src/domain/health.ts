import { BodyMeasurement } from './types';

export type WeightPaceResult = {
  bmi?: number;
  targetBmi?: number;
  requiredKgPerWeek?: number;
  trendKgPerWeek?: number;
  estimatedDate?: string;
  status: 'incomplete' | 'safe-reference' | 'review' | 'blocked';
  message: string;
};

const round = (value: number, digits = 1) => Number(value.toFixed(digits));

export function calculateBmi(weightKg: number, heightCm: number): number {
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

export function calculateWeightTrend(measurements: BodyMeasurement[]): number | undefined {
  const valid = measurements.filter((item) => Number.isFinite(item.weightKg)).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)).slice(-28);
  if (valid.length < 3) return undefined;
  const start = new Date(valid[0].measuredAt).getTime();
  const end = new Date(valid[valid.length - 1].measuredAt).getTime();
  if ((end - start) / 86_400_000 < 14) return undefined;
  const xs = valid.map((item) => (new Date(item.measuredAt).getTime() - start) / 86_400_000);
  const ys = valid.map((item) => item.weightKg);
  const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
  const numerator = xs.reduce((sum, x, i) => sum + (x - xMean) * (ys[i] - yMean), 0);
  const denominator = xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
  return denominator ? round((numerator / denominator) * 7, 2) : undefined;
}

export function assessWeightPace(input: {
  adultConfirmed: boolean;
  heightCm?: number;
  targetWeightKg?: number;
  targetDate?: string;
  measurements: BodyMeasurement[];
  now?: Date;
}): WeightPaceResult {
  const latest = [...input.measurements].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))[0];
  if (!input.heightCm || !input.targetWeightKg || !input.targetDate || !latest) {
    return { status: 'incomplete', message: '身長・現在体重・目標体重・目標日をそろえると表示します。' };
  }
  const bmi = round(calculateBmi(latest.weightKg, input.heightCm));
  const targetBmi = round(calculateBmi(input.targetWeightKg, input.heightCm));
  if (!input.adultConfirmed) {
    return { bmi, targetBmi, status: 'blocked', message: 'このペース表示は18歳以上向けです。未成年は保護者や医療専門家へ相談してください。' };
  }
  if (targetBmi < 18.5 || bmi < 18.5) {
    return { bmi, targetBmi, status: 'blocked', message: '低体重へ向かう減量ペースは提案しません。目標を見直し、必要に応じて専門家へ相談してください。' };
  }
  const now = input.now ?? new Date();
  const target = new Date(`${input.targetDate}T23:59:59`);
  const weeks = (target.getTime() - now.getTime()) / (7 * 86_400_000);
  if (weeks <= 0) return { bmi, targetBmi, status: 'review', message: '目標日は今日より後の日付にしてください。' };
  const requiredKgPerWeek = round((latest.weightKg - input.targetWeightKg) / weeks, 2);
  const trendKgPerWeek = calculateWeightTrend(input.measurements);
  let estimatedDate: string | undefined;
  if (trendKgPerWeek !== undefined && trendKgPerWeek < -0.02 && input.targetWeightKg < latest.weightKg) {
    const weeksToGoal = (latest.weightKg - input.targetWeightKg) / Math.abs(trendKgPerWeek);
    estimatedDate = new Date(now.getTime() + weeksToGoal * 7 * 86_400_000).toISOString().slice(0, 10);
  }
  if (requiredKgPerWeek > 0.9) {
    return { bmi, targetBmi, requiredKgPerWeek, trendKgPerWeek, estimatedDate, status: 'review', message: '週0.9kgを超える計画です。期限を延ばし、無理のない目標へ見直してください。' };
  }
  return { bmi, targetBmi, requiredKgPerWeek, trendKgPerWeek, estimatedDate, status: 'safe-reference', message: '一般的な参考範囲です。体調や治療状況に合わせ、無理をしないでください。' };
}
