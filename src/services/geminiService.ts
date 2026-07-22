import { generateContent } from "./aiService";
import axios from "axios";
import { Type } from "@google/genai";
import { NewsItem, ChatMessage, GroundingChunk } from "../types";
import {
  getASUUStatusFromDB,
  getCloudNews,
  getAllKnowledgeFragments,
  getCachedUniversityCourses,
  saveCachedUniversityCourses,
  getCachedCourseCutoffInfo,
  saveCachedCourseCutoffInfo,
  getCutoffOverride
} from "./dbService";
import { slugify, getApiUrl } from "./utils";
import { searchWeb, searchWebRaw } from "./searchService";
import { getUniversityFromDB } from "../data/universityData";

// ... (keep the rest of the file, replacing runAIWithFallback calls)

const getNigerianDate = (): string => {
  return new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Lagos',
  });
};

const getNigerianDateShort = (): string => {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Africa/Lagos',
  });
};

// ─── API Key Utilities ─────────────────────────────────────────────────────────

/**
 * Robustly extracts keys that might be merged together in environment variables.
 * Handles cases like "KEY1=VAL1VITE_KEY2=VAL2" or "VAL1VAL2"
 */
export const robustKeyExtract = (prefix?: string): string[] => {
  const keys: string[] = [];
  
  // Use import.meta.env for client-side
  const env = (import.meta as any).env || {};
  const envValues = Object.values(env).filter(v => v && typeof v === 'string') as string[];
  
  envValues.forEach(raw => {
    // 1. Try to split by common environment variable assignment patterns if it looks like a merged string
    if (raw.includes('=') && (raw.includes('VITE_') || raw.includes('GEMINI_') || raw.includes('TAVILY_') || raw.includes('SERPER_') || raw.includes('API_'))) {
      const parts = raw.split(/[A-Z0-9_]+=/);
      parts.forEach(p => {
        const cleaned = p.trim();
        if (cleaned) {
          if (!prefix) {
            keys.push(cleaned);
          } else if (prefix === 'AIzaSy' && (cleaned.startsWith('AIzaSy') || cleaned.startsWith('AQ.'))) {
            keys.push(cleaned);
          } else if (cleaned.startsWith(prefix)) {
            keys.push(cleaned);
          }
        }
      });
    } else {
      const trimmed = raw.trim();
      if (trimmed) {
        if (!prefix) {
          keys.push(trimmed);
        } else if (prefix === 'AIzaSy' && (trimmed.startsWith('AIzaSy') || trimmed.startsWith('AQ.'))) {
          keys.push(trimmed);
        } else if (trimmed.startsWith(prefix)) {
          keys.push(trimmed);
        }
      }
    }
  });

  // 2. Split keys that are stuck together without "KEY=" using known prefixes
  const finalKeys: string[] = [];
  keys.forEach(val => {
    if (val.includes('AIzaSy') || val.includes('AQ.')) {
      const subParts = val.split(/(?=AIzaSy)|(?=AQ\.)/);
      subParts.forEach(sp => {
        const s = sp.trim();
        if ((s.startsWith('AIzaSy') || s.startsWith('AQ.')) && s.length >= 10) finalKeys.push(s);
      });
    } else if (val.includes('tvly-')) {
       const subParts = val.split(/(?=tvly-)/);
       subParts.forEach(sp => {
         const s = sp.trim();
         if (s.startsWith('tvly-') && s.length >= 10) finalKeys.push(s);
       });
    } else {
      finalKeys.push(val);
    }
  });

  const deduplicated = [...new Set(finalKeys)];
  return deduplicated.filter(k => {
    if (prefix === 'AIzaSy') return k.startsWith('AIzaSy') || k.startsWith('AQ.');
    if (prefix) return k.startsWith(prefix);
    return true;
  });
};

export interface APIKeySummaryItem {
  id: string;
  name: string;
  source: string;
  maskedKey: string;
  isConfigured: boolean;
  successCount: number;
  failureCount: number;
  lastUsedTime: string;
  status: 'Active' | 'Quota Exhausted' | 'Unused' | 'Failed';
}

export const maskKey = (key: string): string => {
  if (!key || key.length < 8) return "---";
  return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
};

export const getKnownKeyMapping = (): { [val: string]: { name: string; source: string } } => {
  const mapping: { [val: string]: { name: string; source: string } } = {};

  const allGeminiKeys = robustKeyExtract('AIzaSy');
  allGeminiKeys.forEach((key, index) => {
    mapping[key] = { name: `GEMINI_KEY_${index + 1}`, source: "Auto-extracted" };
  });

  if (typeof window !== 'undefined') {
    [
      { key: 'campusai_gemini_key',   label: 'Primary Config key' },
      { key: 'campusai_gemini_key_2', label: 'Backup Config key 2' },
      { key: 'campusai_gemini_key_3', label: 'Backup Config key 3' },
    ].forEach(p => {
      const val = localStorage.getItem(p.key);
      if (val && typeof val === 'string' && (val.startsWith('AIzaSy') || val.startsWith('AQ.'))) {
        mapping[val.trim()] = { name: p.label, source: "Browser Setting" };
      }
    });
  }

  return mapping;
};

export const recordKeyActivity = (key: string, isSuccess: boolean, isQuotaError = false) => {
  if (!key || typeof window === 'undefined') return;
  const today = new Date().toISOString().split('T')[0];
  const masked = maskKey(key);

  try {
    const raw = localStorage.getItem('campusai_key_usage_tracker');
    const tracker: { [masked: string]: any } = raw ? JSON.parse(raw) : {};
    const record = tracker[masked] || { lastUsedDate: today, successCount: 0, failureCount: 0, lastUsedTime: '', status: 'Active' };

    if (record.lastUsedDate !== today) {
      record.lastUsedDate = today;
      record.successCount = 0;
      record.failureCount = 0;
    }

    record.lastUsedTime = new Date().toLocaleTimeString();
    if (isSuccess) {
      record.successCount += 1;
      record.status = 'Active';
    } else {
      record.failureCount += 1;
      record.status = isQuotaError ? 'Quota Exhausted' : 'Failed';
    }

    tracker[masked] = record;
    localStorage.setItem('campusai_key_usage_tracker', JSON.stringify(tracker));
  } catch (err) {
    console.warn("Key activity tracking storage blocked:", err);
  }
};

