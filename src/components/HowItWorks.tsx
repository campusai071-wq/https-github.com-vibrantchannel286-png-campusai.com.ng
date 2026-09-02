import React from 'react';
import { Target, Activity, Cpu, GraduationCap } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Practice & Master CBT',
      description: 'Train with authentic JAMB UTME past questions in our live timed simulator with instant step-by-step AI working and answers.',
      icon: Activity,
      badge: 'CBT Simulator & Syllabus',
      gradient: 'from-emerald-500/10 to-teal-500/15 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400'
    },
    {
      step: '02',
      title: 'Target Institution & Cutoff',
      description: 'Search official departmental cutoffs across Merit, Catchment, and ELDS quotas for over 280+ Nigerian universities and polytechnics.',
      icon: Target,
      badge: 'Institutional Gateways',
      gradient: 'from-blue-500/10 to-indigo-500/15 border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-blue-400'
    },
    {
      step: '03',
      title: 'AI Aggregate Engine',
      description: 'Compute your exact weighted aggregate score using university-specific official formulas (50:30:20, 50:50, screening points, or custom ratio).',
      icon: Cpu,
      badge: 'Automated Formula',
      gradient: 'from-violet-500/10 to-purple-500/15 border-violet-200/60 dark:border-violet-800/40 text-violet-600 dark:text-violet-400'
    },
    {
      step: '04',
      title: 'Track Success & CGPA',
      description: 'Track JAMB CAPS admission status in real-time, organize admission checklists, and project university semester GPAs in the CGPA Studio.',
      icon: GraduationCap,
      badge: 'CAPS & Academic Studio',
      gradient: 'from-amber-500/10 to-orange-500/15 border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="inline-block px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
          Complete Academic Lifecycle
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          How CampusAI.ng Works
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
          From UTME preparation and official cutoff benchmarking to aggregate computation, admission verification, and campus CGPA tracking.
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
