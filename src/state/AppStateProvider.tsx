import * as Haptics from 'expo-haptics';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { backupCounts, createBackup, parseBackup, parseStateSnapshot } from '@/src/domain/backup';
import { DEFAULT_STATE, createId } from '@/src/domain/defaults';
import { canAward, xpFor } from '@/src/domain/journey';
import {
  AppState,
  BodyMeasurement,
  CompassMode,
  DailyCheckIn,
  JourneyEvent,
  NotificationPreference,
  RecoveryRecord,
  StudyGoal,
  StudySession,
  WorkoutSession,
} from '@/src/domain/types';
import { pickBackupFile, saveBackupFile } from '@/src/platform/backup';
import { importHealthData } from '@/src/platform/health';
import { scheduleDailyReminder } from '@/src/platform/notifications';
import { loadState, saveState } from '@/src/storage/repository';

type AppActions = {
  setMode: (mode: CompassMode) => void;
  finishOnboarding: (input: Pick<AppState, 'adultConfirmed' | 'environment'>) => void;
  saveStudyGoal: (goal: StudyGoal) => void;
  addCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'createdAt'>) => void;
  addStudySession: (session: Omit<StudySession, 'id' | 'startedAt' | 'completed'>) => void;
  addMeasurement: (measurement: Omit<BodyMeasurement, 'id' | 'measuredAt' | 'source'> & { measuredAt?: string }) => void;
  setWeightGoal: (heightCm: number, targetWeightKg: number, targetWeightDate: string) => void;
  addWorkout: (workout: Omit<WorkoutSession, 'id' | 'startedAt' | 'completedAt' | 'source'>) => void;
  addRecovery: (recovery: Omit<RecoveryRecord, 'id' | 'createdAt'>) => void;
  award: (kind: JourneyEvent['kind'], mode: JourneyEvent['mode'], title: string) => void;
  updateNotification: (notification: NotificationPreference) => Promise<string>;
  updateSettings: (settings: AppState['settings']) => void;
  exportBackup: (note?: string) => Promise<void>;
  importBackup: () => Promise<string>;
  restorePreviousSnapshot: () => Promise<string>;
  importHealth: () => Promise<string>;
  unlockJourneyItem: (id: string, cost: number, kind: 'cosmetic' | 'reward') => string;
  completeTrial: (id: string) => void;
  recordNebulaRun: (safeReturn: boolean) => void;
};

