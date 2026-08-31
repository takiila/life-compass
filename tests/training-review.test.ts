import { describe, expect, it } from 'vitest';

import { decideWeeklyAdjustment, latestAcceptedAdjustment, proposeWeeklyAdjustment, summarizeTrainingWeek } from '../src/domain/trainingReview';
import { DEFAULT_STATE } from '../src/domain/defaults';
import { AppState, DailyTrainingPlan } from '../src/domain/types';

const createdAt = '2026-08-31T03:00:00Z';
const plan = (date: string, status: DailyTrainingPlan['status'] = 'completed', ideal = false): DailyTrainingPlan => ({
  id: `plan-${date}`, date, createdAt, updatedAt: createdAt, status,
  items: [
    { id: `${date}-min`, category: status === 'safety-hold' ? 'recovery' : 'training', tier: 'minimum', title: '最低', source: 'generated', completedAt: createdAt },
    { id: `${date}-ideal`, category: 'recovery', tier: 'ideal', title: '理想', source: 'generated', completedAt: ideal ? createdAt : undefined },
  ],
});

const withWeek = (plans: DailyTrainingPlan[]): AppState => ({
  ...DEFAULT_STATE,
  dailyTrainingPlans: plans,
  dailyReflections: plans.map((entry, index) => ({ id: `r-${index}`, date: entry.date, planId: entry.id, createdAt, nutrition: 3, sleep: 3, fatigue: 2, mood: 4, minimumAchieved: true, idealAchieved: Boolean(entry.items[1].completedAt) })),
  workouts: [{ id: 'w', startedAt: createdAt, completedAt: createdAt, focus: '全身', minutes: 25, sets: [], safeCompletion: true, source: 'manual' }],
});

describe('weekly Training review', () => {
  it('summarizes minimum, ideal, reflection and workout minutes', () => {
    const state = withWeek([plan('2026-08-25', 'completed', true), plan('2026-08-26')]);
    expect(summarizeTrainingWeek(state, '2026-08-25')).toMatchObject({ minimumDays: 2, idealDays: 1, reflectionDays: 2, workoutMinutes: 25 });
  });

  it('keeps a proposal pending and maintains when evidence is sparse', () => {
    const proposal = proposeWeeklyAdjustment(withWeek([plan('2026-08-25')]), '2026-08-25');
    expect(proposal).toMatchObject({ decision: 'pending', proposal: { level: 'maintain' } });
  });

  it('suggests lighter when safety holds or recovery concerns appear', () => {
    const proposal = proposeWeeklyAdjustment(withWeek([plan('2026-08-25', 'safety-hold')]), '2026-08-25');
    expect(proposal.proposal.level).toBe('lighter');
  });

  it('may suggest slightly more for a stable safe week but not for a review weight pace', () => {
    const stable = withWeek(['25', '26', '27', '28'].map((day) => plan(`2026-08-${day}`, 'completed', true)));
    expect(proposeWeeklyAdjustment(stable, '2026-08-25').proposal.level).toBe('slightly-more');
    const unsafePace = { ...stable, adultConfirmed: true, heightCm: 170, targetWeightKg: 60, targetWeightDate: '2026-09-01', measurements: [{ id: 'm', measuredAt: createdAt, weightKg: 80, source: 'manual' as const }] };
    expect(proposeWeeklyAdjustment(unsafePace, '2026-08-25').proposal.level).not.toBe('slightly-more');
  });

  it('only exposes an accepted or edited choice to next week', () => {
    const pending = proposeWeeklyAdjustment(withWeek([plan('2026-08-25')]), '2026-08-25');
    expect(latestAcceptedAdjustment([pending])).toBeUndefined();
    const decided = decideWeeklyAdjustment(pending, { decision: 'edited', level: 'lighter' }, new Date(createdAt));
    expect(latestAcceptedAdjustment([decided])?.acceptedLevel).toBe('lighter');
  });
});
