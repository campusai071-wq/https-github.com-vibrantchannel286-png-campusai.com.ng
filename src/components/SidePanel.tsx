
import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Award, Calendar, Mail, CheckCircle2, ExternalLink, Loader2, Sparkles, Wifi, WifiOff, Zap, Flag, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import universityData from '../data/universities';
import AdUnit from './AdUnit';
import RecentActivity from './RecentActivity';
import { subscribeEmail } from '../services/dbService';
import { getLocalProfile, isRealUser } from '../services/userService';

const SidePanel: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const p = getLocalProfile();
    setProfile(p);
    
    const isSubbed = localStorage.getItem('campusai_subscriber');
    if (isSubbed) setSubscribed(true);
    const config = localStorage.getItem('campusai_firebase');
    if (config && config.includes('apiKey')) setIsLive(true);

    // Calculate dynamic progress
    const updateProgress = () => {
      const profile = getLocalProfile();
      const role = profile.role || 'Pre-Admission';
      const journeyKey = `campusai_journey_${role.toLowerCase().replace('/', '_')}`;
      const saved = localStorage.getItem(journeyKey);
      const completedSteps = saved ? JSON.parse(saved) : [];
      const totalSteps = 6; // All roles have 6 steps currently
      setProgress(Math.round((completedSteps.length / totalSteps) * 100));
    };

    updateProgress();
    window.addEventListener('storage', updateProgress);
    // Custom event for internal updates
    window.addEventListener('campusai_journey_updated', updateProgress);
    
    return () => {
      window.removeEventListener('storage', updateProgress);
      window.removeEventListener('campusai_journey_updated', updateProgress);
    };
  }, []);

  const trending = useMemo(() => {
    const shuffled = [...universityData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4).map(uni => ({ name: uni.name, status: '2026 Updates', url: uni.url }));
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    
    // Actually save to Firestore
    const success = await subscribeEmail(email);
    
    if (success) {
      localStorage.setItem('campusai_subscriber', 'true');
      setSubscribed(true);
      setEmail('');
    } else {
      alert("Subscription service encountered a cloud error. Please check internet connection.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Newsletter */}
      <div className="bg-blue-600 dark:bg-blue-800 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-4 right-6 z-20">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 rounded-full border border-emerald-400/30 text-[8px] font-black uppercase tracking-widest text-emerald-300">
              <Wifi size={8} /> Live Cloud
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-full border border-white/10 text-[8px] font-black uppercase tracking-widest text-blue-200">
              <WifiOff size={8} /> Simulation
            </div>
          )}
        </div>
        <AnimatePresence mode="wait">
          {subscribed ? (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={32} className="text-emerald-300" /></div>
              <h3 className="text-xl font-black mb-2">Subscribed!</h3>
              <p className="text-blue-100 text-sm">We'll send you 2026 admission alerts.</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Mail size={20} /> Stay Updated</h3>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input type="email" required placeholder="name@example.com" className="w-full bg-blue-700/50 border border-blue-400/30 rounded-2xl p-4 text-white outline-none font-bold" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button disabled={isSubmitting} className="w-full bg-white text-blue-700 font-black py-4 rounded-2xl shadow-xl uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Join 50k+ Students
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RecentActivity userId={profile && isRealUser(profile.uid) ? profile.uid : null} />

      {/* Trending Portals */}
      <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6"><TrendingUp className="text-blue-600 dark:text-cyan-400" /><h3 className="text-lg font-bold">Active Portals</h3></div>
        <div className="space-y-4">
          {trending.map((uni, i) => (
            <a key={i} href={uni.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group p-2 -mx-2 rounded-xl transition-colors">
              <span className="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-1">{uni.name}</span>
              <ExternalLink size={12} className="text-gray-300 group-hover:text-blue-500" />
            </a>
          ))}
        </div>
      </div>

      <AdUnit type="sidebar" />
      
      {/* JAMB CAPS Guide */}
      <div className="bg-orange-600 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Compass size={20} /> CAPS Navigator</h3>
        <p className="text-orange-100 text-sm mb-6 font-medium leading-relaxed">
           Stuck on "Admission in Progress" or "Not Recommended"? Let the AI guide you through the 2026 CAPS portal.
        </p>
        <button 
          onClick={() => {
            const event = new CustomEvent('campusai_open_ai', { detail: 'Guide me through JAMB CAPS navigation and what to do if my status is not changing.' });
            window.dispatchEvent(event);
          }}
          className="w-full bg-white text-orange-600 font-black py-4 rounded-2xl shadow-xl uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all"
        >
          Launch Guide
        </button>
      </div>

      {/* Journey Progress Widget */}
      <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-2">
              <Flag className="text-blue-600" size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Your Roadmap</h3>
           </div>
           <span className="text-[10px] font-black text-blue-600">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden mb-4">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             className="h-full bg-blue-600"
           ></motion.div>
        </div>
        <button 
          onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full py-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all"
        >
           View Full Roadmap
        </button>
      </div>

      {/* Top Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6"><Award className="text-emerald-600" /><h3 className="text-lg font-bold">Trending Intelligence</h3></div>
        <div className="flex flex-wrap gap-2">
          {['Subject Combos', 'Cut-off Marks', 'NYSC Mobilization', 'GPA Tracker', 'Job Listings', 'Institutional Licensing'].map(tag => (
            <span key={tag} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-800 cursor-pointer">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
