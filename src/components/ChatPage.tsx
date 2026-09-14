import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, Send, Loader2, Trash2, Download, Volume2, VolumeX,
  Copy, Check, Share2, RotateCcw, ThumbsUp, ThumbsDown, ArrowUpRight,
  ShieldCheck, Zap, Paperclip, FileText, X, ArrowDown, ChevronRight,
  BookOpen, HelpCircle, GraduationCap, Award, School, MessageSquare,
  Sparkle, AlertCircle, Wrench, ShieldAlert
} from 'lucide-react';
import Markdown from 'react-markdown';
import * as pdfjs from 'pdfjs-dist';
import { executeAiChatStream, sanitizeGroundingChunks } from '../services/geminiService';
import { checkAndIncrementChats, getLocalProfile, isRealUser, getChatLimits } from '../services/userService';
import { getGlobalConfig } from '../services/dbService';
import { VoiceInputButton } from './VoiceInputButton';
import { speakText, stopAllSpeech } from '../utils/audioPlayer';
import { ChatMessage } from '../types';
import QuotaModal from './QuotaModal';
import SEO from './SEO';
import { useNavigate } from 'react-router-dom';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type GroundingChunk = any;

const WELCOME_MESSAGE: ChatMessage = {
  role: 'model',
  text: "Hello! I am **CampusAI**, your official 2026 Academic Strategist & Admissions Advisor. I am grounded in live Nigerian university portals, JAMB CAPS telemetry, departmental cutoffs, and post-UTME screening requirements.\n\nHow can I guide your admission strategy today? Ask me about specific schools, courses, aggregate calculations, or CAPS status updates!"
};

const getChatStorageKey = (uid?: string) => {
  return uid ? `campusai_chat_messages_${uid}` : 'campusai_chat_messages_guest';
};

