import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const DEADLINES = [
  { name: 'Public Universities', date: new Date('2026-10-31T23:59:59').getTime() },
  { name: 'Private Universities', date: new Date('2026-11-30T23:59:59').getTime() },
  { name: 'Other Institutions', date: new Date('2026-12-31T23:59:59').getTime() },
];

export default function AdmissionCountdown() {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const nextDeadline = DEADLINES.find(d => d.date > now) || DEADLINES[DEADLINES.length - 1];
      const distance = nextDeadline.date - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
        name: nextDeadline.name
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeLeft.days && !timeLeft.hours) return null;

  return (
    <div className="bg-blue-900 text-white py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold text-center">
      <Clock size={16} />
      <span>{timeLeft.name} Deadline in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
    </div>
  );
};
