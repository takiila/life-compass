import { describe, expect, it } from 'vitest';
import { suggestStudyAction, weeklyStudyMinutes } from '../src/domain/study';

describe('study suggestions', () => {
  it('keeps low-energy actions small', () => expect(suggestStudyAction(undefined, { id: 'c', mode: 'study', createdAt: new Date().toISOString(), energy: 1, availableMinutes: 25 }).minutes).toBe(5));
  it('does not exceed available time', () => expect(suggestStudyAction(undefined, { id: 'c', mode: 'study', createdAt: new Date().toISOString(), energy: 5, availableMinutes: 10 }).minutes).toBeLessThanOrEqual(10));
  it('counts completed recent sessions', () => expect(weeklyStudyMinutes([{ id: 'a', startedAt: '2026-08-23T10:00:00Z', minutes: 10, completed: true }, { id: 'b', startedAt: '2026-08-22T10:00:00Z', minutes: 20, completed: false }, { id: 'c', startedAt: '2026-07-01T10:00:00Z', minutes: 30, completed: true }], new Date('2026-08-24T10:00:00Z'))).toBe(10));
});
