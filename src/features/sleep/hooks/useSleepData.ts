import { useState, useEffect } from 'react';
import type { SleepEntry, UserStats } from '../../../types';

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

  // Fetch from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const data = await response.json();
          setEntries(data.entries);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch sleep data:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchData();
  }, []);

  const addEntry = async (date: string, sleepTime: string, wakeTime: string) => {
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, sleepTime, wakeTime })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add entry');
      }

      const result = await response.json();
      
      // We need to re-fetch the entire state to ensure we are perfectly in sync with the backend
      const dataResponse = await fetch('/api/data');
      if (dataResponse.ok) {
        const fullData = await dataResponse.json();
        setEntries(fullData.entries);
        setStats(fullData.stats);
      }

      return result;
    } catch (error) {
      console.error('Failed to add sleep entry:', error);
      throw error;
    }
  };

  const clearData = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      setEntries([]);
      setStats(DEFAULT_STATS);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  return {
    entries,
    stats,
    addEntry,
    clearData,
    isLoaded
  };
};
