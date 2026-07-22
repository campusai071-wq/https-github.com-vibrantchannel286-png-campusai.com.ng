import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, ShieldCheck, Brain, Zap, Globe, Mail, ArrowRight, Loader2, Lock, Eye, EyeOff, RefreshCw, CheckCircle2, UserPlus, User, ShieldAlert } from 'lucide-react';
import { stringify } from '../services/utils';
import { UserProfile, UserRole } from '../types';
import { auth, googleProvider } from '../services/firebaseConfig';
// @ts-ignore
import { signInWithPopup, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { initializeUserProfile } from '../services/userService';
import { trackReferral } from '../services/userService';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, role?: UserRole) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'reset' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('Pre-Admission');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) return;
    setIsLoading(true);

    try {
      if (mode === 'reset') {
        if (auth) {
          await sendPasswordResetEmail(auth, email);
          setResetSent(true);
        } else {
          // Simulation delay
          await new Promise(r => setTimeout(r, 1500));
          setResetSent(true);
        }
        return;
      }

      if (mode === 'signup') {
        if (!displayName || !password || !confirmPassword) {
          setError("All secure fields are required.");
          setIsLoading(false);
          return;
        }
        if (!agreedToTerms) {
          setError("You must acknowledge the Terms and Privacy Protocol.");
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords must match identically.");
          setIsLoading(false);
          return;
        }
        
        if (auth) {
          const userCred = await createUserWithEmailAndPassword(auth, email, password);
          await initializeUserProfile(userCred.user, role);
          
          const referralCode = localStorage.getItem('campusai_referral_code');
          if (referralCode && userCred.user) {
            await trackReferral(referralCode, userCred.user.uid);
            localStorage.removeItem('campusai_referral_code');
          }
          
          onSuccess(email, role);
          onClose();
        } else {
          const mockDB = JSON.parse(localStorage.getItem('campusai_mock_db') || '{}');
          mockDB[email] = { password, displayName, role };
          try {
            localStorage.setItem('campusai_mock_db', stringify(mockDB));
          } catch (e) {
            console.error("Failed to stringify mockDB:", mockDB);
            throw e;
          }
          setTimeout(() => { onSuccess(email, role); onClose(); }, 1500);
        }
        return;
      }

      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccess(email);
        onClose();
      } else {
        const mockDB = JSON.parse(localStorage.getItem('campusai_mock_db') || '{}');
        const userRecord = mockDB[email];
        if (userRecord && userRecord.password === password) {
          setTimeout(() => { onSuccess(email, userRecord.role); onClose(); }, 1200);
        } else {
          setError("Access Denied: Check token or verification status.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An authentication protocol error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    
    if (mode === 'signup' && !agreedToTerms) {
      setError("Protocol Sync Blocked: Please acknowledge the Terms and Privacy Protocol before synchronizing your Google profile.");
      return;
    }

    try {
      if (auth) {
        let userCred;

        if (Capacitor.isNativePlatform()) {
          // Use Capacitor Firebase Authentication plugin for Android/iOS
          const result = await FirebaseAuthentication.signInWithGoogle();
          const credential = GoogleAuthProvider.credential(result.credential?.idToken);
          userCred = await signInWithCredential(auth, credential);
        } else {
          // Use standard Web Popup
          userCred = await signInWithPopup(auth, googleProvider);
        }
        
        const referralCode = localStorage.getItem('campusai_referral_code');
        if (referralCode && userCred.user) {
          await trackReferral(referralCode, userCred.user.uid);
          localStorage.removeItem('campusai_referral_code');
        }
        
        onSuccess('google-auth-user');
        onClose();
      } else {
        setError("Cloud link temporarily restricted: Firebase Auth not initialized.");
      }
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request') {
        console.warn("Auth popup cancelled by user.");
        return;
      }
      console.error("Auth Failure:", err);
      
      const isPopupBlocked = err.code === 'auth/popup-blocked' || err.message?.includes('popup-blocked') || err.message?.includes('popupBlocked');
      
      if (isPopupBlocked) {
        setError(
          "Popup Blocked: Your browser blocked the authentication popup. Please click below to open CampusAI in a new tab to complete sign-in, or enable popups in your browser settings."
        );
      } else {
        setError(`Synchronization Failed: ${err.message || 'Unknown protocol error'}. TIP: Try opening this app in a new tab to bypass iframe sandbox restrictions.`);
      }
    }
  };

  const switchMode = (newMode: 'login' | 'reset' | 'signup') => {
    setError(null);
    setResetSent(false);
    setMode(newMode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-[32px] md:rounded-[48px] overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl p-8 md:p-10 text-center">
            <button onClick={onClose} aria-label="Close" className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400"><X size={24} /></button>

            <div className="relative mb-8">
              <div className={`w-16 h-16 md:w-20 md:h-20 ${mode === 'reset' ? 'bg-orange-500' : mode === 'signup' ? 'bg-emerald-500' : 'bg-blue-600'} rounded-[28px] flex items-center justify-center text-white mx-auto shadow-xl transition-colors duration-500`}>
                {mode === 'reset' ? <RefreshCw size={36} className={isLoading ? 'animate-spin' : ''} /> : mode === 'signup' ? <UserPlus size={36} /> : <Brain size={36} />}
              </div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className={`absolute inset-0 border-2 border-dashed ${mode === 'reset' ? 'border-orange-400/30' : mode === 'signup' ? 'border-emerald-400/30' : 'border-blue-400/30'} rounded-[32px] -m-2`} />
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">
              {mode === 'login' ? 'Scholar Portal' : mode === 'signup' ? 'Join the Fleet' : 'Reset Access'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed text-xs md:text-sm px-4 font-sans">
              {mode === 'login' ? 'Authenticate to unlock the 2026 Decision Engine.' : mode === 'signup' ? 'Create your profile to synchronize your journey.' : 'We will dispatch a secure recovery signal to your email.'}
            </p>

            {error && (
              <div className="flex flex-col gap-2 px-5 py-3.5 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-[24px] text-xs font-bold border border-red-100 dark:border-red-900/30 text-left mb-6 max-w-sm mx-auto font-sans">
                <div className="flex items-start gap-2">
                  <ShieldAlert size={14} className="mt-0.5 shrink-0 text-red-500" />
                  <span className="leading-snug">{error}</span>
                </div>
                {(error.includes("Blocked") || error.includes("new tab") || error.includes("sandbox")) && (
                  <button
                    type="button"
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="mt-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all w-fit flex items-center gap-1.5 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Open in New Tab <ArrowRight size={12} />
                  </button>
                )}
              </div>
            )}

            {!error && isIframe && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 rounded-[24px] text-left max-w-sm mx-auto font-sans">
                <p className="text-[11px] font-bold text-blue-700 dark:text-cyan-400 mb-1 flex items-center gap-1.5 font-mono">
                  <Globe size={12} className="animate-pulse" /> PREVIEW IFRAME SYSTEM
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal mb-2.5">
                  Google popups are blocked inside iframes by browsers. For a seamless experience with Google login, open general CampusAI in a new tab.
                </p>
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                >
                  Open in New Tab <ArrowRight size={10} />
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {resetSent ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-[32px] mb-8">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping"></div>
                    <div className="relative w-full h-full bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg"><RefreshCw size={24} /></div>
                  </div>
                  <p className="text-sm font-black text-orange-900 dark:text-orange-300 uppercase tracking-tight">Signal Dispatched!</p>
                  <p className="text-[10px] text-orange-600 dark:text-orange-400/60 mt-2 leading-relaxed">Check your verified inbox for the recovery link. It expires in 60 minutes.</p>
                  <button onClick={() => switchMode('login')} className="mt-6 px-6 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Back to Login</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                  <div className="space-y-3">
                    {mode === 'signup' && (
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Full Name" required className="w-full pl-14 pr-6 py-4 md:py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-emerald-500 rounded-[24px] outline-none font-bold text-sm text-gray-900 dark:text-white transition-all" />
                      </div>
                    )}
                    {mode === 'signup' && (
                      <div className="relative group">
                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <label htmlFor="userRole" className="sr-only">Select User Role</label>
                        <select 
                          id="userRole"
                          value={role} 
                          onChange={(e) => setRole(e.target.value as UserRole)}
                          className="w-full pl-14 pr-6 py-4 md:py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-emerald-500 rounded-[24px] outline-none font-bold text-sm text-gray-900 dark:text-white transition-all appearance-none"
                        >
                          <option value="Pre-Admission">Pre-Admission Student</option>
                          <option value="In-Campus">In-Campus Student</option>
                          <option value="Graduate/Alumni">Graduate / Alumni</option>
                          <option value="School/Institution">School / Institution</option>
                        </select>
                      </div>
                    )}
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required className="w-full pl-14 pr-6 py-4 md:py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-[24px] outline-none font-bold text-sm text-gray-900 dark:text-white transition-all" />
                    </div>
                    {mode !== 'reset' && (
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Security Key" required className="w-full pl-14 pr-14 py-4 md:py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-[24px] outline-none font-bold text-sm text-gray-900 dark:text-white transition-all" />
                        <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                    )}
                    {mode === 'signup' && (
                      <div className="flex items-start gap-3 px-4 py-2 mb-2">
                        <input 
                          id="terms" 
                          type="checkbox" 
                          checked={agreedToTerms} 
                          onChange={(e) => setAgreedToTerms(e.target.checked)} 
                          className="mt-1 w-4 h-4 bg-gray-50 border-gray-200 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                        />
                        <label htmlFor="terms" className="text-[9px] font-medium text-gray-500 text-left leading-relaxed cursor-pointer">
                          I certify that I have reviewed and agree to the <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_legal', { detail: 'terms' }))} className="text-emerald-600 font-bold hover:underline">Terms of Service</button> and <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_legal', { detail: 'privacy' }))} className="text-emerald-600 font-bold hover:underline">Privacy Policy</button> of Campus AI.
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center px-2">
                    {mode === 'login' ? (
                      <button type="button" onClick={() => switchMode('reset')} className="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400 tracking-widest hover:underline">Forgot Access Key?</button>
                    ) : (
                      <button type="button" onClick={() => switchMode('login')} className="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400 tracking-widest hover:underline">Return to Hub</button>
                    )}
                    {mode === 'login' && <button type="button" onClick={() => switchMode('signup')} className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest hover:underline">New Scholar?</button>}
                  </div>

                  <button type="submit" disabled={isLoading} className={`w-full py-5 ${mode === 'reset' ? 'bg-orange-600' : mode === 'signup' ? 'bg-emerald-600' : 'bg-blue-600'} text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50`}>
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : mode === 'login' ? 'Authenticate' : mode === 'signup' ? 'Register' : 'Dispatch Link'}
                  </button>
                </form>
              )}
            </AnimatePresence>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800"></div></div>
              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em]"><span className="bg-white dark:bg-gray-900 px-4 text-gray-400">Master Sync</span></div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              className={`w-full py-4 ${mode === 'signup' && !agreedToTerms ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-sm`}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className={`w-4 h-4 bg-white p-0.5 rounded-full ${mode === 'signup' && !agreedToTerms ? 'grayscale opacity-50' : ''}`} alt="G" />
              {mode === 'signup' && !agreedToTerms ? 'Awaiting Protocol Consent' : 'Sync with Google'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;