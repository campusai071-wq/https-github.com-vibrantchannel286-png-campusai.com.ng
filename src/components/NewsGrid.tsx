import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { triggerBrowserNotification, slugify } from '../services/utils';
import { 
  Calendar, RefreshCw, Newspaper, Brain, ShieldCheck, Box, Bookmark,
  BookmarkCheck, Plus, Database, Search, ArrowRight, Zap, Activity,
  Globe, Sparkles, Flame, Timer, Edit, Trash2, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UniversityCategory, NewsItem } from '../types';
import { fetchLiveNews, smartSearchAndVerifyNews } from '../services/geminiService';
import { 
  getCloudNews, archiveNewsItems, getGlobalSyncMetadata, 
  updateGlobalSyncMetadata, updateNewsItem, deleteNewsUpdate,
  logUserActivity, getStableNewsKey, normalizeCategory,
  getCloudNewsCount, getUserActivities, getSyncTime,
  getEffectiveDateMs, sortNewsBySyncAndDate, getNewsSortTimestamp
} from '../services/dbService';
import { getLocalProfile } from '../services/userService';
import QuotaModal from './QuotaModal';
import NewsEditModal from './NewsEditModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const SIX_HOURS_MS    =  6 * 60 * 60 * 1000;
const INITIAL_VISIBLE_COUNT = 20;
const REVEAL_STEP           = 40;

// ─── Nigerian date helper (WAT = UTC+1) ───────────────────────────────────────

const getNigerianDateDisplay = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    timeZone: 'Africa/Lagos',
  }).toUpperCase();

// ─── Timestamp normaliser ─────────────────────────────────────────────────────
// Handles Firestore Timestamps, Date objects, ISO strings, and epoch numbers.
// Returns 0 on failure — never throws.

const toMs = (val: any): number => {
  if (!val) return 0;
  if (typeof val?.toMillis === 'function') return val.toMillis();
  if (typeof val?.toDate   === 'function') return val.toDate().getTime();
  if (typeof val === 'object') {
    if ('seconds' in val) return val.seconds * 1000;
    if ('_seconds' in val) return val._seconds * 1000;
  }
  if (typeof val === 'number') return val;
  const t = new Date(val).getTime();
  return isNaN(t) ? 0 : t;
};

// ─── Sort / Score helpers ─────────────────────────────────────────────────────

const formatFallbackDate = (item: NewsItem): string => {
  if (!item) return "RECENT UPDATE";
  const ms = getSyncTime(item);
  if (ms > 0) {
    return new Date(ms).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      timeZone: 'Africa/Lagos'
    });
  }
  return "RECENT UPDATE";
};