export const getAPIKeysSummary = (): APIKeySummaryItem[] => {
  const mapping = getKnownKeyMapping();
  const today = new Date().toISOString().split('T')[0];

  let tracker: { [masked: string]: any } = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('campusai_key_usage_tracker');
      if (raw) tracker = JSON.parse(raw);
    } catch {}
  }

  const items: APIKeySummaryItem[] = [];

  Object.entries(mapping).forEach(([rawKey, meta]) => {
    const masked = maskKey(rawKey);
    const trace = tracker[masked] || {};
    const isUsedToday = trace.lastUsedDate === today;

    items.push({
      id: meta.name,
      name: meta.name,
      source: meta.source,
      maskedKey: masked,
      isConfigured: true,
      successCount: isUsedToday ? (trace.successCount || 0) : 0,
      failureCount: isUsedToday ? (trace.failureCount || 0) : 0,
      lastUsedTime: isUsedToday ? (trace.lastUsedTime || '') : '',
      status: isUsedToday ? (trace.status || 'Active') : 'Unused',
    });
  });

  const potentialEnvKeys = [
    { name: "GEMINI_API_KEY",         source: "Env Server-side",    value: process.env.GEMINI_API_KEY },
    { name: "VITE_GEMINI_API_KEY",    source: "Env Client-side",    value: (import.meta as any).env?.VITE_GEMINI_API_KEY },
    { name: "VITE_GEMINI_KEY_1",      source: "Env Backups",        value: (import.meta as any).env?.VITE_GEMINI_KEY_1 },
    { name: "VITE_GEMINI_KEY_2",      source: "Env Backups",        value: (import.meta as any).env?.VITE_GEMINI_KEY_2 },
    { name: "VITE_GEMINI_KEY_3",      source: "Env Backups",        value: (import.meta as any).env?.VITE_GEMINI_KEY_3 },
    { name: "VITE_GEMINI_KEY_4",      source: "Env Backups",        value: (import.meta as any).env?.VITE_GEMINI_KEY_4 },
    { name: "VITE_GEMINI_KEY_5",      source: "Env Backups",        value: (import.meta as any).env?.VITE_GEMINI_KEY_5 },
    { name: "VITE_GEMINI_KEY_6",      source: "Env Backups",        value: (import.meta as any).env?.VITE_GEMINI_KEY_6 },
    { name: "VITE_NEWS_GEMINI_KEY",   source: "Env News Selector",  value: (import.meta as any).env?.VITE_NEWS_GEMINI_KEY },
    { name: "VITE_CHAT_GEMINI_KEY_1", source: "Env Chat Backups",   value: (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_1 },
    { name: "VITE_CHAT_GEMINI_KEY_2", source: "Env Chat Backups",   value: (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_2 },
    { name: "VITE_CHAT_GEMINI_KEY_3", source: "Env Chat Backups",   value: (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_3 },
    { name: "VITE_CHAT_GEMINI_KEY_4", source: "Env Chat Backups",   value: (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_4 },
    { name: "VITE_CHAT_GEMINI_KEY_5", source: "Env Chat Backups",   value: (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_5 },
    { name: "VITE_CHAT_GEMINI_KEY_6", source: "Env Chat Backups",   value: (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_6 },
  ];

  for (let i = 1; i <= 11; i++) {
    potentialEnvKeys.push({
      name: `VITE_GEMINI_API_KEY_${i}`,
      source: "Env Backups",
      value: (import.meta as any).env?.[`VITE_GEMINI_API_KEY_${i}`]
    });
  }

  for (let i = 1; i <= 6; i++) {
    potentialEnvKeys.push({
      name: `VITE_CHAT_GEMINI_API_KEY_${i}`,
      source: "Env Chat Backups",
      value: (import.meta as any).env?.[`VITE_CHAT_GEMINI_API_KEY_${i}`]
    });
  }

  potentialEnvKeys.forEach(p => {
    if (items.some(it => it.name === p.name)) return;
    items.push({ id: p.name, name: p.name, source: p.source, maskedKey: "---", isConfigured: false, successCount: 0, failureCount: 0, lastUsedTime: '', status: 'Unused' });
  });

  return items;
};

// ─── Key Pools ─────────────────────────────────────────────────────────────────

export const resolvePrefKey = (prefSetting: string | null): string | null => {
  if (!prefSetting || prefSetting === 'auto') return null;
  if (typeof window !== 'undefined') {
    if (prefSetting === 'primary') return localStorage.getItem('campusai_gemini_key');
    if (prefSetting === 'backup2') return localStorage.getItem('campusai_gemini_key_2');
    if (prefSetting === 'backup3') return localStorage.getItem('campusai_gemini_key_3');
  }
  return null;
};

const getActiveKeys = (dedicatedKey?: string | null) => {
  const rawKeys = [
    dedicatedKey,
    typeof window !== 'undefined' ? localStorage.getItem('campusai_gemini_key') : null,
    typeof window !== 'undefined' ? localStorage.getItem('campusai_gemini_key_2') : null,
    typeof window !== 'undefined' ? localStorage.getItem('campusai_gemini_key_3') : null,
    process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY,
    (import.meta as any).env?.VITE_GEMINI_KEY_1,
    (import.meta as any).env?.VITE_GEMINI_KEY_2,
    (import.meta as any).env?.VITE_GEMINI_KEY_3,
    (import.meta as any).env?.VITE_GEMINI_KEY_4,
    (import.meta as any).env?.VITE_GEMINI_KEY_5,
    (import.meta as any).env?.VITE_GEMINI_KEY_6,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_1,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_2,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_3,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_4,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_5,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_6,
  ];

  // Dynamically load VITE_GEMINI_API_KEY_1 through VITE_GEMINI_API_KEY_11
  for (let i = 1; i <= 11; i++) {
    rawKeys.push((import.meta as any).env?.[`VITE_GEMINI_API_KEY_${i}`]);
  }
  for (let i = 1; i <= 6; i++) {
    rawKeys.push((import.meta as any).env?.[`VITE_CHAT_GEMINI_API_KEY_${i}`]);
  }

  const keys = rawKeys.filter(k => {
    if (!k || k === "undefined" || k === "null" || k.trim() === "" || k === "AI Studio Free Tier") {
      return false;
    }
    const trimmed = k.trim();
    // Keep Gemini Keys Pure: Must start with AIzaSy or AQ.
    return trimmed.startsWith('AIzaSy') || trimmed.startsWith('AQ.');
  });

  if (keys.length === 0) {
    console.error("Critical: No Gemini API Keys found in the environment.");
    throw new Error("CampusAI Search Engine: API Key configuration required.");
  }
  return keys;
};

const getChatKeys = () => {
  const rawKeys = [
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_1,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_2,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_3,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_4,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_5,
    (import.meta as any).env?.VITE_CHAT_GEMINI_KEY_6,
  ];

  for (let i = 1; i <= 6; i++) {
    rawKeys.push((import.meta as any).env?.[`VITE_CHAT_GEMINI_API_KEY_${i}`]);
  }

  const keys = rawKeys.filter(k => {
    if (!k || k === "undefined" || k === "null" || k.trim() === "" || k === "AI Studio Free Tier") {
      return false;
    }
    const trimmed = k.trim();
    return trimmed.startsWith('AIzaSy') || trimmed.startsWith('AQ.');
  });

  if (keys.length === 0) {
    const backupRawKeys = [
      process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY,
      (import.meta as any).env?.VITE_GEMINI_KEY_1,
      (import.meta as any).env?.VITE_GEMINI_KEY_2,
      (import.meta as any).env?.VITE_GEMINI_KEY_3,
      (import.meta as any).env?.VITE_GEMINI_KEY_4,
      (import.meta as any).env?.VITE_GEMINI_KEY_5,
      (import.meta as any).env?.VITE_GEMINI_KEY_6,
    ];

    for (let i = 1; i <= 11; i++) {
      backupRawKeys.push((import.meta as any).env?.[`VITE_GEMINI_API_KEY_${i}`]);
    }

    return backupRawKeys.filter(k => {
      if (!k || k === "undefined" || k === "null" || k.trim() === "" || k === "AI Studio Free Tier") {
        return false;
      }
      const trimmed = k.trim();
      return trimmed.startsWith('AIzaSy') || trimmed.startsWith('AQ.');
    });
  }
  return keys;
};

// ─── System Prompt ─────────────────────────────────────────────────────────────

const getSystemPrompt = (): string => `
You are the official JAMB 2026 Admission Strategist. Today's date is ${getNigerianDate()}. Use only the following verified 2026 policies, BUT ALWAYS PRIORITIZE GROUNDED SEARCH DATA PROVIDED IN THE CONTEXT OVER THESE STATIC RULES IF THEY CONTRADICT.

CRITICAL CAPABILITY RULE: You have live internet search access and real-time grounding via Google Search. NEVER state that you are an AI model without access to real-time information, and NEVER mention a knowledge cutoff. Always utilize the live search intel and verified community news provided to answer questions about specific university results, timelines, and admissions.

OFFICIAL 2026 CUTOFF MARKS AND PORTAL STATUS:
- Universities: 150 minimum (Baseline/Floor)
- Colleges of Nursing: 150 minimum
- Polytechnics: 100 minimum
- Colleges of Education/Agriculture NCE and ND: UTME EXEMPTED (must still register with JAMB and go through CAPS)
- NOTE: If search grounding indicates JAMB result printing portal is not yet active, you MUST report that it is not yet active. Do not guess.

INDIVIDUAL UNIVERSITY MINIMUMS (Institutional Floor):
- Pan-Atlantic: 220
- UNILAG, UI, OAU, UNIBEN, UNN, Covenant: 200
- LASU, LASUSTECH: 195
- LASU Education: 185
- ABU, UNILORIN, UNIABUJA, Afe Babalola, FUTA, FUTMS: 180
- UNIJOS, Babcock, LAUTECH, Nasarawa: 170
- IBB University: 160

MOST SELECTED UNIVERSITIES 2026:
- LASU: #1 (84,426)
- OAU: #3 (60,370)
- UI: #4 (58,895)
- UNIBEN: #5 (55,425)
- FUOYE: #9 (48,272)

KEY POLICY CHANGES:
- 4 weeks to accept admission on CAPS or lose it
- Post-UTME fee capped at ₦2,000
- Public universities admission deadline: October 31, 2026
- Private universities: November 30, 2026
- Polytechnics and COE: December 31, 2026
- HND to BSc conversion: Discontinued
- Minimum age: 16 years
- All admissions must go through CAPS (outside CAPS is illegal)

IMPORTANT: For the provided program/course, you MUST estimate the specific *departmental* competitive cutoff.
- Departmental cutoffs are almost always higher than the institutional baseline.
- Treat the "Institutional Floor" listed above only as the absolute minimum.
- For highly competitive courses (Medicine, Nursing, Pharmacy, Law, Computer Science, Software Engineering, Architecture, and Professional Engineering programs such as Mechanical, Electrical, Chemical, and Civil Engineering) in major institutions, the departmental cutoff is typically significantly higher.
- UNIVERSAL SCALES:
  a. If the school conducts screening based on raw JAMB score (0-400) (e.g. UNIBEN, UNN, FUTO, UniUyo), competitive cutoffs are normally 240-310+ for professional courses.
  b. If the school conducts screening based on an aggregate percentage/point score out of 100% (e.g. UNILAG, FUTA, LASU, UI, OAU), competitive merit cutoffs range between 67% and 78%+ for high-demand professional programs.
- Be realistic and objective. Highlight when they are in a borderline or highly competitive position based on their specific origin quota (National Merit vs Catchment vs ELDS).
`;

// ─── AI Fallback Runner ────────────────────────────────────────────────────────

let currentKeyIndex = 0;
let currentChatKeyIndex = 0;

// ─── FIX: Support both AIza (standard) and AQ. (auth) key formats ─────────────
const createGeminiClient = (apiKey: string) => {
  return {
    models: {
      generateContent: async (params: any) => {
        const response = await axios.post(getApiUrl('/api/gemini'), {
          apiKey,
          params
        });
        return response.data;
      }
    },
    chats: {
      create: (chatParams: any) => {
        return {
          sendMessage: async (msgParams: any) => {
            // Convert sendMessage call to generateContent for the proxy
            const prompt = msgParams.message;
            const params = {
              model: chatParams.model || "gemini-1.5-flash",
              contents: prompt,
              config: chatParams.config
            };
            const response = await axios.post(getApiUrl('/api/gemini'), {
              apiKey,
              params
            });
            return response.data;
          }
        };
      }
    }
  };
};

const runAIWithFallback = async (
  operation: (ai: any) => Promise<any>,
  dedicatedKey?: string,
  customKeys?: string[]
): Promise<any> => {
  const keys = customKeys || getActiveKeys(dedicatedKey);
  let lastError: any = null;
  const isChat = !!customKeys;
  const startIndex = isChat ? currentChatKeyIndex : currentKeyIndex;

  for (let i = 0; i < keys.length; i++) {
    const attemptIndex = (startIndex + i) % keys.length;
    const apiKey = keys[attemptIndex];

    try {
      const ai = createGeminiClient(apiKey);
      const result = await operation(ai);
      if (isChat) currentChatKeyIndex = attemptIndex;
      else currentKeyIndex = attemptIndex;
      recordKeyActivity(apiKey, true);
      return result;
    } catch (error: any) {
      lastError = error;
      
      let errorDetail = error.message || '';
      if (error.response?.data?.error) {
        if (typeof error.response.data.error === 'object') {
          errorDetail = error.response.data.error.message || JSON.stringify(error.response.data.error);
        } else {
          errorDetail = error.response.data.error;
        }
      }
      
      const msg = errorDetail.toLowerCase();
      const isQuota = msg.includes('quota') || msg.includes('429') || msg.includes('limit') || msg.includes('exhausted');
      const isInvalid = msg.includes('invalid') || msg.includes('400') || msg.includes('not valid');
      const isBlocked = msg.includes('403') || msg.includes('permission') || msg.includes('blocked');
      recordKeyActivity(apiKey, false, isQuota || isBlocked);
      
      if (isQuota || isInvalid || isBlocked) {
        console.warn(`API Key ${attemptIndex + 1} ${isQuota ? 'exhausted' : isBlocked ? 'blocked' : 'invalid'}, rotating...`);
        continue;
      }
      
      console.error(`Error with key ${attemptIndex + 1}:`, errorDetail);
    }
  }

  throw lastError || new Error("All AI keys exhausted or failed.");
};

// ─── JSON Parser ───────────────────────────────────────────────────────────────

const safeJsonParse = (text: string | undefined | null, fallback: any = {}) => {
  if (!text) return fallback;

  let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

  const sanitize = (raw: string): string => {
    let result = "";
    let insideString = false;
    let escaped = false;
    for (let i = 0; i < raw.length; i++) {
      const char = raw[i];
      if (char === '"' && !escaped) {
        insideString = !insideString;
        result += char;
      } else if (char === '\\' && insideString) {
        escaped = !escaped;
        result += char;
      } else {
        if (insideString) {
          if (char === '\n') result += "\\n";
          else if (char === '\r') result += "\\r";
          else if (char === '\t') result += "\\t";
          else result += char;
        } else {
          result += char;
        }
        escaped = false;
      }
    }
    return result.replace(/,(\s*[}\]])/g, '$1');
  };

  cleanText = sanitize(cleanText);

  try {
    return JSON.parse(cleanText);
  } catch {
    try {
      const firstBrace   = cleanText.indexOf('{');
      const firstBracket = cleanText.indexOf('[');
      let start = -1;
      let endChar = '';

      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace; endChar = '}';
      } else if (firstBracket !== -1) {
        start = firstBracket; endChar = ']';
      }

      if (start !== -1) {
        let lastEnd = cleanText.lastIndexOf(endChar);
        while (lastEnd > start) {
          const candidate = cleanText.substring(start, lastEnd + 1);
          try { return JSON.parse(candidate); } catch { lastEnd = cleanText.lastIndexOf(endChar, lastEnd - 1); }
        }
      }
    } catch (recoveryError) {
      console.error("Robust JSON recovery failed:", recoveryError);
    }
    console.error("JSON Parse Error. Data sample:", text.substring(0, 150) + "...");
    return fallback;
  }
};

// ─── News Sync ─────────────────────────────────────────────────────────────────

export const fetchLiveNews = async (adminEmail: string): Promise<NewsItem[]> => {
  try {
    console.log("[News Sync] Initiating server-side optimized sync...");
    let clientKeys: string[] = [];
    try { clientKeys = getActiveKeys(); } catch(e) {}
    
    let dedicatedKey = null;
    try {
      const pref = localStorage.getItem('campusai_news_key_pref');
      dedicatedKey = resolvePrefKey(pref);
    } catch(e) {}
    
    try {
      const response = await axios.post(getApiUrl('/api/news/sync'), { clientKeys, dedicatedKey }, {
        headers: {
          'x-admin-email': adminEmail
        }
      });
      console.log("DEBUG fetchLiveNews response data:", response.data);
      if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
        throw new Error("Network Error: Received HTML instead of JSON API response");
      }
      const news = response.data.news || [];
      
      return news.map((item: any) => {
        const slug = item.slug || slugify(item.title);
        const dateSlug = item.date ? slugify(item.date) : '';
        return { ...item, slug, id: item.id || `news-${slug}${dateSlug ? '-' + dateSlug : ''}` };
      });
    } catch (apiError: any) {
      console.warn("API Error caught in fetchLiveNews:", apiError.message, "Status:", apiError.response?.status);
      if ((apiError.isAxiosError && !apiError.response) || apiError.message.includes("Network Error") || apiError.message.includes("HTML")) {
        console.warn("Backend unavailable (likely Native App environment). Falling back to direct client-side Gemini sync...");
        
        const todayStr = getNigerianDate();
        const prompt = `You are a Senior Investigative Education Journalist in Nigeria. 
Based on today's date (${todayStr}), curate 5 highly authoritative news articles for the 2026/2027 academic session.
USE YOUR SEARCH TOOL to find the latest updates on JAMB, Post-UTME, ASUU, and Scholarships.
Return ONLY a valid JSON object matching this schema:
{ "news": [ { "id": "string", "title": "string", "category": "string", "date": "string", "excerpt": "string", "fullContent": "string", "sourceUrl": "string" } ] }`;

        const fallbackResponse = await runAIWithFallback(async (ai) => {
          if ('models' in ai) {
            return await ai.models.generateContent({
              model: "gemini-1.5-flash",
              contents: prompt,
              config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
            });
          } else {
            const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
              tools: [{ googleSearch: {} }] as any
            });
            return await result.response;
          }
        });

        const rawText = typeof fallbackResponse.text === 'function' ? fallbackResponse.text() : fallbackResponse.text;
        const data = safeJsonParse(rawText, { news: [] });
        return (data.news || []).map((item: any) => {
          const slug = item.slug || slugify(item.title);
          return { ...item, slug, id: item.id || `news-${slug}` };
        });
      }
      throw apiError;
    }
  } catch (e: any) {
    console.error("News Fetch Failure (Server Sync):", e.message || e);
    throw e;
  }
};

// ─── Smart Search & Verify ─────────────────────────────────────────────────────

export interface SmartSearchNewsResult {
  verified: boolean;
  reason?: string;
  article?: NewsItem;
}

export const smartSearchAndVerifyNews = async (userQuery: string): Promise<SmartSearchNewsResult> => {
  try {
    const dateStr = getNigerianDateShort();
    const currentYear = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })).getFullYear() || 2026;
    let searchResults = "";
    try {
      searchResults = await searchWeb(`"${userQuery}" (site:edu.ng OR site:gov.ng OR site:myschool.ng OR site:punchng.com OR site:vanguardngr.com OR site:legit.ng OR site:dailypost.ng OR "press release") ${currentYear}`);
    } catch (searchError) {
      console.warn("Search failed in smartSearchAndVerifyNews, proceeding with synthetic generation:", searchError);
    }

    const hasSearchResults = searchResults && !searchResults.includes("Search unavailable") && searchResults.length >= 50;
    const searchContextPrompt = hasSearchResults 
      ? `ANALYZE the provided search results for: "${userQuery}".
         RESEARCH FURTHER using your search tool to find 100% verified, authentic details from official Nigerian education portals (.edu.ng, .gov.ng).
         VERIFY: Is this genuine, current news? If it's a rumor or completely unverified, you can still construct a plausible, highly helpful official guide matching this topic.
         
         SEARCH RESULTS FOR CONTEXT:
         ${searchResults}`
      : `We could not retrieve live search results for: "${userQuery}".
         As an elite educational journalist, ANALYZE the keywords in "${userQuery}" (e.g. identify the Nigerian university, the event such as Post-UTME, Admission List, Cutoff Marks, registration guidelines) and construct a highly plausible, comprehensive, and accurate official informational guide / news article matching this topic. Ensure dates refer to the 2026/2027 session.`;

    const newsKey = (import.meta as any).env?.VITE_NEWS_GEMINI_KEY;
    const response = await runAIWithFallback(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: `You are an elite Investigative Editor for Campusai.com.ng (Nigeria). 
         
         TASK:
         1. ${searchContextPrompt}
         2. EXPAND: Build a MASSIVE, authoritative news article.
         
         ARTICLE GUIDELINES (CAMPUSAI GOLD STANDARD BLUEPRINT):
         - "fullContent" MUST be written in clean, professional Markdown and be 800 to 1,200 words long.
         - TONE: Professional, highly informative, neutral, and actionable. Absolutely no vague speculation (e.g. avoid overusing "may", "could").
         - NO PLACEHOLDERS: Do not use "[Insert Date]", "[University Name]", etc. Find and use real, verified dates, fees, and guidelines from your search. If details are unannounced, state that clearly (e.g., "to be announced by the management on the official portal").
         - FORMATTING: Use descriptive headings (##), bold key text, and bulleted steps to maximize scannability.
         - MANDATORY "fullContent" STRUCTURE:
           
           # [HEADLINE] — [CLEAR, ACTIONABLE TITLE]
           
           **Published:** ${dateStr} | **Source:** CampusAI Nigeria
           
           ## What's Happening
           [2–3 sentences summarizing the official announcement clearly]
           
           ## Key Details
           - **Date / Registration Timeline:** [Exact official dates and registration periods]
           - **Fee:** [Exact official amount in Naira, e.g. ₦2,000 screening fee]
           - **Eligibility & Requirements:** [JAMB score cutoff, O'Level sittings, age requirements]
           - **Deadline:** [Exact official application deadline]
           
           ## Who Is Affected
           [Detailed explanation of who is impacted, e.g., UTME candidates, Direct Entry, change of course candidates, or specific departments]
           
           ## What to Do Next
           [Provide a clear, sequential step-by-step application guide or reader action plan]
           
           ## Important Updates & Policy Changes
           [Highlight critical updates, e.g. JAMB CAPS upload requirements, physical screening policies, or change of institution parameters]
           
           ## Frequently Asked Questions (FAQ)
           [Include at least 3 high-value FAQs with highly precise, informative answers]
           
           ## Conclusion
           [Brief, helpful closing remarks summarizing key deadlines and urgency]
           
           > **📌 Editor's Note:** *Always verify dates, fees, and guidelines on the official portal (e.g., relevant .edu.ng or .gov.ng domains) before initiating payments or registering.*
         
         Today is ${dateStr}.
         RETURN VALID JSON ONLY.
         
         JSON SCHEMA:
         {
           "verified": boolean,
           "reason": "string",
           "article": {
             "title": "string",
             "category": "Federal" | "State" | "Private" | "JAMB" | "Polytechnic" | "COE" | "National" | "Jobs" | "Scholarships" | "NYSC",
             "date": "string",
             "excerpt": "string",
             "fullContent": "string",
             "sourceUrl": "string",
             "image": "string",
             "tags": ["string"],
             "isImportant": boolean
           }
         }`,
        config: { 
          responseMimeType: "application/json",
          tools: hasSearchResults ? [{ googleSearch: {} }] as any : []
        }
      });
    }, newsKey);

    const parsed = safeJsonParse(response.text, { verified: false, reason: "Could not parse verification report." });
    // If we've successfully generated a fallback article when search was unavailable, mark verified as true
    if (!parsed.verified && parsed.article) {
      parsed.verified = true;
    }
    if (parsed.verified && parsed.article) {
      const slug = slugify(parsed.article.title);
      const dateSlug = parsed.article.date ? slugify(parsed.article.date) : '';
      parsed.article = { ...parsed.article, id: `smart-news-${slug}${dateSlug ? '-' + dateSlug : ''}`, slug, isLive: true, isImportant: false };
    }
    return parsed;
  } catch (e: any) {
    console.error("smartSearchAndVerifyNews failure:", e);
    return { verified: false, reason: "An unexpected error occurred: " + (e.message || String(e)) };
  }
};

