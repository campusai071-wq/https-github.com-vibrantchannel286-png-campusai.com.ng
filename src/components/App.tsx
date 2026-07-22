import React, { useState, useEffect, useCallback, useRef } from 'react';
import PolicySection from './PolicySection';
import AboutSection from './AboutSection';
import Dashboard from './Dashboard';
import Navbar from './Navbar';
import NewsGrid from './NewsGrid';
import RecentActivity from './RecentActivity';
import AdminPanel from './AdminPanel';
import UserSettingsModal from './UserSettingsModal';
import NewsDetailView from './NewsDetailView';
import AuthModal from './AuthModal';
import ShareModal from './ShareModal';
import InviteEarnModal from './InviteEarnModal';
import ScholarPackModal from './ScholarPackModal';
import SupportModal from './SupportModal';
import LegalModal from './LegalModal';
import CookieConsent from './CookieConsent';
import LegalSection from './LegalSection';
import CutoffCalculator from './CutoffCalculator';
import InviteEarn from './InviteEarn';
import PostUtmeReleaseHub from './PostUtmeReleaseHub';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import AIChatDrawer from './AIChatDrawer';
import FAQSection from './FAQSection';
import Tour from './Tour';
import InstallPrompt from './InstallPrompt';
import { useNotificationManager } from '../hooks/useNotificationManager';
import { useStandalone } from '../hooks/useStandalone';
import CalculationAnimation from './CalculationAnimation';
import HeroSection from './HeroSection';
import Testimonials from './Testimonials';
import StatusPage from './StatusPage';
import NotFound from './NotFound';
import FeedbackModal from './FeedbackModal';
import AdmissionChecklistPage from './AdmissionChecklistPage';
import { GoogleWorkspaceHub } from './GoogleWorkspaceHub';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './SEO';
import { auth } from '../services/firebaseConfig';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { initializeUserProfile, subscribeToUserProfile, isRealUser } from '../services/userService';
import { AdminState, NewsItem, UserRole } from '../types';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGlobalConfig, getGlobalSyncMetadata } from '../services/dbService';
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
  
  const currentNews = news.find((n: NewsItem) => n.id === slug || n.slug === slug || n.title.toLowerCase().split(' ').join('-') === slug);
  
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
      <NewsDetailView 
        user={user} 
        isAdmin={isAuthorizedAdmin}
        onClose={closeArticle} 
        onLoginRequest={() => setIsAuthModalOpen(true)}
        relatedNews={filteredRelated} 
        onSelectRelated={handleSelectRelated} 
      />
    </div>
  );
};

