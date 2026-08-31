export type CompassMode = 'study' | 'training';

export type TrainingCondition = {
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  fatigue: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  soreness: number;
  urgentSymptom: boolean;
};

export type DailyCheckIn = {
  id: string;
  mode: CompassMode;
  createdAt: string;
  energy: 1 | 2 | 3 | 4 | 5;
  availableMinutes: 2 | 5 | 10 | 15 | 25 | 35;
  note?: string;
  training?: TrainingCondition;
};

export type DailyPlanTier = 'minimum' | 'ideal' | 'optional';
export type DailyPlanCategory = 'training' | 'recovery' | 'nutrition' | 'sleep' | 'measurement' | 'reflection';

export type DailyPlanItem = {
  id: string;
  category: DailyPlanCategory;
  tier: DailyPlanTier;
  title: string;
  description?: string;
  completedAt?: string;
  source: 'generated' | 'user-edited';
};

export type DailyTrainingPlan = {
  id: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  checkInId?: string;
  status: 'active' | 'safety-hold' | 'completed';
  items: DailyPlanItem[];
  adjustment?: { lighter?: boolean; availableMinutes?: number; avoidedTraining?: boolean; note?: string };
};

export type DailyReflection = {
  id: string;
  date: string;
  planId?: string;
  createdAt: string;
  nutrition: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  fatigue: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  minimumAchieved: boolean;
  idealAchieved: boolean;
  note?: string;
};

export type WeeklyAdjustmentLevel = 'lighter' | 'maintain' | 'slightly-more';
export type WeeklyAdjustment = {
  id: string;
  weekStart: string;
  createdAt: string;
  summary: { minimumDays: number; idealDays: number; reflectionDays: number; workoutMinutes: number; weightTrendKgPerWeek?: number };
  proposal: { level: WeeklyAdjustmentLevel; reason: string };
  decision: 'pending' | 'accepted' | 'edited' | 'rejected';
  acceptedLevel?: WeeklyAdjustmentLevel;
  decidedAt?: string;
};

export type WeeklyRewardClaim = { weekStart: string; rewardId: string; claimedAt: string };

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
  kind: 'check-in' | 'study' | 'workout' | 'recovery' | 'form' | 'rest' | 'knowledge' | 'plan-minimum' | 'plan-ideal' | 'plan-optional' | 'daily-reflection' | 'weekly-review';
  xp: number;
  title: string;
  sourceId?: string;
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

export type FormGuideView = {
  id: string;
  guideId: string;
  title: string;
  viewedAt: string;
};

export type AppState = {
  schemaVersion: 3;
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
  dailyTrainingPlans: DailyTrainingPlan[];
  dailyReflections: DailyReflection[];
  weeklyAdjustments: WeeklyAdjustment[];
  formHistory: FormGuideView[];
  journey: JourneyEvent[];
  journeyInventory: {
    spentCoins: number;
    ownedCosmetics: string[];
    unlockedRewards: string[];
    completedTrials: string[];
    nebulaRuns: { id: string; completedAt: string; safeReturn: boolean }[];
    weeklyRewardClaims: WeeklyRewardClaim[];
    tutorialCompletedAt?: string;
  };
  healthSamples: HealthSampleRef[];
  notification: NotificationPreference;
  settings: { reducedMotion: boolean; haptics: boolean };
  restoreAudits: RestoreAudit[];
  restoreSnapshots: { id: string; createdAt: string; payload: string }[];
  legacyMigratedAt?: string;
};

export type AppBackupV3 = {
  format: 'life-compass-backup';
  version: 3;
  exportedAt: string;
  note?: string;
  state: AppState;
};
