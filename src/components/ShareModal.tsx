import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, MessageCircle, Twitter, Facebook, Sparkles, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const shareUrl = window.location.origin;
  const shareText = "Campusai.com.ng - The 2026 Nigerian Admission Intelligence companion. Get real-time JAMB updates, university aggregate calculators, and AI-powered guidance. Don't fall behind!";

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText} \n\nCheck it out here: ${shareUrl}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const socialLinks = [
    { 
      name: 'WhatsApp', 
      icon: <MessageCircle size={20} />, 
      color: 'bg-emerald-500', 
      url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}` 
    },
    { 
      name: 'Twitter', 
      icon: <Twitter size={20} />, 
      color: 'bg-gray-900', 
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` 
    },
    { 
      name: 'Facebook', 
      icon: <Facebook size={20} />, 
      color: 'bg-blue-600', 
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` 
    }
  ];

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
            className="relative bg-white dark:bg-gray-950 w-full max-w-md rounded-[32px] md:rounded-[48px] overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl p-8 md:p-10 text-center"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
              <X size={24} />
            </button>

            <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-500/30">
              <Share2 size={36} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Share CampusAI</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed text-sm">
              Help your fellow scholars stay ahead of the 2026 admission curve.
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl mb-8 text-left">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles size={12} className="text-yellow-500" /> Introduction Snippet
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                "{shareText}"
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {socialLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 ${link.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    {link.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{link.name}</span>
                </a>
              ))}
            </div>

            <button 
              onClick={handleCopy}
              className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                isCopied ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200'
              }`}
            >
              {isCopied ? <><Check size={18} /> Link Captured</> : <><Copy size={18} /> Copy Invite Link</>}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;