type ContextValue = { state: AppState; loading: boolean; error?: string; actions: AppActions };
const Context = createContext<ContextValue | undefined>(undefined);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    loadState().then(setState).catch((cause) => setError(cause instanceof Error ? cause.message : '端末データを読み込めませんでした。')).finally(() => setLoading(false));
  }, []);

  const commit = useCallback((update: (current: AppState) => AppState) => {
    setState((current) => {
      const next = update(current);
      saveState(next).catch((cause) => setError(cause instanceof Error ? cause.message : '保存に失敗しました。'));
      return next;
    });
  }, []);

  const award = useCallback((kind: JourneyEvent['kind'], mode: JourneyEvent['mode'], title: string) => {
    commit((current) => {
      if (!canAward(current.journey, kind, mode)) return current;
      const event: JourneyEvent = { id: createId('journey'), createdAt: new Date().toISOString(), mode, kind, xp: xpFor(kind), title };
      return { ...current, journey: [...current.journey, event] };
    });
  }, [commit]);

  const actions = useMemo<AppActions>(() => ({
    setMode: (mode) => commit((current) => ({ ...current, mode })),
    finishOnboarding: (input) => commit((current) => ({ ...current, ...input, onboardingComplete: true })),
    saveStudyGoal: (studyGoal) => commit((current) => ({ ...current, studyGoal })),
    addCheckIn: (checkIn) => {
      commit((current) => ({ ...current, checkIns: [...current.checkIns, { ...checkIn, id: createId('checkin'), createdAt: new Date().toISOString() }] }));
      award('check-in', checkIn.mode, '今日の状態を確認した');
    },
    addStudySession: (session) => {
      commit((current) => ({ ...current, studySessions: [...current.studySessions, { ...session, id: createId('study'), startedAt: new Date().toISOString(), completed: true }] }));
      award('study', 'study', '小さな学習を完了した');
    },
    addMeasurement: (measurement) => commit((current) => ({ ...current, measurements: [...current.measurements, { ...measurement, id: createId('weight'), measuredAt: measurement.measuredAt ?? new Date().toISOString(), source: 'manual' }] })),
    setWeightGoal: (heightCm, targetWeightKg, targetWeightDate) => commit((current) => ({ ...current, heightCm, targetWeightKg, targetWeightDate })),
    addWorkout: (workout) => {
      const now = new Date().toISOString();
      commit((current) => ({ ...current, workouts: [...current.workouts, { ...workout, id: createId('workout'), startedAt: now, completedAt: now, source: 'manual' }] }));
      if (workout.safeCompletion) award('workout', 'training', '安全なセッションを完了した');
    },
    addRecovery: (recovery) => {
      commit((current) => ({ ...current, recoveries: [...current.recoveries, { ...recovery, id: createId('recovery'), createdAt: new Date().toISOString() }] }));
      award('recovery', 'training', '回復を確認した');
    },
    award,
    updateNotification: async (notification) => {
      const result = await scheduleDailyReminder(notification);
      commit((current) => ({ ...current, notification }));
      return result.message;
    },
    updateSettings: (settings) => commit((current) => ({ ...current, settings })),
    exportBackup: async (note) => {
      const backup = createBackup(state, note);
      await saveBackupFile(JSON.stringify(backup, null, 2), `life-compass-backup-${new Date().toISOString().slice(0, 10)}.json`);
    },
    importBackup: async () => {
      const text = await pickBackupFile();
      if (!text) return 'ファイルは選択されませんでした。';
      const backup = parseBackup(JSON.parse(text));
      const restored: AppState = {
        ...backup.state,
        restoreAudits: [{ id: createId('restore'), restoredAt: new Date().toISOString(), sourceVersion: backup.version, counts: backupCounts(backup.state) }, ...backup.state.restoreAudits].slice(0, 5),
        restoreSnapshots: [{ id: createId('snapshot'), createdAt: new Date().toISOString(), payload: JSON.stringify(state) }, ...(backup.state.restoreSnapshots ?? [])].slice(0, 5),
      };
      await saveState(restored);
      setState(restored);
      return 'バックアップを検証し、復元しました。';
    },
    restorePreviousSnapshot: async () => {
      const snapshot = state.restoreSnapshots[0];
      if (!snapshot) return '戻せる復元前スナップショットはありません。';
      const restored = parseStateSnapshot(snapshot.payload);
      await saveState(restored);
      setState(restored);
      return '直前の復元前スナップショットへ戻しました。';
    },
    importHealth: async () => {
      const result = await importHealthData();
      if (!result.available) return result.message;
      commit((current) => {
        const known = new Set(current.healthSamples.map((ref) => `${ref.provider}:${ref.externalId}`));
        const refs = result.refs.filter((ref) => !known.has(`${ref.provider}:${ref.externalId}`));
        const accepted = new Set(refs.map((ref) => ref.externalId));
        return {
          ...current,
          measurements: [...current.measurements, ...result.measurements.filter((item) => item.externalId && accepted.has(item.externalId))],
          workouts: [...current.workouts, ...result.workouts.filter((item) => item.externalId && accepted.has(item.externalId))],
          healthSamples: [...current.healthSamples, ...refs],
        };
      });
      return result.message;
    },
    unlockJourneyItem: (id, cost, kind) => {
      const earned = Math.floor(state.journey.reduce((sum, event) => sum + event.xp, 0) / 2);
      const owned = kind === 'cosmetic' ? state.journeyInventory.ownedCosmetics : state.journeyInventory.unlockedRewards;
      if (owned.includes(id)) return 'すでに解放済みです。';
      if (earned - state.journeyInventory.spentCoins < cost) return '星貨が足りません。Study、Training、回復の小さな一歩で進めます。';
      commit((current) => ({
        ...current,
        journeyInventory: {
          ...current.journeyInventory,
          spentCoins: current.journeyInventory.spentCoins + cost,
          ownedCosmetics: kind === 'cosmetic' ? [...current.journeyInventory.ownedCosmetics, id] : current.journeyInventory.ownedCosmetics,
          unlockedRewards: kind === 'reward' ? [...current.journeyInventory.unlockedRewards, id] : current.journeyInventory.unlockedRewards,
        },
      }));
      return '解放しました。性能や提案内容は変わりません。';
    },
    completeTrial: (id) => commit((current) => current.journeyInventory.completedTrials.includes(id) ? current : ({ ...current, journeyInventory: { ...current.journeyInventory, completedTrials: [...current.journeyInventory.completedTrials, id] } })),
    recordNebulaRun: (safeReturn) => commit((current) => ({ ...current, journeyInventory: { ...current.journeyInventory, nebulaRuns: [...current.journeyInventory.nebulaRuns, { id: createId('nebula'), completedAt: new Date().toISOString(), safeReturn }] } })),
  }), [award, commit, state]);

  useEffect(() => {
    if (!loading && state.settings.haptics) Haptics.selectionAsync().catch(() => undefined);
  }, [state.mode, state.settings.haptics, loading]);

  return <Context.Provider value={{ state, loading, error, actions }}>{children}</Context.Provider>;
}

export function useAppState() {
  const value = useContext(Context);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
