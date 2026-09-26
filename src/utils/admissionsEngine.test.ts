import { describe, it, expect } from 'vitest';
import {
  evaluateAdmission,
  getEffectiveCutoff,
  getDepartmentalCutoff,
  calculateOlevelPoints,
  ELDS_CUTOFF_DISCOUNT,
  CATCHMENT_CUTOFF_DISCOUNT,
} from './admissionsEngine';

describe('admissionsEngine', () => {
  describe('calculateOlevelPoints', () => {
    it('calculates UNILAG A1=4.0 points system up to 20 max', () => {
      const grades = ['A1', 'A1', 'A1', 'A1', 'A1']; // 5 * 4.0 = 20.0
      expect(calculateOlevelPoints(grades, 'unilag')).toBe(20.0);
    });

    it('handles mixed grades correctly for UNILAG', () => {
      const grades = ['A1', 'B2', 'B3', 'C4', 'C6']; // 4 + 3.6 + 3.2 + 2.8 + 2.0 = 15.6
      expect(calculateOlevelPoints(grades, 'unilag')).toBe(15.6);
    });

    it('caps maximum O-Level points at 20', () => {
      const grades = ['A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1']; // more than 5 A1s
      expect(calculateOlevelPoints(grades, 'unilag')).toBeLessThanOrEqual(20);
    });
  });

  describe('getDepartmentalCutoff', () => {
    it('returns official 2025/2026 UNILAG Medicine cutoff', () => {
      const cutoff = getDepartmentalCutoff('University of Lagos', 'Medicine & Surgery');
      expect(cutoff).toBe(80.50);
    });

    it('returns -1 for unknown department or institution', () => {
      expect(getDepartmentalCutoff('Unknown University', 'Astrophysics')).toBe(-1);
    });
  });

  describe('getEffectiveCutoff', () => {
    it('applies 5.0 points discount for ELDS quota pool', () => {
      const result = getEffectiveCutoff(75.0, 'elds');
      expect(result.effectiveCutoff).toBe(70.0);
      expect(result.discount).toBe(ELDS_CUTOFF_DISCOUNT);
      expect(result.quotaLabel).toContain('ELDS');
    });

    it('applies 3.0 points discount for Catchment quota pool', () => {
      const result = getEffectiveCutoff(75.0, 'catchment');
      expect(result.effectiveCutoff).toBe(72.0);
      expect(result.discount).toBe(CATCHMENT_CUTOFF_DISCOUNT);
      expect(result.quotaLabel).toContain('Catchment');
    });

    it('applies no discount for National Merit quota pool', () => {
      const result = getEffectiveCutoff(75.0, 'merit');
      expect(result.effectiveCutoff).toBe(75.0);
      expect(result.discount).toBe(0);
      expect(result.quotaLabel).toContain('Merit');
    });
  });

  describe('evaluateAdmission', () => {
    it('accurately evaluates UNILAG 50:30:20 formula with quota adjustment', () => {
      // JAMB: 320 (320/8 = 40.0)
      // Post-UTME: 80 (80 * 0.3 = 24.0)
      // O-Level: 20.0
      // Aggregate = 40 + 24 + 20 = 84.0
      const result = evaluateAdmission(
        'UNILAG',
        'Medicine & Surgery',
        320,
        80,
        20.0,
        false, // not ELDS
        true   // Catchment
      );

      expect(result.aggregate).toBe(84.0);
      expect(result.quotaPool).toBe('catchment');
      expect(result.publishedCutoff).toBe(80.50);
      expect(result.effectiveCutoff).toBe(77.50); // 80.50 - 3.0
      expect(result.buffer).toBe(6.50); // 84.0 - 77.50
    });

    it('evaluates UI 50:50 formula correctly', () => {
      // JAMB: 280 (280/8 = 35.0)
      // Post-UTME: 70 (70 / 2 = 35.0)
      // Aggregate = 35 + 35 = 70.0
      const result = evaluateAdmission(
        'University of Ibadan',
        'Computer Science',
        280,
        70,
        0,
        false,
        false
      );

      expect(result.aggregate).toBe(70.0);
      expect(result.quotaPool).toBe('merit');
    });
  });
});
