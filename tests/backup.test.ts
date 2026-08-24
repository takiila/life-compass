import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup } from '../src/domain/backup';
import { DEFAULT_STATE } from '../src/domain/defaults';

describe('backup schema', () => {
  it('round-trips AppBackupV2', () => { const backup = createBackup(DEFAULT_STATE, 'test'); expect(parseBackup(JSON.parse(JSON.stringify(backup)))).toEqual(backup); });
  it('rejects unsafe weight values', () => { const backup = createBackup({ ...DEFAULT_STATE, measurements: [{ id: 'x', measuredAt: new Date().toISOString(), weightKg: -1, source: 'manual' }] }); expect(() => parseBackup(backup)).toThrow(); });
  it('rejects duplicate IDs and orphan health references', () => {
    const measuredAt = new Date().toISOString();
    const duplicate = createBackup({ ...DEFAULT_STATE, measurements: [{ id: 'same', measuredAt, weightKg: 70, source: 'manual' }, { id: 'same', measuredAt, weightKg: 69, source: 'manual' }] });
    expect(() => parseBackup(duplicate)).toThrow(/duplicate id/);
    const orphan = createBackup({ ...DEFAULT_STATE, healthSamples: [{ externalId: 'missing', provider: 'healthkit', sampleType: 'weight', importedAt: measuredAt }] });
    expect(() => parseBackup(orphan)).toThrow(/orphan health reference/);
  });
  it('converts a legacy v1 weight backup through the v2 validator', () => {
    const parsed = parseBackup({ version: 1, data: { onboardingComplete: true, weightEntries: [{ id: 'old', date: '2026-08-01', weight: 70 }] } });
    expect(parsed.version).toBe(2);
    expect(parsed.state.measurements[0]).toMatchObject({ id: 'old', weightKg: 70, source: 'legacy' });
  });
  it('fills new optional collections when reading an older v2 backup', () => {
    const old = JSON.parse(JSON.stringify(createBackup(DEFAULT_STATE))) as { state: Record<string, unknown> };
    delete old.state.formHistory;
    const parsed = parseBackup(old);
    expect(parsed.state.formHistory).toEqual([]);
  });
  it('round-trips form history and tutorial completion', () => {
    const viewedAt = '2026-08-25T03:00:00+09:00';
    const backup = createBackup({
      ...DEFAULT_STATE,
      formHistory: [{ id: 'form-1', guideId: 'supported-squat', title: '支持ありスクワット', viewedAt }],
      journeyInventory: { ...DEFAULT_STATE.journeyInventory, tutorialCompletedAt: viewedAt },
    });
    expect(parseBackup(backup).state).toMatchObject({ formHistory: backup.state.formHistory, journeyInventory: { tutorialCompletedAt: viewedAt } });
  });
});