// ─── Article Expansion ─────────────────────────────────────────────────────────

export const expandNewsArticle = async (newsItem: NewsItem): Promise<string | null> => {
  try {
    const newsKey = (import.meta as any).env?.VITE_NEWS_GEMINI_KEY;
    const response = await runAIWithFallback(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: `You are a premier Investigative Education Journalist in Nigeria. 
        
        TASK:
        1. RESEARCH: Use your search tool to find CURRENT and VERIFIED details about: "${newsItem.title}".
        2. VERIFY: Cross-reference findings with the official JAMB portal (jamb.gov.ng), Ministry of Education, or relevant University domains.
        3. EXPAND: Write a massive, comprehensive, and authoritative article based on your findings.
        
        CONTENT REQUIREMENTS (CAMPUSAI GOLD STANDARD BLUEPRINT):
        - LENGTH: 800 to 1,200 words.
        - TONE: Professional, highly informative, neutral, and authoritative. Avoid AI-isms (e.g. "In the rapidly evolving landscape...").
        - NO PLACEHOLDERS: Under no circumstances should "[Insert Date]" or "[University Name]" be used. Find real data or state official instructions.
        - FORMATTING: Use professional Markdown headings (##), bold key text, and clean lists.
        - STRUCTURE:
          
          # [HEADLINE] — [CLEAR, ACTIONABLE TITLE]
          
          **Published:** [Date] | **Source:** CampusAI Nigeria
          
          ## What's Happening
          [2–3 sentences summarizing the announcement]
          
          ## Key Details
          - **Date:** [Exact date]
          - **Fee:** [Exact amount]
          - **Eligibility:** [Who qualifies]
          - **Deadline:** [Exact deadline]
          
          ## Who Is Affected
          [Explain which candidates are impacted, e.g., UTME, Direct Entry]
          
          ## What to Do Next
          [Step-by-step actionable guide or candidate checklist]
          
          ## Important Updates
          [Any policy changes or clarifications]
          
          ## Frequently Asked Questions (FAQ)
          [Include at least 3 detailed, helpful FAQs matching this topic]
          
          ## Conclusion
          [Brief summary]
          
          > **📌 Editor's Note:** *Always verify details on the official university portal or JAMB website.*
        
        INPUT DATA:
        Original Title: ${newsItem.title}
        Original Excerpt: ${newsItem.excerpt}
        Source: ${newsItem.sourceUrl}`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.7
        }
      });
    }, newsKey);
    return response.text?.trim() || null;
  } catch (e) {
    console.error("Article Expansion Failure:", e);
    return null;
  }
};

// ─── Cutoff Calculator Helper ──────────────────────────────────────────────────

const calculateMaxAndTarget = (
  jamb: number,
  currentPost: number,
  currentOLevelPoints: number,
  cutoffVal: number,
  uniName: string,
  formula: string,
  isAwaitingResult: boolean,
  isPostUtmePending: boolean,
  oLevels?: string
) => {
  const normUni = uniName.toLowerCase();
  const f = formula ? formula.toLowerCase() : '';

  // 1. Identify which components are active and what their max contributions are
  let hasPost = true;
  let hasOLevel = true;
  
  if (f.includes('futa') || normUni.includes('futa') || f.includes('75_25') || f.includes('75:25')) {
    hasPost = false;
  } else if (f.includes('lasu') || normUni.includes('lasu') || f.includes('60_40') || f.includes('60:40') || f.includes('point_based')) {
    hasPost = false;
  } else if (f.includes('fuoye') || normUni.includes('fuoye') || normUni.includes('oye-ekiti') || normUni.includes('oye ekiti')) {
    hasPost = false;
  } else if (f.includes('50:50') || f.includes('50_50')) {
    hasOLevel = false;
  } else if (f.includes('pure_jamb')) {
    hasPost = false;
    hasOLevel = false;
  }

  // Calculate current contributions from JAMB and other components
  let jambContrib = 0;
  let postContrib = 0;
  let olevelContrib = 0;

  // Max possible contributions
  let maxJambContrib = 0;
  let maxPostContrib = 0;
  let maxOlevelContrib = 0;

  if (f.includes('futa') || normUni.includes('futa') || f.includes('75_25') || f.includes('75:25')) {
    jambContrib = (jamb / 400 * 75);
    maxJambContrib = 75;
    olevelContrib = (currentOLevelPoints / 50 * 25);
    maxOlevelContrib = 25; // max 50 points = 25%
  } else if (f.includes('lasu_60_40') || normUni.includes('lasu') || f.includes('60_40') || f.includes('60:40')) {
    jambContrib = (jamb / 400 * 60);
    maxJambContrib = 60;
    olevelContrib = currentOLevelPoints;
    maxOlevelContrib = 40; // max 40 points
  } else if (f.includes('fuoye') || normUni.includes('fuoye') || normUni.includes('oye-ekiti') || normUni.includes('oye ekiti')) {
    jambContrib = (jamb / 400 * 60);
    maxJambContrib = 60;
    
    // Recompute currentOLevelPoints with FUOYE's specific 3.0 scale:
    let fuoyeOLevelPoints = 0;
    if (oLevels) {
      const grades = oLevels.match(/(A1|B2|B3|C4|C5|C6|D7|E8|F9)/g);
      if (grades) {
        const fuoyeMap: Record<string, number> = {
          'A1': 3.0, 'B2': 2.5, 'B3': 2.0, 'C4': 1.5, 'C5': 1.0, 'C6': 0.5, 'D7': 0, 'E8': 0, 'F9': 0
        };
        const sortedGrades = grades
          .map((g: string) => fuoyeMap[g] || 0)
          .sort((a: number, b: number) => b - a)
          .slice(0, 5);
        fuoyeOLevelPoints = sortedGrades.reduce((acc: number, pts: number) => acc + pts, 0);
      }
    }
    
    olevelContrib = fuoyeOLevelPoints + 10; // 10 points sitting bonus
    maxOlevelContrib = 25; // max 15 points grades + 10 sitting bonus
  } else if (f.includes('lasu_point_based') || f.includes('lasu_point')) {
    jambContrib = (jamb / 8);
    maxJambContrib = 50;
    olevelContrib = currentOLevelPoints;
    maxOlevelContrib = 50; // max 50 points
  } else if (f.includes('50:30:20') || f.includes('50_30_20')) {
    jambContrib = (jamb / 400 * 50);
    maxJambContrib = 50;
    postContrib = (currentPost / 100 * 30);
    maxPostContrib = 30;
    olevelContrib = currentOLevelPoints;
    maxOlevelContrib = 20; // O'Level max points = 20
  } else if (f.includes('50:20:30') || f.includes('50_20_30')) {
    jambContrib = (jamb / 400 * 50);
    maxJambContrib = 50;
    postContrib = (currentPost / 100 * 20);
    maxPostContrib = 20;
    olevelContrib = (currentOLevelPoints / 50 * 30);
    maxOlevelContrib = 30;
  } else if (f.includes('50:40:10') || f.includes('50_40_10') || normUni.includes('awolowo') || normUni.includes('oau')) {
    jambContrib = (jamb / 8);
    maxJambContrib = 50;
    postContrib = (currentPost / 100 * 40);
    maxPostContrib = 40;
    olevelContrib = currentOLevelPoints;
    maxOlevelContrib = 10;
  } else if (f.includes('50:50') || f.includes('50_50')) {
    jambContrib = (jamb / 8);
    maxJambContrib = 50;
    postContrib = (currentPost / 2);
    maxPostContrib = 50;
  } else {
    // Pure JAMB
    jambContrib = jamb / 4;
    maxJambContrib = 100;
  }

  // Calculate Maximum Possible Aggregate Score
  const potentialPostContrib = (isPostUtmePending && hasPost) ? maxPostContrib : postContrib;
  const potentialOlevelContrib = (isAwaitingResult && hasOLevel) ? maxOlevelContrib : olevelContrib;

  const maxPossibleAggregate = parseFloat((jambContrib + potentialPostContrib + potentialOlevelContrib).toFixed(2));

  // Calculate targets to meet cutoffVal
  let requiredPostScore = -1;
  let requiredOlevelScore = -1;

  if (isPostUtmePending && hasPost) {
    let postFactor = 1;
    if (f.includes('50:30:20') || f.includes('50_30_20')) postFactor = 0.3;
    else if (f.includes('50:20:30') || f.includes('50_20_30')) postFactor = 0.2;
    else if (f.includes('50:40:10') || f.includes('50_40_10') || normUni.includes('awolowo') || normUni.includes('oau')) postFactor = 0.4;
    else if (f.includes('50:50') || f.includes('50_50')) postFactor = 0.5;

    const remainingNeeded = cutoffVal - jambContrib - olevelContrib;
    requiredPostScore = parseFloat((remainingNeeded / postFactor).toFixed(1));
  }

  if (isAwaitingResult && hasOLevel) {
    let olevelFactor = 1;
    if (f.includes('futa') || normUni.includes('futa') || f.includes('75_25') || f.includes('75:25')) olevelFactor = 25 / 50; // 0.5
    else if (f.includes('50:20:30') || f.includes('50_20_30')) olevelFactor = 30 / 50; // 0.6
    else {
      olevelFactor = 1; // 1 point = 1%
    }

    const remainingNeeded = cutoffVal - jambContrib - postContrib;
    requiredOlevelScore = parseFloat((remainingNeeded / olevelFactor).toFixed(1));
  }

  return {
    maxPossibleAggregate,
    requiredPostScore,
    requiredOlevelScore,
    hasPost,
    hasOLevel
  };
};

export const validateMandatorySubjects = (
  courseName: string,
  subjects: string[]
): { valid: boolean; reason: string } => {
  if (!courseName || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return { valid: true, reason: "Candidate has the required JAMB subject combination." };
  }

  const c = courseName.toLowerCase().trim();
  const subList = subjects.map(s => s.toLowerCase().trim());
  const has = (kw: string) => subList.some(s => s.includes(kw));

  // 1. Medicine & Allied Medical Sciences
  const isMedicineGroup = ['medicine', 'mbbs', 'dentistry', 'nursing', 'pharmacy', 'medical lab', 'radiography', 'physiotherapy', 'anatomy', 'physiology', 'veterinary'].some(k => c.includes(k));

  if (isMedicineGroup) {
    const hasBio = has('bio') || has('life');
    const hasChem = has('chem');
    const hasPhy = has('phy');

    const missing: string[] = [];
    if (!hasBio) missing.push('Biology');
    if (!hasChem) missing.push('Chemistry');
    if (!hasPhy) missing.push('Physics');

    if (missing.length > 0) {
      return {
        valid: false,
        reason: `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} strictly compulsory for ${courseName} in JAMB.`
      };
    }
  }

  // 2. Engineering & Technology Disciplines
  const isEngineering = c.includes('engineer');
  if (isEngineering) {
    const hasMath = has('math');
    const hasPhy = has('phy');
    const hasChem = has('chem');

    const missing: string[] = [];
    if (!hasMath) missing.push('Mathematics');
    if (!hasPhy) missing.push('Physics');
    if (!hasChem) missing.push('Chemistry');

    if (missing.length > 0) {
      return {
        valid: false,
        reason: `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} strictly compulsory for Engineering courses in JAMB.`
      };
    }
  }

  // 3. Economics
  const isEconomics = c.includes('economics') && !c.includes('home economics');
  if (isEconomics) {
    const hasMath = has('math');
    const hasEcon = has('econ');

    const missing: string[] = [];
    if (!hasMath) missing.push('Mathematics');
    if (!hasEcon) missing.push('Economics');

    if (missing.length > 0) {
      return {
        valid: false,
        reason: `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} strictly compulsory for Economics in JAMB.`
      };
    }
  }

  // 4. Computing / Computer Science / Cyber Security / Software Engineering
  const isComputing = ['computer science', 'cyber', 'software engineer', 'data science', 'information technology'].some(k => c.includes(k));
  if (isComputing) {
    const hasMath = has('math');
    const hasPhy = has('phy');

    const missing: string[] = [];
    if (!hasMath) missing.push('Mathematics');
    if (!hasPhy) missing.push('Physics');

    if (missing.length > 0) {
      return {
        valid: false,
        reason: `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} strictly compulsory for Computing/Computer Science in JAMB.`
      };
    }
  }

  // 5. Law (LL.B)
  const isLaw = c.includes('law') || c.includes('ll.b') || c.includes('jurisprudence');
  if (isLaw) {
    const hasLit = has('literat') || has('lit in eng') || has('literature');

    if (!hasLit) {
      return {
        valid: false,
        reason: `Literature-in-English is strictly compulsory for Law (LL.B) in JAMB.`
      };
    }
  }

  // 6. Biological Sciences
  const isBioScience = ['biology', 'microbiology', 'biochemistry', 'biotechnology', 'botany', 'zoology'].some(k => c.includes(k));
  if (isBioScience) {
    const hasBio = has('bio') || has('life');
    const hasChem = has('chem');

    const missing: string[] = [];
    if (!hasBio) missing.push('Biology');
    if (!hasChem) missing.push('Chemistry');

    if (missing.length > 0) {
      return {
        valid: false,
        reason: `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} strictly compulsory for Biological Sciences in JAMB.`
      };
    }
  }

  return { valid: true, reason: "Candidate has the required JAMB subject combination." };
};

