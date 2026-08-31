import { describe, expect, it } from 'vitest';
import { canAward, journeyLevel, xpFor } from '../src/domain/journey';
import { createRpgSandboxState, isRpgSandboxAvailable, RPG_SANDBOX_COSMETICS, rpgSandboxReducer } from '../src/domain/rpgSandbox';

describe('journey rewards', () => {
  it('caps the same action and mode once per day', () => { const at = new Date('2026-08-24T10:00:00Z'); const event = { id: '1', createdAt: at.toISOString(), mode: 'study' as const, kind: 'study' as const, xp: xpFor('study'), title: 'test' }; expect(canAward([event], 'study', 'study', at)).toBe(false); expect(canAward([event], 'recovery', 'training', at)).toBe(true); });
  it('never derives negative XP', () => expect(journeyLevel([{ id: '1', createdAt: new Date().toISOString(), mode: 'shared', kind: 'rest', xp: -10, title: 'bad input' }]).xp).toBe(0));
});

describe('RPG development sandbox', () => {
  it('is unavailable when the production guard is false', () => {
    expect(isRpgSandboxAvailable(false)).toBe(false);
    expect(isRpgSandboxAvailable(true)).toBe(true);
  });

  it('supports major actions without mutating its prior state', () => {
    const initial = createRpgSandboxState();
    const staged = rpgSandboxReducer(initial, { type: 'advance-stage' });
    const trial = rpgSandboxReducer(staged, { type: 'complete-trial', trial: '余裕' });
    const nebula = rpgSandboxReducer(trial, { type: 'record-nebula', safeReturn: true });
    const reward = rpgSandboxReducer(nebula, { type: 'buy-reward', id: 'sandbox-title', cost: 20 });
    expect(initial).toEqual(createRpgSandboxState());
    expect(reward).toMatchObject({ stage: 2, completedTrials: ['余裕'], coins: 60, rewards: ['sandbox-title'] });
    expect(reward.nebulaRuns).toEqual([{ safeReturn: true }]);
  });

  it('keeps collection finite and reset returns a fresh isolated state', () => {
    let state = createRpgSandboxState();
    for (let index = 0; index < RPG_SANDBOX_COSMETICS.length + 2; index += 1) state = rpgSandboxReducer(state, { type: 'observe-cosmetic' });
    expect(state.cosmetics).toEqual(RPG_SANDBOX_COSMETICS);
    expect(rpgSandboxReducer(state, { type: 'reset' })).toEqual(createRpgSandboxState());
  });
});
