import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Share2, Bookmark, ThumbsUp, ShieldCheck, Sparkles,
  User, Send, MessageSquare, Trash2, Loader2, LogIn, Check, RefreshCw,
  Wand2, Brain, Edit3, Zap
} from 'lucide-react';
import { NewsItem, Comment } from '../types';
import {
  fetchNewsComments, postNewsComment, deleteNewsComment,
  getNewsItemBySlug, updateNewsArticleContent, logUserActivity,
  deleteNewsUpdate, enhanceNewsArticleContent
} from '../services/dbService';
import { expandNewsArticle } from '../services/geminiService';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SEO from './SEO';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NewsCard } from './NewsGrid';

interface NewsDetailViewProps {
  news?: NewsItem;
  user: any;
  onClose: () => void;
  relatedNews: NewsItem[];
  onSelectRelated: (news: NewsItem) => void;
  onLoginRequest: () => void;
  isAdmin?: boolean;
}

const getFallbackDateStr = (item: NewsItem | null): string => {
  if (!item) return "";
  const dateStr = item.date ? item.date.trim() : "";
  const isBracketed = dateStr.includes("[") || dateStr.includes("]");
  if (dateStr && !isBracketed) return dateStr;
  
  const val = item.archivedAt || item.createdAt || item.updatedAt;
  let ms = 0;
  if (val) {
    if (typeof val.toMillis === 'function') ms = val.toMillis();
    else if (typeof val.toDate === 'function') ms = val.toDate().getTime();
    else if (typeof val === 'object') {
      if ('seconds' in val) ms = val.seconds * 1000;
      else if ('_seconds' in val) ms = val._seconds * 1000;
    }
    else if (typeof val === 'number') ms = val;
    else {
      const t = new Date(val).getTime();
      ms = isNaN(t) ? 0 : t;
    }
  }
  
  if (ms > 0) {
    return new Date(ms).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      timeZone: 'Africa/Lagos'
    });
  }
  return "RECENTLY";
};

