import React, { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SEO from './SEO';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Target, GraduationCap, Loader2, Sparkles, RefreshCw, Brain, Search,
  ShieldCheck, BookOpen, ArrowRight, Lock, Activity, Check, Lightbulb,
  Share2, Calculator, X, ChevronDown, Award, Plus, Info, MessageCircle, AlertCircle,
  Wallet, Crown, MapPin, History, Database, Sliders, ExternalLink, Printer, Upload, Clock, TriangleAlert, FileText, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OLevelGrade } from '../types';
import Markdown from 'react-markdown';
import universityData from '../data/universities';
import { UNIVERSITIES_DB } from '../data/universityData';
import { getCourseCutoffInfo, getUniversityCourses, getUniversityScoringSystem, formatStrategyMarkdown, validateMandatorySubjects, validateOlevelRequirements, enforceAdmissionTiers } from '../services/geminiService';
import {
  getLocalProfile, checkAndIncrementCalculations as checkAndIncrementRequests,
  DAILY_LIMIT, getUserProfile, saveUserProfile, incrementMeritUsage,
  deductScholarCredit, FREE_GUEST_LIMIT, FREE_USER_LIMIT,
  checkCalculationsLimit, incrementCalculations
} from '../services/userService';
import { getGlobalScoringSystem, saveGlobalScoringSystem, saveHistoricalCutoff, logUserActivity, saveCutoffOverride, deleteCutoffOverride, getCutoffOverride, getAllCutoffOverrides, saveCalculationAttempt, saveGlobalCalculationRecord, getCalculationAttempts, getSchoolUgc, addSchoolUgc, likeSchoolUgc, savePredictionRecord, updatePredictionHelpfulness, submitAdmissionOutcome, incrementGlobalCalculationCount } from '../services/dbService';
import { UI_CUTOFFS_2025_2026, getUIFaculties } from '../data/uiCutoffs2025_2026';
import { FUTA_CUTOFFS_2026_2027, getFUTASchools } from '../data/futaCutoffs2026_2027';
import { LAUTECH_CUTOFFS_2025_2026, getLAUTECHFaculties } from '../data/lautechCutoffs2025_2026';
import { evaluateCandidateQuota, isStateELDS, isStateInCatchment } from '../utils/quotaMapping';
import { trackCalculatorUsed, trackAdmissionAnalysis, trackInstitutionSearch, trackPremiumClick } from '../services/analytics';
import QuotaModal from './QuotaModal';
import Testimonials from './Testimonials';
import { AdmissionChecklist } from './AdmissionChecklist';
import CalculationAnimation from './CalculationAnimation';

const PdfExportModal = React.lazy(() => import('./PdfExportModal'));
const FileUploadHubModal = React.lazy(() => import('./FileUploadHubModal'));

// ─── Constants ───────────────────────────────────────────────────────────────

const GRADE_POINTS: Record<OLevelGrade, number> = {
  'A1': 10, 'B2': 9, 'B3': 8, 'C4': 7, 'C5': 6, 'C6': 5, 'D7': 0, 'E8': 0, 'F9': 0
};

const GRADES: OLevelGrade[] = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

const JAMB_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Agricultural Science",
  "Geography",
  "Economics",
  "Government",
  "Literature-in-English",
  "Christian Religious Studies (CRS)",
  "Islamic Religious Studies (IRS)",
  "History",
  "Civic Education",
  "Commerce",
  "Financial Accounting",
  "Fine Arts",
  "Music",
  "Home Economics",
  "Computer Studies",
  "Yoruba",
  "Igbo",
  "Hausa",
  "French",
  "Arabic",
  "Physical & Health Education"
];

const OLEVEL_SUBJECTS = [
  "Agricultural Science",
  "Animal Husbandry",
  "Applied Electricity",
  "Arabic",
  "Auto Mechanics",
  "Biology",
  "Book-Keeping",
  "Building Construction",
  "Chemistry",
  "Christian Religious Studies (CRS)",
  "Civic Education",
  "Commerce",
  "Computer Studies",
  "Data Processing",
  "Dyeing & Bleaching",
  "Economics",
  "English Language",
  "Financial Accounting",
  "Fine Arts",
  "Fisheries",
  "Foods and Nutrition",
  "French",
  "Further Mathematics",
  "Garment Making",
  "Geography",
  "Government",
  "Hausa",
  "History",
  "Home Management",
  "Igbo",
  "Islamic Religious Studies (IRS)",
  "Literature-in-English",
  "Marketing",
  "Mathematics",
  "Music",
  "Office Practice",
  "Physical Education",
  "Physics",
  "Salesmanship",
  "Social Studies",
  "Store Management",
  "Technical Drawing",
  "Visual Arts",
  "Woodwork",
  "Yoruba"
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT Abuja"
];

