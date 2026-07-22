
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Sparkles, LogIn, GraduationCap } from 'lucide-react';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'guest' | 'user';
  onLogin?: () => void;
  onUpgrade?: () => void;
}

const TrialModal: React.FC<TrialModalProps> = ({ isOpen, onClose, type, onLogin, onUpgrade }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-gray-950 w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl border border-white/5"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all z-10">
              <X size={20} className="text-gray-400" />
            </button>

            <div className="p-10 text-center relative z-10">
              <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl">
                {type === 'guest' ? <LogIn size={40} /> : <GraduationCap size={40} />}
              </div>

              {type === 'guest' ? (
                <>
                  <h3 className="text-2xl font-black text-white mb-4 leading-tight uppercase tracking-tight">Free Analysis Used</h3>
                  <p className="text-gray-400 font-bold mb-10 leading-relaxed uppercase text-[10px] tracking-widest">
                    Sign in with Google to get 1 more free calculation — takes 5 seconds
                  </p>
                  <button 
                    onClick={onLogin}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <LogIn size={18} /> Sign In with Google
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-white mb-4 leading-tight uppercase tracking-tight">Limit Reached</h3>
                  <p className="text-gray-400 font-bold mb-10 leading-relaxed uppercase text-[10px] tracking-widest">
                    You have used your free calculations. Upgrade to Scholar Pack for unlimited access
                  </p>
                  <button 
                    onClick={onUpgrade}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <Crown size={18} /> Upgrade to Scholar Pack
                  </button>
                </>
              )}

              <button 
                onClick={onClose}
                className="w-full py-5 text-gray-500 font-black text-xs uppercase tracking-widest hover:text-white transition-all mt-4"
              >
                Close
              </button>

              <div className="mt-10 p-6 bg-white/5 rounded-[32px] border border-white/5 flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Premium Benefit</p>
                  <p className="text-xs font-bold text-white">Unlimited predictions for the entire 2026 session.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TrialModal;
