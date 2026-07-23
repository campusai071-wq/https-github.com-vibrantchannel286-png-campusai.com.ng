import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Wallet, Crown, MapPin, History, Database, Sliders, ExternalLink, Printer, Upload, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OLevelGrade } from '../types';
import Markdown from 'react-markdown';
import universityData from '../data/universities';
import { getCourseCutoffInfo, getUniversityCourses, getUniversityScoringSystem } from '../services/geminiService';
import {
  getLocalProfile, checkAndIncrementCalculations as checkAndIncrementRequests,
  DAILY_LIMIT, getUserProfile, saveUserProfile, incrementMeritUsage,
  deductScholarCredit, FREE_GUEST_LIMIT, FREE_USER_LIMIT,
  checkCalculationsLimit, incrementCalculations
} from '../services/userService';
import { getGlobalScoringSystem, saveGlobalScoringSystem, logUserActivity, saveCutoffOverride, deleteCutoffOverride, getCutoffOverride, getAllCutoffOverrides, saveCalculationAttempt, getCalculationAttempts, getSchoolUgc, addSchoolUgc, likeSchoolUgc } from '../services/dbService';
import QuotaModal from './QuotaModal';
import Testimonials from './Testimonials';
import { PdfExportModal } from './PdfExportModal';
import { FileUploadHubModal } from './FileUploadHubModal';
import { AdmissionChecklist } from './AdmissionChecklist';

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

  if (formula === 'futa_75_25' || normalizedUni.includes('futa') || desc.includes('75:25')) {
    return (jamb / 400 * 75) + (olevelTotal / 50 * 25);
  }
  if (formula === 'lasu_60_40' || normalizedUni.includes('lasu') || desc.includes('60:40')) {
    return (jamb / 400 * 60) + olevelTotal;
  }
  if (formula === 'lasu_point_based') {
    return (jamb / 8) + olevelTotal;
  }
  if (formula === '50:30:20' || desc.includes('50:30:20')) {
    return (jamb / 400 * 50) + (post / 100 * 30) + olevelTotal;
  }
  if (formula === '50:20:30' || desc.includes('50:20:30') || desc.includes('kwasu')) {
    return (jamb / 400 * 50) + (post / 100 * 20) + (olevelTotal / 50 * 30);
  }
  if (formula === '50:40:10' || desc.includes('50:40:10') || normalizedUni.includes('awolowo') || normalizedUni.includes('oau')) {
    return (jamb / 8) + (post / 100 * 40) + olevelTotal;
  }
  if (formula === '50:50') {
    return (jamb / 8) + (post / 2);
  }
  if (formula === 'pure_jamb') {
    return jamb / 4;
  }

  if (desc.includes('point-based')) {
    if (normalizedUni.includes('futa')) {
      return (jamb / 400 * 75) + (olevelTotal / 50 * 25);
    }
    return (jamb / 8) + olevelTotal;
  }

  if (desc.includes('50:50') || desc.includes('ui') || desc.includes('oau') || desc.includes('50:10:40')) {
    if (normalizedUni.includes('awolowo') || normalizedUni.includes('oau')) {
      return (jamb / 8) + (post / 100 * 40) + olevelTotal;
    }
    return (jamb / 8) + (post / 2);
  }

  return jamb / 4;
};

