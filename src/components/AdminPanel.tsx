import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  X, RefreshCw, Loader2, ShieldAlert, Newspaper, Users, User, Star,
  Brain, Activity, Check, ShieldCheck, Database, Zap, Trash2, Key,
  Globe, Clock, Eye, Sliders, Plus, Search, FileJson, Sparkles, Info,
  Smartphone, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminState, NewsItem, UserProfile, UserRole, UserActivity, UniversityCategory } from '../types';
import universityData from '../data/universities';
import {
  publishNewsUpdate, deleteNewsUpdate, purgeAllNews,
  archiveNewsItems, getTickerHeadlines, getCloudNews,
  getGlobalConfig, saveGlobalConfig, saveGlobalScoringSystem,
  getGlobalScoringSystem, getASUUStatusFromDB, saveASUUStatusToDB,
  updateGlobalSyncMetadata, updateNewsItem, getAllUserActivities,
  getTrafficStats, resetTrafficStats, purgeUserActivities,
  getAllCutoffOverrides, saveCutoffOverride, deleteCutoffOverride, CutoffOverride,
  getTestimonials, addTestimonial, deleteTestimonial, getFeedbackList
} from '../services/dbService';
import { fetchRecentUsers, getTotalUserCount, updateUserProfile, FREE_USER_LIMIT } from '../services/userService';
import { fetchLiveNews, getUniversityScoringSystem, getAPIKeysSummary, APIKeySummaryItem } from '../services/geminiService';
import { auth } from '../services/firebaseConfig';
import { getApiUrl } from '../services/utils';
import { SystemHealthStatus } from './SystemHealthStatus';

// ─── Nigerian timezone helpers ────────────────────────────────────────────────

const getNigerianDateStr = () =>
  new Date().toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric', timeZone: 'Africa/Lagos',
  });

const getNigerianMidnight = () => new Date(getNigerianDateStr()).getTime();

const toMs = (val: any): number => {
  if (!val) return 0;
  if (typeof val?.toMillis === 'function') return val.toMillis();
  if (typeof val?.toDate === 'function') return val.toDate().getTime();
  if (typeof val === 'object') {
    if ('seconds' in val) return val.seconds * 1000;
    if ('_seconds' in val) return val._seconds * 1000;
  }
  if (typeof val === 'number') return val;
  const t = new Date(val).getTime();
  return isNaN(t) ? 0 : t;
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminState;
  onAdminLogin: (email: string) => void;
  onAdminLogout: () => void;
  systemStatus?: { gemini: string; firebase: string };
}

