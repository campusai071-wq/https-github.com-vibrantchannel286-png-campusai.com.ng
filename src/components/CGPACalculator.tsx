import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, Award, Info, Lock, Brain, TrendingUp, Sparkles, 
  CheckCircle2, Target, BookOpen, AlertTriangle, Clock, Bell, ShieldCheck, 
  ChevronRight, ArrowUpRight, GraduationCap, FileText
} from 'lucide-react';

interface CGPACalculatorProps {
  user?: any;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const CGPACalculator: React.FC<CGPACalculatorProps> = ({ user }) => {
  const [scale, setScale] = useState<5 | 4>(5);
  const [isNotified, setIsNotified] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState(user?.email || '');

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (notificationEmail) {
      setIsNotified(true);
    }
  };

  return (
    <section id="cgpa" className="py-20 bg-gray-50 dark:bg-gray-950 transition-colors relative overflow-hidden min-h-[85vh]">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100 dark:border-purple-800">
                  <Calculator size={12} />
                  Academic Calendar Alignment
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20 font-bold">
                  <Clock size={12} />
                  Paused for 2026/2027 Resumption
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                CGPA <span className="text-purple-600 dark:text-purple-400">Analytics</span> Studio
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-base max-w-xl">
                Official Multi-Semester Academic Grade Diagnostic & Degree Honours Forecaster for Nigerian Tertiary Institutions.
              </p>
            </div>

            {/* Scale toggle preview */}
            <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm shrink-0">
              <button 
                onClick={() => setScale(5)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scale === 5 ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                NUC 5.0 Point Scale
              </button>
              <button 
                onClick={() => setScale(4)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scale === 4 ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                NUC 4.0 Point Scale
              </button>
            </div>
          </div>

          {/* BLURRED MOCK CALCULATOR WITH COMING SOON OVERLAY */}
          <div className="relative rounded-[36px] bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Blurred Background Content (Mock Calculator) */}
            <div className="p-8 filter blur-sm opacity-50 select-none pointer-events-none">
              <div className="flex justify-between items-end mb-6">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                  <div className="h-8 w-48 bg-purple-100 dark:bg-purple-900/30 rounded-lg"></div>
                </div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                    <div className="h-12 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                    <div className="h-12 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay Banner */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-[2px]">
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-8 rounded-[32px] border border-white/20 dark:border-gray-700 shadow-2xl text-center max-w-md mx-auto relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10">
                  <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                    <Sparkles size={28} />
                  </div>
                  
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Coming Soon
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                    CGPA Engine 2026
                  </h3>
                  
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    The advanced semester tracking studio will be fully unlocked as the academic session begins.
                  </p>

                  {isNotified ? (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2 text-xs font-bold">
                      <CheckCircle2 size={16} />
                      <span>You're on the waitlist!</span>
                    </div>
                  ) : (
                    <form onSubmit={handleNotifyMe} className="flex gap-2">
                      <input 
                        type="email" 
                        required
                        placeholder="Enter email for early access..." 
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium outline-none focus:border-purple-500 transition-all"
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0"
                      >
                        Notify
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* OFFICIAL NUC GRADING SCALE REFERENCE TABLES */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="text-purple-600" size={22} />
                  Official NUC Grading Scale & Class Reference
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  Standard grade point equivalents for Nigerian university transcripts ({scale === 5 ? '5.0 System' : '4.0 System'}).
                </p>
              </div>

              <span className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                NUC Standard Standardized
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Grade Point Table */}
              <div className="bg-white dark:bg-gray-900 rounded-[28px] p-6 border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-purple-600" /> Letter Grade & Score Percentages
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase text-[9px] font-black tracking-wider">
                        <th className="pb-3">Mark (%)</th>
                        <th className="pb-3">Grade</th>
                        <th className="pb-3">Point Value ({scale}.0 Scale)</th>
                        <th className="pb-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-850 font-bold text-gray-700 dark:text-gray-200">
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400">70% - 100%</td>
                        <td className="py-3 font-black text-sm text-green-600 dark:text-green-400">A</td>
                        <td className="py-3">{scale === 5 ? 5.0 : 4.0}</td>
                        <td className="py-3 font-semibold text-gray-500">Excellent</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400">60% - 69%</td>
                        <td className="py-3 font-black text-sm text-blue-600 dark:text-blue-400">B</td>
                        <td className="py-3">{scale === 5 ? 4.0 : 3.0}</td>
                        <td className="py-3 font-semibold text-gray-500">Very Good</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400">50% - 59%</td>
                        <td className="py-3 font-black text-sm text-amber-600 dark:text-amber-400">C</td>
                        <td className="py-3">{scale === 5 ? 3.0 : 2.0}</td>
                        <td className="py-3 font-semibold text-gray-500">Good</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400">45% - 49%</td>
                        <td className="py-3 font-black text-sm text-orange-600 dark:text-orange-400">D</td>
                        <td className="py-3">{scale === 5 ? 2.0 : 1.0}</td>
                        <td className="py-3 font-semibold text-gray-500">Fair / Pass</td>
                      </tr>
                      {scale === 5 && (
                        <tr>
                          <td className="py-3 text-purple-600 dark:text-purple-400">40% - 44%</td>
                          <td className="py-3 font-black text-sm text-gray-600 dark:text-gray-400">E</td>
                          <td className="py-3">1.0</td>
                          <td className="py-3 font-semibold text-gray-500">Pass</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400">0% - {scale === 5 ? '39%' : '44%'}</td>
                        <td className="py-3 font-black text-sm text-red-600 dark:text-red-400">F</td>
                        <td className="py-3">0.0</td>
                        <td className="py-3 font-semibold text-gray-500">Fail</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Class of Degree Table */}
              <div className="bg-white dark:bg-gray-900 rounded-[28px] p-6 border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" /> Honours Class Distinction Bounds
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase text-[9px] font-black tracking-wider">
                        <th className="pb-3">Class Distinction</th>
                        <th className="pb-3">CGPA Range ({scale}.0)</th>
                        <th className="pb-3">Academic Standing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-850 font-bold text-gray-700 dark:text-gray-200">
                      <tr>
                        <td className="py-3 text-amber-600 dark:text-amber-400 font-black">First Class Honours</td>
                        <td className="py-3">{scale === 5 ? '4.50 – 5.00' : '3.50 – 4.00'}</td>
                        <td className="py-3 font-semibold text-green-600 dark:text-green-400">Distinction</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-blue-600 dark:text-blue-400 font-black">Second Class Upper (2.1)</td>
                        <td className="py-3">{scale === 5 ? '3.50 – 4.49' : '3.00 – 3.49'}</td>
                        <td className="py-3 font-semibold text-blue-600 dark:text-blue-400">Very Good</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400 font-black">Second Class Lower (2.2)</td>
                        <td className="py-3">{scale === 5 ? '2.40 – 3.49' : '2.00 – 2.99'}</td>
                        <td className="py-3 font-semibold text-purple-600 dark:text-purple-400">Good</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-600 dark:text-gray-400 font-black">Third Class Honours</td>
                        <td className="py-3">{scale === 5 ? '1.50 – 2.39' : '1.50 – 1.99'}</td>
                        <td className="py-3 font-semibold text-gray-500">Satisfactory</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 font-black">Pass Degree</td>
                        <td className="py-3">{scale === 5 ? '1.00 – 1.49' : '1.00 – 1.49'}</td>
                        <td className="py-3 font-semibold text-gray-400">Minimum Pass</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

          {/* UPCOMING 2026/2027 FEATURES PREVIEW */}
          <div className="p-8 rounded-[32px] bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles size={12} /> Upcoming Resumption Release
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">What's Coming in 2026/2027 Session Activation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Full feature suite re-enabling upon official school resumption.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Calculator size={20} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Multi-Semester Tracking</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Log 100L through 500L course credit units with automatic semester GP & running CGPA updates.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Target size={20} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Goal & Honours Forecaster</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Calculate target semester GPA required to achieve First Class or 2.1 Honours graduation targets.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Brain size={20} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">AI Recovery Coaching</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Get personalized study strategy recommendations and carry-over course clearance paths.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Transcript PDF Export</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Generate official student transcript summary cards with course codes and credit breakdowns.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CGPACalculator;
