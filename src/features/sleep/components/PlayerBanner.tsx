import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star } from 'lucide-react';
import type { UserStats } from '../../../types';

interface PlayerBannerProps {
  stats: UserStats;
}

export const PlayerBanner: React.FC<PlayerBannerProps> = ({ stats }) => {
  const xpNeeded = stats.xpToNextLevel;
  const progressPercent = Math.min(100, Math.max(0, (stats.currentXp / xpNeeded) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-indigo-50">
          <Star className="w-8 h-8 text-indigo-500 fill-indigo-500" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Dreamer</h2>
          <div className="text-3xl font-bold text-slate-800">
            Level {stats.level}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-md">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-slate-600">{stats.currentXp} XP</span>
          <span className="text-slate-400">{xpNeeded} XP to Next Level</span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 bg-orange-50 px-4 py-3 rounded-xl border border-orange-100">
        <div className="relative">
          <Flame className="w-8 h-8 text-orange-500" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-orange-400 opacity-20 blur-md rounded-full"
          />
        </div>
        <div>
          <div className="text-xl font-bold text-orange-600">{stats.currentStreak} Day</div>
          <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Streak</div>
        </div>
      </div>
    </motion.div>
  );
};
