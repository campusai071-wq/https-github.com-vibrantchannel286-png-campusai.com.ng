
import React, { useState, useEffect } from 'react';
import { Home, School, Building2, Brain, Newspaper, Info, Settings, Menu, X, ShieldCheck, LogIn, ChevronDown, Share2, Moon, Sun, User, ShieldAlert, Zap, Gift, Search, Loader2, HardDrive } from 'lucide-react';
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
  onOpenWorkspace: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, user, admin, onLoginRequest, onShareRequest, onInviteEarnRequest, onOpenWorkspace, theme, onThemeToggle }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [asuuStatus, setAsuuStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    getAsuuStrikeStatus().then(status => setAsuuStatus(status?.status || 'Stable'));
    return () => window.removeEventListener('scroll', handleScroll);
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
    { name: 'Calculator', icon: <Zap size={18} />, id: 'calculator' },
    { name: 'Result Slip', icon: <ShieldCheck size={18} />, id: 'result-slip' },
    { name: 'Latest News', icon: <Newspaper size={18} />, id: 'jamb' },
    { name: 'About', icon: <Info size={18} />, id: 'about' },
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
    <nav className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-500 ease-in-out ${
      isScrolled 
        ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm py-3' 
        : 'bg-gray-950 py-6 text-white'
    }`}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <div className="flex flex-col items-start cursor-pointer group" onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}>
          <span className={`text-xl md:text-2xl font-black tracking-tighter transition-colors ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
            Campus<span className="text-cyan-400">AI</span><span className="opacity-70 font-bold">.ng</span>
          </span>
          <div className="flex flex-wrap items-center mt-0.5 gap-2">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className={`text-[7px] font-black uppercase tracking-widest ${isScrolled ? 'text-gray-400' : 'text-white/50'}`}>
                {asuuStatus || 'Active Session'}
              </span>
            </div>
            <span className={`text-[7px] font-black uppercase tracking-widest opacity-40 ${isScrolled ? 'text-gray-400' : 'text-white/50'}`}>•</span>
            <span className={`text-[7px] font-black uppercase tracking-widest ${isScrolled ? 'text-blue-600 dark:text-cyan-400' : 'text-cyan-300'}`}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-[200px] xl:max-w-md mx-4 xl:mx-8 relative">
          <form onSubmit={handleSearch} className="w-full relative group">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${isScrolled ? 'text-gray-400 group-focus-within:text-blue-500' : 'text-white/40 group-focus-within:text-cyan-400'}`}>
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-8 py-1.5 text-[10px] font-bold rounded-xl border transition-all outline-none ${
                isScrolled 
                  ? 'bg-gray-100 dark:bg-gray-900 border-transparent focus:border-blue-500 text-gray-900 dark:text-white' 
                  : 'bg-white/10 border-white/10 focus:border-cyan-400 text-white placeholder:text-white/30'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={12} className={isScrolled ? 'text-gray-400' : 'text-white/40'} />
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
                    <button onClick={() => setShowSearchResults(false)} className="text-gray-400 hover:text-red-500 transition-colors">
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
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{result.content}</p>
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
              className={`flex items-center space-x-2 font-black text-[10px] uppercase tracking-widest hover:text-cyan-400 transition-all ${
                currentPage === item.id 
                  ? 'text-cyan-500' 
                  : (isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white/90 hover:text-white')
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
                 className={`p-2.5 rounded-xl transition-all bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse`}
                 title="Open Architect Console"
                 aria-label="Open Architect Console"
               >
                 <ShieldAlert size={18} />
               </button>
            )}

            {/* Google Workspace Hub Button */}
            <button 
              onClick={onOpenWorkspace} 
              aria-label="Google Workspace Hub" 
              className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 ${isScrolled ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-cyan-400' : 'bg-blue-600/20 text-cyan-300 border border-blue-500/30'}`}
              title="Google Workspace Hub (Drive, Gmail, Sheets)"
            >
              <HardDrive size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest hidden xl:inline">Workspace</span>
            </button>

            <button onClick={onThemeToggle} aria-label="Toggle theme" className={`p-2.5 rounded-xl transition-all ${isScrolled ? 'bg-gray-100 text-gray-600 dark:bg-gray-900' : 'bg-white/10 text-white'}`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {/* INVITE & EARN */}
            {user && (
               <button onClick={onInviteEarnRequest} aria-label="Invite and Earn" className={`p-2.5 rounded-xl transition-all ${isScrolled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'}`}>
                 <Gift size={18} />
               </button>
            )}
            
            {user ? (
               <div className="flex items-center gap-2">
                  {user.is_premium && (
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                      <Zap size={10} className="fill-white" /> Scholar Pack ⚡ Active
                    </div>
                  )}
                  <button onClick={() => onNavigate('settings')} aria-label="User Settings" className={`p-2.5 rounded-xl transition-all relative ${isScrolled ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white/10 text-white'}`}>
                     <User size={18} />
                     <div className={`absolute -top-1 -right-1 w-3 h-3 border-2 border-white dark:border-gray-950 rounded-full ${user.is_premium ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                  </button>
               </div>
            ) : (
               <button 
                onClick={onLoginRequest} 
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
               >
                 <LogIn size={14} /> Sign In
               </button>
            )}
            
            <button onClick={() => onNavigate('settings')} aria-label="Settings" className={`p-2.5 rounded-xl transition-all ${isScrolled ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white/10 text-white'}`}>
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          {isAuthorizedAdmin && (
             <button onClick={() => onNavigate('admin')} className="p-2 bg-red-600 text-white rounded-lg">
               <ShieldAlert size={18} />
             </button>
          )}
          <button 
            onClick={onOpenWorkspace} 
            className="p-2 bg-blue-600 text-white rounded-lg"
            title="Google Workspace"
          >
            <HardDrive size={18} />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className={`p-2 rounded-lg ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
            <div className="mt-6 flex justify-between items-center px-2">
               <div className="flex flex-col">
                 <span className="text-xl font-black tracking-tighter dark:text-white">Campus<span className="text-cyan-400">AI</span></span>
                 {user?.is_premium && (
                   <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">Scholar Pack ⚡ Active</span>
                 )}
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 dark:text-white"><X size={24} /></button>
            </div>
            
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
                 <button 
                   onClick={() => { onLoginRequest(); setIsMobileMenuOpen(false); }}
                   className="mb-4 w-full p-5 bg-blue-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                 >
                   <LogIn size={20} /> Sign In to CampusAI
                 </button>
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
