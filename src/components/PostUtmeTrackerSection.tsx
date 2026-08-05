import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, CheckCircle2, Clock, AlertCircle, Search, Filter, ExternalLink, 
  Building2, Landmark, School, ArrowRight, ShieldCheck, Sparkles, BookOpen, AlertTriangle 
} from 'lucide-react';
import { getAllPostUtmeRecords, getPostUtmeStats, PostUtmeSchoolRecord, PostUtmeStatusType } from '../services/postUtmeTracker';

interface PostUtmeTrackerSectionProps {
  onNavigateToFullHub?: () => void;
  onSelectSchool?: (schoolName: string) => void;
  compact?: boolean;
}

const PostUtmeTrackerSection: React.FC<PostUtmeTrackerSectionProps> = ({
  onNavigateToFullHub,
  onSelectSchool,
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PostUtmeStatusType>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const [recordsVersion, setRecordsVersion] = useState(0);

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

  const allRecords = useMemo(() => getAllPostUtmeRecords(), [recordsVersion]);
  const stats = useMemo(() => getPostUtmeStats(), [recordsVersion]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      // Status filter
      if (statusFilter !== 'ALL' && record.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'All' && record.category !== categoryFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          record.schoolName.toLowerCase().includes(term) ||
          record.category.toLowerCase().includes(term) ||
          record.statusText.toLowerCase().includes(term) ||
          (record.cutoffScore && record.cutoffScore.includes(term))
        );
      }
      return true;
    });
  }, [allRecords, statusFilter, categoryFilter, searchTerm]);

  const displayedRecords = compact ? filteredRecords.slice(0, 6) : filteredRecords;

  const getStatusBadge = (status: PostUtmeStatusType) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            OPEN NOW
          </span>
        );
      case 'NOT_OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock size={12} />
            NOT YET OPEN
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <AlertCircle size={12} />
            FORM CLOSED
          </span>
        );
    }
  };

  return (
    <section id="post-utme-tracker-section" className="py-8 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
            <Calendar size={14} />
            2026/2027 Live Status Engine
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Post-UTME <span className="text-blue-600 dark:text-cyan-400">Release Tracker</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm max-w-xl">
            Real-time verification of active screening forms, upcoming form announcements, and closed registration portals across Nigerian institutions.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm shrink-0">
          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-2 rounded-xl text-center transition-all ${
              statusFilter === 'OPEN' ? 'bg-emerald-500 text-white shadow-md' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span className="block text-sm font-black">{stats.open}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">Open Now</span>
          </button>

          <button
            onClick={() => setStatusFilter('NOT_OPEN')}
            className={`px-3 py-2 rounded-xl text-center transition-all ${
              statusFilter === 'NOT_OPEN' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span className="block text-sm font-black">{stats.notOpen}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">Not Open</span>
          </button>

          <button
            onClick={() => setStatusFilter('CLOSED')}
            className={`px-3 py-2 rounded-xl text-center transition-all ${
              statusFilter === 'CLOSED' ? 'bg-rose-500 text-white shadow-md' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span className="block text-sm font-black">{stats.closed}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">Closed</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All Forms ({stats.total})
          </button>

          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              statusFilter === 'OPEN'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Open Now ({stats.open})
          </button>

          <button
            onClick={() => setStatusFilter('NOT_OPEN')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              statusFilter === 'NOT_OPEN'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Clock size={12} />
            Not Yet Open ({stats.notOpen})
          </button>

          <button
            onClick={() => setStatusFilter('CLOSED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              statusFilter === 'CLOSED'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle size={12} />
            Closed ({stats.closed})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search school (UNILAG, OAU, UNIBEN...)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Grid of Post-UTME Status Cards */}
      {displayedRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRecords.map((record) => (
            <motion.div
              key={record.schoolName}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-[20px] sm:rounded-[28px] p-4 sm:p-6 border border-gray-150 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-3 sm:space-y-5 relative overflow-hidden group"
            >
              <div className="space-y-3">
                {/* Top Status & Category Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                    {record.category}
                  </span>
                  {getStatusBadge(record.status)}
                </div>

                {/* School Name */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {record.schoolName}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1 leading-relaxed line-clamp-2">
                    {record.details}
                  </p>
                </div>

                {/* Key Details Grid */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-850/60 border border-gray-100 dark:border-gray-800 space-y-2 text-[10px] sm:text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Minimum Cut-Off:
                    </span>
                    <span className="font-black text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                      {record.cutoffScore || '180'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Target Period:
                    </span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {record.deadlineDate || record.publishDate || 'Ongoing'}
                    </span>
                  </div>

                  {record.requirements && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800/60 text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-normal line-clamp-2">
                      <span className="font-bold text-gray-900 dark:text-gray-200">Requirements: </span>
                      {record.requirements}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800">
                {record.status === 'OPEN' && record.portalLink ? (
                  <a
                    href={record.portalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    Apply Now <ExternalLink size={12} />
                  </a>
                ) : record.status === 'NOT_OPEN' ? (
                  <button
                    onClick={() => onSelectSchool && onSelectSchool(record.schoolName)}
                    className="w-full py-2 sm:py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 border border-amber-500/30"
                  >
                    <Clock size={12} /> Awaiting Form Release
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 sm:py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <AlertCircle size={12} /> Portal Closed
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-[32px] border border-gray-200 dark:border-gray-800 space-y-3">
          <AlertTriangle size={32} className="mx-auto text-amber-500" />
          <h4 className="text-base font-black text-gray-900 dark:text-white">
            No Post-UTME forms matching search criteria
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Try resetting your search filters or searching with institutional acronyms (e.g. UNILAG, UI, OAU).
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setCategoryFilter('All');
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Explore Full Hub Button if Compact */}
      {compact && onNavigateToFullHub && (
        <div className="text-center pt-4">
          <button
            onClick={onNavigateToFullHub}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 inline-flex items-center gap-3 active:scale-95"
          >
            Explore All 100+ Post-UTME School Forms <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
};

export default PostUtmeTrackerSection;
