
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Zap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { trackPremiumClick } from '../services/analytics';

interface QuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isGuest?: boolean;
  onLoginRequest?: () => void;
}

const QuotaModal: React.FC<QuotaModalProps> = ({ isOpen, onClose, onUpgrade, isGuest, onLoginRequest }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl cursor-pointer" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-gray-950 w-full max-w-lg rounded-[32px] md:rounded-[48px] overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <button 
              type="button"
              onClick={onClose} 
              aria-label="Close modal"
              className="absolute top-6 right-6 p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer shadow-sm"
            >
              <X size={20} />
            </button>

            <div className="p-10 md:p-12 text-center relative z-10">
              <div className={`w-20 h-20 ${isGuest ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'} rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl`}>
                {isGuest ? <ShieldCheck size={40} className="animate-pulse" /> : <Zap size={40} className="animate-pulse" />}
              </div>

              <h3 className="text-3xl font-black dark:text-white mb-4 leading-tight uppercase tracking-tight">
                {isGuest ? 'Guest Trial' : 'System Analysis'} <br />
                <span className={isGuest ? 'text-blue-600' : 'text-orange-600'}>Limit Reached</span>
              </h3>
              <p className="text-gray-500 dark:text-slate-300 font-bold mb-10 leading-relaxed uppercase text-[10px] tracking-widest">
                {isGuest 
                  ? <>You have used your free guest calculation. <br />Create a free account to unlock more.</>
                  : <>Your daily free session limit has been reached. <br />Capacity resets automatically every 24 hours.</>
                }
              </p>

              <div className="space-y-4">
                {isGuest ? (
                  <button 
                    onClick={onLoginRequest}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 active:scale-95 transition-all border border-blue-400/20"
                  >
                    Create Free Account <ArrowRight size={18} />
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        trackPremiumClick({ placement: 'quota_modal_full_pack', target_plan: 'Scholar Pack 2026' });
                        onUpgrade();
                      }}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <Crown size={18} /> Activate Scholar Pack
                    </button>
                    
                    <button 
                      onClick={() => {
                        trackPremiumClick({ placement: 'quota_modal_refill', target_plan: '1 Extra AI Session' });
                        const event = new CustomEvent('campusai_open_payment', { detail: { type: 'refill', amount: 100, label: '1 Extra AI Session' } });
                        window.dispatchEvent(event);
                      }}
                      className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <Zap size={18} /> Buy 1 Extra Session — ₦100
                    </button>
                  </>
                )}
                
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-slate-300 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                >
                  {isGuest ? 'Close' : 'Wait for Reset'}
                </button>
              </div>

              {!isGuest && (
                <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-800 flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Scholar Pack Benefit</p>
                    <p className="text-xs font-bold dark:text-white">Unlocks 5 calculations and 10 daily chats for 2 days.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuotaModal;
