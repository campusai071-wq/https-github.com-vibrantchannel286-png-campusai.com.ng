
import React from 'react';
import { Info, Sparkles } from 'lucide-react';

interface AdUnitProps {
  type: 'leaderboard' | 'rectangle' | 'sidebar' | 'billboard';
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ type, className = '' }) => {
  const isEnabled = localStorage.getItem('campusai_google_ads') === 'true';

  if (!isEnabled) return null;

  const styles = {
    leaderboard: 'w-full h-[90px] md:h-[120px]',
    rectangle: 'w-full h-[250px]',
    sidebar: 'w-full h-[400px]',
    billboard: 'w-full h-[200px] md:h-[300px]'
  };

  return (
    <div className={`relative bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-[32px] flex flex-col items-center justify-center overflow-hidden group shadow-inner ${styles[type]} ${className}`}>
      {/* Google "AdChoices" Icon */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
        <span className="text-[8px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tighter">AdChoices</span>
        <Info size={10} className="text-gray-400" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700 shadow-lg relative z-10">
            <span className="text-lg font-black bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent">G</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-1">Google Sponsored Content</p>
          <div className="flex items-center justify-center gap-1 text-[8px] font-bold text-blue-500/50 uppercase">
             <Sparkles size={8} /> Relevant to your search
          </div>
        </div>
      </div>

      {/* Decorative Placeholder Lines */}
      <div className="mt-6 px-12 w-full max-w-sm">
        <div className="h-2.5 w-full bg-gray-200/50 dark:bg-gray-800/50 rounded-full mb-3"></div>
        <div className="h-2.5 w-2/3 bg-gray-200/50 dark:bg-gray-800/50 rounded-full mx-auto opacity-60"></div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
    </div>
  );
};

export default AdUnit;
