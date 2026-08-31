import { BodyMeasurement, DailyCheckIn, RecoveryRecord, WorkoutSession } from './types';

export type TrainingRecommendation = {
  status: 'stop' | 'recover' | 'train';
  title: string;
  reason: string;
  focus: string;
  minutes: 5 | 10 | 20;
  steps: string[];
};

type Input = {
  checkIn?: DailyCheckIn;
  measurements: BodyMeasurement[];
  recoveries: RecoveryRecord[];
  workouts: WorkoutSession[];
  heightCm?: number;
  targetWeightKg?: number;
  now?: Date;
};

const latestBy = <T>(items: T[], dateOf: (item: T) => string) => [...items].sort((a, b) => dateOf(b).localeCompare(dateOf(a)))[0];

export function recommendTraining(input: Input): TrainingRecommendation {
  const now = input.now ?? new Date();
  const checkIn = input.checkIn;
  const latestRecovery = latestBy(input.recoveries, (item) => item.createdAt);
  const latestWorkout = latestBy(input.workouts, (item) => item.completedAt);
  const latestWeight = latestBy(input.measurements, (item) => item.measuredAt)?.weightKg;
  const available = checkIn?.availableMinutes ?? 10;
  const minutes: 5 | 10 | 20 = available < 10 ? 5 : available < 20 ? 10 : 20;

  if (checkIn?.training?.urgentSymptom === true || checkIn?.note === 'urgent-symptom') {
    return {
      status: 'stop', title: '今日は運動を開始しない', focus: '安全確認', minutes: 5,
      reason: '胸部症状、めまい、失神、異常な息切れの申告があるため、安全を最優先します。このアプリは診断しません。',
      steps: ['運動を中止する', '必要に応じて地域の緊急連絡先または医療専門家へ相談する'],
    };
  }

  const recoveryAge = latestRecovery ? now.getTime() - new Date(latestRecovery.createdAt).getTime() : Infinity;
  const workoutAge = latestWorkout ? now.getTime() - new Date(latestWorkout.completedAt).getTime() : Infinity;
  if ((latestRecovery && recoveryAge < 72 * 3_600_000 && latestRecovery.soreness >= 6) || checkIn?.energy === 1 || workoutAge < 18 * 3_600_000) {
    const reason = latestRecovery && recoveryAge < 72 * 3_600_000 && latestRecovery.soreness >= 6
      ? `直近の筋肉痛が${latestRecovery.soreness}/10のため、負荷を足さず回復を確認します。`
      : workoutAge < 18 * 3_600_000
        ? '直近18時間以内に運動記録があるため、今日は回復と軽い動作確認を優先します。'
        : '今日のエネルギーが低いため、短い回復行動を提案します。';
    return { status: 'recover', title: '5分の回復チェック', focus: '回復・呼吸', minutes: 5, reason, steps: ['痛みや違和感がない範囲で呼吸を整える', '軽い可動域確認をする', '部位別の回復を記録する'] };
  }

  const goalContext = latestWeight && input.targetWeightKg
    ? input.targetWeightKg < latestWeight ? '目標に向かう間も筋力を保つため' : input.targetWeightKg > latestWeight ? '全身の基礎的な筋力を積み上げるため' : '現在の状態を維持するため'
    : '体重目標が未設定でも安全に始められる一般案として';
  const energyContext = checkIn ? `エネルギー${checkIn.energy}/5・使える時間${checkIn.availableMinutes}分をもとに` : '今日の状態記録がないため控えめな量で';
  const profileContext = input.heightCm && latestWeight ? ` 身長${input.heightCm}cm・直近体重${latestWeight}kgは提案理由の表示にだけ使い、負荷の自動処方には使いません。` : ' 身長・体重を登録すると、目標との関係を提案理由に追加できます。';
  return {
    status: 'train', title: `${minutes}分の全身ベーシック`, focus: '全身・余力を残す', minutes,
    reason: `${energyContext}、${goalContext}全身を偏りなく動かします。RPE 6〜7を上限の目安にし、本人が変更・中止できます。${profileContext}`,
    steps: ['椅子スクワットまたは立ち座り 6〜10回', '壁プッシュまたは軽いプッシュ 6〜10回', '支持ありヒップヒンジまたは背中の動作 6〜10回', '余力を確認し、必要なら1周で終了する'],
  };
}
