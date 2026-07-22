import { stringify } from '../services/utils';
import React, { useState, useEffect } from 'react';
import { X, Save, Database, Layout, CheckCircle2, Moon, Sun, Lock, LogOut, Plus, Trash2, ShieldCheck, Globe, Megaphone, DollarSign, MessageCircle, Share2, Facebook, Instagram, Linkedin, Twitter, Youtube, Newspaper, Send, Loader2, Link as LinkIcon, Calendar, ShoppingBag, Tag, Key, Info as InfoIcon, ExternalLink, Activity, AlertCircle, BarChart3, Users, Zap, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialLink, AdminState, BillboardAd, NewsItem, UniversityCategory } from '../types';
import { getPublishedNews, publishNewsUpdate, deleteNewsUpdate } from '../services/dbService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  admin: AdminState;
  onAdminLogin: (email: string) => void;
  onAdminLogout: () => void;
  socialLinks: SocialLink[];
  onUpdateSocialLinks: (links: SocialLink[]) => void;
  systemStatus?: { gemini: string; firebase: string };
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  theme, 
  onThemeChange, 
  admin, 
  onAdminLogin, 
  onAdminLogout,
  socialLinks,
  onUpdateSocialLinks,
  systemStatus
}) => {
  const [firebaseConfig, setFirebaseConfig] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [loginEmail, setLoginEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [googleAdsEnabled, setGoogleAdsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'monetization' | 'admin'>('general');
  const [saved, setSaved] = useState(false);
  const [editingLinks, setEditingLinks] = useState<SocialLink[]>([]);
  
  // News Management State
  const [showPostForm, setShowPostForm] = useState(false);
  const [publishedNews, setPublishedNews] = useState<NewsItem[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newPost, setNewPost] = useState<Partial<NewsItem>>({
    category: 'Federal',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  });

  // Billboard Ads Management State
  const [billboardAds, setBillboardAds] = useState<BillboardAd[]>([]);
  const [showAdForm, setShowAdForm] = useState(false);
  const [isPublishingAd, setIsPublishingAd] = useState(false);
  const [newAd, setNewAd] = useState<Partial<BillboardAd>>({
    category: 'Services',
    isVerified: true,
    isSponsored: true
  });

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('campusai_firebase');
      if (stored) setFirebaseConfig(stored);
      
      const storedWhatsapp = localStorage.getItem('campusai_whatsapp');
      if (storedWhatsapp) setWhatsappNumber(storedWhatsapp);

      const storedAdsStatus = localStorage.getItem('campusai_google_ads') === 'true';
      setGoogleAdsEnabled(storedAdsStatus);
      
      const savedAds = localStorage.getItem('campusai_billboard_ads');
      if (savedAds) setBillboardAds(JSON.parse(savedAds));
      
      setPublishedNews(getPublishedNews());
      setEditingLinks(socialLinks);
    }
  }, [isOpen, socialLinks]);

  // Keep the News Management list in this modal in sync with changes made
  // elsewhere in the app (e.g. from the article detail view's AI tools).
  useEffect(() => {
    const handleExternalNewsUpdate = () => {
      setPublishedNews(getPublishedNews());
    };
    window.addEventListener('campusai_news_updated', handleExternalNewsUpdate);
    return () => {
      window.removeEventListener('campusai_news_updated', handleExternalNewsUpdate);
    };
  }, []);

  const validateFirebase = () => {
    setValidationStatus('validating');
    setTimeout(() => {
      try {
        let configStr = firebaseConfig.trim();
        // Check if it looks like a valid JSON object with apiKey
        const parsed = JSON.parse(configStr);
        if (parsed.apiKey && parsed.projectId) {
          setValidationStatus('valid');
        } else {
          setValidationStatus('invalid');
        }
      } catch (e) {
        setValidationStatus('invalid');
      }
    }, 1200);
  };

  const handleSave = () => {
    localStorage.setItem('campusai_firebase', firebaseConfig);
    localStorage.setItem('campusai_whatsapp', whatsappNumber);
    localStorage.setItem('campusai_google_ads', googleAdsEnabled ? 'true' : 'false');
    localStorage.setItem('campusai_billboard_ads', stringify(billboardAds));
    onUpdateSocialLinks(editingLinks);
    setSaved(true);
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => { 
      setSaved(false); 
      onClose(); 
      // Refresh to apply new Firebase config
      if (validationStatus === 'valid') window.location.reload();
    }, 1500);
  };

  const handlePublishPost = async () => {
    if (!newPost.title || !newPost.excerpt) return;
    setIsPublishing(true);
    try {
      await publishNewsUpdate({
        title: newPost.title,
        category: newPost.category as UniversityCategory,
        excerpt: newPost.excerpt,
        date: newPost.date || '',
        sourceUrl: newPost.sourceUrl,
        image: ''
      });
      setPublishedNews(getPublishedNews());
      // FIX: broadcast the update so the homepage feed, detail view, and
      // any other listener re-fetch the news list. Without this, the new
      // article only shows up inside this modal's own list until a full
      // reload happens to coincidentally re-fetch from the cloud.
      window.dispatchEvent(new Event('campusai_news_updated'));
      setNewPost({ 
        category: 'Federal', 
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) 
      });
      setShowPostForm(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm("Permanently delete this news update?")) {
      await deleteNewsUpdate(id);
      setPublishedNews(getPublishedNews());
      // FIX: same broadcast on delete, so removed articles disappear from
      // the homepage feed immediately instead of lingering until reload.
      window.dispatchEvent(new Event('campusai_news_updated'));
    }
  };

  const handlePublishAd = () => {
    if (!newAd.title || !newAd.description) return;
    setIsPublishingAd(true);
    // Guideline Fix: Ensure status is set
    const adToSave: BillboardAd = {
      id: Date.now().toString(),
      title: newAd.title!,
      description: newAd.description!,
      category: (newAd.category as any) || 'Services',
      price: newAd.price || 'Contact for price',
      link: newAd.link || '#',
      whatsapp: newAd.whatsapp,
      isVerified: !!newAd.isVerified,
      isSponsored: true,
      status: 'active'
    };
    const updatedAds = [adToSave, ...billboardAds];
    setBillboardAds(updatedAds);
    try {
      localStorage.setItem('campusai_billboard_ads', stringify(updatedAds));
    } catch (e) {
      console.error("Failed to stringify billboardAds:", updatedAds);
      throw e;
    }
    window.dispatchEvent(new Event('storage'));
    setNewAd({ category: 'Services', isVerified: true, isSponsored: true });
    setShowAdForm(false);
    setIsPublishingAd(false);
  };

  const handleDeleteAd = (id: string) => {
    if (window.confirm('Remove this advertisement?')) {
      const updated = billboardAds.filter(a => a.id !== id);
      setBillboardAds(updated);
      localStorage.setItem('campusai_billboard_ads', stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === '5ej852963@gmail.com') {
      onAdminLogin(loginEmail);
      setLoginEmail('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-950 w-full max-w-4xl rounded-[32px] md:rounded-[48px] shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar flex flex-col">
        
        {/* Header */}
        <div className="p-8 bg-gray-900 text-white flex justify-between items-center shrink-0 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">System Console</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Kernel v2.6.0 Stable
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 dark:border-gray-900 shrink-0 bg-gray-50/50 dark:bg-gray-950">
          {(['general', 'monetization', 'admin'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {tab}
              {activeTab === tab && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-8 space-y-10 overflow-y-auto flex-grow no-scrollbar bg-white dark:bg-gray-950">
          
          {activeTab === 'general' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <Sun size={14} className="text-orange-500" /> Interface Style
                  </h3>
                  <button 
                    onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <span className="font-bold text-sm dark:text-white capitalize">{theme} Mode</span>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                    </div>
                  </button>
                </div>
                
                <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <Activity size={14} className="text-emerald-500" /> System Health
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold dark:text-gray-400">Gemini Cloud</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${systemStatus?.gemini === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {systemStatus?.gemini || 'Checking'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold dark:text-gray-400">Firebase Auth</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${systemStatus?.firebase === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {systemStatus?.firebase || 'Standby'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Infrastructure Section */}
              <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black dark:text-white">Cloud Infrastructure</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Firebase Sync Engine</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Firebase Configuration (JSON)</label>
                    <textarea 
                      value={firebaseConfig}
                      onChange={(e) => {
                        setFirebaseConfig(e.target.value);
                        setValidationStatus('idle');
                      }}
                      placeholder='{ "apiKey": "...", "authDomain": "...", ... }'
                      className="w-full h-40 bg-white dark:bg-gray-950 p-6 rounded-[24px] border-2 border-transparent focus:border-blue-500 outline-none font-mono text-sm dark:text-gray-300 resize-none"
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      {validationStatus === 'validating' && <Loader2 size={16} className="animate-spin text-blue-500" />}
                      {validationStatus === 'valid' && <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"><CheckCircle2 size={12} /> Link Established</div>}
                      {validationStatus === 'invalid' && <div className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"><AlertCircle size={12} /> Configuration Error</div>}
                      
                      <button 
                        onClick={validateFirebase}
                        disabled={!firebaseConfig.trim() || validationStatus === 'validating'}
                        className="px-6 py-2 bg-gray-900 dark:bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                      >
                        Validate & Link
                      </button>
                    </div>
                  </div>
                  <p className="px-4 text-[10px] font-medium text-gray-500 leading-relaxed italic">
                    Paste your Firebase project configuration from the Firebase Console (Project Settings {'>'} Web App). The app will automatically sync authentication and storage nodes after saving.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monetization' && (
            <div className="space-y-10">
              <div className="p-8 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-[40px] border border-emerald-500/10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-50 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black dark:text-white">Revenue Control</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Ad Inventory</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">WhatsApp Sales Line</label>
                    <input 
                      type="text" 
                      value={whatsappNumber} 
                      onChange={(e) => setWhatsappNumber(e.target.value)} 
                      placeholder="e.g. 2348123456789" 
                      className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white outline-none font-bold"
                    />
                  </div>
                  <div 
                    onClick={() => setGoogleAdsEnabled(!googleAdsEnabled)}
                    className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-bold dark:text-white">Google AdSense</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inject ad slots</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${googleAdsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${googleAdsEnabled ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-10">
              {!admin.isLoggedIn ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center space-y-8 py-12">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-[32px] flex items-center justify-center text-gray-400 mx-auto border border-gray-100 dark:border-gray-800">
                    <Lock size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black dark:text-white mb-2">Restricted Access</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">System dashboard requires architect-level credentials to modify kernel parameters.</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                      type="password" 
                      value={loginEmail} 
                      onChange={(e) => setLoginEmail(e.target.value)} 
                      placeholder="Security Token" 
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-red-500 rounded-2xl p-4 text-center text-gray-900 dark:text-white font-mono"
                    />
                    <button type="submit" className="w-full py-5 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">Authenticate</button>
                  </form>
                </motion.div>
              ) : (
                <div className="space-y-12 pb-12">
                  {/* Dashboard Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Queries', value: '42.8k', icon: <Activity size={14} />, color: 'text-blue-500' },
                      { label: 'Active Users', value: '1,284', icon: <Users size={14} />, color: 'text-cyan-500' },
                      { label: 'AI Success', value: '99.4%', icon: <Zap size={14} />, color: 'text-yellow-500' },
                      { label: 'Alerts', value: '0 Clean', icon: <ShieldCheck size={14} />, color: 'text-emerald-500' },
                    ].map(stat => (
                      <div key={stat.label} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <div className={`p-2 w-fit rounded-lg bg-white dark:bg-gray-950 shadow-sm mb-4 ${stat.color}`}>{stat.icon}</div>
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">{stat.label}</p>
                        <p className="text-xl font-black dark:text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* News Manager */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest dark:text-white">
                        <Newspaper size={16} className="text-blue-500" /> News Management
                      </h4>
                      <button 
                        onClick={() => setShowPostForm(!showPostForm)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showPostForm ? 'bg-red-50 text-red-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
                      >
                        {showPostForm ? 'Cancel' : 'Publish New Update'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showPostForm && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-blue-500/20 shadow-inner space-y-4">
                            <input 
                              placeholder="Update Headline" 
                              className="w-full bg-white dark:bg-gray-950 p-4 rounded-xl font-bold outline-none border border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                              value={newPost.title || ''}
                              onChange={e => setNewPost({...newPost, title: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <select 
                                aria-label="Post Category"
                                className="bg-white dark:bg-gray-950 p-4 rounded-xl outline-none border border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                                value={newPost.category}
                                onChange={e => setNewPost({...newPost, category: e.target.value as any})}
                              >
                                <option className="text-gray-900 dark:text-white bg-white dark:bg-gray-950">Federal</option>
                                <option className="text-gray-900 dark:text-white bg-white dark:bg-gray-950">State</option>
                                <option className="text-gray-900 dark:text-white bg-white dark:bg-gray-950">Private</option>
                                <option className="text-gray-900 dark:text-white bg-white dark:bg-gray-950">JAMB</option>
                              </select>
                              <input 
                                placeholder="Date (e.g. Jan 30, 2026)" 
                                className="bg-white dark:bg-gray-950 p-4 rounded-xl outline-none border border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                                value={newPost.date || ''}
                                onChange={e => setNewPost({...newPost, date: e.target.value})}
                              />
                            </div>
                            <textarea 
                              placeholder="Update Content Excerpt..."
                              className="w-full bg-white dark:bg-gray-950 p-4 rounded-xl h-24 outline-none border border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                              value={newPost.excerpt || ''}
                              onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
                            />
                            <button 
                              onClick={handlePublishPost}
                              disabled={isPublishing || !newPost.title}
                              className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                            >
                              {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <><Send size={14} /> Commit to Live Feed</>}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-3">
                      {publishedNews.slice(0, 5).map(news => (
                        <div key={news.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between group">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                               <Newspaper size={18} />
                            </div>
                            <div className="overflow-hidden">
                               <p className="font-bold text-xs dark:text-white truncate">{news.title}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase">{news.category} • {news.date}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeletePost(news.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                             <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advert Manager */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest dark:text-white">
                        <Megaphone size={16} className="text-emerald-500" /> Ad Inventory
                      </h4>
                      <button 
                        onClick={() => setShowAdForm(!showAdForm)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showAdForm ? 'bg-red-50 text-red-500' : 'bg-emerald-600 text-white'}`}
                      >
                        {showAdForm ? 'Close' : 'Launch Billboard Ad'}
                      </button>
                    </div>

                    <AnimatePresence>
                       {showAdForm && (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                           <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-emerald-500/20 shadow-inner space-y-4">
                             <input placeholder="Advertiser Title" className="w-full bg-white dark:bg-gray-950 p-4 rounded-xl font-bold outline-none border border-transparent focus:border-emerald-500 text-gray-900 dark:text-white" value={newAd.title || ''} onChange={e => setNewAd({...newAd, title: e.target.value})} />
                             <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Price (e.g. ₦10k)" className="bg-white dark:bg-gray-950 p-4 rounded-xl outline-none border border-transparent focus:border-emerald-500 text-gray-900 dark:text-white" value={newAd.price || ''} onChange={e => setNewAd({...newAd, price: e.target.value})} />
                                <input placeholder="Contact Link/WhatsApp" className="bg-white dark:bg-gray-950 p-4 rounded-xl outline-none border border-transparent focus:border-emerald-500 text-gray-900 dark:text-white" value={newAd.whatsapp || ''} onChange={e => setNewAd({...newAd, whatsapp: e.target.value})} />
                             </div>
                             <textarea placeholder="Ad Copy Description..." className="w-full bg-white dark:bg-gray-950 p-4 rounded-xl h-24 outline-none border border-transparent focus:border-emerald-500 text-gray-900 dark:text-white" value={newAd.description || ''} onChange={e => setNewAd({...newAd, description: e.target.value})} />
                             <button onClick={handlePublishAd} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Deploy Ad Slot</button>
                           </div>
                         </motion.div>
                       )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-8 border-t border-gray-100 dark:border-gray-900 flex justify-center">
                    <button onClick={onAdminLogout} className="flex items-center gap-2 px-8 py-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                       <LogOut size={16} /> Terminate Admin Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-100 dark:border-gray-900 shrink-0 bg-gray-50/50 dark:bg-gray-950">
          <button 
            onClick={handleSave} 
            disabled={saved} 
            className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl ${saved ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 active:scale-95'}`}
          >
            {saved ? <><CheckCircle2 size={18} /> Persistence Confirmed</> : <><Save size={18} /> Apply System Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;