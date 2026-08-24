import { useState } from 'react';

import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Choice, ChoiceRow, Notice, PrimaryButton, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

const GUIDES = [
  { id: 'squat', title: '支持ありスクワット', steps: ['動かない椅子へ軽く手を添える', 'お尻を少し後ろへ引く', '痛みのない深さまで曲げ、息を吐きながら戻る'] },
  { id: 'hinge', title: 'ヒップヒンジ', steps: ['足を腰幅にする', '背中を無理に反らさず股関節を後ろへ引く', 'お尻を使ってゆっくり戻る'] },
  { id: 'push', title: '壁プッシュアップ', steps: ['手を壁へ置く', '体を一直線に保てる距離を選ぶ', '胸を壁へ近づけ、息を吐いて戻る'] },
  { id: 'row', title: '支持ありロウ', steps: ['片手を安定した支持へ置く', '軽い重さで肘を後ろへ引く', '肩をすくめずゆっくり戻す'] },
];

export default function FormGuideScreen() {
  const { actions } = useAppState();
  const [selected, setSelected] = useState(GUIDES[0]);
  return <Screen><Card><SectionTitle>フォームガイド</SectionTitle><Body>画像どおりの採点ではなく、支持、可動域、呼吸を自分で確認する一般的な手順です。</Body><ChoiceRow>{GUIDES.map((guide) => <Choice key={guide.id} selected={selected.id === guide.id} onPress={() => setSelected(guide)} label={guide.title} />)}</ChoiceRow></Card><Card><SectionTitle>{selected.title}</SectionTitle>{selected.steps.map((step, index) => <Body key={step} tone="normal">{index + 1}. {step}</Body>)}<Notice>鋭い痛み、めまい、胸の症状、しびれ、強い息苦しさがあれば中止します。</Notice><PrimaryButton label="フォームを確認した" onPress={() => actions.award('form', 'training', `${selected.title}を確認した`)} /></Card><RouteCard href="/form-camera" eyebrow="SELF VIEW" title="ライブ映像で自己確認" description="映像を保存せず、自動判定もしません。" /></Screen>;
}