// ─── Component ────────────────────────────────────────────────────────────────

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen, onClose, admin, onAdminLogin, onAdminLogout,
}) => {
  const SECRET_TOKEN = 'CAMPUS@2026';

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [loginToken, setLoginToken] = useState('');
  const [authFailed, setAuthFailed]   = useState(false);

  // ── Tab ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'infrastructure' | 'cutoffs' | 'content' | 'users' | 'notifications' | 'intelligence'
  >('analytics');

  // ── Intelligence (Testimonials & Feedback) ───────────────────────────────
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [isIntelligenceLoading, setIsIntelligenceLoading] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', content: '', rating: 5, school: '', isFeatured: true });

  // ── Departmental Cutoffs (Research & Overrides) ─────────────────────────────
  const [overrides, setOverrides] = useState<CutoffOverride[]>([]);
  const [overridesSearch, setOverridesSearch] = useState('');
  const [isOverridesLoading, setIsOverridesLoading] = useState(false);
  const [isSavingOverride, setIsSavingOverride] = useState(false);
  const [overridesError, setOverridesError] = useState('');
  const [overridesSuccess, setOverridesSuccess] = useState('');
  const [bulkJSONText, setBulkJSONText] = useState('');

  // New override form state
  const [newUniName, setNewUniName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newDeptCutoff, setNewDeptCutoff] = useState('');
  const [newInstCutoff, setNewInstCutoff] = useState('');
  const [newOverrideExplanation, setNewOverrideExplanation] = useState('');

  // ── Analytics ───────────────────────────────────────────────────────────────
  const [keySummaries, setKeySummaries]   = useState<APIKeySummaryItem[]>([]);
  const [allActivities, setAllActivities] = useState<UserActivity[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [trafficStats, setTrafficStats]   = useState({ pageViews: 0, uniqueVisitors: 0 });
  const [isResettingTraffic, setIsResettingTraffic] = useState(false);
  const [isPurgingLogs, setIsPurgingLogs] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  // ── Infrastructure ──────────────────────────────────────────────────────────
  const [geminiKey, setGeminiKey]   = useState('');
  const [geminiKey2, setGeminiKey2] = useState('');
  const [geminiKey3, setGeminiKey3] = useState('');
  const [newsKeyPref, setNewsKeyPref] = useState('auto');
  const [calcKeyPref, setCalcKeyPref] = useState('auto');
  const [developerPhoto, setDeveloperPhoto] = useState('');
  const [featureKeys, setFeatureKeys] = useState<Record<string, string>>({});
  const [flutterwaveKey, setFlutterwaveKey] = useState('');
  const [socialFacebook, setSocialFacebook]   = useState('');
  const [socialTwitter, setSocialTwitter]     = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialLinkedin, setSocialLinkedin]   = useState('');
  const [socialYoutube, setSocialYoutube]     = useState('');
  const [socialTiktok, setSocialTiktok]       = useState('');
  const [socialNairaland, setSocialNairaland] = useState('');
  const [socialWhatsapp, setSocialWhatsapp]   = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, currentUni: '' });

  // ── Content ─────────────────────────────────────────────────────────────────
  const [publishedNews, setPublishedNews] = useState<NewsItem[]>([]);
  const [showPostForm, setShowPostForm]   = useState(false);
  // ✅ FIX: newPost no longer stores a stale date — date is always computed fresh at publish time
  const [newPost, setNewPost] = useState<Partial<NewsItem>>({ category: 'National' });
  const [editingDateId, setEditingDateId]     = useState<string | null>(null);
  const [editedDateValue, setEditedDateValue] = useState('');

  // ── AI Blog Generator ────────────────────────────────────────────────────────
  const [showAIBlogForm, setShowAIBlogForm] = useState(false);
  const [aiBlogQuery, setAiBlogQuery] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiGeneratedPost, setAiGeneratedPost] = useState<{
    title: string;
    fullContent: string;
    category: string;
    excerpt: string;
  } | null>(null);
  const [aiSources, setAiSources] = useState<string[]>([]);

  // ── Users ───────────────────────────────────────────────────────────────────
  const [recentUsers, setRecentUsers]     = useState<UserProfile[]>([]);
  const [totalUserCount, setTotalUserCount] = useState(0);

  // ── Notifications ────────────────────────────────────────────────────────────
  const [asuuStatus, setAsuuStatus] = useState({
    isActive: false, status: 'No Strike', summary: '', lastUpdated: '',
  });

  // ── Shared loading — separated per concern to avoid conflicts ────────────────
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isUserLoading, setIsUserLoading]       = useState(false);

  // ── News Editing (Full Content) ─────────────────────────────────────────────
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isSavingNews, setIsSavingNews] = useState(false);

  const handleSanitizeContent = (content: string) => {
    if (!content) return '';
    return content
      // Remove specific rubbish patterns provided by the user
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
      // Remove generic AI artifacts and technical leakage
      .replace(/ClassName|className|#html|lmore|Timroduce|hmm|il thereby|dan,K detox|\/|\\|:|\$|र| 준비|準備/gi, ' ')
      .replace(/[\u0370-\u03FF\u1F00-\u1FFF]/g, '') // Remove Greek/Misc symbols
      .replace(/\s\s+/g, ' ')
      .trim();
  };

  const handleSaveNewsEdits = async () => {
    if (!editingNews) return;
    setIsSavingNews(true);
    try {
      await updateNewsItem(editingNews.id, {
        ...editingNews,
        updatedAt: new Date().toISOString() // Force timestamp update
      });
      
      // Refresh local list for immediate visual feedback in Admin Panel
      setPublishedNews(prev => prev.map(n => n.id === editingNews.id ? editingNews : n));
      
      // Clear cache and notify app
      window.dispatchEvent(new Event('campusai_news_updated'));
      window.dispatchEvent(new Event('campusai_news_sync'));
      
      setEditingNews(null);
      alert("✅ Article updated and persisted to Cloud successfully.");
    } catch (e) {
      console.error("Save failure:", e);
      alert("❌ Failed to save news edits. Please check your connection.");
    } finally {
      setIsSavingNews(false);
    }
  };

  // ── Loaders ─────────────────────────────────────────────────────────────────

  const reloadKeySummaries = useCallback(() => {
    setKeySummaries(getAPIKeysSummary());
  }, []);

  const loadAnalyticsData = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const [logs, stats] = await Promise.all([
        getAllUserActivities(500),
        getTrafficStats(),
      ]);
      setAllActivities(logs);
      if (stats) setTrafficStats(stats);
    } catch (e) {
      console.error("Analytics load error:", e);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const handleResetTraffic = useCallback(async () => {
    setIsResettingTraffic(true);
    try {
      await resetTrafficStats();
      await loadAnalyticsData();
      setShowResetConfirm(false);
    } catch (e) {
      console.error("Reset traffic error:", e);
    } finally {
      setIsResettingTraffic(false);
    }
  }, [loadAnalyticsData]);

  const handlePurgeLogs = useCallback(async () => {
    setIsPurgingLogs(true);
    try {
      await purgeUserActivities();
      await loadAnalyticsData();
      setShowPurgeConfirm(false);
    } catch (e) {
      console.error("Purge logs error:", e);
    } finally {
      setIsPurgingLogs(false);
    }
  }, [loadAnalyticsData]);

  const loadInitialData = useCallback(async () => {
    const config = await getGlobalConfig();
    if (config) {
      if (config.flutterwaveKey) setFlutterwaveKey(config.flutterwaveKey);
      if (config.geminiKey)      setGeminiKey(config.geminiKey);
      if (config.geminiKey2)     setGeminiKey2(config.geminiKey2);
      if (config.geminiKey3)     setGeminiKey3(config.geminiKey3);
      if (config.newsKeyPref)    setNewsKeyPref(config.newsKeyPref);
      if (config.calcKeyPref)    setCalcKeyPref(config.calcKeyPref);
      if (config.developerPhoto) setDeveloperPhoto(config.developerPhoto);
      if (config.featureKeys)    setFeatureKeys(config.featureKeys);
      if (config.socialLinks) {
        setSocialFacebook(config.socialLinks.facebook   || '');
        setSocialTwitter(config.socialLinks.twitter     || '');
        setSocialInstagram(config.socialLinks.instagram || '');
        setSocialLinkedin(config.socialLinks.linkedin   || '');
        setSocialYoutube(config.socialLinks.youtube     || '');
        setSocialTiktok(config.socialLinks.tiktok       || '');
        setSocialNairaland(config.socialLinks.nairaland || '');
        setSocialWhatsapp(config.socialLinks.whatsapp   || '');
      }
    }
    const [news, _, asuu] = await Promise.all([
      getCloudNews(true, true),
      getTickerHeadlines(),
      getASUUStatusFromDB(),
    ]);
    setPublishedNews(news);
    if (asuu) setAsuuStatus(asuu);
  }, []);

  const loadUsers = useCallback(async () => {
    setIsUserLoading(true);
    try {
      const [users, count] = await Promise.all([fetchRecentUsers(), getTotalUserCount()]);
      setRecentUsers(users);
      setTotalUserCount(Math.max(count, users.length));
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  // ── Effects — each concern loads independently, no double-fetch ──────────────

  useEffect(() => {
    if (!isOpen || !admin.isLoggedIn) return;
    loadInitialData();
    loadUsers();
    reloadKeySummaries();
  }, [isOpen, admin.isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load specific tab data when switching tabs
  const loadCutoffOverrides = useCallback(async () => {
    setIsOverridesLoading(true);
    setOverridesError('');
    setOverridesSuccess('');
    try {
      const data = await getAllCutoffOverrides();
      setOverrides(data);
    } catch (e: any) {
      console.error("Error loading cutoffs:", e);
      setOverridesError(e.message || "Failed to load cutoff overrides.");
    } finally {
      setIsOverridesLoading(false);
    }
  }, []);

  const handleSaveNewOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniName.trim() || !newCourseName.trim() || !newDeptCutoff.trim()) {
      setOverridesError("Institution name, Course, and Departmental Cutoff are required.");
      return;
    }

    setIsSavingOverride(true);
    setOverridesError('');
    setOverridesSuccess('');
    try {
      await saveCutoffOverride(
        newUniName.trim(),
        newCourseName.trim(),
        newDeptCutoff.trim(),
        newInstCutoff.trim(),
        newOverrideExplanation.trim()
      );
      setOverridesSuccess(`Successfully saved cutoff override for ${newCourseName} at ${newUniName}!`);
      setNewUniName('');
      setNewCourseName('');
      setNewDeptCutoff('');
      setNewInstCutoff('');
      setNewOverrideExplanation('');
      await loadCutoffOverrides();
    } catch (err: any) {
      console.error("Error saving override:", err);
      setOverridesError(err.message || "Failed to save override.");
    } finally {
      setIsSavingOverride(false);
    }
  };

  const handleDeleteOverride = async (institution: string, course: string) => {
    if (!window.confirm(`Are you sure you want to delete the cutoff override for ${course} at ${institution}?`)) {
      return;
    }
    setIsOverridesLoading(true);
    setOverridesError('');
    setOverridesSuccess('');
    try {
      await deleteCutoffOverride(institution, course);
      setOverridesSuccess("Override deleted successfully.");
      await loadCutoffOverrides();
    } catch (err: any) {
      console.error("Error deleting override:", err);
      setOverridesError(err.message || "Failed to delete override.");
    } finally {
      setIsOverridesLoading(false);
    }
  };

  const handleBulkJSONImport = async () => {
    if (!bulkJSONText.trim()) {
      setOverridesError("Please paste some JSON data before importing.");
      return;
    }

    setIsSavingOverride(true);
    setOverridesError('');
    setOverridesSuccess('');
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(bulkJSONText);
      } catch (jsonErr: any) {
        throw new Error(`Invalid JSON format: ${jsonErr.message}`);
      }

      if (!Array.isArray(parsed)) {
        throw new Error("Pasted JSON must be a list (Array) of objects.");
      }

      let importCount = 0;
      for (const item of parsed) {
        if (!item.institution || !item.course || !item.departmentalCutoff) {
          console.warn("Skipping item missing required fields:", item);
          continue;
        }
        await saveCutoffOverride(
          item.institution.trim(),
          item.course.trim(),
          String(item.departmentalCutoff).trim(),
          String(item.institutionalCutoff || "").trim(),
          String(item.explanation || "").trim()
        );
        importCount++;
      }

      setOverridesSuccess(`Successfully imported and updated ${importCount} cutoff rules!`);
      setBulkJSONText('');
      await loadCutoffOverrides();
    } catch (err: any) {
      console.error("Bulk import failed:", err);
      setOverridesError(err.message || "Failed to perform bulk import.");
    } finally {
      setIsSavingOverride(false);
    }
  };

  const loadIntelligenceData = useCallback(async () => {
    setIsIntelligenceLoading(true);
    try {
      const [t, f] = await Promise.all([getTestimonials(), getFeedbackList()]);
      setTestimonials(t);
      setFeedbackList(f);
    } catch (e) {
      console.error("Intelligence load error:", e);
    } finally {
      setIsIntelligenceLoading(false);
    }
  }, []);

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.content) return;
    setIsIntelligenceLoading(true);
    try {
      await addTestimonial(newTestimonial);
      setNewTestimonial({ name: '', role: '', content: '', rating: 5, school: '', isFeatured: true });
      await loadIntelligenceData();
    } finally {
      setIsIntelligenceLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm("Delete this testimonial?")) return;
    setIsIntelligenceLoading(true);
    try {
      await deleteTestimonial(id);
      await loadIntelligenceData();
    } finally {
      setIsIntelligenceLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !admin.isLoggedIn) return;
    if (activeTab === 'analytics') loadAnalyticsData();
    if (activeTab === 'cutoffs') loadCutoffOverrides();
    if (activeTab === 'intelligence') loadIntelligenceData();
    reloadKeySummaries();
  }, [activeTab, isOpen, admin.isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Content handlers ─────────────────────────────────────────────────────────

  const handleSyncLiveNews = async () => {
    setIsContentLoading(true);
    try {
      const liveData = await fetchLiveNews('eiweh123@gmail.com');
      if (liveData?.length) {
        await archiveNewsItems(liveData);
        await updateGlobalSyncMetadata(Date.now());
        setPublishedNews(await getCloudNews(true, true));
        
        // Dispatch global events so that active feeds on the main page immediately re-render
        window.dispatchEvent(new Event('campusai_news_updated'));
        window.dispatchEvent(new Event('campusai_news_sync'));
        
        alert(`Synced ${liveData.length} news items.`);
      }
    } finally { setIsContentLoading(false); }
  };

  const handlePurgeAllNews = async () => {
    if (!window.confirm('CRITICAL: Purge ALL stored news from the database?')) return;
    setIsContentLoading(true);
    try {
      const { purgeAllNews: purge } = await import('../services/dbService');
      await purge();
      setPublishedNews([]);
      alert('Feed purged. Run a fresh Global Sync to repopulate.');
    } catch (e) {
      alert('Failed to purge news feed.');
    } finally { setIsContentLoading(false); }
  };

  // ✅ FIX: Always call getNigerianDateStr() fresh at publish time — never use stale state date
  const handlePublishPost = async () => {
    if (!newPost.title) return;
    setIsContentLoading(true);
    try {
      const freshDate = getNigerianDateStr();
      await publishNewsUpdate({ ...newPost, date: freshDate, isImportant: false } as any);
      setShowPostForm(false);
      // ✅ FIX: Reset form fully so next open always starts clean
      setNewPost({ category: 'National' });
      setPublishedNews(await getCloudNews(true, true));
      
      // Dispatch update event globally to reload all feeds
      window.dispatchEvent(new Event('campusai_news_updated'));
      window.dispatchEvent(new Event('campusai_news_sync'));
    } finally { setIsContentLoading(false); }
  };

  const handleGenerateAIBlog = async () => {
    if (!aiBlogQuery.trim()) return;
    setIsAIGenerating(true);
    setAiGeneratedPost(null);
    setAiSources([]);
    try {
      const response = await axios.post(getApiUrl('/api/admin/generate-blog-post'), { query: aiBlogQuery });
      if (response.data && response.data.success) {
        setAiGeneratedPost(response.data.post);
        setAiSources(response.data.sources || []);
      } else {
        alert(response.data.error || "Failed to generate blog post.");
      }
    } catch (e: any) {
      console.error("AI Generation failed:", e);
      alert(e.response?.data?.error || "An error occurred during blog post generation.");
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handlePublishAIPost = async () => {
    if (!aiGeneratedPost || !aiGeneratedPost.title) return;
    setIsContentLoading(true);
    try {
      const freshDate = getNigerianDateStr();
      await publishNewsUpdate({
        title: aiGeneratedPost.title,
        fullContent: aiGeneratedPost.fullContent,
        category: aiGeneratedPost.category,
        excerpt: aiGeneratedPost.excerpt,
        date: freshDate,
        isImportant: false
      } as any);
      
      setAiGeneratedPost(null);
      setAiBlogQuery('');
      setAiSources([]);
      setShowAIBlogForm(false);
      
      setPublishedNews(await getCloudNews(true, true));
      
      // Dispatch update event globally to reload all feeds
      window.dispatchEvent(new Event('campusai_news_updated'));
      window.dispatchEvent(new Event('campusai_news_sync'));
      
      alert("Successfully published AI generated blog post!");
    } catch (e) {
      console.error("Failed to publish AI blog post:", e);
      alert("Failed to publish AI blog post to cloud.");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    await deleteNewsUpdate(id);
    setPublishedNews(prev => prev.filter(n => n.id !== id));
    
    // Dispatch update event globally to reload all feeds
    window.dispatchEvent(new Event('campusai_news_updated'));
    window.dispatchEvent(new Event('campusai_news_sync'));
  };

  const handleSaveDate = async (id: string) => {
    if (!editedDateValue) { setEditingDateId(null); return; }
    setIsContentLoading(true);
    try {
      await updateNewsItem(id, { date: editedDateValue });
      setPublishedNews(prev => prev.map(n => n.id === id ? { ...n, date: editedDateValue } : n));
      setEditingDateId(null);
    } finally { setIsContentLoading(false); }
  };

  const handleFixFutureDates = async () => {
    const todayStr      = getNigerianDateStr();
    const todayMidnight = getNigerianMidnight();
    const futureNews    = publishedNews.filter(n => {
      const t = new Date(n.date).getTime();
      return !isNaN(t) && t > todayMidnight;
    });

    if (!futureNews.length) { alert("No future dates detected."); return; }
    if (!window.confirm(`Reset ${futureNews.length} future-dated articles to ${todayStr}?`)) return;

    setIsContentLoading(true);
    try {
      for (const item of futureNews) await updateNewsItem(item.id, { date: todayStr });
      await loadInitialData();
      alert(`Successfully reset ${futureNews.length} dates.`);
    } finally { setIsContentLoading(false); }
  };

  const handleUpdateAsuu = async () => {
    setIsContentLoading(true);
    try {
      await saveASUUStatusToDB(asuuStatus);
      alert('Status updated.');
    } finally { setIsContentLoading(false); }
  };

  const handleSyncScoring = async () => {
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: universityData.length, currentUni: '' });
    for (let i = 0; i < universityData.length; i++) {
      const uni = universityData[i];
      setSyncProgress({ current: i + 1, total: universityData.length, currentUni: uni.name });
      const existing = await getGlobalScoringSystem(uni.slug);
      if (!existing) {
        const scoring = await getUniversityScoringSystem(uni.name);
        if (scoring) await saveGlobalScoringSystem(uni.slug, scoring);
      }
      await new Promise(r => setTimeout(r, 300));
    }
    setIsSyncing(false);
    alert('Scoring sync complete.');
  };

  const handleSaveConfig = async () => {
    const socialLinks = {
      facebook: socialFacebook, twitter: socialTwitter,
      instagram: socialInstagram, linkedin: socialLinkedin,
      youtube: socialYoutube, tiktok: socialTiktok,
      nairaland: socialNairaland, whatsapp: socialWhatsapp,
    };
    await saveGlobalConfig({ geminiKey, geminiKey2, geminiKey3, newsKeyPref, calcKeyPref, developerPhoto, flutterwaveKey, featureKeys, socialLinks });
    try {
      localStorage.setItem('campusai_social_links', JSON.stringify(socialLinks));
      if (geminiKey)      localStorage.setItem('campusai_gemini_key',   geminiKey);
      if (geminiKey2)     localStorage.setItem('campusai_gemini_key_2', geminiKey2);
      if (geminiKey3)     localStorage.setItem('campusai_gemini_key_3', geminiKey3);
      if (newsKeyPref)    localStorage.setItem('campusai_news_key_pref', newsKeyPref);
      if (calcKeyPref)    localStorage.setItem('campusai_calc_key_pref', calcKeyPref);
      if (developerPhoto) localStorage.setItem('campusai_developer_photo', developerPhoto);
      window.dispatchEvent(new Event('storage'));
    } catch {}
    alert('Config saved and applied.');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { if (typeof reader.result === 'string') setDeveloperPhoto(reader.result); };
    reader.readAsDataURL(file);
  };

  // ── Auth fail screen ──────────────────────────────────────────────────────────
  if (authFailed) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
        <div className="text-center space-y-4">
          <ShieldAlert size={64} className="text-red-500 mx-auto" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Authentication Failed</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-black">Invalid Security Key</p>
          <button
            onClick={() => { setAuthFailed(false); onAdminLogout(); onClose(); }}
            className="px-8 py-3 bg-white text-black rounded-xl font-black uppercase text-xs"
          >
            Reset & Exit
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  // ── Analytics computation (memoised inline) ───────────────────────────────────
  let totalCalculations = 0;
  let totalArticlesRead = 0;
  let totalReadingMinutes = 0;
  let totalInstalls = 0;
  const schoolCounts: Record<string, number> = {};
  const courseCounts: Record<string, number> = {};
  let helpfulCount = 0, unhelpfulCount = 0, admittedCount = 0, notAdmittedCount = 0;
  const uniqueActiveToday = new Set<string>();
  const oneDayAgo = Date.now() - 86_400_000;

  allActivities.forEach(act => {
    const desc = act.description || '';
    const ts = toMs(act.timestamp);
    if (ts > oneDayAgo) uniqueActiveToday.add(act.userId || act.id);

    if (act.type === 'news_read') {
      totalArticlesRead++;
      if (act.metadata?.readTime) {
        totalReadingMinutes += act.metadata.readTime;
      } else {
        totalReadingMinutes += 3; // Est. fallback for legacy logs
      }
    }
    if (act.type === 'install_click') {
      totalInstalls++;
    }
    if (act.type === 'calculation' || desc.includes('Calculated aggregate')) {
      totalCalculations++;
      const atIdx  = desc.indexOf(' at ');
      const forIdx = desc.indexOf(' for ');
      if (atIdx !== -1) {
        const school = desc.substring(atIdx + 4).trim();
        if (school) schoolCounts[school] = (schoolCounts[school] || 0) + 1;
      }
      if (forIdx !== -1 && atIdx !== -1 && atIdx > forIdx) {
        const course = desc.substring(forIdx + 5, atIdx).trim();
        if (course) courseCounts[course] = (courseCounts[course] || 0) + 1;
      }
    }
    if (desc.startsWith('FEEDBACK:')) {
      if (desc.includes('👍 Helpful'))   helpfulCount++;
      if (desc.includes('👎 Unhelpful')) unhelpfulCount++;
    } else if (desc.startsWith('OUTCOME:')) {
      if (desc.includes('🎉 Gained Admission')) admittedCount++;
      if (desc.includes('⏳ Not admitted'))      notAdmittedCount++;
    }
  });

  const topSchools = Object.entries(schoolCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topCourses = Object.entries(courseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const finalHelpful     = helpfulCount;
  const finalUnhelpful   = unhelpfulCount;
  const helpfulRatio     = (finalHelpful + finalUnhelpful) > 0 ? Math.round((finalHelpful / (finalHelpful + finalUnhelpful)) * 100) : 100;
  const finalAdmitted    = admittedCount;
  const finalNotAdmitted = notAdmittedCount;
  const admissionRatio   = (finalAdmitted + finalNotAdmitted) > 0 ? Math.round((finalAdmitted / (finalAdmitted + finalNotAdmitted)) * 100) : 100;
  const activeTodayCount = uniqueActiveToday.size;
  const grandCalculations = Math.max(totalCalculations, recentUsers.reduce((s, u) => s + (u.lifetime_calculations || 0), 0));
  const todayLagosStr     = getNigerianDateStr();
  const todayLagosMidnight = getNigerianMidnight();

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 w-full flex flex-col">

        {/* Header */}
        <div className="p-6 bg-gray-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-widest">Admin Console</h1>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Architect Level Access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Login form */}
        {!admin.isLoggedIn ? (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-[30px] flex items-center justify-center mx-auto">
              <Key size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-black dark:text-white">Secure Authentication Required</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (loginToken === SECRET_TOKEN) {
                  onAdminLogin(auth.currentUser?.email || 'eiweh123@gmail.com');
                } else {
                  setAuthFailed(true);
                }
              }}
              className="max-w-xs mx-auto space-y-4"
            >
              <input
                type="password"
                value={loginToken}
                onChange={e => setLoginToken(e.target.value)}
                placeholder="Security Token"
                className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl text-center font-mono text-gray-900 dark:text-white border-2 border-transparent focus:border-red-500 outline-none"
              />
              <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
                Authenticate
              </button>
            </form>
          </div>
        ) : (
          // ✅ FIX: replaced h-full with min-h-0 so this flex child can actually shrink
          // inside the max-h-[90vh] parent, which lets the content pane below scroll
          // instead of growing the whole modal past the viewport.
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950 shrink-0 overflow-x-auto">
              {(['analytics', 'infrastructure', 'cutoffs', 'content', 'intelligence', 'users', 'notifications'] as const).map(tab => (
                <button
                  key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-red-500' : 'text-gray-400'}`}
                >
                  {tab === 'intelligence' ? 'Intelligence' : tab}
                  {activeTab === tab && <motion.div layoutId="tab-admin" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />}
                </button>
              ))}
            </div>

            {/* Content */}
            {/* ✅ FIX: added min-h-0 here too — without it, a flex child with overflow-y-auto
                won't shrink below its content's natural height in some browsers, so the
                scrollbar never actually appears even though flex-1 + overflow-y-auto look right. */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 min-h-0">

              {/* ── ANALYTICS TAB ── */}
              {activeTab === 'analytics' && (
                <div className="space-y-8 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Activity size={14} className="text-red-500 animate-pulse" /> Sovereign Core Insights
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={loadAnalyticsData} disabled={analyticsLoading}
                        className="px-3 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-full text-[9px] font-black uppercase flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        {analyticsLoading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                        Reload Data
                      </button>

                      {!showResetConfirm ? (
                        <button
                          onClick={() => setShowResetConfirm(true)}
                          className="px-3 py-1 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-500 rounded-full text-[9px] font-black uppercase flex items-center gap-1 transition-all"
                        >
                          Reset Traffic
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-black/40 border border-cyan-500/20 p-1 rounded-full text-[9px] font-black uppercase">
                          <span className="text-cyan-400 pl-1">Confirm reset?</span>
                          <button
                            onClick={handleResetTraffic} disabled={isResettingTraffic}
                            className="bg-cyan-500 text-black px-2 py-0.5 rounded-full hover:bg-cyan-400 font-extrabold"
                          >
                            {isResettingTraffic ? '...' : 'Yes'}
                          </button>
                          <button onClick={() => setShowResetConfirm(false)} className="text-gray-400 px-2 py-0.5 hover:text-white">No</button>
                        </div>
                      )}

                      {!showPurgeConfirm ? (
                        <button
                          onClick={() => setShowPurgeConfirm(true)}
                          className="px-3 py-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-full text-[9px] font-black uppercase flex items-center gap-1 transition-all"
                        >
                          Purge Logs
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-black/40 border border-rose-500/20 p-1 rounded-full text-[9px] font-black uppercase">
                          <span className="text-rose-400 pl-1">Purge logs?</span>
                          <button
                            onClick={handlePurgeLogs} disabled={isPurgingLogs}
                            className="bg-rose-500 text-black px-2 py-0.5 rounded-full hover:bg-rose-400 font-extrabold"
                          >
                            {isPurgingLogs ? '...' : 'Yes'}
                          </button>
                          <button onClick={() => setShowPurgeConfirm(false)} className="text-gray-400 px-2 py-0.5 hover:text-white">No</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Total Calculations', value: grandCalculations, sub: 'Audits delivered to candidates', icon: <Zap size={14} className="text-red-500 dark:text-red-400" />, color: 'red' },
                      { label: 'Daily Actives (DAU)', value: activeTodayCount, sub: 'Active scholars in last 24h', icon: <Users size={14} className="text-blue-500 dark:text-blue-400" />, color: 'blue' },
                      { label: 'Global Database Directory', value: totalUserCount, sub: 'Registered scholar profiles', icon: <Database size={14} className="text-amber-500 dark:text-amber-400" />, color: 'amber' },
                    ].map(({ label, value, sub, icon, color }) => (
                      <div key={label} className={`p-6 bg-gradient-to-br from-${color}-500/10 to-${color}-500/5 border border-${color}-500/20 dark:border-${color}-500/10 rounded-3xl relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full blur-2xl -mr-4 -mt-4`} />
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-[9px] font-mono font-black text-${color}-600 dark:text-${color}-400 uppercase tracking-widest`}>{label}</span>
                          {icon}
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 font-mono uppercase">{sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 dark:border-cyan-500/10 rounded-3xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-4 -mt-4" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-mono font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Unique Site Visitors</span>
                        <Globe size={14} className="text-cyan-500 dark:text-cyan-400" />
                      </div>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{trafficStats.uniqueVisitors}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 font-mono uppercase">Total distinct scholars reached</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 rounded-3xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-4 -mt-4" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Page Views</span>
                        <Eye size={14} className="text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{trafficStats.pageViews}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 font-mono uppercase">Total pages loaded and read</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 dark:border-purple-500/10 rounded-3xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-4 -mt-4" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Articles Read (Total)</span>
                        <Newspaper size={14} className="text-purple-500 dark:text-purple-400" />
                      </div>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{totalArticlesRead}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 font-mono uppercase">Total cumulative articles read</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 dark:border-indigo-500/10 rounded-3xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-4 -mt-4" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Reading Time (Est.)</span>
                        <Clock size={14} className="text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">
                        {totalReadingMinutes >= 60 
                          ? `${Math.floor(totalReadingMinutes / 60)}h ${totalReadingMinutes % 60}m` 
                          : `${totalReadingMinutes}m`}
                      </p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 font-mono uppercase">Cumulative scholar attention span</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 dark:border-pink-500/10 rounded-3xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl -mr-4 -mt-4" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-mono font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest">App Installs (Clicks)</span>
                        <Smartphone size={14} className="text-pink-500 dark:text-pink-400" />
                      </div>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{totalInstalls}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 font-mono uppercase">Total mobile app adoption clicks</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50/50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-3xl space-y-4 animate-fade-in">
                      <h4 className="text-[10px] font-mono font-black text-gray-550 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><span>👍</span> Accuracy Index</h4>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{helpfulRatio}%</p>
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Accuracy acceptance ratio</p>
                        </div>
                        <div className="text-right text-[10px] font-bold text-gray-600 dark:text-gray-400 space-y-0.5">
                          <p><span className="text-emerald-600 dark:text-emerald-400 font-bold">👍 {finalHelpful}</span> Helpful</p>
                          <p><span className="text-rose-600 dark:text-rose-400 font-bold">👎 {finalUnhelpful}</span> Not helpful</p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${helpfulRatio}%` }} />
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50/50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-3xl space-y-4 animate-fade-in">
                      <h4 className="text-[10px] font-mono font-black text-gray-550 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><span>🎓</span> Admission Success Rate</h4>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{admissionRatio}%</p>
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Gained admission success rate</p>
                        </div>
                        <div className="text-right text-[10px] font-bold text-gray-600 dark:text-gray-400 space-y-0.5">
                          <p><span className="text-cyan-600 dark:text-cyan-400 font-bold">🎓 {finalAdmitted}</span> Admitted</p>
                          <p><span className="text-gray-500">⏳ {finalNotAdmitted}</span> In progress</p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${admissionRatio}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { title: 'Most Searched Institutions', data: topSchools, barColor: 'bg-red-650' },
                      { title: 'Most Searched Courses',      data: topCourses, barColor: 'bg-blue-600' },
                    ].map(({ title, data, barColor }) => (
                      <div key={title} className="p-6 bg-gray-50/50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-3xl space-y-4">
                        <h4 className="text-[10px] font-mono font-black text-gray-550 dark:text-gray-400 uppercase tracking-widest">{title}</h4>
                        <div className="space-y-2">
                          {data.length === 0 ? (
                            <div className="py-6 text-center text-[10px] text-gray-400 font-mono uppercase tracking-wider">No search activities recorded yet</div>
                          ) : (
                            data.map(([label, count], idx) => {
                              const max = Math.max(...data.map(d => d[1] as number)) || 1;
                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-gray-700 dark:text-gray-300 truncate pr-4">{idx + 1}. {label}</span>
                                    <span className="text-gray-900 dark:text-white font-mono shrink-0">{count}</span>
                                  </div>
                                  <div className="w-full h-1 bg-gray-200 dark:bg-white/15 rounded-full overflow-hidden">
                                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.round((count as number / max) * 100)}%` }} />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* ── INFRASTRUCTURE TAB ── */}
              {activeTab === 'infrastructure' && (
                <div className="space-y-8 text-left">
                  <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl space-y-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Key size={14} /> API Core Nodes & Developer Identity</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Gemini Primary API Key',  val: geminiKey,      set: setGeminiKey,      ph: 'AI Core Key 1...' },
                        { label: 'Gemini Backup API Key 2', val: geminiKey2,     set: setGeminiKey2,     ph: 'AI Core Key 2...' },
                        { label: 'Gemini Backup API Key 3', val: geminiKey3,     set: setGeminiKey3,     ph: 'AI Core Key 3...' },
                        { label: 'Flutterwave Public Key',  val: flutterwaveKey, set: setFlutterwaveKey, ph: 'FLWPUBK-...' },
                      ].map(({ label, val, set, ph }) => (
                        <div key={label}>
                          <label className="text-[10px] font-black uppercase text-gray-500 ml-2">{label}</label>
                          <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                            className="w-full p-4 bg-white dark:bg-gray-950 rounded-2xl border-transparent focus:border-blue-500 outline-none dark:text-white font-mono mt-1 text-xs" />
                        </div>
                      ))}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-500 ml-2">News Generation Key</label>
                          <select value={newsKeyPref} onChange={e => setNewsKeyPref(e.target.value)} className="w-full p-4 bg-white dark:bg-gray-950 rounded-2xl border-transparent focus:border-blue-500 outline-none dark:text-white text-xs mt-1">
                            <option value="auto">Auto Pool</option>
                            <option value="primary">Primary Key</option>
                            <option value="backup2">Backup Key 2</option>
                            <option value="backup3">Backup Key 3</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Calculation Key</label>
                          <select value={calcKeyPref} onChange={e => setCalcKeyPref(e.target.value)} className="w-full p-4 bg-white dark:bg-gray-950 rounded-2xl border-transparent focus:border-blue-500 outline-none dark:text-white text-xs mt-1">
                            <option value="auto">Auto Pool</option>
                            <option value="primary">Primary Key</option>
                            <option value="backup2">Backup Key 2</option>
                            <option value="backup3">Backup Key 3</option>
                          </select>
                        </div>
                      </div>

                      <div className="border border-dashed dark:border-gray-800 p-6 rounded-2xl flex flex-col items-center gap-4 bg-white dark:bg-gray-950">
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Meet Manny / About Section Profile Pic</span>
                        {developerPhoto ? (
                          <div className="relative group">
                            <img src={developerPhoto} className="w-24 h-24 rounded-full object-cover border dark:border-gray-800 shadow-md" alt="Manny" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[8px] font-black text-white uppercase">Active</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400"><User size={32} /></div>
                        )}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="admin-photo-picker-id" />
                        <label htmlFor="admin-photo-picker-id" className="px-5 py-2.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors">
                          {developerPhoto ? 'Replace Image' : 'Upload Picture'}
                        </label>
                      </div>

                      <button onClick={handleSaveConfig} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors">
                        Update Global Config
                      </button>
                    </div>
                  </div>

                  <SystemHealthStatus token={SECRET_TOKEN} />

                  <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Globe size={14} className="text-emerald-500 animate-pulse" /> Community & Social Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        ['X / Twitter', socialTwitter,   setSocialTwitter,   'https://x.com/campusai_ng'],
                        ['Facebook',    socialFacebook,  setSocialFacebook,  'https://facebook.com/campusai.ng'],
                        ['Instagram',   socialInstagram, setSocialInstagram, 'https://instagram.com/campusai.ng'],
                        ['LinkedIn',    socialLinkedin,  setSocialLinkedin,  'https://linkedin.com/company/campusai_ng'],
                        ['YouTube',     socialYoutube,   setSocialYoutube,   'https://youtube.com/@campusai_ng'],
                        ['TikTok',      socialTiktok,    setSocialTiktok,    'https://tiktok.com/@campusai_ng'],
                        ['Nairaland',   socialNairaland, setSocialNairaland, 'https://nairaland.com/...'],
                        ['WhatsApp',    socialWhatsapp,  setSocialWhatsapp,  'https://chat.whatsapp.com/...'],
                      ].map(([label, val, set, ph]) => (
                        <div key={label as string}>
                          <label className="text-[9px] font-black uppercase text-gray-500 ml-1">{label as string} Link</label>
                          <input value={val as string} onChange={e => (set as any)(e.target.value)} placeholder={ph as string}
                            className="w-full p-4 bg-white dark:bg-gray-950 rounded-2xl border-transparent focus:border-red-500 outline-none dark:text-white mt-1 text-xs" />
                        </div>
                      ))}
                    </div>
                    <button onClick={handleSaveConfig} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all">
                      Save Community Links
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Database size={14} /> Institutional Scoring Sync</h3>
                    <p className="text-xs text-gray-500">Populate cloud-cache with university cutoff formulas using AI.</p>
                    {isSyncing && (
                      <div className="bg-white dark:bg-gray-950 p-4 rounded-2xl border border-blue-500/20">
                        <div className="flex justify-between text-[9px] font-black uppercase mb-2">
                          <span className="text-blue-500">Syncing: {syncProgress.currentUni}</span>
                          <span className="text-gray-400">{syncProgress.current} / {syncProgress.total}</span>
                        </div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }} />
                        </div>
                      </div>
                    )}
                    <button onClick={handleSyncScoring} disabled={isSyncing} className="w-full py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                      {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Sync Scoring Matrix
                    </button>
                  </div>
                </div>
              )}

              {/* ── DEPARTMENTAL CUTOFFS TAB ── */}
              {activeTab === 'cutoffs' && (
                <div className="space-y-8 text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-900 pb-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Sliders size={14} /> Departmental Cutoff Overrides (Research Grounding)
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Manage official researched departmental guidelines. Restricts the AI to evaluate candidates strictly against these values.
                      </p>
                    </div>
                    <button
                      onClick={loadCutoffOverrides}
                      disabled={isOverridesLoading}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 self-start active:scale-95 transition-all"
                    >
                      <RefreshCw size={12} className={isOverridesLoading ? "animate-spin" : ""} /> Refresh List
                    </button>
                  </div>

                  {overridesError && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-medium border border-red-500/10 flex items-center gap-2">
                      <ShieldAlert size={14} /><span>{overridesError}</span>
                    </div>
                  )}
                  {overridesSuccess && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-medium border border-emerald-500/10 flex items-center gap-2">
                      <ShieldCheck size={14} /><span>{overridesSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <form onSubmit={handleSaveNewOverride} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <Plus size={12} /> Add Custom Cutoff Override
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Institution Name</label>
                          <input type="text" required placeholder="e.g. Federal University of Technology, Akure"
                            value={newUniName} onChange={e => setNewUniName(e.target.value)}
                            className="w-full mt-1 bg-white dark:bg-gray-950 text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-red-500 outline-none text-gray-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Course / Department</label>
                          <input type="text" required placeholder="e.g. Mechanical Engineering"
                            value={newCourseName} onChange={e => setNewCourseName(e.target.value)}
                            className="w-full mt-1 bg-white dark:bg-gray-950 text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-red-500 outline-none text-gray-800 dark:text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Dept Cutoff (Percentage or raw)</label>
                            <input type="text" required placeholder="e.g. 68.25% or 250"
                              value={newDeptCutoff} onChange={e => setNewDeptCutoff(e.target.value)}
                              className="w-full mt-1 bg-white dark:bg-gray-950 text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-red-500 outline-none text-gray-800 dark:text-white" />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Uni Floor Cutoff (JAMB raw)</label>
                            <input type="text" placeholder="e.g. 180 (Optional)"
                              value={newInstCutoff} onChange={e => setNewInstCutoff(e.target.value)}
                              className="w-full mt-1 bg-white dark:bg-gray-950 text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-red-500 outline-none text-gray-800 dark:text-white" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Explanation / Source</label>
                          <textarea rows={2} placeholder="e.g. Official merit department cutoff released by admissions senate."
                            value={newOverrideExplanation} onChange={e => setNewOverrideExplanation(e.target.value)}
                            className="w-full mt-1 bg-white dark:bg-gray-950 text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-red-500 outline-none text-gray-800 dark:text-white resize-none" />
                        </div>
                      </div>
                      <button type="submit" disabled={isSavingOverride}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                        {isSavingOverride ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Save Rule
                      </button>
                    </form>

                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-2 mb-2">
                          <FileJson size={12} /> Bulk JSON Importer (For Manus / Researchers)
                        </h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed mb-3">
                          Have multiple course guidelines? Paste a JSON list of objects here to save them simultaneously. Missing/incomplete records skip safely.
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 text-[10px] font-mono text-gray-500 mb-3 select-all">
                          <span className="text-blue-500">Format Guide:</span>
                          <pre className="mt-1 overflow-x-auto text-[9px]">
{`[
  {
    "institution": "University of Lagos",
    "course": "Computer Engineering",
    "departmentalCutoff": "72.5%",
    "institutionalCutoff": "200",
    "explanation": "Official merit 2026 cutoff guidelines."
  }
]`}
                          </pre>
                        </div>
                        <textarea rows={6} placeholder='Paste JSON data here (Array of Cutoff objects)...'
                          value={bulkJSONText} onChange={e => setBulkJSONText(e.target.value)}
                          className="w-full bg-white dark:bg-gray-950 text-[10px] font-mono p-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-red-500 outline-none text-gray-800 dark:text-white resize-none" />
                      </div>
                      <button onClick={handleBulkJSONImport} disabled={isSavingOverride}
                        className="w-full py-3 bg-gray-900 dark:bg-gray-800 hover:bg-gray-950 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                        {isSavingOverride ? <Loader2 size={12} className="animate-spin" /> : <FileJson size={12} />} Ingest Bulk Guidelines
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-900">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Active Cutoff Database Cache ({overrides.length})
                      </h4>
                      <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="Search overrides list..."
                          value={overridesSearch} onChange={e => setOverridesSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-950 text-xs rounded-xl border border-gray-200 dark:border-gray-800 focus:border-red-500 outline-none text-gray-700 dark:text-white" />
                      </div>
                    </div>

                    {isOverridesLoading ? (
                      <div className="py-12 flex justify-center text-center text-gray-400 text-xs gap-2">
                        <Loader2 className="animate-spin" size={16} /> Loading custom database overrides...
                      </div>
                    ) : (
                      (() => {
                        const filtered = overrides.filter(o =>
                          (o.institution || '').toLowerCase().includes(overridesSearch.toLowerCase()) ||
                          (o.course || '').toLowerCase().includes(overridesSearch.toLowerCase())
                        );
                        if (filtered.length === 0) {
                          return (
                            <div className="p-12 text-center rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-900 text-gray-400 text-xs">
                              {overridesSearch ? "No overrides match your search query." : "No cutoff overrides calibrated in the database yet. Add rules above to start calibration."}
                            </div>
                          );
                        }
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-2 no-scrollbar">
                            {filtered.map((override, idx) => (
                              <div key={idx} className="p-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl flex justify-between items-start gap-3 shadow-sm hover:shadow transition-all group">
                                <div className="space-y-1 text-xs">
                                  <div className="font-semibold text-gray-800 dark:text-gray-100">{override.course}</div>
                                  <div className="text-[10px] text-gray-500">{override.institution}</div>
                                  {override.explanation && (
                                    <div className="text-[10px] text-gray-400 italic mt-1 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                                      "{override.explanation}"
                                    </div>
                                  )}
                                  {override.institutionalCutoff && (
                                    <div className="text-[9px] text-blue-500 font-semibold uppercase mt-1">
                                      Uni Floor Limit: {override.institutionalCutoff}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="px-2.5 py-1 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-[10px] font-extrabold rounded-lg tracking-wider">
                                    {override.departmentalCutoff}
                                  </div>
                                  <button
                                    onClick={() => handleDeleteOverride(override.institution, override.course)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg active:scale-90 transition-all"
                                    aria-label="Delete override rule"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              )}

              {/* ── CONTENT TAB ── */}
              {activeTab === 'content' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Newspaper size={14} /> Feed Manager</h3>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={handlePurgeAllNews} disabled={isContentLoading} className="px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 active:scale-95"><Trash2 size={12} /> Purge Stale Feed</button>
                      <button onClick={handleFixFutureDates} disabled={isContentLoading} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 active:scale-95"><Clock size={12} /> Fix Future Dates</button>
                      <button onClick={handleSyncLiveNews} disabled={isContentLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                        {isContentLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} Global Sync
                      </button>
                      {/* ✅ FIX: Reset newPost fully when opening form so date is never stale */}
                      <button
                        onClick={() => {
                          if (!showPostForm) {
                            setNewPost({ category: 'National' });
                          }
                          setShowPostForm(!showPostForm);
                          setShowAIBlogForm(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase"
                      >
                        {showPostForm ? 'Cancel' : 'Manual Post'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAIBlogForm(!showAIBlogForm);
                          setShowPostForm(false);
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 active:scale-95"
                      >
                        <Sparkles size={12} /> {showAIBlogForm ? 'Cancel AI' : 'AI Blog Maker'}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showPostForm && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl space-y-4 border border-blue-500/20">
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Headline</label>
                          <input placeholder="Headline" className="w-full p-4 bg-white dark:bg-gray-950 rounded-xl dark:text-white outline-none text-sm border border-gray-100 dark:border-gray-800 focus:border-blue-500"
                            value={newPost.title || ''} onChange={e => setNewPost({ ...newPost, title: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Category</label>
                            <select 
                              className="w-full p-4 bg-white dark:bg-gray-950 rounded-xl dark:text-white outline-none text-sm border border-gray-100 dark:border-gray-800 focus:border-blue-500"
                              value={newPost.category || 'National'} 
                              onChange={e => setNewPost({ ...newPost, category: e.target.value as any })}
                            >
                              <option value="JAMB">JAMB</option>
                              <option value="National">National</option>
                              <option value="Scholarships">Scholarships</option>
                              <option value="Jobs">Jobs</option>
                              <option value="NYSC">NYSC</option>
                              <option value="Polytechnic">Polytechnic</option>
                              <option value="COE">COE</option>
                              <option value="State">State</option>
                              <option value="Private">Private</option>
                              <option value="Federal">Federal</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Short Excerpt</label>
                            <input placeholder="A brief summary of the article..." className="w-full p-4 bg-white dark:bg-gray-950 rounded-xl dark:text-white outline-none text-sm border border-gray-100 dark:border-gray-800 focus:border-blue-500"
                              value={newPost.excerpt || ''} onChange={e => setNewPost({ ...newPost, excerpt: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Article Content</label>
                          <textarea placeholder="Article content..." className="w-full p-4 bg-white dark:bg-gray-950 rounded-xl dark:text-white outline-none h-40 text-sm border border-gray-100 dark:border-gray-800 focus:border-blue-500"
                            value={newPost.fullContent || ''} onChange={e => setNewPost({ ...newPost, fullContent: e.target.value })} />
                        </div>
                        <button onClick={handlePublishPost} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-xs tracking-wider transition-colors">Publish to Cloud</button>
                      </motion.div>
                    )}

                    {showAIBlogForm && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="p-6 bg-purple-50/50 dark:bg-purple-950/10 rounded-3xl space-y-4 border border-purple-500/20"
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                            <Sparkles size={14} /> AI News Researcher & Generator
                          </h4>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Enter any news story, topic, or keyword you saw. The AI will search the web for recent articles, compile facts, and generate a structured, ready-to-publish blog post.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <input 
                            placeholder="e.g. FUTA physical clearance starting date or ASUU strike update..." 
                            className="flex-1 p-4 bg-white dark:bg-gray-950 rounded-xl dark:text-white outline-none border border-gray-200 dark:border-gray-800 focus:border-purple-500 text-xs"
                            value={aiBlogQuery} 
                            onChange={e => setAiBlogQuery(e.target.value)} 
                            disabled={isAIGenerating}
                            onKeyDown={e => { if (e.key === 'Enter') handleGenerateAIBlog(); }}
                          />
                          <button 
                            onClick={handleGenerateAIBlog} 
                            disabled={isAIGenerating || !aiBlogQuery.trim()}
                            className="px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                          >
                            {isAIGenerating ? (
                              <>
                                <Loader2 size={12} className="animate-spin" />
                                Searching & Writing...
                              </>
                            ) : (
                              <>
                                <Sparkles size={12} />
                                Generate
                              </>
                            )}
                          </button>
                        </div>

                        {aiGeneratedPost && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-5 bg-white dark:bg-gray-950 rounded-2xl border border-purple-500/30 space-y-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-3">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                                Generated Draft Preview & Review
                              </h5>
                              <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold">
                                Category: {aiGeneratedPost.category}
                              </span>
                            </div>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-400">Headline</label>
                                <input 
                                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl dark:text-white outline-none font-bold text-xs border border-transparent focus:border-purple-500"
                                  value={aiGeneratedPost.title || ''} 
                                  onChange={e => setAiGeneratedPost({ ...aiGeneratedPost, title: e.target.value })} 
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-gray-400">Category Override</label>
                                  <select 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl dark:text-white outline-none text-xs border border-transparent focus:border-purple-500"
                                    value={aiGeneratedPost.category || 'National'}
                                    onChange={e => setAiGeneratedPost({ ...aiGeneratedPost, category: e.target.value })}
                                  >
                                    <option value="National">National</option>
                                    <option value="Institution">Institution</option>
                                    <option value="ASUU">ASUU</option>
                                    <option value="Scholarship">Scholarship</option>
                                    <option value="Admission">Admission</option>
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-gray-400">Excerpt / Summary</label>
                                  <input 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl dark:text-white outline-none text-xs border border-transparent focus:border-purple-500"
                                    value={aiGeneratedPost.excerpt || ''} 
                                    onChange={e => setAiGeneratedPost({ ...aiGeneratedPost, excerpt: e.target.value })} 
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-400">Article Content (Markdown Support)</label>
                                <textarea 
                                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl dark:text-white outline-none text-xs h-60 border border-transparent focus:border-purple-500 font-mono leading-relaxed"
                                  value={aiGeneratedPost.fullContent || ''} 
                                  onChange={e => setAiGeneratedPost({ ...aiGeneratedPost, fullContent: e.target.value })} 
                                />
                              </div>

                              {aiSources.length > 0 && (
                                <div className="pt-2">
                                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Sources Researched</label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {aiSources.map((src, sIdx) => (
                                      <a 
                                        key={src} 
                                        href={src} 
                                        target="_blank" 
                                        referrerPolicy="no-referrer" 
                                        rel="noopener noreferrer"
                                        className="text-[8px] bg-gray-100 dark:bg-gray-1000 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 p-1 px-2 rounded-lg truncate max-w-xs transition-colors"
                                      >
                                        {src}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button 
                              onClick={handlePublishAIPost} 
                              disabled={isContentLoading}
                              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase text-xs shadow-md transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                            >
                              {isContentLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                              Publish AI Generated Post to Cloud
                            </button>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    {publishedNews.slice(0, 1000).map(item => {
                      const itemTime = new Date(item.date).getTime();
                      const isFuture = !isNaN(itemTime) && itemTime > todayLagosMidnight;
                      return (
                        <div key={item.id} className={`p-4 bg-gray-50 dark:bg-gray-900/50 border rounded-2xl flex items-center justify-between group transition-all ${isFuture ? 'border-orange-500/30 bg-orange-500/[0.03]' : 'border-gray-100 dark:border-gray-800'}`}>
                          <div className="flex items-center gap-4 overflow-hidden">
                            <Newspaper size={18} className={isFuture ? 'text-orange-500' : 'text-gray-400'} />
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-xs dark:text-white truncate">{item.title}</p>
                                {isFuture && <span className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black uppercase rounded-full animate-pulse">Future</span>}
                              </div>
                              {editingDateId === item.id ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <input type="text" value={editedDateValue || ''} onChange={e => setEditedDateValue(e.target.value)}
                                    placeholder="e.g., May 20, 2026" autoFocus
                                    className="bg-white dark:bg-gray-800 text-[10px] p-1 px-2 rounded border border-blue-500/50 outline-none w-32" />
                                  <button onClick={() => handleSaveDate(item.id)} className="text-emerald-500 hover:bg-emerald-500/10 p-1 rounded"><Check size={12} /></button>
                                  <button onClick={() => setEditingDateId(null)} className="text-gray-400 hover:bg-gray-400/10 p-1 rounded"><X size={12} /></button>
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-400 cursor-pointer hover:text-blue-500 flex items-center gap-1 group/date"
                                  onClick={() => { setEditingDateId(item.id); setEditedDateValue(item.date); }}>
                                  {item.category} • {item.date}
                                  <Check size={10} className="opacity-0 group-hover/date:opacity-100 transition-opacity" />
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingNews(item)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Edit Full Content"
                            >
                              <Zap size={16} />
                            </button>
                            <button onClick={() => handleDeletePost(item.id)} aria-label="Delete post" className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── USERS TAB ── */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Users size={14} /> Scholar Directory</h3>
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">{totalUserCount} Souls</div>
                  </div>
                  {isUserLoading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={28} /></div>
                  ) : (
                    <div className="space-y-2">
                      {recentUsers.map(u => (
                        <div key={u.uid} className="p-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                              {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" alt="" /> : <Users size={20} className="text-gray-300" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold dark:text-white flex items-center gap-2">{u.displayName} {u.is_premium && <Star size={10} className="text-yellow-500 fill-current" />}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{u.email}</p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <p className="text-[9px] font-black text-blue-500 uppercase leading-none">{u.role || 'Scholar'}</p>
                            <div className="flex flex-col items-end gap-0.5 text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                              <p className="font-bold">Done: <span className="text-gray-800 dark:text-gray-200 font-extrabold">{u.meritUsageCount || 0}</span></p>
                              <p className="font-bold text-[8px]">
                                Left: <span className={`${u.is_premium ? "text-amber-500" : "text-blue-500"} font-extrabold`}>
                                  {u.is_premium
                                    ? `${u.scholarCredits || 0} SP`
                                    : `${Math.max(0, FREE_USER_LIMIT - (u.meritUsageCount || 0))} Trial`}
                                </span>
                              </p>
                            </div>
                            <button
                              onClick={async e => {
                                e.stopPropagation();
                                if (window.confirm(`Grant 3 Scholar Credits to ${u.displayName}?`)) {
                                  await updateUserProfile({ scholarCredits: (u.scholarCredits || 0) + 3, is_premium: true }, u.uid);
                                  await loadUsers();
                                }
                              }}
                              className="mt-2 px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[7px] font-black uppercase hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20"
                            >
                              Grant 3 SP
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── INTELLIGENCE TAB ── */}
              {activeTab === 'intelligence' && (
                <div className="space-y-8 text-left">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Feedback List */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2">
                          <Sparkles size={16} className="text-blue-500" /> App Feedback ({feedbackList.length})
                        </h4>
                        <button 
                          onClick={loadIntelligenceData}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                          <RefreshCw size={14} className={isIntelligenceLoading ? 'animate-spin' : ''} />
                        </button>
                      </div>
                      
                      <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-900/30 space-y-3">
                        <div className="flex items-center gap-3">
                          <Info size={18} className="text-blue-500" />
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-900 dark:text-blue-300">Synchronization Guide</h5>
                        </div>
                        <p className="text-[10px] text-blue-800 dark:text-blue-400 font-medium leading-relaxed">
                          Google Maps reviews are external. To display them on the website, copy the content from Google and add them as **Testimonials** in the right-side panel. Enable "Featured" to show them on the homepage.
                        </p>
                      </div>

                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {feedbackList.length === 0 ? (
                          <div className="p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-gray-400 text-xs font-bold">
                            No feedback received yet.
                          </div>
                        ) : (
                          feedbackList.map((f: any) => (
                            <div key={f.id} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                  f.type === 'bug' ? 'bg-red-500 text-white' :
                                  f.type === 'feature' ? 'bg-blue-500 text-white' :
                                  f.type === 'correction' ? 'bg-amber-500 text-white' :
                                  'bg-gray-500 text-white'
                                }`}>
                                  {f.type}
                                </span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase">
                                  {f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : new Date(f.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{f.subject || 'Untitled Feedback'}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{f.content}</p>
                              <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                                <span className="text-[10px] font-bold text-blue-600">{f.email || 'Anonymous'}</span>
                                <span className="text-[8px] font-black uppercase text-gray-400">{f.status}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Testimonials Management */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2">
                        <Star size={16} className="text-amber-500" /> Manage Testimonials
                      </h4>

                      <form onSubmit={handleAddTestimonial} className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            placeholder="Scholar Name"
                            value={newTestimonial.name}
                            onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})}
                            className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl text-xs font-bold outline-none border-transparent focus:border-blue-500"
                          />
                          <input 
                            placeholder="Role (e.g. 2024 Aspirant)"
                            value={newTestimonial.role}
                            onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})}
                            className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl text-xs font-bold outline-none border-transparent focus:border-blue-500"
                          />
                        </div>
                        <input 
                          placeholder="Institution (Optional)"
                          value={newTestimonial.school}
                          onChange={e => setNewTestimonial({...newTestimonial, school: e.target.value})}
                          className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl text-xs font-bold outline-none border-transparent focus:border-blue-500"
                        />
                        <textarea 
                          placeholder="Testimonial Content..."
                          rows={3}
                          value={newTestimonial.content}
                          onChange={e => setNewTestimonial({...newTestimonial, content: e.target.value})}
                          className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl text-xs font-bold outline-none border-transparent focus:border-blue-500 resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-gray-400">Rating:</span>
                            <select 
                              value={newTestimonial.rating}
                              onChange={e => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})}
                              className="bg-white dark:bg-gray-950 rounded-lg text-xs font-bold p-1"
                            >
                              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                            </select>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newTestimonial.isFeatured}
                              onChange={e => setNewTestimonial({...newTestimonial, isFeatured: e.target.checked})}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] font-black uppercase text-gray-400">Featured</span>
                          </label>
                        </div>
                        <button 
                          disabled={isIntelligenceLoading}
                          className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          {isIntelligenceLoading ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Add Testimonial</>}
                        </button>
                      </form>

                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {testimonials.map((t: any) => (
                          <div key={t.id} className="p-4 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                              <User size={20} className="text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="text-[10px] font-black text-gray-900 dark:text-white uppercase truncate">{t.name}</h5>
                                <button 
                                  onClick={() => handleDeleteTestimonial(t.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase truncate mb-2">{t.role} {t.school ? `• ${t.school}` : ''}</p>
                              <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 italic">"{t.content}"</p>
                              <div className="flex gap-0.5 mt-2">
                                {[...Array(t.rating)].map((_, i) => <Star key={`${t.id}-star-${i}`} size={8} className="text-amber-400 fill-amber-400" />)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2"><Brain size={16} className="text-red-500" /> ASUU Intelligence</h4>
                      <button
                        onClick={() => setAsuuStatus(s => ({ ...s, isActive: !s.isActive }))}
                        className={`w-12 h-6 rounded-full relative transition-colors ${asuuStatus.isActive ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <motion.div animate={{ x: asuuStatus.isActive ? 24 : 2 }} className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <input value={asuuStatus.status || ''} onChange={e => setAsuuStatus(s => ({ ...s, status: e.target.value }))}
                        className="w-full p-4 bg-white dark:bg-gray-950 rounded-2xl dark:text-white font-bold outline-none border border-transparent focus:border-red-500"
                        placeholder="Header (e.g. Strike Alert)" />
                      <textarea value={asuuStatus.summary || ''} onChange={e => setAsuuStatus(s => ({ ...s, summary: e.target.value }))}
                        className="w-full p-4 bg-white dark:bg-gray-950 rounded-2xl dark:text-white outline-none h-32"
                        placeholder="Strike details..." />
                      <button onClick={handleUpdateAsuu} disabled={isContentLoading}
                        className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-red-500/20 disabled:opacity-50">
                        Sync To Network
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── News Content Editor Overlay ── */}
        <AnimatePresence>
          {editingNews && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setEditingNews(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-950 rounded-[40px] shadow-2xl border border-white/10 overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b border-gray-100 dark:border-gray-900 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Precision Editor</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sanitize and refine intelligence reports</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (editingNews && editingNews.fullContent) {
                          setEditingNews({ ...editingNews, fullContent: handleSanitizeContent(editingNews.fullContent) });
                        }
                      }}
                      className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                    >
                      <Sparkles size={14} /> Sanitize
                    </button>
                    <button onClick={() => setEditingNews(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Headline</label>
                    <input 
                      type="text"
                      value={editingNews.title || ''}
                      onChange={e => setEditingNews({ ...editingNews, title: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Category</label>
                      <select 
                        value={editingNews.category || 'National'}
                        onChange={e => setEditingNews({ ...editingNews, category: e.target.value as UniversityCategory })}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900 dark:text-white"
                      >
                        {['National', 'Jobs', 'Scholarships', 'Admission', 'Institution', 'JAMB', 'Federal', 'State', 'Private', 'Polytechnic', 'COE', 'NYSC'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Card Summary (Excerpt)</label>
                      <input 
                        type="text"
                        value={editingNews.excerpt || ''}
                        onChange={e => setEditingNews({ ...editingNews, excerpt: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 flex items-center justify-between">
                    <span>Full Article Intelligence (Markdown)</span>
                    <span className="text-blue-500 lowercase font-bold tracking-normal italic">Markdown is supported</span>
                  </label>
                  <textarea 
                    value={editingNews.fullContent || ''}
                    onChange={e => setEditingNews({ ...editingNews, fullContent: e.target.value })}
                    rows={15}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900 dark:text-white font-mono leading-relaxed resize-none"
                  />
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 dark:border-gray-900 shrink-0">
                <button
                  onClick={handleSaveNewsEdits}
                  disabled={isSavingNews}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSavingNews ? <Loader2 className="animate-spin" /> : <><Check size={20} /> Commit Updates to Cloud</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;