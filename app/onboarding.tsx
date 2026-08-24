import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Field, ModeHeader, Notice, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';
import { colors } from '@/src/ui/theme';

export default function OnboardingScreen() {
  const { state, actions } = useAppState();
  const router = useRouter();
  const [adult, setAdult] = useState(state.adultConfirmed);
  const [pwa, setPwa] = useState(false);
  const [material, setMaterial] = useState(false);
  const [gear, setGear] = useState(false);
  const [cue, setCue] = useState('20:00');
  const finish = () => { actions.finishOnboarding({ adultConfirmed: adult, environment: { pwaInstalled: pwa, materialPlaced: material, trainingGearPlaced: gear, cueTime: cue } }); router.replace('/'); };
  return <Screen><ModeHeader eyebrow="LIFE COMPASS" title="最初の一手を軽くする" subtitle="意志より先に、始めやすい置き場所と時刻を決めます。" />
    <Card><SectionTitle>ホーム画面に置く</SectionTitle><Body>SafariまたはChromeの共有メニューからホーム画面へ追加すると、開始までの手数が減ります。</Body><ChoiceRow><Choice selected={pwa} onPress={() => setPwa(!pwa)} label={pwa ? '追加した' : 'あとで追加する'} /></ChoiceRow></Card>
    <Card><SectionTitle>始める物を見える場所へ</SectionTitle><Body>教材と運動用品は、取り出す判断がいらない場所へ置きます。</Body><ChoiceRow><Choice selected={material} onPress={() => setMaterial(!material)} label="教材を置いた" tint="study" /><Choice selected={gear} onPress={() => setGear(!gear)} label="運動用品を置いた" /></ChoiceRow><Field label="開始を思い出す時刻" value={cue} onChangeText={setCue} placeholder="20:00" /></Card>
    <Card><SectionTitle>体重ペース表示の対象</SectionTitle><Body>成人向けの一般情報としてのみ表示します。生年月日は保存しません。</Body><ChoiceRow><Choice selected={adult} onPress={() => setAdult(true)} label="18歳以上" /><Choice selected={!adult} onPress={() => setAdult(false)} label="18歳未満・確認しない" /></ChoiceRow>{!adult ? <Notice>体重ペースの数値提案は停止します。Studyと運動・回復記録は利用できます。</Notice> : null}</Card>
    <Text style={{ color: colors.muted, lineHeight: 20, marginBottom: 8 }}>このアプリは医療上の診断を行いません。強い症状や痛みがある場合は開始せず、必要な相談を優先してください。</Text><PrimaryButton label="今日のコンパスを見る" onPress={finish} />
  </Screen>;
}
