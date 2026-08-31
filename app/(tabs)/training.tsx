import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { recommendTraining } from '@/src/domain/training';
import { DailyPlanSummary } from '@/src/features/training/DailyPlanSummary';
import { DailyReflectionCard } from '@/src/features/training/DailyReflectionCard';
import { TrainingTools } from '@/src/features/training/TrainingTools';
import { WeeklyProgressCard } from '@/src/features/training/WeeklyProgressCard';
import { WeightProgressCard } from '@/src/features/training/WeightProgressCard';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Field, ModeHeader, Notice, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';
import { colors } from '@/src/ui/theme';

export default function TrainingScreen() {
  const { state, actions } = useAppState();
  const today = new Date().toISOString().slice(0, 10);
  const plan = state.dailyTrainingPlans.find((entry) => entry.date === today);
  const reflection = state.dailyReflections.find((entry) => entry.date === today);
  const latestCheckIn = [...state.checkIns].reverse().find((entry) => entry.mode === 'training' && entry.createdAt.slice(0, 10) === today);
  const recommendation = useMemo(() => recommendTraining({ checkIn: latestCheckIn, measurements: state.measurements, recoveries: state.recoveries, workouts: state.workouts, heightCm: state.heightCm, targetWeightKg: state.targetWeightKg }), [latestCheckIn, state.heightCm, state.measurements, state.recoveries, state.targetWeightKg, state.workouts]);
  const [focus, setFocus] = useState(recommendation.focus);
  const [minutes, setMinutes] = useState<5 | 10 | 20>(recommendation.minutes);
  const [rpe, setRpe] = useState(6);
  const [started, setStarted] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const safe = rpe <= 7;
  const complete = () => {
    actions.addWorkout({ focus: focus.trim() || recommendation.focus, minutes, sets: [{ reps: 8, rpe }], safeCompletion: safe });
    const trainingItem = plan?.items.find((entry) => entry.category === 'training' && entry.tier === 'minimum' && !entry.completedAt);
    if (plan && trainingItem) actions.completeDailyPlanItem(plan.id, trainingItem.id);
    setRecorded(true);
    setStarted(false);
  };

  return <Screen><ModeHeader eyebrow="DIET & TRAINING" title="今日の現在地" subtitle="最低ラインを成功とし、理想ラインは追加の前進として扱います。" />
    <WeightProgressCard state={state} />
    <DailyPlanSummary plan={plan} onComplete={(itemId) => plan && actions.completeDailyPlanItem(plan.id, itemId)} onRest={() => plan && actions.adjustDailyTrainingPlan(plan.id, { avoidTraining: true })} />
    <WeeklyProgressCard state={state} />
    <DailyReflectionCard reflection={reflection} />
    <Card><Text style={{ color: recommendation.status === 'stop' ? colors.danger : colors.primary, fontWeight: '900', fontSize: 12 }}>TODAY&apos;S RECOMMENDATION</Text><SectionTitle>既存のguided Training</SectionTitle><Body>{recommendation.reason}</Body>
      {recommendation.status === 'stop' ? <Notice danger>運動を開始せず、安全導線を優先してください。</Notice> : recommendation.status === 'recover' ? <Notice>今日は回復導線を優先します。Daily Planの回復項目を使えます。</Notice> : <><Field label="今日の焦点（変更できます）" value={focus} onChangeText={setFocus} /><Body tone="normal">使う時間</Body><ChoiceRow>{([5, 10, 20] as const).map((value) => <Choice key={value} selected={minutes === value} onPress={() => setMinutes(value)} label={`${value}分`} />)}</ChoiceRow><PrimaryButton label={started ? '実行手順を閉じる' : 'この提案で始める'} onPress={() => setStarted((value) => !value)} /></>}
    </Card>
    {started && recommendation.status === 'train' ? <Card><SectionTitle>実行手順</SectionTitle>{recommendation.steps.map((step, index) => <Body key={step} tone="normal">{index + 1}. {step}</Body>)}<Notice>鋭い痛み、胸部症状、めまい、失神、異常な息切れが出たら中止してください。</Notice><Body tone="normal">終わった時の主観的なきつさ RPE: {rpe}</Body><ChoiceRow>{[5, 6, 7, 8, 9].map((value) => <Choice key={value} selected={rpe === value} onPress={() => setRpe(value)} label={`${value}`} />)}</ChoiceRow><Body>{safe ? '余力を残した完了として記録します。' : 'RPE 8以上は安全な完了・試練進行として扱いません。'}</Body><PrimaryButton label="実行結果を記録する" onPress={complete} /></Card> : null}
    {recorded ? <Notice>記録しました。次は痛みや疲労が残っていないか「部位別の回復」で振り返れます。</Notice> : null}
    <TrainingTools />
  </Screen>;
}
