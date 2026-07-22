import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send } from 'lucide-react';
import { getGlobalConfig } from '../services/dbService';

interface PremiumSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumSuccessModal: React.FC<PremiumSuccessModalProps> = ({ isOpen, onClose }) => {
  const [links, setLinks] = useState({ whatsapp: '', telegram: '' });

  useEffect(() => {
    if (isOpen) {
      getGlobalConfig().then(config => {
        if (config) {
          setLinks({
            whatsapp: config.premiumWhatsapp || '#',
            telegram: config.premiumTelegram || '#'
          });
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-[32px] max-w-sm w-full shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="dark:text-white" />
          </button>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Send size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black dark:text-white mb-2">Payment Successful!</h3>
            <p className="text-gray-500 text-sm">Welcome to CampusAI Premium. Join our exclusive communities below to start receiving daily alerts.</p>
          </div>

          <div className="space-y-3">
            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full p-4 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all">
              <MessageSquare size={18} /> Join WhatsApp Group
            </a>
            <a href={links.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full p-4 bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all">
              <Send size={18} /> Join Telegram Channel
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumSuccessModal;