const NewsDetailView: React.FC<NewsDetailViewProps> = ({
  news: initialNews, user, onClose, relatedNews, onSelectRelated, onLoginRequest, isAdmin
}) => {
  const { slug }    = useParams();
  const location    = useLocation();
  const navigate    = useNavigate();

  const [news, setNews]                   = useState<NewsItem | null>(initialNews || location.state?.article || null);
  const [comments, setComments]           = useState<Comment[]>([]);
  const [commentText, setCommentText]     = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isLoadingNews, setIsLoadingNews] = useState(!initialNews && !location.state?.article);
  const [isExpanding, setIsExpanding]     = useState(false);
  const [related, setRelated]             = useState<{ title: string; url: string }[]>([]);
  const [expansionError, setExpansionError] = useState<string | null>(null);
  const [isLiked, setIsLiked]             = useState(false);
  const [isBookmarked, setIsBookmarked]   = useState(false);
  const [bookmarksList, setBookmarksList] = useState<string[]>([]);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [isCleaning, setIsCleaning]       = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [localRelatedNews, setLocalRelatedNews] = useState<NewsItem[]>(relatedNews || []);
  const [restoreError, setRestoreError]   = useState<string | null>(null);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!news) return;
      try {
        const { getCloudNews } = await import('../services/dbService');
        const allNews = await getCloudNews(true);
        // Ensure we strictly exclude the CURRENT news item by ID and title
        const filtered = allNews
          .filter(n => n.id !== news.id && n.title !== news.title && n.category === news.category)
          .slice(0, 3);
        setLocalRelatedNews(filtered);
      } catch (err) {
        console.error("Related news fetch error:", err);
      }
    };
    
    fetchRelated();
  }, [news?.id, news?.category]); // news changes when slug changes or loadNews finishes

  const handleCleanRubbish = async () => {
    if (!news || isCleaning) return;
    setIsCleaning(true);
    try {
      const cleanContent = (news.fullContent || '')
        // New user-reported rubbish patterns
        .replace(/As a result of Admission into our institution, determined Additional Evidence of requirements following Eastern higher completion milestones.*/gi, '')
        .replace(/Minimum 135 year incorporating.*/gi, '')
        .replace(/Across R ment Collect be fur.*/gi, '')
        .replace(/Msd agreeing tweak validator.*/gi, '')
        .replace(/eromin \^ earliest.*/gi, '')
        .replace(/_ed promptly\)\$.*/gi, '')
        .replace(/Welcome outSteel apart.*/gi, '')
        .replace(/Candidate unconditional Pl age gorgeous.*/gi, '')
        .replace(/Timroduce web र DO not written hmm.*/gi, '')
        .replace(/html At trader injected trades Lil seats.*/gi, '')
        .replace(/Admission Requirements \( eromin \^ earliest.*/gi, '')
        .replace(/Kai wa Ọrganĩ Written Subject scores.*/gi, ' ')
        .replace(/Merchant Proficiency Photo List scores.*/gi, ' ')
        .replace(/pv lan commonly jointgroup positions.*/gi, ' ')
        .replace(/Quick Action Checklist for 2026\/2027 Post-UTME Candidates.*/gi, 'Quick Action Checklist for 2026/2027 Post-UTME Candidates')
        .replace(/ClassName|className|#html|lmore|Timroduce|hmm|il thereby|dan,K detox|\/|\\|:|\$|र| 준비|準備/gi, ' ')
        .replace(/[\u0370-\u03FF\u1F00-\u1FFF]/g, '')
        .replace(/\s\s+/g, ' ')
        .trim();

      await updateNewsArticleContent(news.id, cleanContent);
      setNews({ ...news, fullContent: cleanContent });
      setEditableContent(cleanContent);
      window.dispatchEvent(new Event('campusai_news_updated'));
      alert("✅ Article cleaned and saved successfully.");
    } catch (e) {
      alert("❌ Failed to clean article.");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleManualSave = async () => {
    if (!news || isCleaning) return;
    setIsCleaning(true);
    console.log("Saving news article...", news.id, editableContent);
    try {
      await updateNewsArticleContent(news.id, editableContent);
      console.log("Successfully saved news article.");
      setNews({ ...news, fullContent: editableContent });
      setIsEditing(false);
      window.dispatchEvent(new Event('campusai_news_updated'));
      alert("✅ Changes saved successfully.");
    } catch (e) {
      console.error("Failed to save changes:", e);
      alert("❌ Failed to save changes: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsCleaning(false);
    }
  };

  const startEditing = () => {
    setEditableContent(news?.fullContent || '');
    setIsEditing(true);
  };

  const handleDeleteArticle = async () => {
    if (!news) return;
    if (window.confirm("⚠️ Are you sure you want to permanently delete this news article? This action cannot be undone.")) {
      try {
        await deleteNewsUpdate(news.id);
        alert("✅ Article deleted successfully.");
        window.dispatchEvent(new Event('campusai_news_updated'));
        onClose();
        navigate('/');
      } catch (err) {
        console.error("Failed to delete article:", err);
        alert("❌ Failed to delete article.");
      }
    }
  };

  // ── Log activity when article is loaded ──────────────────────────────────
  useEffect(() => {
    if (!news) return;
    const readTime = Math.max(3, Math.ceil((news.fullContent || news.excerpt).split(' ').length / 200));
    logUserActivity({
      userId: user?.uid || '',
      type: 'news_read',
      title: news.title,
      description: `Read article: ${news.title}`,
      metadata: { readTime }
    });
  }, [news?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch article by slug if not passed via props/state ───────────────────
  const loadNews = useCallback(async () => {
    if (!slug) return;
    setIsLoadingNews(true);
    try {
      const data = await getNewsItemBySlug(slug);
      setNews(data);
    } finally {
      setIsLoadingNews(false);
    }
  }, [slug]);

  const handleRetrySync = async () => {
    if (!slug) return;
    
    setIsLoadingNews(true);
    setRestoreError(null);
    try {
      // Step 1: Normal Sync Attempt
      const data = await getNewsItemBySlug(slug);
      if (data) {
        setNews(data);
        setIsLoadingNews(false);
        return;
      }
      
      // Step 2: Seamless Background Reconstruction if missing from DB
      const formattedQuery = slug
        .split('-')
        .map(word => {
          const wLower = word.toLowerCase();
          if (['ae', 'funai', 'jamb', 'utme', 'post', 'oau', 'lasu', 'unn', 'unilag', 'unilorin', 'ui', 'nuc', 'waec'].includes(wLower)) {
            return word.toUpperCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');

      const { smartSearchAndVerifyNews } = await import('../services/geminiService');
      const { publishNewsUpdate } = await import('../services/dbService');

      const result = await smartSearchAndVerifyNews(formattedQuery);
      if (result.verified && result.article) {
        const newArticle = result.article;
        newArticle.slug = slug;
        
        const docId = await publishNewsUpdate(newArticle);
        const savedArticle = { ...newArticle, id: docId };
        
        setNews(savedArticle);
        window.dispatchEvent(new Event('campusai_news_updated'));
      } else {
        setRestoreError("The official database connection timed out. Please try again to synchronize this report.");
      }
    } catch (err: any) {
      console.error("Seamless sync error:", err);
      setRestoreError("A synchronization error occurred. Please verify your connection and try again.");
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    if (slug) {
      setNews(null); // Clear state to show loader and reset related news
      loadNews();
    }

    // Listen for global news updates (from Admin Panel)
    const handleNewsUpdated = () => {
      if (slug) loadNews();
    };
    window.addEventListener('campusai_news_updated', handleNewsUpdated);
    return () => {
      window.removeEventListener('campusai_news_updated', handleNewsUpdated);
    };
  }, [slug, loadNews]);

  // ── Load comments + bookmark state when article id is available ───────────
  const loadComments = useCallback(async (newsId: string) => {
    setIsLoadingComments(true);
    try {
      const data = await fetchNewsComments(newsId);
      setComments(data);
    } finally {
      setIsLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    if (!news) return;
    loadComments(news.id);

    // Restore bookmark state
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('campusai_bookmarks') || '[]');
      setIsBookmarked(saved.includes(news.id));
      setBookmarksList(saved);
    } catch {}

    // Related links
    if (news.relatedNews?.length) setRelated(news.relatedNews);
  }, [news?.id, loadComments]);

  useEffect(() => {
    const handleBookmarksUpdated = () => {
      try {
        const saved: string[] = JSON.parse(localStorage.getItem('campusai_bookmarks') || '[]');
        setBookmarksList(saved);
        if (news) {
          setIsBookmarked(saved.includes(news.id));
        }
      } catch {}
    };
    window.addEventListener('campusai_bookmarks_updated', handleBookmarksUpdated);
    return () => {
      window.removeEventListener('campusai_bookmarks_updated', handleBookmarksUpdated);
    };
  }, [news]);

  // ── Bookmark toggle ───────────────────────────────────────────────────────
  const toggleBookmarkForId = useCallback((targetId: string) => {
    try {
      const current: string[] = JSON.parse(localStorage.getItem('campusai_bookmarks') || '[]');
      const updated = current.includes(targetId)
        ? current.filter(i => i !== targetId)
        : [...current, targetId];
      localStorage.setItem('campusai_bookmarks', JSON.stringify(updated));
      setBookmarksList(updated);
      if (news && targetId === news.id) {
        setIsBookmarked(updated.includes(news.id));
      }
      window.dispatchEvent(new Event('campusai_bookmarks_updated'));
    } catch (e) {
      console.error("Bookmark save error:", e);
    }
  }, [news]);

  const handleToggleBookmark = useCallback(() => {
    if (!news) return;
    toggleBookmarkForId(news.id);
  }, [news, toggleBookmarkForId]);

  // ── AI article expansion ──────────────────────────────────────────────────
  const handleExpandArticle = useCallback(async () => {
    if (!news || isExpanding) return;
    setIsExpanding(true);
    setExpansionError(null);
    try {
      let expanded: string | null = null;
      try {
        console.log("Attempting server-side article enhancement...");
        expanded = await enhanceNewsArticleContent(news.id);
      } catch (backendError) {
        console.warn("Server-side enhancement failed, falling back to client-side:", backendError);
        expanded = await expandNewsArticle(news);
      }

      if (expanded) {
        setNews({ ...news, fullContent: expanded });
        setEditableContent(expanded);
        window.dispatchEvent(new Event('campusai_news_updated'));
        alert("✅ Article enhanced and saved successfully.");
      } else {
        setExpansionError("Unable to expand the article. The news service might be facing high traffic.");
      }
    } catch (e: any) {
      const isQuota = e?.message?.toLowerCase().match(/quota|429|limit|exhausted/) || e?.status === 'RESOURCE_EXHAUSTED';
      setExpansionError(isQuota
        ? "Our AI News Sync engine is currently at maximum capacity (Google Gemini rate limit)."
        : "Expansion failed due to network limits. Please try again later."
      );
    } finally {
      setIsExpanding(false);
    }
  }, [news, isExpanding]);

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (!news) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: news.title, text: news.excerpt, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  }, [news]);

  // ── Comment submit ────────────────────────────────────────────────────────
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onLoginRequest(); return; }
    if (!commentText.trim() || isSubmitting || !news) return;

    setIsSubmitting(true);
    try {
      const newComment = await postNewsComment({
        newsId: news.id,
        uid: user.uid,
        displayName: user.displayName || 'Scholar',
        photoURL: user.photoURL,
        text: commentText.trim(),
      });
      if (newComment) {
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
      } else {
        alert("Failed to sync comment with cloud database.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Comment delete ────────────────────────────────────────────────────────
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Permanently delete this comment?")) return;
    const success = await deleteNewsComment(commentId);
    if (success) setComments(prev => prev.filter(c => c.id !== commentId));
  };

  // ── Loading / not found states ────────────────────────────────────────────
  if (isLoadingNews) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <p className="text-sm font-black uppercase tracking-widest text-gray-400">Decrypting Intelligence...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-6">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-[32px] flex items-center justify-center text-gray-400">
          <ShieldCheck size={40} />
        </div>
        <div className="text-center max-w-lg">
          <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight mb-2">Intelligence Not Found</h2>
          <p className="text-gray-500 font-bold">The requested report does not exist or has been archived.</p>
          <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-widest">Slug: {slug}</p>
        </div>

        {restoreError && (
          <div className="max-w-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-center">
            <p className="text-xs text-red-600 dark:text-red-400 font-bold">⚠️ {restoreError}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => navigate('/')} className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
            Return to Feed
          </button>
          <button 
            onClick={handleRetrySync} 
            className="px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            <RefreshCw size={14} /> 
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  const readTime = Math.max(3, Math.ceil((news.fullContent || news.excerpt).split(' ').length / 200));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="bg-white dark:bg-gray-950 min-h-screen w-full overflow-x-hidden"
    >
      <SEO 
        title={news.title} 
        description={news.excerpt} 
        article={true} 
        originalSource={news.sourceUrl || "https://jamb.gov.ng"}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-0">

        {/* Back button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 mb-12 py-4 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft size={16} /> Return to Intelligence Feed
        </button>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{news.category}</span>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={12} /> {readTime} MIN READ
          </span>
          {news.sourceUrl && (
            <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="ml-4 hover:underline text-blue-800 text-[10px] font-black uppercase tracking-widest break-all">
              Source
            </a>
          )}
        </div>

        <h1 className="text-3xl md:text-[34px] font-bold text-[#2a3c5a] dark:text-white mb-5 leading-[1.3] tracking-tight">
          {news.title}
        </h1>

        {/* Social Share Row */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#4267B2] text-white hover:opacity-80 transition-opacity" title="Share on Facebook">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href={`fb-messenger://share?link=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#00B2FF] text-white hover:opacity-80 transition-opacity" title="Share on Messenger">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.018 0 11.205c0 3.523 1.764 6.643 4.498 8.706V24l4.1-2.256c1.077.295 2.22.457 3.402.457 6.627 0 12-5.018 12-11.205C24 5.018 18.627 0 12 0zm1.22 14.887l-3.136-3.344-6.136 3.344 6.726-7.142 3.195 3.342 6.074-3.342-6.723 7.142z"/></svg>
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-md bg-black text-white hover:opacity-80 transition-opacity" title="Share on X">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
          </a>
          <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(news.title + " " + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-80 transition-opacity" title="Share on WhatsApp">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0077B5] text-white hover:opacity-80 transition-opacity" title="Share on LinkedIn">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href={`https://reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(news.title)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FF4500] text-white hover:opacity-80 transition-opacity" title="Share on Reddit">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.275-1.866.729-1.424-1.012-3.372-1.644-5.532-1.73l1.18-5.524 3.791.803c.032 1.053.901 1.899 1.968 1.899 1.085 0 1.968-.876 1.968-1.956 0-1.077-.883-1.954-1.968-1.954-.852 0-1.58.541-1.852 1.306l-4.22-.897a.475.475 0 0 0-.547.369l-1.31 6.136c-2.228.06-4.246.687-5.711 1.714-.505-.461-1.164-.741-1.888-.741-1.464 0-2.656 1.186-2.656 2.645 0 .963.53 1.8 1.308 2.275-.021.206-.036.417-.036.634 0 3.844 4.542 6.969 10.134 6.969s10.134-3.125 10.134-6.969c0-.214-.015-.422-.034-.627.766-.481 1.288-1.311 1.288-2.268zm-16.745 2.115c0-.853.696-1.545 1.554-1.545.857 0 1.554.692 1.554 1.545 0 .851-.697 1.544-1.554 1.544-.858 0-1.554-.693-1.554-1.544zm9.356 5.163c-1.284 1.28-3.415 1.285-4.526 1.285-1.111 0-3.246-.005-4.53-1.285a.473.473 0 0 1 .669-.667c.883.882 2.628 1.002 3.861 1.002 1.231 0 2.978-.12 3.86-.998a.471.471 0 1 1 .666.663zm-.407-3.619c-.858 0-1.554-.693-1.554-1.544 0-.853.696-1.545 1.554-1.545.856 0 1.553.692 1.553 1.545 0 .851-.697 1.544-1.553 1.544z"/></svg>
          </a>
          <div className="flex items-center gap-1.5 ml-2 cursor-pointer" onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <MessageSquare size={20} className="text-gray-900 dark:text-gray-300" />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-300">{comments.length}</span>
          </div>
        </div>

        {/* Author / actions row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 mb-12">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-600 dark:text-gray-400">
             <Clock size={14} className="shrink-0" />
             <span>Published {getFallbackDateStr(news)}</span>
             <span className="mx-1"></span>
             <User size={14} className="shrink-0" />
             <span>By <span className="text-[#0eb38c] font-bold">Emmanuel Iweh</span></span>
             <span className="mx-1"></span>
             <span className="flex items-center gap-1.5">
               <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
               3 min read
             </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-xl transition-all active:scale-75 ${isLiked ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 hover:text-blue-600'}`}
            >
              <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl transition-all active:scale-75 ${isBookmarked ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 hover:text-blue-600'}`}
            >
              <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Quick Intelligence Actions */}
        {user && (
          <div className={`mb-10 p-6 rounded-[40px] border flex flex-col md:flex-row items-center justify-between gap-4 ${isAdmin ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${isAdmin ? 'bg-amber-500' : 'bg-blue-500'}`}>
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className={`text-sm font-black uppercase tracking-widest ${isAdmin ? 'text-amber-900 dark:text-amber-300' : 'text-blue-900 dark:text-blue-300'}`}>
                  {isAdmin ? 'Admin Intelligence' : 'AI Assistant'}
                </h4>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isAdmin ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {isAdmin ? (isEditing ? "Manual Editing Active" : "Manage content with AI or edit manually.") : "Get a deeper summary and candidate checklist."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!isEditing ? (
                <>
                  {isAdmin && (
                    <button
                      onClick={handleCleanRubbish}
                      disabled={isCleaning}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isCleaning ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                      {isCleaning ? "Scrubbing..." : "Scrub Rubbish"}
                    </button>
                  )}
                  <button
                    onClick={handleExpandArticle}
                    disabled={isExpanding}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isExpanding ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                    {isExpanding ? "Expanding..." : "Enhance Article"}
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={startEditing}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        <Edit3 size={14} />
                        Edit Manually
                      </button>
                      <button
                        onClick={handleDeleteArticle}
                        className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                      >
                        <Trash2 size={14} />
                        Delete Article
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleManualSave}
                    disabled={isCleaning}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isCleaning ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                    {isCleaning ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Article body */}
        <article className="prose prose-xl max-w-full overflow-hidden dark:prose-invert break-words">
          {news.excerpt && !isEditing && (
            <p className="text-xl md:text-2xl text-gray-900 dark:text-white leading-relaxed font-black mb-10 italic border-l-4 border-blue-600 pl-6 py-2">
              "{news.excerpt}"
            </p>
          )}

          {expansionError && !isEditing && (
            <div className="mb-8 p-5 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-3xl text-sm space-y-2 font-bold leading-relaxed shadow-lg">
              <p className="flex items-center gap-2">⚠️ {expansionError}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-normal">
                Displaying offline news archives. Core calculation logic is 100% functional.
              </p>
            </div>
          )}

          {!news.fullContent && !isExpanding && !isEditing && (
            <div className="mb-10 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest mb-1">Deep Dive Available</h4>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Our AI can rewrite this summary into a detailed, comprehensive article for you.</p>
              </div>
              <button
                onClick={handleExpandArticle}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Wand2 size={14} /> Expand with AI
              </button>
            </div>
          )}

          {isExpanding && (
            <div className="mb-10 p-8 bg-gray-50 dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Generating High-Quality Article...</h4>
                <p className="text-xs font-bold text-gray-500">Connecting to JAMB Strategist Intelligence Core...</p>
              </div>
            </div>
          )}

          <div className="markdown-body text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium select-text pointer-events-auto">
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full h-[600px] p-8 bg-gray-50 dark:bg-gray-900 rounded-[40px] border-2 border-blue-100 dark:border-blue-900 outline-none focus:border-blue-600 transition-all font-mono text-base leading-relaxed resize-none shadow-inner"
                  placeholder="Paste or write the article content here in Markdown format..."
                />
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  <Sparkles size={12} /> Markdown and formatting supported
                </div>
              </div>
            ) : news.fullContent ? (
              <Markdown remarkPlugins={[remarkGfm]}>{news.fullContent}</Markdown>
            ) : (
              <div className="py-12 border-2 border-dashed border-gray-100 dark:border-gray-900 rounded-[40px] text-center">
                <p className="text-gray-500 font-bold italic">
                  {isExpanding ? "Analyzing source data..." : "Detailed report is being synchronized. Standby for secondary analysis."}
                </p>
              </div>
            )}
          </div>
        </article>

        {/* Related links */}
        {related.length > 0 && (
          <div className="my-12">
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Article Resources:</h4>
            <div className="flex flex-wrap gap-3">
              {related.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Aggregate Calculator CTA */}
        <div className="my-16 p-8 bg-white dark:bg-gray-900 rounded-[40px] border-4 border-blue-600 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                <ShieldCheck size={12} /> Next Step Recommendation
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                Calculate your <span className="text-blue-600">Admission Aggregate</span>
              </h3>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 max-w-md">
                Based on this {news.category} update, check if your scores are enough to secure your preferred course.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate('/calculator');
              }}
              className="px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 flex items-center gap-3 transition-all active:scale-95 group"
            >
              Start Calculation <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Comments */}
        <section className="py-20 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black flex items-center gap-3 dark:text-white uppercase tracking-tight">
              <MessageSquare size={24} className="text-blue-600" /> Discussion Hub ({comments.length})
            </h3>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
              Live Sync Active
            </div>
          </div>

          <form onSubmit={handlePostComment} className="mb-16">
            {!user ? (
              <div onClick={onLoginRequest} className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800 text-center cursor-pointer group hover:border-blue-500 transition-all">
                <LogIn className="mx-auto mb-4 text-gray-400 group-hover:text-blue-500 transition-colors" size={32} />
                <p className="font-bold text-gray-600 dark:text-gray-400">Sign in to join the conversation</p>
                <p className="text-[10px] font-black uppercase text-blue-600 mt-2 tracking-widest">Connect Scholar Profile</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Share your thoughts or ask a question..."
                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-[32px] p-6 pr-16 outline-none font-bold dark:text-white min-h-[120px] transition-all resize-none shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmitting}
                    className="absolute bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
                <div className="flex items-center gap-2 px-4">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                    {user.photoURL && <img src={user.photoURL} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Posting as {user.displayName || 'Scholar'}
                  </span>
                </div>
              </div>
            )}
          </form>

          <div className="space-y-8">
            {isLoadingComments ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : comments.length > 0 ? (
              <AnimatePresence>
                {comments.map((comment, idx) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-4 group"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                      {comment.photoURL
                        ? <img src={comment.photoURL} className="w-full h-full object-cover" alt="" />
                        : <User size={20} className="text-gray-400" />}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs md:text-sm dark:text-white uppercase tracking-tight">{comment.displayName}</span>
                          {comment.uid === '5ej852963@gmail.com' && <ShieldCheck size={14} className="text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] font-bold text-gray-400 uppercase">
                            {comment.createdAt?.toDate?.() ? new Date(comment.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                          </span>
                          {user?.uid === comment.uid && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-4 md:p-5 bg-gray-50 dark:bg-gray-900 rounded-[24px] rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm">
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{comment.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center mx-auto text-gray-300">
                  <MessageSquare size={24} />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No discussions yet</p>
                <p className="text-xs text-gray-500">Be the first to share your intelligence on this update.</p>
              </div>
            )}
          </div>
        </section>

        <div className="pb-24 flex justify-center">
          <button onClick={onClose} className="px-12 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-3xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
            Close Report
          </button>
        </div>
        {/* Related News Section */}
        {localRelatedNews && localRelatedNews.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-900">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black">
                <RefreshCw size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Related Articles</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">More news you might be interested in</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localRelatedNews.slice(0, 3).map((item) => (
                <NewsCard
                  key={item.id}
                  news={item}
                  onRead={() => onSelectRelated(item)}
                  isBookmarked={bookmarksList.includes(item.id)}
                  onToggleBookmark={toggleBookmarkForId}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NewsDetailView;