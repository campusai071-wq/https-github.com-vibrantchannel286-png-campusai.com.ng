import React from 'react';
import { Home, Newspaper, User, Calculator, FileText, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
  activeTab: string;
  onNavigate: (id: string) => void;
  user?: any;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onNavigate, user }) => {
  const tabs = [
    { 
      id: 'home', 
      icon: <Home size={20} />, 
      label: 'Home', 
      ariaLabel: 'Go to CampusAI Homepage' 
    },
    { 
      id: 'admissions', 
      icon: <GraduationCap size={20} />, 
      label: 'Guides', 
      ariaLabel: 'Admission Guides and Knowledge Base' 
    },
    { 
      id: 'cbt-simulator', 
      icon: <FileText size={20} />, 
      label: 'CBT Practice', 
      ariaLabel: 'JAMB CBT Past Question Simulator' 
    },
    { 
      id: 'calculator', 
      icon: <Calculator size={20} />, 
      label: 'Aggregate', 
      ariaLabel: 'Post-UTME Aggregate Calculator' 
    },
    { 
      id: 'news', 
      icon: <Newspaper size={20} />, 
      label: 'Updates', 
      ariaLabel: 'Admission Updates and Bulletins' 
    },
    { 
      id: 'settings', 
      icon: <User size={20} />, 
      label: 'Profile', 
      ariaLabel: user ? 'Student Profile and Saved Results' : 'User Account and Sign In' 
    },
  ];

  return (
    <nav 
      aria-label="Mobile primary navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-[140] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 px-1 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl transition-colors"
    >
      <div className="flex justify-around items-stretch w-full max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id || (tab.id === 'federal' && ['federal', 'state', 'private', 'polytechnic', 'coe', 'national'].includes(activeTab));
          
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              aria-label={tab.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex-1 min-h-[48px] py-1 px-0.5 flex flex-col items-center justify-center cursor-pointer select-none rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive 
                  ? 'text-blue-600 dark:text-cyan-400' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute -top-1.5 w-7 h-1 bg-blue-600 dark:bg-cyan-400 rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {React.cloneElement(tab.icon, { 
                  size: 20, 
                  strokeWidth: isActive ? 2.5 : 1.9,
                  'aria-hidden': 'true'
                })}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tight mt-1 truncate max-w-full px-0.5 leading-none ${
                isActive 
                  ? 'text-blue-600 dark:text-cyan-400 font-black' 
                  : 'text-slate-600 dark:text-slate-400 font-semibold'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
