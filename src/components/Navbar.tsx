
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, School, Building2, Brain, Newspaper, Info, Settings, Menu, X, ShieldCheck, LogIn, ChevronDown, Share2, Moon, Sun, User, ShieldAlert, Zap, Gift, Search, Loader2, FileCheck, BookOpen, GraduationCap, Calculator, Landmark, Crown, BarChart3, Activity, UserPlus, Sparkles, MapPin, ExternalLink, Globe, ArrowRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAsuuStrikeStatus } from '../services/geminiService';
import { searchUnified, searchInternalCampusAI, SearchResultItem } from '../services/searchService';
import { AdminState } from '../types';
import { auth } from '../services/firebaseConfig';
import { updateUserProfile } from '../services/userService';
import TopHeaderBanner from './TopHeaderBanner';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  user: any;
  admin?: AdminState;
  showImportantBanner?: boolean;
  onLoginRequest: () => void;
  onSignUpRequest?: () => void;
  onShareRequest: () => void;
  onInviteEarnRequest: () => void;
  onScholarPackRequest?: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  onOpenSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, user, admin, showImportantBanner = true, onLoginRequest, onSignUpRequest, onShareRequest, onInviteEarnRequest, onScholarPackRequest, theme, onThemeToggle, onOpenSidebar }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [asuuStatus, setAsuuStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'all' | 'tools' | 'universities' | 'news' | 'web'>('all');
  const [isSyncingNews, setIsSyncingNews] = useState(false);
  const [isMoreToolsOpen, setIsMoreToolsOpen] = useState(false);
  const debounceTimerRef = useRef<any>(null);

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
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const triggerUnifiedSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const unified = await searchUnified(q);
      if (unified && unified.length > 0) {
        setSearchResults(unified);
      }
    } catch (err) {
      console.error("Unified search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      return;
    }

    // 1. Instant local results (0ms delay!)
    const instant = searchInternalCampusAI(val);
    setSearchResults(instant);
    setShowSearchResults(true);

    // 2. Debounce cloud/web search
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerUnifiedSearch(val);
    }, 450);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setShowSearchResults(true);
    triggerUnifiedSearch(searchQuery);
  };

  const handleSelectResult = (result: SearchResultItem) => {
    setShowSearchResults(false);
    setSearchQuery('');
    setIsMobileMenuOpen(false);

    if (result.isLocal || result.url.startsWith('/') || !result.url.startsWith('http')) {
      if (result.url.startsWith('/')) {
        navigate(result.url);
      } else {
        onNavigate(result.url);
      }
      window.scrollTo(0, 0);
    } else {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getBadgeStyle = (type?: string) => {
    switch (type) {
      case 'internal-calculator':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'internal-tool':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'internal-resource':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'internal-news':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'web':
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
    }
  };

  const getResultIcon = (type?: string, badge?: string) => {
    if (type === 'internal-calculator') return <Calculator size={13} className="text-amber-500" />;
    if (type === 'internal-news') return <Newspaper size={13} className="text-rose-500" />;
    if (type === 'web') return <Globe size={13} className="text-slate-400" />;
    if (badge?.includes('Exam') || badge?.includes('CBT')) return <Activity size={13} className="text-emerald-500" />;
    if (badge?.includes('Syllabus')) return <BookOpen size={13} className="text-indigo-500" />;
    if (badge?.includes('Institution') || badge?.includes('University')) return <Landmark size={13} className="text-purple-500" />;
    if (badge?.includes('Course') || badge?.includes('Degree')) return <GraduationCap size={13} className="text-teal-500" />;
    return <Zap size={13} className="text-blue-500" />;
  };

  const internalResults = searchResults.filter(r => r.isInternal && r.type !== 'internal-news');
  const newsResults = searchResults.filter(r => r.isInternal && r.type === 'internal-news');
  const webResults = searchResults.filter(r => !r.isInternal);

  const toolsCount = internalResults.filter(r => r.type === 'internal-tool' || r.type === 'internal-calculator').length;
  const uniCount = internalResults.filter(r => r.badge?.includes('Institution') || r.badge?.includes('University') || r.badge?.includes('Calculator') || r.badge?.includes('School') || r.url.includes('universities') || r.url.includes('calculator')).length;
  const newsCount = newsResults.length;
  const webCount = webResults.length;

  const filteredResults = searchResults.filter(r => {
    if (searchFilter === 'all') return true;
    if (searchFilter === 'tools') return r.type === 'internal-tool' || r.type === 'internal-calculator';
    if (searchFilter === 'universities') return r.badge?.includes('Institution') || r.badge?.includes('University') || r.badge?.includes('Calculator') || r.badge?.includes('School') || r.url.includes('universities') || r.url.includes('calculator');
    if (searchFilter === 'news') return r.type === 'internal-news';
    if (searchFilter === 'web') return r.type === 'web';
    return true;
  });

  const renderResultItem = (result: SearchResultItem, idx: number, isCompact = false) => (
    <button
      key={`${result.id || result.url}-${idx}`}
      type="button"
      onClick={() => handleSelectResult(result)}
      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors flex items-start gap-2.5 group cursor-pointer focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800"
      aria-label={`${result.title} - ${result.badge || (result.isInternal ? 'CampusAI' : 'Web result')}`}
    >
      <div className="mt-0.5 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800/80 shrink-0 group-hover:scale-105 transition-transform">
        {getResultIcon(result.type, result.badge)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${getBadgeStyle(result.type)}`}>
            {result.badge || (result.isInternal ? 'CampusAI' : 'Web Intel')}
          </span>
          {result.isInternal ? (
            <span className="text-[8px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
              Internal
            </span>
          ) : (
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
              External Web
            </span>
          )}
        </div>
        <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {result.title}
        </h4>
        {result.subtitle && !isCompact && (
          <p className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 line-clamp-1 mt-0.5">
            {result.subtitle}
          </p>
        )}
        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mt-0.5">
          {result.content}
        </p>
      </div>
      <div className="shrink-0 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 mt-1">
        {result.isInternal || result.url.startsWith('/') ? (
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        ) : (
          <ExternalLink size={12} className="text-gray-400" />
        )}
      </div>
    </button>
  );

  const navItems = [
    { name: 'Home', icon: <Home size={16} />, id: 'home' },
    { name: 'Admissions', icon: <GraduationCap size={16} />, id: 'admissions' },
    { name: 'Calculator', icon: <Zap size={16} />, id: 'calculator' },
    { name: 'Chat Advisor', icon: <Brain size={16} />, id: 'chat' },
    { name: 'CBT Simulator', icon: <Activity size={16} />, id: 'cbt-simulator' },
    { name: 'Portals', icon: <Landmark size={16} />, id: 'universities' },
    { name: 'Latest News', icon: <Newspaper size={16} />, id: 'news' },
  ];

  const moreNavItems = [
    { name: 'Advertise With Us', icon: <Sparkles size={16} />, id: 'advertise' },
    { name: 'Partner Network', icon: <ShieldCheck size={16} />, id: 'partners' },
    { name: 'Chat Advisor', icon: <Brain size={16} />, id: 'chat' },
    { name: 'Contact Us', icon: <MessageSquare size={16} />, id: 'contact' },
    { name: 'CBT Center Locator', icon: <MapPin size={16} />, id: 'cbt-locator' },
    { name: 'CAPS Portal', icon: <BarChart3 size={16} />, id: 'jamb-caps' },
    { name: 'CGPA Studio', icon: <Calculator size={16} />, id: 'cgpa-calculator' },
    { name: 'Syllabus', icon: <BookOpen size={16} />, id: 'syllabus' },
    { name: 'Result Slip', icon: <ShieldCheck size={16} />, id: 'result-slip' },
    { name: 'Checklist', icon: <FileCheck size={16} />, id: 'checklist' },
    { name: 'Latest News', icon: <Newspaper size={16} />, id: 'news' },
  ];

  const allNavItems = [
    { name: 'Home', icon: <Home size={18} />, id: 'home' },
    { name: 'Advertise With Us', icon: <Sparkles size={18} />, id: 'advertise' },
    { name: 'Partner Network', icon: <ShieldCheck size={18} />, id: 'partners' },
    { name: 'Chat Advisor', icon: <Brain size={18} />, id: 'chat' },
    { name: 'Admissions', icon: <GraduationCap size={18} />, id: 'admissions' },
    { name: 'Calculator', icon: <Zap size={18} />, id: 'calculator' },
    { name: 'Portals', icon: <Landmark size={18} />, id: 'universities' },
    { name: 'Contact Us', icon: <MessageSquare size={18} />, id: 'contact' },
    { name: 'CBT Locator', icon: <MapPin size={18} />, id: 'cbt-locator' },
    { name: 'CAPS Portal', icon: <BarChart3 size={18} />, id: 'jamb-caps' },
    { name: 'Syllabus', icon: <BookOpen size={18} />, id: 'syllabus' },
    { name: 'CBT Simulator', icon: <Activity size={18} />, id: 'cbt-simulator' },
    { name: 'CGPA Studio', icon: <Calculator size={18} />, id: 'cgpa-calculator' },
    { name: 'Result Slip', icon: <ShieldCheck size={18} />, id: 'result-slip' },
    { name: 'Checklist', icon: <FileCheck size={18} />, id: 'checklist' },
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
        ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm' 
        : 'bg-white/95 dark:bg-gray-950/95 border-b border-gray-200/80 dark:border-gray-800 backdrop-blur-md'
    }`}>
      {/* Top Banner: Sponsored Campaign or Pinned Announcement Ribbon */}
      <TopHeaderBanner showImportantBanner={showImportantBanner} onNavigate={onNavigate} />

      <div className={`container mx-auto px-3 sm:px-4 md:px-6 flex justify-between items-center gap-2 ${
        isScrolled ? 'py-2.5' : 'py-3'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="p-2 sm:p-2.5 rounded-xl transition-all bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 cursor-pointer"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>
          )}

          <div className="flex flex-col items-start cursor-pointer group" onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}>
            <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter flex items-center gap-0.5 text-gray-950 dark:text-white transition-colors">
              Campus
              <span className="inline-flex items-center justify-center mx-0.5 text-cyan-500 dark:text-cyan-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Brain size={20} className="fill-cyan-500/20 text-cyan-500 dark:text-cyan-400 stroke-[2.5]" />
              </span>
              AI<span className="text-cyan-600 dark:text-cyan-400 font-extrabold">.ng</span>
            </span>
            <div className="flex flex-wrap items-center mt-0.5 gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[7px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300">
                  {asuuStatus || 'Active Session'}
                </span>
              </div>
              <span className="text-[7px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">•</span>
              <span className="text-[7px] font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-300 font-bold hidden sm:inline">
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
                className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-600 dark:text-cyan-400 text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_12px_rgba(34,211,238,0.15)] animate-pulse ml-1"
              >
                <Loader2 size={11} className="animate-spin text-cyan-500 dark:text-cyan-400" />
                <span>Syncing...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden xl:flex flex-1 max-w-[210px] 2xl:max-w-xs mx-2 relative shrink">
          <form onSubmit={handleSearch} className="w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors">
              <Search size={13} />
            </div>
            <input
              type="text"
              placeholder="Search tools, cutoffs, syllabus..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => { if (searchQuery.trim().length > 0) setShowSearchResults(true); }}
              onKeyDown={(e) => { if (e.key === 'Escape') setShowSearchResults(false); }}
              className="w-full pl-8 pr-7 py-1.5 text-[11px] font-semibold rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 focus:border-cyan-500 dark:focus:border-cyan-400 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all outline-none"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                  title="Clear"
                >
                  <X size={11} className="text-gray-400 dark:text-gray-500" />
                </button>
              )}
              {isSearching && <Loader2 size={11} className="animate-spin text-cyan-500" />}
            </div>
          </form>

          {/* Unified Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (searchQuery.length > 0) && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowSearchResults(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 w-[440px] 2xl:w-[500px] max-w-[calc(100vw-2rem)] mt-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-[120]"
                >
                  {/* Header & Filter Tabs */}
                  <div className="p-3 border-b border-gray-100 dark:border-gray-900 bg-gray-50/70 dark:bg-gray-900/50">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          CampusAI Search
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                          {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setShowSearchResults(false)} 
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md cursor-pointer"
                        title="Close (Esc)"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Quick Filter Chips */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                      <button
                        type="button"
                        onClick={() => setSearchFilter('all')}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                          searchFilter === 'all'
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        All ({searchResults.length})
                      </button>
                      {toolsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter('tools')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                            searchFilter === 'tools'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                          }`}
                        >
                          Tools ({toolsCount})
                        </button>
                      )}
                      {uniCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter('universities')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                            searchFilter === 'universities'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                          }`}
                        >
                          Schools ({uniCount})
                        </button>
                      )}
                      {newsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter('news')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                            searchFilter === 'news'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          }`}
                        >
                          News ({newsCount})
                        </button>
                      )}
                      {webCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter('web')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                            searchFilter === 'web'
                              ? 'bg-slate-700 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          Web ({webCount})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Results List */}
                  <div className="max-h-[380px] overflow-y-auto no-scrollbar divide-y divide-gray-100 dark:divide-gray-900">
                    {searchResults.length > 0 ? (
                      searchFilter === 'all' ? (
                        <>
                          {/* 1. Internal CampusAI Results (Tools, Calculators, Portals, Syllabuses) */}
                          {internalResults.length > 0 && (
                            <div>
                              <div className="px-3 py-1.5 bg-gray-50/90 dark:bg-gray-900/90 text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center justify-between border-y border-gray-100 dark:border-gray-800">
                                <span className="flex items-center gap-1.5">
                                  <Zap size={11} className="text-teal-500" /> CampusAI Results
                                </span>
                                <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
                                  Internal ({internalResults.length})
                                </span>
                              </div>
                              <div className="divide-y divide-gray-100 dark:divide-gray-900">
                                {internalResults.map((r, idx) => renderResultItem(r, idx))}
                              </div>
                            </div>
                          )}

                          {/* 2. Verified CampusAI News */}
                          {newsResults.length > 0 && (
                            <div>
                              <div className="px-3 py-1.5 bg-gray-50/90 dark:bg-gray-900/90 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center justify-between border-y border-gray-100 dark:border-gray-800">
                                <span className="flex items-center gap-1.5">
                                  <Newspaper size={11} className="text-rose-500" /> CampusAI News
                                </span>
                                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                                  Verified ({newsResults.length})
                                </span>
                              </div>
                              <div className="divide-y divide-gray-100 dark:divide-gray-900">
                                {newsResults.map((r, idx) => renderResultItem(r, idx))}
                              </div>
                            </div>
                          )}

                          {/* 3. External Web Results */}
                          {webResults.length > 0 && (
                            <div>
                              {internalResults.length === 0 && newsResults.length === 0 && (
                                <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
                                  <Info size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                                  <span>No matching CampusAI resources found. Try these web results:</span>
                                </div>
                              )}
                              <div className="px-3 py-1.5 bg-gray-50/90 dark:bg-gray-900/90 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between border-y border-gray-100 dark:border-gray-800">
                                <span className="flex items-center gap-1.5">
                                  <Globe size={11} className="text-slate-400" /> Web Results
                                </span>
                                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Globe size={9} /> Wider Web ({webResults.length})
                                </span>
                              </div>
                              <div className="divide-y divide-gray-100 dark:divide-gray-900">
                                {webResults.map((r, idx) => renderResultItem(r, idx))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        filteredResults.length > 0 ? (
                          filteredResults.map((result, idx) => renderResultItem(result, idx))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">No results found in this category</p>
                            <button
                              type="button"
                              onClick={() => setSearchFilter('all')}
                              className="mt-2 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                            >
                              Show all results ({searchResults.length})
                            </button>
                          </div>
                        )
                      )
                    ) : isSearching ? (
                      <div className="p-8 flex flex-col items-center justify-center gap-3">
                        <Loader2 size={24} className="animate-spin text-cyan-500" />
                        <p className="text-[11px] font-bold text-gray-400">Searching CampusAI knowledge base & live updates...</p>
                      </div>
                    ) : (
                      <div className="p-6 text-center space-y-3">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">No results found for "{searchQuery}"</p>
                        <p className="text-[10px] text-gray-400">Try searching for these verified CampusAI resources:</p>
                        <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                          {['UNILAG calculator', 'JAMB CAPS', 'CBT practice', 'UTME syllabus', 'Admission checklist', 'Computer Science'].map((suggestedQuery) => (
                            <button
                              key={suggestedQuery}
                              type="button"
                              onClick={() => handleSearchChange(suggestedQuery)}
                              className="text-[10px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer font-medium"
                            >
                              {suggestedQuery}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer status */}
                  <div className="p-2 px-3 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-900 flex justify-between items-center text-[10px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      {isSearching ? (
                        <>
                          <Loader2 size={10} className="animate-spin text-cyan-500" />
                          <span>Checking cloud updates...</span>
                        </>
                      ) : (
                        <span>⚡ CampusAI Unified Search</span>
                      )}
                    </div>
                    <span className="hidden sm:inline">Press Enter to force web search</span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Primary Menu */}
        <div className="hidden lg:flex items-center space-x-3 xl:space-x-5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center space-x-1.5 font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                currentPage === item.id 
                  ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' 
                  : 'text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}

          {/* More Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMoreToolsOpen(!isMoreToolsOpen)}
              className={`flex items-center space-x-1 font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                moreNavItems.some(i => i.id === currentPage)
                  ? 'text-cyan-600 dark:text-cyan-400 font-extrabold'
                  : 'text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400'
              }`}
            >
              <span>More</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${isMoreToolsOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isMoreToolsOpen && (
                <>
                  <div className="fixed inset-0 z-[105]" onClick={() => setIsMoreToolsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 z-[110] space-y-1"
                  >
                    {moreNavItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setIsMoreToolsOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                          currentPage === item.id
                            ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-extrabold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="text-cyan-500">{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
          
        {/* Right Controls Container */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* ADMIN ONLY ACCESS */}
            {isAuthorizedAdmin && (
               <button 
                 onClick={() => onNavigate('admin')} 
                 className="p-2 sm:p-2.5 rounded-xl transition-all bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse cursor-pointer"
                 title="Open Architect Console"
                 aria-label="Open Architect Console"
               >
                 <ShieldAlert size={16} />
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
              className="relative flex items-center p-0.5 sm:p-1 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-inner hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer select-none shrink-0"
            >
              {/* Animated active backdrop slider */}
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`absolute top-0.5 sm:top-1 bottom-0.5 sm:bottom-1 w-6 sm:w-7 rounded-xl shadow-xs ${
                  theme === 'dark'
                    ? 'left-[calc(100%-28px)] sm:left-[calc(100%-32px)] bg-gray-800 border border-cyan-500/30 shadow-cyan-500/10'
                    : 'left-0.5 sm:left-1 bg-white border border-amber-400/30 shadow-amber-500/10'
                }`}
              />

              {/* Sun (Light Mode) */}
              <div 
                className={`relative z-10 w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded-xl transition-colors duration-200 ${
                  theme === 'light' 
                    ? 'text-amber-500' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Sun size={13} className={`transition-transform duration-300 ${theme === 'light' ? 'rotate-0 scale-110 fill-amber-400/25 stroke-[2.5]' : '-rotate-45 scale-90'}`} />
              </div>

              {/* Moon (Dark Mode) */}
              <div 
                className={`relative z-10 w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded-xl transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-cyan-300' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Moon size={13} className={`transition-transform duration-300 ${theme === 'dark' ? 'rotate-0 scale-110 fill-cyan-400/25 stroke-[2.5]' : 'rotate-45 scale-90'}`} />
              </div>
            </div>
            
            {/* ACTIVATE SCHOLAR PACK BUTTON */}
            {onScholarPackRequest && (
              <button
                onClick={onScholarPackRequest}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0 ${
                  user?.is_premium
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/20 hover:scale-105 active:scale-95 border border-amber-300/30'
                }`}
                title={user?.is_premium ? "Manage / Refill Scholar Pack" : "Activate Scholar Pack"}
              >
                {user?.is_premium ? (
                  <>
                    <Zap size={12} className="fill-white" /> <span className="hidden xl:inline">Scholar Pack</span> Active
                  </>
                ) : (
                  <>
                    <Crown size={12} className="fill-amber-200 text-amber-100" /> <span className="hidden xl:inline">Scholar</span> Pack
                  </>
                )}
              </button>
            )}

            {/* INVITE & EARN */}
            {user && (
               <button onClick={onInviteEarnRequest} aria-label="Invite and Earn" className="p-2 sm:p-2.5 rounded-xl transition-all bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer shrink-0">
                 <Gift size={16} />
               </button>
            )}
            
            {user ? (
               <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => onNavigate('settings')} aria-label="User Settings" className="p-2 sm:p-2.5 rounded-xl transition-all relative bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 cursor-pointer">
                     <User size={16} />
                     <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-2 border-white dark:border-gray-950 rounded-full ${user.is_premium ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                  </button>
               </div>
            ) : (
               <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                 <button 
                  onClick={onLoginRequest} 
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer border border-gray-200 dark:border-gray-800 flex items-center gap-1 shrink-0"
                 >
                   <LogIn size={13} className="text-gray-500 dark:text-gray-400" />
                   <span>Sign In</span>
                 </button>
                 <button 
                  onClick={onSignUpRequest || onLoginRequest} 
                  className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wider shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer border border-blue-400/20 shrink-0"
                 >
                   <UserPlus size={13} className="text-cyan-200" />
                   <span>Sign Up</span>
                 </button>
               </div>
            )}
            
            <button onClick={() => onNavigate('settings')} aria-label="Settings" className="hidden sm:flex p-2 sm:p-2.5 rounded-xl transition-all bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 cursor-pointer shrink-0">
              <Settings size={16} />
            </button>

            {/* Mobile Toggle Button */}
            <div className="lg:hidden flex items-center gap-1">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className={`p-2 rounded-xl transition-all cursor-pointer ${isScrolled ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900' : (theme === 'dark' ? 'text-white bg-white/10' : 'text-gray-900 bg-gray-100')}`}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
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
            
            <div className="mt-6 px-1">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search tools, cutoffs, syllabus..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500 transition-all dark:text-white"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                    >
                      <X size={13} className="text-gray-400" />
                    </button>
                  )}
                  {isSearching && <Loader2 size={14} className="animate-spin text-cyan-500" />}
                </div>
              </form>
              
              <AnimatePresence>
                {showSearchResults && (searchQuery.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-lg"
                  >
                    <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/60 dark:bg-gray-800/40">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Search Results</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                          {searchResults.length}
                        </span>
                      </div>
                      <button onClick={() => setShowSearchResults(false)} className="text-gray-400 hover:text-red-500 p-1">
                        <X size={13} />
                      </button>
                    </div>

                    {/* Quick filter pills on mobile */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-2 border-b border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => setSearchFilter('all')}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all ${
                          searchFilter === 'all'
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                        }`}
                      >
                        All ({searchResults.length})
                      </button>
                      {toolsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter('tools')}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all ${
                            searchFilter === 'tools' ? 'bg-blue-600 text-white' : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          Tools ({toolsCount})
                        </button>
                      )}
                      {uniCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter('universities')}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all ${
                            searchFilter === 'universities' ? 'bg-purple-600 text-white' : 'text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          Schools ({uniCount})
                        </button>
                      )}
                      {newsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter('news')}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all ${
                            searchFilter === 'news' ? 'bg-rose-600 text-white' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          News ({newsCount})
                        </button>
                      )}
                      {webCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter('web')}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all ${
                            searchFilter === 'web' ? 'bg-slate-700 text-white' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Web ({webCount})
                        </button>
                      )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto no-scrollbar divide-y divide-gray-100 dark:divide-gray-800">
                      {searchResults.length > 0 ? (
                        searchFilter === 'all' ? (
                          <>
                            {internalResults.length > 0 && (
                              <div>
                                <div className="px-3 py-1 bg-gray-50/90 dark:bg-gray-800/90 text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between border-y border-gray-100 dark:border-gray-800">
                                  <span className="flex items-center gap-1"><Zap size={10} className="text-teal-500" /> CampusAI Results</span>
                                  <span className="text-[8px] font-bold text-teal-600 dark:text-teal-400">Internal ({internalResults.length})</span>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                  {internalResults.map((r, idx) => renderResultItem(r, idx, true))}
                                </div>
                              </div>
                            )}

                            {newsResults.length > 0 && (
                              <div>
                                <div className="px-3 py-1 bg-gray-50/90 dark:bg-gray-800/90 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center justify-between border-y border-gray-100 dark:border-gray-800">
                                  <span className="flex items-center gap-1"><Newspaper size={10} className="text-rose-500" /> CampusAI News</span>
                                  <span className="text-[8px] font-bold">Verified ({newsResults.length})</span>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                  {newsResults.map((r, idx) => renderResultItem(r, idx, true))}
                                </div>
                              </div>
                            )}

                            {webResults.length > 0 && (
                              <div>
                                {internalResults.length === 0 && newsResults.length === 0 && (
                                  <div className="p-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5">
                                    <Info size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
                                    <span>No CampusAI resources found. Showing web results:</span>
                                  </div>
                                )}
                                <div className="px-3 py-1 bg-gray-50/90 dark:bg-gray-800/90 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between border-y border-gray-100 dark:border-gray-800">
                                  <span className="flex items-center gap-1"><Globe size={10} className="text-slate-400" /> Web Results</span>
                                  <span className="text-[8px] font-bold">Wider Web ({webResults.length})</span>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                  {webResults.map((r, idx) => renderResultItem(r, idx, true))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          filteredResults.length > 0 ? (
                            filteredResults.map((result, idx) => renderResultItem(result, idx, true))
                          ) : (
                            <div className="p-6 text-center text-xs text-gray-500">
                              No results in this category.
                            </div>
                          )
                        )
                      ) : isSearching ? (
                        <div className="p-6 flex flex-col items-center justify-center gap-2">
                          <Loader2 size={18} className="animate-spin text-cyan-500" />
                          <span className="text-[10px] font-bold text-gray-400">Searching CampusAI...</span>
                        </div>
                      ) : (
                        <div className="p-5 text-center space-y-2">
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">No results found for "{searchQuery}"</p>
                          <p className="text-[10px] text-gray-400">Try searching:</p>
                          <div className="flex flex-wrap gap-1 justify-center pt-1">
                            {['UNILAG calculator', 'JAMB CAPS', 'CBT practice', 'UTME syllabus', 'Admission checklist'].map((sq) => (
                              <button
                                key={sq}
                                type="button"
                                onClick={() => handleSearchChange(sq)}
                                className="text-[9px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                              >
                                {sq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-col gap-2">
               {isAuthorizedAdmin && (
                 <button 
                   onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
                   className="mb-3 w-full p-4 bg-red-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
                 >
                   <ShieldAlert size={18} /> Access Architect Console
                 </button>
               )}
                {!user && (
                  <div className="mb-3 flex gap-2">
                    <button 
                      onClick={() => { onLoginRequest(); setIsMobileMenuOpen(false); }}
                      className="flex-1 p-3.5 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-[18px] font-black text-xs uppercase tracking-wider border border-gray-200 dark:border-gray-800 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogIn size={15} /> Sign In
                    </button>
                    <button 
                      onClick={() => { (onSignUpRequest || onLoginRequest)(); setIsMobileMenuOpen(false); }}
                      className="flex-1 p-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-[18px] font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-500/25 cursor-pointer border border-blue-400/20 flex items-center justify-center gap-1.5"
                    >
                      <UserPlus size={15} /> Sign Up Free
                    </button>
                  </div>
                )}
               
               {allNavItems.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }} 
                    className={`p-4 text-left font-black text-sm border-b border-gray-100 dark:border-gray-900 flex items-center gap-3.5 ${
                      currentPage === item.id ? 'text-blue-600 dark:text-cyan-400' : 'dark:text-white text-gray-700'
                    }`}
                  >
                    {item.icon} {item.name}
                  </button>
               ))}
               
               <button 
                 onClick={() => { onNavigate('settings'); setIsMobileMenuOpen(false); }} 
                 className="p-4 text-left font-black text-sm border-b border-gray-100 dark:border-gray-900 flex items-center gap-3.5 dark:text-white text-gray-700"
               >
                 <Settings size={18} /> Profile & Settings
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
