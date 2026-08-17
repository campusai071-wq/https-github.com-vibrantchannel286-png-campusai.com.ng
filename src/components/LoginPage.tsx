import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, ShieldCheck, Brain, Zap, Globe, Mail, ArrowRight, Loader2, Lock, Eye, EyeOff, 
  RefreshCw, CheckCircle2, UserPlus, User, ShieldAlert, ArrowLeft, Sparkles, GraduationCap,
  Calculator, Bell, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import SEO from './SEO';
import { stringify } from '../services/utils';
import { UserProfile, UserRole } from '../types';
import { auth, googleProvider } from '../services/firebaseConfig';
// @ts-ignore
import { signInWithPopup, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { initializeUserProfile, trackReferral } from '../services/userService';
import { trackSignUp } from '../services/analytics';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

interface LoginPageProps {
  user?: UserProfile | null;
  onSuccess?: (email: string, role?: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ user, onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial mode based on route path or query param
  const getInitialMode = (): 'login' | 'signup' | 'reset' => {
    if (location.pathname.includes('signup') || location.search.includes('mode=signup')) return 'signup';
    if (location.pathname.includes('reset') || location.search.includes('mode=reset')) return 'reset';
    return 'login';
  };

  const [mode, setMode] = useState<'login' | 'reset' | 'signup'>(getInitialMode());
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

  // Sync mode if location changes
  useEffect(() => {
    setMode(getInitialMode());
  }, [location.pathname, location.search]);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && user.uid) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }
  }, []);

  const handleAuthDone = (userEmail: string, userRole?: UserRole) => {
    if (onSuccess) {
      onSuccess(userEmail, userRole);
    }
    navigate('/dashboard', { replace: true });
  };

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
          await new Promise(r => setTimeout(r, 1200));
          setResetSent(true);
        }
        return;
      }

      if (mode === 'signup') {
        if (!displayName || !password || !confirmPassword) {
          setError("All required fields must be filled.");
          setIsLoading(false);
          return;
        }
        if (!agreedToTerms) {
          setError("You must accept the Terms of Service and Privacy Policy.");
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setIsLoading(false);
          return;
        }

        if (auth) {
          const userCred = await createUserWithEmailAndPassword(auth, email, password);
          await initializeUserProfile(userCred.user, role);

          // GA4 Event: sign_up
          trackSignUp({ method: 'email_password', role: role, user_id: userCred.user?.uid });

          const referralCode = localStorage.getItem('campusai_referral_code');
          if (referralCode && userCred.user) {
            await trackReferral(referralCode, userCred.user.uid);
            localStorage.removeItem('campusai_referral_code');
          }

          handleAuthDone(email, role);
        } else {
          const mockDB = JSON.parse(localStorage.getItem('campusai_mock_db') || '{}');
          mockDB[email] = { password, displayName, role };
          trackSignUp({ method: 'demo_email', role: role });
          try {
            localStorage.setItem('campusai_mock_db', stringify(mockDB));
          } catch (e) {
            console.error("Failed to save mock DB:", e);
          }
          setTimeout(() => handleAuthDone(email, role), 1200);
        }
        return;
      }

      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
        handleAuthDone(email);
      } else {
        const mockDB = JSON.parse(localStorage.getItem('campusai_mock_db') || '{}');
        const userRecord = mockDB[email];
        if (userRecord && userRecord.password === password) {
          setTimeout(() => handleAuthDone(email, userRecord.role), 1000);
        } else {
          setError("Invalid email or password. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Auth submit error:", err);
      let errMsg = err.message || "An authentication error occurred.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = "Invalid email address or password. Please check your details and try again.";
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = "This email is already registered. Please sign in instead.";
      } else if (err.code === 'auth/weak-password') {
        errMsg = "Password should be at least 6 characters long.";
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);

    if (mode === 'signup' && !agreedToTerms) {
      setError("Please acknowledge the Terms of Service and Privacy Policy before continuing with Google.");
      return;
    }

    try {
      if (auth) {
        let userCred;
        if (Capacitor.isNativePlatform()) {
          const result = await FirebaseAuthentication.signInWithGoogle();
          const credential = GoogleAuthProvider.credential(result.credential?.idToken);
          userCred = await signInWithCredential(auth, credential);
        } else {
          userCred = await signInWithPopup(auth, googleProvider);
        }

        if (mode === 'signup' && userCred?.user) {
          trackSignUp({ method: 'google', role: role, user_id: userCred.user.uid });
        }

        const referralCode = localStorage.getItem('campusai_referral_code');
        if (referralCode && userCred.user) {
          await trackReferral(referralCode, userCred.user.uid);
          localStorage.removeItem('campusai_referral_code');
        }

        handleAuthDone(userCred.user?.email || 'google-user');
      } else {
        setError("Firebase Authentication is not available.");
      }
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request') return;
      console.error("Google Auth Failure:", err);

      const isPopupBlocked = err.code === 'auth/popup-blocked' || err.message?.includes('popup-blocked');
      if (isPopupBlocked) {
        setError("Your browser blocked the popup. Click below to open CampusAI in a new tab to complete Google Sign-In.");
      } else {
        setError(`Google Authentication failed: ${err.message || 'Unknown error'}. Try opening in a new browser tab.`);
      }
    }
  };

  const switchMode = (newMode: 'login' | 'reset' | 'signup') => {
    setError(null);
    setResetSent(false);
    setMode(newMode);
    if (newMode === 'signup') navigate('/signup');
    else if (newMode === 'login') navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <SEO 
        title={mode === 'signup' ? 'Create Scholar Account | CampusAI' : mode === 'reset' ? 'Reset Password | CampusAI' : 'Sign In | CampusAI Scholar Portal'}
        description="Authenticate your CampusAI account to save university aggregate calculations, access real-time 2026/2027 Post-UTME screening alerts, and track your admission chances."
        canonical={mode === 'signup' ? '/signup' : '/login'}
      />

      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 relative z-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">2026 Active Cycle</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-5xl w-full mx-auto my-auto py-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Value Props Banner (Desktop) */}
        <div className="lg:col-span-5 space-y-6 text-left hidden lg:block pr-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} /> Scholar Access Protocol
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
            Nigeria's Premier <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Admission Intelligence</span> Engine
          </h1>

          <p className="text-sm text-gray-400 leading-relaxed">
            Synchronize your scores, monitor university cutoffs, and get personalized AI recommendations for the 2026/2027 admission cycle.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-900/40 border border-gray-800/60">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                <Calculator size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-white">Verified Aggregate Calculations</p>
                <p className="text-[11px] text-gray-400 leading-normal">Official 50/50 ratios, O'Level grade point mapping, and ELDS quota criteria.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-900/40 border border-gray-800/60">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-white">Live Post-UTME Alerts</p>
                <p className="text-[11px] text-gray-400 leading-normal">Instant updates on active screening forms, portals, and exam schedules.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-900/40 border border-gray-800/60">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                <Brain size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-white">AI Admission Strategist</p>
                <p className="text-[11px] text-gray-400 leading-normal">Neural guidance on subject combinations, course alternatives, and merit odds.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="lg:col-span-7 w-full max-w-md mx-auto">
          <div className="bg-gray-900/90 border border-gray-800 rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            
            {/* Top Switcher Tabs */}
            <div className="flex bg-gray-950 p-1.5 rounded-2xl border border-gray-800/80 mb-8">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Mode Header */}
            <div className="text-center mb-6">
              <div className={`w-14 h-14 ${mode === 'reset' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : mode === 'signup' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'} border rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                {mode === 'reset' ? <RefreshCw size={26} className={isLoading ? 'animate-spin' : ''} /> : mode === 'signup' ? <UserPlus size={26} /> : <Brain size={26} />}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {mode === 'login' ? 'Scholar Sign In' : mode === 'signup' ? 'Join CampusAI' : 'Reset Password'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {mode === 'login' ? 'Access your saved calculations and AI strategist.' : mode === 'signup' ? 'Register to save your profile and track admission progress.' : 'Enter your email to receive a password reset link.'}
              </p>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-950/40 border border-red-800/50 rounded-2xl text-red-400 text-xs font-medium space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
                {(error.includes("Blocked") || error.includes("new tab")) && (
                  <button
                    type="button"
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="mt-2 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-all"
                  >
                    Open in New Tab <ArrowRight size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Iframe warning */}
            {!error && isIframe && (
              <div className="mb-6 p-3.5 bg-blue-950/40 border border-blue-800/50 rounded-2xl text-left text-xs font-sans">
                <p className="text-[10px] font-bold text-cyan-400 flex items-center gap-1.5 mb-1">
                  <Globe size={12} className="animate-pulse" /> PREVIEW ENVIRONMENT DETECTED
                </p>
                <p className="text-[11px] text-gray-400 leading-normal mb-2">
                  If Google Sign-In popup gets blocked by preview sandbox, open app in a new tab.
                </p>
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1"
                >
                  Open in New Tab <ArrowRight size={10} />
                </button>
              </div>
            )}

            {/* Form View */}
            {resetSent ? (
              <div className="p-6 bg-orange-950/20 border border-orange-800/40 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw size={20} />
                </div>
                <h3 className="text-sm font-black text-orange-300 uppercase tracking-wide">Reset Link Sent</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  We dispatched a recovery link to <span className="text-white font-bold">{email}</span>. Please check your inbox and spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="mt-4 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Full Name"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-2xl outline-none font-bold text-xs text-white placeholder-gray-500 transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-2xl outline-none font-bold text-xs text-white transition-colors appearance-none"
                      >
                        <option value="Pre-Admission">Pre-Admission Student (2026 Candidate)</option>
                        <option value="In-Campus">In-Campus Student</option>
                        <option value="Graduate/Alumni">Graduate / Alumni</option>
                        <option value="School/Institution">School / Institution</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-950 border border-gray-800 focus:border-blue-500 rounded-2xl outline-none font-bold text-xs text-white placeholder-gray-500 transition-colors"
                  />
                </div>

                {mode !== 'reset' && (
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-950 border border-gray-800 focus:border-blue-500 rounded-2xl outline-none font-bold text-xs text-white placeholder-gray-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {mode === 'signup' && (
                  <>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-2xl outline-none font-bold text-xs text-white placeholder-gray-500 transition-colors"
                      />
                    </div>

                    <div className="flex items-start gap-2.5 px-1 pt-1">
                      <input
                        id="terms_page"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 bg-gray-950 border-gray-700 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="terms_page" className="text-[11px] text-gray-400 text-left leading-normal cursor-pointer">
                        I agree to CampusAI's{' '}
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_legal', { detail: 'terms' }))}
                          className="text-emerald-400 font-bold hover:underline"
                        >
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_legal', { detail: 'privacy' }))}
                          className="text-emerald-400 font-bold hover:underline"
                        >
                          Privacy Policy
                        </button>.
                      </label>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center text-[11px] px-1 pt-1">
                  {mode === 'login' ? (
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="font-bold text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-blue-400 hover:underline"
                    >
                      Return to Sign In
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 ${
                    mode === 'reset' ? 'bg-orange-600 hover:bg-orange-500' : mode === 'signup' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'
                  } text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50`}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : mode === 'login' ? (
                    <>Sign In to CampusAI <ArrowRight size={16} /></>
                  ) : mode === 'signup' ? (
                    <>Create Account <ArrowRight size={16} /></>
                  ) : (
                    <>Send Password Reset Link</>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                <span className="bg-gray-900 px-3 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className={`w-full py-3.5 ${
                mode === 'signup' && !agreedToTerms
                  ? 'bg-gray-950/60 text-gray-500 cursor-not-allowed border border-gray-800/50'
                  : 'bg-gray-950 hover:bg-gray-800 text-white border border-gray-800 hover:border-gray-700'
              } rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-sm`}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className={`w-4 h-4 bg-white p-0.5 rounded-full ${mode === 'signup' && !agreedToTerms ? 'grayscale opacity-50' : ''}`}
                alt="Google"
              />
              {mode === 'signup' && !agreedToTerms ? 'Accept Terms to use Google' : 'Continue with Google'}
            </button>
          </div>
        </div>

      </div>

      {/* Page Footer */}
      <div className="max-w-6xl w-full mx-auto text-center py-4 text-xs text-gray-500 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-900 mt-auto">
        <p>© 2026 CampusAI.ng — Empowering Nigerian Scholars</p>
        <div className="flex items-center gap-4 text-[11px]">
          <button onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_legal', { detail: 'terms' }))} className="hover:text-gray-300">Terms</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_legal', { detail: 'privacy' }))} className="hover:text-gray-300">Privacy</button>
          <a href="mailto:support@campusai.com.ng" className="hover:text-gray-300">Support</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