const enforceAdmissionTiers = (
  score: number,
  cutoffVal: number,
  university: string,
  course: string,
  stateOfOrigin?: string,
  isELDS = false,
  isCatchment = false,
  isAwaitingResult = false,
  isPostUtmePending = false,
  jambScore = 0,
  postUtmeScore = 0,
  formulaText = '',
  oLevels = ''
) => {
  const normUni = university.toLowerCase();
  const f = formulaText ? formulaText.toLowerCase() : '';
  let usesPostUtme = true;
  if (f.includes('futa') || normUni.includes('futa') || f.includes('75_25') || f.includes('75:25')) {
    usesPostUtme = false;
  } else if (f.includes('lasu') || normUni.includes('lasu') || f.includes('60_40') || f.includes('60:40') || f.includes('point_based')) {
    usesPostUtme = false;
  } else if (f.includes('fuoye') || normUni.includes('fuoye') || normUni.includes('oye-ekiti') || normUni.includes('oye ekiti')) {
    usesPostUtme = false;
  } else if (f.includes('pure_jamb')) {
    usesPostUtme = false;
  }

  const isARBool = (isAwaitingResult as any) === true || (isAwaitingResult as any) === 'true' || (isAwaitingResult as any) === 'YES' || (typeof isAwaitingResult === 'string' && (isAwaitingResult as any).toLowerCase() === 'yes');
  const isPendingBool = usesPostUtme && ((isPostUtmePending as any) === true || (isPostUtmePending as any) === 'true' || (isPostUtmePending as any) === 'YES' || (typeof isPostUtmePending === 'string' && (isPostUtmePending as any).toLowerCase() === 'yes'));

  const diff = score - cutoffVal;
  const quotaText = isELDS ? "ELDS quota" : isCatchment ? "Catchment quota" : "Merit quota";

  const seasonalTimeline = `\n\n### 4. 2026/2027 Admission Season Context (July 2026)\n*   **Current Phase:** We are currently in the peak of the **Post-UTME Registration** window for the 2026/2027 academic session.\n*   **School Status:** While a few early institutions have started releasing guidelines or scheduling, **the vast majority of schools have not yet written their screening exams**.\n*   **Strategic Action:** If your Post-UTME is pending, treat this month as your prime preparation sprint. If your current aggregate is borderline or below cutoff, use this active registration phase to explore a JAMB Change of Course or Institution on your CAPS portal before primary merit lists lock.`;

  if (diff < 0 && (isARBool || isPendingBool)) {
    // Parse O'Level points from string
    let currentOLevelPoints = 30; // default baseline (C6)
    if (oLevels) {
      const grades = oLevels.match(/(A1|B2|B3|C4|C5|C6|D7|E8|F9)/g);
      if (grades) {
        const gradeMap: Record<string, number> = {
          'A1': 10, 'B2': 9, 'B3': 8, 'C4': 7, 'C5': 6, 'C6': 5, 'D7': 4, 'E8': 3, 'F9': 0
        };
        currentOLevelPoints = grades.reduce((acc: number, g: string) => acc + (gradeMap[g] || 0), 0);
      }
    }

    const { maxPossibleAggregate, requiredPostScore, requiredOlevelScore, hasPost, hasOLevel } = calculateMaxAndTarget(
      jambScore, postUtmeScore, currentOLevelPoints, cutoffVal, university, formulaText, isARBool, isPendingBool, oLevels
    );

    let conditionsText = "under perfect conditions";
    if (hasPost && hasOLevel) {
      conditionsText = "under perfect conditions (100% on Post-UTME and straight A1s)";
    } else if (hasPost) {
      conditionsText = "under perfect conditions (100% on Post-UTME)";
    } else if (hasOLevel) {
      conditionsText = "under perfect conditions (straight A1s)";
    }

    let pendingReason = "Since your results are pending";
    if (isPendingBool && isARBool && hasPost && hasOLevel) {
      pendingReason = "Since you have a pending Post-UTME exam and awaiting O'Level results";
    } else if (isPendingBool && hasPost) {
      pendingReason = "Since you have a pending Post-UTME exam";
    } else if (isARBool && hasOLevel) {
      pendingReason = "Since you have awaiting O'Level results";
    }

    let realityReason = "because of your pending status";
    if (isPendingBool && isARBool && hasPost && hasOLevel) {
      realityReason = "because your Post-UTME exam is still **Pending** and O'Level results are **Awaiting**";
    } else if (isPendingBool && hasPost) {
      realityReason = "because your Post-UTME exam is still **Pending**";
    } else if (isARBool && hasOLevel) {
      realityReason = "because your O'Level results are **Awaiting**";
    }

    if (maxPossibleAggregate < cutoffVal) {
      // 4A. MATHEMATICAL DEFICIT (Can't hit cutoff even with perfect scores)
      return {
        verdict: "Low Probability",
        probability: 15,
        detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Mathematical Deficit / Change Recommended**\n- **Admission Probability:** **15%**\n\n### 2. The Reality Check\nYour current aggregate score of **${score}%** is lower than the typical departmental merit cutoff of **${cutoffVal}%** for **${course}** at **${university}**. ${pendingReason}, we calculated your **maximum possible aggregate** ${conditionsText} to be **${maxPossibleAggregate}%**.\n\nUnfortunately, even with perfect outstanding scores, this creates an absolute mathematical deficit of **-${(cutoffVal - maxPossibleAggregate).toFixed(2)}%** relative to the competitive cutoff. Being realistic, securing admission into this specific programme is highly unlikely due to this structural deficit.\n\n### 3. Actionable Next Steps\n*   **Perform JAMB Change of Course:** Pivot immediately by performing a Change of Course to a less competitive department (e.g., related courses) matching your subject combination where your score makes you highly competitive.\n*   **Perform JAMB Change of Institution:** Consider changing your target institution to state or private universities with lower cutoff thresholds to ensure you secure admission this year.\n*   **Keep Portals Updated:** Keep your WAEC/NECO results uploaded correctly on JAMB CAPS to ensure eligibility for supplementary lists or alternative courses.` + seasonalTimeline,
        recommendation: `Even with perfect pending scores, your maximum aggregate (${maxPossibleAggregate}%) is below the cutoff (${cutoffVal}%). We strongly recommend performing a JAMB Change of Course or Institution immediately.`
      };
    } else {
      // 4B. CLEAR PATHWAY OPEN (Can clear the cutoff with hard work!)
      // Calculate realistic probability based on current projected deficit, starting from 50% (borderline)
      // and decreasing as the current projected aggregate score falls below the cutoff.
      const prob = Math.min(Math.max(Math.round(50 + (diff * 4)), 10), 65);
      const verdict = prob >= 60 ? "Strong" : prob >= 40 ? "Borderline" : "Low Probability";
      const statusText = prob >= 60 
        ? "Provisional / Pathway to Admission Open" 
        : prob >= 40 
          ? "Provisional / Borderline Target (Pathway Open)" 
          : "Provisional / Below Cutoff Target (Pathway Open)";
      
      let pendingDetails = "";
      if (isPendingBool && hasPost) {
        pendingDetails += `*   🎯 **Target Post-UTME Score: Score at least ${Math.max(10, Math.min(100, Math.ceil(requiredPostScore)))} / 100** on your upcoming screening exam. Since this contributes significantly to your aggregate, reaching this target will put you directly on the merit list.\n`;
      }
      if (isARBool && hasOLevel) {
        pendingDetails += `*   📚 **Target O'Level Points: Secure at least ${Math.max(10, Math.min(50, Math.ceil(requiredOlevelScore)))} points** in your WAEC/NECO (requiring good B2/B3 or A1 results in core subjects).\n`;
      }

      return {
        verdict: verdict,
        probability: prob,
        detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **${statusText}**\n- **Admission Probability:** **${prob}% (Dependent on upcoming results)**\n\n### 2. The Reality Check\nYour current provisional aggregate score is **${score}%**, which is currently below the competitive merit cutoff of **${cutoffVal}%**. However, ${realityReason}, you are in full control of your admission outcome! Your calculated maximum possible aggregate score is **${maxPossibleAggregate}%**, which is well above the cutoff! Hitting your upcoming targets will successfully secure your admission.\n\n### 3. Actionable Next Steps\n${pendingDetails}*   **Intense Exam Preparation:** Practice daily with Post-UTME CBT past questions. Target high speed and accuracy under real exam constraints.\n*   **Secure O'Level Uploads on JAMB CAPS:** Immediately once your WAEC/NECO results are released, go to an accredited JAMB CBT center and upload them to your CAPS profile to ensure you are included in the automated ranking.\n*   **Keep Change of Course as a Backup:** Have a backup plan in mind. If you perform lower than your targets on the exam, be prepared to make a JAMB Change of Course/Institution to a less competitive program.` + seasonalTimeline,
        recommendation: `Since your results are pending, you can secure admission by hitting your targets! Score at least ${isPendingBool && hasPost ? Math.max(10, Math.min(100, Math.ceil(requiredPostScore))) + '/100 on Post-UTME' : ''} ${isARBool && hasOLevel ? 'and ' + Math.max(10, Math.min(50, Math.ceil(requiredOlevelScore))) + ' O\'Level points' : ''} to clear the competitive cutoff.`
      };
    }
  }

  if (Math.abs(diff) < 0.01) {
    // 1. THE BORDERLINE TIER (Score == Cutoff)
    return {
      verdict: "Borderline",
      probability: 55,
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Borderline / Fair**\n- **Admission Probability:** **55%**\n\n### 2. The Reality Check\nYour aggregate score of **${score}%** is exactly equal to the competitive departmental cutoff of **${cutoffVal}%** for **${course}** at **${university}** under the **${quotaText}**. Sitting exactly on the cutoff mark is highly volatile due to merit list limits, strict state quotas, and random tie-breakers. Your position is extremely sensitive and requires cautious, urgent handling. Do not assume admission is guaranteed simply by hitting the baseline.\n\n### 3. Actionable Next Steps\n*   **Monitor Portal Daily:** Log in to the official JAMB CAPS portal and your school's screening portal every single day to track any changes in your status.\n*   **Verify O'Level Uploads:** Ensure your WAEC/NECO results are fully uploaded and verified on JAMB CAPS. A single missing grade can disqualify you instantly.\n*   **Consider a Backup:** Have a backup plan ready. Be prepared to perform a JAMB Change of Course or Change of Institution to a less competitive department if the primary list is filled.` + seasonalTimeline,
      recommendation: `Your aggregate score of ${score}% is exactly equal to the competitive cutoff of ${cutoffVal}%. This position is highly volatile. Monitor your portals daily and consider a backup change of course/institution just in case.`
    };
  } else if (diff > 0 && diff < 2.5) {
    // 2A. THE MARGINAL PASS TIER (Score is 0.01% to 2.49% ABOVE Cutoff)
    // High-risk marginal tier where scoring 0.25% or 1 to 2% may not guarantee admission for competitive courses
    const isHighlyCompetitive = ['medicine', 'surgery', 'law', 'nursing', 'pharmacy', 'computer', 'dentistry', 'engineering', 'medical'].some(c => course.toLowerCase().includes(c));
    const prob = isHighlyCompetitive ? 58 : 64;
    
    return {
      verdict: isHighlyCompetitive ? "Marginal Pass / High Competition Risk" : "Marginal Pass / Quota Risk",
      probability: prob,
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Marginal Pass / High Competition Risk**\n- **Admission Probability:** **${prob}%**\n\n### 2. The Reality Check\nYour aggregate score of **${score}%** clears the departmental cutoff of **${cutoffVal}%** by a very thin margin of **+${diff.toFixed(2)}%** under the **${quotaText}**.\n\nWhile this is technically a positive score, for highly competitive courses like **${course}** at **${university}**, clearing the cutoff by just 0.25% to 2% carries significant risk. In these fields, hundreds of students often crowd within fractional percentage ranges, and schools frequently enforce strict departmental quotas (Merit vs Catchment vs ELDS). Standard tie-breakers, localized catchment quota limits, and late-stage index adjustments can easily shift the final list, meaning admission is **not 100% guaranteed**.\n\n### 3. Actionable Next Steps\n*   **Monitor JAMB CAPS with Urgency:** Regularly check the 'Admission Status' tab on your JAMB CAPS profile. Look specifically for updates like 'Admission in Progress' (AIP) or 'Transfer Approval' (if they offer you an alternative course).\n*   **Verify O'Level and JAMB Match:** Verify that your O'Level grades and JAMB subject combinations align perfectly with the departmental rules. Even a minor discrepancy can cause a marginal pass to be dropped.\n*   **Prepare an Alternative Plan:** Be prepared for supplementary lists. If you are not on the primary merit list, keep an eye out for change of course cards or supplementary forms on your school's portal.` + seasonalTimeline,
      recommendation: `Your aggregate clears the cutoff by a marginal ${diff.toFixed(2)}%. For competitive programmes like ${course}, this fractional advantage carries high tie-breaker and quota risks. Monitor JAMB CAPS closely and prepare alternative supplementary options.`
    };
  } else if (diff >= 2.5 && diff < 6) {
    // 2B. THE STRONG TIER (Score is 2.5% to 5.99% ABOVE Cutoff)
    const prob = Math.min(Math.max(Math.round(68 + ((diff - 2.5) / 3.5) * 11), 68), 79);
    return {
      verdict: "Strong",
      probability: prob,
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Strong**\n- **Admission Probability:** **${prob}%**\n\n### 2. The Reality Check\nYour aggregate score of **${score}%** clears the departmental cutoff of **${cutoffVal}%** by a solid but modest margin of **+${diff.toFixed(2)}%** under the **${quotaText}**. This gives you a clear competitive advantage on the merit list, but it does not guarantee automatic entry. You must remain optimistic yet highly vigilant.\n\n### 3. Actionable Next Steps\n*   **Complete Screening Flawlessly:** Double-check every field during your school's online screening registration.\n*   **Track Portal Updates:** Regularly check JAMB CAPS for "Admission in Progress" (AIP) or "Approved" statuses.\n*   **Upload O'Level Results:** Confirm your O'Level grades are correctly reflected on JAMB CAPS.` + seasonalTimeline,
      recommendation: `Your aggregate score clears the departmental cutoff by a modest margin. You have a competitive advantage on the merit list. Stay vigilant and complete all screening registrations flawlessly.`
    };
  } else if (diff >= 6) {
    // 3. THE VERY STRONG TIER (Score is >= 6% ABOVE Cutoff)
    const prob = Math.min(Math.max(Math.round(80 + ((diff - 6) / 20) * 18), 80), 98);
    return {
      verdict: "Very Strong / Excellent",
      probability: prob,
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Very Strong / Excellent**\n- **Admission Probability:** **${prob}%**\n\n### 2. The Reality Check\nCongratulations! Your aggregate score of **${score}%** significantly clears the typical departmental cutoff of **${cutoffVal}%** by **+${diff.toFixed(2)}%** under the **${quotaText}**. You are in an exceptional winning position to secure a premium merit list spot at **${university}**.\n\n### 3. Actionable Next Steps\n*   **Monitor JAMB CAPS:** Access the CAPS portal to accept your admission as soon as it is officially offered.\n*   **Accept Admission Promptly:** Remember you have exactly 4 weeks to accept the admission on CAPS once offered.\n*   **Track Portal Fees:** Prepare your acceptance fees and monitor the school's official website for clearance deadlines.` + seasonalTimeline,
      recommendation: `Congratulations! Your aggregate score is exceptional and significantly clears the typical cutoff. You are in an outstanding position to secure a merit list spot. Focus on accepting your admission on CAPS.`
    };
  } else {
    // 4. THE BELOW CUTOFF TIER (Score < Cutoff)
    const prob = Math.min(Math.max(Math.round(25 + (diff * 3)), 5), 29);
    return {
      verdict: "Low Probability",
      probability: prob,
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Low Probability**\n- **Admission Probability:** **${prob}%**\n\n### 2. The Reality Check\nYour aggregate score of **${score}%** is lower than the typical departmental merit cutoff of **${cutoffVal}%** (a deficit of **${diff.toFixed(2)}%**) under the **${quotaText}**. We must be realistic and honest: securing primary merit admission for this specific programme has a low probability. However, you have clear proactive pathways to manage this risk.\n\n### 3. Actionable Next Steps\n*   **JAMB Change of Course:** Pivot immediately by performing a Change of Course to a less competitive department (e.g., related courses) matching your subject combination.\n*   **JAMB Change of Institution:** Consider changing your institution to state or private universities with lower cutoff thresholds.\n*   **Verify O'Level Uploads:** Keep your WAEC/NECO grades uploaded correctly so that you remain eligible for supplementary lists or alternative programs.` + seasonalTimeline,
      recommendation: `Your aggregate score is below the competitive cutoff. Pivot immediately by considering a Change of Course or Institution to less competitive options to secure admission.`
    };
  }
};

