import { AppState } from '@/src/domain/types';
import { Body, Card, Inline, Metric, RouteCard, SectionTitle } from '@/src/ui/components';

export function WeeklyProgressCard({ state }: { state: AppState }) {
  const since = Date.now() - 7 * 86_400_000;
  const reflections = state.dailyReflections.filter((entry) => new Date(`${entry.date}T00:00:00`).getTime() >= since);
  return <Card><SectionTitle>今週の前進</SectionTitle><Inline><Metric label="最低ライン" value={`${reflections.filter((entry) => entry.minimumAchieved).length}日`} /><Metric label="理想ライン" value={`${reflections.filter((entry) => entry.idealAchieved).length}日`} /><Metric label="振り返り" value={`${reflections.length}日`} /><Metric label="安全な完了" value={state.workouts.filter((entry) => entry.safeCompletion).length} /></Inline><Body>連続日数は必須にしません。回復日や安全判断も、その日の最低ラインになれます。</Body><RouteCard href="/weekly-review" eyebrow="WEEKLY" title="1週間を調整する" description="実績を見て、来週案を自分で採用・変更・却下します。" /></Card>;
}
