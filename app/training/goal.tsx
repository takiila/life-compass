import { useMemo, useState } from 'react';
import { Linking, Text } from 'react-native';

import { assessWeightPace } from '@/src/domain/health';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Field, Inline, Metric, Notice, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';

export default function WeightGoalScreen() {
  const { state, actions } = useAppState();
  const latest = [...state.measurements].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))[0];
  const [height, setHeight] = useState(String(state.heightCm ?? ''));
  const [weight, setWeight] = useState(String(latest?.weightKg ?? ''));
  const [target, setTarget] = useState(String(state.targetWeightKg ?? ''));
  const [date, setDate] = useState(state.targetWeightDate ?? '');
  const result = useMemo(() => assessWeightPace({ adultConfirmed: state.adultConfirmed, heightCm: state.heightCm, targetWeightKg: state.targetWeightKg, targetDate: state.targetWeightDate, measurements: state.measurements }), [state]);
  const save = () => { const h = Number(height); const w = Number(weight); const t = Number(target); if (h > 0 && w > 0 && t > 0 && date) { actions.addMeasurement({ weightKg: w }); actions.setWeightGoal(h, t, date); } };
  return <Screen><Card><SectionTitle>体重目標</SectionTitle><Body>達成保証やカロリー処方ではなく、一般的なペースと実測トレンドを確認します。</Body><Field label="身長（cm）" value={height} onChangeText={setHeight} keyboardType="decimal-pad" /><Field label="現在体重（kg）" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /><Field label="目標体重（kg）" value={target} onChangeText={setTarget} keyboardType="decimal-pad" /><Field label="目標日" value={date} onChangeText={setDate} placeholder="2026-12-31" /><PrimaryButton label="目標と現在体重を保存" onPress={save} /></Card>
    <Card><SectionTitle>現在の参考値</SectionTitle><Inline><Metric label="BMI" value={result.bmi ?? '—'} /><Metric label="目標BMI" value={result.targetBmi ?? '—'} /><Metric label="必要ペース" value={result.requiredKgPerWeek === undefined ? '—' : `${result.requiredKgPerWeek}kg/週`} /></Inline>{result.trendKgPerWeek !== undefined ? <Body tone="normal">28日トレンド: {result.trendKgPerWeek} kg/週</Body> : <Body>到達見込みは14日以上・3件以上の記録後に表示します。</Body>}{result.estimatedDate ? <Body tone="normal">現在のトレンドを単純延長した参考日: {result.estimatedDate}</Body> : null}<Notice danger={result.status === 'blocked' || result.status === 'review'}>{result.message}</Notice></Card>
    <Card><SectionTitle>根拠と限界</SectionTitle><Body>一般情報の表示根拠は次の一次情報です。BMIだけで健康状態を判断せず、薬、疾患、年齢、妊娠など個別事情は医療専門家へ相談してください。</Body>{[['厚生労働省 身体活動・運動ガイド2023', 'https://www.mhlw.go.jp/content/001194020.pdf'], ['e-ヘルスネット BMI', 'https://kennet.mhlw.go.jp/information/information/food/e-02-009.html'], ['CDC Losing Weight', 'https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html']].map(([label, url]) => <Text key={url} accessibilityRole="link" onPress={() => Linking.openURL(url)} style={{ color: '#11675f', fontWeight: '800', marginTop: 10 }}>{label} ↗</Text>)}</Card>
  </Screen>;
}