const getUniversityGradePoints = (uniName: string): {
  gradeMap: Record<OLevelGrade, number>;
  maxPoints: number;
  styleDesc: string;
} => {
  const normalized = uniName.toLowerCase();
  
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
      'A1': 2.0, 'B2': 1.75, 'B3': 1.5, 'C4': 1.25, 'C5': 1.0, 'C6': 0.75, 'D7': 0, 'E8': 0, 'F9': 0
    };
    return {
      gradeMap: map,
      maxPoints: 10,
      styleDesc: "OAU O'Level scale (A1=2.0, B2=1.75, B3=1.5, C4=1.25, C5=1.0, C6=0.75)"
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

  if (n.includes("lagos") || n.includes("unilag"))
    return active("UNILAG 2026/2027 Post-UTME screening applications are currently active on the official Portal. Registration ends soon.", "https://studentportal.unilag.edu.ng/");
  if (n.includes("ibadan") || n.includes("ui"))
    return active("UI 2026/2027 Post-UTME form sales and registration are active. Ensure subject compatibility before registering.", "https://admissions.ui.edu.ng/");
  if (n.includes("awolowo") || n.includes("oau") || n.includes("ife"))
    return active("OAU 2026/2027 Post-UTME registration guidelines have been officially released. Portal is fully open.", "https://admissions.oauife.edu.ng/");
  if (n.includes("benin") || n.includes("uniben"))
    return active("UNIBEN 2026/2027 Post-UTME portal is open for registration. Exam dates will be communicated via your registered profile.", "https://uniben.waeup.org/");
  if (n.includes("nsukka") || n.includes("nigeria") || n.includes("unn"))
    return active("UNN 2026/2027 Post-UTME application is active. Direct Entry candidates should also complete their registration on the school portal.", "https://unnportal.unn.edu.ng/");
  if (n.includes("futa") || n.includes("technology, akure"))
    return { isOut: true, statusText: "Form Released (Point-Based)", badgeColor: "bg-emerald-500/15 border-emerald-500/35", textColor: "text-emerald-400", iconBg: "bg-emerald-500/10", details: "FUTA 2026/2027 Point-Based screening registrations are active. FUTA uses O'Level + JAMB points (no written Post-UTME exam).", portalLink: "https://www.futa.edu.ng" };
  if (n.includes("lasu") || n.includes("lagos state"))
    return active("LASU 2026/2027 screening application portal is active. Check guidelines to ensure your O'Level match is perfect.", "https://lidc.lasu.edu.ng/");
  if (n.includes("futminna") || n.includes("technology, minna"))
    return active("FUTMinna 2026/2027 dynamic online registration is currently active. CBT screening date schedules TBA.", "https://futminna.edu.ng");
  if (n.includes("futo") || n.includes("technology, owerri"))
    return active("FUTO 2026/2027 screening forms are out and active. Remember FUTO requires standard UTME targets.", "https://portal.futo.edu.ng/");
  if (n.includes("port harcourt") || n.includes("uniport"))
    return active("UNIPORT 2026/2027 Post-UTME registration link is live. Please ensure to check portal deadlines.", "https://www.uniport.edu.ng");
  if (n.includes("ilorin") || n.includes("unilorin"))
    return pending("UNILORIN is yet to officially list the 2026/2027 Post-UTME registrations. Announcement is expected by late June/July.");
  if (n.includes("jos") || n.includes("unijos"))
    return pending("UNIJOS 2026/2027 Post-UTME guidelines are pending senate approvals. Form is expected in July.");
  if (n.includes("nnamdi azikiwe") || n.includes("unizik"))
    return pending("UNIZIK has not released 2026/2027 registration schedules yet. Monitor the admissions site regularly.");
  if (n.includes("abu") || n.includes("abello") || n.includes("zaria"))
    return active("ABU Zaria 2026/2027 Post-UTME forms are out on the portal. CBT exams to be conducted at ABU campus.", "https://portal.abu.edu.ng/");

  return active(`${schoolName} 2026/2027 Post-UTME dynamic screening and registrations are officially out across general quotas. Confirm steps on the official portal.`);
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
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">Merit Strength Index</p>
        <p className="text-[9px] text-gray-400 max-w-[180px] leading-snug mt-1.5 font-medium">
          Based on how far your aggregate exceeds the estimated departmental cutoff
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
    formulaDesc: "UI uses a straightforward 50:50 combination of UTME and Post-UTME. No O'Level grade points are used in the aggregate.",
    formulaSteps: [
      "JAMB Score: Divided by 8 (Max 50 points).",
      "Post-UTME Exam: Divided by 2 (Max 50 points).",
      "Aggregate = (JAMB / 8) + (Post-UTME / 2). No O'Level points are added, but you must pass all 5 required subjects at a single sitting!"
    ],
    cutoffs: [
      { course: "Medicine & Surgery", score: "82.15+" },
      { course: "Nursing Science", score: "71.50+" },
      { course: "Pharmacy", score: "73.80+" },
      { course: "Law", score: "75.50+" },
      { course: "Computer Science", score: "72.40+" },
      { course: "Economics", score: "69.80+" }
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
    formulaDesc: "FUTA calculates its aggregate using a 75:25 Point-Based formula (JAMB and O'Level). There is no written Post-UTME exam!",
    formulaSteps: [
      "JAMB Score: Divided by 400 and multiplied by 75 (Max 75 points).",
      "O'Level Points: Converted to a max of 25 points based on your best 5 subjects (A1=10, B2=9, B3=8, C4=7, C5=6, C6=5 points)."
    ],
    cutoffs: [
      { course: "Computer Science", score: "72.50+" },
      { course: "Medicine & Surgery", score: "81.20+" },
      { course: "Electrical & Electronics Engineering", score: "70.80+" },
      { course: "Mechanical Engineering", score: "69.50+" },
      { course: "Civil Engineering", score: "67.20+" }
    ],
    postUtmeGuide: {
      format: "Online Screening & Point-Based Computation (No Exam)",
      subjects: "N/A (Calculated solely based on JAMB and O'Level Grades).",
      duration: "N/A",
      fee: "₦2,000 (Screening Registration)",
      tips: [
        "Your O'Level grades are extremely important since 25% of the aggregate depends on them.",
        "Ensure your WAEC/NECO results are correctly uploaded to JAMB CAPS, otherwise you won't be considered.",
        "Avoid any sitting penalties; FUTA accepts two sittings but single sitting is highly advantageous."
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

  // Manual Override states (added in case school suddenly changes calculation formula mid-cycle)
  const [manualOverrideActive, setManualOverrideActive] = useState(false);
  const [manualHasJamb, setManualHasJamb] = useState(true);
  const [manualHasPostUtme, setManualHasPostUtme] = useState(true);
  const [manualHasOLevel, setManualHasOLevel] = useState(true);
  const [manualFormula, setManualFormula] = useState('50:30:20');

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
    return scoringSystem;
  }, [manualOverrideActive, scoringSystem, manualHasJamb, manualHasPostUtme, manualHasOLevel, manualFormula]);

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
  const [isAR, setIsAR] = useState(false);
  const [isPostUtmePending, setIsPostUtmePending] = useState(false);
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
  const currentSchoolSlug = useMemo(() => {
    const path = location.pathname;
    const match = path.match(/\/([a-zA-Z0-9_-]+)-aggregate-calculator/);
    return match ? match[1].toLowerCase() : null;
  }, [location.pathname]);

  const schoolLandingInfo = useMemo(() => {
    if (!currentSchoolSlug) return null;
    return SCHOOL_LANDING_DATA[currentSchoolSlug] || null;
  }, [currentSchoolSlug]);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [calculationAttempts, setCalculationAttempts] = useState<SavedProfile[]>([]);

  const chartData = useMemo(() => {
    const source = calculationAttempts.length > 0 ? calculationAttempts : savedProfiles;
    return [...source]
      .reverse()
      .map((p, idx) => ({
        index: idx + 1,
        id: p.id || `${p.timestamp || idx}-${idx}`,
        name: p.uniName.replace("University of ", "U of ").replace("Federal University of Technology", "FUTA"),
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
    const found = universityData.find((u: any) =>
      u.slug === searchKey.toLowerCase() ||
      u.name.toLowerCase() === searchKey.toLowerCase() ||
      u.name.toLowerCase().includes(searchKey.toLowerCase()) ||
      searchKey.toLowerCase().includes(u.name.toLowerCase())
    );
    if (found) {
      if (!targetUni || targetUni.name !== found.name) {
        setTargetUni(found);
        setUniSearch(found.name);
        setTargetCourse('');
        setCourseSearch('');
        setAvailableCourses([]);
      }
      if (initialSchoolName) {
        onClearInitialSchool?.();
      }
      setTimeout(() => {
        document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }, [initialSchoolName, currentSchoolSlug, onClearInitialSchool, targetUni]);

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

    // 2. Hydrate previous active result if present in local storage
    try {
      const lastResultStr = localStorage.getItem('campusai_last_calculation_result');
      if (lastResultStr) {
        const lastRes = JSON.parse(lastResultStr);
        if (lastRes && lastRes.aiResult) {
          setAiResult(lastRes.aiResult);
          if (lastRes.uniName) {
            const u = universityData.find((x: any) => x.name === lastRes.uniName);
            if (u) { setTargetUni(u); setUniSearch(u.name); }
          }
          if (lastRes.courseName) { setTargetCourse(lastRes.courseName); setCourseSearch(lastRes.courseName); }
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

  // Reset bypass when score/uni changes
  useEffect(() => { setBypassCutoffAlert(false); }, [jambScore, targetUni]);

  // Fetch scoring system & courses when uni changes
  useEffect(() => {
    if (!targetUni) return;
    const run = async () => {
      setIsSyncing(true);
      setAvailableCourses([]);
      const slug = targetUni.slug || targetUni.name.toLowerCase().replace(/\s+/g, '-');

      const instantMatch =
        TOP_INSTITUTION_MAP[slug] ||
        Object.entries(TOP_INSTITUTION_MAP).find(([k]) => targetUni.name.toLowerCase().includes(k))?.[1];
      if (instantMatch) setScoringSystem(instantMatch);

      try {
        const cached = await getGlobalScoringSystem(slug);
        const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
        const isStale = cached && (Date.now() - (cached.updatedAt?.seconds * 1000 || 0) > TWO_WEEKS);

        if (cached && !isStale) {
          if (!instantMatch) setScoringSystem(cached as ScoringSystem);
          if (cached.courses && Array.isArray(cached.courses)) {
            setAvailableCourses(cached.courses);
          } else {
            const courses = await getUniversityCourses(targetUni.name);
            setAvailableCourses(courses);
            await saveGlobalScoringSystem(slug, { ...cached, courses });
          }
        } else {
          const [courses, realSystem] = await Promise.all([
            getUniversityCourses(targetUni.name),
            getUniversityScoringSystem(targetUni.name),
          ]);
          setAvailableCourses(courses);
          if (!instantMatch) setScoringSystem(realSystem as ScoringSystem);
          if (realSystem) {
            await saveGlobalScoringSystem(slug, {
              ...(realSystem as ScoringSystem),
              courses,
              updatedAt: { seconds: Math.floor(Date.now() / 1000) },
            });
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
  }, [jambScore, postUtmeScore, targetUni, computedScoringSystem, activeOlevelPoints, sittings]);

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

  const isELDSState     = useMemo(() => ELDS_STATES.includes(stateOfOrigin), [stateOfOrigin]);
  const isCatchmentState = useMemo(() => {
    if (!targetUni || !stateOfOrigin) return false;
    const sw = ['akure', 'lagos', 'ibadan', 'ife_oau', 'funaab'];
    const isSW = sw.some(k => targetUni.name.toLowerCase().includes(k) || targetUni.slug?.toLowerCase().includes(k));
    return isSW && ["Lagos", "Ogun", "Oyo", "Osun", "Ondo", "Ekiti"].includes(stateOfOrigin);
  }, [targetUni, stateOfOrigin]);

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
    const discount        = isELDSState ? 4.5 : isCatchmentState ? 2.5 : 0;
    const adjustedCutoff  = parseFloat(Math.max(40, pureMeritCutoff - discount).toFixed(1));
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
    return universityData.filter((u: any) => u.name.toLowerCase().includes(uniSearch.toLowerCase())).slice(0, 5);
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

    const currentSlug = activeUni?.slug || activeUni?.name.toLowerCase().replace(/\s+/g, '-');
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

    const isAllC6 = subjects.every(s => s.grade === 'C6');
    if (isAllC6 && (!computedScoringSystem || computedScoringSystem.hasOLevel) && !forceBypassAccreditation) {
      setIsC6AlertOpen(true);
      return;
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
    setFeedbackStatus('none');
    setAdmissionStatus('none');
    try {
      const formulaText    = resolvedScoringSystem?.explanation || "Pure Academic Formula (JAMB / 4)";
      const computedDiscount = isELDSState ? 4.5 : isCatchmentState ? 2.5 : 0;
      
      // Determine if they were already beyond their daily free allowance before running this check
      const wasDailyLimitExceededBefore = (user?.daily_requests || 0) >= 1;

      const result = await getCourseCutoffInfo(
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
        user?.role, isAR, isPostUtmePending, formulaText,
        stateOfOrigin, isELDSState, isCatchmentState, computedDiscount,
        parseFloat(jambScore) || 0,
        isPostUtmePending ? (postUtmeScore && !isNaN(parseFloat(postUtmeScore)) ? parseFloat(postUtmeScore) : 70) : (parseFloat(postUtmeScore) || 0)
      );
      setAiResult(result);
      setShowResults(true);

      // Automatically save this calculation attempt to history with local storage persistence
      const newAttempt: SavedProfile = {
        id: Math.random().toString(36).substring(2, 9),
        uniName: targetUni.name,
        courseName: targetCourse || courseSearch,
        jambScore,
        postUtmeScore,
        stateOfOrigin,
        aggregateScore,
        isAR,
        isPostUtmePending,
        timestamp: Date.now(),
        aiResult: result,
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
          userId: user.uid, 
          type: 'calculation', 
          title: 'Admission Audit', 
          description: `Calculated aggregate for ${targetCourse || courseSearch} at ${targetUni.name}`,
          metadata: {
            course: targetCourse || courseSearch,
            university: targetUni.name,
            subjects: subjects.map(s => ({ name: s.name, grade: s.grade })),
            formula: formulaText,
            computedDiscount: computedDiscount,
            aggregateScore: aggregateScore,
            jambScore: jambScore,
            postUtmeScore: postUtmeScore,
            hasOLevel: computedScoringSystem?.hasOLevel || false
          }
        });
      } else {
        localStorage.setItem('guest_merit_usage', (guestUsage + 1).toString());
        logUserActivity({ 
          userId: 'guest', 
          type: 'calculation', 
          title: 'Admission Audit', 
          description: `Calculated aggregate for ${targetCourse || courseSearch} at ${targetUni.name}`,
          metadata: {
            course: targetCourse || courseSearch,
            university: targetUni.name,
            subjects: subjects.map(s => ({ name: s.name, grade: s.grade })),
            formula: formulaText,
            computedDiscount: computedDiscount,
            aggregateScore: aggregateScore,
            jambScore: jambScore,
            postUtmeScore: postUtmeScore,
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
                  <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1.5">
                    {schoolLandingInfo.fullName} <span className="text-cyan-400">Hub</span>
                  </h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">
                    Verified Aggregate Formula, Departmental Cutoffs & Prep Rules
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
                    <p className="text-xs text-gray-300 font-medium leading-relaxed">Estimated Departmental Cutoff scores to secure merit-list admissions in 2026:</p>
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
                  Select a featured institution below to access its official aggregate formula, verified departmental cutoffs, and real student preparation forums.
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
                          {p.uniName.replace("University of ", "U of ").replace("Federal University of Technology", "FUTA")}
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
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[7.5px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                    <Clock size={11} className="text-cyan-400" /> Recent Calculated Scores (Saved Offline)
                  </p>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-[7.5px] font-bold text-gray-500 hover:text-rose-400 transition-colors"
                  >
                    Clear History
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {calculationAttempts.map(p => (
                    <div
                      key={p.id || p.timestamp}
                      onClick={() => handleLoadScenario(p)}
                      className="group flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all select-none"
                    >
                      <div className="flex flex-col text-left overflow-hidden pr-2">
                        <span className="text-[9.5px] font-black text-white group-hover:text-cyan-400 transition-colors truncate">
                          {p.uniName.replace("University of ", "U of ").replace("Federal University of Technology", "FUTA")}
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
                    {isELDSState ? <>As a candidate from <strong>{stateOfOrigin}</strong> (an ELDS state), you qualify for specialized admission pool consideration (official ELDS quota = 20%). In federal institutions, you compete within a separate ELDS competitive pool with an effective departmental cutoff threshold historically <strong>around 4% to 5% lower</strong> than general Merit, without changing your physical raw score.</>
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
                  className={`px-2 py-0.5 rounded text-[7px] font-black uppercase transition-all flex items-center gap-1 border ${
                    manualOverrideActive
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                      : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                  }`}
                >
                  ⚙️ {manualOverrideActive ? 'Use Official' : 'School Changed System? Customize'}
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

            {/* JAMB + Post-UTME scores */}
            <div className="grid grid-cols-2 gap-3">
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
              {(!computedScoringSystem || computedScoringSystem.hasPostUtme) && (
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

            {/* O-Level grades */}
            {(!computedScoringSystem || computedScoringSystem.hasOLevel) && (
              <div className="space-y-2.5 pt-2.5 border-t border-white/5">
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
                            .filter((u: any) => u.name.toLowerCase().includes(handbookUniSearch.toLowerCase()))
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
                        <span>{u.name.replace("University of ", "U of ").replace("Federal University of ", "FUTO ")}</span>
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
                                    title="Correct or calibrate departmental cutoff marks"
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
            {showResults && aiResult ? (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col space-y-8">

                {/* Main result card */}
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-10 relative overflow-hidden">
                  <button onClick={() => setShowResults(false)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                    <X size={16} />
                  </button>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
                    {/* Gauge + confidence */}
                    <div className="flex flex-col items-center">
                      <ProbabilityGauge probability={aiResult.isOffered === false ? 0 : admissionProbability} />
                      <div className="mt-3.5 flex items-center justify-center gap-1.5 p-1.5 px-3 bg-white/[0.03] border border-white/5 rounded-xl select-none">
                        <span className="text-[7.5px] font-extrabold uppercase text-gray-400 tracking-widest">Confidence:</span>
                        <div className="flex gap-0.5">
                          <span className={`w-2.5 h-1.5 rounded-sm bg-emerald-500`} />
                          <span className={`w-2.5 h-1.5 rounded-sm ${confidenceLevel === 'Medium' || confidenceLevel === 'High' ? 'bg-emerald-500' : 'bg-white/10'}`} />
                          <span className={`w-2.5 h-1.5 rounded-sm ${confidenceLevel === 'High' ? 'bg-emerald-500' : 'bg-white/10'}`} />
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${confidenceLevel === 'High' ? 'text-emerald-400' : confidenceLevel === 'Medium' ? 'text-cyan-400' : 'text-amber-400'}`}>
                          {confidenceLevel}
                        </span>
                      </div>
                    </div>

                    {/* Aggregate + badges */}
                    <div className="text-center sm:text-left">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">
                        {(isAR || isPostUtmePending) ? 'Projected Aggregate' : 'My Aggregate Score'}
                      </p>
                      <h4 className="text-3xl font-black text-white">{aggregateScore}%</h4>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="p-2 bg-blue-500/5 rounded-lg border border-blue-500/10 inline-flex items-center gap-1.5">
                          {aiResult.isOffered === false
                            ? <><X size={10} className="text-red-400" /><span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Course Not Found/Accredited</span></>
                            : <><ShieldCheck size={10} className="text-blue-400" /><span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Logic Verified</span></>}
                        </div>
                        {stateOfOrigin && (
                          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 inline-flex items-center gap-1.5">
                            <MapPin size={10} className="text-purple-400" />
                            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Quota Applied: {stateOfOrigin}</span>
                          </div>
                        )}
                        {user?.scholarCredits > 0 && (
                          <div className="p-2 bg-amber-500/5 rounded-lg border border-amber-500/10 inline-flex items-center gap-1.5 animate-pulse">
                            <Crown size={10} className="text-amber-500" />
                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{user.scholarCredits} Premium Trials Left</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Export & Upload Action Bar */}
                  <div className="flex items-center gap-3 my-5 pt-4 border-t border-white/10 flex-wrap">
                    <button
                      onClick={() => setIsPdfExportModalOpen(true)}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      <Printer size={14} /> Export PDF Summary
                    </button>
                    <button
                      onClick={() => setIsUploadHubModalOpen(true)}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                    >
                      <Upload size={14} /> Upload Result Slip / Files
                    </button>
                  </div>

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

                  <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Admission Strategy Analysis</p>
                    <div className="markdown-body text-[11px] text-gray-300 leading-relaxed font-medium">
                      <Markdown>{aiResult.detailedStrategy || aiResult.recommendation || 'No specific strategy analysis available.'}</Markdown>
                    </div>
                  </div>

                  {/* Admission Rescue & Strategic Action Plan */}
                  {(admissionProbability < 65 || 
                    aiResult.verdict === 'Borderline' || 
                    aiResult.verdict === 'Low' || 
                    aiResult.verdict === 'Low Probability' || 
                    aiResult.verdict?.toString().toLowerCase().includes('borderline') || 
                    aiResult.verdict?.toString().toLowerCase().includes('low')) && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.02] border border-amber-500/20 rounded-2xl text-left space-y-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                          <Sliders size={15} />
                        </div>
                        <div>
                          <h5 className="text-xs font-black uppercase tracking-widest text-amber-400">ADMISSION RESCUE & STRATEGIC ACTION PLAN</h5>
                          <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5">Custom corrective steps for {targetUni?.name || 'your institution'}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                        <p className="text-[10px] text-amber-200 leading-relaxed font-semibold">
                          ⚠️ Your aggregate score of <span className="text-white font-extrabold">{aggregateScore}%</span> is close to or below the typical competitive cutoff of <span className="text-white font-extrabold">{aiResult.departmentalCutoff || aiResult.cutoff}</span> for {targetCourse || courseSearch}. To guarantee you gain admission this year, follow this rescue roadmap immediately.
                        </p>
                      </div>

                      {/* Interactive Checklist (Directly matching official JAMB change of course/institution guidelines) */}
                      <div className="space-y-3.5">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span>🔄</span> JAMB Change of Course/Institution Checklist
                        </p>
                        
                        <div className="space-y-2.5">
                          {[
                            {
                              id: 'step1',
                              title: 'Verify portal activation & deadlines',
                              desc: `The 2026 JAMB Change of Course/Institution portal was officially activated on May 15, 2026. Log in to the official JAMB e-Facility portal to complete your adjustments before the typical late-year close in December 2026.`,
                              hasLink: true,
                              link: 'https://jamb.gov.ng/efacility',
                              linkLabel: 'Open JAMB e-Facility'
                            },
                            {
                              id: 'step2',
                              title: 'Log in to your profile securely',
                              desc: 'Log in using your registered JAMB email address and password credentials.'
                            },
                            {
                              id: 'step3',
                              title: 'Select "Change of Course/Institution"',
                              desc: 'Locate the correction service option under the application services pane (a processing fee of ₦2,500 applies).'
                            },
                            {
                              id: 'step4',
                              title: `Select a safer program or lower-tier institution`,
                              desc: `Choose alternative programmes at ${targetUni?.name || 'your institution'} or other state/private options matching your aggregate.`
                            }
                          ].map((step, sIdx) => {
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
                                    <span className="shrink-0 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[7px] font-black tracking-widest uppercase">{alt.typicalCutoff}</span>
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
                                          u.name.toLowerCase().includes(schoolName.toLowerCase()) || 
                                          schoolName.toLowerCase().includes(u.name.toLowerCase())
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
                  )}

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
                          const val = parseFloat(aiResult.departmentalCutoff || aiResult.cutoff);
                          if (!isNaN(val)) {
                            const isPercentage = (aiResult.departmentalCutoff || aiResult.cutoff || '').toString().includes('%');
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
                          aiResult.sourcesCited.map((src: string, sIdx: number) => (
                            <span key={sIdx} className="px-2.5 py-1 bg-white/[0.04] border border-white/5 rounded-lg text-[9px] font-bold text-gray-300 flex items-center gap-1">
                              <Database size={8} className="text-cyan-400/60" /> {src}
                            </span>
                          ))
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

                  {/* Stats row */}
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-white/10 ${isLimitedView ? 'blur-sm select-none pointer-events-none' : ''}`}>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[7px] font-black text-gray-400 uppercase mb-1">School UTME</p>
                      <p className="text-sm font-black text-white">{aiResult.institutionalCutoff || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[7px] font-black text-gray-400 uppercase mb-1">Course Aggregate</p>
                      <p className="text-sm font-black text-cyan-400">{aiResult.departmentalCutoff || aiResult.cutoff}</p>
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
                                    <span className="text-[7px] font-bold text-gray-400 truncate leading-none">{os.name.replace('Subject', 'Sub')}</span>
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
                                      jambContribText = `${jambVal} / 400 * 75 = ${(jambVal / 400 * 75).toFixed(2)} pts (75%)`;
                                      olevelContribText = `${activeOlevelPoints} / 50 * 25 = ${(activeOlevelPoints / 50 * 25).toFixed(2)} pts (25%)`;
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
                                      if (normalizedUni.includes('futa')) {
                                        jambContribText = `${jambVal} / 400 * 75 = ${(jambVal / 400 * 75).toFixed(2)} pts (75%)`;
                                        olevelContribText = `${activeOlevelPoints} / 50 * 25 = ${(activeOlevelPoints / 50 * 25).toFixed(2)} pts (25%)`;
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

                   {/* Limited view paywall overlay */}
                  {isLimitedView && (
                    <div className="absolute inset-x-0 bottom-0 top-[60%] bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent flex flex-col items-center justify-end p-8 text-center">
                      <div className="p-1 px-3 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-3">
                        {user ? 'Daily Limit Reached' : 'Trial Mode Active'}
                      </div>
                      <h6 className="text-sm font-black mb-2">
                        {user ? 'Daily Limit Reached' : 'Unlock Full Analysis'}
                      </h6>
                      <p className="text-[10px] text-gray-400 mb-4 max-w-[200px]">
                        {user 
                          ? 'You have used your 1 free full-strategist calculation for today. Upgrade to check unlimited matches!' 
                          : 'Get detailed mathematical breakdown, budget analysis, and strategic alternatives.'}
                      </p>
                      <button
                        onClick={() => user ? onPremiumRequired?.() : onLoginRequest()}
                        className="px-6 py-2.5 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl hover:bg-cyan-400 transition-all"
                      >
                        {user ? 'Activate Scholar Pack' : 'Sign In to Unlock'}
                      </button>
                    </div>
                  )}
                </div>

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
                {!isLimitedView && aiResult.alternatives?.length > 0 && (
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
                              <span className="shrink-0 px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md text-[7px] font-black tracking-widest uppercase">{alt.typicalCutoff}</span>
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
                                    u.name.toLowerCase().includes(schoolName.toLowerCase()) || 
                                    schoolName.toLowerCase().includes(u.name.toLowerCase())
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
                {aiResult.fresherBudget && (
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
                      <span className="text-[7.5px] font-black uppercase tracking-widest font-mono">AI Model Last updated: May 27, 2026</span>
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
                  {/* Departmental Cutoff input */}
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



      <Testimonials />

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
          aiResult
        }}
      />

      <FileUploadHubModal
        isOpen={isUploadHubModalOpen}
        onClose={() => setIsUploadHubModalOpen(false)}
      />
    </section>
  );
};

export default CutoffCalculator;