interface ChatPageProps {
  user?: any;
  onLoginRequest?: () => void;
  onSignUpRequest?: () => void;
  onScholarPackRequest?: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  user,
  onLoginRequest,
  onSignUpRequest,
  onScholarPackRequest
}) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => getLocalProfile());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini action states
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [likes, setLikes] = useState<Record<number, 'like' | 'dislike' | null>>({});
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const [isUnderMaintenance, setIsUnderMaintenance] = useState<boolean>(() => {
    const saved = localStorage.getItem('campusai_chat_maintenance');
    return saved !== null ? saved === 'true' : false;
  });

  useEffect(() => {
    const syncMaintenanceFromCloud = async () => {
      try {
        const config = await getGlobalConfig();
        if (config && config.isChatUnderMaintenance !== undefined) {
          const isMaint = Boolean(config.isChatUnderMaintenance);
          setIsUnderMaintenance(isMaint);
          localStorage.setItem('campusai_chat_maintenance', isMaint ? 'true' : 'false');
        }
      } catch (err) {
        console.warn("Could not sync maintenance config from db", err);
      }
    };
    syncMaintenanceFromCloud();
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const key = getChatStorageKey(user?.uid);
      const stored = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      if (!user?.uid) {
        const legacy = localStorage.getItem('campusai_chat_messages') || sessionStorage.getItem('campusai_chat_messages');
        if (legacy) return JSON.parse(legacy);
      }
    } catch {}
    return [WELCOME_MESSAGE];
  });

  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Sync when user prop or UID updates
  useEffect(() => {
    if (user) setProfile(user);
    try {
      const key = getChatStorageKey(user?.uid);
      const stored = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch {}
  }, [user]);

  // Persist messages
  useEffect(() => {
    if (!isLoading) {
      try {
        const key = getChatStorageKey(user?.uid);
        const data = JSON.stringify(messages);
        localStorage.setItem(key, data);
        sessionStorage.setItem(key, data);
      } catch {}
    }
  }, [messages, isLoading, user?.uid]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scanSteps = [
    "Grounding official university cutoffs...",
    "Querying 2026/2027 admissions database...",
    "Validating departmental threshold guidelines...",
    "Checking JAMB CAPS policy parameters...",
    "Compiling personalized strategic breakdown..."
  ];

  useEffect(() => {
    if (!isLoading) { setLoadingStep(0); return; }
    setLoadingStep(0);
    const timer = setInterval(() => setLoadingStep(p => (p + 1) % scanSteps.length), 2200);
    return () => clearInterval(timer);
  }, [isLoading]);

  // Auto scroll
  const lastScrollTimeRef = useRef(0);
  useEffect(() => {
    const now = Date.now();
    if (now - lastScrollTimeRef.current > 60) {
      lastScrollTimeRef.current = now;
      messagesEndRef.current?.scrollIntoView({ behavior: isLoading ? 'auto' : 'smooth' });
    }
  }, [messages, isLoading]);

  const handleContainerScroll = useCallback(() => {
    if (!messageContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 140;
    setShowScrollBottom(isFarFromBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    try {
      const key = getChatStorageKey(user?.uid);
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      localStorage.removeItem('campusai_chat_messages');
      sessionStorage.removeItem('campusai_chat_messages');
    } catch {}
    showToast("Chat history cleared");
  }, [user?.uid]);

  const handleExportChat = useCallback(() => {
    if (messages.length <= 1) {
      showToast("No chat history to export yet.");
      return;
    }
    const dateStr = new Date().toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const transcriptLines = [
      `# CampusAI Academic Strategy Chat Transcript`,
      `Date: ${dateStr}`,
      `User ID: ${user?.uid || 'Guest User'}`,
      `Platform: CampusAI.ng (Federated Intelligence Network)`,
      `==================================================\n`
    ];

    messages.forEach((msg) => {
      const sender = msg.role === 'user' ? '👤 STUDENT' : '🤖 CAMPUSAI STRATEGY ADVISOR';
      transcriptLines.push(`### ${sender}\n${msg.text}\n`);
    });

    const blob = new Blob([transcriptLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampusAI_Chat_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Chat transcript downloaded!");
  }, [messages, user?.uid]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
          const pdf = await pdfjs.getDocument(typedArray).promise;
          let text = '';
          for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ') + '\n';
          }
          setAttachedFile({ name: file.name, content: text });
          showToast(`PDF attached: ${file.name}`);
        } catch (error) {
          console.error('PDF parsing error:', error);
          showToast('Could not parse PDF. Trying text fallback.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || `Uploaded file: ${file.name}`;
        setAttachedFile({ name: file.name, content: text });
        showToast(`File attached: ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  const handleSendMessage = useCallback(async (textToSend?: string) => {
    let currentInput = (textToSend || input).trim();
    if ((!currentInput && !attachedFile) || isLoading) return;

    if (attachedFile) {
      let fileContent = attachedFile.content;
      if (fileContent.length > 12000) {
        fileContent = fileContent.substring(0, 12000) + "\n[... Document truncated due to length ...] ";
      }
      currentInput = `[Attached Document: ${attachedFile.name}]\n${fileContent}\n\nUser Question/Request: ${currentInput || 'Please analyze this uploaded document and provide insights.'}`;
    }

    const quotaCheck = await checkAndIncrementChats(user?.uid || '');
    if (!quotaCheck.allowed) {
      setIsQuotaModalOpen(true);
      return;
    }

    const userMessage: ChatMessage = { role: 'user', text: textToSend || input || `Uploaded file: ${attachedFile?.name}` };
    const latestMessages = messagesRef.current;

    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    let lastStreamTime = 0;

    try {
      await executeAiChatStream(
        currentInput,
        latestMessages,
        (streamedText, groundingChunks) => {
          const now = Date.now();
          if (now - lastStreamTime > 25 || !streamedText) {
            lastStreamTime = now;
            setMessages(prev => {
              const newArr = [...prev];
              const lastIdx = newArr.length - 1;
              if (lastIdx >= 0 && newArr[lastIdx].role === 'model') {
                newArr[lastIdx] = {
                  ...newArr[lastIdx],
                  text: streamedText,
                  groundingChunks: groundingChunks || newArr[lastIdx].groundingChunks
                };
              }
              return newArr;
            });
          }
        }
      );
    } catch (err: any) {
      console.error("Chat execution error:", err);
      setMessages(prev => {
        const newArr = [...prev];
        const lastIdx = newArr.length - 1;
        if (lastIdx >= 0 && newArr[lastIdx].role === 'model') {
          newArr[lastIdx] = {
            role: 'model',
            text: "I experienced a temporary connection glitch while querying the admissions portal. Please try your prompt again!"
          };
        }
        return newArr;
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, attachedFile, isLoading, user?.uid]);

  // Handle incoming prompts from other pages or custom events
  useEffect(() => {
    const pending = sessionStorage.getItem('campusai_pending_prompt');
    if (pending) {
      sessionStorage.removeItem('campusai_pending_prompt');
      setTimeout(() => {
        handleSendMessage(pending);
      }, 350);
    }

    const handler = (e: any) => {
      if (e.detail && typeof e.detail === 'string') {
        handleSendMessage(e.detail);
      }
    };
    window.addEventListener('campusai_open_ai', handler);
    return () => window.removeEventListener('campusai_open_ai', handler);
  }, [handleSendMessage]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast("Response copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleLike = (index: number, type: 'like' | 'dislike') => {
    setLikes(prev => ({
      ...prev,
      [index]: prev[index] === type ? null : type
    }));
    showToast(type === 'like' ? "Helpful response recorded!" : "Feedback recorded.");
  };

  const handleSpeech = (text: string, index: number) => {
    if (speakingIndex === index) {
      stopAllSpeech();
      setSpeakingIndex(null);
    } else {
      stopAllSpeech();
      setSpeakingIndex(index);
      const cleanText = text.replace(/[*_#`~\[\]]/g, '');
      speakText(cleanText, { onEnd: () => setSpeakingIndex(null) });
    }
  };

  const starterCategories = [
    {
      title: "Cutoffs & Screening",
      icon: <Award size={14} className="text-amber-500" />,
      prompts: [
        "What are the departmental cutoff marks for UNILAG Computer Science and Medicine?",
        "How is the FUTA aggregate score calculated from JAMB and O'Level points?",
        "What are the official merit cutoffs for University of Ibadan (UI)?"
      ]
    },
    {
      title: "JAMB CAPS & Admissions",
      icon: <GraduationCap size={14} className="text-blue-500" />,
      prompts: [
        "What does 'Admission in Progress' (AIP) mean on JAMB CAPS?",
        "How do I accept or reject admission offer on JAMB CAPS portal?",
        "Can I change my institution after checking my aggregate score?"
      ]
    },
    {
      title: "Subject Combinations & O'Level",
      icon: <BookOpen size={14} className="text-emerald-500" />,
      prompts: [
        "What are the required UTME subjects for Nursing and Pharmacy in Nigeria?",
        "Can I combine WAEC and NECO results for admission screening?",
        "What happens if I have D7 in Mathematics for an Arts/Social Science course?"
      ]
    }
  ];

  const { maxChats, remainingChats } = getChatLimits(profile);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-16 transition-colors">
      <SEO
        title="AI Admissions Chat Advisor | 2026 Strategy Desk"
        description="Consult the CampusAI Strategy Advisor for instant, grounded answers on 2026 Nigerian university cutoffs, JAMB CAPS status, and post-UTME screening requirements."
        canonical="/chat"
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[250] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/10"
            >
              <Sparkles size={14} className="text-cyan-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Brain size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  CampusAI Strategy Advisor
                  <Sparkles size={16} className="text-cyan-500" />
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                  2026 Engine
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Grounded in verified Nigerian university portals & JAMB CAPS policies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Chat quota pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <span className="text-[11px] font-mono">
                {isUnderMaintenance ? 'Under Maintenance' : `${remainingChats} / ${maxChats} Queries`}
              </span>
              {onScholarPackRequest && (
                <button
                  onClick={onScholarPackRequest}
                  className="ml-1 text-[10px] text-blue-600 dark:text-cyan-400 hover:underline font-extrabold cursor-pointer"
                >
                  Upgrade
                </button>
              )}
            </div>

            {/* Clear transcript */}
            {messages.length > 1 && (
              <button
                onClick={handleClearChat}
                className="p-2 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                title="Clear Chat History"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* Export transcript */}
            {messages.length > 1 && (
              <button
                onClick={handleExportChat}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                title="Download Chat Transcript"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Main Layout Grid: Left Guide & Prompts (Desktop) | Right Full Chat View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Quick Strategy Topics */}
          <div className="hidden lg:block lg:col-span-4 space-y-5">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                <Sparkle size={14} className="text-cyan-500" />
                <span>Quick Prompt Guide</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                Click any verified scenario below to instantly consult the strategy engine:
              </p>

              <div className="space-y-4 pt-1">
                {starterCategories.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      {cat.icon}
                      <span>{cat.title}</span>
                    </div>
                    <div className="space-y-1.5">
                      {cat.prompts.map((pText, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(pText)}
                          disabled={isLoading}
                          className="w-full text-left p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 text-xs font-semibold transition-all border border-gray-100 dark:border-gray-800 flex items-center justify-between group cursor-pointer"
                        >
                          <span className="line-clamp-2 leading-relaxed">{pText}</span>
                          <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1 text-cyan-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-wider">Admissions Toolkit</h3>
              </div>
              <p className="text-[11px] text-indigo-200 leading-relaxed font-medium">
                Need official calculations or CAPS status verification? Check our companion tools:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => navigate('/calculator')}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center transition-all"
                >
                  Aggregate Calc
                </button>
                <button
                  onClick={() => navigate('/jamb-caps')}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center transition-all"
                >
                  JAMB CAPS
                </button>
                <button
                  onClick={() => navigate('/cbt-simulator')}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center transition-all"
                >
                  CBT Simulator
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center transition-all"
                >
                  Contact Desk
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Chat Box & Input */}
          <div className="lg:col-span-8 flex flex-col h-[75vh] sm:h-[78vh] bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            
            {/* Messages Area */}
            <div
              ref={messageContainerRef}
              onScroll={handleContainerScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}>
                  <div className={`max-w-[92%] sm:max-w-[85%] p-4 sm:p-5 rounded-3xl shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none font-semibold text-sm'
                      : 'bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-tl-none font-medium text-sm'
                  }`}>
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>

                    {/* Grounding sources */}
                    {(() => {
                      const displayChunks = sanitizeGroundingChunks(msg.groundingChunks);
                      if (displayChunks.length === 0) return null;
                      return (
                        <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 flex items-center gap-1.5">
                            <Sparkles size={10} className="text-cyan-500" /> Grounded Web Reference Links
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {displayChunks.map((chunk: any, cIdx: number) => (
                              <a
                                key={cIdx}
                                href={chunk.web?.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-900 text-gray-750 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-400 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs font-bold text-[10px] transition-colors max-w-[240px]"
                                title={chunk.web?.title}
                              >
                                <span className="truncate">{chunk.web?.title || "Portal Update"}</span>
                                <ArrowUpRight size={11} className="shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions for Model Messages */}
                  {msg.role === 'model' && msg.text && (
                    <div className="flex items-center gap-1 pl-1 pt-0.5 text-gray-400 dark:text-gray-500">
                      <button
                        onClick={() => handleCopy(msg.text, i)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedIndex === i ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                      <button
                        onClick={() => handleLike(i, 'like')}
                        className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer ${
                          likes[i] === 'like' ? 'text-blue-600 dark:text-cyan-400' : ''
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp size={13} />
                      </button>
                      <button
                        onClick={() => handleLike(i, 'dislike')}
                        className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer ${
                          likes[i] === 'dislike' ? 'text-rose-500' : ''
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown size={13} />
                      </button>
                      <button
                        onClick={() => handleSpeech(msg.text, i)}
                        className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer ${
                          speakingIndex === i ? 'text-emerald-500' : ''
                        }`}
                        title={speakingIndex === i ? "Stop audio" : "Read aloud"}
                      >
                        {speakingIndex === i ? <VolumeX size={13} className="animate-pulse text-emerald-500" /> : <Volume2 size={13} />}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Progressive loading step */}
              {isLoading && (
                <div className="flex items-start space-x-3 p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 max-w-[85%]">
                  <Loader2 size={16} className="animate-spin text-cyan-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {scanSteps[loadingStep]}
                    </p>
                    <p className="text-[10px] text-gray-400">Synthesizing verified university data...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-24 right-8 p-2.5 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all cursor-pointer z-20"
                title="Scroll to bottom"
              >
                <ArrowDown size={16} />
              </button>
            )}

            {/* Attached File Preview */}
            {attachedFile && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border-t border-blue-100 dark:border-blue-900/50 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-cyan-400">
                <div className="flex items-center gap-2 truncate">
                  <FileText size={14} />
                  <span className="truncate">{attachedFile.name}</span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="p-1 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-full transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 sm:p-3 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-cyan-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl transition-all cursor-pointer shrink-0"
                  title="Attach Syllabus, JAMB Slip or Document"
                >
                  <Paperclip size={18} />
                </button>

                <VoiceInputButton
                  onTranscript={(transcript) => {
                    setInput(prev => prev ? `${prev} ${transcript}` : transcript);
                  }}
                />

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isUnderMaintenance
                      ? "Advisor engine undergoing maintenance..."
                      : "Ask about UNILAG, UI, FUTA cutoffs, CAPS status, subject combos..."
                  }
                  disabled={isLoading || isUnderMaintenance}
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 font-medium outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
                />

                <button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !attachedFile) || isUnderMaintenance}
                  className="p-3 sm:px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>

      <QuotaModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onUpgrade={() => {
          setIsQuotaModalOpen(false);
          if (onScholarPackRequest) onScholarPackRequest();
        }}
        isGuest={!isRealUser(user)}
        onLoginRequest={() => {
          setIsQuotaModalOpen(false);
          if (onLoginRequest) onLoginRequest();
        }}
      />
    </div>
  );
};

export default ChatPage;
