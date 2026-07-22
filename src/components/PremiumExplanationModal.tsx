import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface PremiumExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const benefits = [
  "Daily JAMB & admission updates every morning",
  "Post-UTME dates announced before anyone else",
  "Admission list alerts — federal, state & private universities",
  "Cutoff mark predictions based on historical data",
  "ASUU & resumption updates",
  "Direct answers to your admission questions",
  "Morning Briefing delivered straight to your WhatsApp/Telegram"
];

const PremiumExplanationModal: React.FC<PremiumExplanationModalProps> = ({ isOpen, onClose, onProceed }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[201] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-[32px] max-w-lg w-full shadow-2xl relative border border-gray-100 dark:border-gray-800"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10">
            <X size={20} className="dark:text-white" />
          </button>
          
          <div className="mb-6">
            <h3 className="text-2xl font-black dark:text-white mb-2 text-center">Unlock Premium Benefits</h3>
            <p className="text-gray-500 text-center text-sm">Join 50+ students already inside</p>
          </div>

          <div className="space-y-3 mb-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="bg-emerald-500/20 p-0.5 rounded-full mt-0.5 shrink-0">
                  <Check size={14} className="text-emerald-500" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-xs font-semibold leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Price</p>
              <p className="text-lg font-black dark:text-white">₦500</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Access</p>
              <p className="text-lg font-black dark:text-white">30 Days</p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={onProceed}
              className="w-full p-4 bg-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
            >
              Continue to Payment
            </button>
            <button 
              onClick={onClose}
              className="w-full p-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumExplanationModal;
