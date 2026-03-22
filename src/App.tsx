import { useState } from 'react';
import { PlayerBanner } from './features/sleep/components/PlayerBanner';
import { SleepEntryForm } from './features/sleep/components/SleepEntryForm';
import { TrendChart } from './features/sleep/components/TrendChart';
import { ConsistencyHeatmap } from './features/sleep/components/ConsistencyHeatmap';
import { useSleepData } from './features/sleep/hooks/useSleepData';
import { formatDuration } from './lib/utils';
import confetti from 'canvas-confetti';
import { Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { entries, stats, addEntry, isLoaded } = useSleepData();
  const [showReward, setShowReward] = useState<{ score: number, xp: number } | null>(null);

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  const handleAddEntry = async (date: string, sleepTime: string, wakeTime: string) => {
    try {
      const result = await addEntry(date, sleepTime, wakeTime);
      
      // Trigger celebrations
      if (result.leveledUp) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#fbbf24']
        });
      }

      setShowReward({ score: result.entry.sleepScore, xp: result.earnedXp });
      setTimeout(() => setShowReward(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const latestEntry = entries[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
          <Moon className="text-indigo-600 fill-indigo-100 w-6 h-6" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            DreamTracker
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        {/* Gamification Banner */}
        <PlayerBanner stats={stats} />

        {/* Reward Overlay Animation */}
        <AnimatePresence>
          {showReward && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-2xl z-50 flex items-center gap-4 border-2 border-indigo-400"
            >
              <div className="font-bold text-lg">Score: {showReward.score}</div>
              <div className="w-px h-6 bg-indigo-400"></div>
              <div className="font-bold text-yellow-300 text-lg">+{showReward.xp} XP</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Logging & Recent */}
          <div className="lg:col-span-1 space-y-8">
            <SleepEntryForm onAddEntry={handleAddEntry} />
            
            {latestEntry && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Latest Log</h3>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-bold text-slate-800">
                      {formatDuration(latestEntry.durationMinutes)}
                    </div>
                    <div className="text-slate-500 text-sm mt-1">{latestEntry.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{latestEntry.sleepScore}</div>
                    <div className="text-indigo-400 text-xs font-semibold uppercase">Score</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Visualizations */}
          <div className="lg:col-span-2 space-y-8">
            <TrendChart entries={entries} />
            <ConsistencyHeatmap entries={entries} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;