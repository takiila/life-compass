import { useState } from 'react';

import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Field, Notice, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';

type Score = 1 | 2 | 3 | 4 | 5;
const ScoreRow = ({ value, onChange }: { value: Score; onChange: (value: Score) => void }) => <ChoiceRow>{([1, 2, 3, 4, 5] as const).map((score) => <Choice key={score} selected={score === value} onPress={() => onChange(score)} label={`${score}`} />)}</ChoiceRow>;

export default function TrainingReflectionScreen() {
  const { state, actions } = useAppState();
  const date = new Date().toISOString().slice(0, 10);
  const existing = state.dailyReflections.find((entry) => entry.date === date);
  const [nutrition, setNutrition] = useState<Score>(existing?.nutrition ?? 3);
  const [sleep, setSleep] = useState<Score>(existing?.sleep ?? 3);
  const [fatigue, setFatigue] = useState<Score>(existing?.fatigue ?? 3);
  const [mood, setMood] = useState<Score>(existing?.mood ?? 3);
  const [note, setNote] = useState(existing?.note ?? '');
  const [saved, setSaved] = useState(Boolean(existing));
  const isSaved = saved || Boolean(existing);
  const save = () => { actions.saveDailyReflection({ nutrition, sleep, fatigue, mood, note }); setSaved(true); };
  return <Screen><Card><SectionTitle>今日を短く振り返る</SectionTitle><Body>普段は4項目だけ。理由を残したい日だけメモを使います。</Body></Card><Card><SectionTitle>食事</SectionTitle><ScoreRow value={nutrition} onChange={setNutrition} /><SectionTitle>睡眠</SectionTitle><ScoreRow value={sleep} onChange={setSleep} /><SectionTitle>疲労</SectionTitle><ScoreRow value={fatigue} onChange={setFatigue} /><SectionTitle>気分</SectionTitle><ScoreRow value={mood} onChange={setMood} /><Field label="任意メモ" value={note} onChangeText={setNote} multiline placeholder="うまくいった理由、明日変えたいことなど" /><PrimaryButton label="振り返りを保存" onPress={save} />{isSaved ? <Notice>今日の振り返りを保存しました。</Notice> : null}</Card></Screen>;
}
