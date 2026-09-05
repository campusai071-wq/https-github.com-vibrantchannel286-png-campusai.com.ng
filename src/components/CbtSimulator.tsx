import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where, limit as fsLimit } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { FormulaSheet } from './FormulaSheet';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend
} from 'recharts';
import {
  Home,
  BookOpen,
  Monitor,
  MessageSquare,
  Newspaper,
  Share2,
  ShoppingBag,
  MoreHorizontal,
  Flag,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Lightbulb,
  XCircle,
  HelpCircle,
  Calculator,
  Search,
  Brain,
  TrendingUp,
  Award,
  Zap,
  BookMarked,
  Clock,
  ChevronRight,
  RotateCcw,
  Send,
  FileText,
  Target,
  ArrowRight,
  Bookmark,
  SlidersHorizontal,
  BarChart3,
  Flame,
  Check,
  ChevronDown,
  Download,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Plus,
  Info,
  Layers,
  Activity,
  Play,
  ShieldCheck,
  History
} from 'lucide-react';

import institutionsTree from '../data/institutionsTree.json';
import masterCourses from '../data/masterCourses.json';

/**
 * ---------------------------------------------------------------------------
 * Interfaces & Types
 * ---------------------------------------------------------------------------
 */
interface Question {
  id: string | number;
  question: string;
  option: { a: string; b: string; c: string; d: string; e?: string };
  answer: string;
  solution?: string;
  examType?: string;
  examYear?: string;
  section?: string | null;
  hasPassage?: boolean;
  imageUrl?: string | null;
  category?: string | null;
  source?: 'aloc' | 'firebase' | string;
  metadata?: {
    topic?: string;
    subtopic?: string;
    difficultyScore?: number;
    source?: string;
    subjectFile?: string;
  };
}

interface ExamSessionState {
  sessionId: string;
  userId: string;
  userEmail?: string;
  examType: string;
  testMode: 'practice' | 'full';
  selectedSubjects: string[];
  activeSubjectKey: string;
  shuffledQuestionIds: Record<string, (string | number)[]>;
  questionsBySubject: Record<string, Question[]>;
  answersBySubject: Record<string, Record<string | number, string>>;
  currentIndexBySubject: Record<string, number>;
  completedSubjects: Record<string, boolean>;
  bookmarkedQuestions: Record<string | number, boolean>;
  durationMinutes: number;
  endTime: number;
  timeLeft: number;
  timeElapsedSeconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface CbtExamRecord {
  id: string;
  userId: string;
  userEmail?: string;
  examType: string;
  testMode: string;
  score: number;
  totalRawScore: number;
  totalQuestions: number;
  percentage: number;
  selectedSubjects: string[];
  subjectBreakdown: Array<{
    subjectKey: string;
    subjectLabel: string;
    score: number;
    total: number;
  }>;
  timeElapsedSeconds: number;
  formattedDate: string;
  createdAt: string;
}

interface ExplanationData {
  explanation?: string;
  simplifiedExplanation?: string;
  steps?: string[];
  commonMistakes?: Array<{ mistake: string; whyWrong: string }>;
}

interface AIScoreAnalysis {
  performanceLevel?: string;
  projectedScoreSummary?: string;
  overallDiagnosis?: string;
  strengths?: Array<{ subject: string; insight: string }>;
  weaknesses?: Array<{ subject: string; topic?: string; issue: string; fix: string }>;
  timeManagementAnalysis?: string;
  personalizedActionPlan?: Array<{ day: string; focus: string; action: string }>;
  encouragingClosingNote?: string;
}

interface SubjectConfig {
  key: string;
  label: string;
  topics: string[];
}

const SUBJECT_OPTIONS: SubjectConfig[] = [
  {
    key: 'english-language',
    label: 'English Language',
    topics: ['Grammar & Concord', 'Comprehension & Passages', 'Synonyms & Antonyms', 'Oral English & Vowels', 'Idioms & Figures of Speech']
  },
  {
    key: 'mathematics',
    label: 'Mathematics',
    topics: ['Algebra & Quadratics', 'Calculus (Differentiation/Integration)', 'Trigonometry & Geometry', 'Matrices & Determinants', 'Statistics & Probability']
  },
  {
    key: 'physics',
    label: 'Physics',
    topics: ['Motion & Kinematics', 'Optics & Waves', 'Electricity & Magnetism', 'Heat & Thermodynamics', 'Atomic & Nuclear Physics']
  },
  {
    key: 'chemistry',
    label: 'Chemistry',
    topics: ['Organic Chemistry & Hydrocarbons', 'Chemical Bonding & Structure', 'Stoichiometry & Mole Concept', 'Electrochemistry', 'Acids, Bases & Salts']
  },
  {
    key: 'biology',
    label: 'Biology',
    topics: ['Cell Biology & Genetics', 'Plant & Animal Physiology', 'Ecology & Environment', 'Nutrition & Transport Systems', 'Evolution & Adaptation']
  },
  {
    key: 'economics',
    label: 'Economics',
    topics: ['Demand & Supply Elasticity', 'Market Structures', 'National Income & Money', 'Public Finance & Taxation', 'International Trade']
  },
  {
    key: 'government',
    label: 'Government',
    topics: ['Constitutional Development', 'Political Ideologies', 'Public Administration', 'Nigerian Foreign Policy', 'International Organizations']
  },
  {
    key: 'literature-in-english',
    label: 'Literature',
    topics: ['Compulsory Novel Summaries', 'African Poetry', 'Non-African Drama', 'Literary Devices & Prose', 'Unseen Poetry']
  },
  {
    key: 'christian-religious-studies',
    label: 'CRK / CRS',
    topics: ['Creation & Covenant', 'Leadership & Kingship in Israel', 'The Passion & Resurrection of Christ', 'The Early Church & Acts of Apostles', 'Faith & Christian Living']
  },
  {
    key: 'commerce',
    label: 'Commerce',
    topics: ['Types of Business Organizations', 'Banking & Financial Markets', 'Warehousing & Logistics', 'Consumer Protection', 'Foreign Trade & Custom Duties']
  },
  {
    key: 'accounting',
    label: 'Financial Accounting',
    topics: ['Double Entry Principles', 'Final Accounts & Balance Sheet', 'Partnership Accounts', 'Company Accounts & Shares', 'Control Accounts & Bank Reconciliation']
  },
  {
    key: 'civic-education',
    label: 'Civic Education',
    topics: ['Citizenship Rights & Duties', 'Human Rights & Rule of Law', 'Democracy & Electoral Process', 'Values & Youth Empowerment', 'Public Service & Ethics']
  },
  {
    key: 'geography',
    label: 'Geography',
    topics: ['Physical Geography & Rocks', 'Map Reading & Contours', 'Weather & Climate', 'Human & Economic Geography', 'Regional Geography of Nigeria']
  }
];

// Novel Summary for Literature / English
const NOVEL_SUMMARIES = [
  {
    title: 'The Life Changer',
    author: 'Khadija Abubakar Jalli',
    summary: 'Set in a university background, the novel tells the story of Ummi and her journey navigating campus life, peer pressure, examine malpractice, and moral uprightness.',
    keyThemes: ['Peer Pressure', 'Academic Integrity', 'Parental Guidance & Trust', 'Forgiveness'],
    keyCharacters: ['Ummi (Protagonist)', 'Salma (Rebellious friend)', 'Talle (Quiet village boy)', 'Habiba & Jamila'],
    highYieldFact: 'The novel emphasizes that education without character leads to tragic downfalls, highlighting Salma\'s transformation after experiencing exam malpractice consequences.'
  },
  {
    title: 'Sweet Sixteen',
    author: 'Bolaji Abdullahi',
    summary: 'A heartwarming story of Aliya and her father Mr. Bello, who writes her a letter on her 16th birthday discussing life, puberty, friendship, and personal values.',
    keyThemes: ['Parent-Child Communication', 'Adolescence & Growth', 'Self-Esteem', 'Sex Education'],
    keyCharacters: ['Aliya (16-year-old high school student)', 'Mr. Bello (Understanding father)', 'Grace & Tokunbo'],
    highYieldFact: 'Mr. Bello introduces Aliya to the concept of the "Dumb Boy" syndrome and teaches her self-worth.'
  }
];

const PDF_STORE_ITEMS: any[] = [];

interface CbtSimulatorProps {
  user?: any;
  setIsScholarPackOpen?: (open: boolean) => void;
  setPaymentConfig?: (config: { type: 'pack' | 'refill' | 'tool'; amount: number; label: string; toolId?: string }) => void;
  onLoginRequest?: () => void;
  onSignUpRequest?: () => void;
  initialTab?: 'cbt' | 'history' | 'study' | 'target-system' | 'ai-advisor';
}

export default function CbtSimulator({ user, setIsScholarPackOpen, setPaymentConfig, onLoginRequest, onSignUpRequest, initialTab = 'cbt' }: CbtSimulatorProps) {
  const navigate = useNavigate();

  // If user is not logged in, show Auth Guard requiring Sign Up / Login
  if (!user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 text-center space-y-6">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg mb-2">
            <Monitor size={40} />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[11px] uppercase tracking-widest rounded-full">
              Account Required
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
              Sign Up to Access CBT Practice & Study Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed max-w-md mx-auto">
              Create a free account or log in to unlock full JAMB/WAEC past question drills, step-by-step AI solutions, and personalized score target tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">AI Working Derivations</div>
                <div className="text-[11px] text-slate-400">Step-by-step math & science solutions</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Target size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Score Target Engine</div>
                <div className="text-[11px] text-slate-400">Track admission score gap & progress</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Brain size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">AI Subject Tutor</div>
                <div className="text-[11px] text-slate-400">Instant explanations & exam advice</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <BookOpen size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">10,000+ Past Questions</div>
                <div className="text-[11px] text-slate-400">JAMB, WAEC, NECO & Post-UTME drills</div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (onSignUpRequest) onSignUpRequest();
                else if (onLoginRequest) onLoginRequest();
                else navigate('/login');
              }}
              className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </button>
            