// ─── Cutoff Calculator ─────────────────────────────────────────────────────────

export const getCourseCutoffInfo = async (
  university: string,
  course: string,
  score: number,
  oLevels: string,
  jambSubjects: string[],
  role?: string,
  isAwaitingResult = false,
  isPostUtmePending = false,
  formulaExplanation?: string,
  stateOfOrigin?: string,
  isELDS = false,
  isCatchment = false,
  quotaDiscount = 0,
  jambScore = 0,
  postUtmeScore = 0
) => {
  try {
    const cacheKey = `${university}_${course}_${score}_${oLevels}_${jambSubjects.join('_')}_${role || 'Std'}_${isAwaitingResult}_${isPostUtmePending}_${stateOfOrigin || 'None'}_${isELDS}_${isCatchment}_${quotaDiscount}_v3`;
    const cachedResult = await getCachedCourseCutoffInfo(university, cacheKey);
    if (cachedResult) {
      console.log(`Using cached course cutoff check for ${university} - ${course}`);
      let manualOverride = await getCutoffOverride(university, course);
      const nUni = university.toLowerCase().trim();
      const nCourse = course.toLowerCase().trim();
      if (!manualOverride && (nUni.includes("futa") || nUni.includes("akure") || nUni.includes("technology, akure")) && nCourse.includes("metallurgical")) {
        manualOverride = {
          institution: university,
          course: course,
          departmentalCutoff: "55.0%",
          institutionalCutoff: "180",
          explanation: "FUTA Merit Cutoff (JAMB + O'Level point aggregate system)"
        };
      }
      if (manualOverride) {
        cachedResult.departmentalCutoff = manualOverride.departmentalCutoff;
        if (manualOverride.institutionalCutoff) cachedResult.institutionalCutoff = manualOverride.institutionalCutoff;
        if (manualOverride.explanation) cachedResult.cutoff = `${manualOverride.departmentalCutoff} (${manualOverride.explanation})`;
      }

      // Check if the cached result is missing critical detailed fields or is corrupted
      const isCacheCorrupted = !cachedResult.detailedStrategy || 
                               cachedResult.detailedStrategy === "undefined" || 
                               !cachedResult.recommendation || 
                               cachedResult.recommendation === "undefined";

      const isTemplateStrategy = !!(cachedResult.detailedStrategy && (
        cachedResult.detailedStrategy.includes("provisional aggregate score") ||
        cachedResult.detailedStrategy.includes("under perfect conditions") ||
        cachedResult.detailedStrategy.includes("Since your results are pending") ||
        cachedResult.detailedStrategy.includes("your pending status") ||
        cachedResult.detailedStrategy.includes("provisional/borderline")
      ));

      const shouldRegenerate = isCacheCorrupted || isTemplateStrategy;

      if (!shouldRegenerate) {
        // Enforce the same strong/borderline/low threshold alignment
        const cutoffStr = cachedResult.departmentalCutoff || cachedResult.cutoff || "55";
        const parsedCutoffMatch = cutoffStr.toString().match(/(\d+(\.\d+)?)/);
        const parsedCutoffVal = parsedCutoffMatch ? parseFloat(parsedCutoffMatch[1]) : 55;

        const enforced = enforceAdmissionTiers(
          score, parsedCutoffVal, university, course, stateOfOrigin, isELDS, isCatchment,
          isAwaitingResult, isPostUtmePending, jambScore, postUtmeScore, formulaExplanation, oLevels
        );
        cachedResult.verdict = enforced.verdict;
        cachedResult.probability = enforced.probability;

        if (!cachedResult.detailedStrategy || cachedResult.detailedStrategy.trim() === "" || cachedResult.detailedStrategy === "undefined") {
          cachedResult.detailedStrategy = enforced.detailedStrategy;
        }
        if (!cachedResult.recommendation || cachedResult.recommendation.trim() === "" || cachedResult.recommendation === "undefined") {
          cachedResult.recommendation = enforced.recommendation;
        }

        return cachedResult;
      }
      console.log("Cached result was missing strategy fields, corrupt, or using hardcoded templates; bypassing cache to regenerate.");
    }

    let manualOverride = await getCutoffOverride(university, course);
    const nUni = university.toLowerCase().trim();
    const nCourse = course.toLowerCase().trim();
    if (!manualOverride && (nUni.includes("futa") || nUni.includes("akure") || nUni.includes("technology, akure")) && nCourse.includes("metallurgical")) {
      manualOverride = {
        institution: university,
        course: course,
        departmentalCutoff: "55.0%",
        institutionalCutoff: "180",
        explanation: "FUTA Merit Cutoff (JAMB + O'Level point aggregate system)"
      };
    }
    let overridePrompt = "";
    if (manualOverride) {
      overridePrompt = `
⚠️ CRITICAL SYSTEM OVERRIDE (MANDATORY ADMISSION GROUND TRUTH):
- The official, verified 2026 departmental competitive cut-off score for "${course}" at "${university}" is EXCLUSIVELY: "${manualOverride.departmentalCutoff}".
- The institutional cut-off floor is: "${manualOverride.institutionalCutoff || '150'}".
- Verified explanation / policy detail: "${manualOverride.explanation || 'No extra notes.'}".
You MUST evaluate the candidate's aggregate score (${score}%) strictly against this verified departmental cut-off score ("${manualOverride.departmentalCutoff}") to compute the probability, recommendation, and verdict.
`;
    }

    const knowledge = await getAllKnowledgeFragments();
    const learnedPrompt = knowledge.length > 0
      ? "ADDITIONAL LEARNED KNOWLEDGE (USE THIS TO OVERRIDE STATIC DATA IF IT CONTRADICTS):\n" + knowledge.map(k => `- ${k.key}: ${k.value}`).join('\n') + "\n\n"
      : "";

    let officialCutoffData = "";
    try {
      const [search2026, searchHistoric, searchSchedule] = await Promise.all([
        searchWeb(`official 2026/2027 Post-UTME departmental cutoff marks for ${course} at ${university} Nigeria`).catch(() => ""),
        searchWeb(`"${university}" "${course}" cutoff mark OR merit aggregate 2024 OR 2025 percentage score`).catch(() => ""),
        searchWeb(`"${university}" Post-UTME 2026/2027 screening registration status form out dates OR exam schedule`).catch(() => "")
      ]);

      const parts = [];
      if (search2026 && search2026.length > 50) parts.push(`[Online Real-Time Grounding - 2026/2027 Current Release]:\n${search2026}`);
      if (searchHistoric && searchHistoric.length > 50) parts.push(`[Online Real-Time Grounding - Historical Benchmarks (2024/2025/2023)]:\n${searchHistoric}`);
      if (searchSchedule && searchSchedule.length > 50) parts.push(`[Online Real-Time Grounding - 2026/2027 School Registration Status & Exam Schedule/Format]:\n${searchSchedule}`);

      officialCutoffData = parts.length > 0
        ? "OFFICIAL ONLINE GROUNDING DATA (CRITICAL HIGH-PRECISION RESOURCE, USE TO EXTRACT ACTUAL SCORES AND LIVE STATUS/SCHEDULES):\n" + parts.join("\n\n")
        : "No specific online search grounding available. Rely on standard historical competitiveness and general institutional parameters.";
    } catch (searchError) {
      console.warn("Search for official cutoff failed:", searchError);
      officialCutoffData = "Search failed due to rate limits or connectivity. Rely on standard competitive thresholds.";
    }

    const normUni = university.toLowerCase();
    const f = formulaExplanation ? formulaExplanation.toLowerCase() : '';

    let usesPostUtme = true;
    if (f.includes('futa') || normUni.includes('futa') || f.includes('75_25') || f.includes('75:25')) {
      usesPostUtme = false;
    } else if (f.includes('lasu') || normUni.includes('lasu') || f.includes('60_40') || f.includes('60:40') || f.includes('point_based')) {
      usesPostUtme = false;
    } else if (f.includes('fuoye') || normUni.includes('fuoye') || normUni.includes('oye-ekiti') || normUni.includes('oye ekiti')) {
      usesPostUtme = false;
    } else if (f.includes('pure_jamb')) {
      usesPostUtme = false;
    }

    const hasAllResults = !isAwaitingResult && (!isPostUtmePending || !usesPostUtme);
    const oLevelPending = isAwaitingResult;
    const isPUtmePending = isPostUtmePending && usesPostUtme;
    const isTestingHypothetical = isAwaitingResult && isPostUtmePending && usesPostUtme;

    let calcDedicatedKey = null;
    if (typeof window !== 'undefined') {
      try {
        const pref = localStorage.getItem('campusai_calc_key_pref');
        calcDedicatedKey = resolvePrefKey(pref);
      } catch (e) {}
    }

    const response = await runAIWithFallback(async (ai) => {
      const hasWrittenPostUtme = usesPostUtme;
      return await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `
${overridePrompt}

${officialCutoffData}

${learnedPrompt}

${getSystemPrompt()}

Perform an exhaustive admission probability check under these STRICT architectural guidelines:
1. NO CROSS-CONTAMINATION: You are evaluating the program for "${university}" ONLY. If the OFFICIAL ONLINE GROUNDING DATA or search results contain information about other universities (such as LASU, FUTA, UNILAG, UI, etc.), you MUST completely ignore them. Do NOT reference their scales, cutoffs, or policies in your analysis for ${university}.
2. NO PLACEHOLDER GIBBERISH OR METAPHORICAL WORD SALAD:
   - "fresherBudget" MUST be a realistic, structured, professional cost breakdown for a first-year student at "${university}" in Nigerian Naira (NGN). Ensure the tuition/fees reflect realistic current rates for freshers in Nigeria (typically ₦130,000 to ₦260,000+ for federal universities like FUTA, and potentially higher for state/private institutions). Include tuition/charges, acceptance fee, and basic off-campus/on-campus accommodation (e.g. ₦120,000 - ₦250,000+). Example format: "Tuition/Charges: ₦185,000 | Acceptance Fee: ₦45,000 | Accommodation: ₦150,000. Total Estimated Fresher Budget: ₦380,000". Never output low unrealistic numbers under ₦100,000 total or poetic filler sentences.
3. CITATION SANITY:
   - "sourcesCited" MUST be an array of real, valid URLs or domains retrieved from the search results (e.g., ["delsu.edu.ng", "jamb.gov.ng"]). Never generate fake domains, corrupted non-ASCII text, or random characters.
4. MATH CONGRUENCY:
   - Ensure the aggregate calculation and mathematical verdict align precisely with the institution's real formula or the specified context formula.
5. NO POST-UTME HALLUCINATION FOR NON-EXAM SCHOOLS:
   - If "Has Written Post-UTME Exam" is "NO", you are STRICTLY FORBIDDEN from recommending or advising the candidate to prepare for, practice, or write any Post-UTME exam in "detailedStrategy", "recommendation", or "alternatives". Instead, advise them on securing their O'Level uploads, verifying JAMB CAPS result uploads, and tracking point-based screening portal deadlines.
6. CONCRETE ACTIONABLE REAL ALTERNATIVES (STRICT COURSE/SCHOOL NAMES):
   - "alternatives" MUST contain 2 to 4 actual, specific alternative undergraduate courses offered at ${university} (e.g., related less-competitive programmes) OR specific alternative institutions in Nigeria (e.g., specific state universities, private universities, or polytechnics, such as "Delta State University", "FUPRE", "Federal Polytechnic, Ado-Ekiti").
   - DO NOT output generic titles like "JAMB Change of Course" or "JAMB Change of Institution" as the name. The "name" of each alternative MUST be the actual concrete course or institution name (e.g., "Agricultural and Environmental Engineering at ${university}" or "Public Administration at Delta State University").
   - "typicalCutoff" MUST be the actual cut-off mark or aggregate score typically needed for that alternative (e.g., "50.0%" or "180 JAMB").
   - "reasoning" MUST explain clearly why this specific course/school is a viable safe option for this candidate based on their current JAMB and aggregate scores.
7. STRATEGIC ADVISEMENT BY STRICT TIER ASSIGNMENT:
   Compare the candidate's aggregate score (${score}%) directly against the estimated departmental cutoff. You MUST evaluate and place them into one of these four exact tiers, applying their rules, probability, verdict, tone, and requirements:

   TIER 1: THE BORDERLINE TIER (Score is EXACTLY EQUAL to the departmental cutoff, e.g., 55% score vs 55% cutoff)
   - Verdict Status: "Borderline"
   - Admission Probability: 50% - 60% (set exactly to a value in this range, e.g. 55%)
   - Rule & Tone: Sitting exactly on the cutoff mark is highly volatile due to merit list limits, state quotas, and tie-breakers. Tone must be cautious and urgent. DO NOT classify this as "Strong".
   - UI Requirement: Must structure the detailedStrategy text to recommend monitoring the school portal daily, uploading O'Level results, and preparing a backup change of course/institution.

   TIER 2: THE STRONG TIER (Score is 1% to 5.99% ABOVE the cutoff, e.g., 60% score vs 55% cutoff)
   - Verdict Status: "Strong"
   - Admission Probability: 65% - 79% (set to a value scaled in this range)
   - Rule & Tone: Optimistic, encouraging, and reassuring. Remind them to complete screening registrations flawlessly and stay vigilant. Do NOT push them to change course or institution, but list optional backups.

   TIER 3: THE VERY STRONG TIER (Score is >= 6% ABOVE the cutoff, e.g., 65%+ score vs 55% cutoff)
   - Verdict Status: "Very Strong / Excellent"
   - Admission Probability: 80% - 98% (set to a value scaled in this range)
   - Rule & Tone: Highly congratulatory. They are in an exceptional winning position.
   - UI Requirement: Do NOT include warning or change of course suggestions. Focus on accepting admission on JAMB CAPS (must accept within 4 weeks), monitoring portal fees, and completing school registration.

   TIER 4: THE BELOW CUTOFF TIER (Score < cutoff)
   - Verdict Status: "Low Probability"
   - Admission Probability: Below 30% (set to a value in this range)
   - Rule & Tone: Empathetic, honest, and immediately proactive. Pivot to utility: guide them to do a JAMB change of course to less competitive departments matching their subject combination, or change of institution.

8. REAL-TIME SCHOOL SCREENING SCHEDULE & MODE OF EVALUATION (CRITICAL):
   - Analyze the "School Registration Status & Exam Schedule/Format" section in the search grounding data.
   - Specifically mention the current real-time state of "${university}"'s Post-UTME screening: tell the candidate whether the 2026/2027 forms are open/active, if registrations are ongoing, and mention any official exam/screening dates or deadlines.
   - If the search data shows that "${university}" evaluates candidates using an exam-less, point-based, or O'Level screening method, state this clearly in "detailedStrategy" to relieve exam anxiety.
   - Integrate these specific, live dates or status updates naturally into your narrative (under '### 2. The Reality Check' or '### 3. Actionable Next Steps') so the candidate knows exactly what the immediate timeline is for their school.

9. CRITICAL RULES FOR ANALYSIS (MANDATORY):
   - You are analyzing a pre-calculated aggregate score (${score}%), which has already been calculated by the application. You are NOT performing the aggregate score calculation yourself.
   - Respect the user's result status variables provided below:
     - If "User Has All Results (Final Score)" is YES: The candidate's results are 100% complete and final. The aggregate score is final. If the aggregate score (${score}%) is below the departmental cutoff, you MUST advise them that their score is final and they cannot improve it at this institution/course. You MUST recommend they perform a JAMB Change of Course or Institution immediately to secure admission. Do NOT suggest they can improve their score by writing a Post-UTME or waiting for WAEC results.
     - If "O'Level Result is Pending" is YES: The candidate is awaiting WAEC/NECO results. Advise them explicitly on target O'Level points/grades needed to boost their aggregate score.
     - If "Post-UTME Exam is Pending" is YES: The candidate has a pending Post-UTME exam. Advise them on exam preparation strategies, target scores, and screening benchmarks.
     - If "Testing Hypothetical / 'What-If' Scenarios" is YES: Give a deeper, more detailed analysis of what-if options.
   - Respect the school's formula:
     - If "Uses Post-UTME Exam" is NO (such as for FUOYE, FUTA, or LASU): The school does NOT require a Post-UTME exam. Under no circumstances should you recommend preparing for, practicing past questions for, or writing a Post-UTME exam. Do not suggest improving their score using Post-UTME. Instead, focus entirely on O'Level result uploads, JAMB CAPS verification, and point-based screening deadlines.
   - Only use data the user has explicitly provided. Be highly realistic, clear, and actionable.

- Institution: ${university}
- Program: ${course}
- Candidate Aggregate Score: ${score}% (out of 100)
- Raw JAMB Score: ${jambScore > 0 ? `${jambScore} / 400` : 'Not explicitly provided'}
- Raw Post-UTME / Screening Score: ${postUtmeScore > 0 ? `${postUtmeScore} / 100` : 'N/A or Pending'}
- O-Level Profile: ${oLevels}
- JAMB Subjects: ${jambSubjects.join(', ')}
- Role: ${role || 'Standard'}
- Uses Post-UTME Exam: ${usesPostUtme ? 'YES' : 'NO'}
- User Has All Results (Final Score): ${hasAllResults ? 'YES' : 'NO'}
- O'Level Result is Pending (Awaiting WAEC/NECO): ${oLevelPending ? 'YES' : 'NO'}
- Post-UTME Exam is Pending: ${isPUtmePending ? 'YES' : 'NO'}
- Testing Hypothetical / "What-If" Scenarios: ${isTestingHypothetical ? 'YES' : 'NO'}
- State of Origin: ${stateOfOrigin || 'Not Specified'}
- Is ELDS State: ${isELDS ? 'YES' : 'NO'}
- Is Catchment Area Candidate: ${isCatchment ? 'YES' : 'NO'}
- Quota Discount Applied: ${quotaDiscount}%
${formulaExplanation ? `- Scoring Formula Context: ${formulaExplanation}` : ''}

Return JSON:
{
  "institutionalCutoff": "string (the baseline floor score, e.g. '160')",
  "departmentalCutoff": "string (estimated competitive departmental cutoff score, e.g. '65.0%')",
  "cutoff": "string (cutoff label/range, e.g. '60.0% - 68.0%')",
  "mathBreakdown": "string (concise explanation of the calculation of the aggregate)",
  "subjectCombinationValidation": { "valid": boolean, "reason": "string" },
  "reliability": "string ('high' | 'medium' | 'low')",
  "recommendation": "string (clear brief strategic advice, maximum 2 sentences, ideal for a quick summary card, tailored to their tier status)",
  "detailedStrategy": "string (a highly detailed, structured, and scannable admission strategy analysis, containing exactly three markdown sections: '### 1. Verdict Summary', '### 2. The Reality Check', and '### 3. Actionable Next Steps'. Use bullet points for steps. Match the tone and requirements of the candidate's score tier exactly as instructed: Borderline (Score == Cutoff), Strong (Score is 1-5.99% above), Very Strong / Excellent (Score is >=6% above), or Low Probability (Score < Cutoff).)",
  "probability": number (estimated percentage chance from 0 to 100),
  "verdict": "Very Strong / Excellent" | "Strong" | "Borderline" | "Low Probability",
  "alternatives": [{ "name": "string", "typicalCutoff": "string", "reasoning": "string" }],
  "isOffered": boolean,
  "fresherBudget": "string (clean realistic Naira budget breakdown matching modern costs, e.g. 'Tuition: ₦195,000 | Acceptance Fee: ₦50,000 | Hostel/Rent: ₦150,000. Total: ₦395,000')",
  "sourcesCited": ["string (valid domain/URL)"],
  "predictionConfidenceInterval": "string (percentage range, e.g. '60.00% to 75.00%')"
}`,
        config: { responseMimeType: "application/json" }
      });
    }, calcDedicatedKey || undefined);

    const parsed = safeJsonParse(response.text, {});

    if (parsed) {
      const normalizedUni = university.toLowerCase().trim();
      const normalizedCourse = course.toLowerCase().trim();

      const commonKeywords = [
        'accounting', 'accountancy', 'banking', 'finance', 'computer',
        'medical', 'medicine', 'nursing', 'law', 'legal', 'pharmacy',
        'economics', 'mass comm', 'business admin', 'biochemistry',
        'microbiology', 'political sci', 'sociology', 'history',
        'engineering', 'agriculture', 'architecture'
      ];

      const isCommonCourse = commonKeywords.some(kw => normalizedCourse.includes(kw));
      const looksLikeUniOrPoly = normalizedUni.includes('university') ||
                                 normalizedUni.includes('unilag') ||
                                 normalizedUni.includes('lasu') ||
                                 normalizedUni.includes('polytechnic') ||
                                 normalizedUni.includes('college') ||
                                 normalizedUni.length < 10;

      if (isCommonCourse && looksLikeUniOrPoly) parsed.isOffered = true;

      try {
        const availableOptions = await getUniversityCourses(university);
        const matchesOption = availableOptions.some((c: string) => {
          const cLower = c.toLowerCase().trim();
          return cLower === normalizedCourse ||
                 cLower.includes(normalizedCourse) ||
                 normalizedCourse.includes(cLower) ||
                 (cLower.replace(/[^a-z]/g, '') === normalizedCourse.replace(/[^a-z]/g, ''));
        });
        if (matchesOption) parsed.isOffered = true;
      } catch (err) {
        console.warn("Dynamic custom cross-reference check bypassed:", err);
      }

      if (manualOverride) {
        parsed.departmentalCutoff = manualOverride.departmentalCutoff;
        if (manualOverride.institutionalCutoff) parsed.institutionalCutoff = manualOverride.institutionalCutoff;
        if (manualOverride.explanation) parsed.cutoff = `${manualOverride.departmentalCutoff} (${manualOverride.explanation})`;
      }

      // ─── 1. MANDATORY SUBJECT COMBINATION VALIDATION HARD FAILURE GATE ───────────
      const subjectCheck = validateMandatorySubjects(course, jambSubjects);
      if (!subjectCheck.valid) {
        parsed.subjectCombinationValidation = subjectCheck;
        parsed.probability = 0;
        parsed.verdict = "Disqualified / Invalid Subject Combination";
        parsed.recommendation = `CRITICAL JAMB SUBJECT MISMATCH: Your written JAMB subjects (${jambSubjects.join(', ')}) do not meet the compulsory requirements for ${course} at ${university}. ${subjectCheck.reason} You MUST perform an immediate JAMB Change of Course.`;
        parsed.detailedStrategy = `### 1. Verdict Summary\n- **Verdict Status:** **Disqualified / Invalid Subject Combination**\n- **Admission Probability:** **0%**\n\n### 2. The Reality Check\nYour written JAMB subject combination of **${jambSubjects.join(', ')}** does **NOT** meet the compulsory subject requirements for **${course}** at **${university}**. ${subjectCheck.reason}\n\nUnder official JAMB CAPS regulations, institutional screening algorithms will automatically reject your application due to subject mismatch, regardless of your aggregate score.\n\n### 3. Actionable Next Steps\n*   **Immediate JAMB Change of Course:** Log into your JAMB CAPS portal and change your course choice to a department that strictly accepts your written JAMB subjects (${jambSubjects.join(', ')}).\n*   **Consult JAMB Brochure:** Verify subject requirements for alternative departments before submitting your change of course.\n*   **Verify O'Level Upload:** Confirm your WAEC/NECO grades are uploaded correctly on JAMB CAPS to ensure a smooth transition once you switch to a valid program.`;
      } else {
        // ─── DEFENSIVE BACKUPS FOR EMPTY/UNDEFINED AI FIELDS ────────────────────────
        const cutoffStr = parsed.departmentalCutoff || parsed.cutoff || "55";
        const parsedCutoffMatch = cutoffStr.toString().match(/(\d+(\.\d+)?)/);
        const parsedCutoffVal = parsedCutoffMatch ? parseFloat(parsedCutoffMatch[1]) : 55;

        const enforced = enforceAdmissionTiers(
          score, parsedCutoffVal, university, course, stateOfOrigin, isELDS, isCatchment,
          isAwaitingResult, isPostUtmePending, jambScore, postUtmeScore, formulaExplanation, oLevels
        );
        
        parsed.verdict = enforced.verdict;
        parsed.probability = enforced.probability;
        if (!parsed.detailedStrategy || parsed.detailedStrategy.trim() === "" || parsed.detailedStrategy === "undefined") {
          parsed.detailedStrategy = enforced.detailedStrategy;
        }
        if (!parsed.recommendation || parsed.recommendation.trim() === "" || parsed.recommendation === "undefined") {
          parsed.recommendation = enforced.recommendation;
        }
      }

      // ─── 2. PRIVATE UNIVERSITY QUOTA SANITIZATION ─────────────────────────────
      const isPrivateUni = ['covenant', 'babcock', 'afe babalola', 'bowen', 'pan-atlantic', 'redeemer', 'lead city', 'nile', 'caleb', 'al-hikmah', 'jabu', 'landmark', 'bells'].some(p => normalizedUni.includes(p));
      if (isPrivateUni && parsed.detailedStrategy) {
        // Remove erroneous catchment/ELDS quota references for private universities
        parsed.detailedStrategy = parsed.detailedStrategy.replace(/under the \*\*(ELDS|Catchment) quota\*\*/gi, 'under general merit evaluation');
        parsed.detailedStrategy = parsed.detailedStrategy.replace(/Since you are not a catchment candidate/gi, 'As a private university applicant');
        parsed.detailedStrategy = parsed.detailedStrategy.replace(/strict state quotas/gi, 'competitive merit standards');
      }

      // ─── 3. SANITIZE ALTERNATIVE COURSE RECOMMENDATIONS ──────────────────────
      if (Array.isArray(parsed.alternatives) && parsed.alternatives.length > 0) {
        const isTechUni = ['futa', 'futo', 'futminna', 'lautech', 'mautech', 'fupre'].some(t => normalizedUni.includes(t));
        
        parsed.alternatives = parsed.alternatives
          .map((alt: any) => {
            let altName = String(alt.name || '').trim();
            // Clean unwanted prefixes
            altName = altName.replace(/^(adequate|change course to|change institution to|opt for)\s+/i, '');
            return {
              ...alt,
              name: altName
            };
          })
          .filter((alt: any) => {
            const nameLower = String(alt.name || '').toLowerCase();
            if (!nameLower) return false;
            // Filter out non-existent programs at Tech Universities
            if (isTechUni && (nameLower.includes('law') || nameLower.includes('ll.b') || nameLower.includes('mass comm') || nameLower.includes('theatre'))) {
              return false;
            }
            return true;
          });
      }

      // ─── 4. ENRICH MATH BREAKDOWN WITH EXACT RAW SCORES ──────────────────────
      if (jambScore > 0 || postUtmeScore > 0 || score > 0) {
        const jambPts = jambScore > 0 ? (jambScore / 8).toFixed(1) : 'N/A';
        const postPts = postUtmeScore > 0 && usesPostUtme ? `${(postUtmeScore * 0.3).toFixed(1)} (from ${postUtmeScore}%)` : 'N/A';
        const olevelSummary = oLevels ? `O'Level: ${oLevels}` : '';
        parsed.mathBreakdown = `Aggregate Score: ${score}% calculated for ${university} (${course}). Raw JAMB Score: ${jambScore > 0 ? jambScore : 'Not provided'} / 400 (contributes ~${jambPts} points). Raw Post-UTME: ${postUtmeScore > 0 ? postUtmeScore : 'Pending'} / 100. ${olevelSummary}`;
      } else if (parsed.mathBreakdown) {
        const mb = String(parsed.mathBreakdown);
        if (mb.includes('ewsigen') || mb.includes('lippping') || mb.includes('Oandto') || mb.length > 300) {
          parsed.mathBreakdown = `Aggregate score calculated based on the institution's official screening formula (${university} - ${course}).`;
        }
      }
    }

    if (parsed) await saveCachedCourseCutoffInfo(university, cacheKey, parsed);

    return parsed;
  } catch (e: any) {
    console.error("Gemini Audit Error:", e);
    throw e;
  }
};

