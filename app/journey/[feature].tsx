import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import { journeyLevel } from '@/src/domain/journey';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Inline, Metric, Notice, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';

const COSMETICS = [
  ['dawn-cloak', '暁の旅装'], ['rest-cloak', '静養の外套'], ['horizon', '地平の探索服'], ['star-reader', '星幕の読者'],
  ['dawn-title', '暁を携える者'], ['margin-title', '余白を守る者'], ['horizon-title', '地平を読む者'], ['star-title', '星幕の綴り手'],
] as const;

const TRIALS = [
  { id: 'margin', title: '余裕の操縦者', description: 'RPE 7以下の安全な完了を3回記録する。', passed: (safe: number, recovery: number, rhythm: number) => safe >= 3 },
  { id: 'recovery', title: '回復の司令塔', description: '安全な完了3回と回復確認2回を達成する。', passed: (safe: number, recovery: number) => safe >= 3 && recovery >= 2 },
  { id: 'control', title: '片側の羅針', description: '安全な完了5回を積み、支持ありの自己確認を終える。', passed: (safe: number) => safe >= 5 },
  { id: 'breath', title: '可動と呼吸の門', description: '5日分の記録リズムを作る。', passed: (_safe: number, _recovery: number, rhythm: number) => rhythm >= 5 },
  { id: 'adept', title: 'コンパスの練達者', description: '試練3つ、安全な完了8回、7日分のリズムを達成する。', passed: (safe: number, _recovery: number, rhythm: number, completed: number) => safe >= 8 && rhythm >= 7 && completed >= 3 },
];

