import { useState, useEffect } from 'react';
import type { SleepEntry, UserStats } from '../../../types';
import { calculateDurationMinutes, calculateSleepScore } from '../utils/calculations';
import { calculateEarnedXp, evaluateLevelUp, evaluateBadges } from '../../gamification/utils/engine';

const STORAGE_KEYS = {
  ENTRIES: 'sleep_tracker_entries',
  STATS: 'sleep_tracker_stats'
};

const DEFAULT_STATS: UserStats = {
  level: 1,
  currentXp: 0,
  xpToNextLevel: 100,
  currentStreak: 0,
  longestStreak: 0,
  unlockedBadges: []
};

export const useSleepData = () => {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const storedEntries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    const storedStats = localStorage.getItem(STORAGE_KEYS.STATS);

    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
    
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }

    setIsLoaded(true);
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    }
  }, [entries, stats, isLoaded]);

  const addEntry = (date: string, sleepTime: string, wakeTime: string) => {
    try {
      const durationMinutes = calculateDurationMinutes(sleepTime, wakeTime);
      const sleepScore = calculateSleepScore(durationMinutes);

      const newEntry: SleepEntry = {
        id: crypto.randomUUID(),
        date,
        sleepTime,
        wakeTime,
        durationMinutes,
        sleepScore
      };

      const newEntries = [newEntry, ...entries];
      
      // Update Stats
      const earnedXp = calculateEarnedXp(newEntry, stats.currentStreak);
      const { newLevel, remainderXp } = evaluateLevelUp(stats.currentXp + earnedXp, stats.level);
      
      const newUnlockedBadges = evaluateBadges(newEntries, stats);
      
      const newStreak = stats.currentStreak + 1; // Assuming we logged today correctly (simplified)

      const newStats: UserStats = {
        ...stats,
        level: newLevel,
        currentXp: remainderXp,
        currentStreak: newStreak,
        longestStreak: Math.max(stats.longestStreak, newStreak),
        unlockedBadges: [...stats.unlockedBadges, ...newUnlockedBadges]
      };

      setEntries(newEntries);
      setStats(newStats);

      return {
        entry: newEntry,
        earnedXp,
        leveledUp: newLevel > stats.level,
        newBadges: newUnlockedBadges
      };
    } catch (error) {
      console.error('Failed to add sleep entry:', error);
      throw error;
    }
  };

  const clearData = () => {
    setEntries([]);
    setStats(DEFAULT_STATS);
    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.STATS);
  };

  return {
    entries,
    stats,
    addEntry,
    clearData,
    isLoaded
  };
};
