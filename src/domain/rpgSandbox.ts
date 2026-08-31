export type RpgSandboxFeature = 'stage' | 'adventure' | 'trials' | 'nebula' | 'blue-team' | 'profile' | 'store' | 'collection';

export type RpgSandboxState = {
  stage: number;
  studyActions: number;
  safeWorkouts: number;
  recoveryChecks: number;
  rhythmDays: number;
  adventureChoices: string[];
  completedTrials: string[];
  nebulaRuns: { safeReturn: boolean }[];
  blueTeamDrills: number;
  coins: number;
  rewards: string[];
  cosmetics: string[];
};

export type RpgSandboxAction =
  | { type: 'advance-stage' }
  | { type: 'choose-adventure'; choice: string }
  | { type: 'complete-trial'; trial: string }
  | { type: 'record-nebula'; safeReturn: boolean }
  | { type: 'run-blue-team-drill' }
  | { type: 'buy-reward'; id: string; cost: number }
  | { type: 'observe-cosmetic' }
  | { type: 'reset' };

export const RPG_SANDBOX_TRIALS = ['余裕', '回復', '制御', '呼吸', '練達'] as const;
export const RPG_SANDBOX_COSMETICS = ['暁の旅装', '静養の外套', '地平の探索服', '星幕の読者'] as const;

export function createRpgSandboxState(): RpgSandboxState {
  return {
    stage: 1,
    studyActions: 4,
    safeWorkouts: 8,
    recoveryChecks: 3,
    rhythmDays: 7,
    adventureChoices: [],
    completedTrials: [],
    nebulaRuns: [],
    blueTeamDrills: 0,
    coins: 80,
    rewards: [],
    cosmetics: [],
  };
}

export const isRpgSandboxAvailable = (development: boolean) => development;

export function rpgSandboxReducer(state: RpgSandboxState, action: RpgSandboxAction): RpgSandboxState {
  switch (action.type) {
    case 'advance-stage':
      return { ...state, stage: Math.min(5, state.stage + 1) };
    case 'choose-adventure':
      return { ...state, adventureChoices: [...state.adventureChoices, action.choice].slice(-8) };
    case 'complete-trial':
      if (!RPG_SANDBOX_TRIALS.includes(action.trial as typeof RPG_SANDBOX_TRIALS[number]) || state.completedTrials.includes(action.trial)) return state;
      return { ...state, completedTrials: [...state.completedTrials, action.trial] };
    case 'record-nebula':
      return { ...state, nebulaRuns: [...state.nebulaRuns, { safeReturn: action.safeReturn }].slice(-8) };
    case 'run-blue-team-drill':
      return { ...state, blueTeamDrills: state.blueTeamDrills + 1 };
    case 'buy-reward':
      if (state.rewards.includes(action.id) || state.coins < action.cost) return state;
      return { ...state, coins: state.coins - action.cost, rewards: [...state.rewards, action.id] };
    case 'observe-cosmetic': {
      if (state.coins < 10) return state;
      const next = RPG_SANDBOX_COSMETICS.find((cosmetic) => !state.cosmetics.includes(cosmetic));
      return next ? { ...state, coins: state.coins - 10, cosmetics: [...state.cosmetics, next] } : state;
    }
    case 'reset':
      return createRpgSandboxState();
  }
}
