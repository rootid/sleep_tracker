export interface SleepEntry {
  id: string;
  date: string; // YYYY-MM-DD
  sleepTime: string; // ISO 8601 timestamp
  wakeTime: string; // ISO 8601 timestamp
  durationMinutes: number;
  sleepScore: number; // 0-100
}

export interface UserStats {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  unlockedBadges: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGE_DEFINITIONS: Record<string, Badge> = {
  'first_log': {
    id: 'first_log',
    name: 'Sleep Novice',
    description: 'Log your first night of sleep',
    icon: 'Moon'
  },
  'perfect_night': {
    id: 'perfect_night',
    name: 'Perfect Night',
    description: 'Get between 7 and 9 hours of sleep',
    icon: 'Star'
  },
  'streak_3': {
    id: 'streak_3',
    name: 'Consistency',
    description: 'Maintain a 3-day sleep tracking streak',
    icon: 'Flame'
  },
  'streak_7': {
    id: 'streak_7',
    name: 'Habit Builder',
    description: 'Maintain a 7-day sleep tracking streak',
    icon: 'Flame'
  },
  'early_bird': {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Wake up before 6 AM',
    icon: 'Sun'
  }
};
