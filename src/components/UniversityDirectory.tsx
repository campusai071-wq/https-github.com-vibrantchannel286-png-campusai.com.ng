import React, { useState, useMemo, useEffect } from 'react';
import { Search, ExternalLink, School, Building2, Landmark, X, Filter, Sparkles, Command, Info, History, MapPin, Award, Loader2, BookOpen, GraduationCap, ChevronRight, Users, Microscope, Building, Globe, Calendar, Lock, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import universityData from '../data/universities';
import { getUniversityDetailedInfo, getUniversityCourses, getPostUtmeDates } from '../services/geminiService';
import { getPostUtmeRecordForSchool, PostUtmeStatusType } from '../services/postUtmeTracker';
import { PostUtmeInfo } from '../types';
import { trackInstitutionSearch } from '../services/analytics';

interface UniBio {
  bio: string;
  founded: string;
  motto: string;
  bestKnownFor: string;
  campusVibe: string;
  facultyStudentRatio: string;
  researchOutput: string;
  facilities: string[];
}

interface UniversityDirectoryProps {
  externalHighlight?: string | null;
  onClearHighlight?: () => void;
  initialCategory?: 'All' | 'Federal' | 'State' | 'Private' | 'Polytechnic' | 'COE' | 'National';
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const UniversityDirectory: React.FC<UniversityDirectoryProps> = ({ externalHighlight, onClearHighlight, initialCategory = 'All', isPremium, onUpgrade }) => {
  const navigate = useNavigate();
  const { slug: urlSlug } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Federal' | 'State' | 'Private' | 'Polytechnic' | 'COE' | 'National'>(initialCategory);
  const [postUtmeFilter, setPostUtmeFilter] = useState<'ALL' | PostUtmeStatusType>('ALL');
  const [selectedUni, setSelectedUni] = useState<{ name: string; category: string; url: string; slug?: string } | null>(null);
  
  // AI State
  const [uniBio, setUniBio] = useState<UniBio | null>(null);
  const [isBioLoading, setIsBioLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [postUtmeInfo, setPostUtmeInfo] = useState<PostUtmeInfo | null>(null);
  const [isPostUtmeLoading, setIsPostUtmeLoading] = useState(false);
  
  const filteredUniversities = useMemo(() => {
    let results = universityData;
    
    if (activeCategory !== 'All') {
      results = results.filter(uni => uni.category === activeCategory);
    }
    
    if (postUtmeFilter !== 'ALL') {
      results = results.filter(uni => {
        const tracker = getPostUtmeRecordForSchool(uni.name);
        return tracker.status === postUtmeFilter;
      });
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(uni => 
        uni.name.toLowerCase().includes(term) || 
        uni.slug?.toLowerCase().includes(term) ||
        uni.category.toLowerCase().includes(term)
      );
    }
    
    return results;
  }, [searchTerm, activeCategory, postUtmeFilter]);

  const displayedUniversities = filteredUniversities.slice(0, 60);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (externalHighlight) {
      const uni = universityData.find(u => u.slug === externalHighlight);
      if (uni) {
        handleShowInfo(uni, false);
        if (onClearHighlight) onClearHighlight();
      }
    } else if (urlSlug) {
      const uni = universityData.find(u => u.slug === urlSlug);
      if (uni && (!selectedUni || selectedUni.slug !== urlSlug)) {
        handleShowInfo(uni, false);
      }
    }
  }, [externalHighlight, urlSlug]);

  const handleShowInfo = async (uni: any, updateUrl: boolean = true) => {
    trackInstitutionSearch({
      search_term: uni.name,
      institution_type: uni.category || 'University'
    });
    setSelectedUni(uni);
    if (updateUrl && uni.slug) {
      navigate(`/universities/${uni.slug}`, { replace: true });
    }
    setIsBioLoading(true);
    setIsCoursesLoading(true);
    setIsPostUtmeLoading(true);
    setUniBio(null);
    setAvailableCourses([]);
    setPostUtmeInfo(null);

    try {
      const bioData = await getUniversityDetailedInfo(uni.name);
      setUniBio(bioData);
      setIsBioLoading(false);

      const courseData = await getUniversityCourses(uni.name);
      setAvailableCourses(courseData);
      setIsCoursesLoading(false);

      const postUtmeData = await getPostUtmeDates(uni.name);
      setPostUtmeInfo(postUtmeData);
      setIsPostUtmeLoading(false);
    } catch (e) {
      console.error(e);
      setIsBioLoading(false);
      setIsCoursesLoading(false);
      setIsPostUtmeLoading(false);
    }
  };

  const getPostUtmeCardBadge = (schoolName: string) => {
    const record = getPostUtmeRecordForSchool(schoolName);
    switch (record.status) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Open
          </span>
        );
      case 'NOT_OPEN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
            <Clock size={10} />
            Not Open
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1 shrink-0">
            <AlertCircle size={10} />
            Closed
          </span>
        );
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Federal': return { 
        bg: 'bg-blue-50 dark:bg-blue-900/40', 
        text: 'text-blue-600 dark:text-blue-300', 
        border: 'border-blue-100 dark:border-blue-800',
        icon: <Landmark size={14} />
      };
      case 'State': return { 
        bg: 'bg-emerald-50 dark:bg-emerald-900/40', 
        text: 'text-emerald-600 dark:text-emerald-300', 
        border: 'border-emerald-100 dark:border-emerald-800',
        icon: <Building2 size={14} />
      };
      case 'Private': return { 
        bg: 'bg-purple-50 dark:bg-purple-900/40', 
        text: 'text-purple-600 dark:text-purple-300', 
        border: 'border-purple-100 dark:border-purple-800',
        icon: <School size={14} />
      };
      case 'Polytechnic': return { 
        bg: 'bg-orange-50 dark:bg-orange-900/40', 
        text: 'text-orange-600 dark:text-orange-300', 
        border: 'border-orange-100 dark:border-orange-800',
        icon: <Building size={14} />
      };
      case 'COE': return { 
        bg: 'bg-cyan-50 dark:bg-cyan-900/40', 
        text: 'text-cyan-600 dark:text-cyan-300', 
        border: 'border-cyan-100 dark:border-cyan-800',
        icon: <BookOpen size={14} />
      };
      case 'National': return { 
        bg: 'bg-gray-100 dark:bg-gray-800', 
        text: 'text-gray-900 dark:text-white', 
        border: 'border-gray-300 dark:border-gray-600',
        icon: <Globe size={14} />
      };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: <School size={14} /> };
    }
  };

  return (
    <section id="directory" className="py-12 md:py-24 bg-white dark:bg-gray-950 transition-colors border-b border-gray-100 dark:border-gray-800 scroll-mt-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100 dark:border-blue-800">
              <Command size={12} />
              Portal Directory
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 md:mb-6 tracking-tight">
              Institutional <span className="text-blue-600 dark:text-cyan-400">Gateways</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-base md:text-lg max-w-2xl mx-auto">
              Secure, direct access to verified admission portals for over 283 institutions.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-8 md:mb-12 space-y-6 md:space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[28px] md:rounded-[32px] blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              
              <div className="relative flex items-center">
                <Search className="absolute left-5 md:left-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search 283+ portals (e.g., UNILAG...)"
                  className="w-full pl-12 md:pl-16 pr-12 py-5 md:py-7 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[24px] md:rounded-[32px] text-base md:text-xl font-bold outline-none focus:border-blue-500 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedUni) setSelectedUni(null);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex flex-nowrap md:flex-wrap items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar scroll-smooth px-1">
                {(['All', 'Federal', 'State', 'Private', 'Polytechnic', 'COE', 'National'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setSelectedUni(null);
                    }}
                    className={`px-5 py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap shrink-0 ${
                      activeCategory === cat 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/25' 
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Post-UTME Status Quick Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl shrink-0 w-full md:w-auto justify-center">
                <button
                  onClick={() => setPostUtmeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    postUtmeFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  All Statuses
                </button>
                <button
                  onClick={() => setPostUtmeFilter('OPEN')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                    postUtmeFilter === 'OPEN'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Open
                </button>
                <button
                  onClick={() => setPostUtmeFilter('NOT_OPEN')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                    postUtmeFilter === 'NOT_OPEN'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-amber-500'
                  }`}
                >
                  <Clock size={10} />
                  Not Open
                </button>
                <button
                  onClick={() => setPostUtmeFilter('CLOSED')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                    postUtmeFilter === 'CLOSED'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-rose-500'
                  }`}
                >
                  <AlertCircle size={10} />
                  Closed
                </button>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {selectedUni ? (
                /* Spotlight View */
                <motion.div 
                  key="spotlight"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-gray-50 dark:bg-gray-900 rounded-[32px] md:rounded-[48px] p-6 md:p-12 border border-gray-100 dark:border-gray-800 shadow-inner relative overflow-hidden"
                >
                  <button 
                    onClick={() => {
                      setSelectedUni(null);
                      navigate('/', { replace: true });
                    }}
                    className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-lg transition-all active:scale-95 z-20"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-start relative z-10">
                    {/* Header Info */}
                    <div className="w-full lg:w-1/4 flex flex-col items-center lg:items-start text-center lg:text-left">
                      <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] ${getCategoryTheme(selectedUni.category).bg} flex items-center justify-center font-black text-4xl md:text-5xl ${getCategoryTheme(selectedUni.category).text} border-4 ${getCategoryTheme(selectedUni.category).border} mb-6 md:mb-8 shadow-2xl shrink-0`}>
                        {selectedUni.slug ? selectedUni.slug.substring(0, 2).toUpperCase() : selectedUni.name.substring(0, 2).toUpperCase()}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                        {selectedUni.name}
                      </h3>
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 ${getCategoryTheme(selectedUni.category).bg} ${getCategoryTheme(selectedUni.category).text} border ${getCategoryTheme(selectedUni.category).border}`}>
                        {getCategoryTheme(selectedUni.category).icon}
                        {selectedUni.category}
                      </div>
                      
                      <div className="w-full">
                        <a 
                          href={selectedUni.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] md:rounded-[24px] font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                        >
                          Visit Official Portal
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>

                    {/* AI Bio Area */}
                    <div className="w-full lg:w-3/4 space-y-8 md:space-y-10">
                      {isBioLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                          <Loader2 size={40} className="animate-spin text-blue-600 dark:text-cyan-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold italic">Consulting Gemini for institutional data...</p>
                        </div>
                      ) : uniBio ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-10">
                          <div className="bg-white dark:bg-gray-800/50 p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-4"><History size={14} className="text-blue-500" /> At A Glance</h4>
                            <p className="text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium italic">"{uniBio.bio}"</p>
                          </div>
                          
                          {/* Institutional Insights Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="p-5 bg-blue-50/50 dark:bg-blue-900/20 rounded-[24px] border border-blue-100/50 dark:border-blue-800/30">
                               <div className="flex items-center gap-2 mb-3">
                                 <Users size={16} className="text-blue-500" />
                                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Faculty-Student Ratio</span>
                               </div>
                               <p className="text-lg font-black dark:text-white">{uniBio.facultyStudentRatio}</p>
                               <p className="text-[10px] font-medium text-gray-500 mt-1">2026 Academic Estimate</p>
                             </div>
                             
                             <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-[24px] border border-emerald-100/50 dark:border-emerald-800/30">
                               <div className="flex items-center gap-2 mb-3">
                                 <Microscope size={16} className="text-emerald-500" />
                                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Research Impact</span>
                               </div>
                               <p className="text-xs font-bold dark:text-gray-200 leading-relaxed">{uniBio.researchOutput}</p>
                             </div>
                          </div>

                          {/* Post-UTME Tracker */}
                          <div className="bg-gray-900 rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden border border-white/5">
                             {!isPremium && (
                                <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                                   <Lock size={24} className="text-blue-400 mb-3" />
                                   <p className="text-[10px] font-black uppercase tracking-widest text-white mb-4">Premium Admission Signal</p>
                                   <button 
                                      onClick={onUpgrade}
                                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                   >
                                      Unlock Tracker
                                   </button>
                                </div>
                             )}
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                             <div className="flex items-center justify-between mb-6">
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                                   <Calendar size={14} /> Post-UTME Tracker
                                </h4>
                                {isPostUtmeLoading ? (
                                   <Loader2 size={14} className="animate-spin text-blue-400" />
                                ) : postUtmeInfo && (
                                   <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                      postUtmeInfo.status === 'Released' ? 'bg-emerald-500' : 
                                      postUtmeInfo.status === 'Estimated' ? 'bg-orange-500' : 'bg-gray-700'
                                   }`}>
                                      {postUtmeInfo.status}
                                   </span>
                                )}
                             </div>

                             {isPostUtmeLoading ? (
                                <div className="py-4 text-center text-xs font-bold text-gray-500 italic">Syncing with 2026 admission cycle...</div>
                             ) : postUtmeInfo ? (
                                <div className="space-y-6">
                                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                      <div>
                                         <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Target Date</p>
                                         <p className="text-xl font-black">{postUtmeInfo.date}</p>
                                         {postUtmeInfo.status === 'Estimated' && (
                                            <p className="text-[10px] text-orange-400 font-bold mt-1 italic">Based on {postUtmeInfo.previousYearDate} patterns</p>
                                         )}
                                      </div>
                                      {postUtmeInfo.registrationLink && (
                                         <a href={postUtmeInfo.registrationLink} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center">
                                            Apply Now
                                         </a>
                                      )}
                                   </div>
                                   {postUtmeInfo.requirements && (
                                      <div className="pt-4 border-t border-white/5">
                                         <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Core Requirements</p>
                                         <p className="text-xs text-gray-300 leading-relaxed font-medium">{postUtmeInfo.requirements}</p>
                                      </div>
                                   )}
                                </div>
                             ) : (
                                <div className="py-4 text-center text-xs font-bold text-gray-500">No Post-UTME data available for this institution.</div>
                             )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500"><Building size={14} className="text-cyan-500" /> Notable Facilities</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {uniBio.facilities.map((facility, fIdx) => (
                                  <div key={fIdx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800">
                                     <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                     <span className="text-xs font-bold dark:text-gray-300">{facility}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500"><BookOpen size={14} className="text-emerald-500" /> Key Departments</h4>
                              <div className="flex flex-wrap gap-2">
                                {availableCourses.slice(0, 8).map(course => (
                                  <span key={course} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray-200 dark:border-gray-700">{course}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                             <div>
                               <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Founded</p>
                               <p className="text-sm font-bold dark:text-white">{uniBio.founded}</p>
                             </div>
                             <div>
                               <p className="text-[8px] font-black uppercase text-gray-400 mb-1">University Motto</p>
                               <p className="text-sm font-bold dark:text-white italic">"{uniBio.motto}"</p>
                             </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ) : displayedUniversities.length > 0 ? (
                /* Grid View */
                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {displayedUniversities.map((uni, idx) => {
                    const theme = getCategoryTheme(uni.category);
                    const initials = uni.slug ? uni.slug.substring(0, 2).toUpperCase() : uni.name.substring(0, 2).toUpperCase();
                    return (
                      <motion.div key={uni.name} onClick={() => handleShowInfo(uni)} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] md:rounded-[32px] hover:border-blue-500 dark:hover:border-cyan-500 hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden">
                        <div className="flex items-center gap-4 md:gap-5 relative z-10 overflow-hidden">
                          <div className={`w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-[16px] md:rounded-[20px] ${theme.bg} flex items-center justify-center font-black text-xl md:text-2xl ${theme.text} border ${theme.border} transition-all duration-500 shadow-sm`}>{initials}</div>
                          <div className="flex flex-col gap-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${theme.text}`}>
                                {theme.icon}{uni.category}
                              </span>
                              {getPostUtmeCardBadge(uni.name)}
                            </div>
                            <h4 className="font-bold text-base md:text-lg text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate max-w-[150px] sm:max-w-none">{uni.name}</h4>
                          </div>
                        </div>
                        <button className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><Info size={18} /></button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniversityDirectory;
