import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import InviteEarn from './InviteEarn';
import { UserProfile } from '../types';

interface InviteEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

const InviteEarnModal: React.FC<InviteEarnModalProps> = ({ isOpen, onClose, user }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative bg-white dark:bg-gray-950 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-6"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
              <X size={20} />
            </button>
            <InviteEarn user={user} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default InviteEarnModal;
