import { assessWeightPace } from '@/src/domain/health';
import { AppState } from '@/src/domain/types';
import { Body, Card, Inline, Metric, Notice, RouteCard, SectionTitle } from '@/src/ui/components';

export function WeightProgressCard({ state }: { state: AppState }) {
  const latest = [...state.measurements].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))[0];
  const pace = assessWeightPace({ adultConfirmed: state.adultConfirmed, heightCm: state.heightCm, targetWeightKg: state.targetWeightKg, targetDate: state.targetWeightDate, measurements: state.measurements });
  return <Card><SectionTitle>体重と長期目標</SectionTitle><Inline><Metric label="現在" value={latest ? `${latest.weightKg}kg` : '—'} /><Metric label="目標" value={state.targetWeightKg ? `${state.targetWeightKg}kg` : '—'} /><Metric label="28日トレンド" value={pace.trendKgPerWeek === undefined ? '—' : `${pace.trendKgPerWeek}kg/週`} /></Inline><Body>1日の増減で今日の運動量を増やしません。目標との接続は週単位で振り返ります。</Body>{pace.status === 'blocked' || pace.status === 'review' ? <Notice danger>{pace.message}</Notice> : null}<RouteCard href="/training/goal" eyebrow="GOAL" title="体重目標と推移を確認" description="安全境界と参考トレンドを確認します。" /></Card>;
}
