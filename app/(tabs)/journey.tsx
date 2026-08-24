import { View } from 'react-native';

import { journeyLevel } from '@/src/domain/journey';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Inline, Metric, ModeHeader, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

export default function JourneyScreen() {
  const { state } = useAppState();
  const journey = journeyLevel(state.journey);
  return <Screen><ModeHeader eyebrow="LIFE JOURNEY" title="小さな選択の旅" subtitle="Study、Training、回復、休養のどれも共通の旅を進めます。" />
    <Inline><Metric label="レベル" value={journey.level} /><Metric label="合計XP" value={journey.xp} /><Metric label="次まで" value={`${journey.next} XP`} /></Inline><View style={{ height: 14 }} />
    <Card><SectionTitle>今日の進行</SectionTitle><Body>同じ種類の行動は1日1回だけXPになります。長さ、重量、連続日数では増えません。</Body>{state.journey.length ? [...state.journey].reverse().slice(0, 6).map((event) => <Body key={event.id} tone="normal">+{event.xp} XP · {event.title}</Body>) : <Body>状態確認から最初の一歩を記録できます。</Body>}</Card>
    <RouteCard href="/journey/tutorial" eyebrow="GUIDE" title={state.journeyInventory.tutorialCompletedAt ? '旅の案内をもう一度見る' : '旅の案内を見る'} description="XP、塔、星雲、安全な帰還の考え方を確認します。" />
    <RouteCard href="/journey/world" eyebrow="ASTERION" title="星屑の巡礼路" description="フォーム・実践・回復・学習で準備の霧を晴らします。" />
    <RouteCard href="/journey/profile" eyebrow="TRAVELER" title="旅人プロフィール" description="StudyとTrainingそれぞれの実績を確認します。" />
    <RouteCard href="/journey/store" eyebrow="STORE" title="星貨の交換所" description="課金や性能差のない装いと称号を確認します。" />
    <RouteCard href="/journey/cosmetics" eyebrow="COSMETIC ARCHIVE" title="装いの観測所" description="重複なしの有限コレクションです。" />
    <RouteCard href="/journey/tower" eyebrow="BOUNDARY TOWER" title="境界の塔" description="制御、継続、回復判断を積み上げる試練です。" />
    <RouteCard href="/journey/nebula" eyebrow="POST-TOWER" title="星雲の真相" description="安全な帰還も攻略として残る周回遠征です。" />
    <RouteCard href="/journey/record" eyebrow="RECORD" title="戦歴と実績" description="完走、帰還、選んだ流派を振り返ります。" />
  </Screen>;
}
