import React from 'react';
import type { SleepEntry } from '../../../types';
import { format, subDays, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind classes
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface HeatmapProps {
  entries: SleepEntry[];
}

export const ConsistencyHeatmap: React.FC<HeatmapProps> = ({ entries }) => {
  // Generate last 30 days
  const today = new Date();
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = subDays(today, 29 - i);
    return format(d, 'yyyy-MM-dd');
  });

  const entryMap = new Map(entries.map(e => [e.date, e]));

  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'bg-slate-100';
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-green-400';
    if (score >= 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-6">30-Day Consistency</h3>
      
      <div className="grid grid-cols-10 gap-2">
        {days.map(date => {
          const entry = entryMap.get(date);
          const score = entry?.sleepScore;
          
          return (
            <div 
              key={date}
              title={`${format(parseISO(date), 'MMM dd')}: ${score !== undefined ? `Score ${score}` : 'No Data'}`}
              className={cn(
                "w-full aspect-square rounded-md transition-all duration-200 hover:scale-110 cursor-pointer",
                getScoreColor(score)
              )}
            />
          );
        })}
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500">
        <span>Less Consistent</span>
        <div className="w-3 h-3 rounded-sm bg-red-400"></div>
        <div className="w-3 h-3 rounded-sm bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-sm bg-green-400"></div>
        <div className="w-3 h-3 rounded-sm bg-green-500"></div>
        <span>More Consistent</span>
      </div>
    </div>
  );
};
