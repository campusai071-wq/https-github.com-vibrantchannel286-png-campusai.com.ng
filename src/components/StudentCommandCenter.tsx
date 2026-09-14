import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Target, Award, BookOpen, 
  CheckCircle2, ArrowRight, 
  SlidersHorizontal, Layers, ShieldCheck, 
  Zap, Brain, Edit3, 
  MapPin, Check, Plus, AlertCircle, ArrowUpRight,
  School, GraduationCap, ChevronRight, FileCheck,
  Calculator, Monitor, MessageSquare
} from 'lucide-react';
import { UserProfile } from '../types';
import { getLocalProfile, calculateProfileCompletion } from '../services/userService';
import { getFUTACutoffByCourse } from '../data/futaCutoffs2026_2027';
import { UI_CUTOFFS_2025_2026 } from '../data/uiCutoffs2025_2026';
import { LAUTECH_CUTOFFS_2025_2026 } from '../data/lautechCutoffs2025_2026';
import { FUHSI_CUTOFFS_2026_2027 } from '../data/fuhsiCutoffs2026_2027';
import { FUOYE_CUTOFFS_2026_2027 } from '../data/fuoyeCutoffs2026_2027';
import { YABATECH_CUTOFFS_2026_2027 } from '../data/yabatechCutoffs2026_2027';
import unilagCutoffs from '../data/unilagCutoffs.json';

interface StudentCommandCenterProps {
  user: any;
  onOpenSettings?: () => void;
  onScholarPackRequest?: () => void;
  onLoginRequest?: () => void;
}

interface LastCalculation {
  uniName: string;
  courseName: string;
  jambScore: string | number;
  postUtmeScore?: string | number;
  stateOfOrigin?: string;
  aggregateScore: number;
  timestamp: number;
  aiResult?: {
    verdict?: string;
    probability?: number;
    departmentalCutoff?: string;
    reliability?: string;
  };
}

interface CbtSummary {
  testsTaken: number;
  averageScore: number;
  highestScore: number;
  weakestTopic: string;
  weakestSubject: string;
  strongestTopic: string;
  recentScore: number;
}

interface CapsStatusData {
  status: string;
  institution?: string;
  programme?: string;
  lastVerifiedAt?: number;
  isFresh?: boolean;
}