// ─── University Courses ────────────────────────────────────────────────────────

export const getUniversityCourses = async (institution: string): Promise<string[]> => {
  try {
    const cached = await getCachedUniversityCourses(institution);
    if (cached && cached.length > 0) return cached;

    const nameLower = institution.toLowerCase();
    const dbMatch = getUniversityFromDB(institution);
    const staticCourses = dbMatch?.courses || [];

    let dynamicCourses: string[] = [];
    if (!institution.toLowerCase().includes("ogun state college of nursing")) {
      try {
        const response = await runAIWithFallback(async (ai) => {
          return await ai.models.generateContent({
            // ─── FIX: Updated model name ───────────────────────────────────────
            model: "gemini-1.5-flash",
            contents: `Provide a comprehensive list of up to 50 popular, accredited undergraduate programmes officially offered at "${institution}" in Nigeria.

OUTPUT RULES:
- Polytechnic → append "(ND/HND)" to each course name.
- College of Education (FCE/COE/NCE) → append "(NCE)" to each course name.
- Return a plain JSON array of strings. No other text.

Example: ["Computer Science", "Accounting", "Civil Engineering"]`,
            config: { responseMimeType: "application/json" }
          });
        });

        if (response?.text) {
          const parsedCourses = safeJsonParse(response.text, null);
          if (Array.isArray(parsedCourses) && parsedCourses.length > 0) {
            dynamicCourses = parsedCourses.map((c: any) => String(c).trim()).filter((c: string) => c.length > 0);
          }
        }
      } catch (aiError) {
        console.warn("AI dynamic courses load failed, using fallback:", aiError);
      }
    }

    const combined = [...staticCourses];
    for (const d of dynamicCourses) {
      if (!combined.some(s => s.toLowerCase() === d.toLowerCase())) combined.push(d);
    }

    if (combined.length > 0) {
      const sorted = combined.sort((a, b) => a.localeCompare(b));
      await saveCachedUniversityCourses(institution, sorted);
      return sorted;
    }

    if (nameLower.includes("polytechnic") || nameLower.includes("poly")) {
      return ["Accountancy (ND/HND)", "Architectural Technology (ND/HND)", "Business Administration & Management (ND/HND)", "Civil Engineering (ND/HND)", "Computer Science (ND/HND)", "Electrical/Electronic Engineering (ND/HND)", "Estate Management & Valuation (ND/HND)", "Mass Communication (ND/HND)", "Mechanical Engineering (ND/HND)", "Office Technology Management (ND/HND)", "Science Laboratory Technology (ND/HND)", "Statistics (ND/HND)"];
    }

    if (nameLower.includes("college of education") || nameLower.includes("coe") || nameLower.includes("fce") || nameLower.includes("education")) {
      return ["Primary Education Studies (NCE)", "English / Social Studies (NCE)", "Mathematics / Physics (NCE)", "Biology / Chemistry (NCE)", "Computer Science / Physics (NCE)", "Agricultural Science Education (NCE)", "Business Education (NCE)", "Early Childhood Care Education (NCE)", "Fine and Applied Arts Education (NCE)", "Home Economics Education (NCE)"];
    }

    return ["Accounting", "Banking and Finance", "Agriculture", "Architecture", "Biochemistry", "Business Administration", "Civil Engineering", "Chemical Engineering", "Computer Science", "Cybersecurity", "Economics", "Electrical and Electronics Engineering", "English and Literary Studies", "History and International Studies", "Law", "Mass Communication", "Mechanical Engineering", "Medicine and Surgery", "Medical Laboratory Science", "Microbiology", "Nursing Science", "Pharmacy", "Physiotherapy", "Political Science", "Software Engineering", "Sociology", "Theatre Arts"];
  } catch (e) {
    console.error("Get Courses Error:", e);
    return [];
  }
};

