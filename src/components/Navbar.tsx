
import React, { useState, useEffect } from 'react';
import { Home, School, Building2, Brain, Newspaper, Info, Settings, Menu, X, ShieldCheck, LogIn, ChevronDown, Share2, Moon, Sun, User, ShieldAlert, Zap, Gift, Search, Loader2, FileCheck, BookOpen, GraduationCap, Calculator, Landmark, Crown, BarChart3, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAsuuStrikeStatus } from '../services/geminiService';
import { searchWebRaw, SearchResultItem } from '../services/searchService';
import { AdminState } from '../types';
import { auth } from '../services/firebaseConfig';
import { updateUserProfile } from '../services/userService';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  user: any;
  admin?: AdminState;
  onLoginRequest: () => void;
  onShareRequest: () => void;
  onInviteEarnRequest: () => void;
  onScholarPackRequest?: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  onOpenSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, user, admin, onLoginRequest, onShareRequest, onInviteEarnRequest, onScholarPackRequest, theme, onThemeToggle, onOpenSidebar }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [asuuStatus, setAsuuStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSyncingNews, setIsSyncingNews] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    getAsuuStrikeStatus().then(status => setAsuuStatus(status?.status || 'Stable'));

    const handleNewsSync = (e: any) => {
      setIsSyncingNews(true);
      const duration = e?.detail?.duration || 3500;
      setTimeout(() => {
        setIsSyncingNews(false);
      }, duration);
    };
    window.addEventListener('campusai_news_sync', handleNewsSync);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('campusai_news_sync', handleNewsSync);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const results = await searchWebRaw(searchQuery);
      setSearchResults(results || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const navItems = [
    { name: 'Home', icon: <Home size={18} />, id: 'home' },
    { name: 'Admissions', icon: <GraduationCap size={18} />, id: 'admissions' },
    { name: 'Portals', icon: <Landmark size={18} />, id: 'universities' },
    { name: 'CAPS Portal', icon: <BarChart3 size={18} />, id: 'jamb-caps' },
    { name: 'Syllabus', icon: <BookOpen size={18} />, id: 'syllabus' },
    { name: 'Calculator', icon: <Zap size={18} />, id: 'calculator' },
    { name: 'CGPA Studio', icon: <Calculator size={18} />, id: 'cgpa-calculator' },
    { name: 'Result Slip', icon: <ShieldCheck size={18} />, id: 'result-slip' },
    { name: 'Checklist', icon: <FileCheck size={18} />, id: 'checklist' },
    { name: 'Latest News', icon: <Newspaper size={18} />, id: 'jamb' },
  ];

  // STRICT SECURITY CHECK
  const isAuthorizedAdmin = user?.email === 'eiweh123@gmail.com';

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const categories = [
    { name: 'Federal', id: 'federal' },
    { name: 'State', id: 'state' },
    { name: 'Private', id: 'private' },
    { name: 'Polytechnic', id: 'polytechnic' },
    { name: 'COE', id: 'coe' },
    { name: 'National', id: 'national' },
    { name: 'Jobs', id: 'jobs' },
    { name: 'Scholarships', id: 'scholarships' },
    { name: 'NYSC', id: 'nysc' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-300 ease-in-out ${
      isScrolled 
        ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm py-3' 
        : 'bg-white/95 dark:bg-gray-950/95 py-4 border-b border-gray-200/80 dark:border-gray-800 backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3.5">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="p-2.5 rounded-xl transition-all bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 cursor-pointer"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="flex flex-col items-start cursor-pointer group" onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}>
            <span className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-0.5 text-gray-950 dark:text-white transition-colors">
              Campus
              <span className="inline-flex items-center justify-center mx-0.5 text-cyan-500 dark:text-cyan-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Brain size={22} className="fill-cyan-500/20 text-cyan-500 dark:text-cyan-400 stroke-[2.5]" />
              </span>
              AI<span className="text-cyan-600 dark:text-cyan-400 font-extrabold">.ng</span>
            </span>
            <div className="flex flex-wrap items-center mt-0.5 gap-2">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[7px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300">
                  {asuuStatus || 'Active Session'}
                </span>
              </div>
              <span className="text-[7px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">•</span>
              <span className="text-[7px] font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-300 font-bold">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Subtle 'Syncing...' indicator component */}
          <AnimatePresence>
            {isSyncingNews && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -10 }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-600 dark:text-cyan-400 text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_12px_rgba(34,211,238,0.15)] animate-pulse ml-2"
              >
                <Loader2 size={11} className="animate-spin text-cyan-500 dark:text-cyan-400" />
                <span>Syncing...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-[200px] xl:max-w-md mx-4 xl:mx-8 relative">
          <form onSubmit={handleSearch} className="w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-[10px] font-bold rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 focus:border-cyan-500 dark:focus:border-cyan-400 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all outline-none"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                >
                  <X size={12} className="text-gray-400 dark:text-gray-500" />
                </button>
              )}
              {isSearching && <Loader2 size={12} className="animate-spin text-cyan-500" />}
            </div>
          </form>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (searchQuery.length > 0) && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowSearchResults(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-[110]"
                >
                  <div className="p-4 flex justify-between items-center border-b border-gray-50 dark:border-gray-900">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search Results</span>
                    <button onClick={() => setShowSearchResults(false)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    {isSearching ? (
                      <div className="p-12 flex flex-col items-center justify-center gap-4">
                        <Loader2 size={32} className="animate-spin text-blue-600" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Consulting Intel Engine...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col">
                        {searchResults.map((result) => (
                          <a
                            key={result.url}
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-b border-gray-50 dark:border-gray-900 last:border-0 group"
                          >
                            <h4 className="text-xs font-black text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">{result.title}</h4>
                            <p className="text-[10px] text-gray-500 dark:text-slate-300 line-clamp-2 leading-relaxed">{result.content}</p>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No intelligence found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center space-x-1.5 font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                currentPage === item.id 
                  ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' 
                  : 'text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
            {/* ADMIN ONLY ACCESS */}
            {isAuthorizedAdmin && (
               <button 
                 onClick={() => onNavigate('admin')} 
                 className="p-2.5 rounded-xl transition-all bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse cursor-pointer"
                 title="Open Architect Console"
                 aria-label="Open Architect Console"
               >
                 <ShieldAlert size={18} />
               </button>
            )}

            {/* GLOBAL HIGH-CRAFT THEME TOGGLE SWITCH */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => onThemeToggle?.()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onThemeToggle?.(); } }}
              aria-label={`Current theme is ${theme}. Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="relative flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-inner hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer select-none"
            >
              {/* Animated active backdrop slider */}
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`absolute top-1 bottom-1 w-7 rounded-xl shadow-xs ${
                  theme === 'dark'
                    ? 'left-[calc(100%-32px)] bg-gray-800 border border-cyan-500/30 shadow-cyan-500/10'
                    : 'left-1 bg-white border border-amber-400/30 shadow-amber-500/10'
                }`}
              />

              {/* Sun (Light Mode) */}
              <div 
                className={`relative z-10 w-7 h-7 flex items-center justify-center rounded-xl transition-colors duration-200 ${
                  theme === 'light' 
                    ? 'text-amber-500' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Sun size={15} className={`transition-transform duration-300 ${theme === 'light' ? 'rotate-0 scale-110 fill-amber-400/25 stroke-[2.5]' : '-rotate-45 scale-90'}`} />
              </div>

              {/* Moon (Dark Mode) */}
              <div 
                className={`relative z-10 w-7 h-7 flex items-center justify-center rounded-xl transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-cyan-300' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Moon size={15} className={`transition-transform duration-300 ${theme === 'dark' ? 'rotate-0 scale-110 fill-cyan-400/25 stroke-[2.5]' : 'rotate-45 scale-90'}`} />
              </div>
            </div>
            
            {/* ACTIVATE SCHOLAR PACK BUTTON */}
            {onScholarPackRequest && (
              <button
                onClick={onScholarPackRequest}
                className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                  user?.is_premium
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/20 hover:scale-105 active:scale-95 border border-amber-300/30'
                }`}
                title={user?.is_premium ? "Manage / Refill Scholar Pack" : "Activate Scholar Pack"}
              >
                {user?.is_premium ? (
                  <>
                    <Zap size={12} className="fill-white" /> Scholar Pack ⚡ Active
                  </>
                ) : (
                  <>
                    <Crown size={12} className="fill-amber-200 text-amber-100" /> Activate Scholar Pack
                  </>
                )}
              </button>
            )}

            {/* INVITE & EARN */}
            {user && (
               <button onClick={onInviteEarnRequest} aria-label="Invite and Earn" className="p-2.5 rounded-xl transition-all bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer">
                 <Gift size={18} />
               </button>
            )}
            
            {user ? (
               <div className="flex items-center gap-2">
                  <button onClick={() => onNavigate('settings')} aria-label="User Settings" className="p-2.5 rounded-xl transition-all relative bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 cursor-pointer">
                     <User size={18} />
                     <div className={`absolute -top-1 -right-1 w-3 h-3 border-2 border-white dark:border-gray-950 rounded-full ${user.is_premium ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                  </button>
               </div>
            ) : (
               <div className="flex items-center gap-2">
                 <button 
                  onClick={onLoginRequest} 
                  className="px-4 py-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border border-gray-200 dark:border-gray-800"
                 >
                   Log In
                 </button>
                 <button 
                  onClick={onLoginRequest} 
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 hover:bg-gray-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer"
                 >
                   Create Account
                 </button>
               </div>
            )}
            
            <button onClick={() => onNavigate('settings')} aria-label="Settings" className="p-2.5 rounded-xl transition-all bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 cursor-pointer">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Toggle Bar with Direct Theme Switcher */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Direct Mobile Theme Switcher */}
          <button 
            onClick={() => onThemeToggle?.()} 
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-800 text-cyan-300'
                : 'bg-gray-100 border-gray-200 text-amber-500'
            }`}
          >
            {theme === 'dark' ? <Moon size={18} className="fill-cyan-400/20 stroke-[2.5]" /> : <Sun size={18} className="fill-amber-400/20 stroke-[2.5]" />}
          </button>

          {isAuthorizedAdmin && (
             <button onClick={() => onNavigate('admin')} className="p-2 bg-red-600 text-white rounded-xl cursor-pointer">
               <ShieldAlert size={18} />
             </button>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className={`p-2 rounded-xl transition-all cursor-pointer ${isScrolled ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900' : (theme === 'dark' ? 'text-white bg-white/10' : 'text-gray-900 bg-gray-100')}`}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} 
            className="lg:hidden fixed inset-0 z-[150] bg-white dark:bg-gray-950 flex flex-col p-6 overflow-y-auto"
          >
            <div className="mt-4 flex justify-between items-center px-2">
               <div className="flex flex-col">
                 <span className="text-xl font-black tracking-tighter text-gray-950 dark:text-white flex items-center gap-1">
                   Campus<span className="text-cyan-500 dark:text-cyan-400">AI</span>.ng
                 </span>
                 {user?.is_premium && (
                   <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">Scholar Pack ⚡ Active</span>
                 )}
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-800 dark:text-white rounded-xl bg-gray-100 dark:bg-gray-900 cursor-pointer">
                 <X size={20} />
               </button>
            </div>

            {/* Mobile Drawer Theme Selector Card */}
            <div className="mt-6 p-4 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-500'}`}>
                  {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div>
                  <span className="text-xs font-black text-gray-900 dark:text-white block uppercase tracking-wider">Appearance</span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-300">{theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => { if (theme !== 'light') onThemeToggle?.(); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-amber-500 text-black shadow-xs'
                      : 'text-gray-400 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  <Sun size={12} /> Light
                </button>
                <button
                  type="button"
                  onClick={() => { if (theme !== 'dark') onThemeToggle?.(); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-cyan-500 text-black shadow-xs'
                      : 'text-gray-400 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  <Moon size={12} /> Dark
                </button>
              </div>
            </div>

            {/* Mobile Drawer Activate Scholar Pack Banner */}
            {onScholarPackRequest && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onScholarPackRequest();
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-between font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer ${
                    user?.is_premium
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {user?.is_premium ? <Zap size={16} className="fill-white" /> : <Crown size={16} className="fill-amber-200 text-amber-100" />}
                    <span>{user?.is_premium ? "Scholar Pack Active" : "Activate Scholar Pack"}</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-1 rounded-lg">⚡ 2026 Access</span>
                </button>
              </div>
            )}
            
            <div className="mt-8 px-2">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-gray-900 border-none rounded-[20px] text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Loader2 size={18} className="animate-spin text-blue-500" />
                  </div>
                )}
              </form>
              
              <AnimatePresence>
                {showSearchResults && (searchQuery.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 bg-gray-100 dark:bg-gray-900 rounded-[20px] overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Mobile Results</span>
                      <button onClick={() => setShowSearchResults(false)}><X size={14} className="text-gray-400" /></button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                      {searchResults.length > 0 ? (
                        searchResults.map((result) => (
                          <a key={result.url} href={result.url} className="block p-4 border-b border-gray-200 dark:border-gray-800 last:border-0">
                            <h5 className="text-xs font-black dark:text-white mb-1 line-clamp-1">{result.title}</h5>
                            <p className="text-[10px] text-gray-500 line-clamp-1">{result.content}</p>
                          </a>
                        ))
                      ) : !isSearching && (
                        <div className="p-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">No results</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 flex flex-col gap-2">
               {isAuthorizedAdmin && (
                 <button 
                   onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
                   className="mb-4 w-full p-5 bg-red-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                 >
                   <ShieldAlert size={20} /> Access Architect Console
                 </button>
               )}
                {!user && (
                  <div className="mb-4 flex gap-2">
                    <button 
                      onClick={() => { onLoginRequest(); setIsMobileMenuOpen(false); }}
                      className="flex-1 p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-[20px] font-black text-xs uppercase tracking-widest border border-gray-200 dark:border-gray-800 cursor-pointer"
                    >
                      Log In
                    </button>
                    <button 
                      onClick={() => { onLoginRequest(); setIsMobileMenuOpen(false); }}
                      className="flex-1 p-4 bg-blue-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                )}
               
               {navItems.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }} 
                    className={`p-5 text-left font-black text-sm border-b border-gray-50 dark:border-gray-900 flex items-center gap-4 ${
                      currentPage === item.id ? 'text-blue-600' : 'dark:text-white text-gray-700'
                    }`}
                  >
                    {item.icon} {item.name}
                  </button>
               ))}
               
               <button 
                 onClick={() => { onNavigate('settings'); setIsMobileMenuOpen(false); }} 
                 className="p-5 text-left font-black text-sm border-b border-gray-50 dark:border-gray-900 flex items-center gap-4 dark:text-white text-gray-700"
               >
                 <Settings size={20} /> Profile & Settings
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
