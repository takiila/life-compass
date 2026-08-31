import { View } from 'react-native';

import { WeeklyAdjustmentCard } from '@/src/features/training/WeeklyAdjustmentCard';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Inline, Metric, ModeHeader, Notice, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

function mondayOf(date = new Date()) {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

export default function WeeklyReviewScreen() {
  const { state } = useAppState();
  const since = Date.now() - 7 * 86_400_000;
  const weekStart = mondayOf();
  const study = state.studySessions.filter((item) => new Date(item.startedAt).getTime() >= since);
  const workouts = state.workouts.filter((item) => new Date(item.completedAt).getTime() >= since);
  const recoveries = state.recoveries.filter((item) => new Date(item.createdAt).getTime() >= since);
  const checkIns = state.checkIns.filter((item) => new Date(item.createdAt).getTime() >= since);
  const rest = state.journey.filter((item) => item.kind === 'rest' && new Date(item.createdAt).getTime() >= since);
  const adjustment = state.weeklyAdjustments.find((entry) => entry.weekStart === weekStart);
  return <Screen><ModeHeader eyebrow="WEEKLY REVIEW" title="1週間の航海日誌" subtitle="体重の1日差ではなく、行動と回復を見て、来週を本人が決めます。" />
    <Inline><Metric label="学習" value={`${study.reduce((sum, item) => sum + item.minutes, 0)}分`} /><Metric label="運動" value={`${workouts.length}回`} /><Metric label="回復確認" value={`${recoveries.length}件`} /><Metric label="状態確認" value={`${checkIns.length}日`} /></Inline><View style={{ height: 14 }} />
    <Card><SectionTitle>今週に残ったもの</SectionTitle><Body tone="normal">Study: {study.length}セッション / Training: {workouts.length}セッション / 安全な休養: {rest.length}件</Body><Body>短時間、未実施、休養に減点はありません。体重だけで成功を決めません。</Body></Card>
    <WeeklyAdjustmentCard weekStart={weekStart} adjustment={adjustment} />
    <Notice>来週案は採用・編集した場合だけ使います。却下しても減点はありません。</Notice>
    <RouteCard href="/onboarding" eyebrow="ENVIRONMENT" title="開始環境を整え直す" description="ホーム画面、置き場所、開始時刻を再確認します。" />
  </Screen>;
}
