import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import SEO from './SEO';

import NewsGrid from './NewsGrid';
import Dashboard from './Dashboard';
import CutoffCalculator from './CutoffCalculator';
import PostUtmeReleaseHub from './PostUtmeReleaseHub';
import UniversityDirectory from './UniversityDirectory';
import TopRankings from './TopRankings';
import Sidebar from './Sidebar';
import NewsDetailView from './NewsDetailView';
import ToolsGrid from './ToolsGrid';

// Code-split heavy secondary views & modals for faster initial load
const PolicySection = lazyWithRetry(() => import('./PolicySection'));
const FAQSection = lazyWithRetry(() => import('./FAQSection'));
const Testimonials = lazyWithRetry(() => import('./Testimonials'));
const InviteEarn = lazyWithRetry(() => import('./InviteEarn'));
const RecentActivity = lazyWithRetry(() => import('./RecentActivity'));
const AboutSection = lazyWithRetry(() => import('./AboutSection'));
const AdminPanel = lazyWithRetry(() => import('./AdminPanel'));
const UserSettingsModal = lazyWithRetry(() => import('./UserSettingsModal'));
const AuthModal = lazyWithRetry(() => import('./AuthModal'));
const LoginPage = lazyWithRetry(() => import('./LoginPage'));
const ShareModal = lazyWithRetry(() => import('./ShareModal'));
const InviteEarnModal = lazyWithRetry(() => import('./InviteEarnModal'));
const ScholarPackModal = lazyWithRetry(() => import('./ScholarPackModal'));
const SupportModal = lazyWithRetry(() => import('./SupportModal'));
const LegalModal = lazyWithRetry(() => import('./LegalModal'));
const CookieConsent = lazyWithRetry(() => import('./CookieConsent'));
const LegalSection = lazyWithRetry(() => import('./LegalSection'));
const AIChatDrawer = lazyWithRetry(() => import('./AIChatDrawer'));
const Tour = lazyWithRetry(() => import('./Tour'));
const InstallPrompt = lazyWithRetry(() => import('./InstallPrompt'));
const CalculationAnimation = lazyWithRetry(() => import('./CalculationAnimation'));
const StatusPage = lazyWithRetry(() => import('./StatusPage'));
const NotFound = lazyWithRetry(() => import('./NotFound'));
const FeedbackModal = lazyWithRetry(() => import('./FeedbackModal'));
const AdmissionChecklistPage = lazyWithRetry(() => import('./AdmissionChecklistPage'));
const SyllabusExplorer = lazyWithRetry(() => import('./SyllabusExplorer'));
const AdmissionsExplorer = lazyWithRetry(() => import('./AdmissionsExplorer'));
const CGPACalculator = lazy(() => import('./CGPACalculator'));
import { useDailyReminder } from '../hooks/useDailyReminder';
import { useStandalone } from '../hooks/useStandalone';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { auth } from '../services/firebaseConfig';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { initializeUserProfile, subscribeToUserProfile, isRealUser } from '../services/userService';
import { AdminState, NewsItem, UserRole } from '../types';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { slugify, triggerBrowserNotification } from '../services/utils';

// Helper to convert Firestore Timestamps, JSON timestamp objects or date strings/numbers to ms
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

