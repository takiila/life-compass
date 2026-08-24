import { describe, expect, it } from 'vitest';
import { EXERCISE_GUIDES, findExerciseGuide } from '../src/domain/exercises';

describe('exercise library', () => {
  it('provides complete safety guidance for every exercise', () => {
    expect(EXERCISE_GUIDES.length).toBeGreaterThanOrEqual(4);
    for (const guide of EXERCISE_GUIDES) {
      expect(guide.setup.length).toBeGreaterThan(0);
      expect(guide.steps.length).toBeGreaterThan(0);
      expect(guide.breathing.length).toBeGreaterThan(0);
      expect(guide.selfChecks.length).toBeGreaterThan(0);
      expect(guide.stopConditions.length).toBeGreaterThan(0);
      expect(guide.alternative.length).toBeGreaterThan(0);
      expect(findExerciseGuide(guide.id)).toBe(guide);
    }
  });

  it('does not substitute an unknown exercise', () => expect(findExerciseGuide('missing')).toBeUndefined());
});
