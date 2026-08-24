import { EXERCISE_GUIDES } from '@/src/domain/exercises';
import { Body, Card, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

export default function ExerciseLibraryScreen() {
  return <Screen>
    <Card><SectionTitle>Exercise Library</SectionTitle><Body>種目を一覧から選び、準備、手順、呼吸、セルフチェック、中止条件、簡単な代替方法まで確認できます。重量や回数の処方は行いません。</Body></Card>
    {EXERCISE_GUIDES.map((guide) => <RouteCard key={guide.id} href={`/training/exercises/${guide.id}`} eyebrow={guide.category} title={guide.title} description={guide.summary} />)}
  </Screen>;
}
