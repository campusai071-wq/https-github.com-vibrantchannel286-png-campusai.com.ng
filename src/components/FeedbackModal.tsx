import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { submitFeedback } from '../services/dbService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, user }) => {
  const [type, setType] = useState<'bug' | 'feature' | 'correction' | 'general'>('general');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await submitFeedback({
        type,
        subject,
        content,
        userId: user?.uid,
        email: user?.email
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setContent('');
        setSubject('');
      }, 3000);
    } catch (err) {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Intelligence Feedback</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Help us optimize the engine</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-8">
              {success ? (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Transmission Received</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Our architects will review your report shortly.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'general', label: 'Suggestion', icon: <Sparkles size={14} /> },
                      { id: 'bug', label: 'Bug / Error', icon: <AlertCircle size={14} /> },
                      { id: 'feature', label: 'New Feature', icon: <Send size={14} /> },
                      { id: 'correction', label: 'Correction', icon: <ShieldCheck size={14} /> }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          type === item.id 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-blue-500'
                        }`}
                      >
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Subject (Optional)</label>
                    <input 
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. UNILAG aggregate error..."
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Detailed Report</label>
                    <textarea 
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Tell us exactly what happened or what you'd like to see..."
                      rows={5}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[24px] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <button
                    disabled={loading}
                    className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Transmit Feedback <Send size={18} /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
