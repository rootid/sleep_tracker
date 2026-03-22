import { differenceInMinutes, parseISO, isBefore } from 'date-fns';

export const calculateDurationMinutes = (sleepTimeIso: string, wakeTimeIso: string): number => {
  const sleepTime = parseISO(sleepTimeIso);
  const wakeTime = parseISO(wakeTimeIso);
  
  if (isBefore(wakeTime, sleepTime)) {
    throw new Error('Wake time cannot be before sleep time');
  }

  return differenceInMinutes(wakeTime, sleepTime);
};

export const calculateSleepScore = (durationMinutes: number): number => {
  // Ideal sleep is 7-9 hours (420 - 540 minutes)
  const idealMin = 420;
  const idealMax = 540;
  
  if (durationMinutes >= idealMin && durationMinutes <= idealMax) {
    return 100;
  }
  
  // Penalize for too little sleep
  if (durationMinutes < idealMin) {
    // Lose roughly 1 point for every 2 minutes under 7 hours.
    // E.g., 6 hours (360 mins) -> 60 mins under -> -30 pts -> Score 70
    const penalty = Math.floor((idealMin - durationMinutes) / 2);
    return Math.max(0, 100 - penalty);
  }
  
  // Penalize for too much sleep (over 9 hours)
  if (durationMinutes > idealMax) {
    // Lose roughly 1 point for every 3 minutes over 9 hours
    const penalty = Math.floor((durationMinutes - idealMax) / 3);
    return Math.max(0, 100 - penalty);
  }
  
  return 0;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};
