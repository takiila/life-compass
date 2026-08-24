import { describe, expect, it } from 'vitest';
import { canAward, journeyLevel, xpFor } from '../src/domain/journey';

describe('journey rewards', () => {
  it('caps the same action and mode once per day', () => { const at = new Date('2026-08-24T10:00:00Z'); const event = { id: '1', createdAt: at.toISOString(), mode: 'study' as const, kind: 'study' as const, xp: xpFor('study'), title: 'test' }; expect(canAward([event], 'study', 'study', at)).toBe(false); expect(canAward([event], 'recovery', 'training', at)).toBe(true); });
  it('never derives negative XP', () => expect(journeyLevel([{ id: '1', createdAt: new Date().toISOString(), mode: 'shared', kind: 'rest', xp: -10, title: 'bad input' }]).xp).toBe(0));
});
