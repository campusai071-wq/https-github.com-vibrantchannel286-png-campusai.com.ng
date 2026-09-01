import React, { useEffect, useState, useRef } from 'react';

type Mode = 'cbt' | 'aggregate' | 'cgpa';

export default function MultiFeatureAnimation() {
  const [mode, setMode] = useState<Mode>('cbt');
  const [progress, setProgress] = useState(0);
  const [cbtScore, setCbtScore] = useState(285);
  const [aggScore, setAggScore] = useState(78.5);
  const [cgpaScore, setCgpaScore] = useState(4.65);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMode((prev) => {
        if (prev === 'cbt') return 'aggregate';
        if (prev === 'aggregate') return 'cgpa';
        return 'cbt';
      });
      setProgress(0);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();
    const duration = 4500;
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);
      if (p < 100) {
        timerRef.current = requestAnimationFrame(updateProgress);
      }
    };
    timerRef.current = requestAnimationFrame(updateProgress);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [mode]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-800/80">
        <button
          onClick={() => setMode('cbt')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'cbt' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          CBT Exam
        </button>
        <button
          onClick={() => setMode('aggregate')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'aggregate' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Aggregate
        </button>
        <button
          onClick={() => setMode('cgpa')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'cgpa' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          CGPA Studio
        </button>
      </div>

      {/* Dynamic Content Display */}
      <div className="min-h-[220px] flex flex-col justify-between">
        {mode === 'cbt' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                Live CBT Simulator
              </span>
              <span className="text-xs text-slate-400 font-mono">Time: 01:42:10</span>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-300">Mathematics Mock Question #14</div>
              <div className="text-sm font-black text-white">Evaluate (343)^(1/3) × (0.14)^(-1) × (25)^(-1/2)</div>
              <div className="flex gap-2 pt-2">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl">A. 10 ✓</span>
                <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl">B. 12</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <span>Predicted Score: <strong className="text-emerald-400 font-bold">{cbtScore} / 400</strong></span>
              <span className="text-emerald-400 font-bold">AI Step-by-Step Active</span>
            </div>
          </div>
        )}

        {mode === 'aggregate' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                Post-UTME Calculator
              </span>
              <span className="text-xs text-blue-400 font-bold">UNILAG / Medicine</span>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">JAMB (50%):</span>
                <span className="text-white">310 / 400</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Post-UTME (50%):</span>
                <span className="text-white">82%</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-300 uppercase">Computed Aggregate:</span>
                <span className="text-lg font-black text-blue-400 font-mono">79.5%</span>
              </div>
            </div>
            <div className="text-xs text-blue-300/80 font-medium">
              🎯 Merit Cutoff Met: Guaranteed Admission Probability (92%)
            </div>
          </div>
        )}

        {mode === 'cgpa' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">
                CGPA & Transcript Studio
              </span>
              <span className="text-xs text-purple-400 font-bold">Year 3, Semester 1</span>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Current Standing:</span>
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 font-bold text-xs rounded-full border border-purple-500/30">First Class Honors</span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cumulative CGPA</div>
                  <div className="text-2xl font-black text-purple-400 font-mono">4.65 <span className="text-xs font-normal text-slate-400">/ 5.00</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Units</div>
                  <div className="text-base font-bold text-white">84 Units</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-purple-300/80 font-medium">
              📈 Target Calculator: Maintain 4.70+ for Summa Cum Laude
            </div>
          </div>
        )}

        {/* Progress bar timer */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-4">
          <div
            className={`h-full transition-all duration-100 ${
              mode === 'cbt' ? 'bg-emerald-500' : mode === 'aggregate' ? 'bg-blue-500' : 'bg-purple-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
