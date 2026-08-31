import { CompassMode, JourneyEvent } from './types';

const DAILY_CAPS: Record<JourneyEvent['kind'], number> = {
  'check-in': 8, study: 18, workout: 18, recovery: 10, form: 8, rest: 10, knowledge: 8,
  'plan-minimum': 8, 'plan-ideal': 8, 'plan-optional': 3, 'daily-reflection': 5, 'weekly-review': 8,
};

export const xpFor = (kind: JourneyEvent['kind']) => DAILY_CAPS[kind];

export function canAward(events: JourneyEvent[], kind: JourneyEvent['kind'], mode: CompassMode | 'shared', at = new Date()): boolean {
  const date = at.toISOString().slice(0, 10);
  return !events.some((event) => event.kind === kind && event.mode === mode && event.createdAt.slice(0, 10) === date);
}

export function journeyLevel(events: JourneyEvent[]) {
  const xp = events.reduce((sum, event) => sum + Math.max(0, event.xp), 0);
  return { xp, level: Math.floor(xp / 100) + 1, current: xp % 100, next: 100 - (xp % 100) };
}
