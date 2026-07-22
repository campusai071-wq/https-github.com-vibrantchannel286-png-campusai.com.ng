
import React, { useState, useEffect, useRef } from 'react';
// Removed unused imports: BellOff, Smartphone, Heart, Sparkles
import { X, User, Camera, Save, Moon, Sun, CheckCircle2, Calendar, UserCheck, LogOut, Loader2, Monitor, Bell, LogIn, CloudLightning, GraduationCap, RefreshCw, Trash2, Crown, Zap, Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalProfile, updateUserProfile, isRealUser, FREE_USER_LIMIT } from '../services/userService';
import { UserProfile } from '../types';
import { logUserActivity } from '../services/dbService';
import { useStandalone } from '../hooks/useStandalone';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onLogout: () => void;
  onLoginRequest: () => void;
  onStartTour?: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, theme, onThemeChange, onLogout, onLoginRequest, onStartTour }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ displayName: '', age: '', gender: '', university: '', targetCourse: '' });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStandalone = useStandalone();

  useEffect(() => {
    if (isOpen) {
      const p = getLocalProfile();
      setProfile(p);
      setFormData({ 
        displayName: p.displayName || '', 
        age: p.age || '', 
        gender: p.gender || '',
        university: p.university || '',
        targetCourse: p.targetCourse || ''
      });

    }
  }, [isOpen]);

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("System notifications are not supported on this browser or device.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        try {
          new Notification("CampusAI Notifications Active!", {
            body: "You will now receive 2026 JAMB and University alerts directly on your phone.",
            icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%232563eb%22/><path d=%22M25 40 L50 20 L75 40 L50 60 Z%22 fill=%22white%22/><path d=%22M35 45 L35 65 C35 65 50 72 65 65 L65 45%22 fill=%22none%22 stroke=%22white%22 stroke-width=%225%22/></svg>'
          });
        } catch (err) {
          console.warn("Failed to construct Notification object instance:", err);
        }
      } else {
        alert("Permission denied. Enable notifications in your phone's browser settings to stay updated.");
      }
    } catch (e) {
      console.error("Notification API failed:", e);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsSaving(true);
      const updated = await updateUserProfile({ photoURL: base64 });
      setProfile(updated);
      setIsSaving(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updated = await updateUserProfile(formData);
    


    if (profile?.uid && isRealUser(profile.uid)) {
      logUserActivity({
        userId: profile.uid,
        type: 'profile_update',
        title: 'Profile Updated',
        description: 'Updated personal profile information'
      });
    }
    setProfile(updated);
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  const handleLogoutClick = () => {
    if (confirm("Are you sure you want to sign out? Your cloud data will be preserved, and you can access it from any device by logging in again.")) {
      onLogout();
      onClose();
    }
  };

  if (!isOpen) return null;

  const isGuest = profile && !isRealUser(profile.uid);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Self-closing backdrop to ensure clean JSX structure */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 bg-blue-600 text-white flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <User size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight">Scholar Profile</h2>
          </div>
          <button onClick={onClose} aria-label="Close Profile Settings" className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {isGuest && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 rounded-[32px] space-y-4"
            >
              <div className="flex items-center gap-3">
                 <CloudLightning className="text-emerald-500" size={24} />
                 <h4 className="font-black text-sm dark:text-white uppercase tracking-tight">Connect to Cloud</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                You are currently using a guest profile. Sign in to synchronize your admission journey across all your devices.
              </p>
              <button 
                onClick={() => { onClose(); onLoginRequest(); }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <LogIn size={16} /> Authenticate Session
              </button>
            </motion.div>
          )}

          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User size={64} className="text-gray-300" />
                )}
                {isSaving && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="text-white animate-spin" /></div>}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-all border-4 border-white dark:border-gray-900"
              >
                <Camera size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
            <div className="mt-4 flex flex-col items-center gap-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Identity Token</p>
              {profile?.is_premium && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                  <Crown size={10} fill="currentColor" /> Scholar Pack Active
                </div>
              )}
            </div>
          </div>

          {/* Quota Status */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] border border-gray-100 dark:border-gray-800 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-500 text-white rounded-xl shadow-lg">
                      <Zap size={18} />
                   </div>
                   <div>
                      <p className="text-xs font-black dark:text-white uppercase tracking-widest">Scholar Capacity</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Usage & Balance Tracking</p>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2.5 py-1 rounded-md">
                    {profile?.is_premium ? 'Premium Pack' : 'Trial Active'}
                  </span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-100 dark:border-gray-800/80">
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-gray-150 dark:border-white/5">
                   <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Calculations Done</p>
                   <p className="text-lg font-extrabold text-gray-800 dark:text-white mt-1">
                      {profile?.meritUsageCount || 0} <span className="text-[10px] font-medium text-gray-500">done</span>
                   </p>
                </div>
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-gray-150 dark:border-white/5">
                   <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Calculations Left</p>
                   <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                      {profile?.is_premium 
                        ? `${profile?.scholarCredits || 0}`
                        : `${Math.max(0, FREE_USER_LIMIT - (profile?.meritUsageCount || 0))}`} 
                      <span className="text-[10px] font-medium text-gray-500"> left</span>
                   </p>
                </div>
             </div>

             {/* Daily Free Trial Full Match Calculation status row */}
             <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="font-bold text-gray-900 dark:text-emerald-300">1 Daily Free Full-Strategist Match</p>
                </div>
                <span className="font-black px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[8px]">
                   {profile?.is_premium ? 'Unlimited' : (profile?.daily_requests || 0) >= 1 ? 'Claimed Today' : '1 Left Today'}
                </span>
             </div>
             {!profile?.is_premium && (
               <div className="space-y-4">
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.min(100, ((profile?.meritUsageCount || 0) / FREE_USER_LIMIT) * 100)}%` }}
                       className={`h-full ${((profile?.meritUsageCount || 0) / FREE_USER_LIMIT) >= 1 ? 'bg-red-500' : 'bg-blue-600'}`}
                     />
                  </div>
                 <button 
                   onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('campusai_open_payment')); }}
                   className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                 >
                   <Crown size={16} /> Activate Scholar Pack
                 </button>
               </div>
             )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Display Name</label>
              <input 
                type="text" 
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 font-bold text-gray-900 dark:text-white outline-none transition-all"
                placeholder="How should we address you?"
              />
            </div>

            {/* Neural Alerts (Notifications) */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-800">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg">
                        <Bell size={18} />
                     </div>
                     <div>
                        <p className="text-xs font-black dark:text-white uppercase tracking-widest">Neural Alerts</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Push Notifications</p>
                     </div>
                  </div>
                  <button 
                    onClick={requestNotificationPermission}
                    disabled={notificationsEnabled}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${notificationsEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-600 text-white shadow-md active:scale-95'}`}
                  >
                    {notificationsEnabled ? 'Active' : 'Enable'}
                  </button>
               </div>
               <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">"Get instant alerts on your phone for JAMB date changes, UNILAG Post-UTME drops, and AI-predicted cutoff trends."</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Age</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900 pl-12 pr-4 py-4 rounded-2xl font-bold text-gray-900 dark:text-white outline-none"
                    placeholder="e.g. 19"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="gender-select" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Gender</label>
                <div className="relative">
                  <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    id="gender-select"
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900 pl-12 pr-4 py-4 rounded-2xl font-bold text-gray-900 dark:text-white outline-none appearance-none"
                  >
                    <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Select</option>
                    <option value="Male" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Male</option>
                    <option value="Female" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Target University</label>
                <div className="relative">
                  <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.university}
                    onChange={e => setFormData({...formData, university: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900 pl-12 pr-4 py-4 rounded-2xl font-bold text-gray-900 dark:text-white outline-none"
                    placeholder="e.g. UNILAG"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Target Course</label>
                <div className="relative">
                  <Monitor size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.targetCourse}
                    onChange={e => setFormData({...formData, targetCourse: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900 pl-12 pr-4 py-4 rounded-2xl font-bold text-gray-900 dark:text-white outline-none"
                    placeholder="e.g. Medicine"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="scholar-stage-select" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Scholar Journey Stage</label>
              <div className="relative">
                <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  id="scholar-stage-select"
                  value={profile?.role || 'Pre-Admission'}
                  onChange={async (e) => {
                    const newRole = e.target.value as any;
                    const updated = await updateUserProfile({ role: newRole });
                    setProfile(updated);
                  }}
                  className="w-full bg-gray-50 dark:bg-gray-900 pl-12 pr-4 py-4 rounded-2xl font-bold text-gray-900 dark:text-white outline-none appearance-none border-2 border-transparent focus:border-emerald-500 transition-all"
                >
                  <option value="Pre-Admission" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Pre-Admission Student</option>
                  <option value="In-Campus" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">In-Campus Student</option>
                  <option value="Graduate/Alumni" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Graduate / Alumni</option>
                  <option value="School/Institution" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">School / Institution</option>
                </select>
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest ml-2 mt-1">Changing this will update your Roadmap and News feed.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-2">
                 <Monitor size={12} /> Interface Appearance
               </label>
               <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                 <button 
                   onClick={() => onThemeChange('light')}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'light' ? 'bg-white text-blue-600 shadow-lg' : 'text-gray-400'}`}
                 >
                   <Sun size={14} /> Light
                 </button>
                 <button 
                   onClick={() => onThemeChange('dark')}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-gray-900 text-white shadow-lg shadow-black/20' : 'text-gray-400'}`}
                 >
                   <Moon size={14} /> Dark
                 </button>
               </div>
            </div>

            
          </div>

          <div className="pt-6 space-y-4">
             <button 
               onClick={handleSave} 
               disabled={isSaving}
               className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
             >
               {isSaving ? <Loader2 className="animate-spin" size={18} /> : isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
               {isSaved ? "Profile Synchronized" : "Save Changes"}
             </button>

             <div className="grid grid-cols-1 gap-3">
               {!isStandalone && (
                 <button 
                   onClick={() => {
                     onClose();
                     // Trigger install from global event
                     window.dispatchEvent(new Event('campusai_trigger_install'));
                   }}
                   className="py-4 bg-blue-600/10 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                 >
                   <Download size={14} /> Install CampusAI App
                 </button>
               )}
               <button 
                 onClick={() => {
                   onClose();
                   if (onStartTour) {
                     onStartTour();
                   }
                 }}
                 className="py-4 bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
               >
                 <Sparkles size={14} /> Take App Tour
               </button>
               {isGuest ? (
                 <button 
                   onClick={() => {
                     if (confirm("Clear all local session data? This will reset your identity.")) {
                       localStorage.clear();
                       window.location.reload();
                     }
                   }}
                   className="py-4 bg-gray-100 dark:bg-gray-800 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                 >
                   <Trash2 size={14} /> Clear Session
                 </button>
               ) : (
                 <button 
                   onClick={handleLogoutClick}
                   className="py-4 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all"
                 >
                   <LogOut size={14} /> Sign Out
                 </button>
               )}
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserSettingsModal;
