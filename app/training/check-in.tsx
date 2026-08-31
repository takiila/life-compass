import { useRouter } from 'expo-router';
import { useState } from 'react';

import { TrainingCondition } from '@/src/domain/types';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Notice, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';

type Score = 1 | 2 | 3 | 4 | 5;
const ScoreRow = ({ value, onChange }: { value: Score; onChange: (value: Score) => void }) => <ChoiceRow>{([1, 2, 3, 4, 5] as const).map((score) => <Choice key={score} selected={score === value} onPress={() => onChange(score)} label={`${score}`} />)}</ChoiceRow>;

export default function TrainingCheckInScreen() {
  const { actions } = useAppState();
  const router = useRouter();
  const [energy, setEnergy] = useState<Score>(3);
  const [availableMinutes, setAvailableMinutes] = useState<2 | 5 | 10 | 15 | 25 | 35>(10);
  const [sleepQuality, setSleepQuality] = useState<Score>(3);
  const [fatigue, setFatigue] = useState<Score>(3);
  const [mood, setMood] = useState<Score>(3);
  const [soreness, setSoreness] = useState<Score>(2);
  const [urgentSymptom, setUrgentSymptom] = useState(false);
  const save = () => { const training: TrainingCondition = { sleepQuality, fatigue, mood, soreness, urgentSymptom }; actions.saveTrainingCheckInAndCreatePlan({ energy, availableMinutes, training }); router.replace('/training'); };
  return <Screen><Card><SectionTitle>今日の状態からプランを作る</SectionTitle><Body>入力は提案を安全側へ調整するために使い、良し悪しを採点しません。</Body></Card>
    <Card><SectionTitle>エネルギー</SectionTitle><ScoreRow value={energy} onChange={setEnergy} /><SectionTitle>使える時間</SectionTitle><ChoiceRow>{([2, 5, 10, 15, 25, 35] as const).map((value) => <Choice key={value} selected={availableMinutes === value} onPress={() => setAvailableMinutes(value)} label={`${value}分`} />)}</ChoiceRow></Card>
    <Card><SectionTitle>睡眠の質</SectionTitle><ScoreRow value={sleepQuality} onChange={setSleepQuality} /><SectionTitle>疲労</SectionTitle><ScoreRow value={fatigue} onChange={setFatigue} /><SectionTitle>気分</SectionTitle><ScoreRow value={mood} onChange={setMood} /><SectionTitle>筋肉痛・違和感</SectionTitle><ScoreRow value={soreness} onChange={setSoreness} /></Card>
    <Card><SectionTitle>胸部症状・めまい・失神・異常な息切れ</SectionTitle><ChoiceRow><Choice selected={!urgentSymptom} onPress={() => setUrgentSymptom(false)} label="ない" /><Choice selected={urgentSymptom} onPress={() => setUrgentSymptom(true)} label="ある" /></ChoiceRow>{urgentSymptom ? <Notice danger>Trainingを開始しないSafety planを作ります。本人調整で解除できません。</Notice> : null}<PrimaryButton label="今日のプランを保存" onPress={save} /></Card>
  </Screen>;
}
