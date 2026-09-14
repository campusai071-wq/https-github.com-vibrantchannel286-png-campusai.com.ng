import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Camera, Save, Moon, Sun, CheckCircle2, Calendar, 
  UserCheck, LogOut, Loader2, Monitor, Bell, LogIn, CloudLightning, 
  GraduationCap, Trash2, Crown, Zap, Download, Sparkles, 
  Target, Award, MapPin, BookOpen, Plus, FileCheck, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getLocalProfile, updateUserProfile, isRealUser, FREE_USER_LIMIT, calculateProfileCompletion } from '../services/userService';
import { UserProfile, OLevelGrade } from '../types';
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

const COMMON_OLEVEL_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature in English',
  'Commerce',
  'Financial Accounting',
  'Agricultural Science',
  'Geography',
  'Civic Education',
  'Further Mathematics',
  'Computer Studies',
  'Technical Drawing',
  'Christian Religious Studies',
  'Islamic Studies'
];

const OLEVEL_GRADES: OLevelGrade[] = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

const DEFAULT_OLEVEL: Array<{ subject: string; grade: string }> = [
  { subject: 'English Language', grade: 'B2' },
  { subject: 'Mathematics', grade: 'A1' },
  { subject: 'Physics', grade: 'B3' },
  { subject: 'Chemistry', grade: 'B2' },
  { subject: 'Biology', grade: 'B3' }
];

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  theme, 
  onThemeChange, 
  onLogout, 
  onLoginRequest, 
  onStartTour 
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ 
    displayName: '', 
    age: '', 
    gender: '', 
    university: '', 
    targetCourse: '',
    targetUTMEScore: '',
    jambScore: '',
    stateOfOrigin: '',
    utmeSubjects: [] as string[]
  });
  const [olevelGrades, setOlevelGrades] = useState<Array<{ subject: string; grade: string }>>(DEFAULT_OLEVEL);
  const [examType, setExamType] = useState<'WAEC' | 'NECO' | 'NABTEB' | 'GCE'>('WAEC');
  const [sittings, setSittings] = useState<'1' | '2'>('1');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStandalone = useStandalone();

  useEffect(() => {
    if (isOpen) {
      const p = getLocalProfile();
      setProfile(p);
      const subjs = p.utmeSubjects || p.academicProfile?.utmeSubjects || [];
      // Default subjects if none exist
      const defaultSubjs = ['English Language', 'Mathematics', 'Physics', 'Chemistry'];
      
      setFormData({ 
        displayName: p.displayName || '', 
        age: p.age || '', 
        gender: p.gender || '',
        university: p.university || p.academicProfile?.targetInstitution || '',
        targetCourse: p.targetCourse || p.academicProfile?.targetCourse || '',
        targetUTMEScore: (p.targetScore || p.targetUTMEScore || p.academicProfile?.targetUTMEScore || '') ? String(p.targetScore || p.targetUTMEScore || p.academicProfile?.targetUTMEScore) : '',
        jambScore: (p.jambScore || p.academicProfile?.jambScore || '') ? String(p.jambScore || p.academicProfile?.jambScore) : '',
        stateOfOrigin: p.stateOfOrigin || p.academicProfile?.stateOfOrigin || '',
        utmeSubjects: subjs.length > 0 ? subjs : defaultSubjs
      });

      const grades = p.olevelGrades || p.academicProfile?.olevelGrades;
      if (grades && grades.length > 0) {
        setOlevelGrades(grades);
      } else {
        // Check localStorage key
        try {
          const storedGrades = localStorage.getItem('campusai_olevel_grades');
          if (storedGrades) {
            const parsed = JSON.parse(storedGrades);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setOlevelGrades(parsed);
            }
          }
        } catch (e) {}
      }
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

  const handleAddOlevelSubject = () => {
    // Find first common subject not yet in list
    const existing = new Set(olevelGrades.map(g => g.subject.toLowerCase()));
    const available = COMMON_OLEVEL_SUBJECTS.find(s => !existing.has(s.toLowerCase())) || 'Economics';
    setOlevelGrades(prev => [...prev, { subject: available, grade: 'B3' }]);
  };

  const handleRemoveOlevelSubject = (index: number) => {
    if (olevelGrades.length <= 1) return;
    setOlevelGrades(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateOlevelSubject = (index: number, subject: string) => {
    setOlevelGrades(prev => prev.map((item, i) => i === index ? { ...item, subject } : item));
  };

  const handleUpdateOlevelGrade = (index: number, grade: string) => {
    setOlevelGrades(prev => prev.map((item, i) => i === index ? { ...item, grade } : item));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // UTME Subjects array
    const parsedSubjects = formData.utmeSubjects.filter(Boolean);

    const parsedTargetScore = formData.targetUTMEScore ? parseInt(formData.targetUTMEScore, 10) : undefined;
    const parsedJambScore = formData.jambScore ? parseInt(formData.jambScore, 10) : undefined;

    // Filter valid olevel grades
    const validOlevel = olevelGrades.filter(g => g.subject && g.grade);

    const payload: Partial<UserProfile> = {
      displayName: formData.displayName,
      age: formData.age,
      gender: formData.gender,
      university: formData.university,
      targetCourse: formData.targetCourse,
      targetScore: parsedTargetScore,       // ADDED FOR PRIORITY 6A
      targetUTMEScore: parsedTargetScore,
      jambScore: parsedJambScore,
      stateOfOrigin: formData.stateOfOrigin,
      utmeSubjects: parsedSubjects.length > 0 ? parsedSubjects : undefined,
      olevelGrades: validOlevel,
      oLevelGrades: validOlevel.reduce((acc, curr) => { // ADDED FOR PRIORITY 6A
        if (curr.subject && curr.grade) acc[curr.subject] = curr.grade;
        return acc;
      }, {} as Record<string, string>),
      academicProfile: {
        ...(profile?.academicProfile || {}),
        targetInstitution: formData.university,
        targetCourse: formData.targetCourse,
        targetUTMEScore: parsedTargetScore,
        jambScore: parsedJambScore,
        stateOfOrigin: formData.stateOfOrigin,
        utmeSubjects: parsedSubjects.length > 0 ? parsedSubjects : undefined,
        olevelGrades: validOlevel
      }
    };

    const updated = await updateUserProfile(payload);
    
    // Also save to localStorage for cross-tool synchronization
    try {
      localStorage.setItem('campusai_olevel_grades', JSON.stringify(validOlevel));
      
      if (formData.university || formData.targetCourse || parsedTargetScore) {
        const existingConfigStr = localStorage.getItem('campusai_target_config');
        const existingConfig = existingConfigStr ? JSON.parse(existingConfigStr) : {};
        localStorage.setItem('campusai_target_config', JSON.stringify({
          ...existingConfig,
          university: formData.university || existingConfig.university,
          course: formData.targetCourse || existingConfig.course,
          score: parsedTargetScore || existingConfig.score
        }));
      }
    } catch (e) {}

    if (profile?.uid && isRealUser(profile.uid)) {
      logUserActivity({
        userId: profile.uid,
        type: 'profile_update',
        title: 'Profile Updated',
        description: 'Updated academic targets and O\'Level examination grades'
      });
    }
    setProfile(updated);
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleLogoutClick = () => {
    if (confirm("Are you sure you want to sign out? Your cloud data will be preserved, and you can access it from any device by logging in again.")) {
      onLogout();
      onClose();
    }
  };

  if (!isOpen) return null;

  const isGuest = profile && !isRealUser(profile.uid);
  const completion = calculateProfileCompletion(profile);
  const creditCount = olevelGrades.filter(g => ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(g.grade)).length;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative bg-white dark:bg-gray-900 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden z-10"
      >
        <div className="p-6 sm:p-8 bg-blue-600 text-white flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Scholar Profile & O&apos;Level</h2>
              <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest">Academic & Admission Identity</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close Profile Settings" className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"><X size={22} /></button>
        </div>

        <div className="p-6 sm:p-8 space-y-7 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* Profile Completion Bar */}
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target size={14} /> Profile Readiness
              </span>
              <span className="font-extrabold text-blue-600 dark:text-cyan-400">{completion.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completion.percentage}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
              />
            </div>
            {completion.missingItems.length > 0 ? (
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Remaining fields: <span className="text-gray-700 dark:text-gray-300 font-semibold">{completion.missingItems.join(', ')}</span>
              </p>
            ) : (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check size={12} /> All academic and O&apos;Level parameters configured!
              </p>
            )}
          </div>

          {isGuest && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 rounded-3xl space-y-3"
            >
              <div className="flex items-center gap-2.5">
                 <CloudLightning className="text-emerald-500" size={20} />
                 <h4 className="font-black text-xs sm:text-sm dark:text-white uppercase tracking-tight">Connect to Cloud</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
                You are currently using a guest profile. Sign in to synchronize your target schools and O&apos;Level grades permanently.
              </p>
              <button 
                onClick={() => { onClose(); onLoginRequest(); }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <LogIn size={15} /> Authenticate Session
              </button>
            </motion.div>
          )}

          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                {(profile?.photoURL && profile.photoURL.trim()) ? (
                  <img src={profile.photoURL.trim()} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User size={48} className="text-gray-300" />
                )}
                {isSaving && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="text-white animate-spin" /></div>}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-gray-900 cursor-pointer"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
            <div className="mt-3 flex flex-col items-center gap-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Identity Token</p>
              {profile?.is_premium && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                  <Crown size={10} fill="currentColor" /> Scholar Pack Active
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Display Name</label>
              <input 
                type="text" 
                value={formData.displayName || ''}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-2xl p-3.5 font-bold text-gray-900 dark:text-white outline-none transition-all text-sm"
                placeholder="How should we address you?"
              />
            </div>

            {/* Academic Admission Targets Section */}
            <div className="p-5 sm:p-6 bg-slate-50 dark:bg-gray-800/40 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <Target size={17} className="text-blue-600 dark:text-cyan-400" />
                <h3 className="text-xs font-black dark:text-white uppercase tracking-wider">Admission Target & University</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Target University</label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={formData.university || ''}
                      onChange={e => setFormData({...formData, university: e.target.value})}
                      className="w-full bg-white dark:bg-gray-900 pl-10 pr-3 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none border border-gray-200 dark:border-gray-700 focus:border-blue-500 text-xs"
                      placeholder="e.g. UNILAG, FUTA, UI"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Course</label>
                  <div className="relative">
                    <Monitor size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={formData.targetCourse || ''}
                      onChange={e => setFormData({...formData, targetCourse: e.target.value})}
                      className="w-full bg-white dark:bg-gray-900 pl-10 pr-3 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none border border-gray-200 dark:border-gray-700 focus:border-blue-500 text-xs"
                      placeholder="e.g. Computer Science, Nursing"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Target UTME</label>
                  <div className="relative">
                    <Award size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number" 
                      min="0"
                      max="400"
                      value={formData.targetUTMEScore}
                      onChange={e => setFormData({...formData, targetUTMEScore: e.target.value})}
                      className="w-full bg-white dark:bg-gray-900 pl-7 pr-2 py-2.5 rounded-xl font-bold text-gray-900 dark:text-white outline-none border border-gray-200 dark:border-gray-700 text-xs"
                      placeholder="280"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Current JAMB</label>
                  <div className="relative">
                    <Award size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number" 
                      min="0"
                      max="400"
                      value={formData.jambScore}
                      onChange={e => setFormData({...formData, jambScore: e.target.value})}
                      className="w-full bg-white dark:bg-gray-900 pl-7 pr-2 py-2.5 rounded-xl font-bold text-gray-900 dark:text-white outline-none border border-gray-200 dark:border-gray-700 text-xs"
                      placeholder="265"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">State</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={formData.stateOfOrigin}
                      onChange={e => setFormData({...formData, stateOfOrigin: e.target.value})}
                      className="w-full bg-white dark:bg-gray-900 pl-7 pr-2 py-2.5 rounded-xl font-bold text-gray-900 dark:text-white outline-none border border-gray-200 dark:border-gray-700 text-xs"
                      placeholder="Lagos"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">UTME Subject Combination (4 Subjects)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="relative">
                      <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        list={`utme-subj-list-${idx}`}
                        value={formData.utmeSubjects[idx] || ''}
                        onChange={e => {
                          const newSubjs = [...formData.utmeSubjects];
                          newSubjs[idx] = e.target.value;
                          setFormData({...formData, utmeSubjects: newSubjs});
                        }}
                        className="w-full bg-white dark:bg-gray-900 pl-8 pr-3 py-2 rounded-xl font-bold text-gray-900 dark:text-white outline-none border border-gray-200 dark:border-gray-700 text-xs focus:border-blue-500"
                        placeholder={idx === 0 ? "English Language" : `Subject ${idx + 1}`}
                      />
                      <datalist id={`utme-subj-list-${idx}`}>
                        {COMMON_OLEVEL_SUBJECTS.map((s, i) => (
                          <option key={i} value={s} />
                        ))}
                      </datalist>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── O'LEVEL (WAEC / NECO / NABTEB) RESULTS SECTION ── */}
            <div className="p-5 sm:p-6 bg-slate-50 dark:bg-gray-800/40 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <FileCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="text-xs font-black dark:text-white uppercase tracking-wider">O&apos;Level Sitting & Grades</h3>
                    <p className="text-[10px] text-gray-400">WAEC, NECO, or NABTEB Core Subjects</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  creditCount >= 5 
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}>
                  {creditCount} {creditCount === 1 ? 'Credit' : 'Credits'} (A1–C6)
                </span>
              </div>

              {/* Exam metadata pills */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as any)}
                    className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-xl text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 outline-none"
                  >
                    <option value="WAEC">WAEC (WASSCE)</option>
                    <option value="NECO">NECO (SSCE)</option>
                    <option value="NABTEB">NABTEB</option>
                    <option value="GCE">GCE Private</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Sitting Count</label>
                  <select
                    value={sittings}
                    onChange={(e) => setSittings(e.target.value as any)}
                    className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-xl text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 outline-none"
                  >
                    <option value="1">1 Sitting</option>
                    <option value="2">2 Sittings Combined</option>
                  </select>
                </div>
              </div>

              {/* O'Level Subject-Grade Rows */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  <span>Subject</span>
                  <span>Grade</span>
                </div>

                {olevelGrades.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        list={`olevel-subj-list-${idx}`}
                        value={item.subject}
                        onChange={(e) => handleUpdateOlevelSubject(idx, e.target.value)}
                        placeholder="Subject Name"
                        className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-xl text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500"
                      />
                      <datalist id={`olevel-subj-list-${idx}`}>
                        {COMMON_OLEVEL_SUBJECTS.map((s, i) => (
                          <option key={i} value={s} />
                        ))}
                      </datalist>
                    </div>

                    <select
                      value={item.grade}
                      onChange={(e) => handleUpdateOlevelGrade(idx, e.target.value)}
                      className={`w-20 px-2 py-2 rounded-xl text-xs font-black text-center border outline-none cursor-pointer ${
                        ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(item.grade)
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {OLEVEL_GRADES.map((g) => (
                        <option key={g} value={g} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                          {g}
                        </option>
                      ))}
                    </select>

                    {olevelGrades.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOlevelSubject(idx)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Remove subject"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleAddOlevelSubject}
                  className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Add Subject
                </button>

                <p className="text-[10px] text-gray-400 italic">
                  Minimum 5 credits with Maths & English required
                </p>
              </div>
            </div>

            {/* Neural Alerts (Notifications) */}
            <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                     <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
                        <Bell size={16} />
                     </div>
                     <div>
                        <p className="text-xs font-black dark:text-white uppercase tracking-wider">Neural Alerts</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Push Notifications</p>
                     </div>
                  </div>
                  <button 
                    onClick={requestNotificationPermission}
                    disabled={notificationsEnabled}
                    className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${notificationsEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-600 text-white shadow-sm active:scale-95 cursor-pointer'}`}
                  >
                    {notificationsEnabled ? 'Active' : 'Enable'}
                  </button>
               </div>
               <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
                 Receive instant phone alerts for JAMB date changes, UNILAG/FUTA cutoffs, and CAPS admission lists.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Age</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number" 
                    value={formData.age || ''}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900 pl-10 pr-3 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none text-xs border border-gray-200 dark:border-gray-700"
                    placeholder="e.g. 19"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="gender-select" className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Gender</label>
                <div className="relative">
                  <UserCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    id="gender-select"
                    value={formData.gender || ''}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900 pl-10 pr-3 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none appearance-none text-xs border border-gray-200 dark:border-gray-700"
                  >
                    <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Select</option>
                    <option value="Male" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Male</option>
                    <option value="Female" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
               <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1.5">
                 <Monitor size={12} /> Interface Appearance
               </label>
               <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                 <button 
                   onClick={() => onThemeChange('light')}
                   className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${theme === 'light' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}
                 >
                   <Sun size={13} /> Light
                 </button>
                 <button 
                   onClick={() => onThemeChange('dark')}
                   className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${theme === 'dark' ? 'bg-gray-900 text-white shadow-md shadow-black/20' : 'text-gray-400'}`}
                 >
                   <Moon size={13} /> Dark
                 </button>
               </div>
            </div>
            
          </div>

          <div className="pt-4 space-y-3">
             <button 
               onClick={handleSave} 
               disabled={isSaving}
               className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
             >
               {isSaving ? <Loader2 className="animate-spin" size={16} /> : isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
               {isSaved ? "Profile & O'Level Synchronized" : "Save Academic Profile & O'Level"}
             </button>

             <div className="grid grid-cols-1 gap-2.5">
               {!isStandalone && (
                 <button 
                   onClick={() => {
                     onClose();
                     window.dispatchEvent(new Event('campusai_trigger_install'));
                   }}
                   className="py-3 bg-blue-600/10 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
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
                 className="py-3 bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
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
                   className="py-3 bg-gray-100 dark:bg-gray-800 text-red-500 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                 >
                   <Trash2 size={14} /> Clear Session
                 </button>
               ) : (
                 <button 
                   onClick={handleLogoutClick}
                   className="py-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
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
