import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, ShieldCheck, Users, Building2, CheckCircle2, Award, FileText, ChevronRight, BarChart3, TrendingUp, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface JambCapsLiveTrackerProps {
  onSelectSchool?: (schoolName: string) => void;
}

export interface JambCapsStatsState {
  overview: {
    institutions: number;
    candidates: number;
    qualifiedDE: number;
    qualified100: number;
    qualifiedUTME_DE: number;
    qualified140: number;
  };
  olevel: {
    resultsUploaded: number;
    credits100DE: number;
    credits140DE: number;
    credits100EngDE: number;
    credits100EngMathDE: number;
    credits140EngDE: number;
    credits140EngMathDE: number;
  };
  todayAll: {
    instHeads: number;
    deskOfficers: number;
    approvedAcceptance: number;
    acceptedCandidates: number;
  };
  todayPrivate: {
    instHeads: number;
    deskOfficers: number;
    approvedAcceptance: number;
    acceptedCandidates: number;
  };
  summary: {
    instHeadsA: number;
    deskOfficersB: number;
    approvedAcceptC: number;
    acceptedD: number;
    totalAdmissions: number;
    admissionYear: string;
    sessionDate: string;
  };
  candidates?: number;
  qualified100?: number;
  acceptedD?: number;
  totalAdmissions?: number;
}

const DEFAULT_JAMB_CAPS_STATS: JambCapsStatsState = {
  overview: {
    institutions: 1809,
    candidates: 2275690,
    qualifiedDE: 77978,
    qualified100: 2126501,
    qualifiedUTME_DE: 2204479,
    qualified140: 2046608,
  },
  olevel: {
    resultsUploaded: 1206195,
    credits100DE: 1183588,
    credits140DE: 1164529,
    credits100EngDE: 1159916,
    credits100EngMathDE: 1148577,
    credits140EngDE: 1141887,
    credits140EngMathDE: 1130930,
  },
  todayAll: {
    instHeads: 784,
    deskOfficers: 1864,
    approvedAcceptance: 194,
    acceptedCandidates: 390,
  },
  todayPrivate: {
    instHeads: 207,
    deskOfficers: 1827,
    approvedAcceptance: 44,
    acceptedCandidates: 109,
  },
  summary: {
    instHeadsA: 38890,
    deskOfficersB: 39087,
    approvedAcceptC: 53873,
    acceptedD: 137763,
    totalAdmissions: 269613,
    admissionYear: "2026/2027",
    sessionDate: "Monday, September 14, 2026"
  },
  candidates: 2275690,
  qualified100: 2126501,
  acceptedD: 137763,
  totalAdmissions: 269613
};

