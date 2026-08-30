import { describe, it, expect } from 'vitest';
import { slugify, cleanObject, stringify, getApiUrl } from './utils';

describe('src/services/utils.ts', () => {
  describe('slugify', () => {
    it('converts text into clean URL slug', () => {
      expect(slugify('JAMB 2025/2026 Admission Cutoff Marks')).toBe('jamb-20262027-admission-cutoff-marks');
      expect(slugify('  University of Lagos (UNILAG)  ')).toBe('university-of-lagos-unilag');
      expect(slugify('Computer Science & Engineering!')).toBe('computer-science-engineering');
    });
  });

  describe('cleanObject', () => {
    it('removes undefined keys from object', () => {
      const dirty = { name: 'CampusAI', score: undefined, meta: { age: 10, nullVal: null, undef: undefined } };
      const cleaned = cleanObject(dirty);
      expect(cleaned).toEqual({ name: 'CampusAI', meta: { age: 10, nullVal: null } });
    });
  });

  describe('stringify', () => {
    it('safely handles circular references without throwing', () => {
      const parent: any = { name: 'Parent' };
      parent.self = parent;
      expect(() => stringify(parent)).not.toThrow();
      expect(JSON.parse(stringify(parent))).toEqual({ name: 'Parent' });
    });
  });

  describe('getApiUrl', () => {
    it('returns path unchanged in browser environment', () => {
      expect(getApiUrl('/api/health')).toBe('/api/health');
    });
  });
});
