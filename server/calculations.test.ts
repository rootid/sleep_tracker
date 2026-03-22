import { describe, it, expect } from 'vitest';
import { calculateDurationMinutes, calculateSleepScore } from './calculations';

describe('Sleep Utils - calculations', () => {
  describe('calculateDurationMinutes', () => {
    it('calculates exact hours', () => {
      const sleep = '2023-10-25T22:00:00.000Z';
      const wake = '2023-10-26T06:00:00.000Z'; // 8 hours
      expect(calculateDurationMinutes(sleep, wake)).toBe(480);
    });

    it('throws error if wake time is before sleep time', () => {
      const sleep = '2023-10-26T06:00:00.000Z';
      const wake = '2023-10-25T22:00:00.000Z';
      expect(() => calculateDurationMinutes(sleep, wake)).toThrow();
    });
  });

  describe('calculateSleepScore', () => {
    it('gives 100 for ideal sleep (8 hours)', () => {
      expect(calculateSleepScore(480)).toBe(100);
    });
    
    it('gives 100 for min ideal sleep (7 hours)', () => {
      expect(calculateSleepScore(420)).toBe(100);
    });

    it('gives 100 for max ideal sleep (9 hours)', () => {
      expect(calculateSleepScore(540)).toBe(100);
    });

    it('penalizes for under sleeping (6 hours)', () => {
      // 6 hours = 360 mins. 420 - 360 = 60 mins under. Penalty = 60/2 = 30. Score = 70.
      expect(calculateSleepScore(360)).toBe(70);
    });

    it('penalizes for over sleeping (10 hours)', () => {
      // 10 hours = 600 mins. 600 - 540 = 60 mins over. Penalty = 60/3 = 20. Score = 80.
      expect(calculateSleepScore(600)).toBe(80);
    });
  });
});
