import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface SleepEntryFormProps {
  onAddEntry: (date: string, sleepTime: string, wakeTime: string) => void;
}

export const SleepEntryForm: React.FC<SleepEntryFormProps> = ({ onAddEntry }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Default values
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Construct full ISO strings based on date and time
    // If bedTime is after wakeTime, assume bedTime was the previous day
    const bedTimeHours = parseInt(bedTime.split(':')[0], 10);
    const wakeTimeHours = parseInt(wakeTime.split(':')[0], 10);

    let bedTimeStr = `${date}T${bedTime}:00Z`;
    let wakeTimeStr = `${date}T${wakeTime}:00Z`;

    if (bedTimeHours > wakeTimeHours) {
      // Bed time was previous day
      const d = parseISO(date);
      d.setDate(d.getDate() - 1);
      const prevDate = format(d, 'yyyy-MM-dd');
      bedTimeStr = `${prevDate}T${bedTime}:00Z`;
    }

    try {
      onAddEntry(date, bedTimeStr, wakeTimeStr);
      
      // Reset after tiny delay for animation feel
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Error logging sleep. Ensure wake time is after bed time.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 w-full max-w-lg mx-auto"
    >
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Log Last Night</h3>
        <p className="text-slate-500 text-sm">Earn XP and build your streak by tracking consistently.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="target-date" className="block text-sm font-semibold text-slate-700 mb-2">Target Date</label>
          <input 
            id="target-date"
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="bed-time" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              Bed Time
            </label>
            <input 
              id="bed-time"
              type="time" 
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="wake-time" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Sun className="w-4 h-4 text-orange-500" />
              Wake Time
            </label>
            <input 
              id="wake-time"
              type="time" 
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
              required
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Logging...' : 'Log Sleep & Earn XP'}
        </motion.button>
      </form>
    </motion.div>
  );
};
