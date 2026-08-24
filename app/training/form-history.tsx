import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Metric, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

export default function FormHistoryScreen() {
  const { state } = useAppState();
  const history = [...state.formHistory].reverse();
  return <Screen>
    <Card><SectionTitle>フォーム確認履歴</SectionTitle><Body>どのガイドをいつ確認したかだけを端末内に残します。採点、写真、動画、身体能力の評価は保存しません。</Body><Metric label="確認回数" value={history.length} /></Card>
    {history.length ? history.map((item) => <Card key={item.id}><SectionTitle>{item.title}</SectionTitle><Body tone="normal">{new Date(item.viewedAt).toLocaleString('ja-JP')}</Body><RouteCard href={`/training/exercises/${item.guideId}`} eyebrow="REVIEW" title="ガイドをもう一度見る" description="安全条件と代替方法を確認します。" /></Card>) : <Card><Body>まだ履歴はありません。フォームガイドの「フォームを確認した」から記録できます。</Body></Card>}
  </Screen>;
}
