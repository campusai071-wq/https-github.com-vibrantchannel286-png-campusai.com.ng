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
    { id: 'home', icon: <Home size={20} />, label: 'Home' },
    { id: 'admissions', icon: <GraduationCap size={20} />, label: 'KB' },
    { id: 'cbt-simulator', icon: <FileText size={20} />, label: 'CBT' },
    { id: 'calculator', icon: <Calculator size={20} />, label: 'Calc' },
    { id: 'news', icon: <Newspaper size={20} />, label: 'News' },
    { id: 'settings', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[140] bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800/80 px-1.5 pb-5 pt-2 shadow-2xl">
      <div className="flex justify-around items-center w-full max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id || (tab.id === 'federal' && ['federal', 'state', 'private', 'polytechnic', 'coe', 'national'].includes(activeTab));
          
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-1 cursor-pointer select-none"
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute -top-2 w-6 h-1 bg-blue-600 dark:bg-cyan-400 rounded-full"
                />
              )}
              <div className={`transition-all duration-200 ${isActive ? 'text-blue-600 dark:text-cyan-400 scale-105' : 'text-gray-400 dark:text-gray-500'}`}>
                {React.cloneElement(tab.icon, { size: 18 })}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tight mt-0.5 transition-colors ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;