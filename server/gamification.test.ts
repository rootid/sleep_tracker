import { describe, it, expect } from 'vitest';
import { 
  calculateEarnedXp, 
  evaluateLevelUp, 
  XP_CONSTANTS, 
  LEVEL_CONSTANTS,
  evaluateBadges
} from './gamification';
import type { SleepEntry, UserStats } from '../src/types';

const mockPerfectEntry: SleepEntry = {
  id: '1',
  date: '2023-10-25',
  sleepTime: '2023-10-24T22:00:00Z',
  wakeTime: '2023-10-25T06:00:00Z',
  durationMinutes: 480,
  sleepScore: 100
};

const mockPoorEntry: SleepEntry = {
  id: '2',
  date: '2023-10-26',
  sleepTime: '2023-10-26T01:00:00Z',
  wakeTime: '2023-10-26T05:00:00Z',
  durationMinutes: 240,
  sleepScore: 10
};

describe('Gamification Engine', () => {
  describe('calculateEarnedXp', () => {
    it('grants base + perfect bonus for a 100 score entry', () => {
      const xp = calculateEarnedXp(mockPerfectEntry, 0);
      expect(xp).toBe(XP_CONSTANTS.LOG_NIGHT + XP_CONSTANTS.PERFECT_DURATION);
    });

    it('grants only base XP for poor score', () => {
      const xp = calculateEarnedXp(mockPoorEntry, 0);
      expect(xp).toBe(XP_CONSTANTS.LOG_NIGHT);
    });

    it('adds streak bonus up to cap', () => {
      // 3 day streak -> 15 bonus XP
      const xp = calculateEarnedXp(mockPoorEntry, 3);
      expect(xp).toBe(XP_CONSTANTS.LOG_NIGHT + 15);
      
      // 20 day streak -> cap at 50 bonus XP
      const cappedXp = calculateEarnedXp(mockPoorEntry, 20);
      expect(cappedXp).toBe(XP_CONSTANTS.LOG_NIGHT + 50);
    });
  });

  describe('evaluateLevelUp', () => {
    it('does not level up if xp is insufficient', () => {
      const result = evaluateLevelUp(50, 1);
      expect(result.newLevel).toBe(1);
      expect(result.remainderXp).toBe(50);
    });

    it('levels up exactly at threshold', () => {
      // Level 1 -> 2 requires BASE_XP (100)
      const result = evaluateLevelUp(LEVEL_CONSTANTS.BASE_XP, 1);
      expect(result.newLevel).toBe(2);
      expect(result.remainderXp).toBe(0);
    });
    
    it('handles multiple level ups', () => {
      // Level 1 -> 2 (100), Level 2 -> 3 (150)
      // Total needed from 1 to 3 = 250.
      const result = evaluateLevelUp(260, 1);
      expect(result.newLevel).toBe(3);
      expect(result.remainderXp).toBe(10);
    });
  });

  describe('evaluateBadges', () => {
    const mockStats: UserStats = {
      level: 1,
      currentXp: 0,
      xpToNextLevel: 100,
      currentStreak: 0,
      longestStreak: 0,
      unlockedBadges: []
    };

    it('awards first_log badge', () => {
      const unlocked = evaluateBadges([mockPoorEntry], mockStats);
      expect(unlocked).toContain('first_log');
    });

    it('awards perfect_night badge', () => {
      const unlocked = evaluateBadges([mockPerfectEntry], mockStats);
      expect(unlocked).toContain('perfect_night');
    });
    
    it('does not re-award existing badges', () => {
      const statsWithBadge = { ...mockStats, unlockedBadges: ['perfect_night', 'first_log'] };
      const unlocked = evaluateBadges([mockPerfectEntry], statsWithBadge);
      expect(unlocked).not.toContain('perfect_night');
      expect(unlocked).not.toContain('first_log');
    });
  });
});
