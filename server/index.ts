import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { calculateDurationMinutes, calculateSleepScore } from './calculations.js';
import { calculateEarnedXp, evaluateLevelUp, evaluateBadges } from './gamification.js';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/data', async (req, res) => {
  try {
    const entries = db.prepare('SELECT * FROM sleep_entries ORDER BY date DESC').all();
    const statsRow = db.prepare('SELECT * FROM user_stats WHERE id = 1').get() as any;

    if (!statsRow) {
      return res.status(500).json({ error: 'Failed to retrieve user stats' });
    }

    const stats = {
      ...statsRow,
      unlockedBadges: JSON.parse(statsRow.unlockedBadges)
    };

    // Need to compute xpToNextLevel based on current level since it's dynamic
    const { calculateXpRequiredForLevel } = await import('./gamification.js');
    stats.xpToNextLevel = calculateXpRequiredForLevel(stats.level);

    res.json({ entries, stats });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/entries', (req, res) => {
  const { date, sleepTime, wakeTime } = req.body;

  if (!date || !sleepTime || !wakeTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Calculate new entry data
    const durationMinutes = calculateDurationMinutes(sleepTime, wakeTime);
    const sleepScore = calculateSleepScore(durationMinutes);
    const id = randomUUID();

    const newEntry = { id, date, sleepTime, wakeTime, durationMinutes, sleepScore };

    // 2. Fetch current state
    const currentEntries = db.prepare('SELECT * FROM sleep_entries ORDER BY date DESC').all() as any[];
    const statsRow = db.prepare('SELECT * FROM user_stats WHERE id = 1').get() as any;
    
    const stats = {
      ...statsRow,
      unlockedBadges: JSON.parse(statsRow.unlockedBadges)
    };

    // 3. Calculate new stats
    // Assume logging today increases streak
    const newStreak = stats.currentStreak + 1; 
    const earnedXp = calculateEarnedXp(newEntry, stats.currentStreak);
    const { newLevel, remainderXp } = evaluateLevelUp(stats.currentXp + earnedXp, stats.level);
    
    // Evaluate badges with the new entry included
    const entriesWithNew = [newEntry, ...currentEntries];
    const newUnlockedBadges = evaluateBadges(entriesWithNew, stats);
    const allBadges = [...stats.unlockedBadges, ...newUnlockedBadges];
    const newLongestStreak = Math.max(stats.longestStreak, newStreak);

    // 4. Perform database updates in a transaction
    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO sleep_entries (id, date, sleepTime, wakeTime, durationMinutes, sleepScore)
        VALUES (@id, @date, @sleepTime, @wakeTime, @durationMinutes, @sleepScore)
      `).run(newEntry);

      db.prepare(`
        UPDATE user_stats 
        SET level = @level, 
            currentXp = @currentXp, 
            currentStreak = @currentStreak, 
            longestStreak = @longestStreak, 
            unlockedBadges = @unlockedBadges
        WHERE id = 1
      `).run({
        level: newLevel,
        currentXp: remainderXp,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        unlockedBadges: JSON.stringify(allBadges)
      });
    });

    transaction();

    // 5. Return results
    res.json({
      entry: newEntry,
      earnedXp,
      leveledUp: newLevel > stats.level,
      newBadges: newUnlockedBadges
    });

  } catch (error) {
    console.error('Failed to add entry:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.post('/api/reset', (req, res) => {
  try {
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM sleep_entries').run();
      db.prepare(`
        UPDATE user_stats 
        SET level = 1, currentXp = 0, currentStreak = 0, longestStreak = 0, unlockedBadges = '[]'
        WHERE id = 1
      `).run();
    });
    
    transaction();
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to reset:', error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}