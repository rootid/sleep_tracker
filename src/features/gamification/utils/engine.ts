import { differenceInDays, parseISO } from 'date-fns';
import type { SleepEntry, UserStats } from '../../../types';

export const XP_CONSTANTS = {
  LOG_NIGHT: 10,
  PERFECT_DURATION: 20, // 7-9 hours
  STREAK_BONUS: 5, // Extra 5 XP per consecutive day (capped)
};

export const LEVEL_CONSTANTS = {
  BASE_XP: 100, // XP needed for Level 2
  MULTIPLIER: 1.5, // Exponential growth
};

export const calculateXpRequiredForLevel = (level: number): number => {
  if (level <= 1) return LEVEL_CONSTANTS.BASE_XP;
  // Level 1: 0 to 100
  // Level 2: 100 to 250 (requires 150 more)
  // Level 3: 250 to 475 (requires 225 more)
  return Math.floor(LEVEL_CONSTANTS.BASE_XP * Math.pow(LEVEL_CONSTANTS.MULTIPLIER, level - 1));
};

export const calculateEarnedXp = (
  entry: SleepEntry,
  currentStreak: number
): number => {
  let xp = XP_CONSTANTS.LOG_NIGHT;
  
  // Perfect night bonus
  if (entry.sleepScore === 100) {
    xp += XP_CONSTANTS.PERFECT_DURATION;
  }
  
  // Streak bonus (cap at 50 bonus XP per night)
  const streakBonus = Math.min(currentStreak * XP_CONSTANTS.STREAK_BONUS, 50);
  xp += streakBonus;
  
  return xp;
};

export const evaluateLevelUp = (
  currentXp: number,
  currentLevel: number
): { newLevel: number; remainderXp: number } => {
  let xpToNext = calculateXpRequiredForLevel(currentLevel);
  let tempLevel = currentLevel;
  let tempXp = currentXp;

  while (tempXp >= xpToNext) {
    tempXp -= xpToNext;
    tempLevel += 1;
    xpToNext = calculateXpRequiredForLevel(tempLevel);
  }

  return { newLevel: tempLevel, remainderXp: tempXp };
};

export const calculateStreak = (entries: SleepEntry[]): number => {
  if (!entries || entries.length === 0) return 0;
  
  // Sort entries by date descending (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );
  
  let currentStreak = 1;
  const today = new Date();
  
  // Check if the most recent entry is from today or yesterday
  const mostRecentDate = parseISO(sortedEntries[0].date);
  const daysSinceMostRecent = differenceInDays(today, mostRecentDate);
  
  if (daysSinceMostRecent > 1) {
    // Streak broken
    return 0;
  }

  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const d1 = parseISO(sortedEntries[i].date);
    const d2 = parseISO(sortedEntries[i + 1].date);
    
    // Expect 1 day difference
    if (differenceInDays(d1, d2) === 1) {
      currentStreak++;
    } else {
      break; // Gap found
    }
  }

  return currentStreak;
};

// Returns IDs of newly unlocked badges
export const evaluateBadges = (
  entries: SleepEntry[],
  stats: UserStats
): string[] => {
  const newlyUnlocked: string[] = [];
  const { unlockedBadges } = stats;

  const hasBadge = (id: string) => unlockedBadges.includes(id) || newlyUnlocked.includes(id);

  if (!hasBadge('first_log') && entries.length >= 1) {
    newlyUnlocked.push('first_log');
  }

  if (!hasBadge('perfect_night') && entries.some(e => e.sleepScore === 100)) {
    newlyUnlocked.push('perfect_night');
  }

  const streak = calculateStreak(entries);
  if (!hasBadge('streak_3') && streak >= 3) {
    newlyUnlocked.push('streak_3');
  }

  if (!hasBadge('streak_7') && streak >= 7) {
    newlyUnlocked.push('streak_7');
  }

  if (!hasBadge('early_bird')) {
    const isEarlyRiser = entries.some(e => {
      const wakeTime = parseISO(e.wakeTime);
      return wakeTime.getHours() < 6 || (wakeTime.getHours() === 6 && wakeTime.getMinutes() === 0);
    });
    if (isEarlyRiser) {
      newlyUnlocked.push('early_bird');
    }
  }

  return newlyUnlocked;
};