export default function JourneyFeatureScreen() {
  const { feature } = useLocalSearchParams<{ feature: string }>();
  const { state, actions } = useAppState();
  const [message, setMessage] = useState('');
  const level = journeyLevel(state.journey);
  const coins = Math.max(0, Math.floor(level.xp / 2) - state.journeyInventory.spentCoins);
  const safe = state.workouts.filter((item) => item.safeCompletion).length;
  const days = new Set([...state.studySessions.map((item) => item.startedAt.slice(0, 10)), ...state.workouts.map((item) => item.completedAt.slice(0, 10)), ...state.recoveries.map((item) => item.createdAt.slice(0, 10))]).size;
  const completed = state.journeyInventory.completedTrials.length;
  const content = useMemo(() => ({
    world: ['星屑の巡礼路', 'フォーム、実践、回復、学習の安全な一手で、準備の霧を晴らします。'],
    profile: ['旅人プロフィール', '身体能力の比較ではなく、記録・回復・安全な選択で育った軌跡です。'],
    store: ['星貨の交換所', '星貨は見た目や称号を彩る通貨です。現金価値、課金、性能差はありません。'],
    cosmetics: ['装いの観測所', '未所持品だけから観測します。重複、課金、性能差はありません。'],
    tower: ['境界の塔', '力任せではなく、制御・継続・回復の判断を積み上げます。'],
    nebula: ['星雲の真相', '塔の向こうにある周回遠征です。安全な帰還も攻略として記録します。'],
    record: ['戦歴と実績', '完走・帰還を身体の負荷や連続日数と切り離して振り返ります。'],
  }[feature ?? ''] ?? ['Life Journey', '小さな選択を振り返ります。']), [feature]);

  return <Screen><Card><Body>LIFE JOURNEY</Body><SectionTitle>{content[0]}</SectionTitle><Body>{content[1]}</Body><Inline><Metric label="星貨" value={coins} /><Metric label="レベル" value={level.level} /><Metric label="試練" value={`${completed}/5`} /></Inline>{message ? <Notice>{message}</Notice> : null}</Card>
    {feature === 'world' ? <><Card><SectionTitle>準備の霧</SectionTitle><Body>今日の状態確認、学習、フォーム確認、安全なセッション、回復確認は1日各1回だけ進行します。</Body><Metric label="霧を晴らした行動" value={new Set(state.journey.map((event) => event.kind)).size} /></Card><PrimaryButton label="知識を確認した" onPress={() => actions.award('knowledge', 'shared', '世界の羅針を読んだ')} /></> : null}
    {feature === 'profile' ? <Card><SectionTitle>星図の旅人</SectionTitle><Inline><Metric label="Study" value={`${state.studySessions.length}回`} /><Metric label="Training" value={`${safe}回`} /><Metric label="回復" value={`${state.recoveries.length}回`} /><Metric label="装い" value={`${state.journeyInventory.ownedCosmetics.length}/8`} /></Inline><Body>StudyとTrainingの実績は別々に残り、共通XPが旅全体を進めます。</Body></Card> : null}
    {feature === 'store' ? <>{[['dawn-palette', '暁のパレット', 18], ['focus-cue', '集中キュー', 12], ['gentle-lines', '穏やかな対抗台詞', 20]].map(([id, title, cost]) => <Card key={id as string}><SectionTitle>{title}</SectionTitle><Body>見た目・言葉だけを変え、提案や運動負荷は変えません。</Body><PrimaryButton label={`${cost} Cで解放`} tone="quiet" onPress={() => setMessage(actions.unlockJourneyItem(id as string, cost as number, 'reward'))} /></Card>)}</> : null}
    {feature === 'cosmetics' ? <><Card><SectionTitle>コレクション</SectionTitle>{COSMETICS.map(([id, title]) => <Body key={id} tone="normal">{state.journeyInventory.ownedCosmetics.includes(id) ? '✦' : '○'} {title}</Body>)}<Body>残り {COSMETICS.length - state.journeyInventory.ownedCosmetics.length} / {COSMETICS.length} 種</Body></Card><PrimaryButton label="10 Cで未所持品を観測" disabled={state.journeyInventory.ownedCosmetics.length === COSMETICS.length} onPress={() => { const remaining = COSMETICS.filter(([id]) => !state.journeyInventory.ownedCosmetics.includes(id)); const picked = remaining[Math.floor(Math.random() * remaining.length)]; if (picked) setMessage(actions.unlockJourneyItem(picked[0], 10, 'cosmetic')); }} /></> : null}
    {feature === 'tower' ? TRIALS.map((trial) => { const passed = trial.passed(safe, state.recoveries.length, days, completed); const done = state.journeyInventory.completedTrials.includes(trial.id); return <Card key={trial.id}><SectionTitle>{trial.title}</SectionTitle><Body>{trial.description}</Body><Body>{done ? '達成済み' : passed ? '達成条件を確認できます' : '進行中'}</Body><PrimaryButton label={done ? '達成済み' : '自己確認して灯す'} disabled={!passed || done} onPress={() => actions.completeTrial(trial.id)} /></Card>; }) : null}
    {feature === 'nebula' ? completed < 5 ? <Notice>境界の塔をすべて灯すと解放されます。現在 {completed}/5。無理に進む必要はありません。</Notice> : <Card><SectionTitle>今回の星路</SectionTitle><Body>追加の運動負荷を求めず、既存の安全な行動を物語として選びます。</Body><PrimaryButton label="安全に帰還する" tone="quiet" onPress={() => actions.recordNebulaRun(true)} /><PrimaryButton label="終局まで観測した" onPress={() => actions.recordNebulaRun(false)} /></Card> : null}
    {feature === 'record' ? <Card><SectionTitle>星路の記録</SectionTitle><Inline><Metric label="星路" value={state.journeyInventory.nebulaRuns.length} /><Metric label="安全な帰還" value={state.journeyInventory.nebulaRuns.filter((run) => run.safeReturn).length} /><Metric label="完走" value={state.journeyInventory.nebulaRuns.filter((run) => !run.safeReturn).length} /></Inline>{state.journeyInventory.nebulaRuns.length ? [...state.journeyInventory.nebulaRuns].reverse().map((run) => <Body key={run.id} tone="normal">{new Date(run.completedAt).toLocaleDateString('ja-JP')} · {run.safeReturn ? '安全な帰還' : '終局を観測'}</Body>) : <Body>まだ戦歴はありません。</Body>}</Card> : null}
  </Screen>;
}
