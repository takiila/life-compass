import { useRouter } from 'expo-router';

import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';

export default function BlueTeamScreen() {
  const router = useRouter();
  const { state, actions } = useAppState();
  return <Screen><Card><Body>BLUE TEAM ALERT</Body><SectionTitle>「今日は何もしたくない」</SectionTitle><Body>やる気を待たなくて大丈夫です。攻略は、どれか一つで終わりです。</Body><PrimaryButton label="提案だけ開く" tone={state.mode === 'study' ? 'study' : 'primary'} onPress={() => router.replace('/')} /><PrimaryButton label="回復を見る" tone="quiet" onPress={() => router.push('/training/recovery')} /><PrimaryButton label="今日は閉じる" tone="quiet" onPress={() => actions.award('rest', state.mode, '今日は閉じると決めた')} /></Card><Card><SectionTitle>この画面のルール</SectionTitle><Body>XPのために無理をする必要はありません。痛みや強い不調がある場合は開始せず、安全導線を優先してください。</Body></Card></Screen>;
}