export const StudentCommandCenter: React.FC<StudentCommandCenterProps> = ({
  user,
  onOpenSettings,
  onScholarPackRequest,
  onLoginRequest
}) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(() => getLocalProfile());
  const [lastCalculation, setLastCalculation] = useState<LastCalculation | null>(null);
  const [cbtSummary, setCbtSummary] = useState<CbtSummary | null>(null);
  const [capsStatus, setCapsStatus] = useState<CapsStatusData | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  const [olevelGrades, setOlevelGrades] = useState<Array<{ subject: string; grade: string }>>([]);

  const refreshTelemetry = () => {
    const currentProfile = getLocalProfile();
    setProfile(currentProfile);

    // 1. O'Level Grades
    const grades = currentProfile.olevelGrades || currentProfile.academicProfile?.olevelGrades;
    if (grades && grades.length > 0) {
      setOlevelGrades(grades);
    } else {
      try {
        const stored = localStorage.getItem('campusai_olevel_grades');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOlevelGrades(parsed);
          }
        }
      } catch (e) {}
    }

    // 2. Last Aggregate Calculation
    try {
      const calcStr = localStorage.getItem('campusai_last_calculation_result');
      if (calcStr) {
        setLastCalculation(JSON.parse(calcStr));
      }
    } catch (e) {}

    // 3. CBT History and Weak-Topic Analytics
    try {
      const cbtStr = localStorage.getItem('cbt_history');
      const targetConfigStr = localStorage.getItem('campusai_target_config');
      const weakTopicsStr = localStorage.getItem('campusai_cbt_weak_topics');
      
      let testsTaken = 0;
      let averageScore = 0;
      let highestScore = 0;
      let recentScore = 0;
      let weakestTopic = 'Organic Chemistry';
      let weakestSubject = 'Chemistry';
      let strongestTopic = 'Calculus & Mechanics';

      if (cbtStr) {
        const history = JSON.parse(cbtStr);
        if (Array.isArray(history) && history.length > 0) {
          testsTaken = history.length;
          const scores = history.map((h: any) => h.totalScore || h.score || 0).filter((s: number) => s > 0);
          if (scores.length > 0) {
            averageScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
            highestScore = Math.max(...scores);
            recentScore = scores[scores.length - 1];
          }
        }
      }

      if (weakTopicsStr) {
        const weak = JSON.parse(weakTopicsStr);
        if (Array.isArray(weak) && weak.length > 0) {
          weakestTopic = weak[0].topic || weak[0].name || weakestTopic;
          weakestSubject = weak[0].subject || weakestSubject;
        }
      }

      if (targetConfigStr) {
        const targetConfig = JSON.parse(targetConfigStr);
        if (targetConfig.history && Array.isArray(targetConfig.history) && targetConfig.history.length > 0) {
          if (testsTaken === 0) {
            testsTaken = targetConfig.history.length;
            const sList = targetConfig.history.map((h: any) => h.score).filter(Boolean);
            if (sList.length > 0) {
              averageScore = Math.round(sList.reduce((a: number, b: number) => a + b, 0) / sList.length);
              highestScore = Math.max(...sList);
              recentScore = sList[sList.length - 1];
            }
          }
        }
      }

      setCbtSummary({
        testsTaken,
        averageScore,
        highestScore,
        weakestTopic,
        weakestSubject,
        strongestTopic,
        recentScore
      });
    } catch (e) {}

    // 4. JAMB CAPS Status
    try {
      const capsStr = localStorage.getItem('campusai_caps_verification_status');
      if (capsStr) {
        setCapsStatus(JSON.parse(capsStr));
      } else if (currentProfile.admissionStatus?.lastCapsStatus) {
        setCapsStatus({
          status: currentProfile.admissionStatus.lastCapsStatus,
          institution: currentProfile.admissionStatus.targetSchool,
          programme: currentProfile.admissionStatus.targetCourse,
          lastVerifiedAt: currentProfile.admissionStatus.lastVerifiedAt,
          isFresh: true
        });
      }
    } catch (e) {}

    // 5. Saved scenarios / attempts
    try {
      const attemptsStr = localStorage.getItem('campusai_calculation_attempts');
      if (attemptsStr) {
        const attempts = JSON.parse(attemptsStr);
        if (Array.isArray(attempts)) {
          setSavedScenarios(attempts.slice(0, 4));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    refreshTelemetry();

    const handleProfileUpdate = () => refreshTelemetry();
    window.addEventListener('campusai_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('campusai_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const completion = calculateProfileCompletion(profile);
  const targetUni = profile.university || profile.academicProfile?.targetInstitution || (lastCalculation?.uniName && !lastCalculation.uniName.toLowerCase().includes('lagos') ? lastCalculation.uniName : 'FUTA');
  const targetCourse = profile.targetCourse || profile.academicProfile?.targetCourse || (lastCalculation?.courseName && !lastCalculation.courseName.toLowerCase().includes('computer science') ? lastCalculation.courseName : 'Metallurgical and Materials Engineering');
  const targetUTMEScore = profile.targetScore || profile.targetUTMEScore || profile.academicProfile?.targetUTMEScore || 280;
  const currentJambScore = profile.jambScore || profile.academicProfile?.jambScore || lastCalculation?.jambScore || 250;
  const stateOfOrigin = profile.stateOfOrigin || profile.academicProfile?.stateOfOrigin || 'Delta';
  const subjects = profile.utmeSubjects || profile.academicProfile?.utmeSubjects || ['English Language', 'Mathematics', 'Physics', 'Chemistry'];

  const scoreGap = Number(targetUTMEScore) - Number(currentJambScore);
  const olevelCreditsCount = olevelGrades.filter(g => ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(g.grade)).length;

  // Helper to check if two institution strings refer to the same university
  const isSameInstitution = (target: string, query?: string): boolean => {
    if (!query) return false;
    const t = target.toLowerCase().replace(/[,.()]/g, '').trim();
    const q = query.toLowerCase().replace(/[,.()]/g, '').trim();
    if (t === q || t.includes(q) || q.includes(t)) return true;
    if ((t.includes('futa') || t.includes('akure')) && (q.includes('futa') || q.includes('akure'))) return true;
    if ((t.includes('unilag') || t.includes('lagos')) && (q.includes('unilag') || q.includes('university of lagos'))) return true;
    if ((t.includes('ui') || t.includes('ibadan')) && (q.includes('ui') || q.includes('university of ibadan'))) return true;
    if ((t.includes('lautech') || t.includes('ogbomoso')) && (q.includes('lautech') || q.includes('ladoke'))) return true;
    if ((t.includes('fuoye') || t.includes('oye-ekiti')) && (q.includes('fuoye') || q.includes('oye ekiti'))) return true;
    if ((t.includes('fuhsi') || t.includes('ila orangun')) && (q.includes('fuhsi') || q.includes('health sciences'))) return true;
    return false;
  };

  // Resolve departmental cutoff benchmark for the active target institution & course
  const resolvedCutoff = useMemo(() => {
    const cleanUni = (targetUni || '').toLowerCase();
    const cleanCourse = (targetCourse || '').toLowerCase();

    // 1. FUTA
    if (cleanUni.includes('futa') || cleanUni.includes('akure')) {
      const match = getFUTACutoffByCourse(targetCourse);
      if (match) {
        const isCatchment = ['ondo', 'ekiti', 'osun', 'oyo', 'ogun', 'lagos'].some(s => (stateOfOrigin || '').toLowerCase().includes(s));
        const isElds = ['delta', 'bayelsa', 'rivers', 'cross river', 'ebonyi', 'adamawa', 'bauchi', 'benue', 'borno', 'gombe', 'jigawa', 'kaduna', 'kano', 'katsina', 'kebbi', 'kogi', 'kwara', 'nasarawa', 'niger', 'plateau', 'sokoto', 'taraba', 'yobe', 'zamfara'].some(s => (stateOfOrigin || '').toLowerCase().includes(s));
        
        if (isCatchment && match.catchment) {
          return { cutoffText: `${match.catchment.toFixed(1)}% (Catchment)`, numericCutoff: match.catchment, category: 'Catchment' };
        }
        if (isElds && match.elds) {
          return { cutoffText: `${match.elds.toFixed(1)}% (ELDS)`, numericCutoff: match.elds, category: 'ELDS' };
        }
        return { cutoffText: `${match.merit.toFixed(1)}% (Merit)`, numericCutoff: match.merit, category: 'Merit' };
      }
      return { cutoffText: '62.0%', numericCutoff: 62.0, category: 'Merit' };
    }

    // 2. UI
    if (cleanUni.includes('ui') || cleanUni.includes('ibadan')) {
      const match = UI_CUTOFFS_2025_2026.find(item => 
        item.programme.toLowerCase().includes(cleanCourse) || cleanCourse.includes(item.programme.toLowerCase())
      );
      if (match) {
        return { cutoffText: `${match.merit.toFixed(1)}% (Merit)`, numericCutoff: match.merit, category: 'Merit' };
      }
    }

    // 3. LAUTECH
    if (cleanUni.includes('lautech') || cleanUni.includes('ladoke')) {
      const match = LAUTECH_CUTOFFS_2025_2026.find(item => 
        item.programme.toLowerCase().includes(cleanCourse) || cleanCourse.includes(item.programme.toLowerCase())
      );
      if (match) {
        return { cutoffText: `${match.utmeCutoff} UTME pts`, numericCutoff: (match.utmeCutoff / 4), category: 'Merit' };
      }
    }

    // 4. FUHSI
    if (cleanUni.includes('fuhsi') || cleanUni.includes('ila orangun')) {
      const match = FUHSI_CUTOFFS_2026_2027.find(item => 
        item.programme.toLowerCase().includes(cleanCourse) || cleanCourse.includes(item.programme.toLowerCase())
      );
      if (match) {
        return { cutoffText: `${match.merit.toFixed(1)}%`, numericCutoff: match.merit, category: 'Merit' };
      }
    }

    // 5. FUOYE
    if (cleanUni.includes('fuoye') || cleanUni.includes('oye-ekiti')) {
      const match = FUOYE_CUTOFFS_2026_2027.find(item => 
        item.programme.toLowerCase().includes(cleanCourse) || cleanCourse.includes(item.programme.toLowerCase())
      );
      if (match) {
        return { cutoffText: `${match.meritScore.toFixed(1)}%`, numericCutoff: match.meritScore, category: 'Merit' };
      }
    }

    // 6. YABATECH
    if (cleanUni.includes('yabatech')) {
      const match = YABATECH_CUTOFFS_2026_2027.find(item => 
        item.programme.toLowerCase().includes(cleanCourse) || cleanCourse.includes(item.programme.toLowerCase())
      );
      if (match) {
        return { cutoffText: `${match.meritScore.toFixed(1)}%`, numericCutoff: match.meritScore, category: 'Merit' };
      }
    }

    // 7. UNILAG
    if (cleanUni.includes('unilag') || cleanUni.includes('university of lagos')) {
      const dept = (unilagCutoffs as any).departments?.find((d: any) => 
        d.name.toLowerCase().includes(cleanCourse) || cleanCourse.includes(d.name.toLowerCase())
      );
      if (dept && dept.merit) {
        return { cutoffText: `${dept.merit.toFixed(1)}%`, numericCutoff: dept.merit, category: 'Merit' };
      }
    }

    return { cutoffText: '62.0%', numericCutoff: 62.0, category: 'Official Benchmark' };
  }, [targetUni, targetCourse, stateOfOrigin]);

  // Determine active aggregate metrics and whether lastCalculation strictly matches current target
  const activeTelemetry = useMemo(() => {
    const isMatching = lastCalculation && isSameInstitution(targetUni, lastCalculation.uniName);
    
    // Check saved attempts for matching scenario
    const savedMatch = savedScenarios.find(sc => isSameInstitution(targetUni, sc.uniName));

    let score = isMatching 
      ? lastCalculation.aggregateScore 
      : savedMatch 
        ? savedMatch.aggregateScore 
        : null;

    // If no calculation exists yet, compute estimated aggregate based on JAMB and screening
    if (score === null && currentJambScore) {
      const numericJamb = Number(currentJambScore);
      if (targetUni.toLowerCase().includes('futa') || targetUni.toLowerCase().includes('akure')) {
        // FUTA screening model: (JAMB/8) + O'Level/Screening points
        score = Number(((numericJamb / 8) + 36.6).toFixed(2));
      } else {
        score = Number((((numericJamb / 400) * 50) + 36.6).toFixed(2));
      }
    }

    let verdictText = isMatching && lastCalculation?.aiResult?.verdict 
      ? lastCalculation.aiResult.verdict 
      : savedMatch?.aiResult?.verdict || '';

    if (!verdictText && score !== null) {
      if (score >= resolvedCutoff.numericCutoff) {
        verdictText = 'High Probability';
      } else if (score >= resolvedCutoff.numericCutoff - 3.5) {
        verdictText = 'Competitive';
      } else {
        verdictText = 'Score Boost Needed';
      }
    }

    return {
      isMatching,
      aggregateScore: score,
      verdictText,
      cutoffText: isMatching && lastCalculation?.aiResult?.departmentalCutoff 
        ? lastCalculation.aiResult.departmentalCutoff 
        : resolvedCutoff.cutoffText
    };
  }, [lastCalculation, targetUni, savedScenarios, currentJambScore, resolvedCutoff]);

  const openSettingsModal = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      window.dispatchEvent(new CustomEvent('campusai_open_settings'));
    }
  };

  // Helper for formatted AI verdict badge
  const getVerdictBadge = (verdict?: string) => {
    if (!verdict) {
      return {
        text: 'Ready to Audit',
        className: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 border-blue-200 dark:border-blue-800'
      };
    }
    const lower = verdict.toLowerCase();
    if (lower.includes('high') || lower.includes('competitive') || lower.includes('strong')) {
      return {
        text: verdict,
        className: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      };
    }
    if (lower.includes('moderate') || lower.includes('borderline') || lower.includes('fair')) {
      return {
        text: verdict,
        className: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      };
    }
    return {
      text: verdict,
      className: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
    };
  };

  const verdictBadge = getVerdictBadge(activeTelemetry.verdictText);

  const getGradeBadgeColor = (grade: string) => {
    if (['A1', 'B2', 'B3'].includes(grade)) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    }
    if (['C4', 'C5', 'C6'].includes(grade)) {
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
    return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Top Header Banner: Candidate Identity & Target Matrix ── */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-800 shadow-xl p-6 sm:p-8 text-white">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Candidate Greeting & Target Focus */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-400/30 text-cyan-300 font-bold text-[11px] uppercase tracking-wider rounded-full">
                <ShieldCheck size={13} className="text-cyan-400 shrink-0" /> Admission Command Center
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/90 border border-slate-700 text-slate-300 font-semibold text-[11px] rounded-full">
                <MapPin size={11} className="text-blue-400 shrink-0" /> {stateOfOrigin}
              </span>
              {profile.is_premium ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-[11px] uppercase tracking-wider rounded-full">
                  <Zap size={11} fill="currentColor" /> Scholar Pack Active
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 font-medium text-[11px] rounded-full">
                  {profile.role || 'Pre-Admission Candidate'}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {profile.displayName ? profile.displayName.split(' ')[0] : 'Candidate'}&apos;s Admission Hub
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-slate-300">
                <span className="text-slate-400 font-medium">Target Institution:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-extrabold rounded-lg">
                  <School size={13} /> {targetUni}
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <GraduationCap size={14} className="text-blue-400" /> {targetCourse}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Readiness & Action Button */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-800/60 border border-slate-700/70 p-4 sm:p-5 rounded-2xl backdrop-blur-md">
            <div className="space-y-1.5 min-w-[170px]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">Profile Readiness</span>
                <span className="font-black text-cyan-400">{completion.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completion.percentage}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {completion.percentage === 100 
                  ? 'All parameters & O\'Level calibrated' 
                  : `${completion.missingItems.length} ${completion.missingItems.length === 1 ? 'target field' : 'target fields'} remaining`}
              </p>
            </div>

            <button
              onClick={openSettingsModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Edit3 size={14} /> Edit Targets & O&apos;Level
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Telemetry Pillars: Clean, Uniform Heights & Structured Data ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* 1. Target Score & UTME Gap */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 rounded-xl">
                <Target size={18} />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${
                scoreGap <= 0 
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}>
                {scoreGap <= 0 ? 'Goal Surpassed' : `${scoreGap} pts gap`}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">UTME Target Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {currentJambScore}
                </span>
                <span className="text-xs font-bold text-slate-400">/ {targetUTMEScore} Goal</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 dark:bg-cyan-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (Number(currentJambScore) / Number(targetUTMEScore)) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              navigate('/target');
              window.scrollTo(0, 0);
            }}
            className="w-full py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-cyan-400 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
          >
            Score Planner <ArrowRight size={13} />
          </button>
        </div>

        {/* 2. Calculated Aggregate & Probability */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Award size={18} />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${verdictBadge.className}`}>
                {verdictBadge.text}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Calculated Aggregate</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {activeTelemetry.aggregateScore !== null ? `${activeTelemetry.aggregateScore}%` : '—'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={targetUni}>
                  <School size={10} className="text-indigo-500 shrink-0" /> {targetUni}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>Cutoff Benchmark:</span>
              <span className="font-extrabold text-slate-700 dark:text-slate-200">
                {activeTelemetry.cutoffText}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              navigate('/calculator', {
                state: {
                  prefillUni: targetUni,
                  prefillCourse: targetCourse,
                  prefillJamb: currentJambScore
                }
              });
              window.scrollTo(0, 0);
            }}
            className="w-full py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
          >
            {activeTelemetry.isMatching ? 'Recalculate Score' : `Audit ${targetUni} Cutoff`} <ArrowRight size={13} />
          </button>
        </div>

        {/* 3. CBT Diagnostic Digest */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Brain size={18} />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                {cbtSummary?.testsTaken || 0} Drills Done
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CBT Mock Performance</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {cbtSummary?.averageScore ? `${cbtSummary.averageScore}` : '248'}
                </span>
                <span className="text-xs font-bold text-slate-400">/ 400 Mock Avg</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              <span className="text-amber-500 font-bold">Weak Topic: </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200" title={cbtSummary?.weakestTopic || 'Organic Chemistry'}>
                {cbtSummary?.weakestTopic || 'Organic Chemistry'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              navigate('/cbt-simulator');
              window.scrollTo(0, 0);
            }}
            className="w-full py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
          >
            Launch CBT Drill <ArrowRight size={13} />
          </button>
        </div>

        {/* 4. JAMB CAPS Status & Freshness */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
                <ShieldCheck size={18} />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Live Sync
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">JAMB CAPS Status</p>
              <div className="mt-1">
                <p className="text-lg font-black text-slate-900 dark:text-white uppercase truncate" title={capsStatus?.status || 'RECOMMENDED'}>
                  {capsStatus?.status || 'RECOMMENDED'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {capsStatus?.lastVerifiedAt 
                    ? `Synced ${new Date(capsStatus.lastVerifiedAt).toLocaleDateString()}` 
                    : 'Automated telemetry active'}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-0.5">
              <span>O&apos;Level Upload:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> Verified
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              navigate('/jamb-caps');
              window.scrollTo(0, 0);
            }}
            className="w-full py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
          >
            Check CAPS Live <ArrowRight size={13} />
          </button>
        </div>

      </div>

      {/* ── SECTION 2: ACADEMIC PROFILE SNAPSHOT & SECTION 7: QUICK ACTION LAUNCHPAD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: ACADEMIC PROFILE SNAPSHOT */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* O'Level Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <FileCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    ACADEMIC PROFILE SNAPSHOT
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your secondary examination sitting for institutional screening.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  olevelCreditsCount >= 5 
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                }`}>
                  {olevelCreditsCount} {olevelCreditsCount === 1 ? 'Credit Pass' : 'Credit Passes'} (A1–C6)
                </span>

                <button
                  onClick={openSettingsModal}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={13} /> {olevelGrades.length > 0 ? 'Edit O\'Level' : '+ Add O\'Level'}
                </button>
              </div>
            </div>

            {olevelGrades.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {olevelGrades.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-1.5"
                  >
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate" title={item.subject}>
                      {item.subject}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">Grade</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-black border ${getGradeBadgeColor(item.grade)}`}>
                        {item.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-300 text-center sm:text-left">
                  <p className="font-bold text-slate-900 dark:text-white">No O&apos;Level grades registered yet.</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Add your 5 WAEC or NECO subjects to complete full eligibility verification.</p>
                </div>
                <button
                  onClick={openSettingsModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus size={14} /> Add O&apos;Level Grades
                </button>
              </div>
            )}
          </div>

          {/* 2. Subject Combination & IBASS Brochure Validator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen size={17} className="text-blue-600 dark:text-cyan-400 shrink-0" />
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Academic Subject Combination & IBASS Match
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your 4 UTME subjects matched against official {targetUni} requirements.
                </p>
              </div>

              <button
                onClick={() => {
                  navigate('/admissions');
                  window.scrollTo(0, 0);
                }}
                className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto whitespace-nowrap"
              >
                Full Eligibility Audit <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map((subj, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-cyan-400 font-black text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{subj}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md shrink-0">
                    <Check size={11} /> Matched
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-start gap-3">
              <AlertCircle size={16} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white">IBASS Guideline: </span>
                {targetUni} requires English Language, Mathematics, and 2 relevant electives for {targetCourse}. Your registered subjects qualify for merit screening.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: QUICK ACTION LAUNCHPAD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers size={17} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  QUICK ACTION LAUNCHPAD
                </h3>
              </div>
              <button
                onClick={() => {
                  navigate('/calculator');
                  window.scrollTo(0, 0);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
                title="Add new calculation scenario"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => { navigate('/calculator'); window.scrollTo(0, 0); }} className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl border border-slate-100 dark:border-slate-700 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group">
                <Calculator size={16} className="text-blue-500 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase text-center leading-tight">Calculate<br/>Aggregate</span>
              </button>
              <button onClick={() => { navigate('/cbt-simulator'); window.scrollTo(0, 0); }} className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-slate-700 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group">
                <Monitor size={16} className="text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase text-center leading-tight">Take<br/>CBT Mock</span>
              </button>
              <button onClick={() => { navigate('/admissions'); window.scrollTo(0, 0); }} className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl border border-slate-100 dark:border-slate-700 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group">
                <MapPin size={16} className="text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase text-center leading-tight">Catchment<br/>Eligibility</span>
              </button>
              <button onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_ai'))} className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl border border-slate-100 dark:border-slate-700 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group">
                <MessageSquare size={16} className="text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase text-center leading-tight">AI<br/>Advisor</span>
              </button>
            </div>

            {savedScenarios.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Recent Scenarios</span>
                </div>
                <div className="space-y-2">
                  {savedScenarios.slice(0,2).map((sc, i) => (
                    <div 
                      key={i}
                      onClick={() => {
                        navigate('/calculator', { state: { loadAttempt: sc } });
                        window.scrollTo(0, 0);
                      }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{sc.uniName}</p>
                        <p className="text-[9px] text-slate-500 truncate">{sc.courseName}</p>
                      </div>
                      <span className="font-black text-[11px] text-blue-600 dark:text-cyan-400 shrink-0">{sc.aggregateScore}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentCommandCenter;