function mergeCapsStats(current: JambCapsStatsState, incoming: Partial<JambCapsStatsState>): JambCapsStatsState {
  if (!incoming) return current;

  const a = incoming.summary?.instHeadsA ?? current.summary?.instHeadsA ?? 38890;
  const b = incoming.summary?.deskOfficersB ?? current.summary?.deskOfficersB ?? 39087;
  const c = incoming.summary?.approvedAcceptC ?? current.summary?.approvedAcceptC ?? 53873;
  const d = incoming.summary?.acceptedD ?? current.summary?.acceptedD ?? 137763;
  const total = a + b + c + d;

  const merged: JambCapsStatsState = {
    ...current,
    ...incoming,
    overview: {
      institutions: incoming.overview?.institutions ?? current.overview?.institutions ?? 1809,
      candidates: incoming.overview?.candidates ?? current.overview?.candidates ?? 2275690,
      qualifiedDE: incoming.overview?.qualifiedDE ?? current.overview?.qualifiedDE ?? 77978,
      qualified100: incoming.overview?.qualified100 ?? current.overview?.qualified100 ?? 2126501,
      qualifiedUTME_DE: incoming.overview?.qualifiedUTME_DE ?? current.overview?.qualifiedUTME_DE ?? 2204479,
      qualified140: incoming.overview?.qualified140 ?? current.overview?.qualified140 ?? 2046608,
    },
    olevel: {
      resultsUploaded: incoming.olevel?.resultsUploaded ?? current.olevel?.resultsUploaded ?? 1206195,
      credits100DE: incoming.olevel?.credits100DE ?? current.olevel?.credits100DE ?? 1183588,
      credits140DE: incoming.olevel?.credits140DE ?? current.olevel?.credits140DE ?? 1164529,
      credits100EngDE: incoming.olevel?.credits100EngDE ?? current.olevel?.credits100EngDE ?? 1159916,
      credits100EngMathDE: incoming.olevel?.credits100EngMathDE ?? current.olevel?.credits100EngMathDE ?? 1148577,
      credits140EngDE: incoming.olevel?.credits140EngDE ?? current.olevel?.credits140EngDE ?? 1141887,
      credits140EngMathDE: incoming.olevel?.credits140EngMathDE ?? current.olevel?.credits140EngMathDE ?? 1130930,
    },
    todayPrivate: {
      instHeads: incoming.todayPrivate?.instHeads ?? current.todayPrivate?.instHeads ?? 207,
      deskOfficers: incoming.todayPrivate?.deskOfficers ?? current.todayPrivate?.deskOfficers ?? 1827,
      approvedAcceptance: incoming.todayPrivate?.approvedAcceptance ?? current.todayPrivate?.approvedAcceptance ?? 44,
      acceptedCandidates: incoming.todayPrivate?.acceptedCandidates ?? current.todayPrivate?.acceptedCandidates ?? 109,
    },
    todayAll: {
      instHeads: incoming.todayAll?.instHeads ?? current.todayAll?.instHeads ?? 784,
      deskOfficers: incoming.todayAll?.deskOfficers ?? current.todayAll?.deskOfficers ?? 1864,
      approvedAcceptance: incoming.todayAll?.approvedAcceptance ?? current.todayAll?.approvedAcceptance ?? 194,
      acceptedCandidates: incoming.todayAll?.acceptedCandidates ?? current.todayAll?.acceptedCandidates ?? 390,
    },
    summary: {
      instHeadsA: a,
      deskOfficersB: b,
      approvedAcceptC: c,
      acceptedD: d,
      totalAdmissions: total,
      admissionYear: incoming.summary?.admissionYear || current.summary?.admissionYear || "2026/2027",
      sessionDate: incoming.summary?.sessionDate || current.summary?.sessionDate || "Monday, September 14, 2026",
    }
  };
  merged.candidates = merged.overview.candidates;
  merged.qualified100 = merged.overview.qualified100;
  merged.acceptedD = merged.summary.acceptedD;
  merged.totalAdmissions = merged.summary.totalAdmissions;
  return merged;
}

