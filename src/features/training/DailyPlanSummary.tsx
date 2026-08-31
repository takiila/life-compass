import { planProgress } from '@/src/domain/dailyTrainingPlan';
import { DailyTrainingPlan } from '@/src/domain/types';
import { Body, Card, Inline, Metric, Notice, PrimaryButton, RouteCard, SectionTitle } from '@/src/ui/components';

export function DailyPlanSummary({ plan, onComplete, onRest }: { plan?: DailyTrainingPlan; onComplete: (itemId: string) => void; onRest: () => void }) {
  if (!plan) return <Card><SectionTitle>今日の最低ライン</SectionTitle><Body>まだ作っていません。状態を入力すると、最低ラインと理想ラインをアプリが先に提案します。</Body><SectionTitle>今日の理想ライン</SectionTitle><Body>最低ラインを成功扱いにし、その先の追加の前進として表示します。</Body><RouteCard href="/training/check-in" eyebrow="DAILY PLAN" title="今日のプランを作る" description="状態確認から自動提案へ進みます。" /></Card>;
  const progress = planProgress(plan);
  return <Card><SectionTitle>今日の最低ライン</SectionTitle><Inline><Metric label="進捗" value={`${progress.minimumCompleted}/${progress.minimumTotal}`} /><Metric label="判定" value={progress.minimumAchieved ? '達成' : '前進中'} /></Inline>{plan.items.filter((item) => item.tier === 'minimum').map((item) => <Body key={item.id} tone="normal">{item.completedAt ? '✓' : '○'} {item.title}</Body>)}
    <SectionTitle>今日の理想ライン</SectionTitle><Inline><Metric label="進捗" value={`${progress.idealCompleted}/${progress.idealTotal}`} /><Metric label="判定" value={progress.idealAchieved ? '追加達成' : '任意'} /></Inline>{plan.items.filter((item) => item.tier === 'ideal').map((item) => <Body key={item.id} tone="normal">{item.completedAt ? '✓' : '○'} {item.title}</Body>)}
    {plan.status === 'safety-hold' ? <Notice danger>Safety hold中です。本人調整でもTrainingへ変更できません。</Notice> : null}
    {plan.items.filter((item) => !item.completedAt).map((item) => <PrimaryButton key={item.id} label={`${item.title}を完了にする`} tone="quiet" onPress={() => onComplete(item.id)} />)}
    {plan.status !== 'safety-hold' ? <PrimaryButton label="今日は運動せず回復を優先する" tone="quiet" onPress={onRest} /> : null}
    <RouteCard href="/training/check-in" eyebrow="UPDATE" title="今日のプランを更新する" description="状態と使える時間を更新し、同日のプランを重複なく再提案します。" />
  </Card>;
}
