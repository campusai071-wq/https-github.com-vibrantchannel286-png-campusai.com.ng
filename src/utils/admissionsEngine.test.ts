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

    it('calculates OAU A1=10 scale divided by 5 up to 10 max', () => {
      // C4(7) + B3(8) + C4(7) + B3(8) + C5(6) = 36 / 5 = 7.2
      const grades = ['C4', 'B3', 'C4', 'B3', 'C5'];
      expect(calculateOlevelPoints(grades, 'oau')).toBe(7.2);
    });
  });

  describe('getDepartmentalCutoff', () => {
    it('returns official 2025/2026 UNILAG Medicine cutoff', () => {
      const cutoff = getDepartmentalCutoff('University of Lagos', 'Medicine & Surgery');
      expect(cutoff).toBe(80.50);
    });

    it('returns official 2025/2026 OAU Computer Science with Mathematics cutoff', () => {
      const cutoff = getDepartmentalCutoff('Obafemi Awolowo University', 'Computer Science with Mathematics');
      expect(cutoff).toBe(67.73);
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

    it('evaluates OAU 50:40:10 formula correctly for Computer Science with Mathematics', () => {
      // Candidate inputs:
      // JAMB: 242 (242 / 8 = 30.25)
      // Post-UTME: 62.5% (scaled to 40% = 25.0)
      // O'Level: C4, B3, C4, B3, C5 -> (7+8+7+8+6)/5 = 7.2
      // Aggregate = 30.25 + 25.0 + 7.2 = 62.45
      // Published Merit Cutoff: 67.73
      // Catchment discount: 3.0 -> Effective Cutoff: 64.73
      // Buffer: 62.45 - 64.73 = -2.28 (Candidate is borderline/below cutoff)
      const olevel = calculateOlevelPoints(['C4', 'B3', 'C4', 'B3', 'C5'], 'OAU');
      const result = evaluateAdmission(
        'Obafemi Awolowo University',
        'Computer Science with Mathematics',
        242,
        62.5,
        olevel,
        false, // not ELDS
        true   // Oyo is in Catchment for OAU
      );

      expect(result.aggregate).toBe(62.45);
      expect(result.publishedCutoff).toBe(67.73);
      expect(result.effectiveCutoff).toBe(64.73);
      expect(result.quotaPool).toBe('catchment');
      expect(result.buffer).toBe(-2.28);
    });
  });
});
