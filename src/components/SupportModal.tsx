import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Mail, Brain, ShieldCheck, Zap, ArrowRight, MessageSquare, Smartphone, Clock, Info } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateAI: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, onNavigateAI }) => {
  const whatsappNumber = localStorage.getItem('campusai_whatsapp') || '2349169760634';
  const supportEmail = localStorage.getItem('campusai_support_email') || 'support@campusai.com.ng';

  const channels = [
    {
      id: 'ai',
      title: 'Consult AI Strategist',
      description: 'Immediate logic for cutoffs, requirements, and admission math.',
      icon: <Brain className="text-cyan-400" size={24} />,
      action: () => { onNavigateAI(); onClose(); },
      badge: 'INSTANT',
      color: 'bg-blue-600'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Command',
      description: 'Connect with human architects for urgent technical issues.',
      icon: <MessageCircle className="text-emerald-400" size={24} />,
      action: () => window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hello CampusAI Support, I'm a 2026 applicant and I have an issue with my application.`, '_blank'),
      badge: 'URGENT',
      color: 'bg-emerald-600'
    },
    {
      id: 'email',
      title: 'Formal Ticket',
      description: 'Official record for security, billing, or verified account claims.',
      icon: <Mail className="text-orange-400" size={24} />,
      action: () => window.location.href = `mailto:${supportEmail}?subject=Formal Support Ticket: 2026 Application Cycle`,
      badge: '24H SYNC',
      color: 'bg-gray-800'
    },
    {
      id: 'feedback',
      title: 'Feedback & Improvements',
      description: 'Suggest a feature, report a bug, or correct institution info.',
      icon: <Zap className="text-yellow-400" size={24} />,
      action: () => window.dispatchEvent(new CustomEvent('campusai_open_feedback')),
      badge: 'COMMUNITY',
      color: 'bg-yellow-600'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative bg-white dark:bg-gray-950 w-full max-w-xl rounded-[32px] md:rounded-[48px] overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl border border-white/5">
            <div className="p-8 bg-gray-900 text-white flex justify-between items-center border-b border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-blue-400/20">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight uppercase">Command Desk</h3>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    Satellite Sync Active
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="p-8 space-y-4 bg-gray-50 dark:bg-gray-950">
              <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl mb-4">
                 <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-xs text-blue-800 dark:text-blue-300 font-bold leading-relaxed">
                   To ensure the highest accuracy for the 2026 cycle, our support network is divided into specialized intelligence channels. Choose the one that matches your urgency.
                 </p>
              </div>

              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={channel.action}
                  className="w-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] flex items-center justify-between group hover:border-blue-500 hover:shadow-xl transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {channel.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">{channel.title}</h4>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${channel.id === 'whatsapp' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{channel.badge}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[240px]">{channel.description}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </div>
                </button>
              ))}
            </div>

            <div className="p-6 text-center border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="inline-flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
                <div className="flex items-center gap-1.5"><Clock size={12}/> Signal Speed: 4.2ms</div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-1.5"><Smartphone size={12}/> Global Routing</div>
              </div>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-2">Command Desk Hours: 08:00 - 22:00 WAT (Mon - Sat)</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SupportModal;