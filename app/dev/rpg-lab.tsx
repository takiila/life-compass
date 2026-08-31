import { isRpgSandboxAvailable } from '@/src/domain/rpgSandbox';
import { useRpgSandbox } from '@/src/state/RpgSandboxProvider';
import { Body, Card, Inline, Metric, Notice, PrimaryButton, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

const FEATURES = [
  ['/journey/stage?sandbox=1', 'STAGE RUN', 'Stage Run', '5段階の進行表示と完了境界を確認します。'],
  ['/journey/adventure?sandbox=1', 'ADVENTURE', 'Adventure', '選択分岐と直近結果を確認します。'],
  ['/journey/tower?sandbox=1', 'TRIALS', 'Trials / 境界の塔', '条件を待たず、試練を順番に灯します。'],
  ['/journey/nebula?sandbox=1', 'NEBULA', 'Nebula', '安全な帰還と完走の両方を記録します。'],
  ['/blue-team?sandbox=1', 'BLUE TEAM', 'Blue Team', '通常のBlue Team画面をSandbox stateで確認します。'],
  ['/journey/profile?sandbox=1', 'TRAVELER', 'Traveler Profile', 'Sandbox内の仮実績だけを表示します。'],
  ['/journey/store?sandbox=1', 'STORE', 'Store', 'Sandbox星貨で報酬解放を確認します。'],
  ['/journey/cosmetics?sandbox=1', 'COLLECTION', 'Finite Collection', '重複なしの有限collectionを確認します。'],
  ['/journey/record?sandbox=1', 'RECORD', '戦歴', 'Sandboxの帰還・完走記録を確認します。'],
] as const;

export default function RpgLabScreen() {
  const { state, reset } = useRpgSandbox();
  if (!isRpgSandboxAvailable(__DEV__)) {
    return <Screen><Card><Body>DEVELOPMENT ONLY</Body><SectionTitle>RPG Sandboxは無効です</SectionTitle><Body>この画面はdevelopment buildでのみ利用できます。productionの進行・通貨・collectionへは接続しません。</Body></Card><RouteCard href="/journey" eyebrow="JOURNEY" title="通常のJourneyへ戻る" description="現在の保存データを表示します。" /></Screen>;
  }

  return <Screen>
    <Card><Body>RPG SANDBOX · DEVELOPMENT ONLY</Body><SectionTitle>待たずに実画面をためす</SectionTitle><Body>各入口は通常のJourney feature画面を使い、状態だけをmemory-only Sandboxへ差し替えます。通常のXP、星貨、試練、collection、backupへ保存されず、resetまたは再起動で消えます。</Body><Inline><Metric label="Sandbox星貨" value={state.coins} /><Metric label="Stage" value={state.stage} /><Metric label="試練" value={`${state.completedTrials.length}/5`} /></Inline><Notice>ここでの操作は運動・学習実績や通常saveを変更しません。</Notice></Card>
    {FEATURES.map(([href, eyebrow, title, description]) => <RouteCard key={href} href={href} eyebrow={eyebrow} title={title} description={description} />)}
    <PrimaryButton label="Sandboxを初期状態へreset" tone="quiet" onPress={reset} />
    <RouteCard href="/journey" eyebrow="EXIT SANDBOX" title="通常のJourneyへ戻る" description="Sandboxの状態を保存せず終了します。" />
  </Screen>;
}