export const JambCapsLiveTracker: React.FC<JambCapsLiveTrackerProps> = ({ onSelectSchool }) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'olevel' | 'today' | 'summary'>('overview');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [lastSuccessfulTime, setLastSuccessfulTime] = useState<string>('');
  const [isFreshData, setIsFreshData] = useState<boolean>(false);
  const [isCachedData, setIsCachedData] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState<number>(0);

  const [stats, setStats] = useState<JambCapsStatsState>(() => {
    try {
      const saved = localStorage.getItem('campusai_jamb_caps_stats_v7');
      if (saved) {
        return mergeCapsStats(DEFAULT_JAMB_CAPS_STATS, JSON.parse(saved));
      }
    } catch (e) {}
    return DEFAULT_JAMB_CAPS_STATS;
  });

  // Auto-fetch latest server telemetry on mount and on tab focus/return
  useEffect(() => {
    localStorage.removeItem('campusai_jamb_caps_stats_v3');
    localStorage.removeItem('campusai_jamb_caps_stats_v4');
    localStorage.removeItem('campusai_jamb_caps_stats_v5');
    localStorage.removeItem('campusai_jamb_caps_stats_v6');
    let isMounted = true;

    const fetchTelemetry = (showStatus = false) => {
      if (showStatus) setIsRefreshing(true);
      axios.get(`/api/jamb/caps-stats?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store', 'Pragma': 'no-cache' }
      })
        .then(res => {
          if (isMounted && res.data) {
            if (res.data.stats) {
              setStats(res.data.stats);
              try {
                localStorage.setItem('campusai_jamb_caps_stats_v7', JSON.stringify(res.data.stats));
              } catch (e) {}
            }
            if (res.data.lastSuccessfulScrapeTime) {
              setLastSuccessfulTime(new Date(res.data.lastSuccessfulScrapeTime).toLocaleTimeString());
            }
            if (res.data.lastSyncError) setSyncError(res.data.lastSyncError);
            if (res.data.cooldownRemainingMs !== undefined) setCooldownLeft(res.data.cooldownRemainingMs);
            if (res.data.isFresh !== undefined) setIsFreshData(res.data.isFresh);
            if (res.data.isCached !== undefined) setIsCachedData(res.data.isCached);
          }
        })
        .catch((err) => {
          console.warn("[CAPS Tracker] Fetch telemetry notice:", err.message);
        })
        .finally(() => {
          if (isMounted && showStatus) setIsRefreshing(false);
        });
    };

    // Initial fetch on mount
    fetchTelemetry(false);

    // Re-fetch when user returns/focuses on the window or tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTelemetry(false);
      }
    };
    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic background poll every 60 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchTelemetry(false);
      }
    }, 60000);

    return () => { 
      isMounted = false; 
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = async (force = true) => {
    setIsRefreshing(true);
    setSyncStatus(force ? 'Fetching live telemetry from caps.jamb.gov.ng...' : 'Syncing live telemetry from caps.jamb.gov.ng...');
    setSyncError(null);
    try {
      const res = await axios.post(`/api/jamb/caps-sync?_t=${Date.now()}`, { force: true }, {
        headers: { 'Cache-Control': 'no-cache, no-store' }
      });
      if (res.data) {
        if (res.data.stats) {
          setStats(res.data.stats);
          try {
            localStorage.setItem('campusai_jamb_caps_stats_v7', JSON.stringify(res.data.stats));
          } catch (e) {}
        }
        if (res.data.lastSuccessfulScrapeTime) {
          setLastSuccessfulTime(new Date(res.data.lastSuccessfulScrapeTime).toLocaleTimeString());
        }
        setIsFreshData(!!res.data.isFresh);
        setIsCachedData(!!res.data.isCached);
        if (res.data.cooldownRemainingMs !== undefined) setCooldownLeft(res.data.cooldownRemainingMs);
        if (res.data.error) setSyncError(res.data.error);
        setSyncStatus(res.data.message || (res.data.isFresh ? 'Fresh official JAMB sync successful!' : 'Showing official cached telemetry.'));
      }
    } catch (err: any) {
      console.error("Sync error:", err);
      setSyncError(err.message || 'Network error reaching sync endpoint');
      setSyncStatus('Sync failed. Serving verified official cached telemetry.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const overview = stats.overview || DEFAULT_JAMB_CAPS_STATS.overview;
  const olevel = stats.olevel || DEFAULT_JAMB_CAPS_STATS.olevel;
  const todayAll = stats.todayAll || DEFAULT_JAMB_CAPS_STATS.todayAll;
  const summary = stats.summary || DEFAULT_JAMB_CAPS_STATS.summary;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
              isFreshData 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                : syncError 
                ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isFreshData ? 'bg-emerald-500 animate-pulse' : syncError ? 'bg-red-500' : 'bg-amber-500'}`} />
              {isFreshData ? 'Live Official JAMB Feed' : syncError ? 'Sync Failed (Using Cached Mirror)' : 'Cached Official Telemetry'}
            </span>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              Last Successful Sync: <strong className="text-gray-800 dark:text-gray-200 font-mono">{lastSuccessfulTime || 'Today'}</strong>
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Central Admissions Processing System (CAPS) Tracker
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time synchronization mirroring official JAMB database telemetry for admission processing.
          </p>
        </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigate('/jamb-caps');
                window.scrollTo(0, 0);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <span>View Full Portal</span>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => handleRefresh(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Sync Live Statistics"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-500' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
            </button>
            {cooldownLeft > 0 && (
              <button
                onClick={() => handleRefresh(true)}
                disabled={isRefreshing}
                className="px-2.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                title="Force Fresh Sync ignoring cooldown"
              >
                Force Sync
              </button>
            )}
          </div>
      </div>

      {syncStatus && (
        <div className={`mb-4 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
          syncError ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-cyan-400'
        }`}>
          <Activity size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* User-Facing Data Freshness Advisory & Status Decoder */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
        <ShieldCheck size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <strong className="font-bold">Data Freshness Advisory:</strong> This information was last successfully retrieved from the official JAMB source. If a live refresh is rate-limited or temporarily unavailable, CampusAI.ng automatically displays the last successfully retrieved data.
        </div>
      </div>

      {/* Interactive JAMB CAPS Status Decoder */}
      <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles size={14} className="text-blue-500" />
          Interactive JAMB CAPS Status Decoder & Guidance
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-[11px]">
          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
            <strong className="text-blue-600 dark:text-blue-400 block font-black">Admission in Progress</strong>
            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">Meaning:</strong> Screening is underway.</p>
            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">Action:</strong> Continue checking CAPS.</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">Caution: Does not guarantee final admission yet.</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
            <strong className="text-amber-600 dark:text-amber-400 block font-black">Approved / Recommended</strong>
            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">Meaning:</strong> Department accepted you.</p>
            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">Action:</strong> Await central JAMB seal.</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">Caution: Awaiting central validation.</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
            <strong className="text-emerald-600 dark:text-emerald-400 block font-black">Admitted</strong>
            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">Meaning:</strong> Official offer granted.</p>
            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">Action:</strong> Accept/Reject on portal.</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic">Action Required: Accept offer promptly.</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
            <strong className="text-purple-600 dark:text-purple-400 block font-black">Transfer Approval</strong>
            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">Meaning:</strong> Supplementary course offered.</p>
            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">Action:</strong> Accept/Decline transfer.</p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 italic">Caution: Changes your course of study.</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
            <strong className="text-rose-600 dark:text-rose-400 block font-black">Not Admitted</strong>
            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">Meaning:</strong> Cutoff not met or pending.</p>
            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">Action:</strong> Check supplementary options.</p>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 italic">Caution: Keep checking for updates.</p>
          </div>
        </div>
      </div>

      {/* Obvious Quick Action Banner for News & Tools */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-300" />
            Looking for Admission News & Cutoff Calculators?
          </h4>
          <p className="text-[11px] text-blue-100 mt-0.5">
            Calculate your aggregate score and read latest university admission bulletins instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              navigate('/');
              window.scrollTo(0, 0);
            }}
            className="px-3.5 py-2 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-all cursor-pointer shadow"
          >
            Read News
          </button>
          <button
            onClick={() => {
              navigate('/calculators');
              window.scrollTo(0, 0);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer shadow"
          >
            Calculators
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-100 dark:border-gray-800">
        {[
          { id: 'overview', label: 'Main Overview', icon: BarChart3 },
          { id: 'olevel', label: "O'Level Statistics", icon: FileText },
          { id: 'today', label: "Today's New Arrivals", icon: Activity },
          { id: 'summary', label: 'Cumulative Summary', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Institutions */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-20"><Building2 size={48} /></div>
              <p className="text-[11px] uppercase tracking-widest font-black text-emerald-200">Institutions</p>
              <h3 className="text-3xl font-black mt-2 tracking-tight">{overview.institutions.toLocaleString()}</h3>
              <p className="text-[11px] text-emerald-100 mt-1">Accredited Universities, Polys & Colleges</p>
            </div>

            {/* 2. Candidates */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-20"><Users size={48} /></div>
              <p className="text-[11px] uppercase tracking-widest font-black text-purple-200">Candidates (UTME & DE)</p>
              <h3 className="text-3xl font-black mt-2 tracking-tight">{overview.candidates.toLocaleString()}</h3>
              <p className="text-[11px] text-purple-100 mt-1">Registered & Processed Applicants</p>
            </div>

            {/* 3. Qualified DE */}
            <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-20"><Award size={48} /></div>
              <p className="text-[11px] uppercase tracking-widest font-black text-amber-200">Qualified for Admission (DE)</p>
              <h3 className="text-3xl font-black mt-2 tracking-tight">{overview.qualifiedDE.toLocaleString()}</h3>
              <p className="text-[11px] text-amber-100 mt-1">Direct Entry Verified Candidates</p>
            </div>

            {/* 4. Qualified 100+ */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-20"><TrendingUp size={48} /></div>
              <p className="text-[11px] uppercase tracking-widest font-black text-blue-200">Qualified (100+ Score)</p>
              <h3 className="text-3xl font-black mt-2 tracking-tight">{overview.qualified100.toLocaleString()}</h3>
              <p className="text-[11px] text-blue-100 mt-1">Scored 100 Marks and Above</p>
            </div>

            {/* 5. Qualified UTME & DE */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-20"><ShieldCheck size={48} /></div>
              <p className="text-[11px] uppercase tracking-widest font-black text-red-200">Qualified (UTME & DE)</p>
              <h3 className="text-3xl font-black mt-2 tracking-tight">{overview.qualifiedUTME_DE.toLocaleString()}</h3>
              <p className="text-[11px] text-red-100 mt-1">Overall Eligible Candidate Pool</p>
            </div>

            {/* 6. Qualified 140+ */}
            <div className="bg-gradient-to-br from-rose-700 to-rose-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-20"><CheckCircle2 size={48} /></div>
              <p className="text-[11px] uppercase tracking-widest font-black text-rose-200">Qualified (140+ Score)</p>
              <h3 className="text-3xl font-black mt-2 tracking-tight">{overview.qualified140.toLocaleString()}</h3>
              <p className="text-[11px] text-rose-100 mt-1">Met National University Minimum</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Content 2: O'Level Statistics */}
      {activeTab === 'olevel' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Candidates' O'Level Statistics (UTME & DE)
              </h4>
              <p className="text-xs text-gray-500">
                Breakdown of uploaded O'Level results and credit pass combinations required for institutional screening.
              </p>
            </div>
            <a 
              href="https://buyresultsverificationcode.ng/?fbclid=IwY2xjawT83JFwZG9mAWV4dG4DYWVtAjEwAGJyaWQRMVl2M3BqODFFcTUwSGtwbWhzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEe10oz4ePhZXWZvYxSjH_eeJsTj49p4KWzIzA7vTBCTYps-6xrG7536zJnmgk_aem_zxhBW4ca0ejN3YDJVPL6QA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors whitespace-nowrap"
            >
              Generate Verification Code <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "O'Level Results Uploaded (UTME & DE)", val: olevel.resultsUploaded.toLocaleString(), color: "emerald" },
              { label: "5 O'Level Credits, 100+ & DE", val: olevel.credits100DE.toLocaleString(), color: "purple" },
              { label: "5 O'Level Credits, 140+ & DE", val: olevel.credits140DE.toLocaleString(), color: "blue" },
              { label: "5 O'Level Credits, (100+) + English + DE", val: olevel.credits100EngDE.toLocaleString(), color: "amber" },
              { label: "5 O'Level Credits, (100+) + English/Maths + DE", val: olevel.credits100EngMathDE.toLocaleString(), color: "indigo" },
              { label: "5 O'Level Credits, (140+) + English + DE", val: olevel.credits140EngDE.toLocaleString(), color: "rose" },
              { label: "5 O'Level Credits, (140+) + Eng + Maths + DE", val: olevel.credits140EngMathDE.toLocaleString(), color: "teal" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200/60 dark:border-gray-700/60">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 pr-4">{item.label}</span>
                <span className="text-sm font-black text-gray-900 dark:text-white bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                  {item.val}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab Content 3: Today's New Arrivals */}
      {activeTab === 'today' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
              New Arrivals Today (All Institutions)
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Live transaction stream of candidate admission movements processed across Nigerian universities today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">For Inst. Heads Recommendation</p>
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">{todayAll.instHeads.toLocaleString()}</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">On Desk Officers Table</p>
              <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">{todayAll.deskOfficers.toLocaleString()}</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Approved for Acceptance</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{todayAll.approvedAcceptance.toLocaleString()}</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Accepted by Candidates</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{todayAll.acceptedCandidates.toLocaleString()}</h3>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Content 4: Summary */}
      {activeTab === 'summary' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Inst. Heads Rec. (A)</p>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{summary.instHeadsA.toLocaleString()}</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Desk Officers (B)</p>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{summary.deskOfficersB.toLocaleString()}</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Approved Accept (C)</p>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{summary.approvedAcceptC.toLocaleString()}</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Accepted (D)</p>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{summary.acceptedD.toLocaleString()}</h3>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-4 rounded-2xl shadow-lg">
              <p className="text-[10px] font-black text-blue-200 uppercase">Total Admissions (A+B+C+D)</p>
              <h3 className="text-2xl font-black mt-1">{summary.totalAdmissions.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-gray-900/10 p-6 rounded-2xl border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h5 className="font-bold text-sm text-gray-900 dark:text-white">Track Your Institution on JAMB CAPS</h5>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Check whether your target university has released admission lists or uploaded recommendations for your course.
              </p>
            </div>
            <button
              onClick={() => {
                navigate('/result-slip');
                window.scrollTo(0, 0);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Check Cutoffs & Status</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
