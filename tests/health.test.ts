import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { assessWeightPace, calculateBmi, calculateWeightTrend } from '../src/domain/health';

describe('health calculations', () => {
  it('calculates BMI', () => expect(calculateBmi(70, 175)).toBeCloseTo(22.86, 2));
  it('returns a positive finite BMI for valid ranges', () => fc.assert(fc.property(fc.double({ min: 30, max: 250, noNaN: true }), fc.double({ min: 120, max: 220, noNaN: true }), (weight, height) => { const bmi = calculateBmi(weight, height); expect(Number.isFinite(bmi)).toBe(true); expect(bmi).toBeGreaterThan(0); })));
  it('blocks targets below BMI 18.5', () => { const result = assessWeightPace({ adultConfirmed: true, heightCm: 170, targetWeightKg: 50, targetDate: '2027-01-01', measurements: [{ id: '1', measuredAt: '2026-08-24T00:00:00Z', weightKg: 65, source: 'manual' }], now: new Date('2026-08-24T00:00:00Z') }); expect(result.status).toBe('blocked'); });
  it('stops numeric pace advice when adulthood is not confirmed', () => { const result = assessWeightPace({ adultConfirmed: false, heightCm: 170, targetWeightKg: 60, targetDate: '2027-01-01', measurements: [{ id: '1', measuredAt: '2026-08-24T00:00:00Z', weightKg: 70, source: 'manual' }], now: new Date('2026-08-24T00:00:00Z') }); expect(result.status).toBe('blocked'); expect(result.requiredKgPerWeek).toBeUndefined(); });
  it('flags a rapid required pace for review', () => { const result = assessWeightPace({ adultConfirmed: true, heightCm: 170, targetWeightKg: 60, targetDate: '2026-09-24', measurements: [{ id: '1', measuredAt: '2026-08-24T00:00:00Z', weightKg: 70, source: 'manual' }], now: new Date('2026-08-24T00:00:00Z') }); expect(result.status).toBe('review'); expect(result.requiredKgPerWeek).toBeGreaterThan(0.9); });
  it('requires 14 days and three readings for a trend', () => { expect(calculateWeightTrend([{ id: '1', measuredAt: '2026-08-01T00:00:00Z', weightKg: 70, source: 'manual' }, { id: '2', measuredAt: '2026-08-10T00:00:00Z', weightKg: 69, source: 'manual' }])).toBeUndefined(); expect(calculateWeightTrend([{ id: '1', measuredAt: '2026-08-01T00:00:00Z', weightKg: 70, source: 'manual' }, { id: '2', measuredAt: '2026-08-10T00:00:00Z', weightKg: 69, source: 'manual' }, { id: '3', measuredAt: '2026-08-20T00:00:00Z', weightKg: 68, source: 'manual' }])).toBeLessThan(0); });
});