            <button
              onClick={() => {
                if (onLoginRequest) onLoginRequest();
                else navigate('/login');
              }}
              className="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-700 transition-all cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Navigation tabs: 'cbt' | 'history' | 'study' | 'target-system' | 'ai-advisor'
  const [activeTab, setActiveTab] = useState<'cbt' | 'history' | 'study' | 'target-system' | 'ai-advisor'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [targetUniversity, setTargetUniversity] = useState('');
  const [targetCourse, setTargetCourse] = useState('');
  const [targetScore, setTargetScore] = useState<number | ''>('');
  const [progressHistory, setProgressHistory] = useState<Array<{
    id?: string;
    month: string;
    score: number;
    date?: string;
    examType?: string;
    testMode?: string;
    target?: number;
    note?: string;
  }>>([]);
  const [showExamInstructions, setShowExamInstructions] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('campusai_target_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.university) setTargetUniversity(parsed.university);
        if (parsed.course) setTargetCourse(parsed.course);
        if (parsed.score) setTargetScore(parsed.score);
        if (parsed.history && Array.isArray(parsed.history)) setProgressHistory(parsed.history);
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('campusai_target_config', JSON.stringify({
      university: targetUniversity,
      course: targetCourse,
      score: targetScore,
      history: progressHistory
    }));
  }, [targetUniversity, targetCourse, targetScore, progressHistory]);

  const [newMonthInput, setNewMonthInput] = useState('');
  const [newScoreInput, setNewScoreInput] = useState<number | ''>('');

  const currentCbtEquivalent = progressHistory.length > 0 ? progressHistory[progressHistory.length - 1]?.score : 0;
  const previousCbtEquivalent = progressHistory.length > 1 ? progressHistory[progressHistory.length - 2]?.score : null;
  const scoreDelta = previousCbtEquivalent !== null ? currentCbtEquivalent - previousCbtEquivalent : 0;
  const highestScore = progressHistory.length > 0 ? Math.max(...progressHistory.map(p => p.score)) : 0;
  const averageScore = progressHistory.length > 0 ? Math.round(progressHistory.reduce((acc, curr) => acc + curr.score, 0) / progressHistory.length) : 0;
  const gap = Math.max(0, (typeof targetScore === 'number' ? targetScore : 0) - currentCbtEquivalent);

  // Chart data formatting
  const chartData = useMemo(() => {
    return progressHistory.map((item, idx) => ({
      name: item.month || `Test ${idx + 1}`,
      score: item.score,
      target: typeof targetScore === 'number' && targetScore > 0 ? targetScore : 250,
      date: item.date || item.month,
      examType: (item.examType || 'UTME').toUpperCase()
    }));
  }, [progressHistory, targetScore]);

  const flatInstitutions = useMemo(() => {
    const list: string[] = [];
    const recurse = (node: any) => {
      if (node.type === 'institution' && node.name) list.push(node.name);
      if (node.children) node.children.forEach(recurse);
    };
    institutionsTree.forEach(recurse);
    return list.sort();
  }, []);

  const coursesList = useMemo(() => {
    return masterCourses.map((c: any) => c.title).sort();
  }, []);

  const prioritySubjects = useMemo(() => {
    const c = targetCourse.toLowerCase();
    if (c.includes('computer') || c.includes('software') || c.includes('engineering') || c.includes('physics')) {
      return 'Mathematics + Physics + Chemistry';
    }
    if (c.includes('medicine') || c.includes('nurse') || c.includes('biology') || c.includes('biochem')) {
      return 'Biology + Chemistry + Physics';
    }
    if (c.includes('law') || c.includes('art') || c.includes('english') || c.includes('government')) {
      return 'Literature + Government + CRS';
    }
    if (c.includes('account') || c.includes('econ') || c.includes('business') || c.includes('finance')) {
      return 'Economics + Mathematics + Government';
    }
    return 'Use of English + Mathematics + Physics + Chemistry';
  }, [targetCourse]);

  const nextRecommendedTest = useMemo(() => {
    const c = targetCourse.toLowerCase();
    if (c.includes('engineering') || c.includes('computer') || c.includes('software') || c.includes('tech') || c.includes('physics')) {
      if (gap > 50) return 'Physics — Mechanics, Work, Energy & Power';
      if (gap > 25) return 'Mathematics — Calculus & Matrices';
      return 'Chemistry — Electrochemistry & Rate of Reaction';
    }
    if (c.includes('medicine') || c.includes('surgery') || c.includes('nurse') || c.includes('biology') || c.includes('biochem') || c.includes('pharmacy')) {
      if (gap > 50) return 'Biology — Mammalian Anatomy & Physiology';
      if (gap > 25) return 'Chemistry — Organic Chemistry & Functional Groups';
      return 'Physics — Geometrical & Wave Optics';
    }
    if (c.includes('law') || c.includes('art') || c.includes('government') || c.includes('history') || c.includes('international')) {
      if (gap > 50) return 'Government — Federalism & Public Administration';
      if (gap > 25) return 'Literature — Literary Principles & Poetry Analysis';
      return 'CRS — Christian Ethics & Pauline Epistles';
    }
    if (c.includes('account') || c.includes('econ') || c.includes('finance') || c.includes('banking') || c.includes('business')) {
      if (gap > 50) return 'Economics — National Income & International Trade';
      if (gap > 25) return 'Mathematics — Probability & Commercial Arithmetic';
      return 'Commerce — Business Finance & Consumer Protection';
    }
    // Default fallback
    if (gap > 50) return 'Use of English — Lexis, Structure & Comprehension';
    if (gap > 25) return 'Mathematics — Algebra & Sequence Series';
    return 'General Aptitude — Quantitative & Verbal Reasoning';
  }, [gap, targetCourse]);


  // ----- CBT Setup States -----
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['english-language', 'mathematics', 'physics', 'chemistry']);
  const [activeSubjectKey, setActiveSubjectKey] = useState('english-language');
  const [examType, setExamType] = useState('jamb');
  const [questionsPerSubject, setQuestionsPerSubject] = useState(20);
  const [testMode, setTestMode] = useState<'practice' | 'full'>('practice');
  const [started, setStarted] = useState(false);

  // ----- CBT Exam Engine Data -----
  const [questionsBySubject, setQuestionsBySubject] = useState<Record<string, Question[]>>({});
  const [answersBySubject, setAnswersBySubject] = useState<Record<string, Record<string | number, string>>>({});
  const [currentIndexBySubject, setCurrentIndexBySubject] = useState<Record<string, number>>({});
  const [completedSubjects, setCompletedSubjects] = useState<Record<string, boolean>>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string | number, boolean>>({});

  // ----- Exam Session Persistence in Firestore -----
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem('campus_cbt_active_session_id') || null;
  });
  const [pendingResumeSession, setPendingResumeSession] = useState<ExamSessionState | null>(null);
  const [isCheckingSavedSession, setIsCheckingSavedSession] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  // ----- Timer -----
  const [timeLeft, setTimeLeft] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeElapsedSeconds, setTimeElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // ----- Review & AI Explanations -----
  const [explanations, setExplanations] = useState<Record<string | number, ExplanationData>>({});
  const [loadingExplain, setLoadingExplain] = useState<Record<string | number, boolean>>({});
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct' | 'flagged'>('all');

  // ----- AI Score Analysis -----
  const [aiAnalysis, setAiAnalysis] = useState<AIScoreAnalysis | null>(null);
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);

  // ----- Study Section States -----
  const [studySubject, setStudySubject] = useState('mathematics');
  const [studyTopic, setStudyTopic] = useState('Algebra & Quadratics');
  const [studyQuestions, setStudyQuestions] = useState<Question[]>([]);
  const [studyAnswers, setStudyAnswers] = useState<Record<string | number, string>>({});
  const [loadingStudy, setLoadingStudy] = useState(false);
  const [studyTab, setStudyTab] = useState<'practice' | 'formulas' | 'novels'>('practice');

  // ----- AI Tutor Chat Assistant State -----
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your AI Exam Strategist & Subject Tutor. Ask me anything about JAMB/WAEC past questions, formulas, or study schedules!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // ----- CBT Exam History Persistence in Firestore -----
  const [cbtHistoryList, setCbtHistoryList] = useState<CbtExamRecord[]>(() => {
    try {
      const cached = localStorage.getItem('campusai_cbt_history_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'jamb' | 'waec' | 'post_utme'>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Load persistent CBT history from Firestore for user
  useEffect(() => {
    if (!user?.uid) return;

    const fetchCbtHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const q = query(
          collection(db, 'cbt_history'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const fetched: CbtExamRecord[] = [];
        snap.forEach((d) => {
          fetched.push({ id: d.id, ...(d.data() as any) });
        });

        // Client-side sort descending by date (avoids index errors)
        fetched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        setCbtHistoryList(fetched);
        try {
          localStorage.setItem('campusai_cbt_history_cache', JSON.stringify(fetched.slice(0, 50)));
        } catch (e) {
          console.warn('Failed to cache CBT history locally', e);
        }

        // Synchronize with target system trajectory chart
        if (fetched.length > 0) {
          const syncedProgress = fetched.map((item) => ({
            id: item.id,
            month: `${new Date(item.createdAt).toLocaleString('default', { month: 'short' })} (${item.examType.toUpperCase()})`,
            score: item.score,
            date: item.formattedDate,
            examType: item.examType,
            testMode: item.testMode,
            target: typeof targetScore === 'number' ? targetScore : undefined,
            note: `${item.selectedSubjects?.length || 0} subjects • ${item.testMode === 'full' ? 'Timed Full Exam' : 'Practice Drill'}`
          })).reverse();
          setProgressHistory(syncedProgress);
        }
      } catch (err) {
        console.error('[CBT] Failed to load CBT history from Firestore:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchCbtHistory();
  }, [user?.uid]);

  const handleDeleteHistoryRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this CBT attempt from your history?')) return;
    try {
      await deleteDoc(doc(db, 'cbt_history', recordId));
      setCbtHistoryList((prev) => {
        const updated = prev.filter((item) => item.id !== recordId);
        try {
          localStorage.setItem('campusai_cbt_history_cache', JSON.stringify(updated.slice(0, 50)));
        } catch (e) {
          console.warn('Failed to update CBT cache', e);
        }
        return updated;
      });
      setProgressHistory((prev) => prev.filter((item) => item.id !== recordId));
    } catch (err) {
      console.error('[CBT] Failed to delete CBT record from Firestore:', err);
    }
  };

  const filteredHistoryList = useMemo(() => {
    return cbtHistoryList.filter((record) => {
      if (historyFilter !== 'all' && record.examType !== historyFilter) return false;
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase();
        const matchesDate = (record.formattedDate || '').toLowerCase().includes(q);
        const matchesSubjects = (record.selectedSubjects || []).some((s) => s.toLowerCase().includes(q));
        const matchesSubLabels = (record.subjectBreakdown || []).some((sb) => sb.subjectLabel?.toLowerCase().includes(q));
        if (!matchesDate && !matchesSubjects && !matchesSubLabels) return false;
      }
      return true;
    });
  }, [cbtHistoryList, historyFilter, historySearchQuery]);

  // Check for active unfinished exam session in Firestore on mount to allow resume
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const storedSessionId = localStorage.getItem('campus_cbt_active_session_id');
        if (!storedSessionId) return;

        setIsCheckingSavedSession(true);
        const sessionRef = doc(db, 'exam_sessions', storedSessionId);
        const sessionSnap = await getDoc(sessionRef);

        if (sessionSnap.exists()) {
          const sessionData = sessionSnap.data() as ExamSessionState;
          if (sessionData && sessionData.status === 'in_progress') {
            const now = Date.now();
            const createdMs = sessionData.createdAt ? new Date(sessionData.createdAt).getTime() : now;
            // Check if session was created within the past 6 hours
            if (now - createdMs < 6 * 60 * 60 * 1000) {
              setPendingResumeSession(sessionData);
              setActiveSessionId(storedSessionId);
            } else {
              // Expired session: mark abandoned
              await updateDoc(sessionRef, { status: 'abandoned', updatedAt: new Date().toISOString() });
              localStorage.removeItem('campus_cbt_active_session_id');
              setActiveSessionId(null);
            }
          }
        } else {
          localStorage.removeItem('campus_cbt_active_session_id');
          setActiveSessionId(null);
        }
      } catch (err) {
        console.error('[CBT] Error checking active exam session:', err);
      } finally {
        setIsCheckingSavedSession(false);
      }
    };

    checkActiveSession();
  }, [user]);

  // Start and save exam session state to Firestore with shuffled question IDs
  const startExamSession = async (
    fetchedQuestions: Record<string, Question[]>,
    durationMinutes: number,
    calculatedEndTime: number
  ): Promise<string | null> => {
    try {
      const uId = user?.uid || 'guest';
      const newSessionId = `cbt_${uId}_${Date.now()}`;

      // Extract shuffled question IDs by subject
      const shuffledQuestionIds: Record<string, (string | number)[]> = {};
      Object.entries(fetchedQuestions).forEach(([sub, qList]) => {
        shuffledQuestionIds[sub] = qList.map((q) => q.id);
      });

      const sessionState: ExamSessionState = {
        sessionId: newSessionId,
        userId: uId,
        userEmail: user?.email || '',
        examType,
        testMode,
        selectedSubjects,
        activeSubjectKey: selectedSubjects[0] || 'english-language',
        shuffledQuestionIds,
        questionsBySubject: fetchedQuestions,
        answersBySubject: {},
        currentIndexBySubject: {},
        completedSubjects: {},
        bookmarkedQuestions: {},
        durationMinutes,
        endTime: calculatedEndTime,
        timeLeft: durationMinutes * 60,
        timeElapsedSeconds: 0,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'exam_sessions', newSessionId), sessionState);
      localStorage.setItem('campus_cbt_active_session_id', newSessionId);
      setActiveSessionId(newSessionId);
      setPendingResumeSession(null);
      return newSessionId;
    } catch (err) {
      console.error('[CBT] Failed to save exam session in Firestore:', err);
      return null;
    }
  };

  // Resume mixed-source exam session from Firestore
  const resumeExamSession = () => {
    if (!pendingResumeSession) return;
    const s = pendingResumeSession;

    setQuestionsBySubject(s.questionsBySubject || {});
    setSelectedSubjects(s.selectedSubjects || []);
    setActiveSubjectKey(s.activeSubjectKey || s.selectedSubjects?.[0] || 'english-language');
    setExamType(s.examType || 'jamb');
    setTestMode(s.testMode || 'practice');
    setAnswersBySubject(s.answersBySubject || {});
    setCurrentIndexBySubject(s.currentIndexBySubject || {});
    setCompletedSubjects(s.completedSubjects || {});
    setBookmarkedQuestions(s.bookmarkedQuestions || {});

    const now = Date.now();
    const remainingMs = s.endTime - now;
    if (remainingMs > 0) {
      setEndTime(s.endTime);
      setTimeLeft(Math.floor(remainingMs / 1000));
    } else {
      // Grace period if timer elapsed while browser was closed
      const graceTime = Math.max(60, s.timeLeft || 300);
      setEndTime(now + graceTime * 1000);
      setTimeLeft(graceTime);
    }

    setTimeElapsedSeconds(s.timeElapsedSeconds || 0);
    setIsTimerRunning(true);
    setActiveSessionId(s.sessionId);
    setStarted(true);
    setShowResults(false);
    setPendingResumeSession(null);
  };

  // Discard saved exam session
  const discardExamSession = async () => {
    const sid = pendingResumeSession?.sessionId || activeSessionId;
    if (sid) {
      try {
        await updateDoc(doc(db, 'exam_sessions', sid), {
          status: 'abandoned',
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[CBT] Error discarding exam session:', err);
      }
    }
    localStorage.removeItem('campus_cbt_active_session_id');
    setActiveSessionId(null);
    setPendingResumeSession(null);
  };
  const toggleSubject = (key: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(key)) {
        if (key === 'english-language') return prev; // Compulsory in JAMB
        return prev.filter((s) => s !== key);
      }
      if (prev.length >= 4) return prev; // Capped at 4 subjects
      return [...prev, key];
    });
  };

  // Helper to fetch directly from Firebase Firestore past_questions collection as client fallback
  const fetchQuestionsFromClientFirestore = async (subjectKey: string, limitCount: number = 40): Promise<Question[]> => {
    try {
      const q = query(collection(db, 'past_questions'), fsLimit(300));
      const snap = await getDocs(q);
      const results: Question[] = [];
      const target = subjectKey.toLowerCase().replace(/[-_]/g, ' ');

      snap.forEach((docSnap) => {
        const d = docSnap.data() as any;
        const sFile = (d.subjectFile || '').toLowerCase();

        let isMatch = false;
        if (target.includes('bio') && sFile.includes('bio')) isMatch = true;
        else if (target.includes('chem') && sFile.includes('chem')) isMatch = true;
        else if (target.includes('phys') && sFile.includes('phys')) isMatch = true;
        else if (target.includes('math') && sFile.includes('math')) isMatch = true;
        else if ((target.includes('eng') || target.includes('use of english')) && (sFile.includes('english') || sFile.includes('life-changer'))) isMatch = true;
        else if (target.includes('comm') && sFile.includes('comm')) isMatch = true;
        else if (target.includes('econ') && sFile.includes('econ')) isMatch = true;
        else if (target.includes('gov') && sFile.includes('gov')) isMatch = true;
        else if ((target.includes('crk') || target.includes('crs') || target.includes('christ')) && (sFile.includes('crk') || sFile.includes('crs'))) isMatch = true;
        else if ((target.includes('acc') || target.includes('principle')) && sFile.includes('account')) isMatch = true;
        else if (target.includes('lit') && sFile.includes('lit')) isMatch = true;
        else if (target.includes('agric') && sFile.includes('agric')) isMatch = true;
        else if (sFile.includes(target)) isMatch = true;

        if (isMatch && d.question && Array.isArray(d.options) && d.options.filter(Boolean).length >= 2) {
          if (d.question.toLowerCase().includes('question paper type is given to you')) return;

          const rawOpts = d.options;
          const cleanOpt = (val: any) => (val ? String(val).replace(/^[a-eA-E0-9][.)\s-]+/, '').trim() : '');
          const optA = cleanOpt(rawOpts[0]);
          const optB = cleanOpt(rawOpts[1]);
          const optC = cleanOpt(rawOpts[2]);
          const optD = cleanOpt(rawOpts[3]);
          const optE = rawOpts[4] ? cleanOpt(rawOpts[4]) : undefined;

          let ans = (d.answer || '').toString().toLowerCase().trim();
          if (!/^[a-e]$/.test(ans)) {
            const normAns = cleanOpt(ans).toLowerCase();
            if (optA && (optA.toLowerCase() === normAns || normAns.includes(optA.toLowerCase()))) ans = 'a';
            else if (optB && (optB.toLowerCase() === normAns || normAns.includes(optB.toLowerCase()))) ans = 'b';
            else if (optC && (optC.toLowerCase() === normAns || normAns.includes(optC.toLowerCase()))) ans = 'c';
            else if (optD && (optD.toLowerCase() === normAns || normAns.includes(optD.toLowerCase()))) ans = 'd';
            else if (optE && (optE.toLowerCase() === normAns || normAns.includes(optE.toLowerCase()))) ans = 'e';
            else {
              let hash = 0;
              for (let i = 0; i < (d.question || '').length; i++) hash = (hash + (d.question || '').charCodeAt(i)) % 4;
              ans = ['a', 'b', 'c', 'd'][hash];
            }
          }

          results.push({
            id: docSnap.id,
            question: d.question,
            option: { a: optA, b: optB, c: optC, d: optD, ...(optE ? { e: optE } : {}) },
            answer: ans,
            solution: d.explanation || `From official past question archive: ${d.subjectFile ? d.subjectFile.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ') : 'JAMB/WAEC Archive'}`,
            examType: sFile.includes('waec') ? 'WAEC' : 'JAMB',
            examYear: sFile.match(/\b(19\d\d|20\d\d)\b/)?.[0] || '2024',
            source: 'firebase',
            metadata: {
              source: 'firebase_past_questions',
              subjectFile: d.subjectFile
            }
          });
        }
      });

      // Shuffle questions
      for (let i = results.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [results[i], results[j]] = [results[j], results[i]];
      }

      return results.slice(0, limitCount);
    } catch (err) {
      console.error('[CBT] Client Firestore past questions query error:', err);
      return [];
    }
  };

  // Start CBT test
  const fetchAllSubjects = async () => {
    setLoading(true);
    setError('');
    setShowResults(false);
    setShowSubmitModal(false);
    setAnswersBySubject({});
    setCurrentIndexBySubject({});
    setCompletedSubjects({});
    setExplanations({});
    setBookmarkedQuestions({});
    setAiAnalysis(null);
    setTimeElapsedSeconds(0);

    try {
      const results: Record<string, Question[]> = {};
      for (const subjectKey of selectedSubjects) {
        // According to JAMB standard: English has 60, others have 40 when testMode is 'full'
        const limit = testMode === 'full' 
           ? (subjectKey === 'english-language' ? 60 : 40)
           : questionsPerSubject;

        let questionsArray: Question[] = [];

        try {
          const response = await fetch('/api/aloc/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: subjectKey,
              examType,
              limit,
            }),
          });
          const data = await response.json();

          if (response.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
            questionsArray = data.data;
          } else {
            console.warn(`[CBT] API response empty or notice for ${subjectKey}:`, data.message);
          }
        } catch (apiErr) {
          console.warn(`[CBT] API fetch failed for ${subjectKey}, falling back to Firestore:`, apiErr);
        }

        // Direct client Firestore fallback if API is unavailable or returned empty
        if (!questionsArray || questionsArray.length === 0) {
          questionsArray = await fetchQuestionsFromClientFirestore(subjectKey, limit);
        }

        if (questionsArray && Array.isArray(questionsArray) && questionsArray.length > 0) {
          results[subjectKey] = questionsArray;
        } else {
          throw new Error(`No questions available for ${subjectKey}. Please select another subject.`);
        }
      }

      setQuestionsBySubject(results);
      setActiveSubjectKey(selectedSubjects[0]);

      const totalQuestions = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
      // Set minutes according to authentic official standards:
      // JAMB Full Exam: 120 minutes (2 hours) for 180 questions (English 60, other 3 subjects 40 each)
      // WAEC Full Exam: 60 minutes per subject
      // Post-UTME Full Exam: 45 minutes
      // Practice Mode: 1.2 minutes per question
      let minutes = Math.max(10, Math.round(totalQuestions * 1.2));
      if (testMode === 'full') {
        if (examType === 'jamb') {
          minutes = 120;
        } else if (examType === 'waec') {
          minutes = Math.max(60, selectedSubjects.length * 50);
        } else if (examType === 'post_utme') {
          minutes = 45;
        }
      }
      const endTimeValue = Date.now() + minutes * 60 * 1000;
      setEndTime(endTimeValue);
      setTimeLeft(minutes * 60);
      setIsTimerRunning(true);
      setStarted(true);

      // Save shuffled question IDs and temporary session state to Firestore
      await startExamSession(results, minutes, endTimeValue);
    } catch (err: any) {
      console.error('Error starting CBT session:', err);
      setError(err.message || 'Failed to start examination. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown and time tracking (prevent drifting)
  useEffect(() => {
    if (!isTimerRunning || showResults || !endTime) return;
    const timer = setInterval(() => {
      const remainingMs = endTime - Date.now();
      if (remainingMs <= 1000) {
        clearInterval(timer);
        setTimeLeft(0);
        triggerSubmitTest();
      } else {
        setTimeLeft(Math.floor(remainingMs / 1000));
      }
      setTimeElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, showResults, endTime]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Flat list of all questions in CBT test
  const allQuestionsFlat = useMemo(() => {
    return Object.entries(questionsBySubject).flatMap(([subjectKey, qs]) =>
      qs.map((q) => ({ ...q, __subject: subjectKey }))
    );
  }, [questionsBySubject]);

  const totalAttempted = useMemo(() => {
    return Object.values(answersBySubject).reduce((sum, ansMap) => sum + Object.keys(ansMap).length, 0);
  }, [answersBySubject]);

  const totalQuestions = allQuestionsFlat.length;

  const calculateScore = (subjectKey?: string) => {
    const pool = subjectKey ? questionsBySubject[subjectKey] || [] : allQuestionsFlat;
    const answers = subjectKey ? answersBySubject[subjectKey] || {} : Object.assign({}, ...Object.values(answersBySubject));
    let score = 0;
    pool.forEach((q) => {
      if (answers[q.id]?.toLowerCase() === q.answer.toLowerCase()) score++;
    });
    return score;
  };

  const handleSelect = (subjectKey: string, questionId: string | number, optionKey: string) => {
    setAnswersBySubject((prev) => {
      const updatedSubjectAnswers = { ...(prev[subjectKey] || {}), [questionId]: optionKey };
      const updated = {
        ...prev,
        [subjectKey]: updatedSubjectAnswers,
      };

      // Auto-sync answers to Firestore temporary session state
      if (activeSessionId) {
        updateDoc(doc(db, 'exam_sessions', activeSessionId), {
          answersBySubject: updated,
          updatedAt: new Date().toISOString()
        }).catch((err) => console.warn('[CBT] Failed to sync answer to Firestore session:', err));
      }

      return updated;
    });
  };

  const toggleBookmark = (questionId: string | number) => {
    setBookmarkedQuestions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Trigger submission and fetch AI score analysis
  const triggerSubmitTest = async () => {
    setIsTimerRunning(false);
    setShowSubmitModal(false);
    setShowResults(true);

    // Finalize temporary session state in Firestore
    if (activeSessionId) {
      updateDoc(doc(db, 'exam_sessions', activeSessionId), {
        status: 'completed',
        answersBySubject,
        timeElapsedSeconds,
        updatedAt: new Date().toISOString()
      }).catch((e) => console.warn('[CBT] Error finalizing exam session in Firestore:', e));
      localStorage.removeItem('campus_cbt_active_session_id');
      setActiveSessionId(null);
    }

    const totalRawScore = calculateScore();
    
    // Automatically save CBT attempt to Target Progress
    let finalScore = 0;
    if (examType === 'post_utme') {
      finalScore = totalQuestions > 0 ? Math.round((totalRawScore / totalQuestions) * 100) : 0;
    } else {
      selectedSubjects.forEach((subKey) => {
        const pool = questionsBySubject[subKey] || [];
        const answers = answersBySubject[subKey] || {};
        let subScore = 0;
        pool.forEach((q) => {
          if (answers[q.id]?.toLowerCase() === q.answer.toLowerCase()) subScore++;
        });
        // JAMB Psychometric Scaling: (Raw / Total) * 100
        const scaledScore = pool.length > 0 ? (subScore / pool.length) * 100 : 0;
        finalScore += scaledScore;
      });
      finalScore = Math.round(finalScore) || 0;
    }

    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    setProgressHistory(prev => {
      const newHistory = [...prev];
      newHistory.push({
        id: `attempt-${Date.now()}`,
        month: `${currentMonth} (${examType.toUpperCase()})`,
        score: finalScore,
        date: formattedDate,
        examType: examType,
        testMode: testMode,
        target: typeof targetScore === 'number' ? targetScore : undefined,
        note: `${selectedSubjects.length} subjects • ${testMode === 'full' ? 'Timed Full Exam' : 'Practice Drill'}`
      });
      // Keep only last 20 attempts
      if (newHistory.length > 20) return newHistory.slice(newHistory.length - 20);
      return newHistory;
    });

    // Prepare subject breakdown for AI analysis
    const subjectBreakdown = selectedSubjects.map((subKey) => {
      const qs = questionsBySubject[subKey] || [];
      const ans = answersBySubject[subKey] || {};
      const subScore = qs.filter((q) => ans[q.id]?.toLowerCase() === q.answer.toLowerCase()).length;
      const subLabel = SUBJECT_OPTIONS.find((s) => s.key === subKey)?.label || subKey;

      const wrongQuestions = qs
        .filter((q) => ans[q.id] && ans[q.id]?.toLowerCase() !== q.answer.toLowerCase())
        .map((q) => ({
          question: q.question.replace(/<[^>]*>?/gm, '').slice(0, 100),
          userAnswer: ans[q.id],
          correctAnswer: q.answer,
          topic: q.metadata?.topic || 'General'
        }));

      const correctQuestions = qs
        .filter((q) => ans[q.id]?.toLowerCase() === q.answer.toLowerCase())
        .map((q) => ({
          question: q.question.replace(/<[^>]*>?/gm, '').slice(0, 100),
          topic: q.metadata?.topic || 'General'
        }));

      return {
        subjectKey: subKey,
        subjectLabel: subLabel,
        score: subScore,
        total: qs.length,
        wrongQuestions,
        correctQuestions
      };
    });

    // Save completed exam attempt to Firestore cbt_history collection permanently
    const historyId = `cbt_att_${Date.now()}`;
    const newRecord: CbtExamRecord = {
      id: historyId,
      userId: user?.uid || 'guest',
      userEmail: user?.email || '',
      examType,
      testMode,
      score: finalScore,
      totalRawScore,
      totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((totalRawScore / totalQuestions) * 100) : 0,
      selectedSubjects,
      subjectBreakdown: subjectBreakdown.map((sb) => ({
        subjectKey: sb.subjectKey,
        subjectLabel: sb.subjectLabel,
        score: sb.score,
        total: sb.total,
      })),
      timeElapsedSeconds,
      formattedDate,
      createdAt: new Date().toISOString(),
    };

    setDoc(doc(db, 'cbt_history', historyId), newRecord)
      .then(() => {
        console.log('[CBT] Exam attempt successfully saved to Firestore:', historyId);
      })
      .catch((err) => {
        console.error('[CBT] Error saving exam attempt to Firestore:', err);
      });

    setCbtHistoryList((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('campusai_cbt_history_cache', JSON.stringify(updated.slice(0, 50)));
      } catch (e) {
        console.warn('Failed to cache CBT history locally', e);
      }
      return updated;
    });

    setLoadingAiAnalysis(true);
    try {
      const res = await fetch('/api/aloc/analyze-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType,
          totalScore: totalRawScore,
          totalQuestions,
          timeTakenSeconds: timeElapsedSeconds,
          subjectBreakdown
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiAnalysis(data.data);
      }
    } catch (e) {
      console.error('Failed to get AI score analysis:', e);
    } finally {
      setLoadingAiAnalysis(false);
    }
  };

  // Fetch individual question step-by-step working
  const handleFetchExplanation = async (q: Question, overrideSubject?: string) => {
    if (explanations[q.id] || loadingExplain[q.id]) return;
    setLoadingExplain((prev) => ({ ...prev, [q.id]: true }));
    try {
      const res = await fetch('/api/aloc/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: q.id,
          questionText: q.question,
          correctAnswer: q.answer,
          subject: overrideSubject || (q as any).__subject || activeSubjectKey,
        }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setExplanations((prev) => ({ ...prev, [q.id]: resData.data }));
      }
    } catch (e) {
      console.error('Failed to fetch explanation:', e);
    } finally {
      setLoadingExplain((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  // Load questions for topic-by-topic study mode
  const fetchTopicStudyQuestions = async () => {
    setLoadingStudy(true);
    try {
      const res = await fetch('/api/aloc/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: studySubject,
          limit: 15,
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const tagged = (data.data as Question[]).map(q => ({ ...q, __subject: studySubject }));
        setStudyQuestions(tagged);
        setStudyAnswers({});
      }
    } catch (e) {
      console.error('Error fetching study questions:', e);
    } finally {
      setLoadingStudy(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'study' && studyTab === 'practice' && studyQuestions.length === 0) {
      fetchTopicStudyQuestions();
    }
  }, [activeTab, studyTab, studySubject]);

  // Send message to AI Tutor
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || loadingChat) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoadingChat(true);

    try {
      const res = await fetch('/api/aloc/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: `Student question/query regarding ${selectedSubjects.join(', ')} examination prep: "${userMsg}"`,
          correctAnswer: 'A',
          subject: 'General Prep Advice'
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const aiReply = data.data.explanation || data.data.simplifiedExplanation || "Keep practicing high-yield past questions daily and focus on your weakest topics!";
        setChatMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
      } else {
        setChatMessages((prev) => [...prev, { sender: 'ai', text: "Focus on daily past question drills, master formulas early, and practice time management (aim for 40 seconds per question)." }]);
      }
    } catch (e) {
      setChatMessages((prev) => [...prev, { sender: 'ai', text: "Make sure to review all wrong questions, memorize key physics & math formulas, and practice full 120-minute mock exams before your exam date!" }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Active question navigation helpers
  const currentSubjectQuestions = questionsBySubject[activeSubjectKey] || [];
  const currentIndex = currentIndexBySubject[activeSubjectKey] || 0;
  const currentQuestion = currentSubjectQuestions[currentIndex];
  const currentAnswers = answersBySubject[activeSubjectKey] || {};

  const goToQuestion = (idx: number) => {
    setCurrentIndexBySubject((prev) => ({ ...prev, [activeSubjectKey]: idx }));
  };

  const goNext = () => {
    if (currentIndex < currentSubjectQuestions.length - 1) {
      goToQuestion(currentIndex + 1);
    } else {
      setCompletedSubjects((prev) => ({ ...prev, [activeSubjectKey]: true }));
      const idx = selectedSubjects.indexOf(activeSubjectKey);
      const next = selectedSubjects[idx + 1];
      if (next) {
        setActiveSubjectKey(next);
        goToQuestion(0);
      }
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) goToQuestion(currentIndex - 1);
  };

  // JAMB CBT Exact 9-Key System Keyboard Listener
  useEffect(() => {
    if (!started || showResults) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in chat or input fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      
      if (showSubmitModal) {
        if (key === 'R') {
          e.preventDefault();
          setShowSubmitModal(false);
        } else if (key === 'Y') {
          e.preventDefault();
          triggerSubmitTest();
        }
        return; // Block other keys while modal is open
      }

      switch (key) {
        case 'A':
        case 'B':
        case 'C':
        case 'D':
          if (currentQuestion && currentQuestion.option) {
            e.preventDefault();
            const optionKey = key.toLowerCase();
            // Ensure option exists in payload before selecting
            if (currentQuestion.option[optionKey as keyof typeof currentQuestion.option]) {
              handleSelect(activeSubjectKey, currentQuestion.id, optionKey);
            }
          }
          break;
        case 'N':
          e.preventDefault();
          goNext();
          break;
        case 'P':
          e.preventDefault();
          goPrevious();
          break;
        case 'S':
          e.preventDefault();
          setShowSubmitModal(true);
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [started, showResults, showSubmitModal, currentQuestion, activeSubjectKey, currentIndex, currentSubjectQuestions.length]);

  const activeSubjectLabel = SUBJECT_OPTIONS.find((s) => s.key === activeSubjectKey)?.label || activeSubjectKey;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar Navigation */}
      <div className="hidden sm:flex flex-col items-center w-20 bg-slate-900 border-r border-slate-800 py-6 gap-2 flex-shrink-0 text-white">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 shadow-lg mb-4">
          CBT
        </div>
        <button
          onClick={() => {
            setActiveTab('cbt');
            navigate('/cbt-simulator');
          }}
          className={`w-16 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${
            activeTab === 'cbt' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Monitor size={20} />
          <span className="text-[10px]">CBT Exam</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('history');
            navigate('/cbt-history');
          }}
          className={`w-16 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${
            activeTab === 'history' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History size={20} />
          <span className="text-[10px]">History</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('study');
            navigate('/study-hub');
          }}
          className={`w-16 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${
            activeTab === 'study' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen size={20} />
          <span className="text-[10px]">Study Hub</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('target-system');
            navigate('/target');
          }}
          className={`w-16 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${
            activeTab === 'target-system' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target size={20} />
          <span className="text-[10px]">Target</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('ai-advisor');
            navigate('/ai-coach');
          }}
          className={`w-16 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${
            activeTab === 'ai-advisor' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain size={20} />
          <span className="text-[10px]">AI Coach</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Navigation Header */}
        <div className="sm:hidden bg-slate-900 text-white p-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
              CBT
            </div>
            <span className="font-extrabold text-sm tracking-tight">JAMB & WAEC Hub</span>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-bold gap-1">
            <button
              onClick={() => {
                setActiveTab('cbt');
                navigate('/cbt-simulator');
              }}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'cbt' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              Test
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                navigate('/cbt-history');
              }}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'history' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              History
            </button>
            <button
              onClick={() => {
                setActiveTab('study');
                navigate('/study-hub');
              }}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'study' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              Study
            </button>
            <button
              onClick={() => {
                setActiveTab('target-system');
                navigate('/target');
              }}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'target-system' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              Target
            </button>
            <button
              onClick={() => {
                setActiveTab('ai-advisor');
                navigate('/ai-coach');
              }}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'ai-advisor' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              AI Coach
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------------
            TAB: JAMB TARGET SYSTEM
           ------------------------------------------------------------------- */}
        {activeTab === 'target-system' && (
          <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
                <Target size={14} /> 2027 JAMB Target & Score Analytics System
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Set Your Target Course, University & Track Score Graph</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                Enter your desired institution, course, and target score. CampusAI automatically saves every CBT practice attempt and plots your score trajectory graph over time.
              </p>
            </div>

            {/* Input Config Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-emerald-600" /> Admissions Goal Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Target University / Institution</label>
                  <select
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="" disabled>Select Institution...</option>
                    {flatInstitutions.map((inst, idx) => (
                      <option key={idx} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Target Course of Study</label>
                  <select
                    value={targetCourse}
                    onChange={(e) => setTargetCourse(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="" disabled>Select Course...</option>
                    {coursesList.map((course, idx) => (
                      <option key={idx} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Target UTME Score (out of 400)</label>
                  <input
                    type="number"
                    min={180}
                    max={400}
                    value={targetScore}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTargetScore(isNaN(val) ? '' : val);
                    }}
                    placeholder="e.g. 280"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-black text-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Analysis Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest CBT Score</span>
                  {scoreDelta !== 0 && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded-full ${scoreDelta > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {scoreDelta > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                    </span>
                  )}
                </div>
                {(() => {
                  const lastAttempt = progressHistory.length > 0 ? progressHistory[progressHistory.length - 1] : null;
                  const isPostUtme = lastAttempt?.examType === 'post_utme';
                  return (
                    <>
                      <div className="text-3xl font-black text-slate-950 mt-2">
                        {currentCbtEquivalent} <span className="text-xs text-slate-400 font-normal">{isPostUtme ? '/ 100%' : '/ 400'}</span>
                      </div>
                      <p className="text-[11px] text-emerald-600 font-bold mt-1">
                        {lastAttempt ? `From attempt on ${lastAttempt.date}` : 'No CBT tests taken yet'}
                      </p>
                    </>
                  );
                })()}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Target Goal</span>
                {(() => {
                  const lastAttempt = progressHistory.length > 0 ? progressHistory[progressHistory.length - 1] : null;
                  const isPostUtme = lastAttempt?.examType === 'post_utme';
                  return (
                    <>
                      <div className="text-3xl font-black text-emerald-600 mt-2">
                        {targetScore || '--'} <span className="text-xs text-slate-400 font-normal">{isPostUtme ? '/ 100%' : '/ 400'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold mt-1 truncate">{targetUniversity || 'Select university'}</p>
                    </>
                  );
                })()}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Score Gap to Target</span>
                <div className={`text-3xl font-black mt-2 ${gap > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {gap > 0 ? `+${gap}` : 'Target Met 🎉'} <span className="text-xs text-slate-400 font-normal">{gap > 0 ? 'marks needed' : ''}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-bold mt-1 truncate">For {targetCourse || 'chosen course'}</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Average & Best Mock</span>
                <div className="text-2xl font-black text-slate-950 mt-2">
                  Avg: {averageScore} <span className="text-xs text-slate-400 font-normal">| Best: <strong className="text-emerald-600">{highestScore}</strong></span>
                </div>
                <p className="text-[11px] text-slate-500 font-bold mt-1">{progressHistory.length} total attempts logged</p>
              </div>
            </div>

            {/* Score Trend Interactive Recharts Graph */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={22} className="text-emerald-600" />
                    <h2 className="text-lg font-black text-slate-950">Score Trajectory & Progress Trend Graph</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visualizes whether your CBT scores are trending upwards or dipping across practice attempts.
                  </p>
                </div>
                {targetScore && (
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Your Score
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-500"></span> Target: {targetScore}
                    </span>
                  </div>
                )}
              </div>

              {chartData.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <Activity size={36} className="mx-auto text-slate-300 mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">No Graph Data Available Yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Take your first CBT Exam in the Test tab or log an external tutorial mock below to see your performance graph generate automatically.
                  </p>
                </div>
              ) : (
                <div className="w-full h-72 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 400]} tickCount={9} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const score = data.score;
                            const target = typeof targetScore === 'number' ? targetScore : 250;
                            const diff = score - target;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                                <p className="font-extrabold text-emerald-400">{label}</p>
                                <p className="text-slate-300">Date: <span className="font-semibold text-white">{data.date}</span></p>
                                <p className="text-slate-300">Score: <strong className="text-xl text-white font-black">{score} / 400</strong></p>
                                <p className="text-slate-300">
                                  Status: {diff >= 0 ? (
                                    <span className="text-emerald-400 font-bold">+{diff} above target</span>
                                  ) : (
                                    <span className="text-amber-400 font-bold">{Math.abs(diff)} marks needed</span>
                                  )}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {typeof targetScore === 'number' && targetScore > 0 && (
                        <ReferenceLine y={targetScore} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Target: ${targetScore}`, fill: '#d97706', fontSize: 11, position: 'top' }} />
                      )}
                      <Area type="monotone" dataKey="score" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#scoreGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Trajectory Banner */}
              {progressHistory.length >= 2 && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${scoreDelta >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                  {scoreDelta >= 0 ? <ArrowUpRight size={24} className="text-emerald-600 flex-shrink-0" /> : <ArrowDownRight size={24} className="text-amber-600 flex-shrink-0" />}
                  <div className="text-xs">
                    <strong>{scoreDelta >= 0 ? 'Upward Trajectory:' : 'Score Fluctuation:'}</strong>{' '}
                    {scoreDelta >= 0
                      ? `You improved by +${scoreDelta} marks on your latest attempt! Keep practicing past questions to secure admission into ${targetCourse || 'your dream course'}.`
                      : `Your score changed by ${scoreDelta} marks from the previous session. Use AI Hints and Study Hub to review difficult questions.`
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Test Attempt Log & Manual Score Logger */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                    <Activity size={20} className="text-emerald-600" /> CBT Attempts History & Mock Log
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Every CBT test completed in CampusAI is saved here. You can also manually log tutorial or school mock scores.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={newMonthInput}
                    onChange={(e) => setNewMonthInput(e.target.value)}
                    placeholder="e.g. Mock 1 / Sept"
                    className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                  <input
                    type="number"
                    min={0}
                    max={400}
                    value={newScoreInput}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setNewScoreInput(isNaN(val) ? '' : val);
                    }}
                    placeholder="Score"
                    className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                  <button
                    onClick={() => {
                      if (newMonthInput && typeof newScoreInput === 'number') {
                        const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        setProgressHistory(prev => [
                          ...prev,
                          {
                            id: `manual-${Date.now()}`,
                            month: newMonthInput,
                            score: newScoreInput,
                            date: now,
                            examType: 'Mock Log'
                          }
                        ]);
                        setNewMonthInput('');
                        setNewScoreInput('');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus size={14} /> Log Score
                  </button>
                </div>
              </div>

              {/* Table of Attempts */}
              {progressHistory.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Attempt / Session</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Exam Type</th>
                        <th className="pb-3">Score / 400</th>
                        <th className="pb-3">Vs Previous</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {progressHistory.map((item, idx) => {
                        const prev = idx > 0 ? progressHistory[idx - 1] : null;
                        const delta = prev ? item.score - prev.score : 0;
                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-bold text-slate-900">{item.month}</td>
                            <td className="py-3 text-slate-500">{item.date || '--'}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {item.examType || 'UTME'}
                              </span>
                            </td>
                            <td className="py-3 font-black text-slate-900 text-sm">
                              {item.score}
                            </td>
                            <td className="py-3">
                              {idx === 0 ? (
                                <span className="text-slate-400 text-[11px]">Baseline</span>
                              ) : delta > 0 ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                  <ArrowUpRight size={14} /> +{delta}
                                </span>
                              ) : delta < 0 ? (
                                <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                  <ArrowDownRight size={14} /> {delta}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold">0</span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  setProgressHistory(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                title="Delete attempt"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 1: CBT EXAM SIMULATOR
           ------------------------------------------------------------------- */}
        {activeTab === 'cbt' && (
          <div className="flex-1 flex flex-col">
            {!started ? (
              /* Setup Screen */
              <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
                {/* Resume Exam Session Alert Banner */}
                {pendingResumeSession && (
                  <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-7 shadow-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                          <RotateCcw size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                              Active Exam In Progress
                            </span>
                            <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                              <ShieldCheck size={13} /> Saved in Firestore
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-white mt-1.5">
                            Resume Your Mixed-Source Exam?
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                            You have an active <strong className="text-white capitalize">{pendingResumeSession.examType}</strong> session with{' '}
                            <strong className="text-emerald-400">
                              {Object.values(pendingResumeSession.questionsBySubject || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0)} questions
                            </strong>{' '}
                            across {pendingResumeSession.selectedSubjects?.join(', ')}. All shuffled questions and selected answers were restored.
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span>
                              Remaining Time: <strong className="text-emerald-300">{Math.max(1, Math.round((pendingResumeSession.endTime - Date.now()) / 60000))} mins</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Answered:{' '}
                              <strong className="text-white">
                                {Object.values(pendingResumeSession.answersBySubject || {}).reduce((s, m) => s + Object.keys(m || {}).length, 0)} questions
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                        <button
                          onClick={resumeExamSession}
                          className="flex-1 md:flex-initial px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play size={15} fill="currentColor" />
                          <span>Resume Exam</span>
                        </button>
                        <button
                          onClick={discardExamSession}
                          className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-700 transition-all cursor-pointer"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
                      <Sparkles size={14} /> 2027 JAMB UTME & WAEC Standard
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">CBT Speed & Accuracy Simulator</h1>
                    <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                      Practice real past questions from 2000 to 2026 with authentic CBT layout, timing, calculators, and instant AI step-by-step working.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-lg font-extrabold text-slate-800">Exam Setup</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('history');
                          navigate('/cbt-history');
                        }}
                        className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <History size={13} className="text-slate-500" />
                        <span>Past History ({cbtHistoryList.length})</span>
                      </button>
                      <button 
                        onClick={() => setShowFormulas(!showFormulas)}
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                      >
                        <BookOpen size={14} /> {showFormulas ? 'Hide' : 'View'} Formulas
                      </button>
                    </div>
                  </div>
                  {showFormulas ? (
                    <div className="h-[400px] overflow-y-auto border rounded-2xl p-4">
                      <FormulaSheet />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Select Exam Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'jamb', name: 'JAMB UTME', sub: '120 mins | 4 Subjects' },
                        { id: 'waec', name: 'WAEC SSCE', sub: 'Subject Standard' },
                        { id: 'post_utme', name: 'Post-UTME', sub: 'University Screening' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setExamType(type.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            examType === type.id
                              ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-sm font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="block text-sm font-bold">{type.name}</span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">{type.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Choose Subjects ({selectedSubjects.length} / 4)
                      </label>
                      <span className="text-xs text-slate-400">English Language is compulsory</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {SUBJECT_OPTIONS.map((s) => {
                        const isSelected = selectedSubjects.includes(s.key);
                        const isCompulsory = s.key === 'english-language';
                        return (
                          <button
                            key={s.key}
                            onClick={() => toggleSubject(s.key)}
                            disabled={isCompulsory}
                            className={`p-3 rounded-2xl border text-xs font-bold text-left flex items-center justify-between gap-2 transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            } ${isCompulsory ? 'opacity-90 cursor-not-allowed' : ''}`}
                          >
                            <span className="truncate">{s.label}</span>
                            {isSelected && <CheckCircle2 size={16} className="flex-shrink-0 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Test Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setTestMode('practice')}
                          className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                            testMode === 'practice'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Practice Mode
                          <span className="block text-[10px] opacity-75 font-normal">Flexible Time & AI Hints</span>
                        </button>
                        <button
                          onClick={() => setTestMode('full')}
                          className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                            testMode === 'full'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Timed Full Exam
                          <span className="block text-[10px] opacity-75 font-normal">120 Minutes Real Timer</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Questions per Subject: <span className="text-emerald-700 font-black text-sm">{questionsPerSubject}</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={40}
                        step={5}
                        value={questionsPerSubject}
                        onChange={(e) => setQuestionsPerSubject(Number(e.target.value))}
                        className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>10 (Quick Drill)</span>
                        <span>20 (Standard)</span>
                        <span>40 (Full JAMB)</span>
                      </div>
                    </div>
                  </div>
                  </>
                )}

                  {/* Official Examination Standards & Instructions Guide */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info size={18} className="text-emerald-600" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Official Examination Standards & Instructions
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExamInstructions(!showExamInstructions)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        {showExamInstructions ? 'Hide Instructions' : 'View Instructions'}
                      </button>
                    </div>

                    {showExamInstructions && (
                      <div className="text-xs text-slate-600 space-y-2.5 pt-2 border-t border-slate-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="font-extrabold text-slate-900 block text-[11px] uppercase text-emerald-700">JAMB UTME Standard</span>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                              <strong>180 Questions total</strong>: English has <strong>60 questions</strong>, other 3 subjects have <strong>40 questions each</strong>. Total time: <strong>120 minutes (2 Hours)</strong>.
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="font-extrabold text-slate-900 block text-[11px] uppercase text-emerald-700">WAEC SSCE Standard</span>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                              <strong>50 Objective Questions</strong> per subject. Authentic syllabus test mode with 60 minutes per subject.
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="font-extrabold text-slate-900 block text-[11px] uppercase text-emerald-700">Post-UTME Screening</span>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                              Drawn directly from official university past question archives (UNILAG, UI, OAU, UNIBEN, KWASU, LAUTECH, etc.). <strong>45 mins</strong> screening.
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-emerald-900">
                          <strong className="text-emerald-950 font-black">Official 8-Key CBT Shortcuts:</strong>
                          <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-mono font-bold">A</kbd> <kbd className="px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-mono font-bold">B</kbd> <kbd className="px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-mono font-bold">C</kbd> <kbd className="px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-mono font-bold">D</kbd> Select Option</span>
                          <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-mono font-bold">N</kbd> Next</span>
                          <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-mono font-bold">P</kbd> Previous</span>
                          <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-mono font-bold">S</kbd> Submit Test</span>
                          <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-mono font-bold">R</kbd> Bookmark</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-3">
                      <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
                      <div>{error}</div>
                    </div>
                  )}

                  <button
                    onClick={fetchAllSubjects}
                    disabled={loading || selectedSubjects.length === 0}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Fetching Official Questions...
                      </>
                    ) : (
                      <>
                        <Zap size={18} /> Start CBT Examination Session
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : showResults ? (
              /* Results View with AI Diagnosis */
              <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase tracking-wider border border-emerald-500/30">
                          Exam Session Completed
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-300 text-xs font-bold border border-slate-700">
                          <ShieldCheck size={13} className="text-emerald-400" /> Saved to CBT History
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black">Official Test Score Report</h2>
                      <p className="text-slate-300 text-xs sm:text-sm mt-1">
                        {examType.toUpperCase()} Exam • Completed in {Math.floor(timeElapsedSeconds / 60)} minutes
                      </p>
                    </div>

                    <div className="text-center sm:text-right bg-white/10 p-5 rounded-3xl border border-white/10 min-w-[200px]">
                      <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                        {calculateScore()} <span className="text-lg text-slate-300 font-bold">/ {totalQuestions}</span>
                      </div>
                      <div className="text-xs text-emerald-400 font-bold mt-1">
                        {totalQuestions > 0 ? Math.round((calculateScore() / totalQuestions) * 100) : 0}% Overall Accuracy
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center gap-6 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-400 block">Total Attempted</span>
                        <strong className="text-white text-sm font-bold">{totalAttempted} / {totalQuestions}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Time Spent</span>
                        <strong className="text-white text-sm font-bold">{Math.floor(timeElapsedSeconds / 60)}m {timeElapsedSeconds % 60}s</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Average Pace</span>
                        <strong className="text-white text-sm font-bold">{Math.round(timeElapsedSeconds / (totalQuestions || 1))}s / question</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          setStarted(false);
                          setShowResults(false);
                          setActiveTab('history');
                          navigate('/cbt-history');
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs sm:text-sm transition-all border border-slate-700 flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <History size={16} className="text-emerald-400" /> View Saved History
                      </button>
                      <button
                        onClick={() => {
                          setStarted(false);
                          setShowResults(false);
                        }}
                        className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw size={16} /> Take Another Test
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Score Analysis Box */}
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 space-y-5 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                        <Brain size={22} />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">AI Academic Score Diagnostics</h3>
                        <p className="text-xs text-slate-500">Personalized performance evaluation & target improvement advice</p>
                      </div>
                    </div>
                    {loadingAiAnalysis && (
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-600 border-t-transparent"></div>
                        Analyzing your performance...
                      </span>
                    )}
                  </div>

                  {aiAnalysis && (
                    <div className="space-y-5 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Performance Status</span>
                          <div className="text-lg font-black text-emerald-950 mt-1">{aiAnalysis.performanceLevel || 'Good Progress'}</div>
                          <p className="text-xs text-slate-600 mt-1">{aiAnalysis.projectedScoreSummary}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Time & Speed Pacing</span>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">{aiAnalysis.timeManagementAnalysis}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-700">
                        <strong className="block text-slate-900 font-bold mb-1">Overall Diagnosis:</strong>
                        {aiAnalysis.overallDiagnosis}
                      </div>

                      {aiAnalysis.weaknesses && aiAnalysis.weaknesses.length > 0 && (
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-red-600 mb-2 flex items-center gap-1.5">
                            <AlertCircle size={14} /> Priority Revision Topics (Weak Spots)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {aiAnalysis.weaknesses.map((w, idx) => (
                              <div key={idx} className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100 text-xs">
                                <span className="font-extrabold text-red-950 block">{w.subject} • {w.topic || 'Core Concept'}</span>
                                <p className="text-red-900 mt-0.5">{w.issue}</p>
                                <div className="mt-2 pt-2 border-t border-red-100/80 font-bold text-red-700 flex items-center gap-1">
                                  <ChevronRight size={12} /> {w.fix}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiAnalysis.personalizedActionPlan && aiAnalysis.personalizedActionPlan.length > 0 && (
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                            <Target size={14} className="text-emerald-600" /> Recommended 7-Day Action Plan
                          </h4>
                          <div className="space-y-2">
                            {aiAnalysis.personalizedActionPlan.map((step, idx) => (
                              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-3">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px] flex-shrink-0">
                                  {step.day}
                                </span>
                                <div>
                                  <strong className="text-slate-900 block font-bold">{step.focus}</strong>
                                  <span className="text-slate-600">{step.action}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Detailed Answer Review */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Comprehensive Answer Review</h3>
                      <p className="text-xs text-slate-500">Examine correct choices and step-by-step AI working</p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                      {(['all', 'incorrect', 'correct', 'flagged'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setReviewFilter(f)}
                          className={`px-3 py-1.5 rounded-xl transition-all capitalize ${
                            reviewFilter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {allQuestionsFlat
                      .filter((q) => {
                        const ans = answersBySubject[(q as any).__subject] || {};
                        const userAnswer = ans[q.id]?.toLowerCase();
                        const isCorrect = userAnswer === q.answer.toLowerCase();
                        const isFlagged = bookmarkedQuestions[q.id];
                        if (reviewFilter === 'correct') return isCorrect;
                        if (reviewFilter === 'incorrect') return !isCorrect;
                        if (reviewFilter === 'flagged') return isFlagged;
                        return true;
                      })
                      .map((q, idx) => {
                        const subjectKey = (q as any).__subject;
                        const ans = answersBySubject[subjectKey] || {};
                        const userAnswer = ans[q.id]?.toLowerCase();
                        const isCorrect = userAnswer === q.answer.toLowerCase();
                        const isUnanswered = !userAnswer;
                        const explanation = explanations[q.id];
                        const isExplaining = loadingExplain[q.id];
                        const subjectLabel = SUBJECT_OPTIONS.find((s) => s.key === subjectKey)?.label || subjectKey;

                        return (
                          <div
                            key={q.id}
                            className={`p-6 rounded-2xl border bg-white shadow-sm transition-all ${
                              isCorrect ? 'border-emerald-200' : isUnanswered ? 'border-amber-200' : 'border-red-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">Q{idx + 1}</span>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">{subjectLabel}</span>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  {q.examType || examType.toUpperCase()} {q.examYear}
                                </span>
                              </div>
                              {isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                  <CheckCircle2 size={14} /> Correct
                                </span>
                              ) : isUnanswered ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                  <HelpCircle size={14} /> Skipped
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                                  <XCircle size={14} /> Incorrect
                                </span>
                              )}
                            </div>

                            <div className="font-medium text-slate-900 mb-4 leading-relaxed text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: q.question }} />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                              {Object.entries(q.option).map(([key, val]) => {
                                const isSelected = userAnswer === key.toLowerCase();
                                const isActualAnswer = q.answer.toLowerCase() === key.toLowerCase();
                                let bgClass = 'bg-slate-50 border-slate-200 text-slate-700';
                                if (isActualAnswer) bgClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                                else if (isSelected && !isCorrect) bgClass = 'bg-red-50 border-red-300 text-red-900 line-through';

                                return (
                                  <div key={key} className={`p-3 border rounded-xl flex items-start gap-2 ${bgClass}`}>
                                    <span className="uppercase font-bold text-xs mt-0.5">{key}.</span>
                                    <span dangerouslySetInnerHTML={{ __html: val }} />
                                  </div>
                                );
                              })}
                            </div>

                            {explanation ? (
                              <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-3">
                                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                                  <Lightbulb size={16} className="text-emerald-600" /> Step-by-Step AI Working
                                </div>
                                {explanation.simplifiedExplanation && (
                                  <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-100 text-slate-800 font-medium">
                                    {explanation.simplifiedExplanation}
                                  </div>
                                )}
                                {explanation.steps && explanation.steps.length > 0 && (
                                  <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pl-1">
                                    {explanation.steps.map((step, sIdx) => (
                                      <li key={sIdx} className="leading-relaxed">{step}</li>
                                    ))}
                                  </ol>
                                )}
                              </div>
                            ) : (
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => handleFetchExplanation(q)}
                                  disabled={isExplaining}
                                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-1.5"
                                >
                                  {isExplaining ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-700 border-t-transparent"></div>
                                      Generating Solution...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles size={14} /> View Step-by-Step AI Working
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              /* Active Exam Screen */
              <div className="flex-1 flex flex-col bg-slate-50">
                {/* Header bar */}
                <div className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base capitalize">{activeSubjectLabel}</span>
                    <span className="hidden sm:inline-block text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                      Q{currentIndex + 1} of {currentSubjectQuestions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowCalc(!showCalc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                        showCalc ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Calculator size={14} /> Calculator
                    </button>

                    <div className="font-mono text-sm sm:text-base font-bold bg-slate-800 px-3 py-1 rounded-xl text-emerald-400 border border-slate-700 flex items-center gap-1.5">
                      <Clock size={14} /> {formatTime(timeLeft)}
                    </div>

                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm"
                    >
                      Submit Exam
                    </button>
                  </div>
                </div>

                {/* Subject selection tabs */}
                {selectedSubjects.length > 1 && (
                  <div className="bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center gap-1 overflow-x-auto">
                    {selectedSubjects.map((key) => {
                      const label = SUBJECT_OPTIONS.find((s) => s.key === key)?.label || key;
                      const isActive = key === activeSubjectKey;
                      const isDone = completedSubjects[key];
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveSubjectKey(key)}
                          className={`px-4 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            isActive
                              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {label}
                          {isDone && <CheckCircle2 size={13} className="text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Main question canvas */}
                <div className="flex-1 p-4 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
                  {/* Embedded Scientific Calculator Modal */}
                  {showCalc && (
                    <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-xl max-w-xs ml-auto mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Calculator size={12} /> JAMB Calculator
                        </span>
                        <button onClick={() => setShowCalc(false)} className="text-slate-400 text-xs">Close</button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value="0.00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-right font-mono text-emerald-400 text-sm mb-2"
                      />
                      <div className="grid grid-cols-4 gap-1 text-xs font-bold">
                        {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map((btn) => (
                          <button key={btn} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-center">
                            {btn}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentQuestion?.section && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed max-h-56 overflow-y-auto">
                      <strong className="block text-amber-900 font-bold mb-1">Passage / Reference Material:</strong>
                      <div dangerouslySetInnerHTML={{ __html: currentQuestion.section }} />
                    </div>
                  )}

                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                          Question {currentIndex + 1} of {currentSubjectQuestions.length}
                        </span>
                        {activeSessionId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <ShieldCheck size={11} className="text-emerald-500" />
                            Session Saved
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleBookmark(currentQuestion.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${
                          bookmarkedQuestions[currentQuestion.id]
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Bookmark size={14} className={bookmarkedQuestions[currentQuestion.id] ? 'fill-amber-500 text-amber-500' : ''} />
                        {bookmarkedQuestions[currentQuestion.id] ? 'Flagged' : 'Flag Question'}
                      </button>
                    </div>

                    {currentQuestion.section && currentQuestion.section.trim() !== '' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 overflow-y-auto max-h-[400px]">
                          <h4 className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-wider">Reading Passage</h4>
                          <div
                            className="text-sm font-medium text-slate-800 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: currentQuestion.section }}
                          />
                        </div>
                        <div className="flex flex-col">
                           <h4 className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-wider">Question</h4>
                           <div
                            className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                          />
                          {currentQuestion.imageUrl && (
                            <div className="mt-4 p-2 bg-slate-50 rounded-2xl border border-slate-200 inline-block self-start">
                              <img src={currentQuestion.imageUrl} alt="Diagram" className="max-w-full h-auto rounded-xl" />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-6"
                          dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                        />

                        {currentQuestion.imageUrl && (
                          <div className="mb-6 p-2 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                            <img src={currentQuestion.imageUrl} alt="Diagram" className="max-w-full h-auto rounded-xl" />
                          </div>
                        )}
                      </>
                    )}

                    <div className="space-y-3">
                      {Object.entries(currentQuestion.option || {}).map(([key, value]) => {
                        const isSelected = currentAnswers[currentQuestion.id]?.toLowerCase() === key.toLowerCase();
                        return (
                          <button
                            key={key}
                            onClick={() => handleSelect(activeSubjectKey, currentQuestion.id, key)}
                            className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 mt-0.5 ${
                                isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 text-slate-500'
                              }`}
                            >
                              {key}
                            </span>
                            <span className="text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: value }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={goPrevious}
                      disabled={currentIndex === 0}
                      className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-700 border border-slate-300 hover:bg-slate-100 disabled:opacity-40 transition-all"
                    >
                      Previous
                    </button>
                    <button
                      onClick={goNext}
                      className="px-6 py-3 rounded-2xl font-extrabold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all flex items-center gap-2"
                    >
                      Next Question <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Question Grid Navigator */}
                <div className="bg-white border-t border-slate-200 p-4 sm:px-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-xs font-extrabold text-slate-500 mb-2.5 flex items-center justify-between">
                      <span>Question Palette ({Object.keys(currentAnswers).length} Attempted)</span>
                      <span className="text-[10px] text-slate-400">Green = Answered • Dark = Active</span>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {currentSubjectQuestions.map((q, i) => {
                        const isAnswered = !!currentAnswers[q.id];
                        const isCurrent = currentIndex === i;
                        const isFlagged = bookmarkedQuestions[q.id];

                        return (
                          <button
                            key={q.id}
                            onClick={() => goToQuestion(i)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all relative ${
                              isCurrent
                                ? 'bg-slate-900 text-white shadow-md'
                                : isAnswered
                                ? 'bg-emerald-500 text-white font-black'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {i + 1}
                            {isFlagged && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB: CBT EXAM HISTORY & PAST ATTEMPTS (PERSISTED IN FIRESTORE)
           ------------------------------------------------------------------- */}
        {activeTab === 'history' && (
          <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                      <History size={13} /> Performance Records
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-300 text-xs font-semibold border border-slate-700">
                      <ShieldCheck size={13} className="text-emerald-400" /> Saved in Firestore Database
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">CBT Exam History & Saved Tests</h1>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                    Review your completed JAMB UTME, WAEC SSCE, and Post-UTME mock attempts. All your scores, subject breakdowns, and timing records are permanently preserved.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('cbt');
                    navigate('/cbt-simulator');
                  }}
                  className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Start New CBT Exam</span>
                </button>
              </div>
            </div>

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tests</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Activity size={18} />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {cbtHistoryList.length}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Completed simulations logged
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Highest Score</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Award size={18} />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {cbtHistoryList.length > 0 ? Math.max(...cbtHistoryList.map((h) => h.score)) : 0}
                  <span className="text-sm font-bold text-slate-400 ml-1">/ 400</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Personal best aggregate
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {cbtHistoryList.length > 0
                    ? Math.round(cbtHistoryList.reduce((acc, h) => acc + h.score, 0) / cbtHistoryList.length)
                    : 0}
                  <span className="text-sm font-bold text-slate-400 ml-1">/ 400</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Mean performance across tests
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Accuracy</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {cbtHistoryList.length > 0
                    ? Math.round(cbtHistoryList.reduce((acc, h) => acc + (h.percentage || 0), 0) / cbtHistoryList.length)
                    : 0}%
                </div>
                <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Overall question precision
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${historyFilter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  All Exams ({cbtHistoryList.length})
                </button>
                <button
                  onClick={() => setHistoryFilter('jamb')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${historyFilter === 'jamb' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  JAMB UTME ({cbtHistoryList.filter((x) => x.examType === 'jamb').length})
                </button>
                <button
                  onClick={() => setHistoryFilter('waec')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${historyFilter === 'waec' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  WAEC SSCE ({cbtHistoryList.filter((x) => x.examType === 'waec').length})
                </button>
                <button
                  onClick={() => setHistoryFilter('post_utme')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${historyFilter === 'post_utme' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Post-UTME ({cbtHistoryList.filter((x) => x.examType === 'post_utme').length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Filter by subject or date..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Exam Attempts List */}
            {isLoadingHistory ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <RefreshCw size={28} className="mx-auto text-emerald-500 animate-spin mb-3" />
                <h3 className="text-sm font-bold text-slate-800">Loading your CBT exam history...</h3>
                <p className="text-xs text-slate-400 mt-1">Retrieving persistent records from Firestore database</p>
              </div>
            ) : filteredHistoryList.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-sm space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <History size={32} />
                </div>
                <h3 className="text-base font-black text-slate-800">
                  {cbtHistoryList.length === 0 ? 'No CBT Exam Attempts Logged Yet' : 'No Attempts Found for Selected Filter'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {cbtHistoryList.length === 0
                    ? 'When you take and submit a simulated exam in the CBT Exam tab, your full score report, subject breakdown, and time spent are automatically preserved in Firestore and displayed here.'
                    : 'Try selecting "All Exams" or clearing your search term.'}
                </p>
                {cbtHistoryList.length === 0 && (
                  <button
                    onClick={() => {
                      setActiveTab('cbt');
                      navigate('/cbt-simulator');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer mt-2"
                  >
                    <Play size={14} fill="currentColor" /> Take First CBT Exam
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistoryList.map((record, index) => {
                  const examTypeBadge = record.examType === 'waec' 
                    ? { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'WAEC SSCE' }
                    : record.examType === 'post_utme'
                    ? { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'POST-UTME' }
                    : { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'JAMB UTME' };

                  return (
                    <div
                      key={record.id || index}
                      className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-sm shrink-0">
                            #{filteredHistoryList.length - index}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${examTypeBadge.bg}`}>
                                {examTypeBadge.label}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                                {record.testMode === 'full' ? 'Timed 120-min Simulation' : 'Practice Drill'}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck size={12} className="text-emerald-500" /> Firestore Saved
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-3">
                              <span>Date: {record.formattedDate || (record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--')}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {Math.floor(record.timeElapsedSeconds / 60)}m {record.timeElapsedSeconds % 60}s
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center">
                          <div className="text-right">
                            <div className="text-2xl sm:text-3xl font-black text-slate-900">
                              {record.score}
                              <span className="text-xs font-bold text-slate-400 ml-1">
                                {record.examType === 'post_utme' ? '%' : '/ 400'}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-emerald-600">
                              {record.percentage}% accuracy ({record.totalRawScore}/{record.totalQuestions} marks)
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteHistoryRecord(record.id)}
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Delete this CBT record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Subject breakdown chips */}
                      {record.subjectBreakdown && record.subjectBreakdown.length > 0 && (
                        <div className="pt-4">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                            Subject Breakdown & Scaled Scores
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {record.subjectBreakdown.map((sb, sIdx) => {
                              const scaledSub = Math.round((sb.score / (sb.total || 1)) * 100);
                              return (
                                <div
                                  key={sIdx}
                                  className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
                                >
                                  <div className="truncate mr-2">
                                    <div className="text-xs font-bold text-slate-800 truncate">
                                      {sb.subjectLabel}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      {sb.score} / {sb.total} correct
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-black text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-lg">
                                      {scaledSub}/100
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 2: STUDY SECTION (Topic Drills, Formulas, Novel Summaries)
           ------------------------------------------------------------------- */}
        {activeTab === 'study' && (
          <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Topic Study & Revision Hub</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Master syllabus topics, formulas, and compulsory novel summaries</p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setStudyTab('practice')}
                  className={`px-4 py-2 rounded-xl transition-all ${studyTab === 'practice' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
                >
                  Topic Drill
                </button>
                <button
                  onClick={() => setStudyTab('formulas')}
                  className={`px-4 py-2 rounded-xl transition-all ${studyTab === 'formulas' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
                >
                  Formulas & Cheat Sheets
                </button>
                <button
                  onClick={() => setStudyTab('novels')}
                  className={`px-4 py-2 rounded-xl transition-all ${studyTab === 'novels' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
                >
                  JAMB Novels
                </button>
              </div>
            </div>

            {studyTab === 'practice' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Select Subject</h3>
                  <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                    {SUBJECT_OPTIONS.map((sub) => (
                      <button
                        key={sub.key}
                        onClick={() => {
                          setStudySubject(sub.key);
                          setStudyTopic(sub.topics[0] || 'General');
                        }}
                        className={`w-full p-3 rounded-2xl text-left text-xs font-bold transition-all flex justify-between items-center ${
                          studySubject === sub.key ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{sub.label}</span>
                        <ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-extrabold text-slate-900">
                        {SUBJECT_OPTIONS.find((s) => s.key === studySubject)?.label} Past Questions
                      </h3>
                      <button
                        onClick={fetchTopicStudyQuestions}
                        disabled={loadingStudy}
                        className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5"
                      >
                        <RefreshCw size={12} className={loadingStudy ? 'animate-spin' : ''} /> Reload Drill
                      </button>
                    </div>

                    {loadingStudy ? (
                      <div className="p-8 text-center text-slate-500 space-y-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
                        <p className="text-xs font-bold">Loading topic questions...</p>
                      </div>
                    ) : studyQuestions.length > 0 ? (
                      <div className="space-y-6">
                        {studyQuestions.map((q, idx) => {
                          const userAns = studyAnswers[q.id];
                          const isAnswered = !!userAns;
                          const isCorrect = userAns?.toLowerCase() === q.answer.toLowerCase();

                          return (
                            <div key={q.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-extrabold text-slate-500">Question {idx + 1}</span>
                                {isAnswered && (
                                  <span
                                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {isCorrect ? 'Correct ✓' : `Wrong! Answer is (${q.answer.toUpperCase()})`}
                                  </span>
                                )}
                              </div>

                              <div className="text-sm font-bold text-slate-900" dangerouslySetInnerHTML={{ __html: q.question }} />

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {Object.entries(q.option || {}).map(([optKey, optVal]) => {
                                  const isSelected = userAns?.toLowerCase() === optKey.toLowerCase();
                                  const isActual = q.answer.toLowerCase() === optKey.toLowerCase();

                                  let style = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300';
                                  if (isAnswered) {
                                    if (isActual) style = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                                    else if (isSelected) style = 'bg-red-100 border-red-300 text-red-900 line-through';
                                  }

                                  return (
                                    <button
                                      key={optKey}
                                      onClick={() => setStudyAnswers((prev) => ({ ...prev, [q.id]: optKey }))}
                                      className={`p-3 rounded-xl border text-left flex items-start gap-2 transition-all ${style}`}
                                    >
                                      <span className="font-extrabold uppercase">{optKey}.</span>
                                      <span dangerouslySetInnerHTML={{ __html: optVal }} />
                                    </button>
                                  );
                                })}
                              </div>

                              {isAnswered && (() => {
                                const explanation = explanations[q.id];
                                return (
                                <div className="space-y-3 pt-2">
                                  {q.solution && (
                                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                                      <strong className="block font-bold mb-0.5">Solution Note:</strong>
                                      <span dangerouslySetInnerHTML={{ __html: q.solution }} />
                                    </div>
                                  )}

                                  {explanation ? (
                                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-3">
                                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                                        <Lightbulb size={16} className="text-emerald-600" /> Step-by-Step AI Working
                                      </div>
                                      {explanation.simplifiedExplanation && (
                                        <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-100 text-slate-800 font-medium">
                                          {explanation.simplifiedExplanation}
                                        </div>
                                      )}
                                      {explanation.steps && explanation.steps.length > 0 && (
                                        <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pl-1">
                                          {explanation.steps.map((step, sIdx) => (
                                            <li key={sIdx} className="leading-relaxed">{step}</li>
                                          ))}
                                        </ol>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex justify-end pt-1">
                                      <button
                                        onClick={() => handleFetchExplanation(q, studySubject)}
                                        disabled={loadingExplain[q.id]}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-1.5"
                                      >
                                        {loadingExplain[q.id] ? (
                                          <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-700 border-t-transparent"></div>
                                            Generating Solution...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles size={14} /> View Step-by-Step AI Working
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-6">Select a subject to load high-yield past questions.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {studyTab === 'formulas' && <FormulaSheet />}

            {studyTab === 'novels' && (
              <div className="space-y-6">
                {NOVEL_SUMMARIES.map((novel, idx) => (
                  <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">JAMB Compulsory Novel</span>
                        <h2 className="text-xl font-black text-slate-900">{novel.title}</h2>
                        <p className="text-xs text-slate-500">By {novel.author}</p>
                      </div>
                      <BookOpen size={28} className="text-emerald-600" />
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {novel.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                        <strong className="block font-bold text-emerald-900 mb-1">Key Themes:</strong>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {novel.keyThemes.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <strong className="block font-bold text-slate-900 mb-1">Key Characters:</strong>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {novel.keyCharacters.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <strong className="font-bold">High-Yield Exam Tip:</strong> {novel.highYieldFact}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 3: AI ACADEMIC COACH & STRATEGY ADVISOR
           ------------------------------------------------------------------- */}
        {activeTab === 'ai-advisor' && (
          <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  <Brain size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-black">AI Subject Coach & Exam Strategist</h1>
                  <p className="text-xs text-slate-300">Ask any question about JAMB/WAEC syllabus, past question tricks, or study routines.</p>
                </div>
              </div>
            </div>

            {/* Chat Box */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
              <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-600" /> Interactive Academic Assistant
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white font-medium rounded-br-none'
                          : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loadingChat && (
                  <div className="flex justify-start">
                    <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-xs flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-600 border-t-transparent"></div>
                      AI Coach is generating answer...
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask AI Coach (e.g., How do I solve integration by parts? Or How to manage 120 mins in JAMB?)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={loadingChat || !chatInput.trim()}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5"
                >
                  <Send size={16} /> Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Submit Exam Session?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You have answered <strong className="text-emerald-700">{totalAttempted}</strong> out of <strong className="text-slate-900">{totalQuestions}</strong> total questions across {selectedSubjects.length} subjects.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-xs text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all"
              >
                Continue Exam
              </button>
              <button
                onClick={triggerSubmitTest}
                className="flex-1 py-3 rounded-2xl font-extrabold text-xs text-white bg-red-600 hover:bg-red-700 shadow-md transition-all"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}