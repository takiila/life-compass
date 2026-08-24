import { AppState } from './types';

export const DEFAULT_STATE: AppState = {
  schemaVersion: 2,
  mode: 'study',
  onboardingComplete: false,
  adultConfirmed: false,
  environment: { pwaInstalled: false, materialPlaced: false, trainingGearPlaced: false },
  checkIns: [],
  studySessions: [],
  measurements: [],
  workouts: [],
  recoveries: [],
  formHistory: [],
  journey: [],
  journeyInventory: { spentCoins: 0, ownedCosmetics: [], unlockedRewards: [], completedTrials: [], nebulaRuns: [] },
  healthSamples: [],
  notification: { enabled: false, hour: 20, minute: 0, mode: 'study' },
  settings: { reducedMotion: false, haptics: true },
  restoreAudits: [],
  restoreSnapshots: [],
};

export const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