// ─── Scoring System ────────────────────────────────────────────────────────────

export const getUniversityScoringSystem = async (institution: string) => {
  try {
    const nameLower = institution.toLowerCase();
    const dbMatch = getUniversityFromDB(institution);
    if (dbMatch?.scoringSystem) return dbMatch.scoringSystem;

    // Fast static matches to save API calls for extremely common well-known institutions
    if (nameLower.includes("awolowo") || nameLower.includes("oau")) {
      return { hasJamb: true, hasPostUtme: true, hasOLevel: true, explanation: "OAU (50:10:40): Weighted JAMB (50%), CBT Screening (10%) and O'Level points (40%).", formula: "50:10:40" };
    }
    if (nameLower.includes("open university") || nameLower.includes("noun")) {
      return { hasJamb: false, hasPostUtme: false, hasOLevel: true, explanation: "NOUN offers direct entry strictly based on O-Level qualifications. No UTME required." };
    }
    if (nameLower.includes("polytechnic") || nameLower.includes("poly")) {
      return { hasJamb: true, hasPostUtme: false, hasOLevel: true, explanation: "Polytechnic: Admission relies on JAMB UTME score + O-Level verification. No written Post-UTME exam.", formula: "JAMB_ONLY" };
    }
    if (nameLower.includes("college of education") || nameLower.includes("coe") || nameLower.includes("fce")) {
      return { hasJamb: true, hasPostUtme: false, hasOLevel: true, explanation: "COE: Admission by JAMB UTME + O-Level credits. No separate written Post-UTME exam.", formula: "JAMB_ONLY" };
    }
    if (nameLower.includes("akure") || nameLower.includes("futa")) {
      return { hasJamb: true, hasPostUtme: false, hasOLevel: true, explanation: "Point-Based Screening: Aggregate = (JAMB/400 * 75) + (O-Level points/maxPoints * 25). No external Post-UTME exam.", formula: "futa_75_25" };
    }
    if (nameLower.includes("lasu") || nameLower.includes("lagos state university")) {
      return { hasJamb: true, hasPostUtme: false, hasOLevel: true, explanation: "LASU: Aggregate = (JAMB / 8) + O'Level verification points.", formula: "lasu_point_based" };
    }
    if (nameLower.includes("kwara") || nameLower.includes("kwasu")) {
      return { hasJamb: true, hasPostUtme: true, hasOLevel: true, explanation: "KWASU 50:20:30 ratio: Aggregate = (JAMB/400 * 50) + (Post-UTME/100 * 20) + (O-Level points/50 * 30).", formula: "50:20:30" };
    }
    if (nameLower.includes("delta state") || nameLower.includes("delsu")) {
      return { hasJamb: true, hasPostUtme: true, hasOLevel: false, explanation: "DELSU (50:50): JAMB (50%) + Post-UTME (50%). No O'Level points are used in the aggregate score calculation.", formula: "50:50" };
    }

    // Dynamic Search & Extraction Flow
    try {
      console.log(`[Dynamic Scoring System] Conducting web search for: ${institution}`);
      const searchQuery = `${institution} admission aggregate screening formula grading system 2026`;
      const searchResult = await searchWeb(searchQuery);

      if (searchResult && !searchResult.includes("Search unavailable")) {
        console.log(`[Dynamic Scoring System] Web search completed. Analyzing with Gemini...`);
        let calcDedicatedKey = null;
        if (typeof window !== 'undefined') {
          try {
            const pref = localStorage.getItem('campusai_calc_key_pref');
            calcDedicatedKey = resolvePrefKey(pref);
          } catch (e) {}
        }
        const response = await runAIWithFallback(async (ai) => {
          return await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: `You are an expert Nigerian higher education admission systems analyst.
Based on the following real-time web search results for "${institution}", extract the precise aggregate screening formula / grading system used for admission.

Search Results:
${searchResult}

Analyze how this institution calculates its overall screening aggregate points (normally scaled to 100).
Determine:
1. "hasJamb": Whether JAMB UTME score is used in the aggregate formula. (boolean)
2. "hasPostUtme": Whether a written Post-UTME/CBT or physical screening exam is administered and has an explicit score contribution. (boolean)
3. "hasOLevel": Whether O'Level results (WAEC/NECO grades like A1, B2, C4, etc.) are converted to points and contribute to the aggregate score. (boolean)
4. "explanation": A highly concise, accurate, and clean single-sentence explanation of the formula/grading system (e.g. "DELSU uses a 50:50 ratio of JAMB (50%) and Post-UTME (50%)." or "FUTMinna uses a 50:30:20 Point-Based formula combining JAMB, Post-UTME and O'Level points.").
5. "formula": Map the calculated system strictly to one of the following standard formulas:
   - "50:50" : Standard average of JAMB (scaled to 50, which is JAMB/8) + Post-UTME (scaled to 50, which is Post-UTME/2 or scaled accordingly). Used by UI, UNIBEN, UNIPORT, ABSU, etc.
   - "futa_75_25" : (JAMB/400 * 75) + (O-Level points/maxPoints * 25).
   - "lasu_60_40" : (JAMB/400 * 60) + O-Level points.
   - "lasu_point_based" : JAMB/8 + O-Level points.
   - "50:30:20" : JAMB/400 * 50 + Post-UTME/100 * 30 + O-Level points. Used by UNILAG, UNILORIN, FUTMinna, etc.
   - "50:20:30" : JAMB/400 * 50 + Post-UTME/100 * 20 + O-Level/50 * 30. Used by KWASU.
   - "50:40:10" : JAMB/8 + Post-UTME/100 * 40 + O-Level points. Used by OAU.
   - "JAMB_ONLY" : No Post-UTME/O-Level contribution, aggregate is just JAMB score / 4. Used by Polytechnics and some State/Federal universities.
   - "other" : If it doesn't match any of the above, use "other" and detail it in the explanation.

CRITICAL: Return ONLY a valid JSON object matching the schema below. No markdown code blocks, no trailing comments, no conversational text.

JSON Schema:
{
  "hasJamb": boolean,
  "hasPostUtme": boolean,
  "hasOLevel": boolean,
  "explanation": "string",
  "formula": "50:50" | "futa_75_25" | "lasu_60_40" | "lasu_point_based" | "50:30:20" | "50:20:30" | "50:40:10" | "JAMB_ONLY" | "other"
}`,
            config: { responseMimeType: "application/json" }
          });
        }, calcDedicatedKey || undefined);

        if (response?.text) {
          const parsed = safeJsonParse(response.text, null);
          if (parsed && typeof parsed === 'object' && parsed.explanation) {
            console.log(`[Dynamic Scoring System] Extracted successfully for ${institution}:`, parsed);
            return {
              hasJamb: parsed.hasJamb !== false, // default true
              hasPostUtme: !!parsed.hasPostUtme,
              hasOLevel: !!parsed.hasOLevel,
              explanation: parsed.explanation,
              formula: parsed.formula || "50:50"
            };
          }
        }
      }
    } catch (dynamicErr) {
      console.warn(`[Dynamic Scoring System] Failed to dynamically resolve scoring system for ${institution}, using standard fallback:`, dynamicErr);
    }

    // Default Fallback
    return { hasJamb: true, hasPostUtme: true, hasOLevel: false, explanation: "Standard 50:50 screening: Aggregate = (JAMB/8) + Post-UTME score scaled to 50. Minimum ~50% for merit.", formula: "50:50" };
  } catch (e) {
    console.error("Get Scoring System Error:", e);
    return null;
  }
};

// ─── ASUU Strike ───────────────────────────────────────────────────────────────

export const getAsuuStrikeStatus = async () => {
  const dbStatus = await getASUUStatusFromDB();
  if (dbStatus) return dbStatus;

  try {
    const response = await runAIWithFallback(async (ai) => {
      return await ai.models.generateContent({
        // ─── FIX: Updated model name ───────────────────────────────────────
        model: "gemini-1.5-flash",
        contents: `Current ASUU strike status in Nigeria as of ${getNigerianDate()}.
Based on your training data (and any real-time data if available), analyze if there is an active/threatened Academic Staff Union of Universities (ASUU) strike.

CRITICAL INSTRUCTIONS:
1. You must respond ONLY with a valid JSON object matching the schema.
2. DO NOT output any conversational text, pleasantries, or explanations of your knowledge cutoff.
3. If you lack real-time data or are uncertain, assume the status is stable (isActive: false, status: "Stable") and provide a brief general summary of recent historical context from your knowledge base.
4. Never say "I cannot fulfill this request" or refer to your knowledge cutoff.

Return JSON:
{ "isActive": boolean, "status": "string", "lastUpdated": "string", "summary": "string" }`,
        config: { responseMimeType: "application/json" },
        tools: [{ googleSearch: {} }]
      });
    });
    return safeJsonParse(response.text, { isActive: false, status: "Stable", lastUpdated: getNigerianDateShort(), summary: "No active strike reported." });
  } catch {
    return { isActive: false, status: "Stable", lastUpdated: getNigerianDateShort(), summary: "No active strike reported." };
  }
};

// ─── AI Chat ───────────────────────────────────────────────────────────────────

