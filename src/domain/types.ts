export type CompassMode = 'study' | 'training';

export type DailyCheckIn = {
  id: string;
  mode: CompassMode;
  createdAt: string;
  energy: 1 | 2 | 3 | 4 | 5;
  availableMinutes: 2 | 5 | 10 | 15 | 25 | 35;
  note?: string;
};

export type StudyGoal = {
  qualificationName: string;
  targetDate?: string;
  material: string;
  smallestAction: string;
  weeklyMinutes: number;
  topics: { id: string; name: string; progress: number }[];
};

export type StudySession = {
  id: string;
  startedAt: string;
  minutes: number;
  topic?: string;
  note?: string;
  completed: boolean;
};

export type BodyMeasurement = {
  id: string;
  measuredAt: string;
  weightKg: number;
  source: 'manual' | 'healthkit' | 'health-connect' | 'legacy';
  externalId?: string;
};

export type WorkoutSet = { reps: number; weightKg?: number; rpe: number };

export type WorkoutSession = {
  id: string;
  startedAt: string;
  completedAt: string;
  focus: string;
  minutes: number;
  sets: WorkoutSet[];
  safeCompletion: boolean;
  source: 'manual' | 'healthkit' | 'health-connect' | 'legacy';
  externalId?: string;
};

export type RecoveryRecord = {
  id: string;
  createdAt: string;
  area: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
  soreness: number;
  intensity: number;
  note?: string;
};

export type JourneyEvent = {
  id: string;
  createdAt: string;
  mode: CompassMode | 'shared';
  kind: 'check-in' | 'study' | 'workout' | 'recovery' | 'form' | 'rest' | 'knowledge';
  xp: number;
  title: string;
};

export type HealthSampleRef = {
  externalId: string;
  provider: 'healthkit' | 'health-connect';
  sampleType: 'weight' | 'workout';
  importedAt: string;
};

export type NotificationPreference = {
  enabled: boolean;
  hour: number;
  minute: number;
  mode: CompassMode;
};

export type RestoreAudit = {
  id: string;
  restoredAt: string;
  sourceVersion: number;
  counts: Record<string, number>;
};

export type AppState = {
  schemaVersion: 2;
  mode: CompassMode;
  onboardingComplete: boolean;
  adultConfirmed: boolean;
  environment: {
    pwaInstalled: boolean;
    materialPlaced: boolean;
    trainingGearPlaced: boolean;
    cueTime?: string;
  };
  studyGoal?: StudyGoal;
  heightCm?: number;
  targetWeightKg?: number;
  targetWeightDate?: string;
  checkIns: DailyCheckIn[];
  studySessions: StudySession[];
  measurements: BodyMeasurement[];
  workouts: WorkoutSession[];
  recoveries: RecoveryRecord[];
  journey: JourneyEvent[];
  journeyInventory: {
    spentCoins: number;
    ownedCosmetics: string[];
    unlockedRewards: string[];
    completedTrials: string[];
    nebulaRuns: { id: string; completedAt: string; safeReturn: boolean }[];
  };
  healthSamples: HealthSampleRef[];
  notification: NotificationPreference;
  settings: { reducedMotion: boolean; haptics: boolean };
  restoreAudits: RestoreAudit[];
  restoreSnapshots: { id: string; createdAt: string; payload: string }[];
  legacyMigratedAt?: string;
};

export type AppBackupV2 = {
  format: 'life-compass-backup';
  version: 2;
  exportedAt: string;
  note?: string;
  state: AppState;
};
