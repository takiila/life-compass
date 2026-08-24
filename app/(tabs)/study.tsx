import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { suggestStudyAction, weeklyStudyMinutes } from '@/src/domain/study';
import { DailyCheckIn, StudyGoal } from '@/src/domain/types';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Field, Inline, Metric, ModeHeader, Notice, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';
import { colors } from '@/src/ui/theme';

export default function StudyScreen() {
  const { state, actions } = useAppState();
  const goal = state.studyGoal;
  const [name, setName] = useState(goal?.qualificationName ?? '');
  const [date, setDate] = useState(goal?.targetDate ?? '');
  const [material, setMaterial] = useState(goal?.material ?? '');
  const [smallest, setSmallest] = useState(goal?.smallestAction ?? '教材を開き、見出しを1つ読む');
  const [weekly, setWeekly] = useState(String(goal?.weeklyMinutes ?? 90));
  const [topics, setTopics] = useState(goal?.topics.map((item) => item.name).join('、') ?? '基礎、問題演習、復習');
  const [selectedMinutes, setSelectedMinutes] = useState<2 | 5 | 10 | 15 | 25>(10);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(id);
  }, [running, remaining]);
  useEffect(() => { if (running && remaining === 0) setRunning(false); }, [running, remaining]);
  const latest = [...state.checkIns].reverse().find((item) => item.mode === 'study') ?? ({ energy: 3, availableMinutes: selectedMinutes } as DailyCheckIn);
  const suggestion = useMemo(() => suggestStudyAction(goal, latest), [goal, latest]);
  const total = weeklyStudyMinutes(state.studySessions);
  const saveGoal = () => {
    const next: StudyGoal = { qualificationName: name.trim(), targetDate: date.trim() || undefined, material: material.trim(), smallestAction: smallest.trim(), weeklyMinutes: Math.max(10, Number(weekly) || 90), topics: topics.split(/[、,]/).map((topic, index) => ({ id: `topic-${index}`, name: topic.trim(), progress: goal?.topics[index]?.progress ?? 0 })).filter((item) => item.name) };
    actions.saveStudyGoal(next);
  };
  const start = () => { setRemaining(selectedMinutes * 60); setRunning(true); };
  const complete = () => { actions.addStudySession({ minutes: selectedMinutes, topic: goal?.topics[0]?.name, note: smallest, }); setRunning(false); setRemaining(0); };
  const clock = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  return <Screen><ModeHeader eyebrow="STUDY COMPASS" title={goal?.qualificationName || '資格を一つ決める'} subtitle="今日の一歩を小さくし、開始と振り返りを同じ場所に残します。" />
    <Inline><Metric label="直近7日" value={`${total}分`} /><Metric label="週間目標" value={`${goal?.weeklyMinutes ?? 0}分`} /><Metric label="完了セッション" value={state.studySessions.length} /></Inline><View style={{ height: 14 }} />
    <Card><Text style={{ color: colors.study, fontWeight: '900', fontSize: 12 }}>TODAY'S NEXT STEP</Text><SectionTitle>{suggestion.title}</SectionTitle><Body>{suggestion.reason}</Body><ChoiceRow>{([2, 5, 10, 15, 25] as const).map((value) => <Choice key={value} selected={selectedMinutes === value} onPress={() => setSelectedMinutes(value)} label={`${value}分`} tint="study" />)}</ChoiceRow>{running || remaining > 0 ? <><Text accessibilityLiveRegion="polite" style={{ color: colors.study, fontWeight: '900', fontSize: 42, textAlign: 'center', marginTop: 18 }}>{clock}</Text><PrimaryButton label={running ? '一時停止' : '再開'} tone="quiet" onPress={() => setRunning(!running)} /><PrimaryButton label="ここまでを完了として記録" tone="study" onPress={complete} /></> : <PrimaryButton label={`${selectedMinutes}分を始める`} tone="study" onPress={start} />}</Card>
    {!goal ? <Notice>資格名と教材を登録すると、次の一歩を毎回同じ場所から始められます。</Notice> : null}
    <Card><SectionTitle>資格と開始環境</SectionTitle><Field label="資格名" value={name} onChangeText={setName} placeholder="例: 基本情報技術者" /><Field label="目標日（任意）" value={date} onChangeText={setDate} placeholder="2026-12-31" /><Field label="使う教材" value={material} onChangeText={setMaterial} placeholder="机の上の問題集" /><Field label="最小行動" value={smallest} onChangeText={setSmallest} /><Field label="週間目標（分）" value={weekly} onChangeText={setWeekly} keyboardType="number-pad" /><Field label="分野（読点区切り）" value={topics} onChangeText={setTopics} /><PrimaryButton label="Study設定を保存" tone="study" disabled={!name.trim() || !material.trim()} onPress={saveGoal} /></Card>
    <Card><SectionTitle>最近の記録</SectionTitle>{state.studySessions.length ? [...state.studySessions].reverse().slice(0, 5).map((item) => <Body key={item.id} tone="normal">{new Date(item.startedAt).toLocaleDateString('ja-JP')} · {item.minutes}分 · {item.topic || '自由学習'}</Body>) : <Body>まだ記録はありません。2分でも完了として残せます。</Body>}</Card>
  </Screen>;
}