const getHotIndexScore = (item: NewsItem): number => {
  let score = 0;

  const highPriority = ['JAMB', 'National', 'Federal', 'NYSC', 'Scholarships'];
  if (highPriority.includes(item.category)) score += 40;

  const hotKeywords = [
    { kw: 'cutoff',    weight: 45 }, { kw: 'cut-off',   weight: 45 },
    { kw: 'admission', weight: 35 }, { kw: 'screening',  weight: 30 },
    { kw: 'jamb',      weight: 50 }, { kw: 'asuu',       weight: 40 },
    { kw: 'strike',    weight: 35 }, { kw: 'post-utme',  weight: 45 },
    { kw: 'caps',      weight: 40 }, { kw: 'portal',     weight: 20 },
    { kw: 'release',   weight: 25 }, { kw: 'result',     weight: 35 },
    { kw: 'list',      weight: 30 }, { kw: 'urgent',     weight: 25 },
    { kw: 'breaking',  weight: 30 }, { kw: 'futa',       weight: 25 },
    { kw: 'unilag',    weight: 25 }, { kw: 'ui',         weight: 20 },
    { kw: 'abu',       weight: 20 },
  ];

  const titleLower   = item.title?.toLowerCase();
  const excerptLower = (item.excerpt || '').toLowerCase();
  hotKeywords.forEach(({ kw, weight }) => {
    if (titleLower.includes(kw))   score += weight;
    if (excerptLower.includes(kw)) score += Math.floor(weight / 2);
  });

  const diffHours = Math.max(0, (Date.now() - getSyncTime(item)) / 3_600_000);
  const recency   = Math.max(0.1, 1 / (1 + diffHours / 48));
  return score * recency;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

export const UniversityAvatar: React.FC<{ category: string; title?: string }> = ({ category, title }) => {
  const gradient: Record<string, string> = {
    Federal:      'from-blue-900 via-indigo-950 to-slate-950 text-blue-200 border-blue-500/30',
    State:        'from-emerald-900 via-teal-950 to-slate-950 text-emerald-200 border-emerald-500/30',
    Private:      'from-purple-900 via-fuchsia-950 to-slate-950 text-purple-200 border-purple-500/30',
    JAMB:         'from-rose-900 via-red-950 to-slate-950 text-rose-200 border-rose-500/30',
    Polytechnic:  'from-amber-900 via-orange-950 to-slate-950 text-amber-200 border-amber-500/30',
    COE:          'from-cyan-900 via-blue-950 to-slate-950 text-cyan-200 border-cyan-500/30',
    National:     'from-slate-900 via-gray-900 to-black text-gray-200 border-gray-700/30',
    Jobs:         'from-emerald-900 via-green-950 to-slate-950 text-emerald-200 border-emerald-500/30',
    Scholarships: 'from-amber-900 via-yellow-950 to-slate-950 text-yellow-200 border-yellow-500/30',
    NYSC:         'from-green-900 via-emerald-950 to-slate-950 text-emerald-200 border-emerald-500/30',
    Update:       'from-blue-900 via-indigo-950 to-slate-950 text-blue-200 border-blue-500/30',
  };

  const bgStyle = gradient[category || 'Update'] || gradient['Update'];

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${bgStyle} flex flex-col justify-between p-5 overflow-hidden select-none border-b border-white/10`}>
      {/* Background pattern elements */}
      <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none transform -rotate-12">
        <Newspaper size={140} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/5 pointer-events-none" />

      {/* Header icon / badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[8px] font-black uppercase tracking-widest text-white shadow-md">
          <Globe size={10} className="text-cyan-400" /> {category || 'CAMPUSAI UPDATE'}
        </div>
        <Sparkles size={14} className="text-white/40" />
      </div>

      {/* Title preview or graphic text in readable high contrast */}
      {title ? (
        <div className="relative z-10 my-auto py-1">
          <p className="text-xs md:text-sm font-black text-white leading-snug line-clamp-3 drop-shadow-md">
            {title}
          </p>
        </div>
      ) : (
        <div className="relative z-10 my-auto flex items-center justify-center">
          <Newspaper size={36} className="text-white/50" />
        </div>
      )}

      <div className="relative z-10 flex items-center gap-1 text-[7.5px] font-bold text-white/70 uppercase tracking-wider">
        <ShieldCheck size={10} className="text-emerald-400 shrink-0" /> Verified Report
      </div>
    </div>
  );
};

export const NewsCard: React.FC<{
  news: NewsItem;
  onRead: () => void;
  onDiscuss?: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  isRelevant?: boolean;
  onTagClick?: (tag: string) => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ news, onRead, onDiscuss, isBookmarked, onToggleBookmark, isRelevant, onTagClick, isAdmin, onEdit, onDelete }) => {
  const [imgError, setImgError] = useState(false);
  const displayImage = React.useMemo(() => {
    if (imgError) return null;
    if (news.image && typeof news.image === 'string' && news.image.trim()) return news.image.trim();
    if (news.images && Array.isArray(news.images)) {
      const valid = news.images.find(i => i && typeof i === 'string' && i.trim());
      if (valid) return valid.trim();
    }
    return null;
  }, [imgError, news.image, news.images]);
  const totalImages = news.images && news.images.length > 0 ? news.images.length : (news.image ? 1 : 0);

  return (
    <article className="w-full">
      <motion.div
        layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
        className="flex gap-4 p-3 border-b border-gray-100 dark:border-gray-800 transition-all group"
      >
        {/* Thumbnail */}
        <div className="w-24 h-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900 cursor-pointer" onClick={onRead}>
          {displayImage ? (
            <img 
              src={displayImage} 
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover" 
            />
          ) : (
            <UniversityAvatar category={news.category} title={news.title} />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 hover:text-blue-600 transition-colors">
            <a 
              href={`/news/${news.slug || slugify(news.title)}`} 
              onClick={e => { e.preventDefault(); onRead(); }}
            >
              {news.title}
            </a>
          </h3>
          <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest gap-2">
            <span>{formatFallbackDate(news)}</span>
            {news.category && <span className="text-blue-600">{news.category}</span>}
          </div>
        </div>
      </motion.div>
    </article>
  );
};

// ─── Bookmark helpers ─────────────────────────────────────────────────────────

const readBookmarks = (): string[] => {
  try { return JSON.parse(localStorage.getItem('campusai_bookmarks') || '[]'); } catch { return []; }
};

const writeBookmarks = (ids: string[]) => {
  try { localStorage.setItem('campusai_bookmarks', JSON.stringify(ids)); } catch {}
};

// ─── Relevant categories per role ────────────────────────────────────────────

const getRelevantCategories = (role?: string): UniversityCategory[] => {
  if (role === 'Pre-Admission')      return ['JAMB', 'Federal', 'State', 'National', 'Scholarships'];
  if (role === 'In-Campus')          return ['Federal', 'State', 'Private', 'Polytechnic', 'COE', 'Scholarships', 'Jobs'];
  if (role === 'Graduate/Alumni')    return ['National', 'Private', 'Jobs', 'NYSC'];
  if (role === 'School/Institution') return ['National', 'Federal', 'State', 'Jobs'];
  return [];
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface NewsGridProps {
  user: any;
  onDiscussAi?: (news: NewsItem) => void;
  onReadArticle: (news: NewsItem) => void;
  onLoginRequest: () => void;
  initialFilter?: UniversityCategory | 'Bookmarks';
  isMiniPreview?: boolean;
}

const NewsGrid: React.FC<NewsGridProps> = ({
  user, onDiscussAi, onReadArticle, onLoginRequest,
  initialFilter = 'All', isMiniPreview = false,
}) => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<UniversityCategory | 'Bookmarks' | 'Latest' | 'Hot'>(
    isMiniPreview ? 'Latest' : initialFilter
  );
  const [newsList, setNewsList]             = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading]           = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(true);
  const [lastCreatedAt, setLastCreatedAt] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [bookmarks, setBookmarks]           = useState<string[]>(readBookmarks);
  const [visibleCount, setVisibleCount]     = useState(INITIAL_VISIBLE_COUNT);
  const [readCount, setReadCount] = useState(0);
  const [hasFetchedAllForSearch, setHasFetchedAllForSearch] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    getUserActivities(user.uid, 500).then(activities => {
        setReadCount(activities.filter(a => a.type === 'news_read').length);
    });
  }, [user?.uid]);

  const handleReadArticle = (news: NewsItem) => {
    if (user?.uid) {
        logUserActivity({
            userId: user.uid,
            type: 'news_read',
            title: news.title,
            description: `Read: ${news.title}`,
            metadata: { newsId: news.id }
        });
        setReadCount(prev => prev + 1);
    }
    onReadArticle(news);
  };

  const handleDiscussAi = (news: NewsItem) => {
    if (onDiscussAi) {
      onDiscussAi(news);
    } else {
      if (user) {
        window.dispatchEvent(new CustomEvent('campusai_open_ai', { 
          detail: `I want to discuss the news report: "${news?.title}". Let's chat about what this means for my aggregate and cutoff requirements.` 
        }));
      } else {
        onLoginRequest();
      }
    }
  };
  const [searchQuery, setSearchQuery]       = useState('');
  const searchQueryRef = useRef(searchQuery);
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [usagePercent, setUsagePercent]     = useState(0);
  const [syncError, setSyncError]           = useState<string | null>(null);

  // Admin Edit/Delete states
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lastAutoSyncTime, setLastAutoSyncTime] = useState('Syncing...');
  const [totalArchivedCount, setTotalArchivedCount] = useState(0);
  const [isStale, setIsStale]               = useState(false);
  const [newlySyncedIds, setNewlySyncedIds] = useState<Set<string>>(new Set());

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const [isSmartSearching, setIsSmartSearching]   = useState(false);
  const [smartSearchResult, setSmartSearchResult] = useState<{
    searched: boolean; verified: boolean; query: string; reason?: string; article?: NewsItem;
  } | null>(null);

  const newsListRef = useRef<NewsItem[]>(newsList);
  useEffect(() => { newsListRef.current = newsList; }, [newsList]);

  const autoOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current); }, []);

  // ── Load from cloud DB ──────────────────────────────────────────────────────

  const loadLocalNews = useCallback(async (categoryFilter?: string, limitOverride?: number) => {
    setIsLocalLoading(true);
    try {
      const category = categoryFilter && ['Latest', 'Hot', 'All', 'Bookmarks'].includes(categoryFilter) ? undefined : categoryFilter;
      const targetLimit = limitOverride || 30;
      const cloudNews = await getCloudNews(false, false, category, undefined, targetLimit);
      const sorted = [...cloudNews].sort(sortNewsBySyncAndDate);
      setNewsList(sorted);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      
      if (sorted.length > 0) {
        setLastCreatedAt(sorted[sorted.length - 1].createdAt);
        setHasMore(sorted.length >= targetLimit);
      } else {
        setHasMore(false);
      }
      
      try {
        const liveCount = await getCloudNewsCount();
        setTotalArchivedCount(Math.max(sorted.length, liveCount));
      } catch (e) {
        setTotalArchivedCount(sorted.length);
      }
      
      setBookmarks(readBookmarks());

      const lastSync = localStorage.getItem('campusai_last_auto_sync_ts');
      if (lastSync) {
        const diff = Date.now() - parseInt(lastSync);
        setIsStale(diff > TWELVE_HOURS_MS);
        const mins = Math.round(diff / 60_000);
        setLastAutoSyncTime(mins < 60 ? `${mins}m ago` : `${Math.round(mins / 60)}h ago`);
      } else {
        setLastAutoSyncTime('Initial Pull Needed');
      }

      const profile = getLocalProfile();
      if (!profile.is_premium) {
        setUsagePercent(Math.min(100, ((profile.daily_requests || 0) / 10) * 100));
      }
    } catch (e) {
      console.error("NewsGrid: loadLocalNews error:", e);
    } finally {
      setIsLocalLoading(false);
    }
  }, []);

  // Trigger larger cloud fetch when user starts searching to search across records in Firebase
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      if (!hasFetchedAllForSearch) {
        setHasFetchedAllForSearch(true);
        loadLocalNews(filter, 100);
      }
    } else {
      if (hasFetchedAllForSearch) {
        setHasFetchedAllForSearch(false);
        loadLocalNews(filter);
      }
    }
  }, [searchQuery, hasFetchedAllForSearch, filter, loadLocalNews]);

  const fetchMoreNews = useCallback(async (categoryFilter?: string) => {
    if (!hasMore || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const category = categoryFilter && ['Latest', 'Hot', 'All', 'Bookmarks'].includes(categoryFilter) ? undefined : categoryFilter;
      const newNews = await getCloudNews(false, false, category, lastCreatedAt, 30);
      
      if (!newNews || newNews.length === 0) {
        setHasMore(false);
      } else {
        setNewsList(prev => {
          const existingIds = new Set(prev.map(n => n.id || n.slug));
          const uniqueNew = newNews.filter(n => !existingIds.has(n.id || n.slug));
          if (uniqueNew.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...uniqueNew];
        });
        setLastCreatedAt(newNews[newNews.length - 1].createdAt);
        setHasMore(newNews.length >= 25);
      }
    } catch (e) {
      console.error("NewsGrid: fetchMoreNews error:", e);
    } finally {
      setIsFetchingMore(false);
    }
  }, [lastCreatedAt, hasMore, isFetchingMore]);

  // ── Sync live news from AI ──────────────────────────────────────────────────
  // FIX: Replaced permanent sessionStorage lock with a concurrent-only guard
  // that is always cleared in `finally`, so subsequent syncs are never blocked.

  const handleSyncLiveNews = useCallback(async (isAuto = false) => {
    if (!user) { if (!isAuto) onLoginRequest(); return; }
    if (isLoading) return;

    // Guard against *concurrent* syncs only — cleared in finally
    if (isAuto && sessionStorage.getItem('campusai_sync_in_progress')) return;

    setIsLoading(true);
    setSyncError(null);
    sessionStorage.setItem('campusai_sync_in_progress', '1');

    try {
      const { lastSync } = await getGlobalSyncMetadata();
      // For auto syncs, skip if a global sync already happened within the last 6 hours
      if (isAuto && (Date.now() - lastSync) < SIX_HOURS_MS) {
        return;
      }

      if (isAuto) await updateGlobalSyncMetadata(Date.now());

      const liveData = await fetchLiveNews(user.email);
      if (liveData && liveData.length > 0) {
        // Map liveData IDs to the exact docId/stableKey format used in archiveNewsItems
        const mappedLiveData = liveData.map(item => {
          const finalCategory = normalizeCategory(item.category, item.title);
          const stableKey = getStableNewsKey(item.title, finalCategory);
          const docId = stableKey.startsWith("news-") ? stableKey : `news-${stableKey}`;
          return { ...item, id: docId, category: finalCategory };
        });

        // Treat all synced articles from the active curation cycle as newly added/synced in the UI session,
        // ensuring they are prioritized and highlighted at the very top of the feed.
        const newlyAdded = mappedLiveData;

        await archiveNewsItems(liveData);
        const now = Date.now();
        localStorage.setItem('campusai_last_auto_sync_ts', now.toString());
        if (!isAuto) await updateGlobalSyncMetadata(now);

        if (newlyAdded.length > 0) {
          setNewlySyncedIds(prev => {
            const next = new Set(prev);
            newlyAdded.forEach(item => next.add(item.id));
            return next;
          });
        }

        await loadLocalNews();

        if (newlyAdded.length > 0) {
          newlyAdded.slice(0, 3).forEach(article => {
            triggerBrowserNotification(
              `🔔 ${article.category || 'Admissions'} Update: ${article.title}`,
              article.excerpt,
              article.slug || slugify(article.title)
            );
          });
          if (!isAuto) alert(`Intelligence Sync Complete: ${newlyAdded.length} new updates arrived and active!`);
        } else {
          if (!isAuto) alert("Intelligence Cycle Complete: Stale records refreshed. No new updates needed.");
        }
      } else {
        if (!isAuto) alert("No new intelligence found in the current cycle. Please try again later or check your API configuration.");
        console.log("DEBUG: fetchLiveNews returned empty or null. liveData =", liveData);
      }
    } catch (e: any) {
      console.error("NewsGrid: sync error:", e);
      const isQuota = e?.message?.toLowerCase().match(/quota|429|limit|exhausted/) || e?.status === 'RESOURCE_EXHAUSTED';
      setSyncError(isQuota
        ? "Our AI News Sync engine is currently at maximum capacity (Google Gemini rate limit)."
        : "News synchronization encountered a network connection error. Displaying fully detailed offline news archives."
      );
    } finally {
      setIsLoading(false);
      sessionStorage.removeItem('campusai_sync_in_progress'); // ← Always release so next sync can run
    }
  }, [user, isLoading, loadLocalNews, onLoginRequest]);

  // ── Smart online fact-check search ─────────────────────────────────────────
  // FIX: Optimistic update so the article appears immediately. Then we wait
  // 1.2 s for Firestore to commit before reloading from the server, avoiding
  // the race condition where loadLocalNews ran before the write completed.

  const handleSmartSearchOnline = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSmartSearching(true);
    setSmartSearchResult(null);
    try {
      const result = await smartSearchAndVerifyNews(searchQuery);
      if (result.verified && result.article) {
        // Ensure isLive is set before archiving
        const article: NewsItem = { ...result.article, isLive: true };

        setNewlySyncedIds(prev => {
          const next = new Set(prev);
          next.add(article.id);
          return next;
        });

        // Optimistic update — user sees the article immediately
        setNewsList(prev => {
          const alreadyExists = prev.some(n => n.id === article.id);
          if (alreadyExists) return prev;
          return [article, ...prev];
        });
        setTotalArchivedCount(prev => prev + 1);

        // Persist to Firestore
        await archiveNewsItems([article]);

        // Brief wait for Firestore write to propagate before re-fetching
        await new Promise(resolve => setTimeout(resolve, 1200));
        await loadLocalNews();

        setSmartSearchResult({ searched: true, verified: true, query: searchQuery, article });

        triggerBrowserNotification(
          `✅ Verified Intelligence: ${article.title}`,
          article.excerpt,
          article.slug || slugify(article.title)
        );

        autoOpenTimerRef.current = setTimeout(() => onReadArticle(article), 1000);
      } else {
        setSmartSearchResult({
          searched: true, verified: false, query: searchQuery,
          reason: result.reason || "We searched official indexes but found no verified information regarding this update."
        });
      }
    } catch (e: any) {
      console.error("Smart Search error:", e);
      setSmartSearchResult({
        searched: true, verified: false, query: searchQuery,
        reason: "Search rate-limits exceeded or AI API credentials are stale. Please configure active keys in the Admin Panel."
      });
    } finally {
      setIsSmartSearching(false);
    }
  }, [searchQuery, onReadArticle, loadLocalNews]);

  // ── Notification permission ─────────────────────────────────────────────────

  const requestFeedPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("System notifications are not supported in your browser/device."); return;
    }
    try {
      const resp = await Notification.requestPermission();
      setNotifPermission(resp);
      if (resp === 'granted') {
        triggerBrowserNotification("🔔 Alerts Activated!", "You will now receive verified JAMB, UTME, and strike updates.");
      } else {
        alert("Permission denied. Please click the site settings icon in your address bar to manually allow notifications.");
      }
    } catch (e) { console.error("Notification permission error:", e); }
  };

  // ── Bookmark toggle ─────────────────────────────────────────────────────────

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const updated = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      writeBookmarks(updated);
      window.dispatchEvent(new Event('campusai_bookmarks_updated'));
      return updated;
    });
  }, []);

  const handleEditNews = (news: NewsItem) => {
    setEditingNews(news);
    setIsEditModalOpen(true);
  };

  const handleDeleteNews = async (news: NewsItem) => {
    if (!window.confirm(`Are you sure you want to delete "${news.title}"? This action cannot be undone.`)) return;
    
    try {
      await deleteNewsUpdate(news.id);
      setNewsList(prev => prev.filter(n => n.id !== news.id));
      logUserActivity({
        userId: user?.uid || '',
        type: 'profile_update',
        title: 'News Article Deleted',
        description: `Deleted article: ${news.title}`
      });
    } catch (err) {
      console.error("Failed to delete news:", err);
      alert("Failed to delete article. Please try again.");
    }
  };

  const handleSaveEditedNews = async (updates: Partial<NewsItem>) => {
    if (!editingNews) return;
    try {
      await updateNewsItem(editingNews.id, updates);
      setNewsList(prev => prev.map(n => n.id === editingNews.id ? { ...n, ...updates } : n));
      window.dispatchEvent(new Event('campusai_news_updated'));
      logUserActivity({
        userId: user?.uid || '',
        type: 'profile_update',
        title: 'News Article Updated',
        description: `Updated article: ${editingNews.title}`
      });
    } catch (err) {
      console.error("Failed to update news:", err);
      throw err;
    }
  };

  // ── Initial load + 12-hour cycle ───────────────────────────────────────────

  // Initial mount auto-sync check (runs only once per user session)
  useEffect(() => {
    if (!user) return;
    const checkCycle = () => {
      const last = parseInt(localStorage.getItem('campusai_last_auto_sync_ts') || '0');
      if (Date.now() - last > TWELVE_HOURS_MS) handleSyncLiveNews(true);
    };

    checkCycle();
    const interval = setInterval(checkCycle, 10 * 60_000); // Check cycle every 10 minutes

    if (localStorage.getItem('campusai_sync_on_refresh') !== 'false') {
      handleSyncLiveNews(true);
    }

    return () => clearInterval(interval);
  }, [user?.uid]);

  // Fast category filter load & event listeners
  useEffect(() => {
    loadLocalNews(filter);

    const handleBookmarksUpdate = () => {
      setBookmarks(readBookmarks());
    };
    
    const handleNewsUpdate = () => {
      // If a search is currently active, re-fetch the larger search pool
      loadLocalNews(filter, searchQueryRef.current.trim().length > 0 ? 1000 : undefined);
    };

    window.addEventListener('campusai_news_updated', handleNewsUpdate);
    window.addEventListener('campusai_bookmarks_updated', handleBookmarksUpdate);
    return () => {
      window.removeEventListener('campusai_news_updated', handleNewsUpdate);
      window.removeEventListener('campusai_bookmarks_updated', handleBookmarksUpdate);
    };
  }, [filter, loadLocalNews]);

  // ── Filtered / sorted news list ─────────────────────────────────────────────

  const filteredNews = useMemo(() => {
    if (!newsList.length) return [];

    let sortedList = [...newsList].sort((a, b) => sortNewsBySyncAndDate(a, b));

    if (filter === 'Hot') {
      return [...sortedList].sort((a, b) => getHotIndexScore(b) - getHotIndexScore(a));
    }

    let base = sortedList.filter(item => {
      const catMatch =
        filter === 'All' || filter === 'Latest' ? true :
        filter === 'Bookmarks' ? bookmarks.includes(item.id) :
        item.category === filter;

      const searchMatch =
        !searchQuery.trim() ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.fullContent && item.fullContent.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

      return catMatch && searchMatch;
    });

    return base.sort((a, b) => sortNewsBySyncAndDate(a, b));
  }, [newsList, filter, bookmarks, searchQuery, user?.role]);

  // ── Mini preview mode ───────────────────────────────────────────────────────

  if (isMiniPreview) {
    return (
      <section id="news" className="py-12 relative z-10 news-grid border-t border-gray-100 dark:border-gray-800/40">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 dark:bg-blue-500/5 rounded-full border border-blue-500/20 text-[9px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest select-none">
            <Newspaper size={11} className="animate-pulse" /> Verified Nigeria Admissions Feed
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight max-w-xl mx-auto">
            Latest Admissions News & <span className="text-cyan-400">Urgent Alerts</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-xs max-w-md mx-auto leading-relaxed">
            Real-time verified reports on JAMB directives, post-UTME updates, tuition agreements, and institutional strikes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredNews.slice(0, 4).map((news, index) => {
            const rel = getRelevantCategories(user?.role);
            return (
              <NewsCard
                key={`${news.id}-${index}`}
                news={news}
                onRead={() => onReadArticle(news)}
                onDiscuss={() => handleDiscussAi(news)}
                isBookmarked={bookmarks.includes(news.id)}
                isRelevant={rel.includes(news.category)}
                onToggleBookmark={toggleBookmark}
                isAdmin={user?.email === 'eiweh123@gmail.com'}
                onEdit={() => handleEditNews(news)}
                onDelete={() => handleDeleteNews(news)}
              />
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => { window.scrollTo(0, 0); navigate('/news'); }}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Open Full News & Updates Portal ({totalArchivedCount}+ Reports) <ArrowRight size={14} />
          </button>
        </div>
      </section>
    );
  }

  // ── Full news page ──────────────────────────────────────────────────────────

  return (
    <section id="news" className="py-12 relative z-10 news-grid">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-12 gap-8">
        <div className="space-y-4 max-w-xl">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
            Campus Updates <br />
            <span className="text-cyan-400 font-black tracking-tight">(2026 Cycle)</span>
          </h2>

          <div className="flex flex-col gap-2.5">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-black/10 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-full w-fit shadow-sm">
              <Box size={16} className="text-cyan-400" />
              <span className="text-sm font-black dark:text-white uppercase tracking-widest">{totalArchivedCount}+ ARCHIVED</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full w-fit">
              <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isLoading ? 'animate-ping' : ''}`} />
              <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-500/80 tracking-widest">
                CLOUD ARCHIVE ACTIVE {lastAutoSyncTime && `• SYNCED ${lastAutoSyncTime.toUpperCase()}`}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit">
              <Calendar size={11} className="text-cyan-500" />
              <span className="text-[9px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-widest">
                TODAY IS {getNigerianDateDisplay()}
              </span>
            </div>

            {notifPermission !== 'granted' ? (
              <button onClick={requestFeedPermission} className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full w-fit text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">
                <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '4s' }} />
                Enable Browser Push Alerts
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">
                <ShieldCheck size={10} /> OS Push Alerts Active
              </div>
            )}

            {user?.email === 'eiweh123@gmail.com' && (
              <button 
                  onClick={() => handleSyncLiveNews(false)} 
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-full w-fit text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} />
                {isLoading ? "Syncing..." : "Sync Live News"}
              </button>
            )}

            {usagePercent > 70 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/5 border border-orange-500/10 rounded-full w-fit">
                <Activity size={10} className="text-orange-500" />
                <span className="text-[9px] font-black uppercase text-orange-600 tracking-widest">
                  Signal Capacity: {100 - Math.round(usagePercent)}% Remaining
                </span>
              </div>
            )}
          </div>

          <p className="text-gray-500 dark:text-gray-400 font-bold text-lg mt-6">
            Investigative reports for the Nigerian scholar journey.
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSmartSearchResult(null); }}
              className="w-full pl-10 pr-16 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
            />
            {searchQuery.trim() && (
              <button
                onClick={handleSmartSearchOnline}
                disabled={isSmartSearching}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[8px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest hover:underline bg-white/90 dark:bg-gray-800/90 py-1 px-1.5 rounded-lg border border-gray-100 dark:border-gray-700"
                title="Launch dynamic AI Fact-check Online"
              >
                <Sparkles size={9} className={isSmartSearching ? "animate-spin" : "animate-pulse"} style={{ animationDuration: isSmartSearching ? '1.5s' : '3s' }} />
                {isSmartSearching ? 'Checking' : 'Fact Check'}
              </button>
            )}
          </div>

          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar w-full sm:max-w-md">
            <button onClick={() => setFilter('Hot' as any)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'Hot' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-orange-500'}`}>
              <Flame size={11} /> Hot
            </button>
            <button onClick={() => setFilter('Latest' as any)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'Latest' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-cyan-500'}`}>
              <Timer size={11} /> Latest
            </button>
            <div className="w-px bg-gray-100 dark:bg-gray-700 mx-1 my-1.5 shrink-0" />
            {['All', 'Federal', 'State', 'Private', 'JAMB', 'Polytechnic', 'COE', 'National', 'Jobs', 'Scholarships', 'NYSC', 'Bookmarks'].map(cat => (
              <button key={cat} onClick={() => setFilter(cat as any)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-blue-600'}`}>
                {cat}
              </button>
            ))}
          </div>


        </div>
      </div>

      {/* Active filter badge */}
      {(filter === 'Hot' || filter === 'Latest') && (
        <div className={`mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${filter === 'Hot' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'}`}>
          {filter === 'Hot' ? <Flame size={12} /> : <Timer size={12} />}
          {filter === 'Hot' ? 'Showing trending & high-interest reports' : 'Showing most recent reports first'}
        </div>
      )}

      {/* Sync error */}
      {syncError && (
        <div className="mb-8 p-5 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-3xl text-xs space-y-2 font-bold leading-relaxed shadow-lg">
          <p className="flex items-center gap-2">⚠️ {syncError}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-normal">
            Displaying fully detailed offline news archives. Core calculation logic is operating completely locally and stays 100% functional!
          </p>
        </div>
      )}

      {/* Cards grid */}
      {isLocalLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-[32px] p-6 h-96 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-1/3" />
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-5/6" />
                </div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-full mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredNews.slice(0, visibleCount).map((news, index) => {
            const rel = getRelevantCategories(user?.role);
            return (
              <NewsCard
                key={`${news.id}-${index}`}
                news={news}
                onRead={() => onReadArticle(news)}
                onDiscuss={() => handleDiscussAi(news)}
                isBookmarked={bookmarks.includes(news.id)}
                isRelevant={rel.includes(news.category)}
                onTagClick={tag => setSearchQuery(tag)}
                onToggleBookmark={toggleBookmark}
                isAdmin={user?.email === 'eiweh123@gmail.com'}
                onEdit={() => handleEditNews(news)}
                onDelete={() => handleDeleteNews(news)}
              />
            );
          })}
        </div>
      )}

      {/* Empty / searching states */}
      <AnimatePresence>
        {(filteredNews.length === 0 || isSmartSearching || (smartSearchResult && !smartSearchResult.verified)) && !isLoading && !isLocalLoading && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto py-16 text-center space-y-8">
            {isSmartSearching ? (
              <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-3xl p-8 space-y-6">
                <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-950/40 rounded-[24px] flex items-center justify-center mx-auto text-cyan-500">
                  <RefreshCw size={28} className="animate-spin text-cyan-500" style={{ animationDuration: '3s' }} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-500">Live Verification Agent Active</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">
                    Searching official portals for <span className="text-gray-900 dark:text-white">"{searchQuery}"</span>...
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-100/50 dark:bg-cyan-950/20 rounded-full text-[8.5px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-950">
                  <Globe size={11} className="animate-pulse" /> Scanning School Feeds
                </div>
              </div>
            ) : smartSearchResult && !smartSearchResult.verified ? (
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8 space-y-6">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/40 rounded-[24px] flex items-center justify-center mx-auto text-rose-500">
                  <ShieldCheck size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-rose-500">Factcheck Report: Unverified Update</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-bold max-w-lg mx-auto leading-relaxed">{smartSearchResult.reason}</p>
                </div>
                <div className="flex justify-center gap-3">
                  <button onClick={() => { setSearchQuery(''); setSmartSearchResult(null); }} className="px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95">
                    Clear Search
                  </button>
                  <button onClick={() => setSmartSearchResult(null)} className="px-5 py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                    Dismiss
                  </button>
                </div>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-[32px] flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800">
                  <Box size={32} className="text-gray-300" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">No Matches in Internal Index</p>
                  <p className="text-xs text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">
                    This news isn't in your offline synchronization index. Let the AI agent scan live internet feeds directly?
                  </p>
                </div>
                {searchQuery.trim() ? (
                  <div className="space-y-4">
                    <button onClick={handleSmartSearchOnline} className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95">
                      <Sparkles size={12} className="animate-pulse" /> Launch Real-Time AI Factcheck
                    </button>
                    <div>
                      <button onClick={() => { setSearchQuery(''); setFilter('All'); }} className="text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 font-bold text-[9px] uppercase underline tracking-widest">
                        or reset search criteria
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setFilter('All')} className="text-blue-600 dark:text-cyan-400 font-black text-[10px] uppercase underline">
                    Reset Filter Radar
                  </button>
                )}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load more */}
      {(!isLocalLoading && filteredNews.length > 0) && (
        <div className="mt-12 text-center pb-12">
          {filteredNews.length > visibleCount || hasMore ? (
            <button 
              onClick={() => {
                const nextVisible = visibleCount + REVEAL_STEP;
                setVisibleCount(nextVisible);
                if (hasMore && !isFetchingMore) {
                  fetchMoreNews(filter);
                }
              }} 
              disabled={isFetchingMore}
              className="inline-flex items-center gap-2 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-2 border-transparent rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-cyan-400 dark:hover:text-black transition-all cursor-pointer disabled:opacity-50 shadow-xl"
            >
              {isFetchingMore ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Fetching More Reports...
                </>
              ) : filteredNews.length > visibleCount ? (
                <>
                  Reveal More Articles ({filteredNews.length - visibleCount} in feed) <Plus size={16} />
                </>
              ) : (
                <>
                  Load Next Page from Cloud Archive <Plus size={16} />
                </>
              )}
            </button>
          ) : (
            <div className="text-gray-400 dark:text-gray-500 font-bold text-[10px] uppercase tracking-widest py-2">
              ✓ All {filteredNews.length} reports loaded from Archive
            </div>
          )}
        </div>
      )}

      <QuotaModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onUpgrade={() => { setIsQuotaModalOpen(false); window.dispatchEvent(new CustomEvent('campusai_open_payment')); }}
      />

      <NewsEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        news={editingNews}
        onSave={handleSaveEditedNews}
      />
    </section>
  );
};

export default NewsGrid;