const SchoolCalculatorWrapper = ({ user, setIsAuthModalOpen, setIsScholarPackOpen, selectedSchoolForChances, setSelectedSchoolForChances }: any) => {
  const { schoolSlug } = useParams();
  
  // Try to find the original school name from the slug (e.g. unilag -> University of Lagos)
  let computedSchoolName = selectedSchoolForChances || schoolSlug;
  
  if (schoolSlug === 'unilag') computedSchoolName = 'University of Lagos (UNILAG)';
  else if (schoolSlug === 'lasu') computedSchoolName = 'Lagos State University (LASU)';
  else if (schoolSlug === 'ui') computedSchoolName = 'University of Ibadan (UI)';
  else if (schoolSlug === 'oau') computedSchoolName = 'Obafemi Awolowo University (OAU)';
  else if (schoolSlug === 'uniben') computedSchoolName = 'University of Benin (UNIBEN)';
  else if (schoolSlug === 'unilorin') computedSchoolName = 'University of Ilorin (UNILORIN)';
  else if (schoolSlug === 'unn') computedSchoolName = 'University of Nigeria, Nsukka (UNN)';
  else if (schoolSlug === 'futa') computedSchoolName = 'Federal University of Technology Akure (FUTA)';
  else if (schoolSlug === 'abu') computedSchoolName = 'Ahmadu Bello University (ABU)';

  return (
    <div className="pt-24 min-h-screen bg-gray-950">
      <CutoffCalculator 
        user={user} 
        onLoginRequest={() => setIsAuthModalOpen(true)} 
        onPremiumRequired={() => setIsScholarPackOpen(true)}
        onDiscussWithAI={(msg) => window.dispatchEvent(new CustomEvent('campusai_open_ai', { detail: msg }))} 
        initialSchoolName={computedSchoolName}
        onClearInitialSchool={() => setSelectedSchoolForChances('')}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  useNotificationManager();
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = useStandalone();
  
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSchoolForChances, setSelectedSchoolForChances] = useState<string>('');
  const [user, setUser] = useState<any>(null);
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
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
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

    const interval = setInterval(async () => {
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
          const newsItems = await getCloudNews(true);
          
          const newlyAdded = newsItems.filter(item => {
            const itemTime = toMs(item.archivedAt) || toMs(item.createdAt) || toMs(item.updatedAt) || (item.date ? toMs(item.date) : 0);
            return itemTime > previousSyncTime;
          });

          if (newlyAdded.length > 0) {
            // Deduplicate newly added articles to avoid duplicate notifications
            const uniqueNewDocs: any[] = [];
            const seenNormTitles = new Set<string>();
            
            newlyAdded.forEach(article => {
              const norm = article.title.trim().toLowerCase().replace(/\s+/g, ' ');
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
    }, 60000);

    return () => {
      clearInterval(interval);
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
      
      const { getCloudNews } = await import('../services/dbService');
      const newsItems = await getCloudNews(true);
      
      // Sort news by date descending to ensure latest are at the top
      const sortedNews = [...newsItems].sort((a, b) => {
        const timeA = toMs(a.archivedAt) || toMs(a.createdAt) || toMs(a.updatedAt) || (a.date ? toMs(a.date) : 0);
        const timeB = toMs(b.archivedAt) || toMs(b.createdAt) || toMs(b.updatedAt) || (b.date ? toMs(b.date) : 0);
        return timeB - timeA;
      });

      setNews(sortedNews);
    };

    loadGlobalSettings();

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    const reloadNews = async () => {
      try {
        const { getCloudNews } = await import('../services/dbService');
        const newsItems = await getCloudNews(true);
        const sortedNews = [...newsItems].sort((a, b) => {
          const timeA = toMs(a.archivedAt) || toMs(a.createdAt) || toMs(a.updatedAt) || (a.date ? toMs(a.date) : 0);
          const timeB = toMs(b.archivedAt) || toMs(b.createdAt) || toMs(b.updatedAt) || (b.date ? toMs(b.date) : 0);
          return timeB - timeA;
        });
        setNews(sortedNews);
      } catch (err) {
        console.error("App: reloadNews error:", err);
      }
    };
    window.addEventListener('campusai_news_updated', reloadNews);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        const profile = await initializeUserProfile(firebaseUser);
        setUser({ ...firebaseUser, ...profile });
        subscribeToUserProfile(firebaseUser.uid, (updatedProfile) => {
           setUser((curr: any) => curr ? { ...curr, ...updatedProfile } : null);
        });
      } else {
        localStorage.removeItem('campusai_user_profile');
        window.dispatchEvent(new Event('campusai_clear_chat'));
        setUser(null);
        // If we are on dashboard but not logged in, go to home
        if (window.location.pathname === '/dashboard') {
          navigate('/');
        }
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
      setIsAuthModalOpen(true);
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
    const path = location.pathname;
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
    } else if (path.startsWith('/result-slip')) {
      setCurrentPage('result-slip');
    } else if (path.startsWith('/dashboard')) {
      setCurrentPage('dashboard');
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

  const handleNavigate = useCallback((p: string) => {
    if (p === 'settings') {
      setIsSettingsOpen(true);
    } else if (p === 'admin') {
      setCurrentPage('admin');
      navigate('/'); 
    } else if (p === 'calculator') {
      setCurrentPage('calculator');
      navigate('/calculator');
      window.scrollTo(0, 0);
    } else if (p === 'result-slip') {
      setCurrentPage('result-slip');
      navigate('/result-slip');
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
    navigate(`/news/${slug}`);
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
        onLoginRequest={() => setIsAuthModalOpen(true)}
        onShareRequest={() => setIsShareOpen(true)}
        onInviteEarnRequest={() => setIsInviteEarnOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
      />

      <SEO 
        title={activeArticle?.title} 
        description={activeArticle?.excerpt} 
        article={!!activeArticle} 
        isCalculator={!activeArticle}
      />

      <main className="pb-40">
        <Routes>
          <Route path="/dashboard" element={
            <Dashboard 
              user={user} 
              onLoginRequest={() => setIsAuthModalOpen(true)} 
              onScholarPackRequest={() => setIsScholarPackOpen(true)}
              onReadArticle={openArticle} 
            />
          } />

          <Route path="/calculator" element={
            <div className="pt-24 min-h-screen bg-gray-950">
              <CutoffCalculator 
                user={user} 
                onLoginRequest={() => setIsAuthModalOpen(true)} 
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
            />
          } />

          <Route path="/result-slip" element={
            <div className="pt-24 min-h-screen bg-gray-950">
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
                onLoginRequest={() => setIsAuthModalOpen(true)}
              />
            </div>
          } />

          <Route path="/" element={
            <>
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
                      <h2 className="text-sm md:text-base font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        💡 How can I calculate my 2026 university aggregate score?
                      </h2>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                        To calculate your aggregate score for the 2026 admission cycle, use the CampusAI.ng predictive engine. Our system automatically applies the latest institutional formulas for Nigerian universities—including the 50/50 JAMB-to-Post-UTME ratio and O'Level point grading—while ensuring your results comply with the current 150-score national minimum threshold.
                      </p>
                    </div>
                  </div>

                  {/* POLICIES SECTION */}
                  <PolicySection />

                  {/* NEWS SECTION */}
                  <section id="news" className="container mx-auto px-4 md:px-8 py-16">
                    <NewsGrid 
                      user={user} 
                      onReadArticle={openArticle} 
                      onLoginRequest={() => setIsAuthModalOpen(true)} 
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
              <NewsGrid 
                user={user} 
                onReadArticle={openArticle} 
                onLoginRequest={() => setIsAuthModalOpen(true)} 
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
              <PostUtmeReleaseHub 
                user={user} 
                onLoginRequest={() => setIsAuthModalOpen(true)}
                onCalculateChances={(schoolName) => {
                  setSelectedSchoolForChances(schoolName);
                  setCurrentPage('home');
                  navigate('/');
                }}
              />
            </div>
          } />

          <Route path="/admission-checklist" element={<AdmissionChecklistPage />} />
          <Route path="/terms" element={<LegalSection type="terms" />} />
          <Route path="/privacy" element={<LegalSection type="privacy" />} />
          <Route path="/cookies" element={<LegalSection type="cookies" />} />
          
          <Route path="/status" element={<StatusPage />} />
          <Route path="/calculator" element={<Navigate to="/" state={{ scrollTo: 'calculator' }} replace />} />
          <Route path="*" element={<NotFound onGoHome={() => handleNavigate('home')} />} />
        </Routes>
      </main>

      {/* WHATSAPP STICKY BANNER */}
      <div className="fixed bottom-24 right-4 md:right-8 md:bottom-8 z-[100] group flex items-center">
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
        onLoginRequest={() => setIsAuthModalOpen(true)}
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
      {isWorkspaceOpen && <GoogleWorkspaceHub user={user} onClose={() => setIsWorkspaceOpen(false)} />}
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