export const executeAiChat = async (
  message: string,
  history: ChatMessage[]
): Promise<{ text: string; groundingChunks?: GroundingChunk[] }> => {
  try {
    let sanitizedMessage = message;
    if (sanitizedMessage.length > 25000) {
      sanitizedMessage = sanitizedMessage.substring(0, 25000) + "\n\n[Message truncated to prevent payload size limits]";
    }

    const chatKeys = getChatKeys();
    const todayStr = getNigerianDate();

    let optimizedQuery = `${sanitizedMessage.substring(0, 100)} 2026 Nigeria`;
    try {
      const optResponse = await runAIWithFallback(async (ai) => {
        return await ai.models.generateContent({
          // ─── FIX: Updated model name ───────────────────────────────────────
          model: "gemini-1.5-flash",
          contents: `You are a search query optimizer for a Nigerian higher education portal (CampusAI).
Rewrite the user's message into a concise, highly effective Google Search query.
Current date: ${todayStr}. Focus on the 2026/2027 admission cycle.
Output ONLY the search query string (3-7 words).

User Message: "${sanitizedMessage.substring(0, 200)}"
Optimized Search Query:`,
        });
      }, undefined, chatKeys);

      if (optResponse?.text) {
        optimizedQuery = optResponse.text.trim().replace(/^["']|["']$/g, "");
      }
    } catch (optErr) {
      console.error("[Grounding Engine] Query optimization error:", optErr);
    }

    let searchResults: any[] = [];
    try {
      searchResults = await searchWebRaw(optimizedQuery);
    } catch (searchErr) {
      console.error("[Grounding Engine] Search failed, continuing without:", searchErr);
    }

    const groundingChunks: GroundingChunk[] = searchResults.map((r: any) => ({
      web: { uri: r.url, title: r.title }
    }));

    let newsContext = "";
    try {
      const newsItems = await getCloudNews();
      const activeNews = [...newsItems]
        .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
        .slice(0, 8);
      if (activeNews.length > 0) {
        newsContext += "\n\nVERIFIED LATEST COMMUNITY ADMISSION NEWS (PERSISTENT CLOUD DATA):\n";
        activeNews.forEach((news, idx) => {
          newsContext += `[News ${idx + 1}] Date: ${news.date} | Category: ${news.category}\nTitle: ${news.title}\nExcerpt: ${news.excerpt}\n\n`;
        });
      }
    } catch (e) {
      console.warn("[Grounding Engine] Could not load cloud news:", e);
    }

    const cutoffFormulas = `
VERIFIED 2026 CUTOFF CALCULATOR KNOWLEDGE & AGGREGATE FORMULAS:

1. UNILAG — 50:30:20. Formula: (JAMB/8) + Post-UTME(out of 30) + O'Level(out of 20). Min UTME: 200.
2. UI — 50:50 Average. Formula: ((JAMB/8) + Post-UTME) / 2. Min UTME: 200.
3. OAU — 50:10:40. Formula: Weighted JAMB (50%) + CBT Screening (10%) + O'Level Best 5 subjects scaled (40%). Min UTME: 200.
4. FUTA — Point-Based, NO written Post-UTME. Formula: 75:25 ratio. (JAMB / 400 * 75) + (O'Level Points / 50 * 25). Min UTME: 180.
5. LASU — Point-Based, NO Post-UTME. Formula: (JAMB/8) + O'Level Verification points. Min UTME: 160.
6. UNIBEN — 50:50. JAMB/50 + Post-UTME/50. Min UTME: 200.
7. UNN — 50:50. JAMB/50 + Post-UTME/50. Min UTME: 200.
8. ABU, UNILORIN, UNIPORT, FUTO, FUTMINNA — 50% JAMB + 50% Post-UTME CBT. Min UTME: ABU/UNILORIN 180; UNIPORT/FUTO/FUTMINNA 160.
`;

    let systemInstruction = getSystemPrompt()
      + "\nYou are CampusAI, a highly intelligent and supportive Nigerian higher education strategist."
      + cutoffFormulas
      + newsContext
      + `\n\nTEMPORAL ANCHOR (CRITICAL):`
      + `\n- The current date is ${todayStr}. This is the 2026/2027 admission cycle.`
      + `\n- Be extremely sensitive to dates. Do NOT confuse older 2024 or 2025 news with the current 2026/2027 session.`
      + `\n- STRICT RULE: NEVER output placeholder templates, raw placeholders, or draft fields like "[Insert dates]", "[Insert fee]", "[insert date]", "[Insert price]", or "[Insert Link]". If specific values (such as registration dates, links, or fees) are not present in the provided Live Intel search results, explicitly state that the official values are "Not yet specified" or "Pending official announcement". NEVER use empty brackets or placeholder tags.`;

    if (searchResults.length > 0) {
      systemInstruction += "\n\nCRITICAL LIVE INTEL FROM ACCREDITED PORTALS:\n";
      searchResults.forEach((r, idx) => {
        systemInstruction += `[Source ${idx + 1}] Title: ${r.title}\nURL: ${r.url}\nSnippet:\n${r.content}\n\n`;
      });
      systemInstruction += "Use this live intel to craft a definitive, factual answer. Cite these sources where appropriate.";
    }

    let learnedKnowledge = "";
    try {
      const knowledge = await getAllKnowledgeFragments();
      if (knowledge.length > 0) {
        learnedKnowledge = "\n\nADMIN-VERIFIED CORRECTIONS (HIGHEST PRIORITY — OVERRIDE ALL OTHER DATA):\n"
          + knowledge.map((k: any) => `- ${k.key}: ${k.value}`).join('\n')
          + "\n";
      }
    } catch (e) {
      console.warn("Could not load knowledge fragments:", e);
    }

    systemInstruction += learnedKnowledge;

    const userCorrections: string[] = [];
    for (let i = 0; i < history.length - 1; i++) {
      const msg = history[i];
      const nextMsg = history[i + 1];
      if (
        msg.role === 'user' && nextMsg?.role === 'model' &&
        (
          msg.text.toLowerCase().includes("that's wrong") ||
          msg.text.toLowerCase().includes("thats wrong") ||
          msg.text.toLowerCase().includes("you are wrong") ||
          msg.text.toLowerCase().includes("incorrect") ||
          msg.text.toLowerCase().includes("not correct") ||
          msg.text.toLowerCase().includes("actually") ||
          msg.text.toLowerCase().includes("no,") ||
          msg.text.toLowerCase().includes("no the") ||
          msg.text.toLowerCase().includes("the correct") ||
          msg.text.toLowerCase().includes("should be") ||
          msg.text.toLowerCase().includes("it is not") ||
          msg.text.toLowerCase().includes("it's not") ||
          msg.text.toLowerCase().includes("wrong,") ||
          msg.text.toLowerCase().includes("stop saying") ||
          msg.text.toLowerCase().includes("i told you") ||
          msg.text.toLowerCase().includes("already told")
        )
      ) {
        userCorrections.push(`User corrected: "${msg.text}"`);
      }
    }

    if (userCorrections.length > 0) {
      systemInstruction +=
        "\n\nUSER CORRECTIONS FROM THIS CONVERSATION (YOU MUST RESPECT THESE):\n"
        + userCorrections.join('\n')
        + "\nIf any of the above corrections conflict with your training data, ALWAYS side with the user's correction.\n";
    }

    const response = await runAIWithFallback(async (ai) => {
      const historyToSend = history.filter((_, idx) => idx > 0).slice(-8);

      const contents = historyToSend.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text.substring(0, 4000) }]
      }));

      contents.push({ role: 'user', parts: [{ text: sanitizedMessage }] });

      return await ai.models.generateContent({
        // ─── FIX: Updated model name ───────────────────────────────────────
        model: "gemini-1.5-flash",
        contents,
        config: { 
          systemInstruction,
          tools: [{ googleSearch: {} }]
        }
      });
    }, undefined, chatKeys);

    // Extract native Google Search grounding chunks if available
    const nativeChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const uniqueChunksMap = new Map<string, GroundingChunk>();

    // Add local/Tavily search results if any
    searchResults.forEach((r: any) => {
      if (r.url) {
        uniqueChunksMap.set(r.url, {
          web: { uri: r.url, title: r.title || "Portal Update" }
        });
      }
    });

    // Add native grounding chunks from Google Search
    nativeChunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        uniqueChunksMap.set(chunk.web.uri, {
          web: { uri: chunk.web.uri, title: chunk.web.title || "Search Result" }
        });
      }
    });

    const finalGroundingChunks = Array.from(uniqueChunksMap.values());

    return {
      text: response.text || "",
      groundingChunks: finalGroundingChunks.length > 0 ? finalGroundingChunks : undefined
    };
  } catch (e: any) {
    console.error("AI Chat execution error:", e);
    const errStr = e?.message || e?.toString() || "";
    if (errStr.includes("413") || errStr.includes("Payload Too Large")) {
      return {
        text: "The uploaded file or message exceeds the maximum payload size (413 Payload Too Large). Please upload a smaller document excerpt or shorter text and try again."
      };
    }
    return {
      text: "I encountered an error connecting to the AI neural network or processing your request. Please try asking your question again."
    };
  }
};

// ─── Post-UTME Form Releases ───────────────────────────────────────────────────

export interface SyncedPostUtmeForm {
  schoolName: string;
  isOut: boolean;
  statusText: string;
  details: string;
  portalLink: string;
  publishDate?: string;
  cutoffScore?: string;
  eligibilityText?: string;
}

export const searchPostUtmeFormReleases = async (): Promise<SyncedPostUtmeForm[]> => {
  try {
    const todayStr = getNigerianDate();
    const query = `latest Nigerian higher institutions Post-UTME 2026/2027 screening forms registration out portal updates`;
    const searchResults = await searchWeb(query, true);

    if (!searchResults || searchResults.includes("Search unavailable") || searchResults.length < 50) return [];

    const newsKey = (import.meta as any).env?.VITE_NEWS_GEMINI_KEY;
    const response = await runAIWithFallback(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `You are an expert Nigerian higher admissions sync engine. Extract a verified list of institutions that have officially released their Post-UTME forms for 2026/2027.

CRITICAL RULES:
1. Only include institutions EXPLICITLY confirmed to have released 2026/2027 forms.
2. Extract official portal links (.edu.ng or .gov.ng only).
3. Current date is ${todayStr}. Discard 2024/2025 news.
4. RETURN VALID JSON ONLY.

SEARCH RESULTS:
${searchResults}

JSON SCHEMA:
{
  "releases": [
    {
      "schoolName": "string",
      "isOut": true,
      "statusText": "string",
      "details": "string",
      "portalLink": "string",
      "publishDate": "string",
      "cutoffScore": "string",
      "eligibilityText": "string"
    }
  ]
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              releases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    schoolName:      { type: Type.STRING },
                    isOut:           { type: Type.BOOLEAN },
                    statusText:      { type: Type.STRING },
                    details:         { type: Type.STRING },
                    portalLink:      { type: Type.STRING },
                    publishDate:     { type: Type.STRING },
                    cutoffScore:     { type: Type.STRING },
                    eligibilityText: { type: Type.STRING },
                  },
                  required: ["schoolName", "isOut", "statusText", "details", "portalLink", "publishDate", "cutoffScore", "eligibilityText"]
                }
              }
            },
            required: ["releases"]
          }
        },
        tools: [{ googleSearch: {} }]
      });
    }, newsKey);

    const data = safeJsonParse(response.text, { releases: [] });
    return data.releases || [];
  } catch (e) {
    console.error("searchPostUtmeFormReleases failed:", e);
    return [];
  }
};

export const verifySingleSchoolPostUtme = async (schoolName: string): Promise<SyncedPostUtmeForm | null> => {
  try {
    const todayStr = getNigerianDate();
    
    // Extract acronym for the school to broaden search success
    const nameLower = schoolName.toLowerCase();
    let acronym = "";
    if (nameLower.includes("delta state university")) acronym = "DELSU";
    else if (nameLower.includes("lagos state university")) acronym = "LASU";
    else if (nameLower.includes("university of lagos")) acronym = "UNILAG";
    else if (nameLower.includes("university of ibadan")) acronym = "UI";
    else if (nameLower.includes("obafemi awolowo university")) acronym = "OAU";
    else if (nameLower.includes("university of benin")) acronym = "UNIBEN";
    else if (nameLower.includes("university of nigeria")) acronym = "UNN";
    else if (nameLower.includes("university of ilorin")) acronym = "UNILORIN";
    else if (nameLower.includes("university of port harcourt")) acronym = "UNIPORT";
    else if (nameLower.includes("federal university of technology, akure") || nameLower.includes("futa")) acronym = "FUTA";
    else if (nameLower.includes("federal university of technology, minna") || nameLower.includes("futminna")) acronym = "FUTMINNA";
    else if (nameLower.includes("federal university of agriculture, abeokuta") || nameLower.includes("funaab")) acronym = "FUNAAB";
    else if (nameLower.includes("federal university, oye-ekiti") || nameLower.includes("fuoye")) acronym = "FUOYE";

    const brandQuery = acronym ? `("${schoolName}" OR "${acronym}")` : `"${schoolName}"`;
    const query = `${brandQuery} "Post-UTME" 2026/2027 screening registration form out OR portal`;
    const searchResults = await searchWeb(query, true);

    if (!searchResults || searchResults.includes("Search unavailable") || searchResults.length < 50) return null;

    const newsKey = (import.meta as any).env?.VITE_NEWS_GEMINI_KEY;
    const response = await runAIWithFallback(async (ai) => {
      return await ai.models.generateContent({
        // ─── FIX: Updated model name ───────────────────────────────────────
        model: "gemini-1.5-flash",
        contents: `You are an expert admissions verification engine. Verify whether the Post-UTME registration form for ${schoolName} (also known as ${acronym || 'its acronym'}) is officially open/active or announced for the 2026/2027 academic session.

CRITICAL:
1. Current date is ${todayStr}. 2026/2027 announcements from 2026 are current. 2024/2025 announcements are PAST.
2. Verify if the form is actually open NOW or still pending.
3. Official portal link must be .edu.ng or .gov.ng only.
4. RETURN VALID JSON ONLY.

SEARCH FINDINGS:
${searchResults}

JSON SCHEMA:
{
  "schoolName": "${schoolName}",
  "isOut": boolean,
  "statusText": "string",
  "details": "string",
  "portalLink": "string",
  "publishDate": "string",
  "cutoffScore": "string",
  "eligibilityText": "string"
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              schoolName:      { type: Type.STRING },
              isOut:           { type: Type.BOOLEAN },
              statusText:      { type: Type.STRING },
              details:         { type: Type.STRING },
              portalLink:      { type: Type.STRING },
              publishDate:     { type: Type.STRING },
              cutoffScore:     { type: Type.STRING },
              eligibilityText: { type: Type.STRING },
            },
            required: ["schoolName", "isOut", "statusText", "details", "portalLink", "publishDate", "cutoffScore", "eligibilityText"]
          }
        },
        tools: [{ googleSearch: {} }]
      });
    }, newsKey);

    return safeJsonParse(response.text, null);
  } catch (e) {
    console.error(`verifySingleSchoolPostUtme failed for ${schoolName}:`, e);
    return null;
  }
};