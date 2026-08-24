import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { suggestStudyAction } from '@/src/domain/study';
import { DailyCheckIn } from '@/src/domain/types';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Inline, Metric, ModeHeader, Notice, PrimaryButton, RouteCard, Screen, SectionTitle } from '@/src/ui/components';
import { colors } from '@/src/ui/theme';

export default function TodayScreen() {
  const { state, loading, error, actions } = useAppState();
  const router = useRouter();
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [minutes, setMinutes] = useState<2 | 5 | 10 | 15 | 25 | 35>(10);
  const [urgent, setUrgent] = useState(false);
  const latest = [...state.checkIns].reverse().find((item) => item.mode === state.mode && item.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10));
  const suggestion = useMemo(() => suggestStudyAction(state.studyGoal, (latest ?? { energy, availableMinutes: minutes }) as DailyCheckIn), [state.studyGoal, latest, energy, minutes]);
  const reminderDue = Platform.OS === 'web' && state.notification.enabled && state.notification.mode === state.mode && (new Date().getHours() * 60 + new Date().getMinutes() >= state.notification.hour * 60 + state.notification.minute);
  if (loading) return <Screen><ModeHeader eyebrow="LIFE COMPASS" title="現在地を確認中" /><Body>端末内データを読み込んでいます。</Body></Screen>;
  if (!state.onboardingComplete) return <Redirect href="/onboarding" />;
  const saveCheckIn = () => actions.addCheckIn({ mode: state.mode, energy, availableMinutes: minutes, note: urgent ? 'urgent-symptom' : undefined });
  return <Screen>
    <ModeHeader eyebrow="TODAY'S COMPASS" title="今日のコンパス" subtitle="始める・休む・学ぶ。今の状態に合う一つを選びます。" />
    {error ? <Notice danger>{error}</Notice> : null}
    {reminderDue ? <Notice>設定した開始時刻です。2分だけ始めるか、今日は休むかを自分で選べます。</Notice> : null}
    <Card>
      <SectionTitle>20秒の状態確認</SectionTitle><Body>提案の長さだけを調整します。良し悪しの採点には使いません。</Body>
      <Text style={{ color: colors.ink, fontWeight: '800', marginTop: 15 }}>エネルギー</Text>
      <ChoiceRow>{([1, 2, 3, 4, 5] as const).map((value) => <Choice key={value} selected={energy === value} onPress={() => setEnergy(value)} label={`${value}`} tint={state.mode === 'study' ? 'study' : 'primary'} />)}</ChoiceRow>
      <Text style={{ color: colors.ink, fontWeight: '800', marginTop: 15 }}>使える時間</Text>
      <ChoiceRow>{([2, 5, 10, 15, 25, 35] as const).map((value) => <Choice key={value} selected={minutes === value} onPress={() => setMinutes(value)} label={`${value}分`} tint={state.mode === 'study' ? 'study' : 'primary'} />)}</ChoiceRow>
      {state.mode === 'training' ? <><Text style={{ color: colors.ink, fontWeight: '800', marginTop: 15 }}>胸部症状・めまい・失神・異常な息切れ</Text><ChoiceRow><Choice selected={!urgent} onPress={() => setUrgent(false)} label="ない" /><Choice selected={urgent} onPress={() => setUrgent(true)} label="ある" /></ChoiceRow></> : null}
      <PrimaryButton label={latest ? '今日の状態を更新する' : '今日の状態を記録する'} onPress={saveCheckIn} tone={state.mode === 'study' ? 'study' : 'primary'} />
    </Card>
    {urgent ? <Card><SectionTitle>今日は開始を保留します</SectionTitle><Body tone="danger">運動を始めず、地域の緊急連絡先または医療専門家への相談を優先してください。このアプリは診断しません。</Body><PrimaryButton label="今日は閉じる" tone="quiet" onPress={() => actions.award('rest', 'training', '安全を優先した')} /></Card> : state.mode === 'study' ? <Card><Text style={{ color: colors.study, fontWeight: '900', fontSize: 12 }}>NEXT STUDY STEP</Text><SectionTitle>{suggestion.title}</SectionTitle><Body>{suggestion.reason}</Body><PrimaryButton label="Study Compassを開く" tone="study" onPress={() => router.push('/study')} /></Card> : <Card><Text style={{ color: colors.primary, fontWeight: '900', fontSize: 12 }}>NEXT SAFE STEP</Text><SectionTitle>{energy <= 2 ? '5分の回復またはフォーム確認' : `${Math.min(minutes, 20)}分の短いセッション`}</SectionTitle><Body>痛みや不調がなければ、余力を残せる範囲で進みます。</Body><PrimaryButton label="Training Compassを開く" onPress={() => router.push('/training')} /></Card>}
    <Inline><Metric label="学習（7日）" value={`${state.studySessions.filter((item) => Date.now() - new Date(item.startedAt).getTime() < 7 * 86_400_000).reduce((sum, item) => sum + item.minutes, 0)}分`} /><Metric label="安全な運動" value={`${state.workouts.filter((item) => item.safeCompletion).length}回`} /><Metric label="回復確認" value={`${state.recoveries.length}件`} /></Inline>
    <View style={{ height: 14 }} /><RouteCard href="/blue-team" eyebrow="BLUE TEAM" title="どうしても始めたくないとき" description="提案を見る、回復を見る、今日は閉じるの三つから選べます。" />
    <RouteCard href="/weekly-review" eyebrow="WEEKLY REVIEW" title="1週間を採点せずに振り返る" description="Study、Training、回復、休養の記録を並べて次週の環境を整えます。" />
  </Screen>;
}
