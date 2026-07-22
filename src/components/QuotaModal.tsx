
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Zap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface QuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const QuotaModal: React.FC<QuotaModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-gray-950 w-full max-w-lg rounded-[32px] md:rounded-[48px] overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:scale-110 transition-transform z-10">
              <X size={20} />
            </button>

            <div className="p-10 md:p-12 text-center relative z-10">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Zap size={40} className="animate-pulse" />
              </div>

              <h3 className="text-3xl font-black dark:text-white mb-4 leading-tight uppercase tracking-tight">System Analysis <br /><span className="text-orange-600">Limit Reached</span></h3>
              <p className="text-gray-500 dark:text-gray-400 font-bold mb-10 leading-relaxed uppercase text-[10px] tracking-widest">
                Your daily free session limit has been reached. <br />
                Capacity resets automatically every 24 hours.
              </p>

              <div className="space-y-4">
                <button 
                  onClick={onUpgrade}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <Crown size={18} /> Activate Scholar Pack
                </button>
                
                <button 
                  onClick={() => {
                    const event = new CustomEvent('campusai_open_payment', { detail: { type: 'refill', amount: 100, label: '3 Extra AI Sessions' } });
                    window.dispatchEvent(event);
                  }}
                  className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <Zap size={18} /> Buy 3 Extra Sessions — ₦100
                </button>

                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                >
                  Wait for Reset
                </button>
              </div>

              <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-800 flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Scholar Pack Benefit</p>
                  <p className="text-xs font-bold dark:text-white">Unlocks 3 calculations and 5 daily chats.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuotaModal;
