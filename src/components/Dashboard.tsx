import React, { useState, useEffect } from 'react';
import InviteEarn from './InviteEarn';
import SEO from './SEO';
import PolicySection from './PolicySection';
import RecentActivity from './RecentActivity';
import FAQSection from './FAQSection';
import PostUtmeTrackerSection from './PostUtmeTrackerSection';
import { JambCapsLiveTracker } from './JambCapsLiveTracker';
import Jamb2027Tracker from './Jamb2027Tracker';
import AdUnit from './AdUnit';
import NewsGrid from './NewsGrid';
import StudentCommandCenter from './StudentCommandCenter';
import { FileCheck, ArrowRight, Sparkles, Download, Crown, Settings } from 'lucide-react';
import { NewsItem, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { useStandalone } from '../hooks/useStandalone';
import { getLocalProfile } from '../services/userService';

interface DashboardProps {
  user: any;
  onLoginRequest: () => void;
  onScholarPackRequest: () => void;
  onReadArticle: (article: NewsItem) => void;
  onNavigateToCalculator?: () => void;
  onOpenSettings?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLoginRequest, 
  onScholarPackRequest, 
  onReadArticle, 
  onNavigateToCalculator,
  onOpenSettings
}) => {
  const navigate = useNavigate();
  const isStandalone = useStandalone();
  const [profile, setProfile] = useState<UserProfile>(() => getLocalProfile());

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfile(getLocalProfile());
    };
    window.addEventListener('campusai_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('campusai_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  // Profile is considered configured if they have set a target university or score
  const isProfileConfigured = Boolean(
    profile.university || 
    profile.academicProfile?.targetInstitution || 
    profile.targetScore || 
    profile.targetUTMEScore || 
    profile.jambScore
  );

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      window.dispatchEvent(new CustomEvent('campusai_open_settings'));
    }
  };

  return (
    <div className="pb-16 space-y-12">
      <SEO />

      {/* ── Main Command Center Hub ── */}
      <div className="container mx-auto px-2.5 sm:px-4 md:px-8 pt-3 sm:pt-6 max-w-7xl">
        {isProfileConfigured ? (
          <StudentCommandCenter 
            user={user}
            onOpenSettings={onOpenSettings}
            onScholarPackRequest={onScholarPackRequest}
            onLoginRequest={onLoginRequest}
          />
        ) : (
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 border border-blue-800/50 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 font-bold text-[10px] uppercase tracking-wider">
                <Settings size={14} /> Action Required
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Configure Your Academic Profile
              </h2>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed max-w-xl">
                Unlock your personalized Student Command Center. Set your target institution, course, and UTME goals to track your admission readiness in real-time.
              </p>
            </div>
            
            <button
              onClick={handleOpenSettings}
              className="relative z-10 shrink-0 px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              Set Up Profile <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Action & Upgrade Bar ── */}
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {user?.is_premium ? 'Scholar Pack Active' : 'Pre-Admission Toolkit Active'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {user?.is_premium ? 'Unlimited AI Strategist calculations and past questions.' : 'Free tier enabled. Calculate aggregates and practice CBT questions.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isStandalone && (
              <button
                onClick={() => window.dispatchEvent(new Event('campusai_trigger_install'))}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download size={14} /> Install App
              </button>
            )}

            {user?.is_premium ? (
              <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5">
                <Crown size={14} /> Premium Verified
              </div>
            ) : (
              <button 
                onClick={onScholarPackRequest}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Crown size={14} /> Activate Scholar Pack
              </button>
            )}
          </div>
        </div>

        {user && (
          <div className="mt-6">
            <InviteEarn user={user} />
          </div>
        )}
      </div>

      {/* ── Telemetry Feeds, Trackers & Diagnostics ── */}
      <div className="container mx-auto px-4 md:px-8 max-w-6xl space-y-12">
        {user && <RecentActivity userId={user?.uid || null} />}
        
        {/* JAMB 2027 Countdown Tracker */}
        <Jamb2027Tracker />

        <AdUnit type="leaderboard" placement="dashboard" className="my-8" />
        
        {/* JAMB CAPS Live Admission Statistics Tracker */}
        <JambCapsLiveTracker 
          onSelectSchool={(schoolName) => {
            navigate('/universities', { state: { search: schoolName } });
            window.scrollTo(0, 0);
          }}
        />

        {/* Live Post-UTME Release Tracker Section directly on Dashboard */}
        <PostUtmeTrackerSection 
          compact={true}
          onNavigateToFullHub={() => {
            navigate('/admissions');
            window.scrollTo(0, 0);
          }}
          onSelectSchool={(schoolName) => {
            navigate('/universities', { state: { search: schoolName } });
            window.scrollTo(0, 0);
          }}
        />

        {/* Admission Clearance Banner Teaser */}
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-gray-900/40 border border-blue-500/20 rounded-[28px] p-6 md:p-8 text-left relative overflow-hidden shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
              <FileCheck size={14} /> 2025/2026 Clearance Hub
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Post-Admission Clearance & Document Checklist
            </h3>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              Admitted on JAMB CAPS? Prepare every required document before physical screening—JAMB admission letter, statement of result, medical fitness certificate, and state of origin.
            </p>
          </div>
          <button
            onClick={() => {
              navigate('/admission-checklist');
              window.scrollTo(0, 0);
            }}
            className="shrink-0 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            Open Clearance Checklist <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* FAQ block */}
      <div className="px-4 md:px-8">
        <div className="text-left p-6 md:p-8 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[32px] max-w-3xl mx-auto space-y-4">
          <h2 className="text-sm md:text-base font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            💡 How does the Student Command Center calculate admission readiness?
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            The CampusAI Student Command Center synchronizes four core telemetry pillars: your UTME target score gap, your calculated institutional aggregate against official departmental cutoffs, your CBT weak-topic drill accuracy, and your real-time JAMB CAPS verification status. All calculations adhere to the 2026 JAMB guidelines, O&apos;Level grade conversions, and state catchment quotas.
          </p>
        </div>
      </div>

      <PolicySection />

      <div id="news" className="container mx-auto px-4 md:px-8 py-12">
        <AdUnit type="billboard" placement="native" className="mb-12" />
        <NewsGrid 
          user={user} 
          onReadArticle={onReadArticle} 
          onDiscussAi={(news) => {
            if (user) {
              window.dispatchEvent(new CustomEvent('campusai_open_ai', { 
                detail: `I want to discuss the news report: "${news?.title}". Let's chat about what this means for my aggregate and cutoff requirements.` 
              }));
            } else {
              onLoginRequest();
            }
          }} 
          onLoginRequest={onLoginRequest} 
          isMiniPreview={true}
        />
      </div>

      <FAQSection />
    </div>
  );
};

export default Dashboard;
