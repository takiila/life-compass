import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Notice, PrimaryButton, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

const STEPS = [
  ['1. 小さな行動を選ぶ', 'Study、Training、回復、フォーム確認は、長さや重さではなく「始めたこと」を記録します。'],
  ['2. 共通XPで旅を進める', '同じ種類は1日1回まで。休養、短時間、未実施に減点はありません。'],
  ['3. 塔は安全判断の試練', '境界の塔は追い込みではなく、余力、回復、記録リズムを確認します。'],
  ['4. 星雲は安全な帰還も成果', '塔の先では完走だけでなく、安全に帰る選択も戦歴に残ります。'],
];

export default function RpgTutorialScreen() {
  const { state, actions } = useAppState();
  return <Screen>
    <Card><SectionTitle>Life Journey はじめての案内</SectionTitle><Body>この案内はいつでも再表示できます。ゲーム要素は運動負荷、学習量、連続日数を競わせません。</Body>{state.journeyInventory.tutorialCompletedAt ? <Notice>前回確認: {new Date(state.journeyInventory.tutorialCompletedAt).toLocaleString('ja-JP')}</Notice> : null}</Card>
    {STEPS.map(([title, description]) => <Card key={title}><SectionTitle>{title}</SectionTitle><Body tone="normal">{description}</Body></Card>)}
    <PrimaryButton label="案内を確認した" onPress={actions.completeRpgTutorial} />
    <RouteCard href="/journey" eyebrow="JOURNEY" title="旅へ戻る" description="現在のXP、塔、星雲を確認します。" />
  </Screen>;
}
