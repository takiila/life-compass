import { describe, expect, it } from 'vitest';

import { recommendTraining } from '../src/domain/training';

const base = { measurements: [], recoveries: [], workouts: [], now: new Date('2026-08-25T12:00:00+09:00') };

describe('training recommendation', () => {
  it('stops before suggesting exercise when urgent symptoms were recorded', () => {
    const result = recommendTraining({ ...base, checkIn: { id: 'c', mode: 'training', createdAt: '2026-08-25T11:00:00+09:00', energy: 3, availableMinutes: 10, note: 'urgent-symptom' } });
    expect(result.status).toBe('stop');
    expect(result.reason).toContain('安全');
  });

  it('uses recent high soreness to recommend recovery without deleting the record', () => {
    const result = recommendTraining({ ...base, recoveries: [{ id: 'r', createdAt: '2026-08-25T08:00:00+09:00', area: 'legs', soreness: 8, intensity: 4 }] });
    expect(result.status).toBe('recover');
    expect(result.steps.at(-1)).toContain('記録');
  });

  it('turns available time and profile into an editable general training plan', () => {
    const result = recommendTraining({ ...base, heightCm: 170, targetWeightKg: 65, measurements: [{ id: 'w', measuredAt: '2026-08-25T08:00:00+09:00', weightKg: 70, source: 'manual' }], checkIn: { id: 'c', mode: 'training', createdAt: '2026-08-25T11:00:00+09:00', energy: 4, availableMinutes: 25 } });
    expect(result.status).toBe('train');
    expect(result.minutes).toBe(20);
    expect(result.reason).toContain('170cm');
    expect(result.reason).toContain('変更');
    expect(result.steps.length).toBeGreaterThanOrEqual(3);
  });
});
