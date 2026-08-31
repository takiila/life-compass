import { DailyReflection } from '@/src/domain/types';
import { Body, Card, RouteCard, SectionTitle } from '@/src/ui/components';

export function DailyReflectionCard({ reflection }: { reflection?: DailyReflection }) {
  return <Card><SectionTitle>今日の振り返り</SectionTitle>{reflection ? <Body tone="normal">保存済み · 食事 {reflection.nutrition}/5 · 睡眠 {reflection.sleep}/5 · 疲労 {reflection.fatigue}/5 · 気分 {reflection.mood}/5</Body> : <Body>普段は4項目を数tap。必要な日だけ自由記述を追加できます。</Body>}<RouteCard href="/training/reflection" eyebrow="REFLECTION" title={reflection ? '今日の振り返りを更新' : '今日を短く振り返る'} description="最低・理想ラインの達成状況はプランから自動で記録します。" /></Card>;
}