const NewsDetailWrapper = ({ user, isAuthorizedAdmin, news, setIsAuthModalOpen, closeArticle }: any) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const currentNews = news.find((n: NewsItem) => n.id === slug || n.slug === slug || n.title?.toLowerCase().split(' ').join('-') === slug);
  
  // Filter related news excluding the current one
  const filteredRelated = currentNews 
    ? news.filter((n: NewsItem) => n.category === currentNews.category && n.id !== currentNews.id).slice(0, 3)
    : [];

  const handleSelectRelated = (article: NewsItem) => {
    const articleSlug = article.slug || slugify(article.title);
    navigate(`/news/${articleSlug}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-0 md:px-8 max-w-[100vw] overflow-x-hidden pt-24 md:pt-32 pb-20 min-h-screen">
      {currentNews && (
        <SEO 
          title={currentNews.title} 
          description={currentNews.excerpt || currentNews.content.substring(0, 155)} 
          image={currentNews.image}
          article={true}
          canonical={`/news/${slug}`}
        />
      )}
      <NewsDetailView 
        news={currentNews}
        user={user} 
        isAdmin={isAuthorizedAdmin}
        onClose={closeArticle} 
        onLoginRequest={() => navigate('/login')}
        relatedNews={filteredRelated} 
        onSelectRelated={handleSelectRelated} 
      />
    </div>
  );
};

const SchoolCalculatorWrapper = ({ user, setIsAuthModalOpen, setIsScholarPackOpen, selectedSchoolForChances, setSelectedSchoolForChances, onGoHome }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const rawPath = location.pathname.toLowerCase();

  // Validate that the URL strictly ends with '-aggregate-calculator'
  if (!rawPath.endsWith('-aggregate-calculator')) {
    return <NotFound onGoHome={() => onGoHome ? onGoHome() : navigate('/')} />;
  }

  // Extract the school slug from the pathname (e.g. /unilag-aggregate-calculator -> unilag)
  const schoolSlug = rawPath.replace(/^\//, '').replace(/-aggregate-calculator$/, '');

  if (!schoolSlug) {
    return <NotFound onGoHome={() => onGoHome ? onGoHome() : navigate('/')} />;
  }

  // Try to find the original school name from the slug (e.g. unilag -> University of Lagos)
  let computedSchoolName = selectedSchoolForChances;

  if (schoolSlug === 'unilag') computedSchoolName = 'University of Lagos (UNILAG)';
  else if (schoolSlug === 'lasu') computedSchoolName = 'Lagos State University (LASU)';
  else if (schoolSlug === 'ui') computedSchoolName = 'University of Ibadan (UI)';
  else if (schoolSlug === 'oau') computedSchoolName = 'Obafemi Awolowo University (OAU)';
  else if (schoolSlug === 'uniben') computedSchoolName = 'University of Benin (UNIBEN)';
  else if (schoolSlug === 'unilorin') computedSchoolName = 'University of Ilorin (UNILORIN)';
  else if (schoolSlug === 'unn') computedSchoolName = 'University of Nigeria, Nsukka (UNN)';
  else if (schoolSlug === 'futa') computedSchoolName = 'Federal University of Technology Akure (FUTA)';
  else if (schoolSlug === 'abu') computedSchoolName = 'Ahmadu Bello University (ABU)';
  else if (schoolSlug === 'fuoye') computedSchoolName = 'Federal University Oye-Ekiti (FUOYE)';
  else if (schoolSlug === 'delsu') computedSchoolName = 'Delta State University (DELSU)';
  else if (schoolSlug === 'kwasu') computedSchoolName = 'Kwara State University (KWASU)';
  else if (schoolSlug === 'aaua') computedSchoolName = 'Adekunle Ajasin University (AAUA)';
  else if (schoolSlug === 'yabatech') computedSchoolName = 'Yaba College of Technology (YABATECH)';
  else if (schoolSlug === 'oou') computedSchoolName = 'Olabisi Onabanjo University (OOU)';
  else if (!computedSchoolName) {
    computedSchoolName = schoolSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-950">
      <SEO 
        title={`${computedSchoolName} 2026 Aggregate Calculator`}
        description={`Calculate your ${computedSchoolName} aggregate score for the 2026 admission cycle. Accurate results based on official departmental cut-off marks and merit guidelines.`}
        canonical={rawPath}
      />
      <CutoffCalculator 
        user={user} 
        onLoginRequest={() => navigate('/login')} 
        onPremiumRequired={() => setIsScholarPackOpen(true)}
        onDiscussWithAI={(msg) => window.dispatchEvent(new CustomEvent('campusai_open_ai', { detail: msg }))} 
        initialSchoolName={computedSchoolName}
        onClearInitialSchool={() => setSelectedSchoolForChances('')}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  useDailyReminder();
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = useStandalone();
  
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSchoolForChances, setSelectedSchoolForChances] = useState<string>('');
  const [user, setUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('campusai_user_profile');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('campusai_theme') as any) || 'dark';
    } catch(e) { return 'dark'; }
  });
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isInviteEarnOpen, setIsInviteEarnOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isScholarPackOpen, setIsScholarPackOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<{ type: 'pack' | 'refill' | 'tool'; amount: number; label: string; toolId?: string } | undefined>(undefined);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' | 'cookies' }>({ isOpen: false, type: 'terms' });

  // Admin Auth State
  const [adminAuth, setAdminAuth] = useState({ isLoggedIn: false, email: null as string | null });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [directoryInitialCategory, setDirectoryInitialCategory] = useState<'All' | 'Federal' | 'State' | 'Private' | 'Polytechnic' | 'COE' | 'National'>('All');

  // Real-time synchronization and live desktop/mobile push alerts across all users
  const lastSeenSyncRef = useRef<number>(0);
  const isFirstSyncRef = useRef<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('campusai_last_sync_heard');
      if (stored) {
        lastSeenSyncRef.current = parseInt(stored, 10);
      }
    } catch (e) {}

    const checkSync = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return; // Skip background tabs completely to preserve quota
      }

      const { getGlobalSyncMetadata } = await import('../services/dbService');
      const data = await getGlobalSyncMetadata();
      const currentSyncTime = data.lastSync;
      
      if (isFirstSyncRef.current) {
        if (currentSyncTime > 0) {
          lastSeenSyncRef.current = currentSyncTime;
          try { localStorage.setItem('campusai_last_sync_heard', String(currentSyncTime)); } catch(e) {}
        }
        isFirstSyncRef.current = false;
        return;
      }

      if (currentSyncTime > 0 && currentSyncTime > lastSeenSyncRef.current) {
        const previousSyncTime = lastSeenSyncRef.current;
        lastSeenSyncRef.current = currentSyncTime;
        try { localStorage.setItem('campusai_last_sync_heard', String(currentSyncTime)); } catch(e) {}

        // 1. Notify any open components to automatically reload their news feeds!
        window.dispatchEvent(new Event('campusai_news_sync'));
        window.dispatchEvent(new Event('campusai_news_updated'));

        // 2. Fetch the newly added articles and trigger browser push notifications on desktop/mobile
        try {
          const { getCloudNews } = await import('../services/dbService');
          const newsItems = await getCloudNews(true, false, undefined, undefined, 30);
          
          const newlyAdded = newsItems.filter(item => {
            const itemTime = toMs(item.archivedAt) || toMs(item.createdAt) || toMs(item.updatedAt) || (item.date ? toMs(item.date) : 0);
            return itemTime > previousSyncTime;
          });

          if (newlyAdded.length > 0) {
            // Deduplicate newly added articles to avoid duplicate notifications
            const uniqueNewDocs: any[] = [];
            const seenNormTitles = new Set<string>();
            
            newlyAdded.forEach(article => {
              const norm = article.title?.trim().toLowerCase().replace(/\s+/g, ' ');
              // Basic check for suspicious strings
              if (norm.includes("raw data") || norm.includes("curation failed") || norm.includes("dictionary.com") || norm.includes("definition & meaning")) {
                return;
              }
              // Skip if we see a similar title in this batch
              if (seenNormTitles.has(norm)) return;
              seenNormTitles.add(norm);
              uniqueNewDocs.push(article);
            });

            // Read list of already notified slugs/IDs from localStorage to avoid spamming multiple notifications
            let notifiedSlugs: string[] = [];
            try {
              notifiedSlugs = JSON.parse(localStorage.getItem('campusai_notified_slugs') || '[]');
            } catch (e) {}

            const toNotify = uniqueNewDocs.filter(article => {
              const slug = article.slug || slugify(article.title);
              return !notifiedSlugs.includes(slug);
            });

            if (toNotify.length > 0) {
              toNotify.slice(0, 3).forEach(article => {
                const slug = article.slug || slugify(article.title);
                triggerBrowserNotification(
                  `🔔 News: ${article.title}`,
                  article.excerpt || "Verified Nigerian educational and JAMB update has arrived.",
                  slug
                );
                notifiedSlugs.push(slug);
              });
              
              // Persist notified list with a limit of 100 items
              if (notifiedSlugs.length > 100) {
                notifiedSlugs = notifiedSlugs.slice(-100);
              }
              try {
                localStorage.setItem('campusai_notified_slugs', JSON.stringify(notifiedSlugs));
              } catch (e) {}
            }
          }
        } catch (err) {
          console.error("Failed to process background sync updates:", err);
        }
      }
    };

    const interval = setInterval(checkSync, 600000); // 10 minutes interval (was 3 minutes)
    window.addEventListener('focus', checkSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkSync);
    };
  }, []);

  const [socialLinks, setSocialLinks] = useState<{
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    nairaland?: string;
    whatsapp?: string;
  }>(() => {
    try {
      const stored = localStorage.getItem('campusai_social_links');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const isAuthorizedAdmin = user?.email === 'eiweh123@gmail.com';
  const adminState: AdminState = { isLoggedIn: adminAuth.isLoggedIn, email: adminAuth.email };

  useEffect(() => {
    // Referral tracking
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem('campusai_referral_code', ref);
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Real-time site traffic tracker and recorder
    const trackVisitorTraffic = async () => {
      try {
        const isNew = !localStorage.getItem('campusai_uniq_visitor');
        if (isNew) {
          localStorage.setItem('campusai_uniq_visitor', 'true');
        }
        const { incrementTrafficStats } = await import('../services/dbService');
        await incrementTrafficStats(isNew);
      } catch (err) {
        console.warn('Traffic tracking not initialized:', err);
      }
    };
    // Slipped timeout to let DOM render first for optimal paint performance
    setTimeout(trackVisitorTraffic, 2000);
  }, []);
  
  useEffect(() => {
    initializeUserProfile(); 

    const loadGlobalSettings = async () => {
      const { getGlobalConfig, getPostUtmeReleases } = await import('../services/dbService');
      const config = await getGlobalConfig();
      if (config) {
        if (config.whatsapp) localStorage.setItem('campusai_whatsapp', config.whatsapp);
        if (config.supportEmail) localStorage.setItem('campusai_support_email', config.supportEmail);
        if (config.flutterwaveKey) localStorage.setItem('campusai_flutterwave_key', config.flutterwaveKey);
        if (config.geminiKey) localStorage.setItem('campusai_gemini_key', config.geminiKey);
        if (config.geminiKey2) localStorage.setItem('campusai_gemini_key_2', config.geminiKey2);
        if (config.geminiKey3) localStorage.setItem('campusai_gemini_key_3', config.geminiKey3);
        if (config.developerPhoto) localStorage.setItem('campusai_developer_photo', config.developerPhoto);
        if (config.socialLinks) {
          localStorage.setItem('campusai_social_links', JSON.stringify(config.socialLinks));
          setSocialLinks(config.socialLinks);
        }
        window.dispatchEvent(new Event('storage'));
      }

      try {
        const cloudReleases = await getPostUtmeReleases();
        if (cloudReleases && cloudReleases.length > 0) {
          localStorage.setItem('post_utme_releases', JSON.stringify(cloudReleases));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('campusai_postutme_synced'));
        }
      } catch (err) {
        console.warn("[App] Error loading Post-UTME releases on startup:", err);
      }
    };

    loadGlobalSettings();

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    const reloadNews = async () => {
      try {
        const { getCloudNews, sortNewsBySyncAndDate } = await import('../services/dbService');
        const newsItems = await getCloudNews(true, false, undefined, undefined, 30);
        const sortedNews = [...newsItems].sort((a, b) => sortNewsBySyncAndDate(a, b));
        setNews(sortedNews);
      } catch (err) {
        console.error("App: reloadNews error:", err);
      }
    };
    reloadNews();
    window.addEventListener('campusai_news_updated', reloadNews);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        const { getLocalProfile } = await import('../services/userService');
        const localProfile = getLocalProfile();
        if (localProfile && localProfile.uid === firebaseUser.uid) {
           setUser({ ...firebaseUser, ...localProfile });
        } else {
           setUser({ ...firebaseUser, role: 'Pre-Admission', is_premium: false });
        }
        setIsAuthLoading(false);
        
        try {
          const profile = await initializeUserProfile(firebaseUser);
          setUser({ ...firebaseUser, ...profile });
          subscribeToUserProfile(firebaseUser.uid, (updatedProfile) => {
             setUser((curr: any) => curr ? { ...curr, ...updatedProfile } : null);
          });
        } catch (e) {
          console.error("Profile init error:", e);
        }
      } else {
        localStorage.removeItem('campusai_user_profile');
        window.dispatchEvent(new Event('campusai_clear_chat'));
        setUser(null);
        // If we are on dashboard but not logged in, go to home
        if (window.location.pathname === '/dashboard') {
          navigate('/');
        }
        setIsAuthLoading(false);
      }
    });

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('campusai_news_updated', reloadNews);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleOpenPayment = (e: any) => {
      setPaymentConfig(e.detail || undefined);
      setIsScholarPackOpen(true);
    };
    const handleOpenLogin = () => {
      navigate('/login');
    };
    const handleOpenLegal = (e: any) => {
      setLegalModal({ isOpen: true, type: e.detail || 'terms' });
    };
    const handleOpenFeedback = () => {
      setIsFeedbackOpen(true);
    };
    const handleOpenSupport = () => {
      setIsSupportOpen(true);
    };
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('campusai_social_links');
        if (stored) {
          setSocialLinks(JSON.parse(stored));
        }
      } catch (e) {}
    };
    window.addEventListener('campusai_open_payment', handleOpenPayment);
    window.addEventListener('campusai_open_login', handleOpenLogin);
    window.addEventListener('campusai_open_legal', handleOpenLegal);
    window.addEventListener('campusai_open_feedback', handleOpenFeedback);
    window.addEventListener('campusai_open_support', handleOpenSupport);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('campusai_open_payment', handleOpenPayment);
      window.removeEventListener('campusai_open_login', handleOpenLogin);
      window.removeEventListener('campusai_open_legal', handleOpenLegal);
      window.removeEventListener('campusai_open_feedback', handleOpenFeedback);
      window.removeEventListener('campusai_open_support', handleOpenSupport);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Outbound Link Interceptor and Event Listeners
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Find closest anchor tag
      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      
      if (target && target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          const urlStr = href.toLowerCase();
          
          // List of exempt domains (e.g. social messaging and reviews/shares)
          const isExempt = [
            'whatsapp.com',
            'wa.me',
            't.me',
            'telegram.org',
            'twitter.com',
            'x.com',
            'facebook.com',
            'instagram.com',
            'linkedin.com',
            'youtube.com',
            'tiktok.com',
            'nairaland.com',
            'g.page'
          ].some(domain => urlStr.includes(domain));
          
          if (!isExempt) {
            e.preventDefault();
            e.stopPropagation();
            
            // Open in a new tab directly
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        }
      }
    };

    const handleOpenUrlEvent = (e: any) => {
      if (e.detail && e.detail.url) {
        window.open(e.detail.url, '_blank', 'noopener,noreferrer');
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    window.addEventListener('campusai_open_url', handleOpenUrlEvent);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('campusai_open_url', handleOpenUrlEvent);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('campusai_theme', theme); } catch(e) {}
  }, [theme]);

  // Smooth scroll anchor link system for external hashes and routing
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const state = location.state as any;

    if (state?.scrollTo) {
      const timer = setTimeout(() => {
        const targetElement = document.getElementById(state.scrollTo);
        if (targetElement) {
          const offset = 80; // Account for header
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }

    if (path.startsWith('/news')) {
      setCurrentPage('news');
    } else if (path.startsWith('/postutme')) {
      setCurrentPage('postutme');
    } else if (path.startsWith('/calculator')) {
      setCurrentPage('calculator');
    } else if (path.startsWith('/syllabus')) {
      setCurrentPage('syllabus');
    } else if (path.startsWith('/admissions')) {
      setCurrentPage('admissions');
    } else if (path.startsWith('/result-slip')) {
      setCurrentPage('result-slip');
    } else if (path.startsWith('/dashboard')) {
      setCurrentPage('dashboard');
    } else if (path.includes('privacy')) {
      setCurrentPage('privacy');
    } else if (path.includes('terms')) {
      setCurrentPage('terms');
    } else if (path.includes('cookie')) {
      setCurrentPage('cookies');
    } else {
      setCurrentPage('home');
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (location.hash) {
        const targetId = location.hash.replace('#', '');
        
        // Wait slightly for layout, fully mount components, and fetch activities
        const timer = setTimeout(() => {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 350); // elegant duration allowing absolute complete rendering

        return () => clearTimeout(timer);
      }
    };

    handleScroll();
  }, [location.hash, location.pathname]);

  const handleAuthSuccess = async (email: string, role?: UserRole) => {
    if (auth.currentUser) {
      const profile = await initializeUserProfile(auth.currentUser, role);
      setUser({ ...auth.currentUser, ...profile });
      // Redirect to dashboard after successful login
      navigate('/dashboard');

      // Auto trigger Tour for newly signed-in/up user if they haven't seen it
      const hasSeenTour = localStorage.getItem('campusai_has_seen_tour');
      if (!hasSeenTour) {
        setIsTourOpen(true);
      }
    }
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('campusai_user_session');
    localStorage.removeItem('campusai_user_profile');
    try {
      sessionStorage.removeItem('campusai_chat_messages');
      if (user?.uid) {
        sessionStorage.removeItem(`campusai_chat_messages_${user.uid}`);
      }
    } catch (e) {}
    window.dispatchEvent(new Event('campusai_clear_chat'));
    setUser(null);
    setAdminAuth({ isLoggedIn: false, email: null });
    setCurrentPage('home');
    navigate('/');
  };

  const handleNavigate = useCallback((p: string, params?: any) => {
    if (p === 'settings') {
      setIsSettingsOpen(true);
    } else if (p === 'admin') {
      setCurrentPage('admin');
      navigate('/'); 
    } else if (p === 'calculator') {
      setCurrentPage('calculator');
      navigate('/calculator');
      window.scrollTo(0, 0);
    } else if (p === 'cgpa' || p === 'cgpa-calculator') {
      setCurrentPage('cgpa');
      navigate('/cgpa-calculator');
      window.scrollTo(0, 0);
    } else if (p === 'syllabus') {
      setCurrentPage('syllabus');
      navigate('/syllabus');
      window.scrollTo(0, 0);
    } else if (p === 'admissions') {
      setCurrentPage('admissions');
      navigate('/admissions');
      window.scrollTo(0, 0);
    } else if (p === 'universities' || p === 'directory') {
      if (params?.category) {
        setDirectoryInitialCategory(params.category);
      } else {
        setDirectoryInitialCategory('All');
      }
      setCurrentPage('universities');
      navigate('/universities');
      window.scrollTo(0, 0);
    } else if (p === 'result-slip') {
      setCurrentPage('result-slip');
      navigate('/result-slip');
      window.scrollTo(0, 0);
    } else if (p === 'checklist' || p === 'admission-checklist') {
      setCurrentPage('checklist');
      navigate('/admission-checklist');
      window.scrollTo(0, 0);
    } else if (p === 'news' || p === 'jamb') {
      setCurrentPage('news');
      navigate('/news');
      window.scrollTo(0, 0);
    } else if (p === 'postutme') {
      setCurrentPage('postutme');
      navigate('/postutme');
      window.scrollTo(0, 0);
    } else if (p === 'terms' || p === 'privacy' || p === 'cookies') {
      setCurrentPage(p);
      navigate(`/${p}`);
      window.scrollTo(0, 0);
    } else if (p === 'status') {
      setCurrentPage('status');
      navigate('/status');
      window.scrollTo(0, 0);
    } else if (p === 'about') {
      setCurrentPage('about');
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('about');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setCurrentPage(p);
      if (p === 'home' && user) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
      window.scrollTo(0, 0);
    }
  }, [navigate, user]);

  const openArticle = (article: NewsItem) => {
    const slug = article.slug || slugify(article.title);
    setActiveArticle(article);
    navigate(`/news/${slug}`, { state: { article } });
    window.scrollTo(0, 0);
  };

  const closeArticle = () => {
    setActiveArticle(null);
    navigate('/news');
  };



  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      <AnimatePresence>
        {!isOnline && (
          <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="fixed top-0 left-0 right-0 z-[1000] bg-orange-600 text-white px-4 py-2.5 flex items-center justify-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Offline Shield Active</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
        user={user}
        admin={adminState}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        onLoginRequest={() => navigate('/login')}
        onShareRequest={() => setIsShareOpen(true)}
        onInviteEarnRequest={() => setIsInviteEarnOpen(true)}
        onScholarPackRequest={() => setIsScholarPackOpen(true)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Global Important Message Banner across all pages */}
      {(() => {
        const importantItem = news.find(n => n.isImportant) || news[0];
        if (!importantItem) return null;
        return (
          <div className="pt-20 md:pt-24 px-4 bg-transparent">
            <div className="container mx-auto max-w-7xl">
              <div 
                onClick={() => openArticle(importantItem)}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white p-3.5 md:p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:opacity-95 transition-all group border border-white/20"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-white/25 backdrop-blur-md flex items-center justify-center shrink-0 animate-pulse">
                    <span className="text-white text-xs font-black">📢</span>
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-200 block">Important Update & Download PDF</span>
                    <p className="text-xs md:text-sm font-black truncate group-hover:underline">{importantItem.title}</p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {isAuthorizedAdmin && (
                    <div className="hidden sm:flex items-center gap-1 bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/20" onClick={e => e.stopPropagation()}>
                      <span className="text-[9px] font-black text-amber-300 uppercase px-1.5">Admin:</span>
                      <select
                        value={importantItem.id}
                        onChange={async (e) => {
                          const selectedId = e.target.value;
                          if (selectedId) {
                            const { setImportantBannerArticle } = await import('../services/dbService');
                            await setImportantBannerArticle(selectedId, news);
                          }
                        }}
                        className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/20 outline-none cursor-pointer"
                        title="Select which article to feature on this top banner"
                      >
                        {news.map(n => (
                          <option key={n.id} value={n.id} className="bg-slate-900 text-white text-xs">
                            {n.isImportant ? "📌 [BANNER] " : ""}{n.title?.substring(0, 45)}...
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-900 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md">
                    <span>View & Download</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <Suspense fallback={null}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          user={user}
          onLoginRequest={() => navigate('/login')}
          onInviteEarnRequest={() => setIsInviteEarnOpen(true)}
          onScholarPackRequest={() => setIsScholarPackOpen(true)}
          theme={theme}
          onThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        />
      </Suspense>

      <main className="pb-40">
        <Suspense fallback={
          <div className="min-h-[40vh] bg-gray-950 flex flex-col items-center justify-center p-6 gap-3">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Loading Section...</p>
          </div>
        }>
          <Routes>
          <Route path="/login" element={<LoginPage user={user} onSuccess={handleAuthSuccess} />} />
          <Route path="/signup" element={<LoginPage user={user} onSuccess={handleAuthSuccess} />} />
          <Route path="/auth" element={<LoginPage user={user} onSuccess={handleAuthSuccess} />} />
          <Route path="/chat" element={
            <div className="pt-24 min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center pb-24">
              <SEO title="AI Chat | CampusAI" description="Chat with your Academic Strategist" canonical="/chat" />
              <div className="w-full max-w-4xl px-4 md:px-8 flex flex-col h-[calc(100vh-6rem)] relative">
                <AIChatDrawer isOpen={true} onClose={() => {}} inline={true} user={user} />
              </div>
            </div>
          } />

          <Route path="/dashboard" element={
            <>
              <SEO 
                title="Student Dashboard | 2026 Admission Progress" 
                description="Monitor your JAMB scores, university merit chances, and academic progress in real-time. Personalized AI insights for the 2026 Nigerian admission cycle."
                canonical="/dashboard"
              />
              <Dashboard 
                user={user} 
                onLoginRequest={() => navigate('/login')} 
                onScholarPackRequest={() => setIsScholarPackOpen(true)}
                onReadArticle={openArticle} 
              />
            </>
          } />

          <Route path="/calculator" element={
            <div className="pt-24 min-h-screen bg-gray-950">
              <SEO 
                title="Official 2026 University Aggregate Calculator" 
                description="Universal 2026 admission aggregate calculator for all Nigerian Universities, Polytechnics, and Colleges of Education. Features official institutional formula compliance."
                canonical="/calculator"
              />
              <CutoffCalculator 
                user={user} 
                onLoginRequest={() => navigate('/login')} 
                onPremiumRequired={() => setIsScholarPackOpen(true)}
                onDiscussWithAI={(msg) => window.dispatchEvent(new CustomEvent('campusai_open_ai', { detail: msg }))} 
                initialSchoolName={selectedSchoolForChances}
                onClearInitialSchool={() => setSelectedSchoolForChances('')}
              />
            </div>
          } />

          <Route path="/:schoolSlug-aggregate-calculator" element={
            <SchoolCalculatorWrapper 
              user={user}
              setIsAuthModalOpen={setIsAuthModalOpen}
              setIsScholarPackOpen={setIsScholarPackOpen}
              selectedSchoolForChances={selectedSchoolForChances}
              setSelectedSchoolForChances={setSelectedSchoolForChances}
              onGoHome={() => handleNavigate('home')}
            />
          } />

          <Route path="/admissions" element={
            <div className="pt-24 md:pt-32 min-h-screen bg-gray-950">
              <SEO 
                title="2026 Admissions Knowledge Base | Course Requirements"
                description="Explore official JAMB 2026 course requirements, UTME subject combinations, O'Level credits, and institution-specific special considerations."
                canonical="/admissions"
              />
              <AdmissionsExplorer />
            </div>
          } />

          <Route path="/universities" element={
            <div className="pt-20 min-h-screen bg-white dark:bg-gray-950">
              <SEO 
                title="2026 Institutional Gateways & Portal Directory"
                description="Secure, direct access to verified admission portals, Post-UTME trackers, and academic profiles for over 150 Nigerian universities, polytechnics, and colleges."
                canonical="/universities"
              />
              <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading Directory...</div>}>
                <UniversityDirectory 
                  isPremium={user?.is_premium} 
                  onUpgrade={() => setIsScholarPackOpen(true)} 
                  initialCategory={directoryInitialCategory}
                />
              </Suspense>
            </div>
          } />

          <Route path="/universities/:slug" element={
            <div className="pt-20 min-h-screen bg-white dark:bg-gray-950">
              <SEO 
                title="Institutional Portal Profile & Post-UTME Tracker"
                description="Detailed profile, portal link, departments, and Post-UTME screening dates for Nigerian institutions."
                canonical="/universities"
              />
              <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading Institutional Portal...</div>}>
                <UniversityDirectory 
                  isPremium={user?.is_premium} 
                  onUpgrade={() => setIsScholarPackOpen(true)} 
                  initialCategory={directoryInitialCategory}
                />
              </Suspense>
            </div>
          } />

          <Route path="/postutme" element={
            <div className="pt-24 min-h-screen bg-gray-950">
              <SEO 
                title="2026/2027 Post-UTME Screening Hub & Release Dates"
                description="Official tracking for 2026 Post-UTME registration dates, screening schedules, and merit cut-off marks for Nigerian federal and state universities."
                canonical="/postutme"
              />
              <PostUtmeReleaseHub 
                onCalculateChances={(schoolName) => {
                    const nameLower = schoolName.toLowerCase();
                    let slug = '';
                    if (nameLower.includes('lagos') && !nameLower.includes('state')) slug = 'unilag';
                    else if (nameLower.includes('lasu') || nameLower.includes('lagos state')) slug = 'lasu';
                    else if (nameLower.includes('ibadan') || nameLower.includes(' ui')) slug = 'ui';
                    else if (nameLower.includes('awolowo') || nameLower.includes('oau')) slug = 'oau';
                    else if (nameLower.includes('benin') || nameLower.includes('uniben')) slug = 'uniben';
                    else if (nameLower.includes('ilorin') || nameLower.includes('unilorin')) slug = 'unilorin';
                    else if (nameLower.includes('nsukka') || nameLower.includes('unn') || nameLower.includes('nigeria')) slug = 'unn';
                    else if (nameLower.includes('akure') || nameLower.includes('futa')) slug = 'futa';
                    else if (nameLower.includes('abu') || nameLower.includes('abello')) slug = 'abu';

                    if (slug) {
                      navigate(`/${slug}-aggregate-calculator`);
                    } else {
                      setSelectedSchoolForChances(schoolName);
                      navigate('/calculator');
                    }
                    window.scrollTo(0, 0);
                }}
                user={user}
                onLoginRequest={() => navigate('/login')}
              />
            </div>
          } />

          <Route path="/post-utme" element={
            <div className="pt-24 min-h-screen bg-gray-950">
              <SEO 
                title="2026/2027 Post-UTME Screening Hub & Release Dates"
                description="Official tracking for 2026 Post-UTME registration dates, screening schedules, and merit cut-off marks for Nigerian federal and state universities."
                canonical="/postutme"
              />
              <PostUtmeReleaseHub 
                onCalculateChances={(schoolName) => {
                    const nameLower = schoolName.toLowerCase();
                    let slug = '';
                    if (nameLower.includes('lagos') && !nameLower.includes('state')) slug = 'unilag';
                    else if (nameLower.includes('lasu') || nameLower.includes('lagos state')) slug = 'lasu';
                    else if (nameLower.includes('ibadan') || nameLower.includes(' ui')) slug = 'ui';
                    else if (nameLower.includes('awolowo') || nameLower.includes('oau')) slug = 'oau';
                    else if (nameLower.includes('benin') || nameLower.includes('uniben')) slug = 'uniben';
                    else if (nameLower.includes('ilorin') || nameLower.includes('unilorin')) slug = 'unilorin';
                    else if (nameLower.includes('nsukka') || nameLower.includes('unn') || nameLower.includes('nigeria')) slug = 'unn';
                    else if (nameLower.includes('akure') || nameLower.includes('futa')) slug = 'futa';
                    else if (nameLower.includes('abu') || nameLower.includes('abello')) slug = 'abu';

                    if (slug) {
                      navigate(`/${slug}-aggregate-calculator`);
                    } else {
                      setSelectedSchoolForChances(schoolName);
                      navigate('/calculator');
                    }
                    window.scrollTo(0, 0);
                }}
                user={user}
                onLoginRequest={() => navigate('/login')}
              />
            </div>
          } />

          <Route path="/result-slip" element={
            <div className="pt-24 min-h-screen bg-gray-950">
              <SEO 
                title="2026/2027 Post-UTME Screening Hub & Result Slip"
                description="Official tracking for 2026 Post-UTME registration dates, screening schedules, and JAMB Original Result Slip printing."
                canonical="/result-slip"
              />
              <PostUtmeReleaseHub 
                onCalculateChances={(schoolName) => {
                    const nameLower = schoolName.toLowerCase();
                    let slug = '';
                    if (nameLower.includes('lagos') && !nameLower.includes('state')) slug = 'unilag';
                    else if (nameLower.includes('lasu') || nameLower.includes('lagos state')) slug = 'lasu';
                    else if (nameLower.includes('ibadan') || nameLower.includes(' ui')) slug = 'ui';
                    else if (nameLower.includes('awolowo') || nameLower.includes('oau')) slug = 'oau';
                    else if (nameLower.includes('benin') || nameLower.includes('uniben')) slug = 'uniben';
                    else if (nameLower.includes('ilorin') || nameLower.includes('unilorin')) slug = 'unilorin';
                    else if (nameLower.includes('nsukka') || nameLower.includes('unn') || nameLower.includes('nigeria')) slug = 'unn';
                    else if (nameLower.includes('akure') || nameLower.includes('futa')) slug = 'futa';
                    else if (nameLower.includes('abu') || nameLower.includes('abello')) slug = 'abu';
                    
                    if (slug) {
                      navigate(`/${slug}-aggregate-calculator`);
                    } else {
                      setSelectedSchoolForChances(schoolName);
                      navigate('/calculator');
                    }
                    window.scrollTo(0, 0);
                }}
                user={user}
                onLoginRequest={() => navigate('/login')}
              />
            </div>
          } />

          <Route path="/result-slip-guide" element={
            <div className="pt-24 min-h-screen bg-gray-950">
              <SEO 
                title="JAMB Original Result Slip Printing Guide & Portal"
                description="Step-by-step guidelines on how to print your original JAMB result slip from the e-Facility portal for Post-UTME screening."
                canonical="/result-slip-guide"
              />
              <AdmissionsExplorer initialArticleId="jamb_result_slip" />
            </div>
          } />

          <Route path="/syllabus" element={
            <div className="pt-24 md:pt-32 min-h-screen bg-gray-950 px-4 md:px-8">
              <SEO 
                title="UTME Master Syllabus Explorer - JAMB 2026/2027"
                description="Browse official UTME examination syllabuses for Chemistry, Biology, Physics, Mathematics, English, Commerce, Economics, Government, CRS, French, Art, Arabic, and Computer Studies."
              />
              <SyllabusExplorer 
                onAskAI={(topicQuery) => {
                  window.dispatchEvent(new CustomEvent('campusai_open_ai', { detail: topicQuery }));
                }}
              />
            </div>
          } />

          <Route path="/cgpa-calculator" element={
            <div className="pt-24 min-h-screen bg-white dark:bg-gray-950">
              <SEO 
                title="CGPA Analytics Studio & GPA Planner (Coming Soon)"
                description="Multi-semester CGPA tracking, trajectory forecasting, and grade analytics for university and polytechnic students in Nigeria."
                canonical="/cgpa-calculator"
              />
              <CGPACalculator 
                user={user} 
                isPremium={user?.is_premium} 
                onUpgrade={() => setIsScholarPackOpen(true)} 
              />
            </div>
          } />

          <Route path="/cgpa" element={
            <div className="pt-24 min-h-screen bg-white dark:bg-gray-950">
              <SEO 
                title="CGPA Analytics Studio & GPA Planner (Coming Soon)"
                description="Multi-semester CGPA tracking, trajectory forecasting, and grade analytics for university and polytechnic students in Nigeria."
                canonical="/cgpa-calculator"
              />
              <CGPACalculator 
                user={user} 
                isPremium={user?.is_premium} 
                onUpgrade={() => setIsScholarPackOpen(true)} 
              />
            </div>
          } />

          <Route path="/" element={
            <>
              <SEO />
               {(currentPage === 'home' || currentPage === 'jamb' || currentPage === 'news') && (
                <>
                  <HeroSection 
                    user={user} 
                    badgeText={user ? `Welcome back, ${user?.displayName?.split(' ')[0] || 'Scholar'}` : undefined}
                    title={user ? <>Your <span className="text-blue-500">Admission</span> Dashboard</> : undefined}
                    subtitle={user ? "Your AI admission strategist is active. Use the tools below to calculate your aggregate and track your chances." : undefined}
                    onLaunchCalculator={() => {
                      setCurrentPage('calculator');
                      navigate('/calculator');
                    }}
                  />
                  
                  <Suspense fallback={<div className="h-40 flex items-center justify-center text-blue-500">Loading tools...</div>}>
                    <ToolsGrid />
                  </Suspense>

                  
                  <div className="container mx-auto px-4 md:px-8 mt-20 max-w-lg">
                    {user && (
                      <>
                        <div className="mb-12">
                          <InviteEarn user={user} />
                        </div>
                        <RecentActivity userId={isRealUser(user?.uid) ? user.uid : null} />
                      </>
                    )}
                  </div>

                  {/* FAQ block — back to centered */}
                  <div className="mt-24 px-4 md:px-8">
                    <div className="text-left p-6 md:p-8 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[32px] max-w-2xl mx-auto space-y-3">
                      <h3 className="text-sm md:text-base font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        💡 How can I calculate my 2026 university aggregate score?
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                        To calculate your aggregate score for the 2026 admission cycle, use the CampusAI.ng predictive engine. Our system automatically applies the latest institutional formulas for Nigerian universities—including the 50/50 JAMB-to-Post-UTME ratio, O'Level point grading, and ELDS (Educationally Less Developed States) quota criteria—while ensuring your results comply with the current 150-score national minimum threshold. You can also use our Custom Formula Mode to manually define your own aggregate percentage ratio if your institution's formula isn't listed.
                      </p>
                    </div>
                  </div>

                  {/* TOP RANKINGS SECTION */}
                  <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading Rankings...</div>}>
                    <TopRankings onSelectUni={(slug) => {
                      setCurrentPage('universities');
                      navigate(`/universities/${slug}`);
                    }} />
                  </Suspense>

                  {/* INSTITUTIONAL PORTAL DIRECTORY */}
                  <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading Portal Directory...</div>}>
                    <UniversityDirectory 
                      isPremium={user?.is_premium} 
                      onUpgrade={() => setIsScholarPackOpen(true)} 
                      initialCategory={directoryInitialCategory}
                    />

                  </Suspense>

                  {/* POLICIES SECTION */}
                  <PolicySection />

                  {/* NEWS SECTION */}
                  <section id="news" className="container mx-auto px-4 md:px-8 py-16">
                    <NewsGrid 
                      user={user} 
                      onReadArticle={openArticle} 
                      onLoginRequest={() => navigate('/login')} 
                      isMiniPreview={true}
                    />

                  </section>

                  {/* TESTIMONIALS SECTION */}
                  <Testimonials />

                  {/* FAQ SECTION */}
                  <FAQSection />
                </>
              )}

              {currentPage === 'about' && (
                <div className="pt-24">
                  <AboutSection />
                </div>
              )}

              {currentPage === 'admin' && isAuthorizedAdmin && (
                <AdminPanel 
                    isOpen={true} 
                    onClose={() => setCurrentPage('home')} 
                    admin={adminState} 
                    onAdminLogin={(email) => setAdminAuth({ isLoggedIn: true, email })} 
                    onAdminLogout={handleLogout}
                    systemStatus={{ gemini: 'online', firebase: 'online' }}
                  />

              )}
            </>
          } />
          
      <Route path="/news" element={
        <div className="container mx-auto px-4 md:px-8 pt-24 pb-20 min-h-screen">
          <SEO 
            title="2026/2027 JAMB & Admission News Hub" 
            description="Stay updated with official admission guidelines, Post-UTME registration dates, and university screening schedules for the 2026 Nigerian academic cycle."
            canonical="/news"
          />
          <NewsGrid 
            user={user} 
            onReadArticle={openArticle} 
            onLoginRequest={() => navigate('/login')} 
          />
        </div>
      } />
          
          <Route path="/news/:slug" element={
            <NewsDetailWrapper 
              user={user} 
              isAuthorizedAdmin={isAuthorizedAdmin} 
              news={news} 
              setIsAuthModalOpen={setIsAuthModalOpen} 
              closeArticle={closeArticle} 
            />
          } />

          <Route path="/postutme" element={
            <div className="pt-8 min-h-screen bg-gray-950">
              <SEO 
                title="2026/2027 Post-UTME Hub | Registration & Schedules" 
                description="Official tracking for 2026 Post-UTME registration dates, exam schedules, and merit cut-off marks for Nigerian federal and state universities."
                canonical="/postutme"
              />
              <PostUtmeReleaseHub 
                user={user} 
                onLoginRequest={() => navigate('/login')}
                onCalculateChances={(schoolName) => {
                  setSelectedSchoolForChances(schoolName);
                  setCurrentPage('home');
                  navigate('/');
                }}
              />
            </div>
          } />

          <Route path="/admission-checklist" element={
            <>
              <SEO 
                title="2026 Admission Document Checklist | CampusAI" 
                description="The complete list of required documents for Nigerian university registration. Don't miss a deadline with our comprehensive 2026 checklist."
                canonical="/admission-checklist"
              />
              <AdmissionChecklistPage />
            </>
          } />
          <Route path="/terms" element={<><SEO title="Terms of Service" canonical="/terms" /><LegalSection type="terms" /></>} />
          <Route path="/terms-of-service" element={<><SEO title="Terms of Service" canonical="/terms" /><LegalSection type="terms" /></>} />
          <Route path="/privacy" element={<><SEO title="Privacy Policy" canonical="/privacy" /><LegalSection type="privacy" /></>} />
          <Route path="/privacy-policy" element={<><SEO title="Privacy Policy" canonical="/privacy" /><LegalSection type="privacy" /></>} />
          <Route path="/calculator-privacy" element={<><SEO title="Calculator Privacy Policy" canonical="/privacy" /><LegalSection type="privacy" /></>} />
          <Route path="/calculation-privacy" element={<><SEO title="Calculator Privacy Policy" canonical="/privacy" /><LegalSection type="privacy" /></>} />
          <Route path="/cookies" element={<><SEO title="Cookie Policy" canonical="/cookies" /><LegalSection type="cookies" /></>} />
          <Route path="/cookie-policy" element={<><SEO title="Cookie Policy" canonical="/cookies" /><LegalSection type="cookies" /></>} />
          
          <Route path="/status" element={<><SEO title="System Status" canonical="/status" /><StatusPage /></>} />
          <Route path="*" element={<NotFound onGoHome={() => handleNavigate('home')} />} />
        </Routes>
        </Suspense>
      </main>

      {/* WHATSAPP STICKY BANNER */}
      <div className="fixed bottom-24 right-4 md:right-8 md:bottom-24 z-[100] group flex items-center">
        <a 
          href="https://whatsapp.com/channel/0029VbD6bCD1NCraoIlpD218"
          target="_blank"
          rel="noopener noreferrer"
          className="relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-full md:rounded-2xl shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all group border border-green-500/20"
          title="Join WhatsApp Updates Channel"
        >
          <div className="flex items-center justify-center shrink-0">
            <MessageSquare size={24} className="group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="hidden md:block overflow-hidden max-w-xs transition-all duration-300">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Updates</p>
            <p className="text-xs font-bold leading-none truncate pr-2">Join Channel 📲</p>
          </div>
        </a>
      </div>

      <Footer 
        onNavigate={handleNavigate} 
        onOpenLegal={(type) => setLegalModal({ isOpen: true, type })} 
        onOpenSupport={() => setIsSupportOpen(true)} 
        isAdmin={isAuthorizedAdmin} 
        socialLinks={socialLinks}
      />
      
      <MobileBottomNav activeTab={currentPage} user={user} onNavigate={handleNavigate} />
      
      <Suspense fallback={null}>
        <SupportModal 
          isOpen={isSupportOpen} 
          onClose={() => setIsSupportOpen(false)} 
          onNavigateAI={() => window.dispatchEvent(new CustomEvent('campusai_open_ai', { detail: 'Hello CampusAI, I have some questions about the 2026 admission cycle requirements.' }))} 
        />
        
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
        <UserSettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          theme={theme} onThemeChange={setTheme} onLogout={handleLogout}
          onLoginRequest={() => navigate('/login')}
          onStartTour={() => setIsTourOpen(true)}
        />
        <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
        <InviteEarnModal isOpen={isInviteEarnOpen} onClose={() => setIsInviteEarnOpen(false)} user={user} />
        <ScholarPackModal isOpen={isScholarPackOpen} onClose={() => setIsScholarPackOpen(false)} user={user} paymentConfig={paymentConfig} />
        <LegalModal isOpen={legalModal.isOpen} type={legalModal.type} onClose={() => setLegalModal({ ...legalModal, isOpen: false })} />
        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} user={user} />
        <AIChatDrawer user={user} />
        <CookieConsent />
        <InstallPrompt />
        <Tour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
      </Suspense>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
};

export default App;
