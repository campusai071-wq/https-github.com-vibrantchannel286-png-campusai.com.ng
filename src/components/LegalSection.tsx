
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Lock, Cookie, ShieldCheck, FileText, Globe, AlertTriangle, ShieldAlert, CheckCircle2, Brain, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LegalSectionProps {
  type: 'terms' | 'privacy' | 'cookies';
}

const LegalSection: React.FC<LegalSectionProps> = ({ type }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  const sections = {
    terms: {
      title: 'Terms of Service',
      icon: Scale,
      color: 'blue',
      revision: 'June 2026.1',
      warning: 'PLEASE READ: Campusai.com.ng is an independent AI research platform. We are NOT the official JAMB portal. Always cross-verify critical deadlines with the official government domain.',
      content: [
        {
          title: '1. Service Scope & Algorithmic Processors',
          icon: FileText,
          color: 'text-blue-500',
          text: 'By utilizing this "Intelligence Engine" and its dynamic calculators, you acknowledge that all probability scores, what-if simulators, point-based O-level mapping criteria, and subject combination validations are generated via advanced mathematical modeling and Google Gemini Neural Networks. We provide guided target estimations for the 2026 Nigerian admission cycle.'
        },
        {
          title: '2. Data Accuracy & Interactive Simulators',
          icon: Globe,
          color: 'text-cyan-500',
          text: 'While our Strategist Nodes and "What-If" Analysis engines utilize verified university blueprints, values returned are high-probability simulation models. CampusAI accepts no liability for actual admissions decisions or portal errors. You are responsible for registering and verifying final thresholds with your chosen institutions.'
        },
        {
          title: '3. Service Access & Quota Limits',
          icon: ShieldCheck,
          color: 'text-emerald-500',
          text: 'Campusai.com.ng provides AI Strategist access for the active admission season. We reserve the right to apply rate limits or prioritize dedicated server channels to manage background calculations, real-time map requests, and news-alert distributions under heavy server loads.'
        },
        {
          title: '4. Prohibited Behavior & Integrity',
          icon: ShieldAlert,
          color: 'text-red-500',
          text: 'Scraping our database files, deploying bot vectors past our rate limiter, or trying to compromise the calculations backend triggers an immediate IP and hardware ban from our network nodes.'
        }
      ]
    },
    privacy: {
      title: 'Privacy Protocol',
      icon: Lock,
      color: 'emerald',
      revision: 'June 2026.1',
      warning: 'Your privacy is architected into the system. We use 256-bit encryption for all cloud profiles, journey logs, and mock scores.',
      content: [
        {
          title: '1. Academic Data & What-If Scores',
          icon: Lock,
          color: 'text-blue-500',
          text: 'We collect and process grade scores, JAMB combinations, simulation scores, and calculated aggregate results. Your credentials are fully protected. No individual "what-if" scores or experimental grade sequences are shared publicly.'
        },
        {
          title: '2. Map Coordinates & Center Finding',
          icon: Globe,
          color: 'text-emerald-500',
          text: 'CBT center routing coordinates are handled client-side using temporary browser memory or encrypted SSL tunnels. They are never kept on our persistent server databases.'
        },
        {
          title: '3. Institutional Subscription Alerts',
          icon: FileText,
          color: 'text-blue-400',
          text: 'By opting in to "Subscribe to Post-UTME/Update Alerts," you authorize CampusAI to map your registered email to your selected target universities. We only broadcast verified admissions, registration, and Post-UTME updates; you may cancel alerts at any time.'
        },
        {
          title: '4. Record Expungement',
          icon: Scale,
          color: 'text-orange-500',
          text: 'All calculations, user profiles, and active checklist histories can be completely and instantly expunged upon custom request by contacting support@campusai.com.ng.'
        }
      ]
    },
    cookies: {
      title: 'Cookie Policy',
      icon: Cookie,
      color: 'amber',
      revision: 'June 2026.1',
      warning: 'Cookies are small data packets used to synchronize your AI preferences and session tokens across the 2026 admission season.',
      content: [
        {
          title: '1. Essential Logic Cookies',
          icon: ShieldCheck,
          color: 'text-blue-500',
          text: 'These are strictly necessary for the core Decision Engine to function. They store your temporary session ID, theme preference (Dark/Light), and calculator state while you are actively mapping your aggregate scores.'
        },
        {
          title: '2. AI Preference Cookies',
          icon: Brain,
          color: 'text-cyan-500',
          text: 'These cookies help Gemini remember your academic focus (e.g., Medicine, Engineering) so the strategizer can provide personalized target thresholds without you re-entering data every visit.'
        },
        {
          title: '3. Synchronization & Persistence',
          icon: Globe,
          color: 'text-emerald-500',
          text: 'We use persistent local storage tokens to keep your checklist progress saved even if you close your browser. This ensures your 2026 admission journey is never lost.'
        }
      ]
    }
  };

  const data = sections[type];
  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors mb-12 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Previous
        </button>

        {/* Hero Header */}
        <div className="mb-16">
          <div className="flex items-center gap-6 mb-6">
            <div className={`w-16 h-16 md:w-20 md:h-20 bg-${data.color}-600 rounded-[28px] md:rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-${data.color}-500/20`}>
              <Icon size={36} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-none mb-2">
                {data.title}
              </h1>
              <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                System Revision: <span className={`text-${data.color}-500`}>{data.revision}</span>
              </p>
            </div>
          </div>

          <div className={`p-6 md:p-8 bg-${data.color}-50 dark:bg-${data.color}-900/10 rounded-[32px] border border-${data.color}-100 dark:border-${data.color}-800/50 flex gap-5`}>
            {type === 'terms' ? <AlertTriangle className="text-blue-600 shrink-0" size={24} /> : type === 'privacy' ? <CheckCircle2 className="text-emerald-600 shrink-0" size={24} /> : <Cookie className="text-amber-600 shrink-0" size={24} />}
            <p className={`text-sm md:text-base font-bold text-${data.color}-900 dark:text-${data.color}-200 leading-relaxed`}>
              {data.warning}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-16">
          {data.content.map((section, idx) => (
            <motion.section 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center ${section.color}`}>
                  <section.icon size={20} />
                </div>
                <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {section.title}
                </h2>
              </div>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium pl-14">
                {section.text}
              </p>
            </motion.section>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-24 pt-12 border-t border-gray-100 dark:border-white/5 text-center">
          <p className="text-xs text-gray-400 font-medium max-w-lg mx-auto leading-relaxed">
            These protocols govern your interaction with the CampusAI Federated Intelligence Network. By continuing to use our Strategist nodes, you acknowledge compliance with the logic defined above.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button onClick={() => navigate('/terms')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors">Terms</button>
            <div className="w-1 h-1 bg-gray-200 dark:bg-gray-800 rounded-full my-auto"></div>
            <button onClick={() => navigate('/privacy')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors">Privacy</button>
            <div className="w-1 h-1 bg-gray-200 dark:bg-gray-800 rounded-full my-auto"></div>
            <button onClick={() => navigate('/cookies')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors">Cookies</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalSection;
