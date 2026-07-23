import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Brain, Sparkles, Loader2, ArrowUpRight,
  ShieldCheck, Zap, Trash2, Paperclip, FileText,
  Copy, Check, ThumbsUp, ThumbsDown, RotateCcw,
  Share2, Volume2, VolumeX, ExternalLink, MessageSquare
} from 'lucide-react';
import { executeAiChat, executeAiChatStream } from '../services/geminiService';
import { checkAndIncrementChats, getLocalProfile, isRealUser, getChatLimits } from '../services/userService';
import { ChatMessage } from '../types';
import QuotaModal from './QuotaModal';
import Markdown from 'react-markdown';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface AIChatDrawerProps {
  user: any;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'model',
  text: "Hi there! I'm **CampusAI**, your official 2026 Academic Strategist. I have live access to verified university portals, cutoff trends, and JAMB CAPS guidelines. What can I help you calculate or verify today?"
};

const getChatStorageKey = (uid?: string) => {
  return uid ? `campusai_chat_messages_${uid}` : 'campusai_chat_messages_guest';
};

const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState(() => getLocalProfile());
  const [isLoading, setIsLoading] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini prototype action states
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [likes, setLikes] = useState<Record<number, 'like' | 'dislike' | null>>({});
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [shareModalMsg, setShareModalMsg] = useState<ChatMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
          const pdf = await pdfjs.getDocument(typedarray).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ');
          }
          setAttachedFile({ name: file.name, content: text });
        } catch (err) {
          console.error('Error parsing PDF in chat:', err);
          setAttachedFile({ name: file.name, content: `[Uploaded PDF: ${file.name}]` });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || `Uploaded file: ${file.name}`;
        setAttachedFile({ name: file.name, content: text });
      };
      reader.readAsText(file);
    }
  };


  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const key = getChatStorageKey(user?.uid);
      const stored = sessionStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      if (!user?.uid) {
        const legacy = sessionStorage.getItem('campusai_chat_messages');
        if (legacy) return JSON.parse(legacy);
      }
    } catch {}
    return [WELCOME_MESSAGE];
  });

  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // ── Sync chat history whenever user UID changes (account login / logout / switch) ──
  useEffect(() => {
    try {
      const key = getChatStorageKey(user?.uid);
      const stored = sessionStorage.getItem(key);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([WELCOME_MESSAGE]);
      }
    } catch {
      setMessages([WELCOME_MESSAGE]);
    }
  }, [user?.uid]);

  // ── Sync chat clear event ──
  useEffect(() => {
    const handleClearEvent = () => {
      setMessages([WELCOME_MESSAGE]);
      try {
        const key = getChatStorageKey(user?.uid);
        sessionStorage.removeItem(key);
        sessionStorage.removeItem('campusai_chat_messages');
      } catch {}
    };
    window.addEventListener('campusai_clear_chat', handleClearEvent);
    return () => window.removeEventListener('campusai_clear_chat', handleClearEvent);
  }, [user?.uid]);

  const scanSteps = [
    "Grounding active portal registries...",
    "Querying official school databases...",
    "Validating 2026 departmental threshold guidelines...",
    "Checking JAMB CAPS policy parameters...",
    "Compiling personalized strategic roadmap..."
  ];

  const starterPrompts = [
    { title: "UNILAG Cutoffs",   text: "What are the competitive cutoff marks for OLevel & JAMB in UNILAG?" },
    { title: "Post-UTME Forms",  text: "Find all universities that have opened their 2026 Post-UTME registration list?" },
    { title: "COE Exemptions",   text: "Explain the UTME exemption policy for Colleges of Education." },
    { title: "CAPS Issues",      text: "What should I do if my JAMB CAPS says 'Admission in Progress'?" }
  ];

  // ── Sync profile from quota events ──
  useEffect(() => {
    const handler = (e: any) => { if (e.detail) setProfile(e.detail); };
    window.addEventListener('campusai_quota_updated', handler);
    return () => window.removeEventListener('campusai_quota_updated', handler);
  }, []);

  // ── Sync profile from user prop ──
  useEffect(() => {
    if (user) setProfile(user);
  }, [user]);

  // ── Loading step cycling ──
  useEffect(() => {
    if (!isLoading) { setLoadingStep(0); return; }
    setLoadingStep(0);
    const timer = setInterval(() => setLoadingStep(p => (p + 1) % scanSteps.length), 2500);
    return () => clearInterval(timer);
  }, [isLoading]);

  // ── Persist messages per account UID + scroll after DOM paint ──
  useEffect(() => {
    try {
      const key = getChatStorageKey(user?.uid);
      sessionStorage.setItem(key, JSON.stringify(messages));
    } catch {}
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [messages, user?.uid]);

  // ── Clear chat ──
  const handleClearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    try {
      const key = getChatStorageKey(user?.uid);
      sessionStorage.removeItem(key);
      sessionStorage.removeItem('campusai_chat_messages');
    } catch {}
  }, [user?.uid]);

  // ── Core send function — wrapped in useCallback to avoid stale closures ──
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

    // messagesRef.current always holds the latest messages — safe even in stale closures
    const latestMessages = messagesRef.current;

    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      await executeAiChatStream(
        currentInput,
        latestMessages,
        (streamedText, groundingChunks) => {
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
      );
    } catch {
      setMessages(prev => {
        const newArr = [...prev];
        const lastIdx = newArr.length - 1;
        if (lastIdx >= 0 && newArr[lastIdx].role === 'model') {
          newArr[lastIdx] = {
            role: 'model',
            text: "I encountered a synchronization hiccup reading the university matrix. Let's try sending that question again in a moment."
          };
        }
        return newArr;
      });
    } finally {
      setIsLoading(false);
    }
  // Removed `messages` from deps — messagesRef handles freshness without re-creating the fn
  }, [input, isLoading, user]);

  // ── Gemini Prototype Message Actions ──
  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast("Response copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleToggleLike = (index: number, type: 'like' | 'dislike') => {
    setLikes(prev => {
      const current = prev[index];
      const newRating = current === type ? null : type;
      if (newRating === 'like') showToast("Response marked as good");
      if (newRating === 'dislike') showToast("Feedback recorded. We'll improve this!");
      return { ...prev, [index]: newRating };
    });
  };

  const handleRegenerate = async (msgIndex: number) => {
    if (isLoading) return;

    const currentMessages = messagesRef.current;
    let userQuery = "";
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (currentMessages[i]?.role === 'user') {
        userQuery = currentMessages[i].text;
        break;
      }
    }

    if (!userQuery) {
      showToast("No query found to regenerate.");
      return;
    }

    setIsLoading(true);
    showToast("Regenerating response...");

    const historyForRegen = currentMessages.slice(0, msgIndex);

    setMessages(prev => {
      const next = [...prev];
      next[msgIndex] = { role: 'model', text: '' };
      return next;
    });

    try {
      await executeAiChatStream(
        userQuery,
        historyForRegen,
        (streamedText, groundingChunks) => {
          setMessages(prev => {
            const next = [...prev];
            if (next[msgIndex]) {
              next[msgIndex] = {
                ...next[msgIndex],
                text: streamedText,
                groundingChunks: groundingChunks || next[msgIndex].groundingChunks
              };
            }
            return next;
          });
        }
      );
    } catch {
      setMessages(prev => {
        const next = [...prev];
        if (next[msgIndex]) {
          next[msgIndex] = {
            role: 'model',
            text: "Failed to regenerate response. Please check your connection and try again."
          };
        }
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareMessage = async (msg: ChatMessage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CampusAI Response',
          text: `${msg.text}\n\n— Generated by CampusAI (https://campusai.ng)`
        });
        return;
      } catch {
        // Fall back to modal
      }
    }
    setShareModalMsg(msg);
  };

  const handleToggleSpeech = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      showToast("Speech synthesis is not supported on this browser.");
      return;
    }
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`~[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingIndex(null);
      utterance.onerror = () => setSpeakingIndex(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingIndex(index);
    }
  };

  // ── Open drawer + auto-send external message ──
  useEffect(() => {
    const handler = (e: any) => {
      setIsOpen(true);
      if (e.detail && typeof e.detail === 'string') {
        // Delay to let the drawer animate open before sending
        setTimeout(() => handleSendMessage(e.detail), 450);
      }
    };
    window.addEventListener('campusai_open_ai', handler);
    return () => window.removeEventListener('campusai_open_ai', handler);
  }, [handleSendMessage]);

  const { maxChats, remainingChats } = getChatLimits(profile);

  return (
    <>
      {/* ── Floating Chat Button ── */}
      <div className="fixed bottom-24 left-4 md:left-8 md:bottom-8 z-[150] group">
        <span className="absolute inset-0 bg-blue-600 rounded-full blur group-hover:scale-125 transition-all duration-500 animate-ping opacity-25" />
        <button
          id="campusai-floating-chat-bubble"
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-500/20"
          title="Consult CampusAI"
        >
          <Brain size={24} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 font-black uppercase text-[10px] tracking-widest transition-all duration-300">
            Ask AI
          </span>
        </button>
      </div>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-full h-[100dvh] bg-white dark:bg-gray-950 shadow-2xl flex flex-col z-10 border-l border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white uppercase text-xs tracking-wider flex items-center gap-1.5">
                      CampusAI Advisor
                      <Sparkles size={14} className="text-cyan-500" />
                    </h3>
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="flex items-center gap-1.5 text-[8px] font-black tracking-widest text-emerald-500 uppercase">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Search Grounding Active • {remainingChats} / {maxChats} Chats
                      </div>
                      <div className="w-24 bg-gray-200 dark:bg-gray-800 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${remainingChats <= 1 ? 'bg-amber-500' : 'bg-blue-600'}`}
                          style={{ width: `${(remainingChats / maxChats) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user?.is_premium && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest">
                      <Zap size={10} className="fill-white" /> Advisor Premium
                    </span>
                  )}
                  {messages.length > 1 && (
                    <button
                      onClick={handleClearChat}
                      className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      title="Clear Chat History"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Auth wall vs chat */}
              {!user || !isRealUser(user?.uid) ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-950">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                    Sign In Required
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold leading-relaxed max-w-xs mb-8 uppercase tracking-widest">
                    The CampusAI Strategy Advisor is exclusively reserved for authenticated members. Please log in or register to consult the intelligence node.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new CustomEvent('campusai_open_login'));
                    }}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 active:scale-95 transition-all w-full max-w-xs cursor-pointer"
                  >
                    Authenticate Now
                  </button>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-white dark:bg-gray-950">

                    {/* Toast message notification */}
                    <AnimatePresence>
                      {toastMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-xl border border-gray-700 dark:border-gray-200 flex items-center gap-2 pointer-events-none"
                        >
                          <Sparkles size={12} className="text-blue-400 dark:text-blue-600 shrink-0" />
                          <span>{toastMessage}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Starter prompts — only show when no conversation yet */}
                    {messages.length === 1 && (
                      <div className="mb-6 space-y-4">
                        <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-2xl">
                          <p className="text-xs text-sky-800 dark:text-sky-300 font-bold leading-relaxed flex items-start gap-2">
                            <ShieldCheck size={16} className="shrink-0 mt-0.5 animate-pulse text-sky-500" />
                            This advisor utilizes advanced Search Grounding to fetch official documents, admission cutoffs, and forms from active portals live!
                          </p>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggested Inquiries</p>
                        <div className="grid grid-cols-2 gap-3">
                          {starterPrompts.map((p, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(p.text)}
                              className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-500 transition-all text-left group cursor-pointer hover:shadow-md"
                            >
                              <h4 className="text-xs font-extrabold text-gray-900 dark:text-white mb-1 group-hover:text-blue-500">{p.title}</h4>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{p.text}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message bubbles */}
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                      >
                        <div className={`max-w-[88%] sm:max-w-[85%] p-4 rounded-3xl shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none font-semibold text-sm'
                            : 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-tl-none font-medium'
                        }`}>
                          <div className="markdown-body">
                            <Markdown>{msg.text}</Markdown>
                          </div>

                          {/* Grounding sources */}
                          {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-800/20 space-y-2">
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                <Sparkles size={10} className="text-cyan-500" /> Grounded Insights & Sources
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {msg.groundingChunks.map((chunk, cIdx) => (
                                  <a
                                    key={cIdx}
                                    href={chunk.web?.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black text-gray-750 dark:text-gray-300 hover:text-blue-500 dark:hover:text-cyan-400 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm font-bold text-[10px] transition-colors"
                                  >
                                    {chunk.web?.title || "Portal Update"} <ArrowUpRight size={12} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Gemini Prototype Action Toolbar for Model Messages */}
                        {msg.role === 'model' && msg.text && (
                          <div className="flex items-center gap-1 pl-1 pt-0.5 text-gray-400 dark:text-gray-500">
                            {/* Copy */}
                            <button
                              onClick={() => handleCopyMessage(msg.text, i)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                              title="Copy response"
                            >
                              {copiedIndex === i ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>

                            {/* Good response (Like) */}
                            <button
                              onClick={() => handleToggleLike(i, 'like')}
                              className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer ${
                                likes[i] === 'like' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                              title="Good response"
                            >
                              <ThumbsUp size={14} className={likes[i] === 'like' ? 'fill-current' : ''} />
                            </button>

                            {/* Bad response (Dislike) */}
                            <button
                              onClick={() => handleToggleLike(i, 'dislike')}
                              className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer ${
                                likes[i] === 'dislike' ? 'text-red-500 bg-red-50 dark:bg-red-950/40' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                              title="Bad response"
                            >
                              <ThumbsDown size={14} className={likes[i] === 'dislike' ? 'fill-current' : ''} />
                            </button>

                            {/* Regenerate / Reload */}
                            <button
                              onClick={() => handleRegenerate(i)}
                              disabled={isLoading}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer disabled:opacity-40"
                              title="Regenerate / Reload response"
                            >
                              <RotateCcw size={14} className={isLoading ? 'animate-spin' : ''} />
                            </button>

                            {/* Share */}
                            <button
                              onClick={() => handleShareMessage(msg)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                              title="Share response"
                            >
                              <Share2 size={14} />
                            </button>

                            {/* Read Aloud Speech */}
                            <button
                              onClick={() => handleToggleSpeech(msg.text, i)}
                              className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer ${
                                speakingIndex === i ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                              title={speakingIndex === i ? 'Stop reading' : 'Read aloud'}
                            >
                              {speakingIndex === i ? <VolumeX size={14} className="animate-pulse" /> : <Volume2 size={14} />}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500">
                          <Loader2 className="animate-spin" size={16} />
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl rounded-tl-none text-xs text-gray-700 dark:text-gray-300 font-bold flex flex-col md:flex-row md:items-center gap-2 shadow-sm border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1 shrink-0">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400 tracking-wider">CampusAI Search:</span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400 select-none animate-pulse">
                            {scanSteps[loadingStep]}
                          </span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input bar */}
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 space-y-2 sticky bottom-0 z-20 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    {attachedFile && (
                      <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs">
                        <div className="flex items-center gap-2 truncate text-blue-800 dark:text-blue-300">
                          <FileText size={14} className="shrink-0" />
                          <span className="font-bold truncate">{attachedFile.name}</span>
                        </div>
                        <button
                          onClick={() => setAttachedFile(null)}
                          className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    <div className="relative flex items-end bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus-within:border-blue-500 rounded-2xl transition-all p-1.5 shadow-sm">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleChatFileUpload}
                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shrink-0 mb-0.5"
                        title="Upload Document / Result Slip"
                      >
                        <Paperclip size={18} />
                      </button>
                      <textarea
                        rows={1}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onFocus={() => {
                          setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }, 200);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Ask about cutoffs, CAPS status, or upload slip..."
                        className="w-full bg-transparent p-2.5 text-sm font-bold outline-none text-gray-900 dark:text-white placeholder:text-gray-400 resize-none min-h-[40px] max-h-32 overflow-y-auto leading-relaxed"
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={(!input.trim() && !attachedFile) || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-md shrink-0 mb-0.5 ml-1"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalMsg && (
          <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-sm uppercase tracking-wider">
                  <Share2 size={18} /> Share CampusAI Guidance
                </div>
                <button
                  onClick={() => setShareModalMsg(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 max-h-44 overflow-y-auto text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                {shareModalMsg.text}
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${shareModalMsg.text}\n\n— Generated by CampusAI (https://campusai.ng)`);
                    showToast("Full response copied to clipboard!");
                    setShareModalMsg(null);
                  }}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Copy size={16} /> Copy Full Response
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareModalMsg.text.substring(0, 500)}...\n\nRead full strategy on CampusAI: https://campusai.ng`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareModalMsg(null)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all text-center"
                >
                  <MessageSquare size={16} /> Share on WhatsApp
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareModalMsg.text.substring(0, 200)}...\n\nVerified via @CampusAI`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareModalMsg(null)}
                  className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all text-center"
                >
                  <ExternalLink size={16} /> Share on X / Twitter
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QuotaModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onUpgrade={() => {
          setIsQuotaModalOpen(false);
          setIsOpen(false);
          window.dispatchEvent(new CustomEvent('campusai_open_payment', {
            detail: { type: 'pack', amount: 500, label: 'Scholar Pack 2026' }
          }));
        }}
      />
    </>
  );
};

export default AIChatDrawer;