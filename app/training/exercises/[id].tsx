import { useLocalSearchParams } from 'expo-router';

import { findExerciseGuide } from '@/src/domain/exercises';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Notice, PrimaryButton, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { actions } = useAppState();
  const guide = findExerciseGuide(id);
  if (!guide) return <Screen><Notice danger>種目が見つかりません。一覧から選び直してください。</Notice><RouteCard href="/training/exercises" eyebrow="LIBRARY" title="種目一覧へ戻る" description="利用できる種目を確認します。" /></Screen>;
  return <Screen>
    <Card><Body>{guide.category}</Body><SectionTitle>{guide.title}</SectionTitle><Body>{guide.summary}</Body></Card>
    <Card><SectionTitle>セットアップ</SectionTitle>{guide.setup.map((item) => <Body key={item} tone="normal">・{item}</Body>)}</Card>
    <Card><SectionTitle>手順</SectionTitle>{guide.steps.map((item, index) => <Body key={item} tone="normal">{index + 1}. {item}</Body>)}</Card>
    <Card><SectionTitle>呼吸</SectionTitle><Body tone="normal">{guide.breathing}</Body></Card>
    <Card><SectionTitle>セルフチェック</SectionTitle>{guide.selfChecks.map((item) => <Body key={item} tone="normal">・{item}</Body>)}</Card>
    <Card><SectionTitle>中止条件</SectionTitle><Notice danger>{guide.stopConditions.join('／')}</Notice></Card>
    <Card><SectionTitle>もっと簡単な代替</SectionTitle><Body tone="normal">{guide.alternative}</Body></Card>
    <PrimaryButton label="フォームを確認した" onPress={() => actions.recordFormView(guide.id, guide.title)} />
    <RouteCard href="/training/form-history" eyebrow="HISTORY" title="確認履歴を見る" description="確認日時だけを端末内で振り返ります。" />
  </Screen>;
}
