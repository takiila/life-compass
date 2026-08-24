import { useState } from 'react';

import { RecoveryRecord } from '@/src/domain/types';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Field, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';

const AREAS: { key: RecoveryRecord['area']; label: string }[] = [{ key: 'chest', label: '胸' }, { key: 'back', label: '背中' }, { key: 'legs', label: '脚' }, { key: 'shoulders', label: '肩' }, { key: 'arms', label: '腕' }, { key: 'core', label: '体幹' }];

export default function RecoveryScreen() {
  const { state, actions } = useAppState();
  const [area, setArea] = useState<RecoveryRecord['area']>('legs');
  const [soreness, setSoreness] = useState(2);
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState('');
  return <Screen><Card><SectionTitle>回復状況</SectionTitle><Body>自己記録を振り返る目安です。鋭い痛み、腫れ、長く続く違和感では運動を中止してください。</Body><ChoiceRow>{AREAS.map((item) => <Choice key={item.key} selected={area === item.key} onPress={() => setArea(item.key)} label={item.label} />)}</ChoiceRow><Body tone="normal">筋肉痛 {soreness}/10</Body><ChoiceRow>{[0, 2, 4, 6, 8, 10].map((value) => <Choice key={value} selected={soreness === value} onPress={() => setSoreness(value)} label={`${value}`} />)}</ChoiceRow><Body tone="normal">負荷の強さ {intensity}/5</Body><ChoiceRow>{[1, 2, 3, 4, 5].map((value) => <Choice key={value} selected={intensity === value} onPress={() => setIntensity(value)} label={`${value}`} />)}</ChoiceRow><Field label="次回の自分へのメモ（任意）" value={note} onChangeText={setNote} multiline /><PrimaryButton label="回復を記録" onPress={() => actions.addRecovery({ area, soreness, intensity, note: note.trim() || undefined })} /></Card>
    <Card><SectionTitle>最近の部位別記録</SectionTitle>{state.recoveries.length ? [...state.recoveries].reverse().slice(0, 8).map((item) => <Body key={item.id} tone="normal">{AREAS.find((areaItem) => areaItem.key === item.area)?.label} · 筋肉痛 {item.soreness}/10 · 負荷 {item.intensity}/5</Body>) : <Body>まだ記録はありません。休む判断もJourneyの進行になります。</Body>}</Card></Screen>;
}
