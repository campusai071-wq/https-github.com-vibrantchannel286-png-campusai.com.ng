import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Home, Calendar, Landmark, Zap, Calculator, BookOpen, FileCheck, Activity,
  Newspaper, Award, Brain, Sun, Moon, LogIn, User, Gift, ChevronRight, 
  CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Building, School, Building2, Crown, BarChart3
} from 'lucide-react';
import { getPostUtmeStats } from '../services/postUtmeTracker';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  user: any;
  onLoginRequest: () => void;
  onInviteEarnRequest: () => void;
  onScholarPackRequest?: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentPage,
  user,
  onLoginRequest,
  onInviteEarnRequest,
  onScholarPackRequest,
  theme,
  onThemeToggle
}) => {
  const [recordsVersion, setRecordsVersion] = React.useState(0);

  React.useEffect(() => {
    const handleUpdate = () => {
      setRecordsVersion(prev => prev + 1);
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('campusai_postutme_synced', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('campusai_postutme_synced', handleUpdate);
    };
  }, []);

  const stats = React.useMemo(() => getPostUtmeStats(), [recordsVersion]);

  const handleNavClick = (pageId: string, params?: any) => {
    onNavigate(pageId, params);
    onClose();
  };

  const navLinks = [
    {
      id: 'home',
      name: 'Home Orbit',
      icon: <Home size={18} />,
      badge: null,
      badgeBg: ''
    },
    {
      id: 'admissions',
      name: 'Post-UTME Tracker',
      icon: <Calendar size={18} />,
      badge: `${stats.open} OPEN`,
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    },
    {
      id: 'universities',
      name: 'Institutional Portals',
      icon: <Landmark size={18} />,
      badge: '283+ Schools',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20'
    },
    {
      id: 'jamb-caps',
      name: 'JAMB CAPS Portal',
      icon: <BarChart3 size={18} />,
      badge: 'Live Telemetry',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    },
    {
      id: 'calculator',
      name: 'JAMB Aggregate Calculator',
      icon: <Zap size={18} />,
      badge: '2026 Engine',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
    },
    {
      id: 'cbt-simulator',
      name: 'CBT Simulator',
      icon: <Activity size={18} />,
      badge: 'Live',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    },
    {
      id: 'cgpa-calculator',
      name: 'CGPA Studio',
      icon: <Calculator size={18} />,
      badge: 'Paused (2026/27)',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
    },
    {
      id: 'syllabus',
      name: 'Syllabus Explorer',
      icon: <BookOpen size={18} />,
      badge: 'JAMB & WAEC',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
    },
    {
      id: 'checklist',
      name: 'Clearance Checklist',
      icon: <FileCheck size={18} />,
      badge: 'CAPS Ready',
      badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
    },
    {
      id: 'jamb',
      name: 'Admission News',
      icon: <Newspaper size={18} />,
      badge: 'Live Feed',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
    },
    {
      id: 'rankings',
      name: 'Institutional Rankings',
      icon: <Award size={18} />,
      badge: null,
      badgeBg: ''
    }
  ];

  const categories = [
    { name: 'Federal Universities', type: 'Federal', icon: <Landmark size={14} className="text-blue-500" /> },
    { name: 'State Universities', type: 'State', icon: <Building2 size={14} className="text-emerald-500" /> },
    { name: 'Private Universities', type: 'Private', icon: <School size={14} className="text-purple-500" /> },
    { name: 'Polytechnics', type: 'Polytechnic', icon: <Building size={14} className="text-orange-500" /> },
    { name: 'Colleges of Education', type: 'COE', icon: <BookOpen size={14} className="text-cyan-500" /> }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 bottom-0 z-[200] w-full max-w-xs sm:max-w-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-white border-r border-gray-150 dark:border-gray-800 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div 
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => handleNavClick('home')}
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                  <Brain size={22} className="fill-white/20" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight flex items-center gap-1">
                    Campus<span className="text-cyan-500">AI</span>
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    2026 Admission Intelligence
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Close menu sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              
              {/* User Profile / Login Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-gray-900 dark:to-gray-900/80 border border-blue-100 dark:border-gray-800">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <h4 className="text-xs font-black truncate max-w-[140px]">
                          {user.displayName || 'Scholar Candidate'}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-slate-300 font-medium truncate max-w-[140px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNavClick('settings')}
                      className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 shadow-sm hover:text-blue-600 transition-colors"
                    >
                      <User size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={18} className="text-blue-600 dark:text-cyan-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">
                        Candidate Account
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-slate-300 leading-relaxed font-medium">
                      Sign in to save your target schools, track aggregate scores, and receive Post-UTME alerts.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onLoginRequest();
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                      <LogIn size={14} /> Sign In / Register
                    </button>
                  </div>
                )}
              </div>

              {/* Scholar Pack Banner Card */}
              {onScholarPackRequest && (
                <button
                  onClick={() => {
                    onClose();
                    onScholarPackRequest();
                  }}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all cursor-pointer text-left ${
                    user?.is_premium
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-amber-400/40 shadow-lg shadow-amber-500/20 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                      {user?.is_premium ? <Zap size={20} className="fill-white" /> : <Crown size={20} className="fill-amber-200 text-amber-100" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        {user?.is_premium ? 'Scholar Pack Active' : 'Activate Scholar Pack'}
                      </h4>
                      <p className="text-[10px] text-white/80 font-medium">
                        {user?.is_premium ? '500 NGN Plan Active • Manage' : 'Unlock Unlimited AI Predictions'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/80" />
                </button>
              )}

              {/* Live Post-UTME Tracking Indicator */}
              <div 
                onClick={() => handleNavClick('admissions')}
                className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 cursor-pointer group transition-all hover:border-emerald-500/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Post-UTME Status Monitor
                  </span>
                  <ChevronRight size={14} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 bg-white/80 dark:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="block text-sm font-black text-emerald-600 dark:text-emerald-400">{stats.open}</span>
                    <span className="text-[8px] font-bold uppercase text-gray-400">Open Now</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="block text-sm font-black text-amber-600 dark:text-amber-400">{stats.notOpen}</span>
                    <span className="text-[8px] font-bold uppercase text-gray-400">Not Open</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="block text-sm font-black text-rose-600 dark:text-rose-400">{stats.closed}</span>
                    <span className="text-[8px] font-bold uppercase text-gray-400">Closed</span>
                  </div>
                </div>
              </div>

              {/* Main Navigation Items */}
              <div className="space-y-1">
                <span className="px-3 text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                  Main Hub Navigation
                </span>

                {navLinks.map((link) => {
                  const isActive = currentPage === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between text-xs font-black transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}>
                          {link.icon}
                        </span>
                        <span>{link.name}</span>
                      </div>

                      {link.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${isActive ? 'bg-white/20 text-white' : link.badgeBg}`}>
                          {link.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Portal Directory Shortcuts */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-850">
                <span className="px-3 text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Portal Directory Categories
                </span>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.type}
                      onClick={() => handleNavClick('universities', { category: cat.type })}
                      className="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {cat.icon}
                        <span>{cat.name}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Utilities */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={onThemeToggle}
                  className="flex items-center gap-2 text-xs font-black text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={16} className="text-amber-400" /> Light Atmosphere
                    </>
                  ) : (
                    <>
                      <Moon size={16} className="text-blue-600" /> Dark Atmosphere
                    </>
                  )}
                </button>

                {user && (
                  <button
                    onClick={() => {
                      onClose();
                      onInviteEarnRequest();
                    }}
                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Gift size={16} /> Earn Credits
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
