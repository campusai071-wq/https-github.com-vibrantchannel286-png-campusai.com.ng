import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { FormulaSheet } from './FormulaSheet';
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
  Lock
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
  option: { a: string; b: string; c: string; d: string };
  answer: string;
  solution?: string;
  examType?: string;
  examYear?: string;
  section?: string | null;
  hasPassage?: boolean;
  imageUrl?: string | null;
  category?: string | null;
  metadata?: {
    topic?: string;
    subtopic?: string;
    difficultyScore?: number;
  };
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
}

export default function CbtSimulator({ user, setIsScholarPackOpen, setPaymentConfig }: CbtSimulatorProps) {
  // Navigation tabs: 'cbt' | 'study' | 'target-system' | 'ai-advisor'
  const [activeTab, setActiveTab] = useState<'cbt' | 'study' | 'target-system' | 'ai-advisor'>('cbt');
  const [targetUniversity, setTargetUniversity] = useState('');
  const [targetCourse, setTargetCourse] = useState('');
  const [targetScore, setTargetScore] = useState<number | ''>('');
  const [progressHistory, setProgressHistory] = useState<{ month: string, score: number }[]>([]);

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
  const gap = Math.max(0, (typeof targetScore === 'number' ? targetScore : 0) - currentCbtEquivalent);

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
    if (gap > 50) return 'Chemistry — Stoichiometry & Mole Concepts';
    if (gap > 25) return 'Physics — Electromagnetic Induction & Waves';
    return 'Mathematics — Advanced Calculus & Integration';
  }, [gap]);


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

  const [loading, setLoading] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  // ----- Timer -----
  const [timeLeft, setTimeLeft] = useState(0);
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

  // Toggle subject selection in CBT setup
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
        const response = await fetch('/api/aloc/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: subjectKey,
            examType,
            limit: questionsPerSubject,
          }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(`Failed to load ${subjectKey}: ${data.message || 'Server error'}`);
        }

        const questionsArray = data.data;
        if (questionsArray && Array.isArray(questionsArray) && questionsArray.length > 0) {
          results[subjectKey] = questionsArray;
        } else {
          throw new Error(`No questions available for ${subjectKey}. Please select another subject.`);
        }
      }

      setQuestionsBySubject(results);
      setActiveSubjectKey(selectedSubjects[0]);

      const totalQuestions = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
      const minutes = testMode === 'full' ? 120 : Math.max(10, Math.round(totalQuestions * 1.2));
      setTimeLeft(minutes * 60);
      setIsTimerRunning(true);
      setStarted(true);
    } catch (err: any) {
      console.error('Error starting CBT session:', err);
      setError(err.message || 'Failed to start examination. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown and time tracking
  useEffect(() => {
    if (!isTimerRunning || showResults) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerSubmitTest();
          return 0;
        }
        return prev - 1;
      });
      setTimeElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, showResults]);

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
    setAnswersBySubject((prev) => ({
      ...prev,
      [subjectKey]: { ...(prev[subjectKey] || {}), [questionId]: optionKey },
    }));
  };

  const toggleBookmark = (questionId: string | number) => {
    setBookmarkedQuestions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Trigger submission and fetch AI score analysis
  const triggerSubmitTest = async () => {
    setIsTimerRunning(false);
    setShowSubmitModal(false);
    setShowResults(true);

    const totalScore = calculateScore();
    
    // Automatically save CBT attempt to Target Progress
    const jambEquivalentScore = Math.round((totalScore / totalQuestions) * 400) || 0;
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    setProgressHistory(prev => {
      const newHistory = [...prev];
      // Check if last entry is this month, if so, we can add a new one or update
      newHistory.push({ month: `${currentMonth} (Attempt)`, score: jambEquivalentScore });
      // Keep only last 12 attempts to avoid infinite array
      if (newHistory.length > 12) return newHistory.slice(newHistory.length - 12);
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

    setLoadingAiAnalysis(true);
    try {
      const res = await fetch('/api/aloc/analyze-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType,
          totalScore,
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
  const handleFetchExplanation = async (q: Question) => {
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
          subject: (q as any).__subject || activeSubjectKey,
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
        setStudyQuestions(data.data);
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

  const activeSubjectLabel = SUBJECT_OPTIONS.find((s) => s.key === activeSubjectKey)?.label || activeSubjectKey;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar Navigation */}
      <div className="hidden sm:flex flex-col items-center w-20 bg-slate-900 border-r border-slate-800 py-6 gap-2 flex-shrink-0 text-white">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 shadow-lg mb-4">
          CBT
        </div>
        <button
          onClick={() => setActiveTab('cbt')}
          className={`w-16 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${
            activeTab === 'cbt' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Monitor size={20} />
          <span className="text-[10px]">CBT Exam</span>
        </button>
        <button
          onClick={() => setActiveTab('study')}
          className={`w-16 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${
            activeTab === 'study' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen size={20} />
          <span className="text-[10px]">Study Hub</span>
        </button>
        <button
          onClick={() => setActiveTab('target-system')}
          className={`w-16 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${
            activeTab === 'target-system' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target size={20} />
          <span className="text-[10px]">Target</span>
        </button>
        <button
          onClick={() => setActiveTab('ai-advisor')}
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
              onClick={() => setActiveTab('cbt')}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'cbt' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              Test
            </button>
            <button
              onClick={() => setActiveTab('study')}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'study' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              Study
            </button>
            <button
              onClick={() => setActiveTab('target-system')}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'target-system' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              Target
            </button>
            <button
              onClick={() => setActiveTab('ai-advisor')}
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
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Set Your Dream University & Course Target</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                Enter your desired institution, course, and target UTME score. CampusAI automatically tracks your CBT equivalent, gap analysis, priority subjects, and monthly progression.
              </p>
            </div>

            {/* Input Config Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-emerald-600" /> Admissions Goal Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">University / Institution</label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Course of Study</label>
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
                    placeholder="e.g. 250"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-black text-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Analysis Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Current CBT Equivalent</span>
                <div className="text-3xl font-black text-slate-950 mt-2">{currentCbtEquivalent} <span className="text-xs text-slate-400 font-normal">/ 400</span></div>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">Based on recent practice tests</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Target Score</span>
                <div className="text-3xl font-black text-emerald-600 mt-2">{targetScore} <span className="text-xs text-slate-400 font-normal">/ 400</span></div>
                <p className="text-[11px] text-slate-500 font-bold mt-1">{targetUniversity}</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Score Gap</span>
                <div className="text-3xl font-black text-amber-600 mt-2">+{gap} <span className="text-xs text-slate-400 font-normal">marks</span></div>
                <p className="text-[11px] text-slate-500 font-bold mt-1">Needed for {targetCourse}</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Priority Subjects</span>
                <div className="text-sm font-black text-slate-950 mt-3">{prioritySubjects}</div>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">High weight for {targetCourse}</p>
              </div>
            </div>

            {/* Next Recommended Test & AI Action */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30">
                  AI Next Recommendation
                </span>
                <h3 className="text-xl font-black tracking-tight">{nextRecommendedTest}</h3>
                <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                  To close your +{gap} mark gap for {targetCourse}, our AI recommends mastering this high-yield topic immediately in the CBT Exam module.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('cbt')}
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex-shrink-0 flex items-center gap-2"
              >
                Start Recommended Test <ChevronRight size={16} />
              </button>
            </div>

            {/* Progress Tracking Timeline & Growth Chart */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-600" /> Progress Tracking & Monthly Growth
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Students can actually see themselves improving month by month toward their {targetScore} target.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMonthInput}
                    onChange={(e) => setNewMonthInput(e.target.value)}
                    placeholder="Month (e.g. Jan)"
                    className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                  <input
                    type="number"
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
                        setProgressHistory([...progressHistory, { month: newMonthInput, score: newScoreInput }]);
                        setNewMonthInput('');
                        setNewScoreInput('');
                      }
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Add Score
                  </button>
                </div>
              </div>

              {/* Timeline Display */}
              {progressHistory.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 mt-4">
                  <TrendingUp size={32} className="mx-auto text-slate-300 mb-3" />
                  <h3 className="text-sm font-bold text-slate-700">No Progress Recorded Yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Start taking CBT practice exams or manually log your scores above to start building your JAMB progress timeline.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-4">
                  {progressHistory.map((item, index) => {
                    const isLatest = index === progressHistory.length - 1;
                    return (
                      <div key={index} className={`p-4 rounded-2xl border text-center relative ${isLatest ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                        {isLatest && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
                            Current
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-500 block">{item.month}</span>
                        <div className="text-2xl font-black text-slate-950 mt-2">{item.score}</div>
                        <span className="text-[10px] text-slate-400 block mt-1">UTME Score</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Visual Progress Bar to Target */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Progress to Target ({currentCbtEquivalent} / {targetScore || '-'})</span>
                  <span className="text-emerald-600">{Math.round((currentCbtEquivalent / (typeof targetScore === 'number' ? targetScore : 1)) * 100)}% Achieved</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${typeof targetScore === 'number' && targetScore > 0 ? Math.min(100, Math.max(5, (currentCbtEquivalent / targetScore) * 100)) : 0}%` }}
                  ></div>
                </div>
              </div>
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
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-slate-800">Exam Setup</h2>
                    <button 
                      onClick={() => setShowFormulas(!showFormulas)}
                      className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                    >
                      <BookOpen size={14} /> {showFormulas ? 'Hide' : 'View'} Formulas
                    </button>
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
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-2 border border-emerald-500/30">
                        Exam Session Completed
                      </span>
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

                    <button
                      onClick={() => {
                        setStarted(false);
                        setShowResults(false);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                    >
                      <RotateCcw size={16} /> Take Another Test
                    </button>
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
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                        Question {currentIndex + 1} of {currentSubjectQuestions.length}
                      </span>
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

                    <div
                      className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-6"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                    />

                    {currentQuestion.imageUrl && (
                      <div className="mb-6 p-2 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                        <img src={currentQuestion.imageUrl} alt="Diagram" className="max-w-full h-auto rounded-xl" />
                      </div>
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

                              {isAnswered && q.solution && (
                                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                                  <strong className="block font-bold mb-0.5">Solution Note:</strong>
                                  <span dangerouslySetInnerHTML={{ __html: q.solution }} />
                                </div>
                              )}
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