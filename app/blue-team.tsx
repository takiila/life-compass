import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { isRpgSandboxAvailable } from '@/src/domain/rpgSandbox';
import { useAppState } from '@/src/state/AppStateProvider';
import { useRpgSandbox } from '@/src/state/RpgSandboxProvider';
import { Body, Card, Notice, PrimaryButton, RouteCard, Screen, SectionTitle } from '@/src/ui/components';

export default function BlueTeamScreen() {
  const router = useRouter();
  const { state, actions } = useAppState();
  const sandboxContext = useRpgSandbox();
  const { sandbox } = useLocalSearchParams<{ sandbox?: string }>();
  const [message, setMessage] = useState('');
  const sandboxRequested = sandbox === '1';
  const sandboxMode = sandboxRequested && isRpgSandboxAvailable(__DEV__);
  if (sandboxRequested && !sandboxMode) return <Screen><Card><Body>DEVELOPMENT ONLY</Body><SectionTitle>RPG Sandboxは無効です</SectionTitle><Body>production buildではSandbox stateを有効化できません。</Body></Card><RouteCard href="/journey" eyebrow="JOURNEY" title="通常のJourneyへ戻る" description="現在の保存データを表示します。" /></Screen>;
  const sandboxAction = (messageText: string) => { sandboxContext.dispatch({ type: 'run-blue-team-drill' }); setMessage(messageText); };
  return <Screen>{sandboxMode ? <><Notice>通常のBlue Team画面をmemory-only stateで操作しています。通常saveへXPを追加しません。</Notice><RouteCard href="/dev/rpg-lab" eyebrow="SANDBOX MENU" title="別の機能を確認する" description="Sandbox状態を保ったまま一覧へ戻ります。" /></> : null}<Card><Body>BLUE TEAM ALERT</Body><SectionTitle>「今日は何もしたくない」</SectionTitle><Body>やる気を待たなくて大丈夫です。攻略は、どれか一つで終わりです。</Body>{message ? <Notice>{message}</Notice> : null}<PrimaryButton label="提案だけ開く" tone={state.mode === 'study' ? 'study' : 'primary'} onPress={() => sandboxMode ? sandboxAction('Sandboxで提案を開く選択を確認しました。') : router.replace('/')} /><PrimaryButton label="回復を見る" tone="quiet" onPress={() => sandboxMode ? sandboxAction('Sandboxで回復へ切り替える選択を確認しました。') : router.push('/training/recovery')} /><PrimaryButton label="今日は閉じる" tone="quiet" onPress={() => sandboxMode ? sandboxAction('Sandboxで閉じる選択を確認しました。通常XPは変わりません。') : actions.award('rest', state.mode, '今日は閉じると決めた')} /></Card><Card><SectionTitle>この画面のルール</SectionTitle><Body>XPのために無理をする必要はありません。痛みや強い不調がある場合は開始せず、安全導線を優先してください。</Body>{sandboxMode ? <Body tone="normal">Sandbox演習: {sandboxContext.state.blueTeamDrills}回</Body> : null}</Card></Screen>;
}
