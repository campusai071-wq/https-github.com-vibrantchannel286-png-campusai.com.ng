import React from 'react';
import { Target, Calculator, Cpu, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Select Your Target',
      description: 'Choose your dream Nigerian university, polytechnic, and specific course of study from our verified official database.',
      icon: Target,
      badge: 'Institution & Course',
      gradient: 'from-blue-500/10 to-indigo-500/15 border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-blue-400'
    },
    {
      step: '02',
      title: 'Input Your Scores',
      description: 'Enter your JAMB UTME score, Post-UTME screening score (or mock score), and best 5 O-Level SSCE grades.',
      icon: Calculator,
      badge: 'SSCE & UTME',
      gradient: 'from-emerald-500/10 to-teal-500/15 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400'
    },
    {
      step: '03',
      title: 'AI Aggregate Calculation',
      description: 'Our intelligent engine instantly computes your exact weighted aggregate score using official institutional ratios (e.g., 50:30:20).',
      icon: Cpu,
      badge: 'Automated Formula',
      gradient: 'from-violet-500/10 to-purple-500/15 border-violet-200/60 dark:border-violet-800/40 text-violet-600 dark:text-violet-400'
    },
    {
      step: '04',
      title: 'Track & Forecast Success',
      description: 'Compare your score against historical cutoffs, verify mandatory subject combinations, and forecast admission probability.',
      icon: TrendingUp,
      badge: 'Admission Insights',
      gradient: 'from-amber-500/10 to-orange-500/15 border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="inline-block px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
          Simple 4-Step User Journey
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          How CampusAI.ng Works
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
          Navigate your Nigerian university admission journey with absolute clarity and precision in four easy steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={idx}
              className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
            >
              {/* Subtle accent header line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.gradient} border shadow-xs`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-gray-300 dark:text-gray-700 font-mono tracking-tighter">
                    {item.step}
                  </span>
                </div>

                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-2">
                  {item.badge}
                </span>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Step {idx + 1} of 4</span>
                <span className="text-blue-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
