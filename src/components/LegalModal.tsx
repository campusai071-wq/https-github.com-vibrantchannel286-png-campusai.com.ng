
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Lock, Globe, Scale, AlertTriangle, ShieldAlert, CheckCircle2, Cookie, Brain } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | 'cookies';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
          />
          <motion.div 
            initial={{ scale: 0.9, y: 30, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.9, y: 30, opacity: 0 }} 
            className="relative bg-white dark:bg-gray-950 w-full max-w-3xl rounded-[32px] md:rounded-[48px] overflow-y-auto max-h-[90vh] no-scrollbar shadow-[0_32px_80px_rgba(0,0,0,0.5)] flex flex-col border border-white/10"
          >
            {/* Header */}
            <div className="p-8 md:p-10 bg-gray-900 text-white flex justify-between items-center border-b border-white/5 shrink-0 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-2xl border border-blue-400/20">
                  {type === 'terms' ? <Scale size={28} /> : type === 'privacy' ? <Lock size={28} /> : <Cookie size={28} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight uppercase">
                    {type === 'terms' ? 'Terms of Service' : type === 'privacy' ? 'Privacy Protocol' : 'Cookie Policy'}
                  </h3>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Revision: June 2026.1</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90"><X size={24} /></button>
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-14 overflow-y-auto no-scrollbar space-y-10 text-gray-600 dark:text-gray-400">
              {type === 'terms' ? (
                <>
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800/50 flex gap-4">
                    <AlertTriangle className="text-blue-600 shrink-0" size={24} />
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-200 leading-relaxed">
                      PLEASE READ: Campusai.com.ng is an independent AI research platform. We are NOT the official JAMB portal. Always cross-verify critical deadlines with the official government domain.
                    </p>
                  </div>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <FileText size={18} className="text-blue-500" /> 1. Service Scope & Algorithmic Processors
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      By utilizing this "Intelligence Engine" and its dynamic calculators, you acknowledge that all probability scores, what-if simulators, point-based O-level mapping criteria, and subject combination validations are generated via advanced mathematical modeling and Google Gemini Neural Networks. We provide guided target estimations for the 2026 Nigerian admission cycle.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <Globe size={18} className="text-cyan-500" /> 2. Data Accuracy & Interactive Simulators
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      While our Strategist Nodes and "What-If" Analysis engines utilize verified university blueprints, values returned are high-probability simulation models. CampusAI accepts no liability for actual admissions decisions or portal errors. You are responsible for registering and verifying final thresholds with your chosen institutions.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <ShieldCheck size={18} className="text-emerald-500" /> 3. Service Access & Quota Limits
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      Campusai.com.ng provides AI Strategist access for the active admission season. We reserve the right to apply rate limits or prioritize dedicated server channels to manage background calculations, real-time map requests, and news-alert distributions under heavy server loads.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <ShieldAlert size={18} className="text-red-500" /> 4. Prohibited Behavior & Integrity
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      Scraping our database files, deploying bot vectors past our rate limiter, or trying to compromise the calculations backend triggers an immediate IP and hardware ban from our network nodes.
                    </p>
                  </section>
                </>
              ) : type === 'privacy' ? (
                <>
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 flex gap-4">
                    <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      Your privacy is architected into the system. We use 256-bit encryption for all cloud profiles, journey logs, and mock scores.
                    </p>
                  </div>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <Lock size={18} className="text-blue-500" /> 1. Academic Data & What-If Scores
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      We collect and process grade scores, JAMB combinations, simulation scores, and calculated aggregate results. Your credentials are fully protected. No individual "what-if" scores or experimental grade sequences are shared publicly.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <Globe size={18} className="text-emerald-500" /> 2. Map Coordinates & Center Finding
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      CBT center routing coordinates are handled client-side using temporary browser memory or encrypted SSL tunnels. They are never kept on our persistent server databases.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <FileText size={18} className="text-blue-400" /> 3. Institutional Subscription Alerts
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      By opting in to "Subscribe to Post-UTME/Update Alerts," you authorize CampusAI to map your registered email to your selected target universities. We only broadcast verified admissions, registration, and Post-UTME updates; you may cancel alerts at any time.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <Scale size={18} className="text-orange-500" /> 4. Record Expungement
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      All calculations, user profiles, and active checklist histories can be completely and instantly expunged upon custom request by contacting support@campusai.com.ng.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-800/50 flex gap-4">
                    <Cookie className="text-amber-600 shrink-0" size={24} />
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
                      Cookies are small data packets used to synchronize your AI preferences and session tokens across the 2026 admission season.
                    </p>
                  </div>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <ShieldCheck size={18} className="text-blue-500" /> 1. Essential Logic Cookies
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      These are strictly necessary for the core Decision Engine to function. They store your temporary session ID, theme preference (Dark/Light), and calculator state while you are actively mapping your aggregate scores.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <Brain size={18} className="text-cyan-500" /> 2. AI Preference Cookies
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      These cookies help Gemini remember your academic focus (e.g., Medicine, Engineering) so the strategizer can provide personalized target thresholds without you re-entering data every visit.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                      <Globe size={18} className="text-emerald-500" /> 3. Synchronization & Persistence
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      We use persistent local storage tokens to keep your checklist progress saved even if you close your browser. This ensures your 2026 admission journey is never lost.
                    </p>
                  </section>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 md:p-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 text-center">
               <button 
                onClick={onClose} 
                className="w-full md:w-auto px-16 py-5 bg-gray-900 dark:bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
               >
                 I Consent & Accept Logic
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LegalModal;
