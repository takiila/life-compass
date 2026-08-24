import { Platform } from 'react-native';
import { useState } from 'react';

import { verifySecureStorage } from '@/src/platform/secure';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Inline, Metric, Notice, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';

export default function NativeIntegrationsScreen() {
  const { state, actions } = useAppState();
  const [message, setMessage] = useState('');
  return <Screen><Card><SectionTitle>端末統合の状態</SectionTitle><Body>カメラ、健康データ、安全領域、ローカルDBは端末内で完結します。HealthKit / Health Connectへの書き込みは行いません。</Body><Inline><Metric label="プラットフォーム" value={Platform.OS} /><Metric label="健康サンプル" value={state.healthSamples.length} /><Metric label="旧データ移行" value={state.legacyMigratedAt ? '済' : '対象なし'} /></Inline>{message ? <Notice>{message}</Notice> : null}</Card>
    <Card><SectionTitle>HealthKit / Health Connect</SectionTitle><Body>許可された直近28日の体重とワークアウトを読み取り、外部IDで重複を防ぎます。拒否しても手入力は利用できます。</Body><PrimaryButton label="読取権限を確認して取り込む" onPress={async () => setMessage(await actions.importHealth())} /></Card>
    <Card><SectionTitle>Keychain / Keystore</SectionTitle><Body>安全領域へテスト値を保存・照合し、直後に削除します。</Body><PrimaryButton label="安全領域を照合" tone="quiet" onPress={async () => setMessage((await verifySecureStorage()).message)} /></Card>
    <Card><SectionTitle>WatermelonDB</SectionTitle><Body>WebはLokiJS + IndexedDB、iOS/AndroidはSQLite/JSIを使います。旧AsyncStorageは初回読取後に削除せず、復旧用として残します。</Body></Card>
  </Screen>;
}
