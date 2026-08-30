import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';

export default function Jamb2027Tracker() {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Target: January 1, 2027
    const targetDate = new Date('2027-01-01T00:00:00').getTime();
    // Start date for the progress bar (e.g., beginning of JAMB prep season, let's say Jan 1, 2026)
    const startDate = new Date('2026-01-01T00:00:00').getTime();
    const totalDuration = targetDate - startDate;

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setProgress(100);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // Calculate progress percentage
      const elapsed = now - startDate;
      const currentProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      setProgress(currentProgress);

      // Calculate time left
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-3">
              <Calendar size={12} /> JAMB 2027 Countdown
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              Time Until JAMB 2027
            </h3>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              Track your preparation timeline. Stay consistent and keep your eyes on the goal.
            </p>
          </div>

          <div className="flex gap-3 text-center">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 w-16">
              <div className="text-2xl font-black text-white">{timeLeft.days}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Days</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 w-16">
              <div className="text-2xl font-black text-white">{timeLeft.hours}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Hrs</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 w-16">
              <div className="text-2xl font-black text-white">{timeLeft.minutes}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Min</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 w-16">
              <div className="text-2xl font-black text-white">{timeLeft.seconds}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Sec</div>
            </div>
          </div>
        </div>

        {/* Progress Track */}
        <div className="mt-8">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Jan 2026</span>
            <span className="text-blue-400">{progress.toFixed(1)}% Completed</span>
            <span>Jan 2027</span>
          </div>
          
          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 relative"
            >
              {/* Shine effect on the progress bar */}
              <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-[shimmer_2s_infinite]"></div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}} />
    </div>
  );
}
