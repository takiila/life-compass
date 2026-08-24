import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';

const CHAPTERS = [
  ['始める前の羅針', '胸部症状、めまい、失神、異常な息切れ、鋭い痛みでは運動を中止します。'],
  ['自重トレーニングの土台', '椅子や壁の支持を使うことは後退ではなく、安全に調整する手段です。'],
  ['器具がある日の考え方', '重さは目的ではなく、動きと余力を観察する道具として扱います。'],
  ['余力を読む', 'RPEは追い込みの得点ではなく、次回へつなぐ記録です。'],
  ['休む判断を鍛える', '回復確認は進まない日の罰ではありません。'],
  ['目的と頻度を組み合わせる', '一つの正解へ固定せず、生活に合う頻度と時間から組み立てます。'],
];

export default function LibraryScreen() {
  const { actions } = useAppState();
  return <Screen><Card><SectionTitle>世界の羅針を取り戻す</SectionTitle><Body>トレーニングを安全に選ぶための短い知識書庫です。読了は入場条件ではありません。</Body></Card>{CHAPTERS.map(([title, text], index) => <Card key={title}><Body>CHAPTER {String(index + 1).padStart(2, '0')}</Body><SectionTitle>{title}</SectionTitle><Body tone="normal">{text}</Body></Card>)}<PrimaryButton label="今日の学習として記録" onPress={() => actions.award('knowledge', 'training', '知識書庫を確認した')} /></Screen>;
}
