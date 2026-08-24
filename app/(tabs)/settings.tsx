import { useState } from 'react';
import { Switch, Text } from 'react-native';

import { CompassMode } from '@/src/domain/types';
import { useAppState } from '@/src/state/AppStateProvider';
import { verifySecureStorage } from '@/src/platform/secure';
import { Body, Card, Choice, ChoiceRow, Field, ModeHeader, Notice, PrimaryButton, RouteCard, Screen, SectionTitle } from '@/src/ui/components';
import { colors } from '@/src/ui/theme';

export default function SettingsScreen() {
  const { state, actions } = useAppState();
  const [message, setMessage] = useState('');
  const [hour, setHour] = useState(String(state.notification.hour).padStart(2, '0'));
  const [minute, setMinute] = useState(String(state.notification.minute).padStart(2, '0'));
  const [notifyMode, setNotifyMode] = useState<CompassMode>(state.notification.mode);
  const [enabled, setEnabled] = useState(state.notification.enabled);
  const saveNotification = async () => setMessage(await actions.updateNotification({ enabled, hour: Math.max(0, Math.min(23, Number(hour) || 0)), minute: Math.max(0, Math.min(59, Number(minute) || 0)), mode: notifyMode }));
  return <Screen><ModeHeader eyebrow="PREFERENCES" title="設定と端末データ" subtitle="通知、演出、バックアップ、ネイティブ連携を管理します。" />
    {message ? <Notice>{message}</Notice> : null}
    <Card><SectionTitle>1日1回の穏やかな通知</SectionTitle><Body>PWAでは起動時確認、iOS/Android版ではローカル通知として動きます。</Body><ChoiceRow><Choice selected={enabled} onPress={() => setEnabled(true)} label="使う" /><Choice selected={!enabled} onPress={() => setEnabled(false)} label="使わない" /></ChoiceRow><ChoiceRow><Choice selected={notifyMode === 'study'} onPress={() => setNotifyMode('study')} label="Study" tint="study" /><Choice selected={notifyMode === 'training'} onPress={() => setNotifyMode('training')} label="Training" /></ChoiceRow><Field label="時" value={hour} onChangeText={setHour} keyboardType="number-pad" /><Field label="分" value={minute} onChangeText={setMinute} keyboardType="number-pad" /><PrimaryButton label="通知設定を保存" onPress={saveNotification} /></Card>
    <Card><SectionTitle>演出と振動</SectionTitle><Text style={{ color: colors.ink, fontWeight: '800' }}>演出を弱める</Text><Switch value={state.settings.reducedMotion} onValueChange={(reducedMotion) => actions.updateSettings({ ...state.settings, reducedMotion })} /><Text style={{ color: colors.ink, fontWeight: '800', marginTop: 10 }}>振動フィードバック</Text><Switch value={state.settings.haptics} onValueChange={(haptics) => actions.updateSettings({ ...state.settings, haptics })} /></Card>
    <RouteCard href="/backup" eyebrow="LOCAL DATA" title="バックアップと復元" description="端末データを検証付きJSONへ保存します。" />
    <RouteCard href="/native-integrations" eyebrow="NATIVE" title="Health・安全領域・DB" description="端末連携の権限と読み取り状況を確認します。" />
    <RouteCard href="/journey/tutorial" eyebrow="REPLAY" title="RPGチュートリアルを再表示" description="Life Journeyの案内を最初から何度でも確認します。" />
    <RouteCard href="/dev/theme-lab" eyebrow="DEVELOPMENT" title="Theme Lab" description="ライト配色と低刺激表示を確認します。" />
    <Card><SectionTitle>安全領域の自己診断</SectionTitle><Body>テスト用の値を保存・照合後すぐ削除します。健康データは使いません。</Body><PrimaryButton label="Keychain / Keystoreを確認" tone="quiet" onPress={async () => setMessage((await verifySecureStorage()).message)} /></Card>
  </Screen>;
}
