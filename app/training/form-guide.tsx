import { useState } from 'react';

import { EXERCISE_GUIDES } from '@/src/domain/exercises';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Notice, PrimaryButton, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

export default function FormGuideScreen() {
  const { actions } = useAppState();
  const [selected, setSelected] = useState(EXERCISE_GUIDES[0]);
  return <Screen>
    <Card><SectionTitle>フォームガイド</SectionTitle><Body>画像どおりの採点ではなく、支持、可動域、呼吸を自分で確認する一般的な手順です。</Body><ChoiceRow>{EXERCISE_GUIDES.slice(0, 4).map((guide) => <Choice key={guide.id} selected={selected.id === guide.id} onPress={() => setSelected(guide)} label={guide.title} />)}</ChoiceRow></Card>
    <Card><SectionTitle>{selected.title}</SectionTitle><Body tone="normal">準備</Body>{selected.setup.map((step) => <Body key={step}>・{step}</Body>)}<Body tone="normal">動き</Body>{selected.steps.map((step, index) => <Body key={step}>{index + 1}. {step}</Body>)}<Body tone="normal">呼吸</Body><Body>{selected.breathing}</Body><Notice>{selected.stopConditions.join('／')}があれば中止します。</Notice><PrimaryButton label="フォームを確認した" onPress={() => actions.recordFormView(selected.id, selected.title)} /></Card>
    <RouteCard href={`/training/exercises/${selected.id}`} eyebrow="DETAIL" title="詳細なセルフチェック" description="代替方法と中止条件まで確認します。" />
    <RouteCard href="/training/form-history" eyebrow="HISTORY" title="フォーム確認履歴" description="採点せず、確認した日時だけを振り返ります。" />
    <RouteCard href="/form-camera" eyebrow="SELF VIEW" title="ライブ映像で自己確認" description="映像を保存せず、自動判定もしません。" />
  </Screen>;
}
