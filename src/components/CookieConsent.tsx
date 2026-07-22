
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStandalone } from '../hooks/useStandalone';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isStandalone = useStandalone();

  useEffect(() => {
    if (isStandalone) return;
    const consent = localStorage.getItem('campusai_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  if (isStandalone) return null;

  const handleAccept = () => {
    localStorage.setItem('campusai_cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    // We still need essential cookies to run, but we can note they declined non-essential
    localStorage.setItem('campusai_cookie_consent', 'essential-only');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-8 md:max-w-md z-[550]"
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-8 backdrop-blur-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Cookie className="text-white" size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Cookie Protocol</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  We use cookies and "Decision Tokens" to synchronize your admission data and provide real-time updates. By accepting, you enable our full AI Strategist engine.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                Accept All <ShieldCheck size={14} />
              </button>
              <button
                onClick={handleDecline}
                className="px-6 py-3.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
              >
                Essentials Only
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_legal', { detail: 'privacy' }))}
                className="text-[9px] font-black uppercase text-gray-400 tracking-widest hover:text-blue-500 transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                Review Privacy Protocol <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
