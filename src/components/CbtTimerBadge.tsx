import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

export interface CbtTimerBadgeProps {
  endTime: number;
  isTimerRunning: boolean;
  totalQuestions: number;
  totalAttempted: number;
  isTimed?: boolean;
  onTimeExpired: () => void;
}

export const CbtTimerBadge: React.FC<CbtTimerBadgeProps> = ({
  endTime,
  isTimerRunning,
  totalQuestions,
  totalAttempted,
  isTimed = true,
  onTimeExpired,
}: CbtTimerBadgeProps) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!isTimed || !endTime) return 0;
    return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  });

  const onTimeExpiredRef = useRef(onTimeExpired);
  useEffect(() => {
    onTimeExpiredRef.current = onTimeExpired;
  }, [onTimeExpired]);

  useEffect(() => {
    if (!isTimed || !isTimerRunning || !endTime) return;

    const tick = () => {
      const remainingMs = endTime - Date.now();
      if (remainingMs <= 1000) {
        setSecondsRemaining(0);
        onTimeExpiredRef.current();
        return;
      }
      setSecondsRemaining(Math.max(0, Math.floor(remainingMs / 1000)));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime, isTimerRunning, isTimed]);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isTimed) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="font-mono text-xs sm:text-sm font-bold bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-inner select-none">
          <Clock size={14} className="text-emerald-400" />
          <span>Untimed Practice</span>
        </div>
      </div>
    );
  }

  const remainingQuestions = Math.max(1, totalQuestions - totalAttempted);
  const paceSeconds = Math.max(1, Math.round(secondsRemaining / remainingQuestions));
  const isUrgent = secondsRemaining > 0 && secondsRemaining < 300; // < 5 minutes left

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {totalQuestions > 0 && (
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-full border border-slate-700 select-none">
          ⚡ Pace: {paceSeconds}s/q left
        </span>
      )}
      <div
        className={`font-mono text-sm sm:text-base font-bold bg-slate-800 px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow-inner transition-colors select-none ${
          isUrgent
            ? 'text-red-400 border-red-500/60 bg-red-950/40 animate-pulse'
            : 'text-emerald-400 border-slate-700'
        }`}
        title={isUrgent ? 'Under 5 minutes remaining!' : 'Time Remaining'}
      >
        <Clock size={14} className={isUrgent ? 'text-red-400' : 'text-emerald-400'} />
        <span>{formatTime(secondsRemaining)}</span>
      </div>
    </div>
  );
};
