
import React from 'react';
import { Home, MapPinOff, Ghost, ArrowLeft, SearchX, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotFoundProps {
  onGoHome: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-20 relative overflow-hidden transition-colors">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full"></div>
      
      <div className="max-w-2xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          {/* Animated 404 Visual */}
          <div className="relative mb-12">
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl flex items-center justify-center border border-gray-100 dark:border-gray-800 relative">
                 <SearchX size={64} className="text-blue-600 dark:text-cyan-400" strokeWidth={1.5} />
                 
                 {/* Floating "!" tags */}
                 <div className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg border-4 border-white dark:border-gray-950">!</div>
              </div>
            </motion.div>
            
            {/* Shadow beneath icon */}
            <motion.div 
              animate={{ scale: [1, 0.8, 1], opacity: [0.2, 0.1, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-4 bg-black blur-md rounded-full mx-auto mt-6 opacity-20"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-red-100 dark:border-red-900/30">
            <MapPinOff size={12} />
            Route Error: 404
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Ahn ahn! <span className="text-blue-600 dark:text-cyan-400">Wrong Turn.</span>
          </h1>
          
          <div className="space-y-4 mb-12">
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-bold leading-relaxed max-w-lg mx-auto">
              E be like say you enter wrong lecture room! 
            </p>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base px-6">
              Looks like this campus doesn’t exist in our 2026 directory. 
              Maybe the school has relocated to the clouds? ☁️
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onGoHome}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/25 transition-all active:scale-95"
            >
              <Home size={18} />
              Return to Home Portal
            </button>
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 rounded-[24px] font-black text-xs uppercase tracking-widest hover:border-blue-500 dark:hover:border-cyan-500 transition-all active:scale-95"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>

          {/* Humorous Footer Badge */}
          <div className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-900 w-full">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              <Sparkles size={14} className="text-yellow-500" />
              Verified Missing Person Search
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
