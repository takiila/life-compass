import { useState } from 'react';

import { backupCounts } from '@/src/domain/backup';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Field, Inline, Metric, Notice, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';

export default function BackupScreen() {
  const { state, actions } = useAppState();
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const counts = backupCounts(state);
  return <Screen><Card><SectionTitle>バックアップと復元</SectionTitle><Body>Study、Training、回復、体重、Journey、設定を1つのJSONへ保存します。ログイン情報や端末資格情報は含みません。</Body><Inline><Metric label="学習" value={counts.studySessions} /><Metric label="体重" value={counts.measurements} /><Metric label="運動" value={counts.workouts} /><Metric label="Journey" value={counts.journey} /></Inline><Field label="識別メモ（任意・80文字まで）" value={note} onChangeText={setNote} maxLength={80} /><PrimaryButton label="バックアップファイルを作成" onPress={async () => { await actions.exportBackup(note); setMessage('バックアップを作成しました。保存先を確認してください。'); }} /></Card>
    <Card><SectionTitle>検証付き復元</SectionTitle><Body>形式、件数、ID、日付、健康データ参照を検証してから端末内データを置き換えます。復元前スナップショットと監査履歴は直近5件だけ保持します。</Body><PrimaryButton label="バックアップファイルを選ぶ" tone="quiet" onPress={async () => { try { setMessage(await actions.importBackup()); } catch (error) { setMessage(`復元できませんでした: ${error instanceof Error ? error.message : '形式を確認してください'}`); } }} /><PrimaryButton label="直前の復元前状態へ戻す" tone="quiet" disabled={!state.restoreSnapshots.length} onPress={async () => setMessage(await actions.restorePreviousSnapshot())} />{message ? <Notice>{message}</Notice> : null}</Card>
    <Card><SectionTitle>復元履歴</SectionTitle>{state.restoreAudits.length ? state.restoreAudits.map((audit) => <Body key={audit.id} tone="normal">{new Date(audit.restoredAt).toLocaleString('ja-JP')} · v{audit.sourceVersion} · 学習{audit.counts.studySessions ?? 0}件 / 運動{audit.counts.workouts ?? 0}件</Body>) : <Body>復元履歴はまだありません。</Body>}</Card>
  </Screen>;
}