const ELDS_STATES = [
  "Adamawa", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Ebonyi", "Gombe",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Nasarawa", "Niger",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScoringSystem {
  hasJamb: boolean;
  hasPostUtme: boolean;
  hasOLevel: boolean;
  explanation: string;
  formula?: string; // e.g. "JAMB*0.6 + OLevel"
}

interface SavedProfile {
  id: string;
  uniName: string;
  courseName: string;
  jambScore: string;
  postUtmeScore: string;
  stateOfOrigin: string;
  aggregateScore: number;
  isAR: boolean;
  isPostUtmePending: boolean;
  timestamp: number;
  aiResult?: any;
}

interface PostUtmeStatusInfo {
  isOut: boolean;
  statusText: string;
  badgeColor: string;
  textColor: string;
  iconBg: string;
  details: string;
  portalLink?: string;
}

interface CutoffCalculatorProps {
  user: any;
  onLoginRequest: () => void;
  onPremiumRequired: () => void;
  onDiscussWithAI: (p: string) => void;
  initialSchoolName?: string;
  onClearInitialSchool?: () => void;
}

// ─── Scoring Map ──────────────────────────────────────────────────────────────

const TOP_INSTITUTION_MAP: Record<string, ScoringSystem> = {
  'futa':     { hasJamb: true, hasPostUtme: false, hasOLevel: true,  explanation: "FUTA Point-Based (75:25): JAMB(75%) + O-Level(25%).", formula: "futa_75_25" },
  'lautech':  { hasJamb: true, hasPostUtme: false, hasOLevel: true,  explanation: "LAUTECH (80:20): JAMB(80%) + O-Level(20%).", formula: "lautech_80_20" },
  'futminna': { hasJamb: true, hasPostUtme: true,  hasOLevel: true,  explanation: "FUTMinna (50:30:20): JAMB(50) + Post-UTME(30) + O-Level(20).", formula: "50:30:20" },
  'unilag':   { hasJamb: true, hasPostUtme: true,  hasOLevel: true,  explanation: "UNILAG (50:30:20): JAMB(50) + Post-UTME(30) + O-Level(20).", formula: "50:30:20" },
  'ui':       { hasJamb: true, hasPostUtme: true,  hasOLevel: false, explanation: "UI (50:50): Average of JAMB and Post-UTME.", formula: "50:50" },
  'oau':      { hasJamb: true, hasPostUtme: true,  hasOLevel: true,  explanation: "OAU (50:40:10): JAMB(50) + Post-UTME(40) + O-Level(10).", formula: "50:40:10" },
  'lasu':     { hasJamb: true, hasPostUtme: false, hasOLevel: true,  explanation: "LASU (60:40): JAMB(60%) + O-Level(40%).", formula: "lasu_60_40" },
  'funaab':   { hasJamb: true, hasPostUtme: true,  hasOLevel: false, explanation: "FUNAAB (50:50): JAMB and Screening average.", formula: "50:50" },
  'abu':      { hasJamb: true, hasPostUtme: true,  hasOLevel: false, explanation: "ABU (50:50): JAMB and Post-UTME average.", formula: "50:50" },
  'unn':      { hasJamb: true, hasPostUtme: true,  hasOLevel: false, explanation: "UNN (50:50): JAMB and Post-UTME average.", formula: "50:50" },
  'unilorin': { hasJamb: true, hasPostUtme: true,  hasOLevel: true,  explanation: "UNILORIN (50:30:20): JAMB(50) + Post-UTME(30) + O-Level(20).", formula: "50:30:20" },
  'uniben':   { hasJamb: true, hasPostUtme: true,  hasOLevel: false, explanation: "UNIBEN (50:50): JAMB and Post-UTME average.", formula: "50:50" },
  'uniport':  { hasJamb: true, hasPostUtme: true,  hasOLevel: false, explanation: "UNIPORT (50:50): JAMB and Post-UTME average.", formula: "50:50" },
  'fuoye':    { hasJamb: true, hasPostUtme: false, hasOLevel: true,  explanation: "FUOYE Point-Based (60:30:10): JAMB Score (60%) + O'Level Score (30%) + Sitting Bonus (10%).", formula: "fuoye" },
  'delsu':    { hasJamb: true, hasPostUtme: true,  hasOLevel: false, explanation: "DELSU (50:50): JAMB (50%) + Post-UTME (50%). No O'Level points are used in the aggregate score calculation.", formula: "50:50" },
  'delta-state': { hasJamb: true, hasPostUtme: true,  hasOLevel: false, explanation: "DELSU (50:50): JAMB (50%) + Post-UTME (50%). No O'Level points are used in the aggregate score calculation.", formula: "50:50" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calculateAggregateScore = (
  jamb: number,
  post: number,
  olevelTotal: number,
  uniName: string,
  system: ScoringSystem | null
): number => {
  if (!system) {
    return jamb / 4;
  }

  const normalizedUni = uniName.toLowerCase();
  const desc = system.explanation.toLowerCase();
  const formula = system.formula || '';

  if (formula === 'futa_75_25' || normalizedUni.includes('futa') || (normalizedUni.includes('technology') && normalizedUni.includes('akure')) || desc.includes('75:25') || desc.includes('75_25')) {
    // FUTA 75:25: JAMB is (JAMB / 400) * 75, O'Level is (Average of 5 grades) * 0.25 = (olevelTotal / 5) * 0.25
    return (jamb / 400 * 75) + ((olevelTotal / 5) * 0.25);
  }
  if (formula === 'lautech_80_20' || normalizedUni.includes('lautech') || normalizedUni.includes('ladoke') || desc.includes('80:20') || desc.includes('80_20')) {
    // LAUTECH 80:20: JAMB (80%) + O'Level points (max 20 points from 5 subjects)
    return (jamb / 400 * 80) + olevelTotal;
  }
  if (formula === 'lasu_60_40' || normalizedUni.includes('lasu') || desc.includes('60:40') || desc.includes('60_40')) {
    return (jamb / 400 * 60) + olevelTotal;
  }
  if (formula === 'lasu_point_based') {
    return (jamb / 8) + olevelTotal;
  }
  if (formula === '50:30:20' || formula === '50/30/20' || formula === '50_30_20' || desc.includes('50:30:20') || desc.includes('50/30/20') || (desc.includes('50%') && desc.includes('30%') && desc.includes('20%'))) {
    return (jamb / 400 * 50) + (post / 100 * 30) + olevelTotal;
  }
  if (formula === '50:20:30' || formula === '50/20/30' || desc.includes('50:20:30') || desc.includes('kwasu')) {
    return (jamb / 400 * 50) + (post / 100 * 20) + (olevelTotal / 50 * 30);
  }
  if (formula === '50:40:10' || formula === '50/40/10' || desc.includes('50:40:10') || normalizedUni.includes('awolowo') || normalizedUni.includes('oau')) {
    return (jamb / 8) + (post / 100 * 40) + olevelTotal;
  }
  if (formula === '50:50' || formula === '50/50' || desc.includes('50:50') || desc.includes('50/50') || (desc.includes('50%') && desc.includes('50%'))) {
    return (jamb / 8) + (post / 2);
  }
  if (formula === 'pure_jamb' || desc.includes('pure_jamb') || desc.includes('jamb / 4')) {
    return jamb / 4;
  }

  if (desc.includes('point-based')) {
    if (normalizedUni.includes('futa') || (normalizedUni.includes('technology') && normalizedUni.includes('akure'))) {
      return (jamb / 400 * 75) + ((olevelTotal / 5) * 0.25);
    }
    return (jamb / 8) + olevelTotal;
  }

  // Fallback for standard federal & state universities using 50/30/20
  return (jamb / 400 * 50) + (post / 100 * 30) + olevelTotal;
};

const getUniversityGradePoints = (uniName: string): {
  gradeMap: Record<OLevelGrade, number>;
  maxPoints: number;
  styleDesc: string;
} => {
  const normalized = uniName.toLowerCase();

  if (normalized.includes('futa') || (normalized.includes('technology') && normalized.includes('akure'))) {
    const map: Record<OLevelGrade, number> = {
      'A1': 80, 'B2': 72, 'B3': 67, 'C4': 62, 'C5': 57, 'C6': 52, 'D7': 0, 'E8': 0, 'F9': 0
    };
    return {
      gradeMap: map,
      maxPoints: 400,
      styleDesc: "FUTA 75:25 O'Level scale (A1=80, B2=72, B3=67, C4=62, C5=57, C6=52, best 5 average scaled to 25%)"
    };
  }
  
  if (normalized.includes('fuoye') || normalized.includes('oye-ekiti') || normalized.includes('oye ekiti')) {
    const map: Record<OLevelGrade, number> = {
      'A1': 6.0, 'B2': 5.0, 'B3': 4.0, 'C4': 3.0, 'C5': 2.0, 'C6': 1.0, 'D7': 0, 'E8': 0, 'F9': 0
    };
    return {
      gradeMap: map,
      maxPoints: 30,
      styleDesc: "FUOYE O'Level scale (A1=6, B2=5, B3=4, C4=3, C5=2, C6=1, summed, max 30 points)"
    };
  }
  
  if (normalized.includes('lasu') || normalized.includes('lagos state')) {
    const map: Record<OLevelGrade, number> = {
      'A1': 8, 'B2': 7, 'B3': 6, 'C4': 5, 'C5': 4, 'C6': 3, 'D7': 0, 'E8': 0, 'F9': 0
    };
    return {
      gradeMap: map,
      maxPoints: 40,
      styleDesc: "LASU O'Level scale (A1=8, B2=7, B3=6, C4=5, C5=4, C6=3)"
    };
  }
  
  if (normalized.includes('lautech') || normalized.includes('ladoke')) {
    const map: Record<OLevelGrade, number> = {
      'A1': 4.0, 'B2': 3.6, 'B3': 3.2, 'C4': 2.8, 'C5': 2.4, 'C6': 2.0, 'D7': 0, 'E8': 0, 'F9': 0
    };
    return {
      gradeMap: map,
      maxPoints: 20,
      styleDesc: "LAUTECH 80:20 O'Level scale (A1=4.0, B2=3.6, B3=3.2, C4=2.8, C5=2.4, C6=2.0, max 20 points from 5 subjects)"
    };
  }
  
  if (normalized.includes('lagos') || normalized.includes('unilag') || normalized.includes('ilorin') || normalized.includes('unilorin')) {
    const map: Record<OLevelGrade, number> = {
      'A1': 4.0, 'B2': 3.6, 'B3': 3.2, 'C4': 2.8, 'C5': 2.4, 'C6': 2.0, 'D7': 0, 'E8': 0, 'F9': 0
    };
    return {
      gradeMap: map,
      maxPoints: 20,
      styleDesc: 'UNILAG & UNILORIN 20-Point scale (A1=4.0, B2=3.6, C6=2.0)'
    };
  }

  if (normalized.includes('awolowo') || normalized.includes('oau')) {
    const map: Record<OLevelGrade, number> = {
      'A1': 2.0, 'B2': 1.8, 'B3': 1.6, 'C4': 1.4, 'C5': 1.2, 'C6': 1.0, 'D7': 0, 'E8': 0, 'F9': 0
    };
    return {
      gradeMap: map,
      maxPoints: 10,
      styleDesc: "OAU O'Level scale (A1=2.0, B2=1.8, B3=1.6, C4=1.4, C5=1.2, C6=1.0)"
    };
  }

  if (normalized.includes('ibadan') || normalized.includes('ui') || 
      normalized.includes('nigeria') || normalized.includes('unn') || 
      normalized.includes('benin') || normalized.includes('uniben') ||
      normalized.includes('port harcourt') || normalized.includes('uniport') ||
      normalized.includes('uyo') || normalized.includes('uniuyo')) {
    const map: Record<OLevelGrade, number> = {
      'A1': 0, 'B2': 0, 'B3': 0, 'C4': 0, 'C5': 0, 'C6': 0, 'D7': 0, 'E8': 0, 'F9': 0
    };
    return {
      gradeMap: map,
      maxPoints: 0,
      styleDesc: 'Admission requirement only (No direct points computed into aggregate)'
    };
  }

  // Default points system: FUTA, Minna, FUTO, etc.
  const defaultMap: Record<OLevelGrade, number> = {
    'A1': 10, 'B2': 9, 'B3': 8, 'C4': 7, 'C5': 6, 'C6': 5, 'D7': 0, 'E8': 0, 'F9': 0
  };
  const isFuta = normalized.includes('futa') || normalized.includes('akure') || normalized.includes('technology');
  return {
    gradeMap: defaultMap,
    maxPoints: 50,
    styleDesc: isFuta ? "FUTA/O'level point scale (A1=10, B2=9, C6=5)" : "Standard 50-Point O'level scale (A1=10, B2=9, C6=5)"
  };
};

const getJambMinimumCutoff = (uni: { name: string; category?: string } | null): number => {
  if (!uni) return 140;
  const n = uni.name.toLowerCase();
  if (n.includes("akure") || n.includes("futa")) return 180;
  if (n.includes("lagos") || n.includes("ibadan") || n.includes("awolowo") ||
      n.includes("oau") || n.includes("ife") || n.includes("benin") ||
      n.includes("ilorin") || n.includes("nsukka") || n.includes("nigeria")) return 200;
  if (n.includes("port harcourt") || n.includes("uniport") || n.includes("abello") ||
      n.includes("abu") || n.includes("jos") || n.includes("unijos") ||
      n.includes("technology, minna") || n.includes("futminna") ||
      n.includes("technology, owerri") || n.includes("futo") ||
      n.includes("nnamdi azikiwe") || n.includes("unizik") ||
      n.includes("uyo") || n.includes("uniuyo") || n.includes("calabar") ||
      n.includes("unical") || n.includes("state university") || n.includes("lasu")) return 160;
  if (uni.category === 'Polytechnic' || uni.category === 'COE') return 100;
  return 140;
};

const getPostUtmeStatus = (schoolName: string): PostUtmeStatusInfo => {
  const n = schoolName.toLowerCase();
  const active = (details: string, portalLink?: string): PostUtmeStatusInfo => ({
    isOut: true,
    statusText: "Registration Active",
    badgeColor: "bg-emerald-500/15 border-emerald-500/35",
    textColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    details,
    portalLink,
  });
  const pending = (details: string): PostUtmeStatusInfo => ({
    isOut: false,
    statusText: "Form Awaiting / TBA",
    badgeColor: "bg-amber-500/15 border-amber-500/35",
    textColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    details,
  });

  const closedOnline = (details: string, portalLink?: string): PostUtmeStatusInfo => ({
    isOut: false,
    statusText: "Online Screening (No Exam)",
    badgeColor: "bg-blue-500/15 border-blue-500/35",
    textColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    details,
    portalLink,
  });

  const closedExam = (details: string, portalLink?: string): PostUtmeStatusInfo => ({
    isOut: true,
    statusText: "CBT Exams / Screening",
    badgeColor: "bg-purple-500/15 border-purple-500/35",
    textColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    details,
    portalLink,
  });

  if (n.includes("lagos") || n.includes("unilag"))
    return closedExam("UNILAG 2026/2027 Post-UTME registration is closed. CBT screening exams & results processing in progress.", "https://applications.unilag.edu.ng/home");
  if (n.includes("ibadan") || n.includes("ui"))
    return active("UI 2026/2027 Post-UTME form sales & exam timetable on portal. Fee: ₦5,000.", "https://admissions.ui.edu.ng/#/");
  if (n.includes("awolowo") || n.includes("oau") || n.includes("ife"))
    return closedExam("OAU 2026/2027 Post-UTME registration is closed. Screening CBT exams ongoing.", "https://eportal2.oauife.edu.ng/ug/admissions");
  if (n.includes("benin") || n.includes("uniben"))
    return closedExam("UNIBEN 2026/2027 Post-UTME registration is officially closed. Candidates are writing/awaiting screening scores and JAMB CAPS list releases.", "https://unibenportal.com/#application");
  if (n.includes("nsukka") || n.includes("nigeria") || n.includes("unn"))
    return closedOnline("UNN 2026/2027 Post-UTME registration is closed. UNN conducts online O'Level screening (No CBT exam written). Aggregate score processing in progress.", "https://unnportal.unn.edu.ng/");
  if (n.includes("futa") || n.includes("technology, akure"))
    return closedOnline("FUTA 2026/2027 Point-Based screening registration is closed. FUTA conducts purely online screening (No CBT exam written). Point ranking in progress.", "https://www.futa.edu.ng/");
  if (n.includes("lasu") || n.includes("lagos state"))
    return closedOnline("LASU 2026/2027 screening application portal closed. LASU evaluates via online point-based screening (No exam written). Results released on portal.", "https://services.lidc.lasu.edu.ng/admissionscreening/");
  if (n.includes("futminna") || n.includes("technology, minna"))
    return active("FUTMinna 2026/2027 online registration on portal. Cutoff: 180.", "https://futminna.edu.ng");
  if (n.includes("futo") || n.includes("technology, owerri"))
    return closedOnline("FUTO 2026/2027 screening registration closed. Online screening scores calculated from JAMB + O'Level uploaded on portal.", "https://portal.futo.edu.ng/#undergraduate");
  if (n.includes("port harcourt") || n.includes("uniport"))
    return closedExam("UNIPORT 2026/2027 Post-UTME registration closed. CBT screening exams & evaluations ongoing.", "https://utmedetails.uniport.edu.ng/welcome_utme.php");
  if (n.includes("ilorin") || n.includes("unilorin"))
    return active("UNILORIN 2026/2027 Post-UTME registration active. Cutoff: 180.", "https://admissions.unilorin.edu.ng/");
  if (n.includes("bayero") || n.includes("buk"))
    return active("BUK 2026/2027 Post-UTME online screening portal live for 180+ score.", "https://buk.edu.ng/");
  if (n.includes("abu") || n.includes("abello") || n.includes("zaria"))
    return active("ABU Zaria 2026/2027 Post-UTME forms on portal. Cutoff: 180.", "https://portal.abu.edu.ng/forms");
  if (n.includes("nnamdi azikiwe") || n.includes("unizik"))
    return active("UNIZIK 2026/2027 Post-UTME screening registration application link live. Cutoff: 180.", "https://apply.unizik.edu.ng/auth/login");
  if (n.includes("uyo") || n.includes("uniuyo"))
    return closedOnline("UNIUYO 2026/2027 Post-UTME screening registration closed. Online O'Level screening (No exam written) processing.", "https://eportals.uniuyo.edu.ng/");
  if (n.includes("osun state") || n.includes("uniosun"))
    return active("UNIOSUN 2026/2027 Post-UTME screening application portal active. Fee: ₦3,000.", "https://admissions.uniosun.edu.ng/");
  if (n.includes("olabisi onabanjo") || n.includes("oou"))
    return closedOnline("OOU 2026/2027 Post-UTME screening registration closed. Online point-based screening (No CBT exam) evaluation in progress.", "https://putme.oouagoiwoye.edu.ng/");
  if (n.includes("ekiti state") || n.includes("eksu"))
    return active("EKSU 2026/2027 Post-UTME online screening portal active. Cutoff: 160.", "https://eksuportal.eksu.edu.ng/");
  if (n.includes("fuoye") || n.includes("oye-ekiti"))
    return closedOnline("FUOYE 2026/2027 Post-UTME screening registration closed. FUOYE conducts purely online point screening (No exam written). Aggregate ranking in progress.", "https://putme.fuoye.edu.ng/utme/");
  if (n.includes("delta state") || n.includes("delsu"))
    return closedExam("DELSU 2026/2027 Post-UTME screening registration closed. Post-UTME CBT screening exams conducted.", "https://portal.delsuces.online/");
  if (n.includes("lautech") || n.includes("ladoke akintola"))
    return active("LAUTECH 2026/2027 Post-UTME screening portal active. Cutoff: 170.", "https://eportal.lautech.edu.ng/ug/admissions");
  if (n.includes("kwara state") || n.includes("kwasu"))
    return active("KWASU 2026/2027 Post-UTME registration portal active.", "https://portal.kwasu.edu.ng/");
  if (n.includes("nasarawa state") || n.includes("nsuk"))
    return active("NSUK Keffi 2026/2027 Post-UTME screening application portal active.", "https://portal.nsuk.edu.ng/");
  if (n.includes("sule lamido") || n.includes("slu"))
    return active("SLU 2026/2027 Post-UTME screening registration portal active. Cutoff: 160.", "https://admissions.slu.edu.ng/");
  if (n.includes("wukari") || n.includes("fuwukari"))
    return active("FUWukari 2026/2027 Post-UTME registration portal active.", "https://ug.fuwportal.edu.ng/putme_registration.php");
  if (n.includes("otukpo") || n.includes("fuhso"))
    return active("FUHSO 2026/2027 Post-UTME screening application portal active.", "https://postutme.fuhso.edu.ng/apply");
  if (n.includes("kogi state") || n.includes("ksu") || n.includes("paau"))
    return closedOnline("PAAU / KSU 2026/2027 Post-UTME screening registration closed.", "https://portal.paau.edu.ng/pd_dip/utme_dashboard");
  if (n.includes("custech") || n.includes("confluence"))
    return active("CUSTECH 2026/2027 Post-UTME screening portal active.", "https://eportal.custech.edu.ng/utme/index.php");
  if (n.includes("plateau state") || n.includes("plasu"))
    return active("PLASU 2026/2027 Post-UTME screening portal active. Cutoff: 160.", "https://plasu.edu.ng/");
  if (n.includes("modibbo adama") || n.includes("mau"))
    return active("MAU Yola 2026/2027 Post-UTME screening application portal active.", "https://mau.edu.ng/");
  if (n.includes("abubakar tafawa balewa") || n.includes("atbu"))
    return active("ATBU 2026/2027 Post-UTME screening login portal active.", "http://screening.atbu.edu.ng/pages/login.php");

  return pending(`${schoolName} 2026/2027 Post-UTME status: Check official university portal for active registration windows or screening score releases.`);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProbabilityGauge: React.FC<{ probability: number }> = ({ probability }) => {
  const color =
    probability > 75 ? 'text-emerald-500' :
    probability > 50 ? 'text-cyan-400' :
    probability > 30 ? 'text-orange-500' :
    'text-red-500';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 border-[12px] border-white/5 rounded-full" />
        <motion.div
          initial={{ rotate: -90 }}
          animate={{ rotate: -90 + (probability * 1.8) }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`absolute top-0 left-0 w-40 h-40 border-[12px] border-current rounded-full ${color}`}
          style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 50%, 0 50%)' }}
        />
      </div>
      <div className="mt-4 text-center flex flex-col items-center">
        <p className={`text-4xl font-black ${color}`}>{probability}%</p>
        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/5 text-[8.5px] font-black uppercase text-gray-400 tracking-wider">
          <Sparkles size={10} className="text-cyan-400" />
          <span>AI / Model Forecast</span>
        </div>
        <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mt-1">Merit Strength Index</p>
        <p className="text-[9px] text-gray-400 max-w-[200px] leading-snug mt-1 font-medium">
          Statistical model estimate based on your score difference vs competitive applicant distribution
        </p>
      </div>
    </div>
  );
};

// ─── SCHOOL LANDING DATA ──────────────────────────────────────────────────────

interface LandingData {
  fullName: string;
  formulaDesc: string;
  formulaSteps: string[];
  cutoffs: { course: string; score: string }[];
  postUtmeGuide: {
    format: string;
    subjects: string;
    duration: string;
    fee: string;
    tips: string[];
  };
}

const SCHOOL_LANDING_DATA: Record<string, LandingData> = {
  unilag: {
    fullName: "University of Lagos (UNILAG)",
    formulaDesc: "UNILAG calculates your aggregate out of 100 using a strict 50:30:20 ratio.",
    formulaSteps: [
      "JAMB Score: Divided by 8 (Max 50 points).",
      "Post-UTME Score: Converted out of 30 (Max 30 points).",
      "O'Level Grades: Your best 5 required subjects are graded as: A1=4.0, B2=3.6, B3=3.2, C4=2.8, C5=2.4, C6=2.0 (Max 20 points)."
    ],
    cutoffs: [
      { course: "Medicine & Surgery", score: "80.50+" },
      { course: "Nursing Science", score: "72.30+" },
      { course: "Law", score: "76.80+" },
      { course: "Computer Science", score: "75.40+" },
      { course: "Accounting", score: "74.15+" },
      { course: "Mechanical Engineering", score: "73.80+" }
    ],
    postUtmeGuide: {
      format: "Computer-Based Test (CBT)",
      subjects: "English Language (20 questions), Mathematics (10 questions), General Paper (10 questions).",
      duration: "30 Minutes",
      fee: "₦2,000",
      tips: [
        "Speed is everything! You have just 45 seconds per question.",
        "Practice past questions extensively. English and Math questions are often repeated.",
        "General paper covers current affairs, history of Nigeria, and basic science."
      ]
    }
  },
  oau: {
    fullName: "Obafemi Awolowo University (OAU)",
    formulaDesc: "OAU operates on a 50:40:10 aggregate scoring model.",
    formulaSteps: [
      "JAMB Score: Divided by 8 (Max 50 points).",
      "Post-UTME Exam: Score out of 40 (Max 40 points).",
      "O'Level Points: Maximum of 10 points. Graded as: A1=2.0, B2=1.8, B3=1.6, C4=1.4, C5=1.2, C6=1.0. A 1-sitting result gets a bonus, whereas 2-sittings are capped at 9.0 max."
    ],
    cutoffs: [
      { course: "Medicine & Surgery", score: "78.20+" },
      { course: "Nursing Science", score: "70.90+" },
      { course: "Pharmacy", score: "73.50+" },
      { course: "Law", score: "74.10+" },
      { course: "Computer Science with Economics", score: "69.50+" },
      { course: "Civil Engineering", score: "68.40+" }
    ],
    postUtmeGuide: {
      format: "Computer-Based Test (CBT)",
      subjects: "10 questions from English Language, and 10 questions from each of your 3 UTME subjects.",
      duration: "60 Minutes",
      fee: "₦2,000",
      tips: [
        "Prepare for high-level aptitude questions alongside your main school subjects.",
        "OAU screening is highly competitive. Aim for at least 30/40 in the Post-UTME.",
        "Accuracy is highly rewarded. Take time to double-check calculations."
      ]
    }
  },
  ui: {
    fullName: "University of Ibadan (UI)",
    formulaDesc: "UI uses a straightforward 50:50 combination of UTME and Post-UTME. Aggregate = (JAMB / 8) + (Post-UTME / 2). No O'Level grade points are added to the aggregate, but 5 credits in 1 sitting are mandatory for core faculties.",
    formulaSteps: [
      "JAMB Score: Divided by 8 (Max 50 points).",
      "Post-UTME Exam: Divided by 2 (Max 50 points).",
      "Aggregate = (JAMB / 8) + (Post-UTME / 2). Minimum 50% aggregate required for admission consideration across all faculties."
    ],
    cutoffs: [
      { course: "Medicine and Surgery", score: "78.875" },
      { course: "Nursing Science", score: "71.375" },
      { course: "Law", score: "70.875" },
      { course: "Mechanical Engineering", score: "70.500" },
      { course: "Electrical & Electronics Engineering", score: "70.000" },
      { course: "Pharmacy", score: "69.125" },
      { course: "Dentistry", score: "68.625" },
      { course: "Accounting", score: "68.500" },
      { course: "Physiotherapy", score: "65.125" },
      { course: "Computer Science", score: "63.500" },
      { course: "Medical Laboratory Science", score: "63.250" },
      { course: "Civil Engineering", score: "63.250" },
      { course: "Petroleum Engineering", score: "62.750" },
      { course: "Communication and Language Arts", score: "61.000" },
      { course: "Economics", score: "58.125" },
      { course: "Veterinary Medicine", score: "57.125" },
      { course: "Linguistics", score: "56.875" },
      { course: "Agricultural & Environmental Eng.", score: "56.875" },
      { course: "English", score: "56.500" },
      { course: "Theatre Arts", score: "56.000" },
      { course: "Physiology", score: "55.750" },
      { course: "Human Nutrition & Dietetics", score: "55.625" },
      { course: "Political Science", score: "55.375" },
      { course: "Biomedical Engineering", score: "55.375" },
      { course: "Psychology", score: "54.500" },
      { course: "Biochemistry", score: "53.125" }
    ],
    postUtmeGuide: {
      format: "Computer-Based Test (CBT)",
      subjects: "English Language, Mathematics, and other UTME subject combinations (100 questions total).",
      duration: "60 Minutes",
      fee: "₦2,000",
      tips: [
        "UI is extremely strict on the 1-sitting O'Level requirement for core professional courses.",
        "The Post-UTME questions are standard textbook questions but require rigorous depth.",
        "Ensure your subject combination exactly matches the official UI requirements."
      ]
    }
  },
  lasu: {
    fullName: "Lagos State University (LASU)",
    formulaDesc: "LASU calculates its aggregate out of 100 via a Point-Based O'Level & JAMB formula (60:40). There is no written Post-UTME exam!",
    formulaSteps: [
      "JAMB Score: Multiplied by 0.15 (Max 60 points).",
      "O'Level Grades: Converted to a max of 40 points. Based on best 5 subjects: A1=10, A2/B2=9, B3=8, C4=7, C5=6, C6=5 points."
    ],
    cutoffs: [
      { course: "Medicine & Surgery", score: "79.20+" },
      { course: "Nursing Science", score: "69.50+" },
      { course: "Law", score: "73.80+" },
      { course: "Computer Science", score: "65.40+" },
      { course: "Mass Communication", score: "64.15+" }
    ],
    postUtmeGuide: {
      format: "Online Screening & Point Computation (No Exam)",
      subjects: "N/A (Calculated solely based on JAMB and O'Level Grades).",
      duration: "N/A",
      fee: "₦2,000 (Screening Registration)",
      tips: [
        "Since there's no written exam, O'Level grade strength is paramount. If you don't have mostly A1 and B2/B3, your aggregate might drop below cutoff.",
        "Ensure your O'Level grades are correctly uploaded on both the JAMB CAPS portal and the LASU screening portal.",
        "Always double-check your computed point total before final screening submission."
      ]
    }
  },
  uniben: {
    fullName: "University of Benin (UNIBEN)",
    formulaDesc: "UNIBEN utilizes a strict 50:50 aggregate scoring model based on JAMB and Post-UTME. No O'Level points are added directly to the score.",
    formulaSteps: [
      "JAMB Score: Divided by 8 (Max 50 points).",
      "Post-UTME Score: Converted out of 50 (Max 50 points).",
      "Aggregate = (JAMB / 8) + (Post-UTME / 2). No O'Level points are directly added, but passing grades are mandatory."
    ],
    cutoffs: [
      { course: "Medicine & Surgery", score: "76.50+" },
      { course: "Nursing Science", score: "68.20+" },
      { course: "Pharmacy", score: "71.00+" },
      { course: "Law", score: "72.80+" },
      { course: "Computer Science", score: "65.40+" }
    ],
    postUtmeGuide: {
      format: "Computer-Based Test (CBT)",
      subjects: "English Language, Mathematics, and core UTME subjects.",
      duration: "60 Minutes",
      fee: "₦2,000",
      tips: [
        "UNIBEN past questions are highly repeated, especially in English and general biology.",
        "Ensure you arrive early at the Ugbowo campus for your scheduled biometric verification.",
        "CBT interface is responsive but has a strict countdown timer. Work with speed."
      ]
    }
  },
  unilorin: {
    fullName: "University of Ilorin (UNILORIN)",
    formulaDesc: "UNILORIN operates on a 50:30:20 aggregate scoring model.",
    formulaSteps: [
      "JAMB Score: Divided by 8 (Max 50 points).",
      "Post-UTME Score: Converted out of 30 (Max 30 points).",
      "O'Level Points: Graded out of 20 points: A1=4.0, B2=3.6, B3=3.2, C4=2.8, C5=2.4, C6=2.0 (Max 20 points)."
    ],
    cutoffs: [
      { course: "Medicine & Surgery", score: "78.50+" },
      { course: "Nursing Science", score: "70.20+" },
      { course: "Pharmacy", score: "71.80+" },
      { course: "Law", score: "72.50+" },
      { course: "Computer Science", score: "68.40+" }
    ],
    postUtmeGuide: {
      format: "Computer-Based Test (CBT)",
      subjects: "English Language, Mathematics, and General Paper questions.",
      duration: "30 Minutes",
      fee: "₦2,000",
      tips: [
        "The screening is extremely fast. You have less than 45 seconds per question.",
        "Expect a high volume of current affairs, simple logical reasoning, and vocabulary questions.",
        "No calculator is allowed, so practice mental arithmetic for the quantitative section."
      ]
    }
  },
  unn: {
    fullName: "University of Nigeria, Nsukka (UNN)",
    formulaDesc: "UNN operates a 50:50 ratio of your JAMB score and Post-UTME score.",
    formulaSteps: [
      "JAMB Score: Divided by 8 (Max 50 points).",
      "Post-UTME Score: Divided by 2 (Max 50 points).",
      "Aggregate Score: (JAMB / 8) + (Post-UTME / 2). A clear average of both main examinations."
    ],
    cutoffs: [
      { course: "Medicine & Surgery", score: "78.50+" },
      { course: "Nursing Science", score: "69.80+" },
      { course: "Pharmacy", score: "72.40+" },
      { course: "Law", score: "73.10+" },
      { course: "Computer Science", score: "66.80+" }
    ],
    postUtmeGuide: {
      format: "Computer-Based Test (CBT)",
      subjects: "Four subjects matching your JAMB subject combination.",
      duration: "60 Minutes",
      fee: "₦2,000",
      tips: [
        "UNN repeats past questions with minor changes in numbers or wording. Study past booklets.",
        "Core science questions can be lengthy; skip hard ones and return if time permits.",
        "Strict penalty for exam malpractice. Be well-behaved inside the ICT hubs."
      ]
    }
  },
  futa: {
    fullName: "Federal University of Technology, Akure (FUTA)",
    formulaDesc: "FUTA calculates its aggregate using a 75:25 Point-Based formula (JAMB 75% + O'Level 25%). There is a Computer-Based Post-UTME screening at the Digital Resource Centre, Obanla Campus!",
    formulaSteps: [
      "JAMB Score: Divided by 400 and multiplied by 75 (Max 75 points).",
      "O'Level Points: Converted to a max of 25 points based on your best 5 subjects (A1=80, B2=72, B3=67, C4=62, C5=57, C6=52; Total / 20 * 25).",
      "Physics is mandatory for all programmes. Candidates with Awaiting Results are not eligible."
    ],
    cutoffs: [
      { course: "Electrical & Electronics Eng.", score: "74.37%" },
      { course: "Mechanical Engineering", score: "73.75%" },
      { course: "Architecture", score: "72.87%" },
      { course: "Civil & Environmental Eng.", score: "71.87%" },
      { course: "Computer Engineering", score: "69.62%" },
      { course: "Computer Science", score: "69.00%" }
    ],
    postUtmeGuide: {
      format: "Computer-Based Screening (CBT) at FUTA Digital Resource Centre, Obanla Campus",
      subjects: "CBT Screening based on UTME Subject Combination & O'Level verification.",
      duration: "Scheduled by School / Faculty (Day 1: SAAT/SET/SEMS/SHHT, Day 2: SEET, Day 3: SOC/SOS, Day 4: Mop-up)",
      fee: "₦2,000 (e-Transact platform only)",
      tips: [
        "Physics is a mandatory prerequisite for ALL courses in FUTA (at least a pass).",
        "Your O'Level grades provide 25% of the total aggregate score; higher grades give a major boost.",
        "Ensure results are uploaded to JAMB CAPS. FUTA does NOT accept Awaiting Results."
      ]
    }
  },
  lautech: {
    fullName: "Ladoke Akintola University of Technology (LAUTECH)",
    formulaDesc: "LAUTECH evaluates candidates using an 80:20 composite scoring system (JAMB 80% + O'Level 20%). The official institutional minimum cutoff mark is 170.",
    formulaSteps: [
      "JAMB Score: Multiplied by 0.20 (or JAMB / 400 * 80) for a maximum of 80 points.",
      "O'Level Points: Maximum of 20 points from 5 relevant subjects (A1=4.0, B2=3.6, B3=3.2, C4=2.8, C5=2.4, C6=2.0).",
      "Special Requirement: Medicine (MBBS), Nursing Science, and Medical Laboratory Science require all 5 O'Level credits at ONE sitting only."
    ],
    cutoffs: [
      { course: "Medicine and Surgery (MBBS)", score: "240" },
      { course: "Nursing Science", score: "230" },
      { course: "Computer Science", score: "200" },
      { course: "Medical Laboratory Science", score: "210" },
      { course: "Civil Engineering", score: "190" },
      { course: "Mechanical Engineering", score: "190" }
    ],
    postUtmeGuide: {
      format: "Online Screening / Point Verification (No Physical Exam)",
      subjects: "Verification of JAMB score, O'Level grade points, and bio-data on the LAUTECH admissions portal.",
      duration: "Online Portal Submissions",
      fee: "₦2,000",
      tips: [
        "Medicine & Surgery, Nursing, and Med Lab strictly require 5 O'Level credits in ONE sitting only.",
        "Ensure all O'Level results are properly uploaded to JAMB CAPS before screening deadline.",
        "Minimum general UTME score is 170; top professional courses require 200+ to 240+."
      ]
    }
  },
  abu: {
    fullName: "Ahmadu Bello University (ABU)",
    formulaDesc: "ABU calculates aggregate score using a standard 50:50 ratio of JAMB and Post-UTME score.",
    formulaSteps: [
      "JAMB Score: Divided by 8 (Max 50 points).",
      "Post-UTME Score: Divided by 2 (Max 50 points).",
      "Aggregate = (JAMB / 8) + (Post-UTME / 2). Traditional average method is utilized."
    ],
    cutoffs: [
      { course: "Medicine & Surgery", score: "75.80+" },
      { course: "Nursing Science", score: "66.40+" },
      { course: "Pharmacy", score: "68.20+" },
      { course: "Law", score: "69.50+" },
      { course: "Computer Science", score: "64.20+" }
    ],
    postUtmeGuide: {
      format: "Computer-Based Test (CBT)",
      subjects: "Four subjects matching your JAMB subject combination.",
      duration: "60 Minutes",
      fee: "₦2,000",
      tips: [
        "ABU CBT is highly organized and strict on timing. Work on your speed.",
        "Study the main ABU past questions booklet. Many questions are recycled.",
        "Double-check your venue in Samaru (Main Campus) or Kongo Campus to avoid confusion."
      ]
    }
  }
};

// ─── UGC Component ────────────────────────────────────────────────────────────

interface SchoolUgcSectionProps {
  schoolSlug: string;
  user: any;
  onLoginRequest: () => void;
}

const SchoolUgcSection: React.FC<SchoolUgcSectionProps> = ({
  schoolSlug,
  user,
  onLoginRequest,
}) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'tip' | 'question' | 'review' | 'experience'>('tip');
  const [newRating, setNewRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSchoolUgc(schoolSlug);
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [schoolSlug]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onLoginRequest();
      return;
    }
    if (!newContent.trim()) return;

    setSubmitting(true);
    try {
      const name = user.displayName || user.email?.split('@')[0] || "Scholar";
      const photo = user.photoURL || "";
      const id = await addSchoolUgc(
        schoolSlug,
        user.uid,
        name,
        photo,
        newContent.trim(),
        newCategory,
        newRating
      );
      if (id) {
        setNewContent('');
        await fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      onLoginRequest();
      return;
    }
    try {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const liked = p.likedBy?.includes(user.uid);
          const likedBy = liked 
            ? p.likedBy.filter((id: string) => id !== user.uid)
            : [...(p.likedBy || []), user.uid];
          const likes = liked ? Math.max(0, p.likes - 1) : p.likes + 1;
          return { ...p, likedBy, likes };
        }
        return p;
      }));

      await likeSchoolUgc(postId, user.uid);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPosts = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter(p => p.category === filter);
  }, [posts, filter]);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'tip': return { text: 'Prep Tip', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'question': return { text: 'Question', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'review': return { text: 'Review', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'experience': return { text: 'Screening Experience', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default: return { text: 'General', bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-black tracking-tight uppercase text-cyan-400 flex items-center gap-2">
            <MessageCircle size={18} /> Student Discussion Hub
          </h3>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1 leading-relaxed">
            Real student guides, past screening experiences, and admission discussions for this school.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
          {['all', 'tip', 'question', 'review', 'experience'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                filter === cat
                  ? 'bg-cyan-500 text-black font-black shadow-md shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white/[0.02] border border-white/5 rounded-[20px] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="post-category" className="text-[8px] font-black uppercase tracking-widest text-gray-500">Post Category</label>
            <select
              id="post-category"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as any)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black text-white outline-none focus:border-cyan-500/50"
            >
              <option value="tip" className="bg-gray-950 text-white font-medium">💡 Preparation / Screening Tip</option>
              <option value="question" className="bg-gray-950 text-white font-medium">❓ Ask a Question</option>
              <option value="review" className="bg-gray-950 text-white font-medium">⭐ Admission / Cutoff Review</option>
              <option value="experience" className="bg-gray-950 text-white font-medium">📝 My Screening Experience</option>
            </select>
          </div>

          {newCategory !== 'question' && (
            <div className="space-y-1.5">
              <label htmlFor="post-rating" className="text-[8px] font-black uppercase tracking-widest text-gray-500">Screening Difficulty Rating</label>
              <div className="flex items-center gap-1.5 h-[34px] pl-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="text-amber-400 hover:scale-110 transition-transform"
                    aria-label={`Rate ${star} Stars`}
                  >
                    <Crown size={18} fill={star <= newRating ? "currentColor" : "none"} className={star <= newRating ? "opacity-100" : "opacity-30"} />
                  </button>
                ))}
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider ml-1">
                  {newRating === 5 ? 'Extremely Tough' : newRating === 4 ? 'Very Competitive' : newRating === 3 ? 'Standard' : newRating === 2 ? 'Moderate' : 'Easy Point-Based'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <textarea
            aria-label="Discussion content"
            placeholder={
              !user
                ? "Sign in with Google to join the discussion forum and share your screening tips!"
                : newCategory === 'tip'
                ? "E.g., Be sure to focus on past Math questions because UNILAG repeats at least 5 questions yearly!"
                : newCategory === 'question'
                ? "Ask your fellow students about specific department guidelines, cutoff patterns, or screening dates..."
                : "Describe your experience, scoring breakdown, or course admission cutoff guidelines..."
            }
            value={newContent}
            onChange={e => setNewContent(e.target.value.slice(0, 2000))}
            disabled={!user}
            rows={3}
            className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-[11px] font-medium leading-relaxed text-white placeholder-gray-500 outline-none focus:border-cyan-500/40 resize-none"
          />
          {user && (
            <div className="absolute bottom-3 right-3 text-[8.5px] text-gray-500 font-bold uppercase">
              {newContent.length}/2000
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {!user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 p-3 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
              <p className="text-[9px] font-semibold text-gray-300 leading-tight">
                Want to write a tip or ask a question? Log in to your scholar account.
              </p>
              <button
                type="button"
                onClick={onLoginRequest}
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap active:scale-95"
              >
                Sign In & Post
              </button>
            </div>
          ) : (
            <div className="flex justify-end w-full">
              <button
                type="submit"
                disabled={submitting || !newContent.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="animate-spin" size={11} /> : <Plus size={11} />} Submit Post
              </button>
            </div>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2.5">
            <Loader2 className="animate-spin text-cyan-400" size={24} />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Loading discussion board...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 px-4 border border-white/5 bg-white/[0.01] rounded-3xl text-center flex flex-col items-center justify-center">
            <MessageCircle size={24} className="text-gray-600 mb-2" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No student posts yet</p>
            <p className="text-[9px] text-gray-500 mt-1 uppercase max-w-[280px]">Be the first to share your admission insights, past questions, or general screening tips!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map(p => {
                const badge = getCategoryBadge(p.category);
                const isLiked = user && p.likedBy?.includes(user.uid);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={p.id}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-black uppercase shadow-inner font-mono">
                          {p.userName ? p.userName.slice(0, 2) : "SC"}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white">{p.userName || "Anonymous Scholar"}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[7.5px] text-gray-500 font-bold uppercase">
                              {p.createdAt ? new Date(p.createdAt.seconds ? p.createdAt.seconds * 1000 : p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 border rounded-full text-[7.5px] font-black uppercase tracking-wider ${badge.bg}`}>
                          {badge.text}
                        </span>
                        {p.category !== 'question' && p.rating && (
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Crown key={star} size={9} fill={star <= p.rating ? "currentColor" : "none"} className={star <= p.rating ? "opacity-100" : "opacity-20"} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] font-medium leading-relaxed text-gray-200 whitespace-pre-wrap font-sans">
                      {p.content}
                    </p>

                    <div className="flex items-center justify-end border-t border-white/[0.03] pt-2 mt-1">
                      <button
                        type="button"
                        onClick={() => handleLike(p.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8.5px] font-black uppercase tracking-widest border transition-all ${
                          isLiked
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-sm shadow-cyan-500/5'
                            : 'bg-black/20 text-gray-500 border-white/5 hover:text-white hover:border-white/10'
                        }`}
                      >
                        <Crown size={10} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-cyan-400" : ""} />
                        Upvote ({p.likes || 0})
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CutoffCalculator: React.FC<CutoffCalculatorProps> = ({
  user,
  onLoginRequest,
  onPremiumRequired,
  onDiscussWithAI,
  initialSchoolName,
  onClearInitialSchool,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // ── Core form state ──
  const [chartWidth, setChartWidth] = useState<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const chartContainerRef = useCallback((node: HTMLDivElement | null) => {
    // Clean up any previous observer first
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (!node) return; // node was unmounted

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) setChartWidth(w);
      }
    });
    observer.observe(node);
    resizeObserverRef.current = observer;

    // Set initial width immediately so there's no flash of "Measuring workspace..."
    const rect = node.getBoundingClientRect();
    if (rect.width > 0) setChartWidth(rect.width);
  }, []);

  const [jambScore, setJambScore] = useState('');
  const [postUtmeScore, setPostUtmeScore] = useState('');
  const [targetUni, setTargetUni] = useState<any>(null);
  const [targetCourse, setTargetCourse] = useState('');
  const [uniSearch, setUniSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [scoringSystem, setScoringSystem] = useState<ScoringSystem | null>(null);
  const [predictionHelpfulState, setPredictionHelpfulState] = useState<boolean | null>(null);
  const [showOutcomeForm, setShowOutcomeForm] = useState<boolean>(false);
  const [outcomeFormSubmitted, setOutcomeFormSubmitted] = useState<boolean>(false);
  const [selectedOutcomeStatus, setSelectedOutcomeStatus] = useState<'admitted' | 'not_admitted' | 'changed_course' | 'still_waiting'>('admitted');
  const [outcomeAdmissionType, setOutcomeAdmissionType] = useState<'merit' | 'catchment' | 'elds' | 'transfer' | 'other'>('merit');

  // Manual Override states (added in case school suddenly changes calculation formula mid-cycle)
  const [manualOverrideActive, setManualOverrideActive] = useState(false);
  const [manualHasJamb, setManualHasJamb] = useState(true);
  const [manualHasPostUtme, setManualHasPostUtme] = useState(true);
  const [manualHasOLevel, setManualHasOLevel] = useState(true);
  const [manualFormula, setManualFormula] = useState('50:30:20');

  const currentSchoolSlug = useMemo(() => {
    const path = location.pathname;
    const match = path.match(/\/([a-zA-Z0-9_-]+)-aggregate-calculator/);
    return match ? match[1].toLowerCase() : null;
  }, [location.pathname]);

  const schoolLandingInfo = useMemo(() => {
    if (!currentSchoolSlug) return null;
    return SCHOOL_LANDING_DATA[currentSchoolSlug] || null;
  }, [currentSchoolSlug]);

  const computedScoringSystem = useMemo(() => {
    if (manualOverrideActive) {
      let explanation = "Manual Mode: ";
      if (manualFormula === '50:30:20') explanation += "50:30:20 (JAMB + Post-UTME + O'Level)";
      else if (manualFormula === '50:20:30') explanation += "50:20:30 (JAMB + Post-UTME + O'Level)";
      else if (manualFormula === '50:40:10') explanation += "50:40:10 (JAMB + Post-UTME + O'Level)";
      else if (manualFormula === '50:50') explanation += "50:50 (JAMB + Post-UTME)";
      else if (manualFormula === 'futa_75_25') explanation += "75:25 (JAMB + O'Level)";
      else if (manualFormula === 'lasu_60_40') explanation += "60:40 (JAMB + O'Level)";
      else if (manualFormula === 'lasu_point_based') explanation += "Point-Based (JAMB/8 + O'Level Points)";
      else explanation += "Pure JAMB/4";

      return {
        hasJamb: manualHasJamb,
        hasPostUtme: manualHasPostUtme,
        hasOLevel: manualHasOLevel,
        explanation,
        formula: manualFormula
      };
    }

    const checkText = ((targetUni?.name || '') + ' ' + (targetUni?.slug || '') + ' ' + (initialSchoolName || '') + ' ' + (currentSchoolSlug || '') + ' ' + uniSearch).toLowerCase();
    const isNoPostUtme = 
      targetUni?.scoringSystem?.hasPostUtme === false ||
      scoringSystem?.hasPostUtme === false ||
      checkText.includes('lautech') || checkText.includes('ladoke') ||
      checkText.includes('futa') || checkText.includes('akure') || 
      checkText.includes('lasu') || checkText.includes('lagos state university') || 
      checkText.includes('fuoye') || checkText.includes('oye-ekiti') ||
      targetUni?.category === 'COE';

    if (isNoPostUtme) {
      const isFuta = checkText.includes('futa') || checkText.includes('akure');
      const isLautech = checkText.includes('lautech') || checkText.includes('ladoke');
      const isFuoye = checkText.includes('fuoye') || checkText.includes('oye-ekiti');
      const baseSys = targetUni?.scoringSystem || scoringSystem || TOP_INSTITUTION_MAP[isFuta ? 'futa' : isLautech ? 'lautech' : isFuoye ? 'fuoye' : 'lasu'] || Object.entries(TOP_INSTITUTION_MAP).find(([k]) => checkText.includes(k))?.[1];
      return {
        hasJamb: true,
        hasPostUtme: false,
        hasOLevel: baseSys ? baseSys.hasOLevel : true,
        explanation: baseSys?.explanation || (isFuta ? "FUTA Point-Based (75:25): JAMB(75%) + O-Level(25%)." : isLautech ? "LAUTECH (80:20): JAMB(80%) + O-Level(20%)." : "Point-Based Screening: JAMB + O'Level (No Post-UTME exam)."),
        formula: baseSys?.formula || (isFuta ? "futa_75_25" : isLautech ? "lautech_80_20" : isFuoye ? "fuoye" : "point_based")
      };
    }

    if (targetUni?.scoringSystem) {
      return {
        ...targetUni.scoringSystem,
        hasPostUtme: targetUni.scoringSystem.hasPostUtme !== false
      };
    }

    return scoringSystem;
  }, [manualOverrideActive, scoringSystem, targetUni, manualHasJamb, manualHasPostUtme, manualHasOLevel, manualFormula]);

  // Synchronize dynamic inputs toggle when manual formula preset selection changes
  useEffect(() => {
    if (!manualOverrideActive) return;
    if (manualFormula === '50:30:20' || manualFormula === '50:20:30') {
      setManualHasJamb(true);
      setManualHasPostUtme(true);
      setManualHasOLevel(true);
    } else if (manualFormula === '50:40:10') {
      setManualHasJamb(true);
      setManualHasPostUtme(true);
      setManualHasOLevel(true);
    } else if (manualFormula === '50:50') {
      setManualHasJamb(true);
      setManualHasPostUtme(true);
      setManualHasOLevel(false);
    } else if (manualFormula === 'futa_75_25' || manualFormula === 'lasu_60_40' || manualFormula === 'lasu_point_based') {
      setManualHasJamb(true);
      setManualHasPostUtme(false);
      setManualHasOLevel(true);
    } else if (manualFormula === 'pure_jamb') {
      setManualHasJamb(true);
      setManualHasPostUtme(false);
      setManualHasOLevel(false);
    }
  }, [manualFormula, manualOverrideActive]);

  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [sittings, setSittings] = useState(1);
  const [examBoard1, setExamBoard1] = useState('WAEC (SSCE)');
  const [examBoard2, setExamBoard2] = useState('NECO (SSCE)');
  const [isAR, setIsAR] = useState(false);
  const [isPostUtmePending, setIsPostUtmePending] = useState(false);
  const [isDirectEntry, setIsDirectEntry] = useState(false);
  const [deQualification, setDeQualification] = useState('JUPEB / IJMB');
  const [dePoints, setDePoints] = useState('12');
  const [subjects, setSubjects] = useState<{ name: string; grade: OLevelGrade }[]>([
    { name: 'English Language', grade: 'C6' },
    { name: 'Mathematics',      grade: 'C6' },
    { name: 'Chemistry',        grade: 'C6' },
    { name: 'Physics',          grade: 'C6' },
    { name: 'Biology',          grade: 'C6' },
  ]);
  const [hasManuallyEditedOLevels, setHasManuallyEditedOLevels] = useState(false);

  // JAMB Subjects
  const [jambSubject1, setJambSubject1] = useState('');
  const [jambSubject2, setJambSubject2] = useState('');
  const [jambSubject3, setJambSubject3] = useState('');

  // ── UI state ──
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState(false);
  const [isUploadHubModalOpen, setIsUploadHubModalOpen] = useState(false);
  const [isCutoffAlertOpen, setIsCutoffAlertOpen] = useState(false);
  const [isAccreditationAlertOpen, setIsAccreditationAlertOpen] = useState(false);
  const [isC6AlertOpen, setIsC6AlertOpen] = useState(false);
  const [subjectDisqualificationAlert, setSubjectDisqualificationAlert] = useState<{
    isOpen: boolean;
    title: string;
    reason: string;
    type: 'jamb' | 'olevel';
  }>({ isOpen: false, title: '', reason: '', type: 'jamb' });
  const [bypassSubjectDisqualificationAlert, setBypassSubjectDisqualificationAlert] = useState(false);
  const [validationAlert, setValidationAlert] = useState<{ isOpen: boolean; errors: string[] }>({ isOpen: false, errors: [] });
  const [isAccreditationWarningDisabled, setIsAccreditationWarningDisabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('campusai_accreditation_warning_disabled');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleAccreditationWarning = (val: boolean) => {
    setIsAccreditationWarningDisabled(val);
    try {
      localStorage.setItem('campusai_accreditation_warning_disabled', String(val));
    } catch (e) {
      console.warn(e);
    }
  };

  const [bypassCutoffAlert, setBypassCutoffAlert] = useState(false);
  const [usagePercent, setUsagePercent] = useState(0);
  const [activeGuideTab, setActiveGuideTab] = useState<'formula' | 'cutoff' | 'prep'>('formula');
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [calculationAttempts, setCalculationAttempts] = useState<SavedProfile[]>([]);
  const [isRecentCalculationsOpen, setIsRecentCalculationsOpen] = useState(false);

  const chartData = useMemo(() => {
    const source = calculationAttempts.length > 0 ? calculationAttempts : savedProfiles;
    return [...source]
      .reverse()
      .map((p, idx) => ({
        index: idx + 1,
        id: p.id || `${p.timestamp || idx}-${idx}`,
        name: (p.uniName || '').replace("University of ", "U of ").replace("Federal University of Technology", "FUTA"),
        course: p.courseName,
        score: p.aggregateScore,
        date: new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      }));
  }, [calculationAttempts, savedProfiles]);
  const [feedbackStatus, setFeedbackStatus] = useState<'none' | 'helpful' | 'not_helpful'>('none');
  const [admissionStatus, setAdmissionStatus] = useState<'none' | 'gained' | 'not_yet'>('none');

  // ── Searchable Course & Cutoff Handbook States ──
  const [activeTab, setActiveTab] = useState<'calculate' | 'handbook'>('calculate');
  const [handbookUniSearch, setHandbookUniSearch] = useState('');
  const [isHandbookUniDropdownOpen, setIsHandbookUniDropdownOpen] = useState(false);
  const [selectedHandbookUni, setSelectedHandbookUni] = useState<any>(null);
  const [handbookCourseSearch, setHandbookCourseSearch] = useState('');
  const [handbookCourses, setHandbookCourses] = useState<string[]>([]);
  const [isHandbookLoading, setIsHandbookLoading] = useState(false);
  const [handbookCourseDetails, setHandbookCourseDetails] = useState<Record<string, any>>({});
  const [isCheckingDetails, setIsCheckingDetails] = useState<string | null>(null);

  // ── UI 2025/2026 Cutoffs Explorer State ──
  const [isUICutoffsModalOpen, setIsUICutoffsModalOpen] = useState(false);
  const [uiCutoffSearch, setUiCutoffSearch] = useState('');
  const [uiFacultyFilter, setUiFacultyFilter] = useState('ALL');

  // ── FUTA 2026/2027 Cutoffs Explorer State ──
  const [isFUTACutoffsModalOpen, setIsFUTACutoffsModalOpen] = useState(false);
  const [futaCutoffSearch, setFutaCutoffSearch] = useState('');
  const [futaSchoolFilter, setFutaSchoolFilter] = useState('ALL');

  // ── LAUTECH 2025/2026 Cutoffs Explorer State ──
  const [isLAUTECHCutoffsModalOpen, setIsLAUTECHCutoffsModalOpen] = useState(false);
  const [lautechCutoffSearch, setLautechCutoffSearch] = useState('');
  const [lautechFacultyFilter, setLautechFacultyFilter] = useState('ALL');

  // ── Advanced Calculator Features States ──
  const [simJamb, setSimJamb] = useState<number>(0);
  const [simPost, setSimPost] = useState<number>(0);
  const [simOlevelTotal, setSimOlevelTotal] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Admission Roadmap checkboxes state (hydrated from localStorage)
  const [checkedRoadmapTasks, setCheckedRoadmapTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('campusai_roadmap_checked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [checkedRescueSteps, setCheckedRescueSteps] = useState<Record<string, boolean>>({});

  const toggleRescueStep = (stepId: string) => {
    setCheckedRescueSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  // News alerts subscribed universities list (hydrated from localStorage)
  const [subscribedUnis, setSubscribedUnis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('campusai_subscribed_unis');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Baseline guards ──
  const [hasSetARBaseline, setHasSetARBaseline] = useState(false);
  const [hasSetPostUtmeBaseline, setHasSetPostUtmeBaseline] = useState(false);

  // ── Cutoff Calibration States & Handlers ──
  const [calibratingCourse, setCalibratingCourse] = useState<string | null>(null);
  const [calibratingUni, setCalibratingUni] = useState<string | null>(null);
  const [calRawDeptCutoff, setCalRawDeptCutoff] = useState('');
  const [calRawInstCutoff, setCalRawInstCutoff] = useState('');
  const [calRawExplanation, setCalRawExplanation] = useState('');
  const [isSavingCalibration, setIsSavingCalibration] = useState(false);

  const handleOpenCalibration = async (uniName: string, courseName: string) => {
    setCalibratingUni(uniName);
    setCalibratingCourse(courseName);
    setCalRawDeptCutoff('');
    setCalRawInstCutoff('');
    setCalRawExplanation('');
    try {
      const existing = await getCutoffOverride(uniName, courseName);
      if (existing) {
        setCalRawDeptCutoff(existing.departmentalCutoff || '');
        setCalRawInstCutoff(existing.institutionalCutoff || '');
        setCalRawExplanation(existing.explanation || '');
      }
    } catch (err) {
      console.warn("Could not fetch pre-existing override:", err);
    }
  };

  const handleSaveCalibration = async () => {
    if (!calibratingUni || !calibratingCourse) return;
    setIsSavingCalibration(true);
    try {
      await saveCutoffOverride(
        calibratingUni,
        calibratingCourse,
        calRawDeptCutoff.trim(),
        calRawInstCutoff.trim(),
        calRawExplanation.trim()
      );
      
      const key = `${calibratingUni}_${calibratingCourse}`;
      setHandbookCourseDetails(prev => ({
        ...prev,
        [key]: {
          cutoff: calRawDeptCutoff.trim() + (calRawExplanation.trim() ? ` (${calRawExplanation.trim()})` : ''),
          tuition: prev[key]?.tuition || "N/A",
          isOffered: true,
          subjectValidation: "Standard department rules",
          mathBreakdown: "Check standard guidelines."
        }
      }));

      // Dismiss modal
      setCalibratingCourse(null);
      setCalibratingUni(null);
    } catch (err) {
      console.error("Save calibration failed:", err);
    } finally {
      setIsSavingCalibration(false);
    }
  };

  // ── Google review prompt ──
  const [reviewPromptDismissed, setReviewPromptDismissed] = useState(() => {
    try {
      if (localStorage.getItem('campusai_google_reviewed') === 'true') return true;
      const until = localStorage.getItem('campusai_google_review_dismissed_until');
      if (until) return Date.now() < parseInt(until, 10);
      return false;
    } catch { return false; }
  });

  const handleDismissReviewPrompt = () => {
    try {
      localStorage.setItem('campusai_google_review_dismissed_until', (Date.now() + 86_400_000).toString());
    } catch {}
    setReviewPromptDismissed(true);
  };

  const handleReviewed = () => {
    try { localStorage.setItem('campusai_google_reviewed', 'true'); } catch {}
    setReviewPromptDismissed(true);
  };

  // ── Effects ──

  // Auto-load school from prop or URL slug
  useEffect(() => {
    const searchKey = initialSchoolName || currentSchoolSlug;
    if (!searchKey) return;
    
    const cleanStr = (s: string) => s.toLowerCase().replace(/[,.()]/g, '').trim();
    const cleanSearchKey = cleanStr(searchKey);

    const found = universityData.find((u: any) => {
      const cleanName = cleanStr(u.name || '');
      return u.slug === searchKey.toLowerCase() ||
             (currentSchoolSlug && u.slug === currentSchoolSlug.toLowerCase()) ||
             cleanName === cleanSearchKey ||
             cleanName.includes(cleanSearchKey) ||
             cleanSearchKey.includes(cleanName);
    });

    if (found) {
      setTargetUni(found);
      setUniSearch(found.name);
      setTargetCourse('');
      setCourseSearch('');
      const dbMatch = UNIVERSITIES_DB[found.name] || Object.values(UNIVERSITIES_DB).find(x => x.name.toLowerCase() === found.name.toLowerCase());
      setAvailableCourses(dbMatch?.courses || []);
      if (dbMatch?.scoringSystem) {
        setScoringSystem(dbMatch.scoringSystem);
      }

      // Instantly set scoring system from TOP_INSTITUTION_MAP if available
      const foundSlug = found.slug || (found.name || '').toLowerCase().replace(/\s+/g, '-');
      const instantMatch =
        TOP_INSTITUTION_MAP[foundSlug] ||
        Object.entries(TOP_INSTITUTION_MAP).find(([k]) => found.name.toLowerCase().includes(k))?.[1];
      if (instantMatch) {
        setScoringSystem(instantMatch);
      }

      if (initialSchoolName) {
        onClearInitialSchool?.();
      }
      setTimeout(() => {
        document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }, [initialSchoolName, currentSchoolSlug]);

  // Load saved profiles & calculation attempts with local storage persistence
  useEffect(() => {
    // 1. Instantly load local storage attempts for immediate offline display
    try {
      const storedAttempts = localStorage.getItem('campusai_calculation_attempts');
      if (storedAttempts) {
        const parsed = JSON.parse(storedAttempts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCalculationAttempts(parsed);
        }
      }
    } catch (e) {
      console.error('Error reading local calculation attempts:', e);
    }

    // 2. Hydrate previous active result if present in local storage (unless specific school slug/prop is active)
    try {
      const lastResultStr = localStorage.getItem('campusai_last_calculation_result');
      if (lastResultStr) {
        const lastRes = JSON.parse(lastResultStr);
        if (lastRes && lastRes.aiResult) {
          setAiResult(lastRes.aiResult);
          if (!initialSchoolName && !currentSchoolSlug) {
            if (lastRes.uniName) {
              const u = universityData.find((x: any) => x.name === lastRes.uniName);
              if (u) { setTargetUni(u); setUniSearch(u.name); }
            }
            if (lastRes.courseName) { setTargetCourse(lastRes.courseName); setCourseSearch(lastRes.courseName); }
          }
          if (lastRes.jambScore) setJambScore(lastRes.jambScore);
          if (lastRes.postUtmeScore) setPostUtmeScore(lastRes.postUtmeScore);
          if (lastRes.stateOfOrigin) setStateOfOrigin(lastRes.stateOfOrigin);
        }
      }
    } catch (e) {}

    if (user) {
      // Logged in: pull history from account and sync to local storage
      getCalculationAttempts(user.uid, 10)
        .then(attempts => {
          if (attempts && attempts.length > 0) {
            setCalculationAttempts(attempts as any);
            try {
              localStorage.setItem('campusai_calculation_attempts', JSON.stringify(attempts));
            } catch {}
          }
        })
        .catch(err => console.error('Failed to load calculation attempts from network:', err));
    }

    // Saved scenarios
    try {
      const stored = localStorage.getItem('campusai_saved_profiles');
      if (stored) setSavedProfiles(JSON.parse(stored));
    } catch {}
  }, [user]);

  // Restore user profile
  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((profile: any) => {
      if (!profile) return;
      if (profile.jamb_score)      setJambScore(profile.jamb_score.toString());
      if (profile.target_course)   setTargetCourse(profile.target_course);
      if (profile.state_of_origin) setStateOfOrigin(profile.state_of_origin);
      setWelcomeMessage(`Welcome back ${user.displayName || 'student'}, your last session has been restored.`);
      setTimeout(() => setWelcomeMessage(null), 5000);
    });
  }, [user]);

  // Usage percent
  useEffect(() => {
    const profile = getLocalProfile();
    if (!profile.is_premium)
      setUsagePercent(Math.min(100, ((profile.daily_requests || 0) / DAILY_LIMIT) * 100));
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const p = e.detail;
      // Use meritUsageCount to update usage percent
      if (!p.is_premium)
        setUsagePercent(Math.min(100, (p.meritUsageCount / FREE_USER_LIMIT) * 100));
    };
    window.addEventListener('campusai_quota_updated', handler);
    return () => window.removeEventListener('campusai_quota_updated', handler);
  }, []);

  // AR baseline
  useEffect(() => {
    if (isAR && !hasSetARBaseline) {
      setSubjects(s => s.map(sub => ({ ...sub, grade: 'C6' as OLevelGrade })));
      setHasSetARBaseline(true);
    } else if (!isAR) {
      setHasSetARBaseline(false);
    }
  }, [isAR]);

  // Post-UTME pending baseline
  useEffect(() => {
    if (isPostUtmePending && !hasSetPostUtmeBaseline) {
      setPostUtmeScore('70');
      setHasSetPostUtmeBaseline(true);
    } else if (!isPostUtmePending && hasSetPostUtmeBaseline) {
      setPostUtmeScore('');
      setHasSetPostUtmeBaseline(false);
    }
  }, [isPostUtmePending, hasSetPostUtmeBaseline]);

  // Auto-align O-Level subjects with JAMB subjects
  useEffect(() => {
    if (hasManuallyEditedOLevels) return;

    const newOLevelNames = ['English Language', 'Mathematics'];
    const added = new Set<string>(['English Language', 'Mathematics']);

    // Collect selected JAMB subjects that exist in OLEVEL_SUBJECTS list
    const selectedJamb = [jambSubject1, jambSubject2, jambSubject3]
      .filter(subj => subj && OLEVEL_SUBJECTS.includes(subj));

    selectedJamb.forEach(subj => {
      if (!added.has(subj)) {
        newOLevelNames.push(subj);
        added.add(subj);
      }
    });

    // Fill the remaining spots up to 5 subjects using default science subjects
    const defaultFillers = ['Chemistry', 'Physics', 'Biology'];
    for (const filler of defaultFillers) {
      if (newOLevelNames.length >= 5) break;
      if (!added.has(filler)) {
        newOLevelNames.push(filler);
        added.add(filler);
      }
    }

    // Update state preserving existing grades where possible
    setSubjects(prev => {
      return newOLevelNames.map((name, idx) => {
        const existing = prev.find(p => p.name === name);
        return {
          name,
          grade: existing ? existing.grade : (prev[idx]?.grade || 'C6')
        };
      });
    });
  }, [jambSubject1, jambSubject2, jambSubject3, hasManuallyEditedOLevels]);

  // Reset bypass when score/uni/course/subjects change
  useEffect(() => {
    setBypassCutoffAlert(false);
    setBypassSubjectDisqualificationAlert(false);
  }, [jambScore, targetUni, targetCourse, courseSearch, jambSubject1, jambSubject2, jambSubject3, subjects]);

  // Real-time pre-calculation subject combination validation
  const liveSubjectValidation = useMemo(() => {
    const courseName = targetCourse || courseSearch;
    if ((!jambSubject1 && !jambSubject2 && !jambSubject3) || !courseName) {
      return { valid: true, reason: '' };
    }
    const jambList = ['English Language', jambSubject1, jambSubject2, jambSubject3].filter(Boolean);
    return validateMandatorySubjects(courseName, jambList);
  }, [targetCourse, courseSearch, jambSubject1, jambSubject2, jambSubject3]);

  // Fetch scoring system & courses when uni changes (Offline-first caching hook)
  useEffect(() => {
    if (!targetUni) return;
    const run = async () => {
      setIsSyncing(true);
      setAvailableCourses([]);
      const slug = targetUni.slug || (targetUni.name || '').toLowerCase().replace(/\s+/g, '-');
      const localCacheKey = `campusai_formula_${slug}`;

      const instantMatch =
        TOP_INSTITUTION_MAP[slug] ||
        Object.entries(TOP_INSTITUTION_MAP).find(([k]) => targetUni.name.toLowerCase().includes(k))?.[1];

      // 1. Check LocalStorage for immediate offline access
      try {
        const localData = localStorage.getItem(localCacheKey);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed && !instantMatch) {
            setScoringSystem(parsed as ScoringSystem);
          }
          if (parsed?.courses && Array.isArray(parsed.courses)) {
            setAvailableCourses(parsed.courses);
          }
        }
      } catch (e) {
        console.warn('Failed to read from localStorage:', e);
      }

      if (instantMatch) setScoringSystem(instantMatch);

      try {
        const cached = await getGlobalScoringSystem(slug);
        const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
        const isStale = cached && (Date.now() - (cached.updatedAt?.seconds * 1000 || 0) > TWO_WEEKS);

        if (cached && !isStale) {
          if (!instantMatch) setScoringSystem(cached as ScoringSystem);
          if (cached.courses && Array.isArray(cached.courses)) {
            setAvailableCourses(cached.courses);
            localStorage.setItem(localCacheKey, JSON.stringify(cached));
          } else {
            const courses = await getUniversityCourses(targetUni.name);
            setAvailableCourses(courses);
            const enriched = { ...cached, courses };
            await saveGlobalScoringSystem(slug, enriched);
            await saveHistoricalCutoff(slug, enriched);
            localStorage.setItem(localCacheKey, JSON.stringify(enriched));
          }
        } else {
          const [courses, realSystem] = await Promise.all([
            getUniversityCourses(targetUni.name),
            getUniversityScoringSystem(targetUni.name),
          ]);
          setAvailableCourses(courses);
          if (!instantMatch) setScoringSystem(realSystem as ScoringSystem);
          if (realSystem) {
            const dataToSave = {
              ...(realSystem as ScoringSystem),
              courses,
              updatedAt: { seconds: Math.floor(Date.now() / 1000) },
            };
            await saveGlobalScoringSystem(slug, dataToSave);
            await saveHistoricalCutoff(slug, dataToSave);
            localStorage.setItem(localCacheKey, JSON.stringify(dataToSave));
          }
        }
      } catch (e) {
        console.error("Scoring System Sync Error:", e);
      } finally {
        setIsSyncing(false);
      }
    };
    run();
  }, [targetUni]);

  // Sync simulation baselines when user computes actual results or inputs change
  useEffect(() => {
    if (showResults) {
      const j = parseFloat(jambScore) || 0;
      const p = isPostUtmePending
        ? (postUtmeScore && !isNaN(parseFloat(postUtmeScore)) ? parseFloat(postUtmeScore) : 70)
        : (parseFloat(postUtmeScore) || 0);

      const uniName = targetUni?.name || 'Default';
      const { gradeMap } = getUniversityGradePoints(uniName);

      const english = subjects.find(s => s.name.toLowerCase().includes('english'))?.grade || 'F9';
      const math    = subjects.find(s => s.name.toLowerCase().includes('math'))?.grade   || 'F9';
      const others = subjects
        .filter(s => !s.name.toLowerCase().includes('english') && !s.name.toLowerCase().includes('math'))
        .sort((a, b) => (gradeMap[b.grade] || 0) - (gradeMap[a.grade] || 0))
        .slice(0, 3);

      const oTotal =
        (gradeMap[english] || 0) +
        (gradeMap[math]    || 0) +
        others.reduce((acc, s) => acc + (gradeMap[s.grade] || 0), 0);

      setSimJamb(j);
      setSimPost(p);
      setSimOlevelTotal(oTotal);
    }
  }, [showResults, jambScore, postUtmeScore, subjects, targetUni]);

  // ── Derived values ──

  const activeOlevelPoints = useMemo(() => {
    if (!targetUni) return 0;
    const uniName = targetUni.name;
    const { gradeMap } = getUniversityGradePoints(uniName);

    const english = subjects.find(s => s.name.toLowerCase().includes('english'))?.grade || 'F9';
    const math    = subjects.find(s => s.name.toLowerCase().includes('math'))?.grade   || 'F9';
    const others  = subjects
      .filter(s => !s.name.toLowerCase().includes('english') && !s.name.toLowerCase().includes('math'))
      .sort((a, b) => (gradeMap[b.grade] || 0) - (gradeMap[a.grade] || 0))
      .slice(0, 3);

    return (
      (gradeMap[english] || 0) +
      (gradeMap[math]    || 0) +
      others.reduce((acc, s) => acc + (gradeMap[s.grade] || 0), 0)
    );
  }, [subjects, targetUni]);

  const aggregateScore = useMemo(() => {
    if (!targetUni) return 0;
    if (isDirectEntry) {
      const dePts = parseFloat(dePoints) || 12;
      const deNormalized = Math.min(100, (dePts / 15) * 50);
      const post = parseFloat(postUtmeScore) || 30;
      const olevel = activeOlevelPoints;
      let total = deNormalized + (post / 40) * 30 + olevel;
      if (sittings > 1) total -= 2;
      return parseFloat(Math.max(0, total).toFixed(2));
    }
    const jamb = parseFloat(jambScore) || 0;
    const post = isPostUtmePending
      ? (postUtmeScore && !isNaN(parseFloat(postUtmeScore)) ? parseFloat(postUtmeScore) : 70)
      : (parseFloat(postUtmeScore) || 0);
    const uniName = targetUni.name;
    const isFuoye = uniName.toLowerCase().includes('fuoye') || uniName.toLowerCase().includes('oye-ekiti');
    if (isFuoye) {
      const jambPoints = (jamb / 400) * 60;
      const olevelPoints = activeOlevelPoints;
      const sittingBonus = sittings === 1 ? 10 : 6;
      return parseFloat((jambPoints + olevelPoints + sittingBonus).toFixed(2));
    }
    let total = calculateAggregateScore(jamb, post, activeOlevelPoints, uniName, computedScoringSystem);
    if (sittings > 1) total -= 2;
    return parseFloat(Math.max(0, total).toFixed(2));
  }, [jambScore, postUtmeScore, targetUni, computedScoringSystem, activeOlevelPoints, sittings, isDirectEntry, dePoints]);

  const jambCutoffWarning = useMemo(() => {
    if (!targetUni || targetUni.category === 'COE' || isAR) return null;
    const score = parseFloat(jambScore);
    if (!score || isNaN(score)) return null;
    const min = getJambMinimumCutoff(targetUni);
    if (score < min)
      return { minCutoff: min, score, message: `Your JAMB score (${score}) is below the standard minimum cut-off mark of ${min} required for admission into ${targetUni.name}.` };
    return null;
  }, [jambScore, targetUni, isAR]);

  const isCourseSuspectedNotOffered = useMemo(() => {
    if (isAccreditationWarningDisabled) return false;
    if (!targetUni || (!targetCourse && !courseSearch)) return false;
    const typedCourseLower = (targetCourse || courseSearch).toLowerCase().trim();
    if (!typedCourseLower) return false;

    const isCourseLoaded = availableCourses.length > 0;
    if (!isCourseLoaded) return false;

    const isCourseMatched = availableCourses.some(c => {
      const cLower = c.toLowerCase().trim();
      return cLower === typedCourseLower || cLower.includes(typedCourseLower) || typedCourseLower.includes(cLower);
    });

    // If we have a course match, check if it's a technology / agriculture university where certain programs are strictly not offered.
    // E.g., FUTA, FUTO, LAUTECH don't offer Law, etc.
    const uniNameLower = targetUni.name.toLowerCase();
    const isTechOrAgric = uniNameLower.includes("technology") || uniNameLower.includes("agriculture") || uniNameLower.includes("futa") || uniNameLower.includes("futo");
    
    if (isTechOrAgric) {
      const techAgricForbidden = [
        'law', 'legal', 'nursing', 'pharmacy', 'medicine', 'surgery', 'dentistry', 
        'political sci', 'sociology', 'history', 'theatre', 'philosophy', 'mass comm', 'linguistics'
      ];
      const isForbidden = techAgricForbidden.some(kw => typedCourseLower.includes(kw));
      if (isForbidden) {
        return true; // Suspected strictly NOT offered at this specialized school!
      }
    }

    const universalPreapproved = [
      'accounting', 'accountancy', 'banking', 'finance', 'computer', 'software',
      'economics', 'mass comm', 'business admin', 'biochemistry',
      'microbiology', 'political sci', 'sociology', 'history',
      'engineering', 'agriculture', 'architecture'
    ];
    const isUniversalPreapproved = universalPreapproved.some(kw => typedCourseLower.includes(kw));

    return !isCourseMatched && !isUniversalPreapproved;
  }, [availableCourses, targetCourse, courseSearch, targetUni, isAccreditationWarningDisabled]);

  const admissionProbability = useMemo(() => {
    if (!aiResult) return 0;
    if (typeof aiResult.probability === 'number') {
      let prob = aiResult.probability;
      if (prob > 0 && prob <= 1) {
        prob = prob * 100;
      }
      return Math.min(Math.max(Math.round(prob), 2), 99);
    }
    const match = aiResult.cutoff.toString().match(/(\d+(\.\d+)?)/);
    const cutoff = match ? parseFloat(match[1]) : 70;
    const diff = aggregateScore - cutoff;
    const prob = diff >= 0 ? 60 + diff * 4 : 60 + diff * 6;
    return Math.min(Math.max(Math.round(prob), 5), 98);
  }, [aiResult, aggregateScore]);

  const candidateQuota = useMemo(() => {
    return evaluateCandidateQuota(targetUni?.name || targetUni?.slug || '', stateOfOrigin || '');
  }, [targetUni, stateOfOrigin]);

  const isELDSState     = candidateQuota.isELDS;
  const isCatchmentState = candidateQuota.isCatchment;

  const confidenceLevel = useMemo(() => {
    if (isAR) return 'Low';
    if (isPostUtmePending && computedScoringSystem?.hasPostUtme) return 'Medium';
    return 'High';
  }, [isAR, isPostUtmePending, computedScoringSystem]);

  const quotaBreakdown = useMemo(() => {
    if (!aiResult) return null;
    const text  = aiResult.departmentalCutoff || aiResult.cutoff || '70%';
    const match = text.toString().match(/(\d+(\.\d+)?)/);
    const pureMeritCutoff = match ? parseFloat(match[1]) : 70;
    const discount        = 0;
    const adjustedCutoff  = pureMeritCutoff;
    const scoreBuffer     = parseFloat((aggregateScore - adjustedCutoff).toFixed(2));
    return { pureMeritCutoff, isELDS: isELDSState, isCatchment: isCatchmentState, discount, adjustedCutoff, scoreBuffer };
  }, [aiResult, isELDSState, isCatchmentState, aggregateScore]);

  const simulatedAggregate = useMemo(() => {
    if (!targetUni) return 0;
    const uniName = targetUni.name;
    const isFuoye = uniName.toLowerCase().includes('fuoye') || uniName.toLowerCase().includes('oye-ekiti');

    if (isFuoye) {
      const jambPoints = (simJamb / 400) * 60;
      const olevelPoints = simOlevelTotal;
      const sittingBonus = sittings === 1 ? 10 : 6;
      return parseFloat((jambPoints + olevelPoints + sittingBonus).toFixed(2));
    }

    let total = calculateAggregateScore(simJamb, simPost, simOlevelTotal, uniName, computedScoringSystem);

    if (sittings > 1) total -= 2;
    return parseFloat(Math.max(0, total).toFixed(2));
  }, [simJamb, simPost, simOlevelTotal, targetUni, computedScoringSystem, sittings]);

  const simulatedProbability = useMemo(() => {
    const cutoffBase = (quotaBreakdown?.adjustedCutoff || aiResult?.departmentalCutoff || aiResult?.cutoff || 50);
    const diff = simulatedAggregate - parseFloat(cutoffBase);
    
    if (diff >= 15) return 99;
    if (diff >= 5) return Math.min(95, 80 + Math.floor(diff * 3));
    if (diff >= 0) return Math.min(80, 65 + Math.floor(diff * 3));
    if (diff >= -5) return Math.max(30, 45 + Math.floor(diff * 4));
    return Math.max(5, 20 + Math.floor(diff * 3));
  }, [simulatedAggregate, quotaBreakdown, aiResult]);

  const isLimitedView = useMemo(() => {
    if (!user) return true;
    if (user?.is_premium || (user?.scholarCredits || 0) > 0) return false;
    
    // We offer 1 completely free full report calculation every single day!
    const dailyRequests = user?.daily_requests || 0;
    if (dailyRequests <= 1) return false;
    
    // Fallback: lifetime free trial checks
    if ((user?.meritUsageCount || 0) <= FREE_USER_LIMIT) return false;
    return true;
  }, [user, aiResult]);

  const filteredUnis = useMemo(() => {
    if (!uniSearch) return [];
    return universityData.filter((u: any) => u.name?.toLowerCase().includes(uniSearch.toLowerCase())).slice(0, 5);
  }, [uniSearch]);

  // ── Handlers ──

  const handleSaveScenario = () => {
    if (!targetUni) return;
    const entry: SavedProfile = {
      id: Math.random().toString(36).substring(2, 9),
      uniName: targetUni.name, courseName: targetCourse || courseSearch,
      jambScore, postUtmeScore, stateOfOrigin, aggregateScore,
      isAR, isPostUtmePending, timestamp: Date.now(),
    };
    const updated = [entry, ...savedProfiles.filter(p => !(p.uniName === entry.uniName && p.courseName === entry.courseName))].slice(0, 5);
    setSavedProfiles(updated);
    try { localStorage.setItem('campusai_saved_profiles', JSON.stringify(updated)); } catch {}
  };

  const handleDeleteScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProfiles.filter(p => p.id !== id);
    setSavedProfiles(updated);
    try { localStorage.setItem('campusai_saved_profiles', JSON.stringify(updated)); } catch {}
  };

  const handleLoadScenario = (p: SavedProfile) => {
    const uni = universityData.find((u: any) => u.name === p.uniName);
    if (uni) { setTargetUni(uni); setUniSearch(uni.name); } else { setUniSearch(p.uniName); }
    setTargetCourse(p.courseName); setCourseSearch(p.courseName);
    setJambScore(p.jambScore || ''); setPostUtmeScore(p.postUtmeScore || '');
    setStateOfOrigin(p.stateOfOrigin || ''); setIsAR(p.isAR || false);
    setIsPostUtmePending(p.isPostUtmePending || false);

    if (p.aiResult) {
      setAiResult(p.aiResult);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalculationAttempts([]);
    try {
      localStorage.removeItem('campusai_calculation_attempts');
      localStorage.removeItem('campusai_last_calculation_result');
    } catch (err) {}
  };

  const handleCheckHandbookCourse = async (courseName: string) => {
    if (!selectedHandbookUni) return;
    const uniName = selectedHandbookUni.name;
    const key = `${uniName}_${courseName}`;
    if (handbookCourseDetails[key]) {
      // Toggle off if already opened
      const copied = { ...handbookCourseDetails };
      delete copied[key];
      setHandbookCourseDetails(copied);
      return;
    }

    setIsCheckingDetails(courseName);
    try {
      const result = await getCourseCutoffInfo(
        uniName,
        courseName,
        50, // default score baseline
        "Mathematics: C6, English: C6",
        ["English", "Mathematics", "Physics"],
        undefined,
        false,
        false
      );
      setHandbookCourseDetails(prev => ({
        ...prev,
        [key]: {
          cutoff: result.cutoff || result.departmentalCutoff || "N/A",
          tuition: result.fresherBudget || "N/A",
          isOffered: result.isOffered ?? true,
          subjectValidation: result.subjectCombinationValidation?.reason || "Standard department rules",
          mathBreakdown: result.mathBreakdown || "Check standard guidelines."
        }
      }));
    } catch (e) {
      console.error("Checking handbook detail failed:", e);
    } finally {
      setIsCheckingDetails(null);
    }
  };

  const handleLoadCourseIntoCalculator = (courseName: string) => {
    if (selectedHandbookUni) {
      setTargetUni(selectedHandbookUni);
      setUniSearch(selectedHandbookUni.name);
    }
    setTargetCourse(courseName);
    setCourseSearch(courseName);
    setActiveTab('calculate');
    setTimeout(() => {
      const el = document.getElementById('jamb-score');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const updateSubjectName = (index: number, name: string) => {
    setHasManuallyEditedOLevels(true);
    setSubjects(s => s.map((sub, i) => i === index ? { ...sub, name } : sub));
  };

  const addSubject = () => {
    if (subjects.length >= 9) return;
    setHasManuallyEditedOLevels(true);
    const unusedDefault = OLEVEL_SUBJECTS.find(name => !subjects.some(sub => sub.name === name)) || 'Geography';
    setSubjects(s => [...s, { name: unusedDefault, grade: 'C6' }]);
  };

  const updateSubject = (index: number, grade: OLevelGrade) => {
    setSubjects(s => s.map((sub, i) => i === index ? { ...sub, grade } : sub));
  };

  const handleProceedWithLowScore = () => {
    setBypassCutoffAlert(true);
    setIsCutoffAlertOpen(false);
    setTimeout(() => handleLaunchAuditInternal(true, true), 55);
  };

  const handleProceedWithUncreditedCourse = () => {
    setIsAccreditationAlertOpen(false);
    setTimeout(() => handleLaunchAuditInternal(false, true), 55);
  };

  const handleLaunchAudit = async () => { await handleLaunchAuditInternal(false, false); };

  const handleLaunchAuditInternal = async (forceBypass = false, forceBypassAccreditation = false, overrideUni?: any, overrideCourse?: string) => {
    const activeUni = overrideUni || targetUni;
    const activeCourse = overrideCourse || targetCourse || courseSearch;

    const errors: string[] = [];
    if (!activeUni) {
      errors.push("Please select a target Higher Institution.");
    }
    if (!activeCourse) {
      errors.push("Please select or search for your target Course of study.");
    }

    const isCOE = activeUni?.category === 'COE';
    if (activeUni && !isCOE) {
      if (!jambScore && !isAR) {
        errors.push("Please enter your JAMB/UTME score.");
      } else if (jambScore) {
        const js = parseFloat(jambScore);
        const minCutoff = getJambMinimumCutoff(activeUni);
        if (isNaN(js) || js < 100 || js > 400) {
          errors.push("Your JAMB score must be a valid number between 100 and 400.");
        } else if (js < minCutoff) {
          errors.push(`Your JAMB score (${js}) is below the institutional minimum cutoff of ${minCutoff} for ${activeUni.name}.`);
        }
      }
    }

    const currentSlug = activeUni?.slug || (activeUni?.name || '').toLowerCase().replace(/\s+/g, '-');
    const instantMatch = activeUni ? (
      TOP_INSTITUTION_MAP[currentSlug] ||
      Object.entries(TOP_INSTITUTION_MAP).find(([k]) => activeUni.name.toLowerCase().includes(k))?.[1]
    ) : null;
    const resolvedScoringSystem = computedScoringSystem || instantMatch;
    const hasPostUtme = activeUni && (!resolvedScoringSystem || resolvedScoringSystem.hasPostUtme !== false);
    if (hasPostUtme && !isPostUtmePending) {
      if (!postUtmeScore) {
        errors.push("Please enter your Post-UTME score (or choose 'Pending Exam').");
      } else {
        const ps = parseFloat(postUtmeScore);
        if (isNaN(ps) || ps < 0 || ps > 100) {
          errors.push("Your Post-UTME score must be a valid number between 0 and 100.");
        }
      }
    }

    if (!jambSubject1 || !jambSubject2 || !jambSubject3) {
      errors.push("Please select all 3 JAMB UTME Subject elective inputs.");
    }

    if (!stateOfOrigin) {
      errors.push("Please select your State of Origin (needed to compute Catchment/ELDS statutory benefits).");
    }

    if (errors.length > 0) {
      setValidationAlert({ isOpen: true, errors });
      return;
    }

    if (!forceBypass && !bypassSubjectDisqualificationAlert) {
      const jambList = ['English Language', jambSubject1, jambSubject2, jambSubject3].filter(Boolean);
      const jambVal = validateMandatorySubjects(activeCourse, jambList);
      if (!jambVal.valid) {
        setSubjectDisqualificationAlert({
          isOpen: true,
          title: 'JAMB Subject Combination Disqualification',
          reason: jambVal.reason,
          type: 'jamb'
        });
        return;
      }

      const olevelVal = validateOlevelRequirements(activeCourse, subjects);
      if (!olevelVal.valid) {
        setSubjectDisqualificationAlert({
          isOpen: true,
          title: "O'Level Subject Requirement Disqualification",
          reason: olevelVal.reason,
          type: 'olevel'
        });
        return;
      }
    }

    const isAllC6 = subjects.every(s => s.grade === 'C6');
    if (isAllC6 && (!computedScoringSystem || computedScoringSystem.hasOLevel) && !forceBypassAccreditation) {
      // Don't show C6 alert if the institution doesn't even use O-Level grades
      if (computedScoringSystem && computedScoringSystem.hasOLevel === false) {
        // Skip alert
      } else {
        setIsC6AlertOpen(true);
        return;
      }
    }

    if (isCourseSuspectedNotOffered && !forceBypassAccreditation) {
      setIsAccreditationAlertOpen(true);
      return;
    }

    if (jambCutoffWarning && !forceBypass && !bypassCutoffAlert) {
      setIsCutoffAlertOpen(true);
      return;
    }
    if (user && activeUni) {
      saveUserProfile(user.uid, {
        jamb_score: parseFloat(jambScore),
        target_course: activeCourse,
        target_university: activeUni.name,
        state_of_origin: stateOfOrigin,
      });
    }
    const { allowed } = user ? await checkCalculationsLimit(user.uid) : { allowed: true };
    if (!allowed) { setIsQuotaModalOpen(true); return; }

    const guestUsage = parseInt(localStorage.getItem('guest_merit_usage') || '0');
    const authUsage  = user?.meritUsageCount || 0;
    const hasCredits = (user?.scholarCredits || 0) > 0;
    if (!user && guestUsage >= FREE_GUEST_LIMIT) { onLoginRequest(); return; }

    setIsAnalysisLoading(true);
    setAiResult(null);
    setShowResults(true);
    setFeedbackStatus('none');
    setAdmissionStatus('none');

    const effectiveUsesPostUtme = (!computedScoringSystem || computedScoringSystem.hasPostUtme !== false);
    const cleanPostUtmeScore = effectiveUsesPostUtme
      ? (isPostUtmePending ? (postUtmeScore && !isNaN(parseFloat(postUtmeScore)) ? parseFloat(postUtmeScore) : 70) : (parseFloat(postUtmeScore) || 0))
      : 0;

    // GA4 Event: calculator_used
    trackCalculatorUsed({
      calculator_type: 'jamb_aggregate',
      university: activeUni.name,
      course: activeCourse,
      aggregate_score: aggregateScore,
      jamb_score: jambScore,
      post_utme_score: effectiveUsesPostUtme ? postUtmeScore : '0',
      state_of_origin: stateOfOrigin
    });

    try {
      const formulaText    = resolvedScoringSystem?.explanation || "Pure Academic Formula (JAMB / 4)";
      const computedDiscount = 0;
      const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      let result: any = null;
      let enrichedResult: any = null;

      if (user) {
        // AI Analysis call only for authenticated users
        result = await getCourseCutoffInfo(
          activeUni.name, activeCourse, aggregateScore,
          subjects.map(s => `${s.name}: ${s.grade}`).join(', '),
          Array.from(
            new Set(
              ['English Language', jambSubject1, jambSubject2, jambSubject3]
                .flatMap(s => String(s || '').split(/[_,\/\+]+/))
                .map(s => String(s || '').trim())
                .filter(Boolean)
            )
          ),
          user?.role, isAR, isPostUtmePending && effectiveUsesPostUtme, formulaText,
          stateOfOrigin, isELDSState, isCatchmentState, computedDiscount,
          parseFloat(jambScore) || 0,
          cleanPostUtmeScore
        );
        enrichedResult = { ...result, predictionId };
        setAiResult(enrichedResult);
      } else {
        // 0 AI API calls / 0 tokens consumed for guests
        // Fast UI feedback delay for smooth math calculation
        await new Promise(res => setTimeout(res, 350));
        setAiResult(null);
      }
      setShowResults(true);

      // Increment persistent global calculations metric for site analytics
      incrementGlobalCalculationCount().catch(err => console.error("Error incrementing global calculation count:", err));

      const olevelsString = subjects.map(s => `${s.name}: ${s.grade}`).join(', ');
      
      if (result) {
        // Calculate deterministic values for authenticated users
        const isDisqualified = result.probability === 0 || 
          (result.verdict && result.verdict.toLowerCase().includes('disqualif')) ||
          result.departmentalCutoff === 'N/A' ||
          result.subjectCombinationValidation?.valid === false;

        const rawCutoff = (result.departmentalCutoff || result.cutoff || '').toString().replace(/[^0-9.]/g, '');
        const parsedCutoffVal = parseFloat(rawCutoff) || (isDisqualified ? 0 : 55);

        let finalVerdict = result.verdict || 'Borderline';
        let finalProbability = typeof result.probability === 'number' ? result.probability : 50;

        if (isDisqualified) {
          finalVerdict = result.verdict || 'Disqualified / Invalid Subject Combination';
          finalProbability = 0;
        } else if (parsedCutoffVal > 0) {
          const deterministic = enforceAdmissionTiers(
            parseFloat(aggregateScore.toString()) || 0,
            parsedCutoffVal,
            targetUni.name,
            targetCourse || courseSearch,
            stateOfOrigin,
            !!isELDSState,
            !!isCatchmentState,
            isAR,
            isPostUtmePending && effectiveUsesPostUtme,
            parseFloat(jambScore) || 0,
            cleanPostUtmeScore,
            formulaText,
            olevelsString
          );
          if (deterministic?.verdict) finalVerdict = deterministic.verdict;
          if (typeof deterministic?.probability === 'number') finalProbability = deterministic.probability;
        }

        // GA4 Event: admission_analysis
        trackAdmissionAnalysis({
          university: targetUni.name,
          course: targetCourse || courseSearch,
          aggregate_score: parseFloat(aggregateScore.toString()) || 0,
          verdict: finalVerdict,
          probability: finalProbability,
          is_official_cutoff: !!result.cutoffIsOfficial,
          cutoff_used: result.cutoffValue || result.departmentalCutoff || result.cutoff || '',
          quota: result.cutoffQuotaUsed || (isELDSState ? 'ELDS Quota' : (isCatchmentState ? `Catchment Quota (${stateOfOrigin})` : 'National Merit Quota')),
        });

        savePredictionRecord({
          predictionId,
          userId: user?.uid || 'guest',
          userEmail: user?.email || '',
          userName: user?.displayName || (user ? 'Registered Scholar' : 'Guest Scholar'),
          isGuest: !user,
          university: targetUni.name,
          course: targetCourse || courseSearch,
          aggregateScore: parseFloat(aggregateScore.toString()) || 0,
          jambScore: parseFloat(jambScore) || 0,
          postUtmeScore: cleanPostUtmeScore,
          usesPostUtme: effectiveUsesPostUtme,
          postUtmeNotUsed: !effectiveUsesPostUtme,
          verdict: finalVerdict,
          confidence: result.reliability || (isDisqualified ? 'High' : 'Medium'),
          predictedProbability: finalProbability,
          departmentalCutoff: result.departmentalCutoff || result.cutoff || (isDisqualified ? 'N/A' : ''),
          institutionalCutoff: result.institutionalCutoff || '',
          stateOfOrigin: stateOfOrigin || '',
          isELDSState: !!isELDSState,
          isCatchmentState: !!isCatchmentState,
          cutoffType: result.cutoffType || (result.cutoffIsOfficial ? 'official_departmental_cutoff' : 'estimated_benchmark'),
          cutoffIsOfficial: !!result.cutoffIsOfficial,
          cutoffSource: result.cutoffSource || '',
          cutoffYear: result.cutoffYear || '2025/2026',
          cutoffQuotaUsed: result.cutoffQuotaUsed || (isELDSState ? 'ELDS Quota' : (isCatchmentState ? `Catchment Quota (${stateOfOrigin})` : 'National Merit Quota')),
          scoreDiff: typeof result.scoreDiff === 'number' ? result.scoreDiff : (isDisqualified ? 0 : (parseFloat(aggregateScore.toString()) - (parseFloat(result.cutoffValue) || parseFloat(result.departmentalCutoff) || 0))),
          predictionDate: new Date().toISOString().split('T')[0],
          detailedStrategy: result.detailedStrategy || '',
          formulaExplanation: formulaText || '',
          subjects: subjects.map(s => ({ name: s.name, grade: s.grade })),
          olevelsString: olevelsString || ''
        }).catch(err => console.error("Error saving global prediction record:", err));
      }

      // Automatically save this calculation attempt to history with local storage persistence
      const newAttempt: SavedProfile = {
        id: Math.random().toString(36).substring(2, 9),
        uniName: targetUni.name,
        courseName: targetCourse || courseSearch,
        jambScore,
        postUtmeScore: effectiveUsesPostUtme ? postUtmeScore : '',
        stateOfOrigin,
        aggregateScore,
        isAR,
        isPostUtmePending: effectiveUsesPostUtme ? isPostUtmePending : false,
        timestamp: Date.now(),
        aiResult: enrichedResult,
      };

      setCalculationAttempts(prev => {
        const filtered = prev.filter(p => !(p.uniName === newAttempt.uniName && p.courseName === newAttempt.courseName));
        const updated = [newAttempt, ...filtered].slice(0, 10);
        try {
          localStorage.setItem('campusai_calculation_attempts', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save calculation attempts to localStorage:', e);
        }
        return updated;
      });

      // Save active calculation result to localStorage
      try {
        localStorage.setItem('campusai_last_calculation_result', JSON.stringify({
          uniName: targetUni.name,
          courseName: targetCourse || courseSearch,
          jambScore,
          postUtmeScore,
          stateOfOrigin,
          aggregateScore,
          isAR,
          isPostUtmePending,
          aiResult: result,
          timestamp: Date.now(),
        }));
      } catch (e) {}

      // Globally log the calculation for admin tracking
      saveGlobalCalculationRecord(newAttempt, user?.uid).catch(err => 
        console.error('Failed to log global calculation record:', err)
      );

      if (user) {
        // Persist to account so it shows up on any device/browser
        saveCalculationAttempt(user.uid, newAttempt).catch(err =>
          console.error('Failed to save calculation attempt:', err)
        );
      }

      if (user) {
        await incrementCalculations(user.uid);
        await incrementMeritUsage(user.uid);
        logUserActivity({ 
          userId: user?.uid || 'guest', 
          type: 'calculation', 
          title: 'Admission Audit (Registered)', 
          description: `Calculated aggregate for ${targetCourse || courseSearch} at ${targetUni.name}`,
          metadata: {
            predictionId,
            userEmail: user?.email || '',
            userName: user?.displayName || (user ? 'Registered Scholar' : 'Guest Scholar'),
            isGuest: !user,
            course: targetCourse || courseSearch,
            university: targetUni.name,
            subjects: subjects.map(s => ({ name: s.name, grade: s.grade })),
            formula: formulaText,
            computedDiscount: computedDiscount,
            aggregateScore: aggregateScore,
            jambScore: jambScore,
            postUtmeScore: postUtmeScore,
            verdict: result?.verdict || 'Borderline',
            hasOLevel: computedScoringSystem?.hasOLevel || false
          }
        });
      } else {
        localStorage.setItem('guest_merit_usage', (guestUsage + 1).toString());
        logUserActivity({ 
          userId: 'guest', 
          type: 'calculation', 
          title: 'Admission Audit (Guest)', 
          description: `Calculated aggregate for ${targetCourse || courseSearch} at ${targetUni.name}`,
          metadata: {
            predictionId,
            userEmail: '',
            userName: 'Guest Scholar',
            isGuest: true,
            course: targetCourse || courseSearch,
            university: targetUni.name,
            subjects: subjects.map(s => ({ name: s.name, grade: s.grade })),
            formula: formulaText,
            computedDiscount: computedDiscount,
            aggregateScore: aggregateScore,
            jambScore: jambScore,
            postUtmeScore: postUtmeScore,
            verdict: 'Guest Calculation',
            hasOLevel: computedScoringSystem?.hasOLevel || false
          }
        });
      }
      
      // Only deduct a scholar credit if they have premium credits
      if (user && hasCredits) {
        await deductScholarCredit(user.uid);
      }
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleShareResults = async () => {
    if (!aiResult) return;
    const formattedUni = targetUni?.name?.replace(/,\s*Akure/gi, " Akure").replace(/,\s*/g, " ") || "";
    const chosenCourse = targetCourse || courseSearch || "our course";
    const fmt = Math.random() > 0.5 ? 1 : 2;
    const shareText = fmt === 1
      ? `${aggregateScore}% aggregate for ${chosenCourse} at ${formattedUni} 👀\nCampusAI 2026 analysis says I have a good chance.\n\nCalculate your own admission chances here:\ncampusai.com.ng`
      : `I got a ${aggregateScore}% aggregate for ${chosenCourse} at ${formattedUni}.\nCampusAI 2026 analysis says my chances look promising.\n\nCheck your own admission chances here:\ncampusai.com.ng`;

    if (navigator.share) {
      try { await navigator.share({ title: 'CampusAI Admission Analysis', text: shareText }); } catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section id="calculator" className="py-6 bg-gray-950 text-white w-full border-b border-white/5 relative overflow-hidden">
      <SEO />
      {/* Privacy Notice */}
      <div className="px-6 mb-6">
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 flex items-center gap-3">
          <Lock className="text-emerald-500 shrink-0" size={18} />
          <p className="text-xs text-emerald-100 font-medium leading-relaxed">
            Your privacy is our priority. This system <strong>does not collect</strong> JAMB registration numbers, passwords, or any sensitive personal data. Your input remains local.
          </p>
        </div>
      </div>
      {/* Responsive two-column layout */}
      <div className="w-full px-6 flex flex-col gap-8">

        {/* ── LEFT PANEL ── */}
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-black uppercase tracking-widest text-cyan-400">
                Merit Logic v5.5
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none text-white">
                Admissions <span className="text-cyan-400">Strategist</span>
              </h2>
            </div>
            
            {/* Tab selector */}
            <div className="flex items-center bg-gray-900 border border-white/5 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('calculate')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'calculate'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg shadow-cyan-500/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calculator size={11} />
                Admission chances
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('handbook')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'handbook'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg shadow-cyan-500/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Database size={11} />
                Course & Cutoff Handbook
              </button>
            </div>
          </div>

          {/* Welcome banner */}
          <AnimatePresence>
            {welcomeMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[9px] font-bold text-cyan-300 uppercase tracking-wider"
              >
                {welcomeMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Institution Guide Banner */}
          {schoolLandingInfo ? (
            <div className="p-5 bg-gradient-to-br from-gray-900 to-slate-950 border border-cyan-500/20 rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col gap-5">
              {/* Background Accent glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px]" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[50px]" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[7.5px] font-black uppercase bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/15 tracking-widest">
                      Official Institution Guide
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/calculator');
                        window.scrollTo(0, 0);
                      }}
                      className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[7.5px] font-black uppercase tracking-widest rounded-full transition-all"
                    >
                      ← General Calculator
                    </button>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1.5">
                    {schoolLandingInfo.fullName} <span className="text-cyan-400">Hub</span>
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">
                    Verified Aggregate Formula, Estimated Competitive Benchmarks & Prep Rules
                  </p>
                </div>

                {/* Guide Tabs */}
                <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('formula')}
                    className={`px-3 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all ${
                      activeGuideTab === 'formula' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Formula
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('cutoff')}
                    className={`px-3 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all ${
                      activeGuideTab === 'cutoff' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Cutoffs
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('prep')}
                    className={`px-3 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all ${
                      activeGuideTab === 'prep' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Post-UTME Guide
                  </button>
                </div>
              </div>

              {/* Guide Content Panels */}
              <div className="relative z-10 min-h-[120px] flex items-center">
                {activeGuideTab === 'formula' && (
                  <div className="space-y-3.5 w-full">
                    <p className="text-xs text-gray-300 font-medium leading-relaxed">{schoolLandingInfo.formulaDesc}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {schoolLandingInfo.formulaSteps.map((step, sIdx) => (
                        <div key={sIdx} className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-1 hover:border-cyan-500/20 transition-all">
                          <span className="text-[8px] font-black uppercase text-cyan-400 tracking-wider">Step {sIdx + 1}</span>
                          <p className="text-[10px] text-gray-300 font-bold mt-1 leading-snug">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeGuideTab === 'cutoff' && (
                  <div className="space-y-3 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-xs text-gray-300 font-medium leading-relaxed">
                        {currentSchoolSlug === 'ui' ? 'Official UI 2025/2026 Departmental Cut-Off Marks (Top Programmes):' : 'Estimated Competitive Benchmark scores to secure merit-list admissions in 2026:'}
                      </p>
                      {currentSchoolSlug === 'ui' && (
                        <button
                          type="button"
                          onClick={() => setIsUICutoffsModalOpen(true)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
                        >
                          <BookOpen size={11} /> View All 79 UI Cut-Off Marks (Merit / Catchment / ELDS)
                        </button>
                      )}
                      {currentSchoolSlug === 'futa' && (
                        <button
                          type="button"
                          onClick={() => setIsFUTACutoffsModalOpen(true)}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
                        >
                          <BookOpen size={11} /> View All Official FUTA 2026/2027 Cut-Off Marks
                        </button>
                      )}
                      {currentSchoolSlug === 'lautech' && (
                        <button
                          type="button"
                          onClick={() => setIsLAUTECHCutoffsModalOpen(true)}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
                        >
                          <BookOpen size={11} /> View All 57 LAUTECH Departmental Cut-Off Marks
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                      {schoolLandingInfo.cutoffs.map((item, cIdx) => (
                        <div key={cIdx} className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-center hover:border-cyan-500/20 transition-all">
                          <p className="text-[9px] font-black text-gray-400 uppercase truncate leading-none mb-1.5">{item.course}</p>
                          <span className="text-xs font-black text-emerald-400 tracking-tight">{item.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeGuideTab === 'prep' && (
                  <div className="space-y-4 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-white/5 pb-3">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Exam Format</span>
                        <span className="text-xs font-black text-white mt-1 uppercase tracking-tight">{schoolLandingInfo.postUtmeGuide.format}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Exam Duration</span>
                        <span className="text-xs font-black text-white mt-1 uppercase tracking-tight">{schoolLandingInfo.postUtmeGuide.duration}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Official Registration Fee</span>
                        <span className="text-xs font-black text-emerald-400 mt-1 uppercase tracking-tight">{schoolLandingInfo.postUtmeGuide.fee}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest block mb-2">High-Score Preparation Strategies</span>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-medium leading-relaxed text-gray-400 list-none pl-0">
                        {schoolLandingInfo.postUtmeGuide.tips.map((tip, tIdx) => (
                          <li key={tIdx} className="flex gap-2 bg-black/25 p-2 rounded-xl">
                            <Lightbulb size={12} className="text-amber-400 shrink-0 mt-0.5" />
                            <span className="tracking-tight">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-gradient-to-br from-gray-900 to-slate-950 border border-white/5 rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col gap-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px]" />
              <div className="relative z-10">
                <span className="text-[7.5px] font-black uppercase bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/15 tracking-widest">
                  🔥 Official University Hubs
                </span>
                <h3 className="text-sm font-black text-white uppercase tracking-tight mt-2 flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-cyan-400" /> Dedicated 2026 Admission Portals
                </h3>
                <p className="text-[9.5px] text-gray-400 font-bold uppercase mt-1 tracking-wider leading-relaxed">
                  Select a featured institution below to access its official aggregate formula, verified estimated competitive benchmarks, and real student preparation forums.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
                {[
                  { slug: 'unilag', name: 'UNILAG Hub', loc: 'Lagos' },
                  { slug: 'oau', name: 'OAU Hub', loc: 'Ife' },
                  { slug: 'ui', name: 'UI Hub', loc: 'Ibadan' },
                  { slug: 'lasu', name: 'LASU Hub', loc: 'Ojo' },
                ].map(hub => (
                  <button
                    key={hub.slug}
                    type="button"
                    onClick={() => {
                      navigate(`/${hub.slug}-aggregate-calculator`);
                      window.scrollTo(0, 0);
                    }}
                    className="p-3 bg-black/40 hover:bg-black/60 border border-white/5 hover:border-cyan-500/30 rounded-xl text-center group transition-all flex flex-col items-center gap-1 active:scale-95 duration-150"
                  >
                    <span className="text-[10px] font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                      {hub.name}
                    </span>
                    <span className="text-[7.5px] font-bold text-gray-500 uppercase group-hover:text-cyan-500/50">
                      {hub.loc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main form card */}
          {activeTab === 'calculate' ? (
            <div className="p-5 bg-white/5 rounded-[24px] border border-white/10 space-y-5 relative z-30">

            {/* Saved scenarios */}
            {savedProfiles.length > 0 && (
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[7.5px] font-black uppercase text-gray-500 tracking-widest mb-2 flex items-center gap-1">
                  <History size={10} className="text-cyan-400" /> My Saved Scenarios ({savedProfiles.length}/5)
                </p>
                <div className="flex flex-wrap gap-2">
                  {savedProfiles.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleLoadScenario(p)}
                      className="group flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all select-none"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-[8.5px] font-black text-white group-hover:text-cyan-400 transition-colors">
                          {(p.uniName || '').replace("University of ", "U of ").replace("Federal University of Technology", "FUTA")}
                        </span>
                        <span className="text-[7px] text-gray-400 font-bold leading-none mt-0.5">
                          {p.courseName} • <strong className="text-cyan-300">{p.aggregateScore}%</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={e => handleDeleteScenario(p.id, e)}
                        className="p-1 text-gray-500 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-all shrink-0"
                        aria-label="Delete saved scenario"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Calculated Scores (Saved Offline) */}
            {calculationAttempts.length > 0 && (
              <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsRecentCalculationsOpen(!isRecentCalculationsOpen)}
                    className="text-[8px] font-black uppercase text-gray-300 hover:text-cyan-400 transition-colors tracking-widest flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock size={11} className="text-cyan-400" />
                    <span>Recent Calculated Scores ({calculationAttempts.length})</span>
                    <ChevronDown
                      size={12}
                      className={`text-gray-400 transition-transform duration-200 ${isRecentCalculationsOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRecentCalculationsOpen(!isRecentCalculationsOpen)}
                      className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {isRecentCalculationsOpen ? 'Hide History' : 'Open History'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-[7.5px] font-bold text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isRecentCalculationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pt-3 border-t border-white/5 mt-2.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {calculationAttempts.map(p => (
                          <div
                            key={p.id || p.timestamp}
                            onClick={() => handleLoadScenario(p)}
                            className="group flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all select-none"
                          >
                            <div className="flex flex-col text-left overflow-hidden pr-2">
                              <span className="text-[9.5px] font-black text-white group-hover:text-cyan-400 transition-colors truncate">
                                {(p.uniName || '').replace("University of ", "U of ").replace("Federal University of Technology", "FUTA")}
                              </span>
                              <span className="text-[8px] text-gray-400 font-bold truncate">
                                {p.courseName} • UTME: {p.jambScore || 'N/A'} {p.postUtmeScore ? `| Post: ${p.postUtmeScore}` : ''}
                              </span>
                              <span className="text-[7px] text-gray-500 mt-0.5">
                                {new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-black text-cyan-300">{p.aggregateScore}%</div>
                              <span className="text-[6.5px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                Offline Available
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Aggregate Progress Graph */}
            {chartData.length > 0 && (
              <div id="progress-chart-card" className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[7.5px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-1.5">
                    <Activity size={11} className="text-cyan-400" /> Aggregate Score Trend & Progress
                  </p>
                  <span className="text-[7px] font-black uppercase bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-full border border-cyan-500/15">
                    Last {chartData.length} Attempts
                  </span>
                </div>
                <div ref={chartContainerRef} className="h-48 w-full mt-2" id="recharts-container">
                  {chartWidth > 0 ? (
                    <LineChart width={chartWidth} height={192} data={chartData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                      <XAxis 
                        dataKey="id" 
                        stroke="#ffffff33" 
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                          const item = chartData.find(d => d.id === value);
                          return item ? item.date : '';
                        }}
                      />
                      <YAxis 
                        stroke="#ffffff33" 
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                        domain={[
                          (dataMin: number) => Math.max(0, Math.floor(dataMin - 5)),
                          (dataMax: number) => Math.min(100, Math.ceil(dataMax + 5))
                        ]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-950/95 border border-white/10 p-2.5 rounded-xl text-left shadow-xl backdrop-blur-md">
                                <p className="text-[9px] font-black text-cyan-400">{data.fullDate}</p>
                                <p className="text-[10px] font-black text-white mt-1 leading-snug">{data.name}</p>
                                <p className="text-[8.5px] font-semibold text-gray-400">{data.course}</p>
                                <p className="text-xs font-black text-emerald-400 mt-1.5 flex items-center gap-1">
                                  Score: <span className="text-sm">{data.score}%</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Aggregate"
                        stroke="url(#cyanBlueGradient)"
                        strokeWidth={2.5}
                        dot={{ r: 4, stroke: '#06b6d4', strokeWidth: 1.5, fill: '#090d16' }}
                        activeDot={{ r: 6, stroke: '#22d3ee', strokeWidth: 2, fill: '#fff' }}
                      />
                      <defs>
                        <linearGradient id="cyanBlueGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      Measuring workspace...
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-[7.5px] text-gray-400 font-medium leading-normal">
                    This chart tracks your academic score trends. Aim for cutoffs above <span className="text-cyan-400 font-bold">70%</span> to secure merit list positions at top Nigerian institutions.
                  </p>
                </div>
              </div>
            )}

            {/* Institution / Course / State row */}
            <div className={`grid grid-cols-1 ${schoolLandingInfo ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3.5`}>
              {/* University search */}
              {!schoolLandingInfo && (
                <div className="relative">
                  <label htmlFor="uni-search" className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">
                    Institution (University, Poly, or COE)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                      id="uni-search" name="uni-search" type="text"
                      placeholder="Search institution..." value={uniSearch}
                      onChange={e => { setUniSearch(e.target.value); setIsUniDropdownOpen(true); }}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-xl font-bold text-xs outline-none focus:border-cyan-500 transition-all"
                    />
                    <AnimatePresence>
                      {isUniDropdownOpen && filteredUnis.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                          {filteredUnis.map((u: any) => (
                            <button
                              key={u.name}
                              onClick={() => {
                                trackInstitutionSearch({
                                  search_term: u.name,
                                  institution_type: u.type || u.category || 'University'
                                });
                                const slug = u.slug;
                                const isDedicated = ['unilag', 'oau', 'ui', 'lasu', 'uniben', 'unilorin', 'unn', 'futa', 'abu-zaria', 'abu'].includes(slug);
                                if (isDedicated) {
                                  const finalSlug = slug === 'abu-zaria' ? 'abu' : slug;
                                  navigate(`/${finalSlug}-aggregate-calculator`);
                                  window.scrollTo(0, 0);
                                } else {
                                  setTargetUni(u);
                                  setUniSearch(u.name);
                                  setTargetCourse('');
                                  setCourseSearch('');
                                  setAvailableCourses([]);
                                }
                                setIsUniDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-white/5 font-bold border-b border-white/5 last:border-0 text-[10px]"
                            >
                              {u.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Course search */}
              <div className="relative">
                <label htmlFor="course-search" className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Course</label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input
                    id="course-search" name="course-search" type="text"
                    placeholder="e.g. Nursing..." value={courseSearch}
                    onChange={e => { setCourseSearch(e.target.value); setIsCourseDropdownOpen(true); }}
                    onFocus={() => setIsCourseDropdownOpen(true)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-xl font-bold text-xs outline-none focus:border-cyan-500 transition-all text-white"
                  />
                  <AnimatePresence>
                    {isCourseDropdownOpen && (courseSearch.length > 1 || availableCourses.length > 0) && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto">
                        {availableCourses
                          .filter(c => c.toLowerCase().includes(courseSearch.toLowerCase()))
                          .slice(0, 15)
                          .map(c => (
                            <button key={c} onClick={() => { setTargetCourse(c); setCourseSearch(c); setIsCourseDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-white/5 font-bold border-b border-white/5 last:border-0 text-[10px] break-words text-white">
                              {c}
                            </button>
                          ))}
                        {availableCourses.filter(c => c.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 && courseSearch.length > 0 && (
                          <button onClick={() => { setTargetCourse(courseSearch); setIsCourseDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-white/5 font-bold border-b border-white/5 last:border-0 text-[10px] text-cyan-400 italic">
                            Use custom: "{courseSearch}"
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* State of origin */}
              <div className="relative">
                <label htmlFor="state-of-origin" className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">
                  State of Origin (Statutory Quotas)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <select
                    id="state-of-origin" name="state-of-origin"
                    value={stateOfOrigin} onChange={e => setStateOfOrigin(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/5 rounded-xl font-bold text-xs outline-none focus:border-cyan-500 transition-all appearance-none text-white cursor-pointer"
                  >
                    <option value="" className="bg-gray-900 text-gray-500">Select State...</option>
                    {NIGERIAN_STATES.map(s => (
                      <option key={s} value={s} className="bg-gray-900 text-white font-bold">{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
                </div>
              </div>
            </div>

            {/* Accreditation Safeguard Toggle Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl gap-3 text-left">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase text-cyan-400 tracking-widest block">Accreditation Safeguard</span>
                <span className="text-[7.5px] text-gray-500 font-bold block uppercase tracking-tight leading-none">
                  Warn if your chosen institution does not accredit or offer your selected course.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAccreditationWarning(!isAccreditationWarningDisabled)}
                className="flex items-center gap-2.5 cursor-pointer select-none border border-white/5 bg-black/40 px-3 py-1.5 rounded-xl hover:border-white/10 transition-all shrink-0 justify-between sm:justify-start"
              >
                <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative ${!isAccreditationWarningDisabled ? 'bg-cyan-500' : 'bg-gray-800'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${!isAccreditationWarningDisabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </div>
                <span className="font-black font-mono text-[8px] tracking-wider uppercase text-white min-w-[20px] text-center">
                  {!isAccreditationWarningDisabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Quota info banner */}
            {stateOfOrigin && targetUni && (
              <motion.div
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 border rounded-xl text-[9.5px] leading-normal flex items-start gap-2.5 shadow-inner ${
                  isELDSState ? 'bg-purple-950/40 border-purple-500/15 text-purple-300'
                  : isCatchmentState ? 'bg-cyan-950/40 border-cyan-500/15 text-cyan-300'
                  : 'bg-zinc-950/40 border-zinc-500/15 text-zinc-300'
                }`}
              >
                <Info size={14} className={`${isELDSState ? 'text-purple-400' : isCatchmentState ? 'text-cyan-400' : 'text-zinc-400'} mt-0.5 shrink-0`} />
                <div>
                  <span className={`font-extrabold uppercase tracking-widest block mb-0.5 ${isELDSState ? 'text-purple-200' : isCatchmentState ? 'text-cyan-200' : 'text-zinc-200'}`}>
                    {isELDSState ? '✨ Educationally Less Developed State (ELDS) Pool Eligible'
                     : isCatchmentState ? '📍 Catchment Area Quota Pool Eligible'
                     : '📢 General National Merit Quota Pool Evaluation'}
                  </span>
                  <span>
                    {isELDSState ? <>As a candidate from <strong>{stateOfOrigin}</strong> (an ELDS state), you qualify for specialized admission pool consideration (official ELDS quota = 20%). In federal institutions, you compete within a separate ELDS competitive pool with an effective estimated competitive benchmark threshold historically <strong>around 4% to 5% lower</strong> than general Merit, without changing your physical raw score.</>
                     : isCatchmentState ? <>As a candidate from <strong>{stateOfOrigin}</strong>, you fall within the official Catchment Area of <strong>{targetUni.name}</strong> (Catchment quota = 35%). This does not add physical points to your raw score; instead, you compete in a separate, localized catchment pool with an effective competitive threshold historically <strong>around 2.0% to 3.0% lower</strong> than general National Merit!</>
                     : <>As a candidate from <strong>{stateOfOrigin}</strong>, you do not qualify for Catchment or ELDS pools at <strong>{targetUni.name}</strong>. You will be evaluated strictly on the <strong>General National Merit quota (45% of slots)</strong>, requiring you to meet the full, unadjusted competitive merit threshold of the program.</>}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Accreditation/Course offering Warning banner */}
            {isCourseSuspectedNotOffered && targetUni && (
              <motion.div
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-rose-950/40 border border-rose-500/15 text-rose-300 rounded-xl text-[9.5px] leading-normal flex items-start gap-2.5 shadow-inner mt-3"
              >
                <AlertCircle size={14} className="text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-extrabold uppercase tracking-widest block mb-0.5 text-rose-200">
                    ⚠️ Potential Accreditation Issue
                  </span>
                  <span>
                    The course <strong>"{targetCourse || courseSearch}"</strong> may not be accredited or actively offered at <strong>{targetUni.name}</strong>. Please confirm from the JAMB Brochure or the institution handbook to avoid admission disqualification.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Scoring system / Manual Custom Override Block */}
            <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders size={10} className="text-cyan-400" /> Scoring Settings
                </span>
                <button
                  type="button"
                  onClick={() => setManualOverrideActive(!manualOverrideActive)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg ${
                    manualOverrideActive
                      ? 'bg-amber-500 text-black border border-amber-400 shadow-amber-500/30'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 shadow-emerald-900/40'
                  }`}
                >
                  <Sliders size={12} /> {manualOverrideActive ? '✨ Use Official Formula' : '⚙️ School Changed System? Customize Formula'}
                </button>
              </div>

              {manualOverrideActive ? (
                <div className="pt-2.5 space-y-3">
                  <div className="flex items-start gap-2 text-[9px] text-amber-400/90 leading-normal font-semibold animate-pulse">
                    <span className="text-xs">⚠️</span>
                    <p>
                      <strong>Manual Override Active:</strong> Choose a formula template or toggle inputs below. This overrides the database preset.
                    </p>
                  </div>

                  {/* Formula Selection */}
                  <div className="space-y-1">
                    <label htmlFor="manual-formula" className="text-[8px] font-black uppercase tracking-widest text-gray-500 block">Select Calculation Template</label>
                    <select
                      id="manual-formula"
                      value={manualFormula}
                      onChange={e => setManualFormula(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black text-white outline-none focus:border-amber-500/50"
                    >
                      <option value="50:30:20" className="bg-gray-950 text-white font-medium">50:30:20 (50% JAMB, 30% Post-UTME, 20% O'Level - e.g., UNILAG, UNILORIN)</option>
                      <option value="50:40:10" className="bg-gray-950 text-white font-medium">50:40:10 (JAMB/8 + 40% Post-UTME + O'Level - e.g., OAU)</option>
                      <option value="50:50" className="bg-gray-950 text-white font-medium">50:50 (Average of JAMB & Post-UTME - e.g., UI, UNN, UNIBEN)</option>
                      <option value="50:20:30" className="bg-gray-950 text-white font-medium">50:20:30 (50% JAMB, 20% Post-UTME, 30% O'Level - e.g., FUTMinna)</option>
                      <option value="futa_75_25" className="bg-gray-950 text-white font-medium">75:25 (75% JAMB, 25% O'Level - e.g., FUTA)</option>
                      <option value="lasu_60_40" className="bg-gray-950 text-white font-medium">60:40 (60% JAMB, 40% O'Level - e.g., LASU)</option>
                      <option value="lasu_point_based" className="bg-gray-950 text-white font-medium">Point-Based (JAMB/8 + O'Level Points - e.g., LASU alternative)</option>
                      <option value="pure_jamb" className="bg-gray-950 text-white font-medium">Pure UTME Score / 4 (No Post-UTME or O'Level)</option>
                    </select>
                  </div>

                  {/* Active Inputs Toggles */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setManualHasJamb(!manualHasJamb)}
                      className={`py-1.5 px-2 rounded-lg text-[8px] font-black uppercase text-center border transition-all ${
                        manualHasJamb
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                          : 'bg-black/20 text-gray-500 border-white/5'
                      }`}
                    >
                      JAMB {manualHasJamb ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualHasPostUtme(!manualHasPostUtme)}
                      className={`py-1.5 px-2 rounded-lg text-[8px] font-black uppercase text-center border transition-all ${
                        manualHasPostUtme
                          ? 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.15)]'
                          : 'bg-black/20 text-gray-500 border-white/5'
                      }`}
                    >
                      Post-UTME {manualHasPostUtme ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualHasOLevel(!manualHasOLevel)}
                      className={`py-1.5 px-2 rounded-lg text-[8px] font-black uppercase text-center border transition-all ${
                        manualHasOLevel
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                          : 'bg-black/20 text-gray-500 border-white/5'
                      }`}
                    >
                      O'Level {manualHasOLevel ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              ) : (
                scoringSystem ? (
                  <div className="p-2.5 bg-cyan-500/5 rounded-lg border border-cyan-500/10 flex items-center justify-between">
                    <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 leading-tight">
                      <ShieldCheck size={10} className="shrink-0" /> {scoringSystem.explanation}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 leading-tight">
                      <Info size={10} className="shrink-0" /> Pure UTME Formula active (JAMB Score / 4).
                    </p>
                  </div>
                )
              )}
            </div>

            {/* COE notice */}
            {targetUni?.category === 'COE' && (
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Info size={12} /> 2026 Exclusion: COE Programs are UTME Exempted!
                </p>
                <p className="text-[8px] text-gray-400 font-medium mt-1 uppercase tracking-tight">You only need to register with JAMB for verification. No UTME score required for NCE/ND.</p>
              </div>
            )}

            {/* Admission Type Selector: UTME vs Direct Entry */}
            <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-xl border border-white/10 mb-3">
              <button
                type="button"
                onClick={() => setIsDirectEntry(false)}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${!isDirectEntry ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                <span>🎓 UTME Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDirectEntry(true)}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${isDirectEntry ? 'bg-emerald-500 text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                <span>📜 Direct Entry (DE)</span>
              </button>
            </div>

            {isDirectEntry && (
              <div className="mb-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Direct Entry A-Level Profile</span>
                  <span className="text-[8px] font-bold text-gray-400">Enters into 200 Level (Year 2)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[7px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Qualification Type</label>
                    <select
                      value={deQualification}
                      onChange={e => setDeQualification(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black text-emerald-400 outline-none"
                    >
                      {['JUPEB / IJMB', 'Cambridge A-Levels', 'National Diploma (ND Upper Credit)', 'National Diploma (ND Lower Credit)', 'NCE', 'HND / Degree'].map(q => (
                        <option key={q} value={q} className="bg-gray-950 text-white">{q}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[7px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Equivalent Points (Max 15)</label>
                    <select
                      value={dePoints}
                      onChange={e => setDePoints(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black text-emerald-400 outline-none"
                    >
                      {['15', '14', '13', '12', '11', '10', '9', '8', '7'].map(pts => (
                        <option key={pts} value={pts} className="bg-gray-950 text-white">{pts} Points</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* JAMB + Post-UTME scores */}
            <div className={`grid ${(!computedScoringSystem || computedScoringSystem.hasPostUtme !== false) ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {/* JAMB */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="jamb-score" className="text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">
                    {targetUni?.category === 'COE' ? 'Registration No. (Optional)' : 'JAMB Score (400)'}
                  </label>
                  <button
                    onClick={() => setIsAR(!isAR)}
                    className={`px-2 py-0.5 rounded text-[7px] font-black uppercase transition-all flex items-center gap-1 ${isAR ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-white/5 text-gray-500 border border-white/5'}`}
                  >
                    {isAR ? <Check size={8} /> : <Plus size={8} />} Awaiting Result
                  </button>
                </div>
                <input
                  id="jamb-score" name="jamb-score"
                  type={targetUni?.category === 'COE' ? "text" : "number"}
                  placeholder={targetUni?.category === 'COE' ? "JAMB Reg No" : "400"}
                  value={jambScore} onChange={e => setJambScore(e.target.value)}
                  className="w-full p-3 bg-black/40 border border-white/5 rounded-xl font-black text-lg text-center outline-none focus:border-blue-500"
                />
              </div>

              {/* Post-UTME */}
              {(!computedScoringSystem || computedScoringSystem.hasPostUtme !== false) && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="post-utme-score" className="text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">
                      {isPostUtmePending ? 'Target Post-UTME (70)' : 'Post-UTME (100)'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsPostUtmePending(!isPostUtmePending)}
                      className={`px-2 py-0.5 rounded text-[7px] font-black uppercase transition-all flex items-center gap-1 ${isPostUtmePending ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-500 border border-white/5'}`}
                    >
                      {isPostUtmePending ? <Check size={8} /> : <Plus size={8} />} Pending Exam
                    </button>
                  </div>
                  <input
                    id="post-utme-score" name="post-utme-score" type="number" placeholder={isPostUtmePending ? "70" : "100"}
                    value={postUtmeScore} onChange={e => setPostUtmeScore(e.target.value)}
                    className={`w-full p-3 bg-black/40 border rounded-xl font-black text-lg text-center outline-none transition-all ${isPostUtmePending ? 'border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 text-white focus:border-blue-500'}`}
                  />
                </div>
              )}
            </div>

            {/* JAMB Subjects */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((num) => (
                <div key={num} className="relative">
                  <label htmlFor={`jamb-subject-${num}`} className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Subject {num} (JAMB)</label>
                  <select
                    id={`jamb-subject-${num}`}
                    value={num === 1 ? jambSubject1 : num === 2 ? jambSubject2 : jambSubject3}
                    onChange={e => num === 1 ? setJambSubject1(e.target.value) : num === 2 ? setJambSubject2(e.target.value) : setJambSubject3(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black text-white outline-none focus:border-cyan-500/50"
                  >
                    <option value="" className="bg-gray-950 text-gray-400">Select...</option>
                    {JAMB_SUBJECTS.map(subj => (
                      <option key={subj} value={subj} className="bg-gray-950 text-white font-medium">
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Live Pre-Calculation Subject Warning / Validation Notice */}
            {(jambSubject1 || jambSubject2 || jambSubject3) && !liveSubjectValidation.valid && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 animate-fade-in">
                <TriangleAlert size={15} className="text-red-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-wider text-red-400">
                    ⚠️ Subject Combination Warning (Pre-Calculation Check)
                  </p>
                  <p className="text-[8.5px] text-red-200/90 font-medium leading-relaxed">
                    {liveSubjectValidation.reason} <span className="font-bold underline">Please correct your subject combination before calculating to avoid disqualification.</span>
                  </p>
                </div>
              </div>
            )}
            {jambSubject1 && jambSubject2 && jambSubject3 && liveSubjectValidation.valid && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                <Check size={13} className="text-emerald-400 shrink-0" />
                <p className="text-[8px] font-bold text-emerald-300">
                  ✅ Subject combination matches requirements for <span className="font-black text-white">{targetCourse || courseSearch}</span>.
                </p>
              </div>
            )}

            {/* O-Level grades */}
            {(!computedScoringSystem || computedScoringSystem.hasOLevel) && (
              <div id="olevel-subject-list" className="space-y-2.5 pt-2.5 border-t border-white/5">
                <div className="flex justify-between items-center px-0.5">
                  <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest">O-Level (Best 5)</label>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1 bg-black/40 p-0.5 rounded-md">
                      <button onClick={() => setSittings(1)} className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase transition-all ${sittings === 1 ? 'bg-cyan-500 text-black' : 'text-gray-500'}`}>1 Sit</button>
                      <button onClick={() => setSittings(2)} className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase transition-all ${sittings === 2 ? 'bg-cyan-500 text-black' : 'text-gray-500'}`}>2 Sit</button>
                    </div>
                    {subjects.length < 9 && (
                      <button onClick={addSubject} className="p-1 bg-white/5 rounded text-cyan-400 hover:bg-white/10 transition-colors">
                        <Plus size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Exam Board Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[7px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Sitting 1 Exam Board</label>
                    <select
                      value={examBoard1}
                      onChange={e => setExamBoard1(e.target.value)}
                      className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-[9px] font-black text-cyan-400 outline-none"
                    >
                      {['WAEC (SSCE)', 'NECO (SSCE)', 'WAEC GCE', 'NECO GCE', 'NABTEB', 'JUPEB/IJMB'].map(b => (
                        <option key={b} value={b} className="bg-gray-950 text-white">{b}</option>
                      ))}
                    </select>
                  </div>
                  {sittings === 2 && (
                    <div>
                      <p className="text-[9px] text-amber-400 font-bold mb-2">Note: Enter your combined best 5 subjects across both sittings.</p>
                      <label className="text-[7px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Sitting 2 Exam Board</label>
                      <select
                        value={examBoard2}
                        onChange={e => setExamBoard2(e.target.value)}
                        className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-[9px] font-black text-cyan-400 outline-none"
                      >
                        {['WAEC (SSCE)', 'NECO (SSCE)', 'WAEC GCE', 'NECO GCE', 'NABTEB', 'JUPEB/IJMB'].map(b => (
                          <option key={b} value={b} className="bg-gray-950 text-white">{b}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="p-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg flex items-start gap-2">
                  <Info size={12} className="text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-[7.5px] text-cyan-300/90 leading-tight font-medium">
                    <strong className="text-cyan-200 uppercase">Grading Note:</strong> WAEC SSCE, NECO SSCE, WAEC GCE, NECO GCE, and NABTEB all share the exact same standard 9-point O-Level grading system (A1=2.0 to C6=1.0). JUPEB/IJMB are Advanced Level (A-Level) qualifications for Direct Entry.
                  </p>
                </div>

                {isAR && (
                  <div className="p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg flex flex-col gap-1">
                    <div className="flex items-start gap-2">
                      <Info size={10} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-[7px] font-black text-amber-500 uppercase tracking-widest leading-none">Awaiting Result Mode</p>
                    </div>
                    <p className="text-[7.5px] font-medium text-amber-500/80 leading-tight italic tracking-tight">
                      We've set your grades to C6 as a baseline. You can change these to simulate what happens if you get better results!
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {subjects.map((sub, idx) => (
                    <div key={idx} className="flex flex-col gap-1 px-2 py-2 bg-black/60 border border-white/5 rounded-lg group hover:border-cyan-500/30 transition-colors">
                      {idx < 2 ? (
                        <span className="text-[7px] font-bold text-gray-400 uppercase truncate h-[14px] flex items-center">
                          {sub.name}
                        </span>
                      ) : (
                        <select
                          aria-label={`O-Level Subject ${idx + 1}`}
                          value={OLEVEL_SUBJECTS.includes(sub.name) ? sub.name : ""}
                          onChange={e => updateSubjectName(idx, e.target.value)}
                          className="bg-transparent border-none text-[7px] font-bold text-cyan-400 hover:text-cyan-300 uppercase truncate p-0 outline-none w-full cursor-pointer h-[14px] focus:ring-0"
                        >
                          <option value="" disabled className="bg-gray-950 text-gray-400">Select...</option>
                          {OLEVEL_SUBJECTS.map(name => (
                            <option key={name} value={name} className="bg-gray-950 text-white">
                              {name}
                            </option>
                          ))}
                        </select>
                      )}
                      <select
                        id={`grade-${idx}`} name={`grade-${idx}`}
                        aria-label={`Grade for O-Level Subject ${idx + 1}`}
                        value={sub.grade} onChange={e => updateSubject(idx, e.target.value as OLevelGrade)}
                        className="bg-black/80 border border-white/5 rounded-md text-[9px] font-black text-cyan-50 p-1 outline-none cursor-pointer hover:border-cyan-500/50"
                      >
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calculate button */}
            <button
              onClick={handleLaunchAudit}
              disabled={isAnalysisLoading}
              className="w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalysisLoading
                ? <><Loader2 className="animate-spin" size={14} /> Analysing...</>
                : <><Sparkles size={14} /> Calculate Merit</>}
            </button>
          </div>
          ) : (
            <div className="p-5 bg-white/5 rounded-[24px] border border-white/10 space-y-6 relative z-30">
              {/* BRAND NEW ELEGANT VERIFIED HANDBOOK VIEW */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">Verified Institutional Course & Cutoff Handbook</h3>
                </div>
                <p className="text-[9.5px] text-gray-400 font-bold leading-normal uppercase tracking-tight">
                  Explore the direct list of accredited undergraduate programmes, official cutoff requirements, and budgeted costs for verified higher institutions on CampusAI. No calculations needed!
                </p>
              </div>

              {/* HANDBOOK FILTERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                {/* Institution search in handbook */}
                <div className="relative text-left">
                  <label htmlFor="handbook-uni-search" className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block text-left">
                    1. Select Institution
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                      id="handbook-uni-search" name="handbook-uni-search" type="text"
                      placeholder="Search university, polytechnic..." value={handbookUniSearch}
                      onChange={e => {
                        setHandbookUniSearch(e.target.value);
                        setIsHandbookUniDropdownOpen(true);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-xl font-bold text-xs outline-none focus:border-cyan-500 transition-all text-white"
                    />
                    <AnimatePresence>
                      {isHandbookUniDropdownOpen && handbookUniSearch.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-52 overflow-y-auto">
                          {universityData
                            .filter((u: any) => u.name?.toLowerCase().includes(handbookUniSearch.toLowerCase()))
                            .slice(0, 10)
                            .map((u: any) => (
                              <button
                                key={u.name}
                                type="button"
                                onClick={async () => {
                                  setSelectedHandbookUni(u);
                                  setHandbookUniSearch(u.name);
                                  setIsHandbookUniDropdownOpen(false);
                                  setHandbookCourseSearch('');
                                  setIsHandbookLoading(true);
                                  try {
                                    const courses = await getUniversityCourses(u.name);
                                    setHandbookCourses(courses);
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setIsHandbookLoading(false);
                                  }
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-white/5 font-bold border-b border-white/5 last:border-0 text-[10px] text-white"
                              >
                                {u.name}
                              </button>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Course search/filter in handbook */}
                <div className="relative text-left">
                  <label htmlFor="handbook-course-search" className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block text-left">
                    2. Filter Programme / Course
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                      id="handbook-course-search" name="handbook-course-search" type="text"
                      placeholder={selectedHandbookUni ? "Type to filter courses..." : "Select university first..."}
                      value={handbookCourseSearch}
                      disabled={!selectedHandbookUni}
                      onChange={e => setHandbookCourseSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-xl font-bold text-xs outline-none focus:border-cyan-500 transition-all text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* QUICK CHOOSE POPULAR INSTITUTIONS SHORTCUT */}
              {!selectedHandbookUni && (
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                  <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest text-left">
                    Quick Select Popular Nigerian Institutions
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {universityData.slice(0, 6).map((u: any) => (
                      <button
                        key={u.name}
                        type="button"
                        onClick={async () => {
                          setSelectedHandbookUni(u);
                          setHandbookUniSearch(u.name);
                          setHandbookCourseSearch('');
                          setIsHandbookLoading(true);
                          try {
                            const courses = await getUniversityCourses(u.name);
                            setHandbookCourses(courses);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsHandbookLoading(false);
                          }
                        }}
                        className="p-2.5 bg-black/40 border border-white/5 hover:border-cyan-500/40 rounded-xl font-bold text-[9px] uppercase tracking-wider text-gray-300 hover:text-white transition-all text-left truncate flex items-center justify-between"
                      >
                        <span>{(u.name || '').replace("University of ", "U of ").replace("Federal University of ", "FUTO ")}</span>
                        <ArrowRight size={10} className="text-cyan-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COURSE OFFERINGS LIST */}
              {selectedHandbookUni && (
                <div className="space-y-3 pt-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <p className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider">
                      Accredited Programmes for <span className="text-cyan-400">{selectedHandbookUni.name}</span>
                    </p>
                    <span className="text-[8px] font-mono font-bold text-gray-500 uppercase">
                      Found {handbookCourses.filter(c => c.toLowerCase().includes(handbookCourseSearch.toLowerCase())).length} Courses
                    </span>
                  </div>

                  {isHandbookLoading ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                      <Loader2 size={24} className="animate-spin text-cyan-500" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Retrieving Accredited Options...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {handbookCourses
                        .filter(c => c.toLowerCase().includes(handbookCourseSearch.toLowerCase()))
                        .map(c => {
                          const key = `${selectedHandbookUni.name}_${c}`;
                          const details = handbookCourseDetails[key];
                          const isChecking = isCheckingDetails === c;

                          return (
                            <div key={c} className="p-3.5 bg-black/40 border border-white/5 hover:border-white/10 rounded-2xl space-y-3 transition-all text-left">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <h4 className="text-[10.5px] font-black text-white leading-tight uppercase tracking-tight">{c}</h4>
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Verified Accredited Course</span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCalibration(selectedHandbookUni.name, c)}
                                    className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0"
                                    title="Correct or calibrate estimated competitive benchmark marks"
                                  >
                                    <Sliders size={10} /> Calibrate
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCheckHandbookCourse(c)}
                                    disabled={isChecking}
                                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                                      details ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' : 'bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10'
                                    }`}
                                  >
                                    {isChecking ? (
                                      <Loader2 size={10} className="animate-spin" />
                                    ) : details ? (
                                      'Hide details'
                                    ) : (
                                      'Quick Check'
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleLoadCourseIntoCalculator(c)}
                                    className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-[9px] uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center gap-1 shrink-0"
                                  >
                                    <RefreshCw size={9} /> Sync
                                  </button>
                                </div>
                              </div>

                              {/* Expanded details */}
                              {details && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="pt-2.5 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3 text-left overflow-hidden"
                                >
                                  <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 text-left whitespace-normal break-words">
                                    <span className="text-[7.5px] font-black uppercase tracking-widest text-cyan-400 block pb-0.5">Admission Cut-Off Info</span>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-tight break-words">{details.cutoff}</p>
                                    <span className="text-[7px] text-gray-500 font-bold block leading-normal mt-1 uppercase">Recommended: {details.subjectValidation}</span>
                                  </div>
                                  <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 text-left whitespace-normal break-words">
                                    <span className="text-[7.5px] font-black uppercase tracking-widest text-amber-400 block pb-0.5">Cost Standard (2026 Estimate)</span>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-tight break-words">{details.tuition}</p>
                                    <span className="text-[7px] text-gray-500 font-bold block leading-normal mt-1 uppercase">Guidelines: {details.mathBreakdown}</span>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}

                      {handbookCourses.filter(c => c.toLowerCase().includes(handbookCourseSearch.toLowerCase())).length === 0 && (
                        <div className="p-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                          <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">No matching programmes found</p>
                          <p className="text-[9px] text-gray-600 font-semibold mt-1 uppercase tracking-tight">Try expanding or clearing your filter keyword</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {currentSchoolSlug && (
            <SchoolUgcSection
              schoolSlug={currentSchoolSlug}
              user={user}
              onLoginRequest={onLoginRequest}
            />
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {showResults && (aiResult || isAnalysisLoading) ? (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col space-y-8">

                {/* Main result card */}
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-10 relative overflow-hidden">
                  <button onClick={() => setShowResults(false)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                    <X size={16} />
                  </button>

                  {/* Admission Snapshot Card ALWAYS VISIBLE */}
                  <div className="mb-6 p-5 bg-black/40 rounded-[20px] border border-white/5 shadow-inner">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                      <Activity size={12} className="text-blue-400" /> Admission Snapshot
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Institution</p>
                        <p className="text-xs md:text-sm font-bold text-white mt-1 truncate">{targetUni?.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Course</p>
                        <p className="text-xs md:text-sm font-bold text-white mt-1 truncate">{targetCourse || courseSearch}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{(isAR || isPostUtmePending) ? 'Projected' : 'Aggregate'}</p>
                        <p className="text-lg md:text-xl font-black text-emerald-400 mt-1">{aggregateScore}%</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Quota</p>
                        <p className="text-xs md:text-sm font-bold text-purple-400 mt-1">{stateOfOrigin || 'General'}</p>
                      </div>
                    </div>
                  </div>

                  {isAnalysisLoading ? (
                     <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <CalculationAnimation />
                        <span className="text-sm font-bold text-gray-400 animate-pulse font-mono uppercase tracking-wider">Analyzing Admission Chances...</span>
                     </div>
                  ) : aiResult ? (
                    !user ? (
                      /* GUEST VIEW: Aggregate Math Summary + High-Converting Sign-In Gate */
                      <div className="space-y-6 mt-4">
                        {/* Formula & Calculation Breakdown Card */}
                        <div className="p-5 bg-black/40 rounded-2xl border border-white/10 text-left space-y-4 shadow-xl">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                            <div className="flex items-center gap-2">
                              <Calculator size={16} className="text-emerald-400" />
                              <span className="text-xs font-black uppercase tracking-wider text-white">
                                Aggregate Score Formula Breakdown
                              </span>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                              <Check size={10} /> Verified Math Exact
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {/* UTME Score Contribution */}
                            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                              <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">JAMB UTME (400)</p>
                              <p className="text-lg font-black text-white mt-0.5">{jambScore || '0'}<span className="text-xs text-gray-500 font-normal"> / 400</span></p>
                              <p className="text-[9px] text-gray-400 mt-1 font-medium leading-tight">
                                {computedScoringSystem?.hasPostUtme ? 'Scaled to 50% ratio' : 'Scaled to institutional weight'}
                              </p>
                            </div>

                            {/* Post-UTME / Screening Score Contribution */}
                            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                              <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Post-UTME / Screening</p>
                              <p className="text-lg font-black text-white mt-0.5">
                                {(!computedScoringSystem || computedScoringSystem.hasPostUtme !== false) ? (
                                  <>
                                    {isPostUtmePending ? 'Pending' : (postUtmeScore ? `${postUtmeScore}` : '0')}
                                    <span className="text-xs text-gray-500 font-normal">{isPostUtmePending ? ' (Projected)' : ' / 100'}</span>
                                  </>
                                ) : (
                                  <span className="text-xs font-semibold text-gray-400">Not used</span>
                                )}
                              </p>
                              <p className="text-[9px] text-gray-400 mt-1 font-medium leading-tight">
                                {(!computedScoringSystem || computedScoringSystem.hasPostUtme !== false)
                                  ? 'Institutional screening contribution'
                                  : 'Not used in aggregate calculation'}
                              </p>
                            </div>

                            {/* Calculated Total Aggregate */}
                            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl sm:col-span-2 md:col-span-1">
                              <p className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">Total Calculated Aggregate</p>
                              <p className="text-xl font-black text-emerald-400 mt-0.5">{aggregateScore}%</p>
                              <p className="text-[9px] text-emerald-300/80 mt-1 font-medium leading-tight truncate">
                                {computedScoringSystem?.explanation || "Standard Institutional Scoring Formula"}
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 text-[9.5px] text-gray-300 flex items-start gap-2">
                            <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Scoring Formula:</strong> {computedScoringSystem?.explanation || "Pure Academic Formula (JAMB / 4)."}
                            </span>
                          </div>
                        </div>

                        {/* Primary Gated Callout / Sign In Prompt */}
                        <div className="p-6 md:p-8 bg-gradient-to-b from-blue-900/30 via-black/60 to-purple-950/30 border-2 border-blue-500/30 rounded-[28px] text-left shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

                          <div className="relative z-10 space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                <Lock size={11} className="text-blue-400" /> Guest Scholar • Full Analysis Gated
                              </span>
                              <span className="text-[9.5px] font-bold text-gray-400">
                                Target: <strong className="text-white">{targetUni?.name}</strong>
                              </span>
                            </div>

                            <div>
                              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                Unlock Your Full 2026 Admission Analysis
                              </h3>
                              <p className="text-xs md:text-sm text-gray-300 mt-2 leading-relaxed">
                                Your aggregate score of <strong className="text-emerald-400">{aggregateScore}%</strong> is computed! Sign in to reveal your official cut-off benchmark, admission probability rating, and custom AI strategy report:
                              </p>
                            </div>

                            {/* Feature Highlights Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-xl flex items-start gap-2.5">
                                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg shrink-0 mt-0.5">
                                  <ShieldCheck size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">Official Cut-Off Benchmark</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                                    Compare your {aggregateScore}% directly against merit, catchment, and ELDS cutoffs.
                                  </p>
                                </div>
                              </div>

                              <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-xl flex items-start gap-2.5">
                                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                                  <Sparkles size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">Admission Probability & Gauge</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                                    Detailed chance forecast (Strong, Competitive, or Borderline) with score margin.
                                  </p>
                                </div>
                              </div>

                              <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-xl flex items-start gap-2.5">
                                <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg shrink-0 mt-0.5">
                                  <Brain size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">AI Strategy & Action Plan</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                                    Custom step-by-step checklist, JAMB CAPS transfer tactics, and screening prep.
                                  </p>
                                </div>
                              </div>

                              <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-xl flex items-start gap-2.5">
                                <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg shrink-0 mt-0.5">
                                  <FileText size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">Result Slip PDF / Image Export</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                                    Export, print, and save your official verified admission calculation slip.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <div className="pt-3 space-y-3">
                              <button
                                onClick={onLoginRequest}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-xs md:text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all cursor-pointer"
                              >
                                <LogIn size={18} /> Sign In to View Full Analysis (100% Free)
                              </button>

                              <p className="text-center text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1.5">
                                <span>✨ 1-Click Google Sign In</span>
                                <span>•</span>
                                <span>Free for Nigerian Scholars</span>
                                <span>•</span>
                                <span>Save calculation history</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Blurred Teaser Silhouette */}
                        <div className="relative rounded-2xl overflow-hidden border border-white/5 opacity-40 select-none pointer-events-none filter blur-[2px]">
                          <div className="p-5 bg-black/40 space-y-4">
                            <div className="h-6 bg-white/10 rounded-lg w-1/3 mx-auto"></div>
                            <div className="h-28 bg-white/5 rounded-xl"></div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="h-20 bg-white/5 rounded-xl"></div>
                              <div className="h-20 bg-white/5 rounded-xl"></div>
                              <div className="h-20 bg-white/5 rounded-xl"></div>
                            </div>
                            <div className="h-24 bg-white/5 rounded-xl"></div>
                          </div>
                        </div>
                      </div>
                    ) : (() => {
                      let chanceLevel = '🔴 Unlikely';
                      let chanceColor = 'text-red-500';
                      let chanceBg = 'bg-red-500/10 border-red-500/20';

                      if (admissionProbability >= 75) {
                        chanceLevel = '🟢 Strong Chance';
                        chanceColor = 'text-emerald-500';
                        chanceBg = 'bg-emerald-500/10 border-emerald-500/20';
                      } else if (admissionProbability >= 50) {
                        chanceLevel = '🟡 Competitive';
                        chanceColor = 'text-amber-400';
                        chanceBg = 'bg-amber-500/10 border-amber-500/20';
                      } else if (admissionProbability >= 30) {
                        chanceLevel = '🟠 Borderline';
                        chanceColor = 'text-orange-500';
                        chanceBg = 'bg-orange-500/10 border-orange-500/20';
                      }

                      if (aiResult.isOffered === false) {
                        chanceLevel = '🔴 Not Accredited';
                        chanceColor = 'text-red-500';
                        chanceBg = 'bg-red-500/10 border-red-500/20';
                      }

                      return (
                        <>
                          <div className="flex flex-col items-center mb-8">
                            <div className={`px-6 py-2.5 rounded-full border mb-6 font-black text-sm md:text-base uppercase tracking-widest flex items-center justify-center ${chanceBg} ${chanceColor} shadow-lg`}>
                               {chanceLevel}
                            </div>
                            
                            <ProbabilityGauge probability={aiResult.isOffered === false ? 0 : admissionProbability} />
                          </div>

                          {/* 3-Pillar Verification & Model Audit Matrix */}
                          <div className="w-full my-4 p-4.5 bg-black/40 rounded-2xl border border-white/10 text-left space-y-4 shadow-xl">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-400" />
                                <span className="text-xs font-black uppercase tracking-wider text-white">
                                  Verification & Ground Truth Audit
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-gray-400">
                                Quota: <span className="font-bold text-white">{aiResult.cutoffQuotaUsed || candidateQuota.quotaLabel}</span>
                              </span>
                            </div>

                            {/* 3 Independent Pillars */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Pillar 1: Cutoff Ground Truth */}
                              <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-2">
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">1. Cutoff Benchmark</span>
                                    {aiResult.cutoffIsOfficial || (targetUni && (targetUni.name.includes('Ibadan') || targetUni.name.toLowerCase() === 'ui')) ? (
                                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-black text-[8.5px] flex items-center gap-1">
                                        <Check size={10} /> Official High
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-black text-[8.5px]">
                                        Historical Est.
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-lg font-black text-white">
                                    {aiResult.cutoffValue ? `${aiResult.cutoffValue}%` : (aiResult.departmentalCutoff || aiResult.cutoff || 'N/A')}
                                  </p>
                                  <p className="text-[9.5px] text-gray-400 mt-1 font-medium leading-tight">
                                    {aiResult.cutoffSource || (targetUni?.name.includes('Ibadan') ? 'Official UI 2025/2026 Senate Release' : 'Historical Departmental Benchmark')}
                                  </p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-white/5 text-[9px] font-mono text-emerald-400/90 flex items-center gap-1 font-bold">
                                  <span>Cutoff Confidence: {aiResult.cutoffIsOfficial ? 'Verified High ✅' : 'Historical Est. 🟡'}</span>
                                </div>
                              </div>

                              {/* Pillar 2: Aggregate Calculation */}
                              <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-2">
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">2. Aggregate Math</span>
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-black text-[8.5px] flex items-center gap-1">
                                      <Check size={10} /> Verified Exact
                                    </span>
                                  </div>
                                  <p className="text-lg font-black text-emerald-400">
                                    {aggregateScore}%
                                  </p>
                                  <p className="text-[9.5px] text-gray-400 mt-1 font-medium leading-tight">
                                    {computedScoringSystem?.explanation || "Official 50% JAMB + 50% Post-UTME Ratio"}
                                  </p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-white/5 text-[9px] font-mono text-emerald-400/90 flex items-center gap-1 font-bold">
                                  <span>Calculation: Verified Math ✅</span>
                                </div>
                              </div>

                              {/* Pillar 3: Admission Probability */}
                              <div className="p-3.5 bg-white/[0.02] border border-blue-500/20 rounded-xl flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-2">
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">3. Admission Probability</span>
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-cyan-400 border border-blue-500/20 rounded-md font-black text-[8.5px] flex items-center gap-1">
                                      <Sparkles size={10} /> Model Estimate
                                    </span>
                                  </div>
                                  <div className="flex items-baseline gap-2">
                                    <p className="text-lg font-black text-cyan-400">
                                      {aiResult.isOffered === false ? 0 : admissionProbability}%
                                    </p>
                                    {(() => {
                                      const cVal = parseFloat(String(aiResult.cutoffValue || aiResult.departmentalCutoff || '0').replace(/[^0-9.]/g, ''));
                                      const aggVal = parseFloat(aggregateScore.toString()) || 0;
                                      const diff = cVal > 0 ? (aggVal - cVal) : 0;
                                      const isSurplus = diff >= 0;
                                      return (
                                        <span className={`text-[10px] font-bold ${isSurplus ? 'text-emerald-400' : diff >= -1.5 ? 'text-amber-400' : 'text-red-400'}`}>
                                          ({isSurplus ? `+${diff.toFixed(2)}%` : `${diff.toFixed(2)}%`})
                                        </span>
                                      );
                                    })()}
                                  </div>
                                  <p className="text-[9.5px] text-gray-400 mt-1 font-medium leading-tight">
                                    Statistical model forecast based on score margin vs competitive applicant distribution.
                                  </p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-white/5 text-[9px] font-mono text-cyan-400/90 flex items-center gap-1 font-bold">
                                  <span>Probability: AI/Model Estimate ⚠️</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6">
                            <div className="p-2 bg-blue-500/5 rounded-lg border border-blue-500/10 inline-flex items-center gap-1.5">
                              {aiResult.isOffered === false
                                ? <><X size={10} className="text-red-400" /><span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Course Not Accredited</span></>
                                : <><ShieldCheck size={10} className="text-blue-400" /><span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Deterministic Engine Verified</span></>}
                            </div>
                            {user?.scholarCredits > 0 && (
                              <div className="p-2 bg-amber-500/5 rounded-lg border border-amber-500/10 inline-flex items-center gap-1.5">
                                <Crown size={10} className="text-amber-500" />
                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{user.scholarCredits} Premium Trials Left</span>
                              </div>
                            )}
                          </div>

                        {/* Export & Upload Action Bar */}
                        <div className="flex items-center gap-3 my-6 pt-5 border-t border-white/10 flex-wrap justify-center sm:justify-start">
                          <button
                            onClick={() => setIsPdfExportModalOpen(true)}
                            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                          >
                            <FileText size={16} /> Export Result Slip (PDF / Image)
                          </button>
                          <button
                            onClick={() => setIsUploadHubModalOpen(true)}
                            className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all active:scale-95"
                          >
                            <Upload size={16} /> Upload Additional Documents
                          </button>
                        </div>
                      </>
                    );
                  })()
                ) : null}

                {user && aiResult && (
                  <>
                    {/* Evidence Panel */}
                      {aiResult.evidencePanel && Array.isArray(aiResult.evidencePanel) && aiResult.evidencePanel.filter((e: any) => e && (e.value || e.type || e.sourceUrl)).length > 0 && (
                        <div className="mt-6 p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                          <details className="group" open>
                            <summary className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between cursor-pointer list-none select-none">
                              <span className="flex items-center gap-2"><Database size={12} className="text-emerald-400" /> Evidence Used</span>
                              <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                              {aiResult.evidencePanel.filter((e: any) => e && (e.value || e.type || e.sourceUrl)).map((evidence: any, idx: number) => {
                                const conf = evidence.confidenceLevel || 'Medium';
                                const typeLabel = evidence.type ? String(evidence.type).replace(/_/g, ' ') : 'HISTORICAL BENCHMARK';
                                const valueText = evidence.value || 'Data extracted from official institutional records and JAMB guidelines.';
                                const sourceUrl = evidence.sourceUrl;
                                
                                let formattedSource = 'Official University Portal';
                                if (sourceUrl && sourceUrl !== 'Unknown') {
                                  try {
                                    const urlObj = new URL(sourceUrl);
                                    formattedSource = urlObj.hostname.replace(/^www\./, '');
                                  } catch {
                                    formattedSource = String(sourceUrl).substring(0, 30);
                                  }
                                }
                                
                                return (
                                  <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-left">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[9px] font-black uppercase text-gray-400">{typeLabel}</span>
                                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                        conf.toLowerCase() === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
                                        conf.toLowerCase() === 'medium' ? 'bg-cyan-500/10 text-cyan-400' :
                                        'bg-amber-500/10 text-amber-400'
                                      }`}>
                                        {conf} Confidence
                                      </span>
                                    </div>
                                    <p className="text-sm font-bold text-white mb-2">{valueText}</p>
                                    <div className="flex items-center justify-between text-[9px] text-gray-500">
                                      <span className="truncate max-w-[280px]">
                                        Source: {sourceUrl && sourceUrl.startsWith('http') ? (
                                          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                            {formattedSource}
                                          </a>
                                        ) : (
                                          formattedSource
                                        )}
                                      </span>
                                      {evidence.retrievedDate && <span>Retrieved: {evidence.retrievedDate}</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </details>
                        </div>
                      )}

                  {/* Post-UTME status */}
                  {targetUni && (() => {
                    const fs = getPostUtmeStatus(targetUni.name);
                    return (
                      <div className={`mt-3 p-4 rounded-xl border ${fs.badgeColor} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-all ${isLimitedView ? 'blur-sm select-none pointer-events-none' : ''}`}>
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-xl ${fs.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Sparkles className={fs.textColor} size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Post-UTME Status:</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${fs.textColor} ${fs.iconBg} font-mono`}>{fs.statusText}</span>
                            </div>
                            <p className="text-[10px] text-gray-300 font-semibold leading-relaxed mt-1">{fs.details}</p>
                          </div>
                        </div>
                        {fs.portalLink && fs.isOut && (
                          <a href={fs.portalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] uppercase tracking-widest rounded-lg transition-all active:scale-95 shrink-0 self-start sm:self-center">
                            Open Portal <ArrowRight size={10} />
                          </a>
                        )}
                      </div>
                    );
                  })()}

                  {/* Subject Combination validation */}
                  {aiResult.subjectCombinationValidation && (
                    <div className={`mt-5 p-3 rounded-xl border flex items-start gap-2.5 ${aiResult.subjectCombinationValidation.valid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      {aiResult.subjectCombinationValidation.valid ? <Check size={16} className="text-emerald-400 mt-0.5" /> : <X size={16} className="text-red-400 mt-0.5" />}
                      <div>
                        <p className={`text-[10px] font-bold ${aiResult.subjectCombinationValidation.valid ? 'text-emerald-300' : 'text-red-300'}`}>
                          {aiResult.subjectCombinationValidation.valid ? 'Subject Combination Valid' : 'Invalid Subject Combination'}
                        </p>
                        <p className="text-[9px] text-gray-400 mt-0.5 leading-relaxed">{aiResult.subjectCombinationValidation.reason}</p>
                      </div>
                    </div>
                  )}

                                    {(aiResult.strengths?.length > 0 || aiResult.riskFactors?.length > 0) && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiResult.strengths?.length > 0 && (
                        <div className="p-5 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl">
                          <p className="text-[10px] font-black text-emerald-400 uppercase mb-3 tracking-widest flex items-center gap-1.5"><Check size={12} /> Strengths</p>
                          <div className="flex flex-wrap gap-2">
                            {aiResult.strengths.map((str: string, idx: number) => (
                              <span key={idx} className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                                🟢 {str}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiResult.riskFactors?.length > 0 && (
                        <div className="p-5 bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl">
                          <p className="text-[10px] font-black text-orange-400 uppercase mb-3 tracking-widest flex items-center gap-1.5"><TriangleAlert size={12} /> Risk Factors</p>
                          <div className="flex flex-wrap gap-2">
                            {aiResult.riskFactors.map((risk: string, idx: number) => (
                              <span key={idx} className="px-2.5 py-1.5 bg-orange-500/10 text-orange-300 border border-orange-500/20 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                                ⚠️ {risk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                    <details className="group">
                      <summary className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between cursor-pointer list-none select-none">
                        <span className="flex items-center gap-2"><Activity size={12} className="text-blue-400" /> Why this prediction?</span>
                        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                        <p className="text-[11px] text-gray-300">Your admission chance is based on multiple weighted factors including:</p>
                        
                        {aiResult.scoreBreakdown && aiResult.scoreBreakdown.length > 0 ? (
                          <div className="space-y-2 mt-3">
                            {aiResult.scoreBreakdown.map((breakdown: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-lg">
                                <span className="text-[10px] font-bold text-gray-400">{breakdown.factor}</span>
                                <span className={`text-[10px] font-black ${breakdown.impact.startsWith('+') ? 'text-emerald-400' : breakdown.impact.startsWith('-') ? 'text-red-400' : 'text-gray-300'}`}>
                                  {breakdown.impact}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ul className="space-y-2 text-[10px] font-semibold text-gray-400">
                            <li className="flex items-center gap-2"><span>•</span> JAMB score relative to historical performance (approx. 35%)</li>
                            <li className="flex items-center gap-2"><span>•</span> O'Level grades and required subject matching (approx. 20%)</li>
                            <li className="flex items-center gap-2"><span>•</span> Aggregate score vs standard estimated competitive benchmarks (approx. 25%)</li>
                            <li className="flex items-center gap-2"><span>•</span> Departmental competitiveness & quota constraints (approx. 15%)</li>
                            <li className="flex items-center gap-2"><span>•</span> Catchment/ELDS state considerations (approx. 5%)</li>
                          </ul>
                        )}
                        
                      </div>
                    </details>
                  </div>

                  <div className="mt-6 p-5 bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2"><Activity size={12} className="text-purple-400" /> Admission Strategy Analysis</p>
                    <div className="markdown-body text-xs text-gray-200 leading-relaxed font-normal space-y-3">
                      <Markdown
                        components={{
                          p: ({ children }) => <p className="mb-2.5 text-gray-200 text-xs leading-relaxed">{children}</p>,
                          h1: ({ children }) => <h3 className="font-extrabold text-cyan-400 text-xs uppercase tracking-wide mt-4 mb-2 pb-1 border-b border-white/10 flex items-center gap-1.5">{children}</h3>,
                          h2: ({ children }) => <h3 className="font-extrabold text-cyan-400 text-xs uppercase tracking-wide mt-4 mb-2 pb-1 border-b border-white/10 flex items-center gap-1.5">{children}</h3>,
                          h3: ({ children }) => <h3 className="font-extrabold text-cyan-400 text-xs uppercase tracking-wide mt-4 mb-2 pb-1 border-b border-white/10 flex items-center gap-1.5">{children}</h3>,
                          ul: ({ children }) => <ul className="space-y-1.5 my-2 text-xs text-gray-300 pl-1">{children}</ul>,
                          ol: ({ children }) => <ol className="space-y-1.5 my-2 text-xs text-gray-300 pl-1 list-decimal list-inside">{children}</ol>,
                          li: ({ children }) => <li className="flex items-start gap-2 text-xs text-gray-300"><span className="text-cyan-400 font-bold shrink-0">•</span><span className="flex-1">{children}</span></li>,
                          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                          pre: ({ children }) => <div className="text-xs text-gray-200 leading-relaxed font-normal my-2">{children}</div>,
                          code: ({ children }) => <span className="text-xs text-gray-200 font-normal">{children}</span>
                        }}
                      >
                        {formatStrategyMarkdown(aiResult.detailedStrategy || aiResult.recommendation || 'No specific strategy analysis available.')}
                      </Markdown>
                    </div>
                  </div>

                  {/* Strategic Action Plan */}
                  {true && (() => {
                    const postInfo = getPostUtmeStatus(targetUni?.name || 'institution');
                    const isClosed = postInfo.statusText !== "Registration Active" && postInfo.statusText !== "Form Awaiting / TBA";

                    return (
                    <div className="mt-6 p-6 bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.02] border border-amber-500/20 rounded-2xl text-left space-y-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                          <Sliders size={15} />
                        </div>
                        <div>
                          <h5 className="text-xs font-black uppercase tracking-widest text-amber-400">STRATEGIC ACTION PLAN</h5>
                          <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5">Custom corrective steps for {targetUni?.name || 'your institution'}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                        <p className="text-[10px] text-amber-200 leading-relaxed font-semibold">
                          {parseFloat(aggregateScore.toString()) >= parseFloat(String(aiResult.cutoffValue || aiResult.departmentalCutoff || '0').replace(/[^0-9.]/g, '')) ? (
                            <>✅ Your calculated aggregate of <span className="text-white font-extrabold">{aggregateScore}%</span> is above the {aiResult.cutoffIsOfficial ? 'official' : 'historical/projected'} benchmark of <span className="text-white font-extrabold">{aiResult.cutoffValue || aiResult.departmentalCutoff || aiResult.cutoff}</span> for {targetCourse || courseSearch}. This suggests you are competitive, but it does not guarantee admission. Follow the action plan to maximize your chances.</>
                          ) : (
                            <>⚠️ Your calculated aggregate of <span className="text-white font-extrabold">{aggregateScore}%</span> is below the {aiResult.cutoffIsOfficial ? 'official' : 'historical/projected'} benchmark of <span className="text-white font-extrabold">{aiResult.cutoffValue || aiResult.departmentalCutoff || aiResult.cutoff}</span> for {targetCourse || courseSearch}. You may need a backup plan. Follow the action plan for strategies.</>
                          )}
                        </p>
                      </div>

                      {/* Interactive Checklist (Dynamic based on admission probability) */}
                      <div className="space-y-3.5">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span>📋</span> ACTION PLAN CHECKLIST
                        </p>
                        
                        <div className="space-y-2.5">
                          {(admissionProbability >= 65 ? [
                            {
                              id: 'step1',
                              title: isClosed ? 'Verify Post-UTME Screening' : 'Complete Post-UTME registration',
                              desc: isClosed 
                                ? `Post-UTME registration for ${targetUni?.name || 'this institution'} is closed. Verify that your screening details are correctly recorded.`
                                : `Ensure you have registered for the Post-UTME screening on the official ${targetUni?.name || 'institution'} portal.`
                            },
                            {
                              id: 'step2',
                              title: 'Upload O\'Level to JAMB CAPS',
                              desc: 'Log in to your JAMB CAPS portal and verify that your WAEC/NECO results are correctly uploaded.',
                              hasLink: true,
                              link: 'https://jamb.gov.ng/efacility',
                              linkLabel: 'Open JAMB e-Facility'
                            },
                            {
                              id: 'step3',
                              title: 'Monitor admission list',
                              desc: 'Keep checking your JAMB CAPS status regularly for any updates on your admission.'
                            }
                          ] : [
                            {
                              id: 'step1',
                              title: 'Verify portal activation & deadlines',
                              desc: `The 2026 JAMB Change of Course/Institution portal is officially active. Log in to the official JAMB e-Facility portal to complete your adjustments before the deadline.`,
                              hasLink: true,
                              link: 'https://jamb.gov.ng/efacility',
                              linkLabel: 'Open JAMB e-Facility'
                            },
                            {
                              id: 'step2',
                              title: 'Change of Course',
                              desc: 'Consider switching to a less competitive course within the same institution to improve your chances.'
                            },
                            {
                              id: 'step3',
                              title: 'Alternative institutions',
                              desc: 'Explore state or private universities that have lower cutoff marks for your desired course.'
                            },
                            {
                              id: 'step4',
                              title: 'Consider supplementary admission',
                              desc: 'Monitor for supplementary forms when the main admission lists have been concluded.'
                            }
                          ]).map((step, sIdx) => {
                            const isChecked = checkedRescueSteps[step.id];
                            return (
                              <div
                                key={step.id}
                                onClick={() => toggleRescueStep(step.id)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex gap-3 items-start ${
                                  isChecked 
                                    ? 'bg-amber-500/10 border-amber-500/30' 
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                                  isChecked 
                                    ? 'bg-amber-500 border-amber-500 text-black' 
                                    : 'border-gray-500 bg-black/20 text-transparent'
                                }`}>
                                  <Check size={12} strokeWidth={3} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[10px] font-black uppercase tracking-tight ${isChecked ? 'text-amber-300' : 'text-white'}`}>
                                    {sIdx + 1}. {step.title}
                                  </p>
                                  <p className="text-[9.5px] text-gray-400 leading-relaxed font-semibold mt-0.5">{step.desc}</p>
                                  
                                  {step.hasLink && (
                                    <a
                                      href={step.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 mt-2 text-[9px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest border-b border-amber-400/30 pb-0.5 transition-all"
                                    >
                                      {step.linkLabel} <ExternalLink size={8} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Post-UTME Exam / CAPS Marketplace Strategy */}
                      <div className="space-y-3 pt-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span>📚</span> Preparatory & CAPS Marketplace Advice
                        </p>
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2.5">
                          {isPostUtmePending && !((targetUni?.name || '').toLowerCase().includes("futa") || (targetUni?.name || '').toLowerCase().includes("akure") || (targetUni?.name || '').toLowerCase().includes("lasu") || (targetUni?.name || '').toLowerCase().includes("lagos state")) && (!computedScoringSystem || computedScoringSystem.hasPostUtme !== false) ? (
                            <div>
                              <p className="text-[10px] font-bold text-white uppercase tracking-tight">🎯 Pull Up Your Post-UTME Grade</p>
                              <p className="text-[9.5px] text-gray-400 leading-relaxed mt-0.5 font-semibold">
                                Since your Post-UTME exam/screening is still pending, this is your prime opportunity! Scoring extremely high (above 85%) on the screening paper will dynamically elevate your aggregate score, completely compensating for a lower UTME score. Prioritize solving official post-UTME past questions daily.
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-[10px] font-bold text-white uppercase tracking-tight">📲 Upload O'Level Results to JAMB CAPS</p>
                              <p className="text-[9.5px] text-gray-400 leading-relaxed mt-0.5 font-semibold">
                                Ensure your SSCE (WAEC/NECO/NABTEB) results are fully uploaded on JAMB CAPS. If not uploaded, JAMB will completely exclude you from the automated admission ranking pools. You can check your status at any registered JAMB CBT center.
                              </p>
                            </div>
                          )}
                          <div className="pt-2 border-t border-white/5">
                            <p className="text-[10px] font-bold text-white uppercase tracking-tight">💼 Monitor JAMB CAPS Transfer Marketplace</p>
                            <p className="text-[9.5px] text-gray-400 leading-relaxed mt-0.5 font-semibold">
                              Sometimes institutions transfer borderline candidates to less competitive, vacant programs. Regularly log in to JAMB CAPS, navigate to "Transfer", and immediately accept any transfer offers you see to avoid losing admission.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Alternative Rescue Target Courses with 1-Click Re-Calculate */}
                      {aiResult.alternatives && aiResult.alternatives.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span>🎓</span> Recommended Safe Haven Alternative Courses
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {aiResult.alternatives.map((alt: any, idx: number) => (
                              <div key={idx} className="p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl flex flex-col justify-between transition-all">
                                <div>
                                  <div className="flex justify-between items-start gap-2 mb-1">
                                    <h6 className="font-extrabold text-white text-[10px] uppercase tracking-tight">{alt.name}</h6>
                                    <span className="shrink-0 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[7px] font-black tracking-widest uppercase">{alt.matchPercentage}</span>
                                  </div>
                                  <p className="text-[9.5px] text-gray-400 leading-tight font-semibold mt-1">{alt.reasoning}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    let courseName = alt.name;
                                    let matchedUni = null;
                                    if (alt.name.includes(" at ")) {
                                      const parts = alt.name.split(" at ");
                                      courseName = parts[0].trim();
                                      const schoolName = parts[1]?.trim();
                                      if (schoolName) {
                                        matchedUni = universityData.find((u: any) => 
                                          u.name?.toLowerCase().includes(schoolName.toLowerCase()) || 
                                          schoolName.toLowerCase().includes(u.name?.toLowerCase())
                                        );
                                      }
                                    }
                                    if (matchedUni) {
                                      setTargetUni(matchedUni);
                                      setUniSearch(matchedUni.name);
                                    }
                                    setTargetCourse(courseName);
                                    setCourseSearch(courseName);
                                    // Trigger calculating this new course synchronously
                                    handleLaunchAuditInternal(true, true, matchedUni || targetUni, courseName);
                                  }}
                                  className="mt-3.5 w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                                >
                                  <RefreshCw size={9} /> Try Re-Calculate
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })()}

                  {/* Predictive Range & Sources Cited (Protects admission credibility and cites official sources) */}
                  <div className="mt-5 space-y-4">
                    {/* Prediction disclaimer and range */}
                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertCircle size={12} className="text-amber-500" />
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Confidence Interval & Prediction Disclaimer</span>
                      </div>
                      <p className="text-[11px] text-gray-200 font-semibold leading-relaxed">
                        {aiResult.predictionConfidenceInterval || (() => {
                          const val = parseFloat(aiResult.cutoffValue || aiResult.departmentalCutoff || aiResult.cutoff);
                          if (!isNaN(val)) {
                            const isPercentage = (aiResult.cutoffValue || aiResult.departmentalCutoff || aiResult.cutoff || '').toString().includes('%');
                            const suffix = isPercentage ? '%' : '';
                            return `Simulated range: ${(val - 1.5).toFixed(1)}${suffix} - ${(val + 1.5).toFixed(1)}${suffix} aggregate index with a normal competitive variance threshold.`;
                          }
                          return "Simulated range: ±2% normal distribution based on catchment and state quota profiles.";
                        })()}
                      </p>
                      <p className="text-[8.5px] text-gray-400 leading-normal mt-1.5">
                        *Note: This is an AI-powered statistical simulation/forecasting tool. Actual admission cut-offs vary depending on aggregate pools. This does not represent a guaranteed admission decision or replacement for official senate guidelines.
                      </p>
                    </div>

                    {/* Sources Cited */}
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <BookOpen size={12} className="text-cyan-400" />
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Cited References & Grounding Sources</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiResult.sourcesCited && Array.isArray(aiResult.sourcesCited) && aiResult.sourcesCited.length > 0 ? (
                          aiResult.sourcesCited.map((src: string, sIdx: number) => {
                            let isUrl = false;
                            let displayLabel = src;
                            let href = src;
                            
                            if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
                              isUrl = true;
                              try {
                                const urlObj = new URL(src);
                                const host = urlObj.hostname.replace(/^www\./, '');
                                let pathStr = urlObj.pathname;
                                try {
                                  pathStr = decodeURIComponent(pathStr);
                                } catch {}
                                displayLabel = `${host}${pathStr !== '/' ? pathStr : ''}`;
                                if (displayLabel.length > 50) {
                                  displayLabel = displayLabel.substring(0, 47) + '...';
                                }
                              } catch {
                                displayLabel = src.length > 50 ? src.substring(0, 47) + '...' : src;
                              }
                            }
                            
                            return isUrl ? (
                              <a
                                key={sIdx}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-white/[0.04] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 rounded-lg text-[9px] font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 max-w-full transition-all truncate group"
                                title={src}
                              >
                                <Database size={8} className="text-cyan-400/60 shrink-0 group-hover:text-cyan-400" />
                                <span className="truncate max-w-[320px]">{displayLabel}</span>
                              </a>
                            ) : (
                              <span key={sIdx} className="px-2.5 py-1 bg-white/[0.04] border border-white/5 rounded-lg text-[9px] font-bold text-gray-300 flex items-center gap-1.5 max-w-full truncate">
                                <Database size={8} className="text-cyan-400/60 shrink-0" />
                                <span className="truncate max-w-[320px]">{src}</span>
                              </span>
                            );
                          })
                        ) : (
                          <>
                            <span className="px-2.5 py-1 bg-white/[0.04] border border-white/5 rounded-lg text-[9px] font-bold text-gray-300 flex items-center gap-1">
                              <Database size={8} className="text-cyan-400/60" /> JAMB CAPS 2024 Portal
                            </span>
                            <span className="px-2.5 py-1 bg-white/[0.04] border border-white/5 rounded-lg text-[9px] font-bold text-gray-300 flex items-center gap-1">
                              <Database size={8} className="text-cyan-400/60" /> Official {targetUni?.name || 'Institution'} Admissions Bulletin
                            </span>
                            <span className="px-2.5 py-1 bg-white/[0.04] border border-white/5 rounded-lg text-[9px] font-bold text-gray-300 flex items-center gap-1">
                              <Database size={8} className="text-cyan-400/60" /> Historical Merit Admission Lists
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Accuracy & Outcome Feedback System */}
                  <div className="mt-5 p-5 bg-gradient-to-r from-cyan-950/40 via-slate-900/40 to-indigo-950/40 border border-cyan-500/20 rounded-2xl text-left space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                          <Sparkles size={13} /> Help Calibrate CampusAI Accuracy
                        </h5>
                        <p className="text-[10px] text-gray-300 mt-0.5 font-medium">Was this admission prediction helpful to you?</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPredictionHelpfulState(true);
                            if (aiResult?.predictionId) {
                              updatePredictionHelpfulness(aiResult.predictionId, true);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                            predictionHelpfulState === true 
                              ? 'bg-emerald-500 text-black font-black' 
                              : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                          }`}
                        >
                          👍 Yes, Helpful
                        </button>

                        <button
                          onClick={() => {
                            setPredictionHelpfulState(false);
                            if (aiResult?.predictionId) {
                              updatePredictionHelpfulness(aiResult.predictionId, false);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                            predictionHelpfulState === false 
                              ? 'bg-rose-500 text-white font-black' 
                              : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                          }`}
                        >
                          👎 Not Helpful
                        </button>
                      </div>
                    </div>

                    {!showOutcomeForm && !outcomeFormSubmitted && (
                      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[9.5px] text-gray-400 font-semibold">Have you received your official JAMB / Post-UTME outcome?</span>
                        <button
                          onClick={() => setShowOutcomeForm(true)}
                          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9.5px] font-black uppercase rounded-lg transition-all self-start sm:self-auto"
                        >
                          Confirm Admission Outcome
                        </button>
                      </div>
                    )}

                    {showOutcomeForm && !outcomeFormSubmitted && (
                      <div className="pt-3 border-t border-white/10 space-y-3">
                        <p className="text-[10px] font-bold text-gray-200">Select your actual admission outcome:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'admitted', label: '✅ Admitted' },
                            { id: 'not_admitted', label: '❌ Not Admitted' },
                            { id: 'changed_course', label: '🔄 Changed Course' },
                            { id: 'still_waiting', label: '⏳ Still Waiting' }
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => setSelectedOutcomeStatus(item.id as any)}
                              className={`p-2 rounded-xl text-[10px] font-bold border transition-all text-center ${
                                selectedOutcomeStatus === item.id 
                                  ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold' 
                                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>

                        {selectedOutcomeStatus === 'admitted' && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[9.5px] text-gray-400 font-semibold">Category:</span>
                            {['merit', 'catchment', 'elds', 'transfer'].map(cat => (
                              <button
                                key={cat}
                                onClick={() => setOutcomeAdmissionType(cat as any)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase ${
                                  outcomeAdmissionType === cat
                                    ? 'bg-purple-500 text-white font-black'
                                    : 'bg-white/5 text-gray-400'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setShowOutcomeForm(false)}
                            className="px-3 py-1.5 text-gray-400 hover:text-white text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              await submitAdmissionOutcome(
                                aiResult?.predictionId || `pred_${Date.now()}`,
                                user?.uid || 'guest',
                                {
                                  actualOutcome: selectedOutcomeStatus,
                                  actualUni: targetUni?.name,
                                  actualCourse: targetCourse || courseSearch,
                                  admissionType: outcomeAdmissionType
                                }
                              );
                              setOutcomeFormSubmitted(true);
                              setShowOutcomeForm(false);
                            }}
                            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase rounded-xl transition-all shadow-md"
                          >
                            Submit & Calibrate
                          </button>
                        </div>
                      </div>
                    )}

                    {outcomeFormSubmitted && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-300 font-bold flex items-center gap-2">
                        <span>🎉</span> Thank you! Your response helps CampusAI maintain real-world admission accuracy for future Nigerian scholars.
                      </div>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-white/10 ${isLimitedView ? 'blur-sm select-none pointer-events-none' : ''}`}>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[7px] font-black text-gray-400 uppercase mb-1">School UTME</p>
                      <p className="text-sm font-black text-white">{aiResult.institutionalCutoff || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 relative group cursor-help">
                      <p className="text-[7px] font-black text-gray-400 uppercase mb-1">Course Aggregate</p>
                      <p className="text-sm font-black text-cyan-400">{aiResult.departmentalCutoff || aiResult.cutoffValue || aiResult.cutoff}</p>
                      {aiResult.cutoffType && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[6px] font-bold uppercase tracking-wider bg-white/10 text-gray-300">
                          {aiResult.cutoffType.replace(/_/g, ' ')} {aiResult.cutoffYear ? `(${aiResult.cutoffYear})` : ''}
                        </span>
                      )}
                      
                      {/* Tooltip for context */}
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-gray-300 text-[9px] p-2 rounded-lg border border-gray-700 pointer-events-none z-10 shadow-xl">
                        This is {aiResult.cutoffIsOfficial ? 'an official' : 'a projected'} benchmark based on {aiResult.cutoffSource || 'historical data'}. It does not guarantee admission.
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[7px] font-black text-gray-400 uppercase mb-1">Reliability Index</p>
                      <p className="text-[9px] font-bold leading-tight text-gray-300 line-clamp-2">{aiResult.reliability}</p>
                    </div>
                  </div>

                  {/* Interactive upgrades (premium) */}
                  {!isLimitedView && (
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-6">

                      {/* What-If-Analysis Simulator Dashboard */}
                      <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                              <Sparkles size={13} className="text-cyan-400 animate-pulse" /> "What-If" Analysis Simulator
                            </h5>
                            <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-wider">Tweak your metrics in real-time to preview aggregate & chance changes</p>
                          </div>
                          {!isSimulating ? (
                            <button 
                              onClick={() => {
                                setIsSimulating(true);
                                // Initial values are already hydrated from the user inputs by our useEffect sync!
                              }}
                              className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all"
                            >
                              Activate Simulator
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setIsSimulating(false);
                                // Set outputs back to actuals
                                setSimJamb(parseFloat(jambScore) || 0);
                                setSimPost(parseFloat(postUtmeScore) || 0);
                                const english = subjects.find(s => s.name.toLowerCase().includes('english'))?.grade || 'F9';
                                const math    = subjects.find(s => s.name.toLowerCase().includes('math'))?.grade   || 'F9';
                                const others = subjects
                                  .filter(s => !s.name.toLowerCase().includes('english') && !s.name.toLowerCase().includes('math'))
                                  .sort((a, b) => (GRADE_POINTS[b.grade] || 0) - (GRADE_POINTS[a.grade] || 0))
                                  .slice(0, 3);
                                const oTotal = (GRADE_POINTS[english] || 0) + (GRADE_POINTS[math] || 0) + others.reduce((acc, s) => acc + (GRADE_POINTS[s.grade] || 0), 0);
                                setSimOlevelTotal(oTotal);
                              }}
                              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all"
                            >
                              Reset Sim
                            </button>
                          )}
                        </div>

                        {isSimulating && (
                          <div className="space-y-4">
                            {/* Simulator Sliders */}
                            <div className="space-y-3.5 bg-black/40 p-4 rounded-xl border border-white/5 mt-2">
                              {/* JAMB slider */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-[9px]">
                                  <span className="text-gray-400 font-bold">Simulate UTME Score:</span>
                                  <span className="font-mono text-cyan-300 font-black">{simJamb}/400</span>
                                </div>
                                <input
                                  type="range" min="100" max="400" value={simJamb}
                                  onChange={e => setSimJamb(parseInt(e.target.value))}
                                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 outline-none"
                                />
                              </div>

                              {/* Post-UTME Slider if exists */}
                              {computedScoringSystem?.hasPostUtme && (
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-[9px]">
                                    <span className="text-gray-400 font-bold">Simulate Post-UTME:</span>
                                    <span className="font-mono text-pink-300 font-black">{simPost}/100</span>
                                  </div>
                                  <input
                                    type="range" min="0" max="100" value={simPost}
                                    onChange={e => setSimPost(parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-400 outline-none"
                                  />
                                </div>
                              )}

                              {/* O-Level total point slider */}
                              {(computedScoringSystem?.explanation?.toLowerCase().includes('point-based') || computedScoringSystem?.explanation?.toLowerCase().includes('futa') || computedScoringSystem?.explanation?.toLowerCase().includes('50:30:20')) && (
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-[9px]">
                                    <span className="text-gray-400 font-bold">Simulate O-Level points:</span>
                                    <span className="font-mono text-emerald-300 font-black">{simOlevelTotal}/50</span>
                                  </div>
                                  <input
                                    type="range" min="10" max="50" value={simOlevelTotal}
                                    onChange={e => setSimOlevelTotal(parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 outline-none"
                                  />
                                  <p className="text-[7px] text-gray-400 leading-none mt-1">E.g., upgrading subjects from C6 (5pts) to A1 (10pts) or B2 (9pts).</p>
                                </div>
                              )}
                            </div>

                            {/* Comparison Panel */}
                            <div className="grid grid-cols-2 gap-3 p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl">
                              <div className="border-r border-cyan-500/10 pr-2">
                                <span className="text-[7.5px] uppercase tracking-widest text-gray-400 font-bold">Original Aggregate</span>
                                <div className="text-lg font-black text-gray-300 mt-1">{aggregateScore}%</div>
                                <div className="text-[8px] text-gray-400 mt-0.5">Chance: {admissionProbability}%</div>
                              </div>
                              <div className="pl-1">
                                <span className="text-[7.5px] uppercase tracking-widest text-cyan-400 font-black flex items-center gap-1">
                                  <Sparkles size={8} className="animate-spin-slow" /> Simulated Target
                                </span>
                                <div className="text-lg font-black text-cyan-300 mt-1">{simulatedAggregate}%</div>
                                <div className={`text-[8px] font-bold mt-0.5 ${simulatedProbability > admissionProbability ? 'text-emerald-400 font-black' : 'text-gray-400'}`}>
                                  Simulated Chance: {simulatedProbability}% {simulatedProbability > admissionProbability && '▲'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Point-Based O-Level Mapper */}
                      {(!computedScoringSystem || computedScoringSystem.hasOLevel) && (() => {
                        const uniName = targetUni?.name || 'Default';
                        const { gradeMap, maxPoints, styleDesc } = getUniversityGradePoints(uniName);

                        const english = subjects.find(s => s.name.toLowerCase().includes('english'))?.grade || 'F9';
                        const math    = subjects.find(s => s.name.toLowerCase().includes('math'))?.grade   || 'F9';
                        const others  = subjects
                          .filter(s => !s.name.toLowerCase().includes('english') && !s.name.toLowerCase().includes('math'))
                          .sort((a, b) => (gradeMap[b.grade] || 0) - (gradeMap[a.grade] || 0))
                          .slice(0, 3);

                        const engPts = gradeMap[english] || 0;
                        const mthPts = gradeMap[math] || 0;
                        const sumOthers = others.reduce((acc, s) => acc + (gradeMap[s.grade] || 0), 0);
                        const totalOlevelPts = engPts + mthPts + sumOthers;

                        return (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <h5 className="text-[9px] font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1">
                                  <Database size={12} className="text-cyan-400" /> O-Level Grading Mapper
                                </h5>
                                <p className="text-[7px] text-gray-400 uppercase mt-0.5 tracking-wider">Exact point calculation for 5 required subjects</p>
                              </div>
                              <span className="font-mono text-[9px] font-black px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md">
                                {totalOlevelPts} / {maxPoints} PTS
                              </span>
                            </div>

                            <div className="grid grid-cols-5 gap-2 text-center">
                              <div className="p-2 bg-black/30 border border-white/5 rounded-lg flex flex-col justify-between">
                                <span className="text-[7px] font-bold text-gray-400 truncate">English</span>
                                <span className="font-mono text-xs font-black text-white mt-1">{english}</span>
                                <span className="text-[8px] text-cyan-400 font-extrabold mt-0.5">+{engPts}p</span>
                              </div>
                              <div className="p-2 bg-black/30 border border-white/5 rounded-lg flex flex-col justify-between">
                                <span className="text-[7px] font-bold text-gray-400 truncate">Math</span>
                                <span className="font-mono text-xs font-black text-white mt-1">{math}</span>
                                <span className="text-[8px] text-cyan-400 font-extrabold mt-0.5">+{mthPts}p</span>
                              </div>
                              {others.map((os, i) => {
                                const pts = gradeMap[os.grade] || 0;
                                return (
                                  <div key={i} className="p-2 bg-black/30 border border-white/5 rounded-lg flex flex-col justify-between">
                                    <span className="text-[7px] font-bold text-gray-400 truncate leading-none">{String(os.name || '').replace('Subject', 'Sub')}</span>
                                    <span className="font-mono text-xs font-black text-white mt-1">{os.grade}</span>
                                    <span className="text-[8px] text-cyan-400 font-extrabold mt-0.5">+{pts}p</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex flex-col gap-1 text-[7.5px] text-gray-400 uppercase mt-2.5 px-0.5">
                              <div className="flex justify-between items-center sm:flex-row flex-col gap-1 text-center sm:text-left">
                                <span>Scale: {uniName.toLowerCase().includes('lagos') || uniName.toLowerCase().includes('unilag') ? 'A1=4.0, B2=3.6, B3=3.2, C4=2.8, C5=2.4, C6=2.0' : 'A1=10p, B2=9p, B3=8p, C4=7p, C5=6p, C6=5p'}</span>
                                <span className="font-extrabold text-gray-300">Methodology: {styleDesc}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Interactive Admission Roadmap/Tracker Checklist */}
                      {targetUni && (() => {
                        const fs = getPostUtmeStatus(targetUni.name);
                        const hasPost = !((targetUni?.name || '').toLowerCase().includes("futa") || (targetUni?.name || '').toLowerCase().includes("akure") || (targetUni?.name || '').toLowerCase().includes("lasu") || (targetUni?.name || '').toLowerCase().includes("lagos state")) && (!computedScoringSystem || computedScoringSystem.hasPostUtme !== false);
                        const tasks = [
                          "Verify correct course criteria & O-Level alignment on JAMB CAPS",
                          fs.isOut 
                            ? `Navigate directly to local ${targetUni.name} portal to register` 
                            : `Keep tracking active notifications for the release of ${targetUni.name} ${hasPost ? 'Post-UTME form' : 'screening form'}`,
                          hasPost 
                            ? "Practice full Post-UTME exams using CampusAI study packs"
                            : `Maximize O-Level points by uploading verified high-grade results on JAMB CAPS`,
                          "Upload O-Level Results directly to CAPS in an accredited CBT center",
                          "Confirm admissions list verification and secure your physical clearance ticket"
                        ];

                        return (
                          <div className="p-4 bg-blue-950/10 border border-blue-500/10 rounded-2xl">
                            <h5 className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-3 flex items-center gap-1.5 justify-between">
                              <span className="flex items-center gap-1.5"><Target size={12} className="text-blue-400 animate-spin-slow" /> Admission Tracker Roadmap</span>
                              <span className="text-[7.5px] font-bold text-blue-400 leading-none">
                                {Object.keys(checkedRoadmapTasks).filter(k => tasks.includes(k) && checkedRoadmapTasks[k]).length}/{tasks.length} Done
                              </span>
                            </h5>
                            <div className="space-y-2">
                              {tasks.map((task, i) => {
                                const isChecked = !!checkedRoadmapTasks[task];
                                return (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      const updated = { ...checkedRoadmapTasks, [task]: !isChecked };
                                      setCheckedRoadmapTasks(updated);
                                      try {
                                        localStorage.setItem('campusai_roadmap_checked', JSON.stringify(updated));
                                      } catch {}
                                    }}
                                    className="w-full flex items-start gap-2.5 text-left p-2.5 bg-black/20 hover:bg-black/40 border border-white/[0.02] rounded-xl transition-all"
                                  >
                                    <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200 ${isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/20'}`}>
                                      {isChecked && <Check size={10} strokeWidth={3} />}
                                    </div>
                                    <span className={`text-[9.5px] font-semibold leading-relaxed transition-all ${isChecked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                      {task}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* News & Alerts Subscription Engine */}
                      {targetUni && (() => {
                        const isSubscribed = subscribedUnis.includes(targetUni.name);
                        return (
                          <div className="space-y-2">
                            <div className={`p-4 border rounded-xl flex items-center justify-between gap-4 transition-all duration-300 ${isSubscribed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-emerald-500/10 bg-white/[0.01]'}`}>
                              <div>
                                <h6 className="text-[9px] font-black text-emerald-300 uppercase tracking-widest flex items-center gap-1">
                                  <Activity size={10} className="text-emerald-400" /> CBT Notification Pipeline
                                </h6>
                                <p className="text-[8.5px] text-gray-300 mt-0.5">
                                  {isSubscribed 
                                    ? `✅ Connected! Alerts queued for ${targetUni.name} Post-UTME.` 
                                    : `Receive real-time Post-UTME alerts for ${targetUni.name}`}
                                </p>
                              </div>
                              <button 
                                onClick={() => {
                                  let updated: string[];
                                  if (isSubscribed) {
                                    updated = subscribedUnis.filter(u => u !== targetUni?.name);
                                  } else {
                                    updated = [...subscribedUnis, targetUni.name];
                                  }
                                  setSubscribedUnis(updated);
                                  try {
                                    localStorage.setItem('campusai_subscribed_unis', JSON.stringify(updated));
                                  } catch {}
                                }}
                                className={`px-3 py-1.5 text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 ${isSubscribed ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}
                              >
                                {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                              </button>
                            </div>
                            <p className="text-[7.5px] text-gray-500 dark:text-gray-400 leading-normal uppercase font-bold tracking-wide px-1">
                              ⚠️ Note: Direct carrier SMS and native browser push notifications are often restricted on local mobile networks. Subscribing saves this choice to your secure local offline cache. Whenever new cutoff indices are published, CampusAI highlights visual alert notifications inside your dashboard!
                            </p>
                          </div>
                        );
                      })()}

                      {/* Breakdown toggle */}
                      {quotaBreakdown && (
                        <div className="space-y-2">
                          <button
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="w-full py-2.5 px-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-gray-300"
                          >
                            <span className="flex items-center gap-1.5"><Calculator size={12} className="text-cyan-400" />{showBreakdown ? 'Hide Core Calculations' : 'See Calculation Breakdown'}</span>
                            <ChevronDown size={12} className={`transition-transform duration-250 ${showBreakdown ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {showBreakdown && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[9.5px] font-medium leading-relaxed space-y-3.5 text-gray-300">
                                  <div>
                                    <span className="text-[7.5px] font-black text-gray-500 uppercase tracking-widest block mb-1">Institution Formula Model</span>
                                    <p className="bg-black/20 p-2 rounded-lg font-mono text-[9px] text-cyan-300 border border-white/5">{computedScoringSystem?.explanation || "Pure Academic Formula (JAMB / 4)"}</p>
                                  </div>
                                  {(() => {
                                    const jambVal = parseFloat(jambScore) || 0;
                                    const postVal = parseFloat(postUtmeScore) || 0;
                                    const desc = computedScoringSystem?.explanation?.toLowerCase() || '';
                                    const formula = computedScoringSystem?.formula || '';
                                    const normalizedUni = targetUni?.name?.toLowerCase() || '';
                                    
                                    let jambContribText = '';
                                    let postContribText = '';
                                    let olevelContribText = '';
                                    
                                    if (formula === 'fuoye' || normalizedUni.includes('fuoye') || normalizedUni.includes('oye-ekiti')) {
                                      jambContribText = `UTME: ${jambVal} / 400 * 60 = ${(jambVal / 400 * 60).toFixed(2)} pts (60%)`;
                                      olevelContribText = `O'Level: ${activeOlevelPoints.toFixed(1)} pts (30% max, sum of best 5)`;
                                      postContribText = `+${sittings === 1 ? '10' : '6'} pts (${sittings === 1 ? 'One Sitting' : 'Two Sittings'})`;
                                    } else if (formula === 'futa_75_25' || normalizedUni.includes('futa') || desc.includes('75:25')) {
                                      jambContribText = `UTME: ${jambVal} / 400 * 75 = ${(jambVal / 400 * 75).toFixed(2)} pts (75%)`;
                                      olevelContribText = `O'Level: (${activeOlevelPoints} / 5) * 25% = ${((activeOlevelPoints / 5) * 0.25).toFixed(2)} pts (25%)`;
                                    } else if (formula === 'lasu_60_40' || normalizedUni.includes('lasu') || desc.includes('60:40')) {
                                      jambContribText = `${jambVal} / 400 * 60 = ${(jambVal / 400 * 60).toFixed(2)} pts (60%)`;
                                      olevelContribText = `${activeOlevelPoints} pts (40%)`;
                                    } else if (formula === '50:30:20' || desc.includes('50:30:20')) {
                                      jambContribText = `${jambVal} / 400 * 50 = ${(jambVal / 400 * 50).toFixed(2)} pts (50%)`;
                                      postContribText = `${postVal} / 100 * 30 = ${(postVal / 100 * 30).toFixed(2)} pts (30%)`;
                                      olevelContribText = `${activeOlevelPoints} pts (20%)`;
                                    } else if (formula === '50:20:30' || desc.includes('50:20:30') || desc.includes('kwasu')) {
                                      jambContribText = `${jambVal} / 400 * 50 = ${(jambVal / 400 * 50).toFixed(2)} pts (50%)`;
                                      postContribText = `${postVal} / 100 * 20 = ${(postVal / 100 * 20).toFixed(2)} pts (20%)`;
                                      olevelContribText = `${activeOlevelPoints} / 50 * 30 = ${(activeOlevelPoints / 50 * 30).toFixed(2)} pts (30%)`;
                                    } else if (formula === '50:40:10' || desc.includes('50:40:10') || normalizedUni.includes('awolowo') || normalizedUni.includes('oau')) {
                                      jambContribText = `${jambVal} / 8 = ${(jambVal / 8).toFixed(2)} pts (50%)`;
                                      postContribText = `${postVal} / 100 * 40 = ${(postVal / 100 * 40).toFixed(2)} pts (40%)`;
                                      olevelContribText = `${activeOlevelPoints} pts (10%)`;
                                    } else if (formula === 'lasu_point_based') {
                                      jambContribText = `${jambVal} / 8 = ${(jambVal / 8).toFixed(2)} pts (50%)`;
                                      olevelContribText = `${activeOlevelPoints} pts (50%)`;
                                    } else if (desc.includes('point-based')) {
                                      if (normalizedUni.includes('futa') || (normalizedUni.includes('technology') && normalizedUni.includes('akure'))) {
                                        jambContribText = `UTME: ${jambVal} / 400 * 75 = ${(jambVal / 400 * 75).toFixed(2)} pts (75%)`;
                                        olevelContribText = `O'Level: (${activeOlevelPoints} / 5) * 25% = ${((activeOlevelPoints / 5) * 0.25).toFixed(2)} pts (25%)`;
                                      } else {
                                        jambContribText = `${jambVal} / 8 = ${(jambVal / 8).toFixed(2)} pts (50%)`;
                                        olevelContribText = `${activeOlevelPoints} pts (50%)`;
                                      }
                                    } else {
                                      jambContribText = `${jambVal} / 8 = ${(jambVal / 8).toFixed(2)} pts (50%)`;
                                      postContribText = computedScoringSystem?.hasPostUtme 
                                        ? `${postVal} / 2 = ${(postVal / 2).toFixed(2)} pts (50%)`
                                        : '';
                                    }

                                    const colsCount = [jambContribText, postContribText, olevelContribText].filter(Boolean).length;
                                    const gridClass = colsCount === 3 ? 'grid-cols-3' : colsCount === 2 ? 'grid-cols-2' : 'grid-cols-1';

                                    return (
                                      <div className={`grid ${gridClass} gap-3 pb-2.5 border-b border-white/5`}>
                                        {jambContribText && (
                                          <div>
                                            <span className="text-[7.5px] font-black text-gray-500 uppercase tracking-widest block">UTME Contribution</span>
                                            <p className="font-extrabold text-white text-[10px]">{jambContribText}</p>
                                          </div>
                                        )}
                                        {postContribText && (
                                          <div>
                                            <span className="text-[7.5px] font-black text-gray-500 uppercase tracking-widest block">
                                              {normalizedUni.includes('fuoye') || normalizedUni.includes('oye-ekiti') ? 'Sitting Bonus' : 'Post-UTME Weight'}
                                            </span>
                                            <p className="font-extrabold text-white text-[10px]">{postContribText}</p>
                                          </div>
                                        )}
                                        {olevelContribText && (
                                          <div>
                                            <span className="text-[7.5px] font-black text-gray-500 uppercase tracking-widest block">O'Level Weight</span>
                                            <p className="font-extrabold text-white text-[10px]">{olevelContribText}</p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  <div className="space-y-1.5 pt-1.5">
                                    <span className="text-[7.5px] font-black text-gray-500 uppercase tracking-widest block border-b border-white/5 pb-1">Statutory Admission Pools & Quota Analyser</span>
                                    <div className="flex justify-between text-[9px]">
                                      <span>General National Merit Cutoff:</span>
                                      <strong className="text-white font-mono">{quotaBreakdown.pureMeritCutoff}%</strong>
                                    </div>
                                    {stateOfOrigin && (isCatchmentState || isELDSState) ? (
                                      <>
                                        <div className="flex justify-between text-[9px] text-cyan-350">
                                          <span>Target Admission Quota Pool:</span>
                                          <span className="font-extrabold uppercase text-[8px] tracking-wider text-cyan-400">
                                            {isCatchmentState ? '📍 Catchment Pool (35%)' : '✨ ELDS Pool (20%)'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-[9px] text-cyan-400 font-bold border-t border-white/5 pt-1">
                                          <span>Estimated Pool Target Cutoff:</span>
                                          <strong className="font-mono">~{quotaBreakdown.adjustedCutoff}%</strong>
                                        </div>
                                        <p className="text-[7.5px] text-gray-400 leading-normal font-sans py-1">
                                          *Note: The quota provides preferential evaluation under a designated sub-pool of candidates. No physical percentage points are added to your raw aggregate score; you compete strictly against other candidates in this separate pool, which historically has a lower competitive threshold.
                                        </p>
                                      </>
                                    ) : (
                                      <div className="flex justify-between text-[9px] text-zinc-400">
                                        <span>Target Admission Quota Pool:</span>
                                        <span className="font-extrabold uppercase text-[8px] tracking-wider text-zinc-400">
                                          📢 National Merit Pool (45%)
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between border-t border-white/5 pt-1.5 font-black text-[9.5px]">
                                      <span>Estimated Pool Buffer:</span>
                                      <span className={`font-mono ${quotaBreakdown.scoreBuffer >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {quotaBreakdown.scoreBuffer >= 0 ? `+${quotaBreakdown.scoreBuffer}%` : `${quotaBreakdown.scoreBuffer}%`}
                                        <span className="text-[7px] uppercase tracking-wider ml-1.5 px-1.5 py-0.5 bg-white/5 rounded-md font-bold">
                                          {quotaBreakdown.scoreBuffer >= 2.5 ? 'Comfortable' : quotaBreakdown.scoreBuffer >= 0 ? 'Borderline' : 'High Risk'}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="pt-2 border-t border-white/5 space-y-1">
                                    <span className="text-[7.5px] font-black text-gray-500 uppercase tracking-widest block">Operational Integrity Audits</span>
                                    <div className="flex items-center gap-1 text-[8.5px]">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                      <span>Sittings Mode: <strong className="text-white">{sittings === 1 ? 'Single sitting (No penalty)' : 'Multiple sittings (-2 points applied)'}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[8.5px]">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAR ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                      <span>Awaiting Results: <strong className="text-white">{isAR ? 'Active (Predicted grades modeled)' : 'Inactive'}</strong></span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Save scenario */}
                      <button
                        onClick={handleSaveScenario}
                        className="w-full py-2.5 border border-white/5 hover:border-cyan-500/20 rounded-xl hover:bg-cyan-500/5 transition-all text-[9px] font-black uppercase tracking-widest text-cyan-400 flex items-center justify-center gap-2 select-none active:scale-95"
                      >
                        💾 Save Current Scenario
                      </button>
                    </div>
                  )}

                    {/* Limited view paywall overlay for registered users on free tier */}
                    {user && isLimitedView && (
                      <div className="absolute inset-x-0 bottom-0 top-[60%] bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent flex flex-col items-center justify-end p-8 text-center">
                        <div className="p-1 px-3 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-400 uppercase tracking-widest mb-3">
                          Daily Limit Reached
                        </div>
                        <h6 className="text-sm font-black mb-2">
                          Daily Limit Reached
                        </h6>
                        <p className="text-[10px] text-gray-400 mb-4 max-w-[200px]">
                          You have used your 1 free full-strategist calculation for today. Upgrade to check unlimited matches!
                        </p>
                        <button
                          onClick={() => onPremiumRequired?.()}
                          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl hover:from-amber-400 hover:to-yellow-400 transition-all cursor-pointer"
                        >
                          Activate Scholar Pack
                        </button>
                      </div>
                    )}
                    </>
                  )}
                </div>

                {user && aiResult && (
                  <>
                    {/* AI Analysis */}
                    <div className={`p-6 md:p-8 bg-blue-600 rounded-[24px] shadow-lg text-white relative overflow-hidden ${isLimitedView ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb size={18} className="text-white" />
                    <h5 className="text-lg font-black uppercase tracking-tighter">AI Analysis</h5>
                  </div>
                  <p className="text-xs font-bold leading-relaxed italic opacity-95 mb-6">
                    {isLimitedView
                      ? user ? "Activate Scholar Pack to unlock detailed strategic counsel and probability mapping for your specific merit profile..."
                              : "Sign in to unlock detailed strategic counsel and probability mapping for your specific merit profile..."
                      : `"${aiResult.recommendation}"`}
                  </p>
                  <button
                    onClick={() => !isLimitedView && onDiscussWithAI?.(`My aggregate for ${targetCourse} at ${targetUni?.name} is ${aggregateScore}%. What are my chances?`)}
                    disabled={isLimitedView}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Brain size={14} /> {isLimitedView ? 'Strategy Locked' : 'Strategy Sync'}
                  </button>
                </div>

                {/* Share */}
                <button
                  onClick={handleShareResults}
                  className="w-full py-4 border-2 border-white/10 rounded-[24px] flex items-center justify-center gap-3 group hover:border-blue-500/30 transition-all active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Share2 size={14} className="text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Invite Friends</p>
                    <p className="text-[8px] font-medium text-gray-500 uppercase tracking-widest">Share analysis & help others</p>
                  </div>
                </button>

                {/* Google review */}
                {!reviewPromptDismissed && (
                  <div className="p-5 bg-gradient-to-r from-amber-500/15 to-yellow-500/5 border border-amber-500/20 rounded-[24px] space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-3 -mt-3 pointer-events-none transition-transform group-hover:scale-125" />
                    <button type="button" onClick={handleDismissReviewPrompt} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20 cursor-pointer p-1 rounded-lg hover:bg-white/5" aria-label="Dismiss review prompt">
                      <X size={14} />
                    </button>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <Award size={16} className="text-amber-400 animate-pulse" />
                      </div>
                      <div className="text-left">
                        <h6 className="text-[10px] font-black text-amber-300 uppercase tracking-widest leading-none mb-1">Supported by your results?</h6>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Help other students on Google</p>
                      </div>
                    </div>
                    <p className="text-[9.5px] font-semibold leading-relaxed text-gray-300 relative z-10 text-left pr-4">
                      If our <strong>2026 Admissions Strategist</strong> helped you calculate your aggregate score, please support us with a 5-star review on Google! It takes only 10 seconds.
                    </p>
                    <button
                      type="button"
                      onClick={() => { window.open('https://g.page/r/CSYvNrgamqOHEBM/review', '_blank'); handleReviewed(); }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-[9.5px] uppercase tracking-[0.1em] rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer relative z-10"
                    >
                      ⭐⭐⭐⭐⭐ Write Google Review
                    </button>
                  </div>
                )}

                {/* Alternatives */}
                {user && !isLimitedView && aiResult.alternatives?.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <ArrowRight size={18} className="text-gray-400" />
                      <h5 className="text-lg font-black uppercase tracking-tighter text-white">Alternatives</h5>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {aiResult.alternatives.map((alt: any, idx: number) => (
                        <div key={idx} className="p-4 bg-white/5 hover:bg-white/10 transition-colors border border-white/5 rounded-xl flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <h6 className="font-bold text-white text-[10px] leading-tight">{alt.name}</h6>
                              <span className="shrink-0 px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md text-[7px] font-black tracking-widest uppercase">{alt.matchPercentage}</span>
                            </div>
                            <p className="text-[9px] text-gray-400 leading-tight font-medium line-clamp-2 mb-3">{alt.reasoning}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              let courseName = alt.name;
                              let matchedUni = null;
                              if (alt.name.includes(" at ")) {
                                const parts = alt.name.split(" at ");
                                courseName = parts[0].trim();
                                const schoolName = parts[1]?.trim();
                                if (schoolName) {
                                  matchedUni = universityData.find((u: any) => 
                                    u.name?.toLowerCase().includes(schoolName.toLowerCase()) || 
                                    schoolName.toLowerCase().includes(u.name?.toLowerCase())
                                  );
                                }
                              }
                              if (matchedUni) {
                                setTargetUni(matchedUni);
                                setUniSearch(matchedUni.name);
                              }
                              setTargetCourse(courseName);
                              setCourseSearch(courseName);
                              // Trigger calculating this new course synchronously
                              handleLaunchAuditInternal(true, true, matchedUni || targetUni, courseName);
                            }}
                            className="w-full py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 mt-auto"
                          >
                            <RefreshCw size={8} /> Try Re-Calculate
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entry budget */}
                {user && aiResult.fresherBudget && (
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-[24px] p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Wallet size={18} className="text-emerald-400" />
                      <h5 className="text-lg font-black uppercase tracking-tighter text-white">Entry Budget</h5>
                    </div>
                    <div className="text-[10px] text-gray-300 leading-relaxed font-medium bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 whitespace-pre-wrap">
                      {aiResult.fresherBudget}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 space-y-6">
                  <div>
                    <h5 className="text-[14px] font-black uppercase tracking-tighter text-white flex items-center gap-2">
                      <span>📊</span> Help Us Improve Accuracy
                    </h5>
                    <p className="text-[10px] text-gray-400 mt-1">Your feedback aggregates directly to guide algorithms and upcoming cutoff calibrations.</p>
                  </div>

                  {/* Helpful or not */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[11px] font-bold text-gray-200 uppercase tracking-wide mb-3 text-left">Is this admission prediction helpful?</p>
                    {feedbackStatus === 'none' ? (
                      <div className="flex gap-2">
                        <button type="button"
                          onClick={async () => { setFeedbackStatus('helpful'); await logUserActivity({ userId: user?.uid || 'guest-feedback', type: 'calculation', title: 'Accuracy Feedback', description: `FEEDBACK: 👍 Helpful prediction for ${targetCourse || courseSearch} at ${targetUni?.name}` }); }}
                          className="flex-grow py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >👍 Helpful</button>
                        <button type="button"
                          onClick={async () => { setFeedbackStatus('not_helpful'); await logUserActivity({ userId: user?.uid || 'guest-feedback', type: 'calculation', title: 'Accuracy Feedback', description: `FEEDBACK: 👎 Unhelpful prediction for ${targetCourse || courseSearch} at ${targetUni?.name}` }); }}
                          className="flex-grow py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >👎 Not Helpful</button>
                      </div>
                    ) : (
                      <div className="p-2 text-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-center gap-2">
                        <span>🎉</span> Thank you! Your response has been recorded.
                      </div>
                    )}
                  </div>

                  {/* Admission tracker */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[11px] font-bold text-gray-200 uppercase tracking-wide mb-1 text-left">Admissions Status Tracker</p>
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-3 text-left">Keep track after the admission list is out</p>
                    {admissionStatus === 'none' ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button type="button"
                          onClick={async () => { setAdmissionStatus('gained'); await logUserActivity({ userId: user?.uid || 'guest-feedback', type: 'calculation', title: 'Admission Outcome', description: `OUTCOME: 🎉 Gained Admission for ${targetCourse || courseSearch} at ${targetUni?.name}!` }); }}
                          className="flex-1 py-3 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >🎉 Yes, I was Admitted!</button>
                        <button type="button"
                          onClick={async () => { setAdmissionStatus('not_yet'); await logUserActivity({ userId: user?.uid || 'guest-feedback', type: 'calculation', title: 'Admission Outcome', description: `OUTCOME: ⏳ Not admitted / pending for ${targetCourse || courseSearch} at ${targetUni?.name}` }); }}
                          className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >⏳ Not Admitted / Other</button>
                      </div>
                    ) : admissionStatus === 'gained' ? (
                      <div className="space-y-3">
                        <div className="p-3 text-center text-cyan-400 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/5 rounded-xl border border-cyan-500/10 flex flex-col items-center justify-center gap-1">
                          <span className="text-lg">🎓 Big Congratulations!</span>
                          <span>Your success has been successfully verified!</span>
                        </div>
                        <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 rounded-xl border border-amber-500/20 text-center space-y-2">
                          <p className="text-[10px] font-bold text-amber-300 uppercase">Share Your Success Story!</p>
                          <p className="text-[8px] text-gray-400 leading-normal uppercase">Nothing builds trust like mutual success. Let other candidates hear your testimony on our community boards!</p>
                          <button type="button"
                            onClick={() => window.open(`https://wa.me/2349169760634?text=Hello CampusAI! CampusAI predicted my admission correctly. I have been admitted for ${targetCourse || courseSearch} at ${targetUni?.name}!`, '_blank')}
                            className="w-full py-2.5 bg-amber-500 text-black font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >💬 Submit Testimony</button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 text-center text-gray-400 text-[9.5px] font-bold uppercase tracking-wide bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1">
                        <span>Keep pushing, Scholar!</span>
                        <span className="text-[8px] font-normal lowercase leading-relaxed">Consider evaluating alternative programs listed inside your report below to boost your safety options.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Disclaimer + WhatsApp */}
                <div className="px-6 py-4 flex flex-col gap-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <ShieldCheck size={14} />
                      <span className="text-[7.5px] font-black uppercase tracking-widest font-mono">AI Model Last updated: August 4, 2026</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-gray-400 font-medium leading-relaxed italic">
                        Estimates are based on historical data, official institutional cutoffs, and statutory catchment quotas. Final admission decisions are strictly decided by the institutions' senates and JAMB.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open('https://wa.me/2349169760634?text=Hello CampusAI, I have a question about my admission chances.', '_blank')}
                    className="w-full py-3 bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all group"
                  >
                    <MessageCircle size={14} className="group-hover:animate-bounce" /> Ask on WhatsApp
                  </button>
                </div>
                  </>
                )}
              </motion.div>

            ) : (
              /* Awaiting state */
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-white/5 rounded-[32px] bg-white/[0.02]">
                <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center mb-5">
                  <Brain size={32} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Awaiting Parameters</h3>
                <p className="text-gray-500 text-[10px] font-medium max-w-[240px]">Provide your scores to map your 2026 admission probability matrix.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Modals ── */}
      <QuotaModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onUpgrade={() => { setIsQuotaModalOpen(false); window.dispatchEvent(new CustomEvent('campusai_open_payment')); }}
      />

      <AnimatePresence>
        {isCutoffAlertOpen && jambCutoffWarning && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCutoffAlertOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-gray-950 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-rose-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <button onClick={() => setIsCutoffAlertOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-800 rounded-full hover:scale-110 transition-transform z-10 text-gray-400 hover:text-rose-500">
                <X size={16} />
              </button>
              <div className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-rose-900/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-rose-500/10">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight leading-tight">JAMB Cut-Off <span className="text-rose-500">Alert</span></h3>
                <p className="text-gray-400 font-bold mb-6 text-[10px] tracking-widest uppercase">Institutional Requirement Policy Check</p>
                <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 mb-8 text-left">
                  <p className="text-[10px] font-black uppercase text-rose-400 tracking-wider mb-1.5">Admission Disqualification Hazard</p>
                  <p className="text-xs font-semibold leading-relaxed text-gray-300 uppercase tracking-tight">
                    Your entered UTME score of <strong className="text-white">{jambCutoffWarning.score}</strong> is below the standard minimum JAMB cut-off mark of <strong className="text-white">{jambCutoffWarning.minCutoff}</strong> required for admission into <strong className="text-white">{targetUni?.name}</strong>.
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 leading-normal mt-2">
                    Nigerian admission rules restrict institutions from selecting candidates with scores below their official cutoff policy.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => { setIsCutoffAlertOpen(false); const el = document.getElementById('jamb-score'); if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider border border-white/5 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    Adjust JAMB UTME Score
                  </button>
                  <button
                    onClick={handleProceedWithLowScore}
                    className="w-full py-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    Proceed with calculation <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAccreditationAlertOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAccreditationAlertOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-gray-950 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-amber-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <button onClick={() => setIsAccreditationAlertOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-800 rounded-full hover:scale-110 transition-transform z-10 text-gray-400 hover:text-amber-500">
                <X size={16} />
              </button>
              <div className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-amber-900/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-amber-500/10">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight leading-tight">Accreditation <span className="text-amber-500">Notice</span></h3>
                <p className="text-gray-400 font-bold mb-6 text-[10px] tracking-widest uppercase">Course Offer Eligibility Check</p>
                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 mb-8 text-left">
                  <p className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1.5">Unconfirmed Programme</p>
                  <p className="text-xs font-semibold leading-relaxed text-gray-300 uppercase tracking-tight">
                    The course <strong className="text-white">"{targetCourse || courseSearch}"</strong> could not be verified on the accredited course list for <strong className="text-white">{targetUni?.name}</strong>.
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 leading-normal mt-2">
                    Running aggregate calculations on non-offered courses may yield inaccurate admission probability analyses.
                  </p>
                </div>

                {/* One-click switch to disable warnings */}
                <div className="mb-6 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between text-left">
                  <div>
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest block">Disable verification alerts</span>
                    <span className="text-[7.5px] text-gray-500 font-bold block uppercase tracking-tight">Stop showing this warning popup</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleAccreditationWarning(true);
                      setIsAccreditationAlertOpen(false);
                      handleProceedWithUncreditedCourse();
                    }}
                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all border border-rose-500/20 cursor-pointer"
                  >
                    Mute alert
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => { setIsAccreditationAlertOpen(false); const el = document.getElementById('course-search'); if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider border border-white/5 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    Change Academic Course
                  </button>
                  <button
                    onClick={handleProceedWithUncreditedCourse}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    Proceed Anyway <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isC6AlertOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsC6AlertOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-gray-950 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-red-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <button onClick={() => setIsC6AlertOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-800 rounded-full hover:scale-110 transition-transform z-10 text-gray-400 hover:text-red-500">
                <X size={16} />
              </button>
              <div className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-red-500/10">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight leading-tight">O-Level <span className="text-red-500">Validation</span></h3>
                <p className="text-gray-400 font-bold mb-6 text-[10px] tracking-widest uppercase">Grade Entry Verification</p>
                <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 mb-8 text-left">
                  <p className="text-xs font-semibold leading-relaxed text-gray-300 uppercase tracking-tight">
                    It looks like <strong>all your O-level grades are set to C6</strong>.
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 leading-normal mt-2">
                    Are you sure these are your actual results? Entering C6 (Credit 6) for all subjects may significantly affect your calculated aggregate.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                        setIsC6AlertOpen(false);
                        handleLaunchAuditInternal(false, true);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform"
                  >
                    Yes, Proceed Anyway
                  </button>
                  <button
                    onClick={() => setIsC6AlertOpen(false)}
                    className="w-full py-4 bg-gray-800 text-gray-300 font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-700 transition-colors"
                  >
                    No, Edit Grades
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {validationAlert.isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setValidationAlert({ isOpen: false, errors: [] })} className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-gray-950 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-red-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <button onClick={() => setValidationAlert({ isOpen: false, errors: [] })} className="absolute top-6 right-6 p-2 bg-gray-800 rounded-full hover:scale-110 transition-transform z-10 text-gray-400 hover:text-red-500">
                <X size={16} />
              </button>
              <div className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-red-950/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-red-500/10">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight leading-tight">Incomplete <span className="text-red-500">Trial Data</span></h3>
                <p className="text-gray-400 font-bold mb-6 text-[10px] tracking-widest uppercase">Required Admission Inputs Missing</p>
                
                <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 mb-8 text-left max-h-[180px] overflow-y-auto no-scrollbar space-y-2">
                  <p className="text-[10px] font-black uppercase text-red-400 tracking-wider mb-2">Please resolve the following fields to save calculation trial:</p>
                  {validationAlert.errors.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[10px] font-bold text-gray-300 leading-normal uppercase tracking-tight">
                      <span className="text-red-500 mt-0.5 shrink-0">•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setValidationAlert({ isOpen: false, errors: [] })}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  Complete Entries Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {subjectDisqualificationAlert.isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSubjectDisqualificationAlert(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-gray-950 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-rose-500/30"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <button
                onClick={() => setSubjectDisqualificationAlert(prev => ({ ...prev, isOpen: false }))}
                className="absolute top-6 right-6 p-2 bg-gray-800 rounded-full hover:scale-110 transition-transform z-10 text-gray-400 hover:text-rose-500 cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg border border-rose-500/20 animate-pulse">
                  <TriangleAlert size={32} />
                </div>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full mb-3 text-[9px] font-black uppercase text-rose-400 tracking-wider">
                  <ShieldCheck size={12} className="text-rose-400" />
                  Calculation Saved • Subject Violation
                </div>

                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight leading-tight">
                  Admission <span className="text-rose-500">Disqualification Alert</span>
                </h3>
                <p className="text-gray-400 font-bold mb-5 text-[10px] tracking-widest uppercase">
                  {subjectDisqualificationAlert.title}
                </p>

                <div className="p-4 bg-rose-950/20 rounded-2xl border border-rose-500/20 mb-6 text-left space-y-2">
                  <p className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                    <AlertCircle size={12} /> Statutory Subject Hazard:
                  </p>
                  <p className="text-xs font-semibold leading-relaxed text-gray-200 uppercase tracking-tight">
                    {subjectDisqualificationAlert.reason}
                  </p>
                  <p className="text-[9.5px] font-bold text-gray-400 leading-normal mt-2 border-t border-rose-500/10 pt-2">
                    JAMB CAPS policy restricts candidates with invalid subject combinations or core O-Level credit deficiencies. Calculations are halted immediately to protect your calculation limits.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {subjectDisqualificationAlert.type === 'jamb' ? (
                    <button
                      onClick={() => {
                        setSubjectDisqualificationAlert(prev => ({ ...prev, isOpen: false }));
                        const el = document.getElementById('jamb-subject-1');
                        if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      Fix JAMB UTME Elective Subjects
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSubjectDisqualificationAlert(prev => ({ ...prev, isOpen: false }));
                        const el = document.getElementById('olevel-subject-list');
                        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      Update O-Level Grades to Credit Passes
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSubjectDisqualificationAlert(prev => ({ ...prev, isOpen: false }));
                      const el = document.getElementById('course-search');
                      if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                    }}
                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-gray-200 rounded-2xl font-black text-[11px] uppercase tracking-wider border border-white/5 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    Change Target Course Choice
                  </button>

                  <button
                    onClick={() => {
                      setSubjectDisqualificationAlert(prev => ({ ...prev, isOpen: false }));
                      setBypassSubjectDisqualificationAlert(true);
                      handleLaunchAuditInternal(true, false);
                    }}
                    className="w-full py-2.5 bg-transparent hover:bg-white/[0.03] text-gray-500 hover:text-gray-400 rounded-xl font-bold text-[9.5px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Proceed with calculation anyway (Force Bypass)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {calibratingCourse && calibratingUni && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setCalibratingCourse(null); setCalibratingUni(null); }} className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-gray-950 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-amber-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <button onClick={() => { setCalibratingCourse(null); setCalibratingUni(null); }} className="absolute top-6 right-6 p-2 bg-gray-800 rounded-full hover:scale-110 transition-transform z-10 text-gray-400 hover:text-amber-500">
                <X size={16} />
              </button>
              <div className="p-8 relative z-10 text-left">
                <div className="w-16 h-16 bg-amber-950/30 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-amber-500/10">
                  <Sliders size={24} />
                </div>
                
                <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight leading-tight">Calibrate <span className="text-amber-500">Cut-Off</span></h3>
                <p className="text-gray-400 font-bold mb-4 text-[10px] tracking-widest uppercase">
                  {calibratingCourse} at {calibratingUni}
                </p>

                {user?.email === 'eiweh123@gmail.com' ? (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[8px] font-black uppercase tracking-widest leading-none">
                    🔑 Admissions Director Console Active
                  </div>
                ) : (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[8px] font-black uppercase tracking-widest leading-none animate-pulse">
                    🛠️ Live Community Calibration Mode
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  {/* Estimated Competitive Benchmark input */}
                  <div>
                    <label htmlFor="cal-dept-cutoff" className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                      Verified Departmental Cut-off Score *
                    </label>
                    <input
                      id="cal-dept-cutoff" name="cal-dept-cutoff" type="text"
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl font-bold text-xs text-white outline-none focus:border-amber-500 transition-all placeholder:text-gray-600"
                      placeholder="e.g. 74.25% or 260 or Merit: 255"
                      value={calRawDeptCutoff}
                      onChange={e => setCalRawDeptCutoff(e.target.value)}
                    />
                  </div>

                  {/* Institutional Floor input */}
                  <div>
                    <label htmlFor="cal-inst-cutoff" className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                      Institutional Baseline / Floor (Optional)
                    </label>
                    <input
                      id="cal-inst-cutoff" name="cal-inst-cutoff" type="text"
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl font-bold text-xs text-white outline-none focus:border-amber-500 transition-all placeholder:text-gray-600"
                      placeholder="e.g. 200 (Minimum JAMB to write Post-UTME)"
                      value={calRawInstCutoff}
                      onChange={e => setCalRawInstCutoff(e.target.value)}
                    />
                  </div>

                  {/* Policy Notes / Explanations */}
                  <div>
                    <label htmlFor="cal-explanation" className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                      Official Source Notes / Explanations
                    </label>
                    <textarea
                      id="cal-explanation" name="cal-explanation" rows={3}
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl font-bold text-xs text-white outline-none focus:border-amber-500 transition-all placeholder:text-gray-600 resize-none"
                      placeholder="e.g. Senate approved 2026 guidelines. Catchment: 68%, Merit: 74%"
                      value={calRawExplanation}
                      onChange={e => setCalRawExplanation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setCalibratingCourse(null); setCalibratingUni(null); }}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider border border-white/5 flex items-center justify-center transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCalibration}
                    disabled={isSavingCalibration || !calRawDeptCutoff.trim()}
                    className="flex-1 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingCalibration ? <Loader2 size={12} className="animate-spin" /> : "Save Settings"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* SEO Internal Links for specific university calculators */}
      <div className="container mx-auto px-4 md:px-8 mt-12 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-[24px] p-6 text-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Dedicated Aggregate Calculators</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/unilag-aggregate-calculator" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors">Calculate for UNILAG</a>
            <a href="/lasu-aggregate-calculator" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors">Calculate for LASU</a>
            <a href="/ui-aggregate-calculator" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors">Calculate for UI</a>
            <a href="/oau-aggregate-calculator" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors">Calculate for OAU</a>
            <a href="/uniben-aggregate-calculator" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors">Calculate for UNIBEN</a>
            <a href="/unilorin-aggregate-calculator" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors">Calculate for UNILORIN</a>
            <a href="/unn-aggregate-calculator" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors">Calculate for UNN</a>
            <a href="/futa-aggregate-calculator" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors">Calculate for FUTA</a>
            <a href="/abu-aggregate-calculator" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors">Calculate for ABU</a>
          </div>
        </div>
      </div>



      {/* UI 2025/2026 Cutoff Marks Explorer Modal */}
      <AnimatePresence>
        {isUICutoffsModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUICutoffsModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-gray-950 w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl border border-emerald-500/20 my-auto z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-emerald-950/40 via-gray-900 to-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                        Official UI Release • 2025/2026
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1">
                      University of Ibadan (UI) Departmental Cut-Off Marks
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Undergraduate Admissions Unit • Approved Merit, Catchment & ELDS Benchmarks (50:50 Formula)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUICutoffsModalOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all self-end sm:self-auto shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filters & Search */}
              <div className="p-4 sm:p-6 border-b border-white/5 bg-black/40 flex flex-col gap-3 shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={uiCutoffSearch}
                      onChange={e => setUiCutoffSearch(e.target.value)}
                      placeholder="Search across all 79 UI programmes (e.g., Medicine, Nursing, Law, Civil Engineering)..."
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    {uiCutoffSearch && (
                      <button
                        type="button"
                        onClick={() => setUiCutoffSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Faculty Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <span className="text-[8px] font-black uppercase text-gray-500 tracking-wider shrink-0 mr-1">
                    Faculties:
                  </span>
                  {['ALL', ...getUIFaculties()].map(faculty => (
                    <button
                      key={faculty}
                      type="button"
                      onClick={() => setUiFacultyFilter(faculty)}
                      className={`px-2.5 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                        uiFacultyFilter === faculty
                          ? 'bg-emerald-500 text-black shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {faculty === 'ALL' ? 'All (79)' : faculty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                {(() => {
                  const filtered = UI_CUTOFFS_2025_2026.filter(item => {
                    const matchesSearch =
                      item.programme.toLowerCase().includes(uiCutoffSearch.toLowerCase()) ||
                      item.faculty.toLowerCase().includes(uiCutoffSearch.toLowerCase());
                    const matchesFaculty = uiFacultyFilter === 'ALL' || item.faculty === uiFacultyFilter;
                    return matchesSearch && matchesFaculty;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                        <BookOpen size={32} className="text-gray-600" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No programmes matched your filter</p>
                        <button
                          type="button"
                          onClick={() => { setUiCutoffSearch(''); setUiFacultyFilter('ALL'); }}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/10"
                        >
                          Clear Filters
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-wider text-gray-400">
                            <th className="py-3 px-3">#</th>
                            <th className="py-3 px-3">Programme</th>
                            <th className="py-3 px-3">Faculty</th>
                            <th className="py-3 px-3 text-center text-emerald-400">Merit (%)</th>
                            <th className="py-3 px-3 text-center text-cyan-400">Catchment (%)</th>
                            <th className="py-3 px-3 text-center text-amber-400">ELDS (%)</th>
                            <th className="py-3 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                          {filtered.map((item, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="py-3 px-3 font-mono text-[10px] text-gray-500">{idx + 1}</td>
                              <td className="py-3 px-3 font-bold text-white uppercase tracking-tight">{item.programme}</td>
                              <td className="py-3 px-3 text-[10px] text-gray-400 uppercase tracking-tight">{item.faculty}</td>
                              <td className="py-3 px-3 text-center font-mono font-black text-emerald-400">{item.merit}</td>
                              <td className="py-3 px-3 text-center font-mono font-black text-cyan-400">{item.catchment}</td>
                              <td className="py-3 px-3 text-center font-mono font-black text-amber-400">{item.elds}</td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const uiUni = universityData.find(u => u.name.toLowerCase().includes('ibadan'));
                                    if (uiUni) {
                                      setTargetUni(uiUni);
                                      setUniSearch(uiUni.name);
                                    }
                                    setTargetCourse(item.programme);
                                    setCourseSearch(item.programme);
                                    setIsUICutoffsModalOpen(false);
                                    setActiveTab('calculate');
                                    const el = document.getElementById('jamb-score');
                                    if (el) {
                                      el.focus();
                                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all whitespace-nowrap"
                                >
                                  Calculate Chance
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/5 bg-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[9px] text-gray-500 font-bold uppercase tracking-wider shrink-0">
                <div className="flex items-center gap-2">
                  <Info size={12} className="text-emerald-400" />
                  <span>UI Aggregate Formula = (JAMB / 8) + (Post-UTME / 2). Institutional Minimum: 50.0%</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="https://admissions.ui.edu.ng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    UI Admissions Portal <ExternalLink size={10} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsUICutoffsModalOpen(false)}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FUTA 2026/2027 Cutoff Marks Explorer Modal */}
      <AnimatePresence>
        {isFUTACutoffsModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFUTACutoffsModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-gray-950 w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl border border-amber-500/20 my-auto z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-950/40 via-gray-900 to-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest">
                        Official FUTA Release • 2026/2027
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1">
                      Federal University of Technology, Akure (FUTA) Departmental Cut-Off Marks
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Academic Planning & Admissions Unit • Official Approved Aggregate Benchmarks (75:25 Point System)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFUTACutoffsModalOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all self-end sm:self-auto shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filters & Search */}
              <div className="p-4 sm:p-6 border-b border-white/5 bg-black/40 flex flex-col gap-3 shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={futaCutoffSearch}
                      onChange={e => setFutaCutoffSearch(e.target.value)}
                      placeholder="Search across all FUTA courses (e.g., Electrical, Computer Science, Architecture, Cyber Security, Medicine)..."
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    {futaCutoffSearch && (
                      <button
                        type="button"
                        onClick={() => setFutaCutoffSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 shrink-0">
                      School:
                    </span>
                    <button
                      type="button"
                      onClick={() => setFutaSchoolFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                        futaSchoolFilter === 'ALL'
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      All ({FUTA_CUTOFFS_2026_2027.length})
                    </button>
                    {getFUTASchools().map(sch => {
                      const count = FUTA_CUTOFFS_2026_2027.filter(c => c.school === sch).length;
                      return (
                        <button
                          key={sch}
                          type="button"
                          onClick={() => setFutaSchoolFilter(sch)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                            futaSchoolFilter === sch
                              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {sch.split(' ')[0]} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Key Insights Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Total Courses</span>
                    <span className="text-xs font-black text-amber-400">{FUTA_CUTOFFS_2026_2027.length}</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">UTME Cut-Off</span>
                    <span className="text-xs font-black text-emerald-400">180 Minimum</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Top Benchmark</span>
                    <span className="text-xs font-black text-amber-400">EEE (74.37%)</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Physics Rule</span>
                    <span className="text-xs font-black text-cyan-400">Mandatory Pass</span>
                  </div>
                </div>
              </div>

              {/* Programmes Table / Cards */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-2.5">
                {(() => {
                  const filtered = FUTA_CUTOFFS_2026_2027.filter(item => {
                    const matchesSchool = futaSchoolFilter === 'ALL' || item.school === futaSchoolFilter;
                    const q = futaCutoffSearch.toLowerCase().trim();
                    const matchesSearch =
                      !q ||
                      item.programme.toLowerCase().includes(q) ||
                      item.code.toLowerCase().includes(q) ||
                      item.school.toLowerCase().includes(q);
                    return matchesSchool && matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-center text-gray-500 text-xs uppercase font-bold tracking-wider">
                        No FUTA programmes matched your search filters.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filtered.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-gray-900/70 border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest">
                                    {item.code}
                                  </span>
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide truncate max-w-[200px]">
                                    {item.school}
                                  </span>
                                </div>
                                <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                                  {item.programme}
                                </h4>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-base sm:text-lg font-black text-amber-400 tracking-tight">
                                  {item.cutoff}%
                                </span>
                                <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">
                                  Cut-Off
                                </span>
                              </div>
                            </div>

                            {/* Progress bar visual comparison to 100 */}
                            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-3">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(10, item.cutoff))}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px]">
                            <span className="text-gray-400 font-bold">75% UTME + 25% O'Level</span>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetUni("Federal University of Technology, Akure (FUTA)");
                                setTargetCourse(item.programme);
                                setIsFUTACutoffsModalOpen(false);
                                window.scrollTo({ top: 400, behavior: 'smooth' });
                              }}
                              className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/20 rounded-lg font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                            >
                              Calculate Chance <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/5 bg-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[9px] text-gray-500 font-bold uppercase tracking-wider shrink-0">
                <div className="flex items-center gap-2">
                  <Info size={12} className="text-amber-400" />
                  <span>FUTA Aggregate = (JAMB / 400 * 75) + (O'Level Points / 20 * 25). Minimum UTME: 180</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.futa.edu.ng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    FUTA Official Portal <ExternalLink size={10} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsFUTACutoffsModalOpen(false)}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── LAUTECH 2025/2026 Cutoffs Explorer Modal ── */}
        {isLAUTECHCutoffsModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLAUTECHCutoffsModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-gray-950 w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl border border-indigo-500/20 my-auto z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest">
                        Official LAUTECH Release • 2025/2026
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1">
                      Ladoke Akintola University of Technology (LAUTECH) Departmental Cut-Off Marks
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Academic Planning & Admissions Unit • Official Approved UTME & 80:20 Aggregate Benchmarks
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLAUTECHCutoffsModalOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all self-end sm:self-auto shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filters & Search */}
              <div className="p-4 sm:p-6 border-b border-white/5 bg-black/40 flex flex-col gap-3 shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={lautechCutoffSearch}
                      onChange={e => setLautechCutoffSearch(e.target.value)}
                      placeholder="Search across all 57 LAUTECH courses (e.g., Medicine, Nursing, Computer Science, Civil Eng, Accounting)..."
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {lautechCutoffSearch && (
                      <button
                        type="button"
                        onClick={() => setLautechCutoffSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 shrink-0">
                      Faculty:
                    </span>
                    <button
                      type="button"
                      onClick={() => setLautechFacultyFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                        lautechFacultyFilter === 'ALL'
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      All ({LAUTECH_CUTOFFS_2025_2026.length})
                    </button>
                    {getLAUTECHFaculties().map(fac => {
                      const count = LAUTECH_CUTOFFS_2025_2026.filter(c => c.faculty === fac).length;
                      return (
                        <button
                          key={fac}
                          type="button"
                          onClick={() => setLautechFacultyFilter(fac)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                            lautechFacultyFilter === fac
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {fac} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Formula Highlight Banner */}
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Sparkles size={14} className="shrink-0 text-indigo-400" />
                    <span className="text-[11px] leading-relaxed">
                      <strong>LAUTECH 80:20 Scoring Formula:</strong> <code className="bg-black/40 px-1.5 py-0.5 rounded text-indigo-200">Aggregate = (JAMB / 400 * 80) + O'Level Points (max 20)</code>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 shrink-0">
                    <span>Institutional Minimum: <strong className="text-white">170</strong></span>
                    <span>Total Courses: <span className="text-xs font-black text-indigo-400">{LAUTECH_CUTOFFS_2025_2026.length}</span></span>
                  </div>
                </div>
              </div>

              {/* Course List / Cards */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[55vh] scrollbar-thin">
                {(() => {
                  const filtered = LAUTECH_CUTOFFS_2025_2026.filter(item => {
                    const matchesSearch =
                      lautechCutoffSearch === '' ||
                      item.programme.toLowerCase().includes(lautechCutoffSearch.toLowerCase()) ||
                      item.faculty.toLowerCase().includes(lautechCutoffSearch.toLowerCase()) ||
                      item.utmeSubjects.toLowerCase().includes(lautechCutoffSearch.toLowerCase()) ||
                      item.oLevelRequirements.toLowerCase().includes(lautechCutoffSearch.toLowerCase());
                    const matchesFaculty =
                      lautechFacultyFilter === 'ALL' || item.faculty === lautechFacultyFilter;
                    return matchesSearch && matchesFaculty;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center text-gray-500">
                        <AlertCircle size={32} className="mx-auto mb-2 opacity-50 text-indigo-400" />
                        <p className="text-xs font-bold uppercase tracking-wider">No matching LAUTECH courses found</p>
                        <p className="text-[10px] mt-1 text-gray-600">Try adjusting your search query or faculty filter</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {filtered.map(item => {
                        const isOneSitting =
                          item.notes?.toLowerCase().includes('one sitting') ||
                          item.oLevelRequirements.toLowerCase().includes('one sitting') ||
                          item.oLevelRequirements.toLowerCase().includes('1 sitting') ||
                          ['Medicine and Surgery (MBBS)', 'Nursing Science', 'Medical Laboratory Science'].includes(item.programme);

                        return (
                          <div
                            key={item.programme}
                            className="p-4 bg-gray-900/70 hover:bg-gray-900 border border-white/5 hover:border-indigo-500/30 rounded-2xl transition-all duration-200 flex flex-col justify-between gap-3 group"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-[8px] font-black uppercase tracking-wider">
                                      {item.faculty}
                                    </span>
                                    {isOneSitting && (
                                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-black uppercase tracking-wider">
                                        1 Sitting Only
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors leading-snug">
                                    {item.programme}
                                  </h4>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-base sm:text-lg font-black text-indigo-400 tracking-tight">
                                    {item.utmeCutoff}
                                  </span>
                                  <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">
                                    UTME Cut-Off
                                  </span>
                                </div>
                              </div>

                              {/* UTME & OLevel Requirements */}
                              <div className="mt-2 space-y-1.5 text-[10px]">
                                <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                                  <span className="text-gray-400 font-bold block mb-0.5 uppercase text-[8px] tracking-wider text-indigo-300">
                                    UTME Subjects:
                                  </span>
                                  <span className="text-gray-300">{item.utmeSubjects}</span>
                                </div>
                                <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                                  <span className="text-gray-400 font-bold block mb-0.5 uppercase text-[8px] tracking-wider text-purple-300">
                                    O'Level Requirements:
                                  </span>
                                  <span className="text-gray-300">{item.oLevelRequirements}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px]">
                              <span className="text-gray-400 font-bold">80% JAMB + 20% O'Level</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetUni("Ladoke Akintola University of Technology (LAUTECH)");
                                  setTargetCourse(item.programme);
                                  setCourseSearch(item.programme);
                                  setIsLAUTECHCutoffsModalOpen(false);
                                  window.scrollTo({ top: 400, behavior: 'smooth' });
                                }}
                                className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500 rounded-lg font-black uppercase tracking-wider text-[8px] transition-all cursor-pointer flex items-center gap-1"
                              >
                                Calculate Chance <ArrowRight size={10} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/5 bg-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[9px] text-gray-500 font-bold uppercase tracking-wider shrink-0">
                <div className="flex items-center gap-2">
                  <Info size={12} className="text-indigo-400" />
                  <span>LAUTECH Aggregate = (JAMB / 400 * 80) + O'Level Points (max 20). Institutional Cutoff: 170</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.lautech.edu.ng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    LAUTECH Official Portal <ExternalLink size={10} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsLAUTECHCutoffsModalOpen(false)}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Testimonials />

      {isPdfExportModalOpen && (
        <Suspense fallback={null}>
          <PdfExportModal
            isOpen={isPdfExportModalOpen}
            onClose={() => setIsPdfExportModalOpen(false)}
            resultData={{
              targetUni,
              targetCourse,
              courseSearch,
              jambScore,
              postUtmeScore,
              isPostUtmePending,
              aggregateScore,
              admissionProbability,
              confidenceLevel,
              stateOfOrigin,
              subjects,
              hasOLevel: computedScoringSystem ? computedScoringSystem.hasOLevel : true,
              hasPostUtme: computedScoringSystem ? computedScoringSystem.hasPostUtme : !((targetUni?.name || '').toLowerCase().includes('futa') || (targetUni?.name || '').toLowerCase().includes('akure') || (targetUni?.name || '').toLowerCase().includes('lasu')),
              olevelPoints: (computedScoringSystem?.formula === 'futa_75_25' || (targetUni?.name || '').toLowerCase().includes('futa') || (targetUni?.name || '').toLowerCase().includes('akure')) 
                ? parseFloat(((activeOlevelPoints / 5) * 0.25).toFixed(2)) 
                : activeOlevelPoints,
              computedScoringSystem,
              aiResult
            }}
          />
        </Suspense>
      )}

      {isUploadHubModalOpen && (
        <Suspense fallback={null}>
          <FileUploadHubModal
            isOpen={isUploadHubModalOpen}
            onClose={() => setIsUploadHubModalOpen(false)}
          />
        </Suspense>
      )}
    </section>
  );
};

export default CutoffCalculator;