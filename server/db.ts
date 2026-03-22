import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : path.join(dataDir, 'database.sqlite');

export const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS sleep_entries (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    sleepTime TEXT NOT NULL,
    wakeTime TEXT NOT NULL,
    durationMinutes INTEGER NOT NULL,
    sleepScore INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    level INTEGER NOT NULL DEFAULT 1,
    currentXp INTEGER NOT NULL DEFAULT 0,
    currentStreak INTEGER NOT NULL DEFAULT 0,
    longestStreak INTEGER NOT NULL DEFAULT 0,
    unlockedBadges TEXT NOT NULL DEFAULT '[]'
  );

  -- Initialize default user stats if not exists
  INSERT OR IGNORE INTO user_stats (id) VALUES (1);
`);
