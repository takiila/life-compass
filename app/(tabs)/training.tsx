import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { recommendTraining } from '@/src/domain/training';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Field, Inline, Metric, ModeHeader, Notice, PrimaryButton, RouteCard, Screen, SectionTitle } from '@/src/ui/components';
import { colors } from '@/src/ui/theme';

export default function TrainingScreen() {
  const { state, actions } = useAppState();
  const today = new Date().toISOString().slice(0, 10);
  const latestCheckIn = [...state.checkIns].reverse().find((item) => item.mode === 'training' && item.createdAt.slice(0, 10) === today);
  const recommendation = useMemo(() => recommendTraining({ checkIn: latestCheckIn, measurements: state.measurements, recoveries: state.recoveries, workouts: state.workouts, heightCm: state.heightCm, targetWeightKg: state.targetWeightKg }), [latestCheckIn, state.heightCm, state.measurements, state.recoveries, state.targetWeightKg, state.workouts]);
  const [focus, setFocus] = useState(recommendation.focus);
  const [minutes, setMinutes] = useState<5 | 10 | 20>(recommendation.minutes);
  const [rpe, setRpe] = useState(6);
  const [started, setStarted] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const safe = rpe <= 7;
  const complete = () => {
    actions.addWorkout({ focus: focus.trim() || recommendation.focus, minutes, sets: [{ reps: 8, rpe }], safeCompletion: safe });
    setRecorded(true);
    setStarted(false);
  };

  return <Screen><ModeHeader eyebrow="TRAINING COMPASS" title="今日の状態から決める" subtitle="状態 → 理由付き提案 → 実行 → RPE記録 → 振り返りを一つにつなぎます。" />
    <Inline><Metric label="安全な完了" value={state.workouts.filter((item) => item.safeCompletion).length} /><Metric label="回復記録" value={state.recoveries.length} /><Metric label="体重記録" value={state.measurements.length} /></Inline><View style={{ height: 14 }} />
    {!latestCheckIn ? <Notice>先に「今日」タブでエネルギー・使える時間・危険症状を確認すると、提案が今日の状態に合います。</Notice> : null}
    <Card>
      <Text style={{ color: recommendation.status === 'stop' ? colors.danger : colors.primary, fontWeight: '900', fontSize: 12 }}>TODAY&apos;S RECOMMENDATION</Text>
      <SectionTitle>{recommendation.title}</SectionTitle><Body>{recommendation.reason}</Body>
      {recommendation.status === 'stop' ? <Notice danger>運動を開始せず、安全導線を優先してください。</Notice> : recommendation.status === 'recover' ? <Notice>下の「部位別の回復」から状態を記録し、運動を追加しない選択ができます。</Notice> : <>
        <Field label="今日の焦点（変更できます）" value={focus} onChangeText={setFocus} />
        <Body tone="normal">使う時間</Body><ChoiceRow>{([5, 10, 20] as const).map((value) => <Choice key={value} selected={minutes === value} onPress={() => setMinutes(value)} label={`${value}分`} />)}</ChoiceRow>
        <PrimaryButton label={started ? '実行手順を閉じる' : 'この提案で始める'} onPress={() => setStarted((value) => !value)} />
      </>}
    </Card>
    {started && recommendation.status === 'train' ? <Card><SectionTitle>実行手順</SectionTitle>{recommendation.steps.map((step, index) => <Body key={step} tone="normal">{index + 1}. {step}</Body>)}<Notice>鋭い痛み、胸部症状、めまい、失神、異常な息切れが出たら中止してください。回数や周回は減らせます。</Notice><Body tone="normal">終わった時の主観的なきつさ RPE: {rpe}</Body><ChoiceRow>{[5, 6, 7, 8, 9].map((value) => <Choice key={value} selected={rpe === value} onPress={() => setRpe(value)} label={`${value}`} />)}</ChoiceRow><Body>{safe ? '余力を残した完了として記録します。' : 'RPE 8以上は安全な完了・試練進行として扱いません。無理に下げる必要はありません。'}</Body><PrimaryButton label="実行結果を記録する" onPress={complete} /></Card> : null}
    {recorded ? <Notice>記録しました。次は痛みや疲労が残っていないか「部位別の回復」で振り返れます。</Notice> : null}
    <RouteCard href="/training/goal" eyebrow="GOAL PACE" title="身長・体重・目標を確認" description="一般的なペースと、提案理由に使う現在地を記録します。" />
    <RouteCard href="/training/recovery" eyebrow="RECOVERY" title="部位別の回復" description="提案前後の負荷と筋肉痛を短く記録します。" />
    <RouteCard href="/training/form-guide" eyebrow="FORM" title="フォームガイド" description="支持ありの始め方と中止の目安を確認します。" />
    <RouteCard href="/training/exercises" eyebrow="EXERCISES" title="種目ライブラリ" description="一覧から準備、呼吸、セルフチェック、代替方法まで確認します。" />
    <RouteCard href="/training/form-history" eyebrow="FORM HISTORY" title="フォーム確認履歴" description="採点せず、確認したガイドと日時だけを振り返ります。" />
    <RouteCard href="/training/library" eyebrow="KNOWLEDGE" title="知識書庫" description="余力、回復、器具、目的別の基本を読みます。" />
    <RouteCard href="/form-camera" eyebrow="SELF VIEW" title="カメラで自己確認" description="保存・採点なしのライブプレビューです。" />
  </Screen>;
}
