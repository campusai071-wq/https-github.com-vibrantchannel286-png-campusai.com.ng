import React from 'react';
import { Home, Newspaper, User, Calculator, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
  activeTab: string;
  onNavigate: (id: string) => void;
  user?: any;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onNavigate, user }) => {
  const tabs = [
    { id: 'home', icon: <Home size={20} />, label: 'Home' },
    { id: 'calculator', icon: <Calculator size={20} />, label: 'Calc' },
    { id: 'result-slip', icon: <FileText size={20} />, label: 'Result' },
    { id: 'news', icon: <Newspaper size={20} />, label: 'News' },
    { id: 'settings', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[140] bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 px-4 pb-6 pt-3">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id || (tab.id === 'federal' && ['federal', 'state', 'private', 'polytechnic', 'coe', 'national'].includes(activeTab));
          
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative flex flex-col items-center gap-1 min-w-[64px]"
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute -top-3 w-8 h-1 bg-blue-600 rounded-full"
                />
              )}
              <div className={`transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
                {tab.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
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