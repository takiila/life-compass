import { useState } from 'react';
import { View } from 'react-native';

import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Field, Inline, Metric, ModeHeader, PrimaryButton, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

export default function TrainingScreen() {
  const { state, actions } = useAppState();
  const [focus, setFocus] = useState('全身');
  const [minutes, setMinutes] = useState<5 | 10 | 20>(10);
  const [rpe, setRpe] = useState(6);
  const safe = rpe <= 7;
  const complete = () => actions.addWorkout({ focus, minutes, sets: [{ reps: 8, rpe }], safeCompletion: safe });
  return <Screen><ModeHeader eyebrow="TRAINING COMPASS" title="無理のない一歩" subtitle="状態、回復、フォームを優先し、重量や連続日数を競いません。" />
    <Inline><Metric label="安全な完了" value={state.workouts.filter((item) => item.safeCompletion).length} /><Metric label="回復記録" value={state.recoveries.length} /><Metric label="体重記録" value={state.measurements.length} /></Inline><View style={{ height: 14 }} />
    <Card><SectionTitle>短いセッションを記録</SectionTitle><Body>痛み、胸部症状、めまい、失神、異常な息切れがある場合は開始しないでください。</Body><Field label="今日の焦点" value={focus} onChangeText={setFocus} /><ChoiceRow>{([5, 10, 20] as const).map((value) => <Choice key={value} selected={minutes === value} onPress={() => setMinutes(value)} label={`${value}分`} />)}</ChoiceRow><Body tone="normal">主観的なきつさ RPE: {rpe}</Body><ChoiceRow>{[5, 6, 7, 8, 9].map((value) => <Choice key={value} selected={rpe === value} onPress={() => setRpe(value)} label={`${value}`} />)}</ChoiceRow><Body>{safe ? '余力を残す安全な完了として記録できます。' : 'RPE 8以上は安全な完了・試練進行として扱いません。'}</Body><PrimaryButton label="今日のセッションを記録" onPress={complete} /></Card>
    <RouteCard href="/training/goal" eyebrow="GOAL PACE" title="体重目標と見込み" description="身長・体重・期限から一般的なペースを確認します。" />
    <RouteCard href="/training/recovery" eyebrow="RECOVERY" title="部位別の回復" description="負荷と筋肉痛を短く記録します。" />
    <RouteCard href="/training/form-guide" eyebrow="FORM" title="フォームガイド" description="支持ありの始め方と中止の目安を確認します。" />
    <RouteCard href="/training/library" eyebrow="KNOWLEDGE" title="知識書庫" description="余力、回復、器具、目的別の基本を読みます。" />
    <RouteCard href="/form-camera" eyebrow="SELF VIEW" title="カメラで自己確認" description="保存・採点なしのライブプレビューです。" />
  </Screen>;
}
