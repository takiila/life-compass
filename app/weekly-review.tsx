import { View } from 'react-native';

import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Inline, Metric, ModeHeader, Notice, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

export default function WeeklyReviewScreen() {
  const { state } = useAppState();
  const since = Date.now() - 7 * 86_400_000;
  const study = state.studySessions.filter((item) => new Date(item.startedAt).getTime() >= since);
  const workouts = state.workouts.filter((item) => new Date(item.completedAt).getTime() >= since);
  const recoveries = state.recoveries.filter((item) => new Date(item.createdAt).getTime() >= since);
  const checkIns = state.checkIns.filter((item) => new Date(item.createdAt).getTime() >= since);
  const rest = state.journey.filter((item) => item.kind === 'rest' && new Date(item.createdAt).getTime() >= since);
  return <Screen><ModeHeader eyebrow="WEEKLY REVIEW" title="1週間の航海日誌" subtitle="達成率ではなく、始めやすかった条件と安全な判断を次週へ残します。" />
    <Inline><Metric label="学習" value={`${study.reduce((sum, item) => sum + item.minutes, 0)}分`} /><Metric label="運動" value={`${workouts.length}回`} /><Metric label="回復確認" value={`${recoveries.length}件`} /><Metric label="状態確認" value={`${checkIns.length}日`} /></Inline><View style={{ height: 14 }} />
    <Card><SectionTitle>今週に残ったもの</SectionTitle><Body tone="normal">Study: {study.length}セッション / Training: {workouts.length}セッション / 安全な休養: {rest.length}件</Body><Body>短時間、未実施、休養に減点はありません。記録が少ない週も、教材や運動用品の場所・開始時刻・最小行動を調整する材料になります。</Body></Card>
    <Notice>次週は「教材を見える場所へ置く」「用品を一か所へまとめる」「開始時刻を1つだけ決める」のうち、一番小さい変更を選んでください。</Notice>
    <RouteCard href="/onboarding" eyebrow="ENVIRONMENT" title="開始環境を整え直す" description="ホーム画面、置き場所、開始時刻を再確認します。" />
  </Screen>;
}
