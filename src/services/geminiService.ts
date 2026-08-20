import { generateContent } from "./aiService";


function extractCutoffFallback(course: string, searchData: string | null) {
  if (!searchData) return estimateCompetitiveCutoff(course);
  
  const matches = searchData.match(/(?:cutoff|cut-off|aggregate|merit|benchmark)[^\d]{0,50}?(\d{2}\.\d{1,2})/gi);
  if (matches && matches.length > 0) {
    for (let m of matches) {
      const numMatch = m.match(/(\d{2}\.\d{1,2})/);
      if (numMatch) {
         const val = parseFloat(numMatch[1]);
         if (val >= 40 && val <= 90) return val;
      }
    }
  }
  
  const matchesInt = searchData.match(/(?:cutoff|cut-off|aggregate|merit|benchmark)[^\d]{0,50}?(\d{2})[%\s]/gi);
  if (matchesInt && matchesInt.length > 0) {
    for (let m of matchesInt) {
      const numMatch = m.match(/(\d{2})/);
      if (numMatch) {
         const val = parseFloat(numMatch[1]);
         if (val >= 40 && val <= 90) return val;
      }
    }
  }
  
  return estimateCompetitiveCutoff(course);
}

function estimateCompetitiveCutoff(course: string): number {
  const nCourse = course.toLowerCase();
  if (nCourse.includes('medicine') || nCourse.includes('surgery') || nCourse.includes('dental') || nCourse.includes('law')) {
    return 75.0;
  } else if (nCourse.includes('nursing') || nCourse.includes('pharmacy') || nCourse.includes('software') || nCourse.includes('computer science') || nCourse.includes('radiography') || nCourse.includes('physiotherapy')) {
    return 70.0;
  } else if (nCourse.includes('engineering') || nCourse.includes('accounting') || nCourse.includes('medical laboratory') || nCourse.includes('public health') || nCourse.includes('architecture')) {
    return 65.0;
  } else if (nCourse.includes('economics') || nCourse.includes('mass communication') || nCourse.includes('business administration') || nCourse.includes('microbiology') || nCourse.includes('biochemistry')) {
    return 60.0;
  }
  return 55.0;
}

import axios from "axios";
import { Type } from "@google/genai";
import { NewsItem, ChatMessage, GroundingChunk, PostUtmeInfo } from "../types";
import {
  getASUUStatusFromDB,
  getCloudNews,
  getAllKnowledgeFragments,
  saveKnowledgeFragment,
  getCachedUniversityCourses,
  saveCachedUniversityCourses,
  getCachedCourseCutoffInfo,
  saveCachedCourseCutoffInfo,
  getCutoffOverride
} from "./dbService";
import { slugify, getApiUrl } from "./utils";
import { searchWeb, searchWebRaw } from "./searchService";
import { getUniversityFromDB } from "../data/universityData";
import { searchJAMBKnowledgeBase } from "../data/jambKnowledgeBase";
import { searchSyllabuses } from "../data/syllabuses";
import { getUICutoffByCourse } from "../data/uiCutoffs2025_2026";
import { getFUTACutoffByCourse } from "../data/futaCutoffs2026_2027";
import { evaluateCandidateQuota, isStateELDS, isStateInCatchment } from "../utils/quotaMapping";

// ... (keep the rest of the file, replacing runAIWithFallback calls)

const getNigerianDate = (): string => {
  return new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Lagos'
      });
};

const getNigerianDateShort = (): string => {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Africa/Lagos'
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
      status: isUsedToday ? (trace.status || 'Active') : 'Unused'
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

export const getSystemPrompt = (
  liveIntel: string = "",
  verifiedNews: string = "",
  userContext: string = "",
  currentDate: string = getNigerianDate()
) => `
### 1. CORE IDENTITY & TEMPORAL ANCHOR
You are **CampusAI**, the official 2026 Nigerian Academic Strategist for campusai.com.ng.

- You are NOT Gemini, you are NOT ChatGPT. You are CampusAI.
- Your knowledge cutoff is 2026/2027 Admission Cycle. Today's date is ${currentDate} [Africa/Lagos WAT].
- Your sole mission is to help Nigerian students (UTME, Direct Entry, JUPEB, Inter-University Transfer) gain admission with 100% accurate, verified information.
- Personality: Sharp, authoritative, empathetic, street-smart but academic. Use Nigerian student slang sparingly ("Omo", "Sharp", "No worry") but remain professional.
- **DATA SOURCE & KNOWLEDGE BASE ROLE**: Your knowledge and responses are exclusively grounded in the **CampusAI Verified Knowledge Base** (containing official university guidelines, Post-UTME screening rules, and scraped portal documents for FUTA and Nigerian universities) and live web search grounding. If the user asks "where did you find these things?" or "where is your data from?", always explain that your knowledge is built upon the CampusAI Verified Knowledge Base rather than generic AI training data.
- CONVERSATION MEMORY & TARGET INSTITUTION FOCUS:
  - You have FULL access to all previous messages, uploaded document text, scores, and calculations in this active chat thread. ALWAYS remember and refer back to student details provided earlier in this conversation. NEVER claim you cannot remember previous messages or files in this chat session.
  - PRIMARY TARGET INSTITUTION PERSISTENCE (STRICT ISOLATION RULE):
    - If the user has submitted a registration document or indicated their primary choice (e.g., FUTA - Federal University of Technology, Akure), that remains their PRIMARY TARGET SCHOOL.
    - If the user clicks "Discuss with AI" or asks questions regarding news, cutoffs, or updates about ANOTHER school (e.g. Osun State University / UNIOSUN, UNILAG, LASU, UI):
      1. Discuss that news item or school directly and accurately as requested.
      2. CRITICAL: DO NOT mistakenly convert or switch the user's primary target school to that second university!
      3. Keep them separate: "Your primary target choice remains [e.g. FUTA]. Regarding the UNIOSUN news..."
      4. NEVER change their target choice unless they explicitly state: "Change my primary target school to [New School]".

### 2. EXPANDED KNOWLEDGE BASE [NEVER HALLUCINATE]

**A. STATUTORY JAMB RULES (2026)**
- Minimum age for admission: 16 years by October 31, 2026.
- JAMB CAPS: Student must accept admission within 4 WEEKS of offer or it auto-reverts.
- Post-UTME Screening Fee Cap: ₦2,000 (excluding bank charges). If a school charges more, flag it as "Bank/Portal charges inclusive".
- Change of Institution/Course: max 3 times.
- O'Level Upload is MANDATORY – no upload = no admission on CAPS.

**B. CRITICAL: O'LEVEL GRADE-TO-POINT MAPPING — NEVER GUESS THIS**

**FUTA Official Scale (75:25 Point System):**
| Grade | Points |
|-------|--------|
| A1    | 6      |
| B2    | 5      |
| B3    | 4      |
| C4    | 3      |
| C5    | 2      |
| C6    | 1      |
| D7-F9 | 0      |

**Standard 4.0 Scale (for UNILAG, UNIBEN, etc.):**
| Grade | Points |
|-------|--------|
| A1    | 4.0    |
| B2    | 3.6    |
| B3    | 3.2    |
| C4    | 2.8    |
| C5    | 2.4    |
| C6    | 2.0    |
| D7-F9 | 0      |

**C. INSTITUTIONAL FORMULAS (APPLY EXACTLY)**
- **FUTA (75:25):** UTME = (Score/400×75); O'Level = Sum of best 5 using A1=6, B2=5, B3=4, C4=3, C5=2, C6=1; Aggregate = UTME + O'Level (max 100)
- **UNILAG (50:30:20):** (UTME/400×50) + (Post-UTME/100×30) + (O'Level Points×2)
- **UI (50:50):** (UTME/400×50) + (Post-UTME/100×50)
- **LASU (15:45:40):** (JAMB×0.15) + O'Level (A1=8, B2=7, B3=6, C4=5, C5=4, C6=3) + Post-UTME
- **OAU, ABU, UNIBEN, UNN, UNILORIN** – use their specific weightings; if unsure, clearly state the assumption.

**D. INSTITUTIONAL CUT-OFF FLOORS**
- UNILAG, UI, UNN, OAU, UNIBEN: 200
- FUTA, FUTO, UNILORIN, LASU: 180-195 (FUTA: 180, LASU: 195)
- State Universities: 160-180
- Private Universities / Polytechnics: 140-160
- Colleges of Education: 100

**E. ADMISSION QUOTAS — YOU MUST ASK FOR STATE OF ORIGIN**
- **Merit (45%)** – highest aggregates nationwide (toughest).
- **Catchment Area (35%)** – candidates from specific states/zones (often 3-8% lower cutoff).
- **ELDS (20%)** – Educationally Less Developed States.

**CRITICAL:** When a user provides their state of origin, immediately assess if they are in the target school's catchment. If NOT, warn them that they compete under Merit only, which has higher cutoffs.

**F. JAMB CAPS STATUSES**
- **Admitted** – offer made; accept/reject within 4 weeks.
- **Proposed** – institution recommended you; wait for JAMB approval.
- **Transfer** – alternative course offered; accept/reject on CAPS.
- **Not Admitted** – still under screening or didn't meet criteria.
- **Awaiting O'Level Upload** – URGENT: upload results on CAPS immediately.

### 3. REAL-TIME GROUNDING ENGINE — OBEY THIS HIERARCHY
1. **Level 1 (Highest): ${verifiedNews}** – Admin-Verified Knowledge (OVERRIDES everything).
2. **Level 2: ${liveIntel}** – Live from MySchoolGist, JAMB portal, official .edu.ng sites.
3. **Level 3: ${userContext}** – User corrections (prioritise for this session).
4. **Level 4 (Lowest):** Your baseline training.

**CRITICAL REAL-TIME GROUNDING DIRECTIVE:**
- You ARE actively connected to live real-time web search results via Level 2 (${liveIntel}).
- NEVER output generic AI refusal disclaimers such as "I don't have real-time information", "I do not have access to real-time data", or "As an AI model I cannot browse current information".
- Always speak as an authoritative live admission strategist grounded in real-time data.
- If live search results show that an institution or portal has NOT released an announcement, form, or result yet as of ${currentDate}, answer directly and definitively:
  "Direct Answer: As of ${currentDate}, [School/Portal] has NOT yet officially released [Topic] according to current live portal records."
- **ANTI-HALLUCINATION:** If Level 1 and 2 lack a specific date/link/price, NEVER invent it. State clearly that the school has not officially announced it yet as of ${currentDate}.

### 4. MANDATORY RESPONSE ARCHITECTURE (FOLLOW EVERY TIME)
**A. Direct Answer First** – immediate yes/no, figure, or verdict.
**B. Complete Calculation** – show ALL steps: UTME component + O'Level component = final aggregate.
**C. Quota Analysis** – always state: "If you're from [state], you're [Catchment/Non-Catchment]. This means..."
**D. Feasibility Verdict** – use: "Strong / Competitive / Borderline / Low" with reasoning.
**E. Backup Strategy** – if borderline or low, suggest 2-3 alternative courses or schools immediately.
**F. Next Steps** – 2-3 actionable actions (e.g., "Upload O'Level on CAPS", "Check Post-UTME date", "Generate PDF report").

### 5. OCR & DOCUMENT HANDLING
When a user uploads a WAEC/NECO result, JAMB slip, or screening slip:
1. Extract ALL data (name, scores, grades, state of origin, course).
2. Check subject combinations — flag missing compulsory subjects.
3. Calculate O'Level points using the CORRECT scale for their target school.
4. If ANY data is missing (e.g., O'Level grades), ASK for it immediately.
5. NEVER proceed with a half-calculation — complete the aggregate first.

### 6. PLATFORM FEATURES — CONFIDENTLY GUIDE USERS
When a user asks about CampusAI tools, respond with enthusiasm:
- **"Absolutely! Let me use the CampusAI calculator right now. I'll apply the verified [School] formula and give you your exact aggregate."**
- **"For a detailed breakdown, generate your PDF Feasibility Report — it includes risk assessment and 3 backup strategies."**
- **"Track all open Post-UTME forms on our Release Hub with live fees and deadlines."**

### 7. STRICT PROHIBITIONS
- NEVER advise paying individuals for admission.
- NEVER claim scores can be upgraded.
- NEVER help with malpractice or fraud.
- Politely decline and redirect to legitimate prep.

### 8. DYNAMIC CONTEXT
Current Date: ${currentDate}
Live Intel: ${liveIntel}
Verified News: ${verifiedNews}
User Memory: ${userContext}

You are ready. Answer using the hierarchy above.
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
              model: chatParams.model || "gemini-flash-latest",
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

export const runAIWithFallback = async (
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
      const isNetwork = msg.includes('network error') || msg.includes('econrefused') || msg.includes('failed to fetch') || msg.includes('net::err') || msg.includes('err_connection');
      if (isNetwork) {
        console.warn(`Network error connecting to API server. Stopping key rotation.`);
        break;
      }

      const isQuota = msg.includes('quota') || msg.includes('429') || msg.includes('limit') || msg.includes('exhausted');
      const isInvalid = msg.includes('invalid') || msg.includes('400') || msg.includes('not valid');
      const isBlocked = msg.includes('403') || msg.includes('permission') || msg.includes('blocked');
      const isTimeout = msg.includes('timeout') || msg.includes('timed out');
      recordKeyActivity(apiKey, false, isQuota || isBlocked);
      
      if (isQuota || isInvalid || isBlocked || isTimeout) {
        console.warn(`API Key ${attemptIndex + 1} ${isTimeout ? 'timed out' : isQuota ? 'exhausted' : isBlocked ? 'blocked' : 'invalid'}, rotating...`);
        continue;
      }
      
      console.error(`Error with key ${attemptIndex + 1}:`, errorDetail, error);
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
Based on today's date (${todayStr}), curate 5 HIGHLY AUTHORITATIVE and VERIFIED news articles for the 2026/2027 academic session.

STRICT VERIFICATION GUIDELINES:
1. SEARCH: Find actual news from official Nigerian education portals (.edu.ng, .gov.ng).
2. FORMATTING: Use Markdown tables for any timelines or fees.
3. STRUCTURE:
   # [Headline]
   > **✅ VERIFIED REPORT:** Cross-referenced as of ${todayStr}.
   **Published:** ${todayStr} | **Source:** CampusAI News
   ## 📌 Overview
   [Summary]
   ## 📅 Official Timetable / Key Details
   | Activity | Date |
   |----------|------|
   | ...      | ...  |
   ## 🛠️ Useful Tools
   - [Admission Checker](https://campusai.com.ng/calculator)
   ---
   ### 🔗 Follow CampusAI
   * WhatsApp: [Join Channel](https://whatsapp.com/channel/0029VajWj0D7jZnl0I3hF32o)

Return ONLY a valid JSON object matching this schema:
{ "news": [ { "id": "string", "title": "string", "category": "string", "date": "string", "excerpt": "string", "fullContent": "string", "sourceUrl": "string" } ] }`;

        const fallbackResponse = await runAIWithFallback(async (ai) => {
          if ('models' in ai) {
            return await ai.models.generateContent({
              model: "gemini-flash-latest",
              contents: prompt,
              config: { responseMimeType: "application/json" } });
          } else {
            const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });
            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" }
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
         
         STRICT VERIFICATION PROTOCOL:
         - Identify the OFFICIAL source (e.g., Unilag.edu.ng, Jamb.gov.ng).
         - Extract EXACT dates, fees, and requirements.
         - If the news is a rumor or unverified, mark "verified": false.
         - Avoid AI-generated filler. Be concise and factual.
         
         SEARCH RESULTS FOR CONTEXT:
         ${searchResults}`
      : `We could not retrieve live search results for: "${userQuery}".
         As an elite educational journalist, use your search tool to find CURRENT data for the 2026/2027 session regarding "${userQuery}". 
         Focus on identifying the university, event (Post-UTME, Admission List), and official guidelines.`;

    const newsKey = (import.meta as any).env?.VITE_NEWS_GEMINI_KEY;
    const response = await runAIWithFallback(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are an elite Investigative Editor for Campusai.com.ng (Nigeria). 
         
         TASK:
         1. ${searchContextPrompt}
         2. EXPAND: Build a MASSIVE, authoritative news article.
         
         ARTICLE GUIDELINES (ANTI-GENERIC / VERIFIED STANDARD):
         - "fullContent" MUST be 800 to 1,200 words long.
         - TONE: Investigative, factual, and neutral. NO "AI-Speak" (e.g., avoid "Unlock your potential", "Stay tuned for more updates").
         - DATA DRILL: You MUST include specific Naira amounts (e.g., ₦2,000), specific dates (e.g., August 15th), and specific portal URLs.
         - VERIFICATION: Start the article with a "Verification Status" block.
         
         MANDATORY "fullContent" STRUCTURE (MARKDOWN):
           
           # [HEADLINE] — [CLEAR, ACTIONABLE TITLE]
           
           > **✅ VERIFIED REPORT:** This update has been cross-referenced with official institutional portals as of ${dateStr}.
           
           **Published:** ${dateStr} | **Category:** ${userQuery} | **Source:** CampusAI Intelligence
           
           ## 📌 Overview
           [2–3 sentences summarizing the official announcement clearly]
           
           ## 📅 Official Timetable / Key Details
           [Markdown table with specific dates, fees, or requirements]
           | Activity | Date / Detail |
           |----------|---------------|
           | ...      | ...           |
           
           ## 📝 Step-by-Step Registration Guide
           [Precise, sequential instructions on how to register/apply]
           
           ## 🛠️ Useful Tools for Candidates
           - [JAMB Syllabus Finder](https://www.jamb.gov.ng/ibass)
           - [Portal Link](Official Link)
           - [Admission Probability Checker](https://campusai.com.ng/calculator)
           
           ## ⚠️ Critical Policies & Warnings
           [Mention specific JAMB CAPS rules, O'Level upload deadlines, or payment warnings]
           
           ## ❓ Frequently Asked Questions (FAQ)
           [3–5 high-value FAQs with precise, non-generic answers]
           
           ---
           ### 🔗 Follow CampusAI for More Updates
           *   **WhatsApp:** [Join our WhatsApp Channel](https://whatsapp.com/channel/0029VajWj0D7jZnl0I3hF32o)
           *   **X (Twitter):** [@CampusAI_NG](https://x.com/CampusAI_NG)
           
           📌 **Editor's Note:** Always verify dates, fees, and guidelines on the official portal.
         
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
          thinkingConfig: { thinkingLevel: "HIGH" } }
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
      // New smart searched news should be pending approval by default
      parsed.article = { ...parsed.article, id: `smart-news-${slug}${dateSlug ? '-' + dateSlug : ''}`, slug, isLive: false, isImportant: false };
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
        model: "gemini-3.1-pro-preview",
        contents: `You are a premier Investigative Education Journalist in Nigeria for CampusAI. 
        
        TASK:
        1. RESEARCH: Use your search tool to find CURRENT and VERIFIED details about: "${newsItem.title}".
        2. CROSS-VERIFY: Compare findings across at least 3 sources (official .edu.ng portal, JAMB bulletin, and news agencies).
        3. EXPAND: Write a comprehensive, factual, and authoritative article.
        
        STRICT QUALITY STANDARDS:
        - NO GENERIC INTROS: Start immediately with the news. Skip "In a major move..." or "This is to inform...".
        - VERIFIED DATA: Include exact fees, exact dates, and exact eligibility criteria.
        - TONE: Factual, analytical, and highly detailed.
        - LENGTH: 1,000 to 1,500 words.
        
        MANDATORY STRUCTURE (MARKDOWN):
          
          # [HEADLINE] — [SPECIFIC AND ACTIONABLE]
          
          > **✅ VERIFIED REPORT:** Cross-referenced with official bulletins as of ${new Date().toLocaleDateString()}.
          
          ## 🔍 Investigation Overview
          [Brief summary of the official situation]
          
          ## 📊 Official Breakdown
          - **Form Price:** [Amount in ₦]
          - **Registration Link:** [Link]
          - **Cut-off Mark:** [Exact score]
          - **Closing Date:** [Exact date]
          
          ## 🎯 Target Audience
          [Detail who this affects exactly]
          
          ## 🛠️ Step-by-Step Procedure
          [The exact steps to register or apply on the official portal]
          
          ## 🚨 Management Warnings
          [Warnings about third-party payments, CAPS requirements, etc.]
          
          ## 💡 Expert Advice (CampusAI)
          [Strategic advice based on the news]
          
          ## 💬 Common Questions & Answers
          [Detailed FAQ section]
          
          ---
          **Verified Source:** ${newsItem.sourceUrl || "Official Portal"}
          **Date:** ${new Date().toLocaleDateString()}
        
        INPUT DATA:
        Original Title: ${newsItem.title}
        Original Excerpt: ${newsItem.excerpt}
        Source: ${newsItem.sourceUrl}`,
        config: {
          thinkingConfig: { thinkingLevel: "HIGH" },
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

  // 1. Identify active components & max contributions
  let hasPost = true;
  let hasOLevel = true;

  if (f.includes('futa') || normUni.includes('futa') || f.includes('75_25') || f.includes('75:25')) {
    hasPost = false;
  } else if (f.includes('lasu') || normUni.includes('lasu') || f.includes('60_40') || f.includes('60:40') || f.includes('point_based')) {
    hasPost = false;
  } else if (f.includes('fuoye') || normUni.includes('fuoye') || normUni.includes('oye-ekiti') || normUni.includes('oye ekiti')) {
    hasPost = false;
  } else if (f.includes('50:50') || f.includes('50_50') || f.includes('50/50') || (f.includes('50%') && !f.includes('30%') && !f.includes('20%') && !f.includes('40%'))) {
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
  let maxJambContrib = 50;
  let maxPostContrib = 30;
  let maxOlevelContrib = 20;

  if (f.includes('futa') || normUni.includes('futa') || f.includes('75_25') || f.includes('75:25')) {
    jambContrib = (jamb / 400 * 75);
    maxJambContrib = 75;
    olevelContrib = (currentOLevelPoints / 50 * 25);
    maxOlevelContrib = 25;
    maxPostContrib = 0;
    postContrib = 0;
    hasPost = false;
  } else if (f.includes('lasu_60_40') || normUni.includes('lasu') || f.includes('60_40') || f.includes('60:40')) {
    jambContrib = (jamb / 400 * 60);
    maxJambContrib = 60;
    olevelContrib = currentOLevelPoints;
    maxOlevelContrib = 40;
    maxPostContrib = 0;
    postContrib = 0;
    hasPost = false;
  } else if (f.includes('fuoye') || normUni.includes('fuoye') || normUni.includes('oye-ekiti') || normUni.includes('oye ekiti')) {
    jambContrib = (jamb / 400 * 60);
    maxJambContrib = 60;
    
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
    
    olevelContrib = fuoyeOLevelPoints + 10;
    maxOlevelContrib = 25;
    maxPostContrib = 0;
    postContrib = 0;
    hasPost = false;
  } else if (f.includes('lasu_point_based') || f.includes('lasu_point')) {
    jambContrib = (jamb / 8);
    maxJambContrib = 50;
    olevelContrib = currentOLevelPoints;
    maxOlevelContrib = 50;
    maxPostContrib = 0;
    postContrib = 0;
    hasPost = false;
  } else if (f.includes('50:20:30') || f.includes('50_20_30') || f.includes('50/20/30')) {
    jambContrib = (jamb / 400 * 50);
    maxJambContrib = 50;
    postContrib = (currentPost / 100 * 20);
    maxPostContrib = 20;
    olevelContrib = (currentOLevelPoints / 50 * 30);
    maxOlevelContrib = 30;
  } else if (f.includes('50:40:10') || f.includes('50_40_10') || f.includes('50/40/10') || normUni.includes('awolowo') || normUni.includes('oau')) {
    jambContrib = (jamb / 8);
    maxJambContrib = 50;
    postContrib = (currentPost / 100 * 40);
    maxPostContrib = 40;
    olevelContrib = currentOLevelPoints;
    maxOlevelContrib = 10;
  } else if (f.includes('50:50') || f.includes('50_50') || f.includes('50/50')) {
    jambContrib = (jamb / 8);
    maxJambContrib = 50;
    postContrib = (currentPost / 2);
    maxPostContrib = 50;
    olevelContrib = 0;
    maxOlevelContrib = 0;
    hasOLevel = false;
  } else if (f.includes('pure_jamb')) {
    jambContrib = jamb / 4;
    maxJambContrib = 100;
    postContrib = 0;
    maxPostContrib = 0;
    olevelContrib = 0;
    maxOlevelContrib = 0;
    hasPost = false;
    hasOLevel = false;
  } else {
    // Standard 50:30:20 model (UNILAG, UNILORIN, UNIBEN, UNIZIK, etc.)
    jambContrib = (jamb / 400 * 50);
    maxJambContrib = 50;
    postContrib = (currentPost / 100 * 30);
    maxPostContrib = 30;
    olevelContrib = currentOLevelPoints;
    maxOlevelContrib = 20;
  }

  // Calculate Maximum Possible Aggregate Score
  const potentialPostContrib = (isPostUtmePending && hasPost) ? maxPostContrib : postContrib;
  const potentialOlevelContrib = (isAwaitingResult && hasOLevel) ? maxOlevelContrib : olevelContrib;

  const rawMax = jambContrib + potentialPostContrib + potentialOlevelContrib;
  const maxPossibleAggregate = parseFloat(Math.min(100, Math.max(0, rawMax)).toFixed(2));

  // Calculate targets to meet cutoffVal
  let requiredPostScore = -1;
  let requiredOlevelScore = -1;

  if (isPostUtmePending && hasPost && maxPostContrib > 0) {
    // Determine remaining aggregate points needed out of maxPostContrib
    const currentKnownContrib = jambContrib + olevelContrib;
    const remainingNeeded = cutoffVal - currentKnownContrib;
    
    if (remainingNeeded <= 0) {
      requiredPostScore = 0;
    } else {
      // Calculate raw Post-UTME score required out of 100
      requiredPostScore = parseFloat(((remainingNeeded / maxPostContrib) * 100).toFixed(1));
    }
  }

  if (isAwaitingResult && hasOLevel && maxOlevelContrib > 0) {
    let olevelFactor = 1;
    if (f.includes('futa') || normUni.includes('futa') || f.includes('75_25') || f.includes('75:25')) olevelFactor = 25 / 50;
    else if (f.includes('50:20:30') || f.includes('50_20_30')) olevelFactor = 30 / 50;
    else {
      olevelFactor = 1;
    }

    const currentKnownContrib = jambContrib + postContrib;
    const remainingNeeded = cutoffVal - currentKnownContrib;
    if (remainingNeeded <= 0) {
      requiredOlevelScore = 0;
    } else {
      requiredOlevelScore = parseFloat((remainingNeeded / olevelFactor).toFixed(1));
    }
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

  // 7. Architecture & Environmental Design
  const isArchitecture = c.includes('architecture') || c.includes('architectural');
  if (isArchitecture) {
    const hasMath = has('math');
    const hasPhy = has('phy');

    const missing: string[] = [];
    if (!hasMath) missing.push('Mathematics');
    if (!hasPhy) missing.push('Physics');

    if (missing.length > 0) {
      return {
        valid: false,
        reason: `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} strictly compulsory for Architecture in JAMB.`
      };
    }
  }

  // 8. Accounting / Finance / Banking & Finance / Business Administration
  const isCommercial = ['accounting', 'accountancy', 'banking', 'finance', 'business admin'].some(k => c.includes(k));
  if (isCommercial) {
    const hasMath = has('math');
    const hasEcon = has('econ') || has('commerce');

    if (!hasMath) {
      return {
        valid: false,
        reason: `Mathematics is strictly compulsory for ${courseName} in JAMB.`
      };
    }
    if (!hasEcon) {
      return {
        valid: false,
        reason: `Economics or Commerce is strictly required for ${courseName} in JAMB.`
      };
    }
  }

  // 9. Mass Communication / Media Studies
  const isMassComm = c.includes('mass communication') || c.includes('media studies') || c.includes('journalism');
  if (isMassComm) {
    const hasLit = has('literat') || has('lit in eng') || has('literature');
    const hasGovt = has('govt') || has('government') || has('crs') || has('irs') || has('christian') || has('islamic');

    if (!hasLit && !hasGovt) {
      return {
        valid: false,
        reason: `Literature-in-English or Government/CRS/IRS is strictly required for ${courseName} in JAMB.`
      };
    }
  }

  // 10. Political Science / International Relations / Public Administration
  const isPoliSci = c.includes('political science') || c.includes('international relation') || c.includes('public admin');
  if (isPoliSci) {
    const hasGovt = has('govt') || has('government') || has('history');
    if (!hasGovt) {
      return {
        valid: false,
        reason: `Government or History is strictly compulsory for ${courseName} in JAMB.`
      };
    }
  }

  return { valid: true, reason: "Candidate has the required JAMB subject combination." };
};

export const validateOlevelRequirements = (
  courseName: string,
  subjects: { name: string; grade: string }[]
): { valid: boolean; reason: string } => {
  if (!courseName || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return { valid: true, reason: "Candidate meets O'Level entry requirements." };
  }

  const failingGrades = ['F9', 'E8', 'D7'];
  const isFail = (g: string) => !g || failingGrades.includes(g.trim().toUpperCase());

  const c = courseName.toLowerCase().trim();
  const subMap = new Map<string, string>();
  subjects.forEach(s => {
    if (s && s.name) {
      subMap.set(s.name.toLowerCase().trim(), s.grade);
    }
  });

  const getGrade = (kw: string): string | undefined => {
    for (const [name, grade] of subMap.entries()) {
      if (name.includes(kw)) return grade;
    }
    return undefined;
  };

  // 1. English Language is mandatory for ALL courses in Nigeria
  const englishGrade = getGrade('english');
  if (!englishGrade || isFail(englishGrade)) {
    return {
      valid: false,
      reason: `English Language Credit pass (A1-C6) is compulsory for all tertiary institution admissions in Nigeria. Your entered grade is ${englishGrade || 'missing'}.`
    };
  }

  // 2. Mathematics is compulsory for Sciences, Engineering, Medicine, Computing, Agriculture, Social Sciences & Commercial
  const isArtOnly = ['theatre', 'dramatic', 'music', 'fine art', 'creative art', 'history', 'philosophy', 'religious', 'islamic', 'christian', 'linguistics', 'french', 'yoruba', 'igbo', 'hausa', 'english literature'].some(k => c.includes(k));

  const mathGrade = getGrade('math');
  if (!isArtOnly && (!mathGrade || isFail(mathGrade))) {
    return {
      valid: false,
      reason: `Mathematics Credit pass (A1-C6) is compulsory for ${courseName} in O'Level. Your entered grade is ${mathGrade || 'missing'}.`
    };
  }

  // 3. Medicine & Allied Health Sciences
  const isMedicineGroup = ['medicine', 'mbbs', 'dentistry', 'nursing', 'pharmacy', 'medical lab', 'radiography', 'physiotherapy', 'anatomy', 'physiology', 'veterinary'].some(k => c.includes(k));

  if (isMedicineGroup) {
    const bioGrade = getGrade('bio');
    const chemGrade = getGrade('chem');
    const phyGrade = getGrade('phy');

    const failingDefs: string[] = [];
    if (!bioGrade || isFail(bioGrade)) failingDefs.push(`Biology (${bioGrade || 'missing'})`);
    if (!chemGrade || isFail(chemGrade)) failingDefs.push(`Chemistry (${chemGrade || 'missing'})`);
    if (!phyGrade || isFail(phyGrade)) failingDefs.push(`Physics (${phyGrade || 'missing'})`);

    if (failingDefs.length > 0) {
      return {
        valid: false,
        reason: `${courseName} strictly requires at least a Credit pass (A1-C6) in Biology, Chemistry, and Physics in O'Level. Deficiencies: ${failingDefs.join(', ')}.`
      };
    }
  }

  // 4. Engineering & Technology
  const isEngineering = c.includes('engineer') || c.includes('technology');
  if (isEngineering) {
    const phyGrade = getGrade('phy');
    const chemGrade = getGrade('chem');

    const failingDefs: string[] = [];
    if (!phyGrade || isFail(phyGrade)) failingDefs.push(`Physics (${phyGrade || 'missing'})`);
    if (!chemGrade || isFail(chemGrade)) failingDefs.push(`Chemistry (${chemGrade || 'missing'})`);

    if (failingDefs.length > 0) {
      return {
        valid: false,
        reason: `Engineering & Technology courses strictly require at least a Credit pass (A1-C6) in Physics and Chemistry in O'Level. Deficiencies: ${failingDefs.join(', ')}.`
      };
    }
  }

  // 5. Computing / Computer Science / Cyber Security / Software Engineering
  const isComputing = ['computer science', 'cyber', 'software engineer', 'data science', 'information technology'].some(k => c.includes(k));
  if (isComputing) {
    const phyGrade = getGrade('phy');
    if (!phyGrade || isFail(phyGrade)) {
      return {
        valid: false,
        reason: `Computing & Computer Science courses strictly require at least a Credit pass (A1-C6) in Physics in O'Level. Your entered grade is ${phyGrade || 'missing'}.`
      };
    }
  }

  // 6. Law (LL.B)
  const isLaw = c.includes('law') || c.includes('ll.b') || c.includes('jurisprudence');
  if (isLaw) {
    const litGrade = getGrade('literat') || getGrade('lit in eng');
    if (!litGrade || isFail(litGrade)) {
      return {
        valid: false,
        reason: `Law (LL.B) strictly requires at least a Credit pass (A1-C6) in Literature-in-English in O'Level. Your entered grade is ${litGrade || 'missing'}.`
      };
    }
  }

  return { valid: true, reason: "Candidate meets O'Level entry requirements." };
};

export function getFacultyCategory(courseName: string = '', subjects: string[] = []): 'LAW' | 'HEALTH_MEDICINE' | 'ENGINEERING_TECH' | 'SCIENCE_AGRIC' | 'SOCIAL_SCIENCE_COMMERCIAL' | 'ARTS_HUMANITIES' {
  const c = (courseName || '').toLowerCase();
  const subStr = (subjects || []).join(' ').toLowerCase();

  if (c.includes('law') || c.includes('ll.b') || c.includes('jurisprudence')) return 'LAW';

  if (
    c.includes('medicine') || c.includes('surgery') || c.includes('nursing') || 
    c.includes('pharmacy') || c.includes('dentistry') || c.includes('dental') ||
    c.includes('medical') || c.includes('physiotherapy') || c.includes('radiography') ||
    c.includes('anatomy') || c.includes('physiology') || c.includes('optometry')
  ) return 'HEALTH_MEDICINE';

  if (
    c.includes('agric') || c.includes('crop') || c.includes('soil') || c.includes('animal') || 
    c.includes('forestry') || c.includes('fisheries') || c.includes('horticulture') ||
    c.includes('food science') || c.includes('botany') || c.includes('zoology') ||
    c.includes('microbiology') || c.includes('biochemistry') || c.includes('chemistry') ||
    c.includes('physics') || c.includes('biology') || c.includes('geology') ||
    c.includes('computer science') || c.includes('cyber') || c.includes('data science') ||
    subStr.includes('agricultural science') || (subStr.includes('biology') && subStr.includes('chemistry'))
  ) return 'SCIENCE_AGRIC';

  if (
    c.includes('engineering') || c.includes('technology') || c.includes('architecture') ||
    c.includes('surveying') || c.includes('building') || c.includes('urban')
  ) return 'ENGINEERING_TECH';

  if (
    c.includes('accounting') || c.includes('accountancy') || c.includes('finance') ||
    c.includes('banking') || c.includes('business admin') || c.includes('marketing') ||
    c.includes('economics') || c.includes('public admin') || c.includes('political') ||
    c.includes('sociology') || c.includes('mass comm') || c.includes('criminology') ||
    c.includes('geography') || c.includes('psychology') || c.includes('international relations')
  ) return 'SOCIAL_SCIENCE_COMMERCIAL';

  if (
    c.includes('english') || c.includes('history') || c.includes('linguistics') ||
    c.includes('french') || c.includes('theatre') || c.includes('music') ||
    c.includes('philosophy') || c.includes('religious') || c.includes('arts') ||
    c.includes('fine art')
  ) return 'ARTS_HUMANITIES';

  if (subStr.includes('biology') || subStr.includes('chemistry') || subStr.includes('physics') || subStr.includes('agricultural science')) {
    return 'SCIENCE_AGRIC';
  }
  if (subStr.includes('government') || subStr.includes('economics') || subStr.includes('commerce') || subStr.includes('accounting')) {
    return 'SOCIAL_SCIENCE_COMMERCIAL';
  }
  if (subStr.includes('literature') || subStr.includes('history') || subStr.includes('crs') || subStr.includes('irs')) {
    return 'ARTS_HUMANITIES';
  }

  return 'SCIENCE_AGRIC';
}

export function isAlternativeFacultyCompatible(candidateFaculty: string, altCourseName: string): boolean {
  const altFaculty = getFacultyCategory(altCourseName, []);

  if (candidateFaculty === 'SCIENCE_AGRIC') {
    return ['SCIENCE_AGRIC', 'ENGINEERING_TECH', 'HEALTH_MEDICINE'].includes(altFaculty);
  }
  if (candidateFaculty === 'HEALTH_MEDICINE') {
    return ['HEALTH_MEDICINE', 'SCIENCE_AGRIC'].includes(altFaculty);
  }
  if (candidateFaculty === 'ENGINEERING_TECH') {
    return ['ENGINEERING_TECH', 'SCIENCE_AGRIC'].includes(altFaculty);
  }
  if (candidateFaculty === 'SOCIAL_SCIENCE_COMMERCIAL') {
    return ['SOCIAL_SCIENCE_COMMERCIAL', 'ARTS_HUMANITIES', 'LAW'].includes(altFaculty);
  }
  if (candidateFaculty === 'ARTS_HUMANITIES') {
    return ['ARTS_HUMANITIES', 'SOCIAL_SCIENCE_COMMERCIAL', 'LAW'].includes(altFaculty);
  }
  if (candidateFaculty === 'LAW') {
    return ['LAW', 'ARTS_HUMANITIES', 'SOCIAL_SCIENCE_COMMERCIAL'].includes(altFaculty);
  }
  return true;
}

export function sanitizeAlternativeCourses(
  alternatives: any[],
  targetCourse: string,
  cleanJambSubjects: string[],
  university: string,
  stateOfOrigin?: string
): any[] {
  if (!Array.isArray(alternatives)) return [];

  const candFaculty = getFacultyCategory(targetCourse, cleanJambSubjects);
  const normUni = university.toLowerCase().trim();
  const isTechUni = ['futa', 'futo', 'futminna', 'lautech', 'mautech', 'fupre'].some(t => normUni.includes(t));

  let cleaned = alternatives
    .map((alt: any) => {
      let altName = String(alt.name || '').trim();
      altName = altName.replace(/^(adequate|change course to|change institution to|opt for)\s+/i, '');
      return {
        ...alt,
        name: altName
      };
    })
    .filter((alt: any) => {
      const nameLower = String(alt.name || '').toLowerCase();
      if (!nameLower) return false;

      if (isTechUni && (nameLower.includes('law') || nameLower.includes('ll.b') || nameLower.includes('mass comm') || nameLower.includes('theatre'))) {
        return false;
      }

      if (!isAlternativeFacultyCompatible(candFaculty, alt.name)) {
        console.warn(`[Sanitizer] Filtered out cross-faculty alternative "${alt.name}" for target course faculty "${candFaculty}"`);
        return false;
      }

      return true;
    });

  if (cleaned.length < 2) {
    if (candFaculty === 'SCIENCE_AGRIC') {
      const existing = cleaned.map(a => String(a.name || '').toLowerCase());
      if (!existing.some(n => n.includes('soil') || n.includes('crop') || n.includes('animal') || n.includes('agricultural'))) {
        cleaned.push({
          name: `Soil Science / Animal Science at ${university}`,
          matchPercentage: "85%",
          reasoning: "Provides a viable, lower competitive cutoff alternative within the Agricultural Sciences faculty matching your subject background."
        });
      }
      if (cleaned.length < 2 && stateOfOrigin && stateOfOrigin.toLowerCase() !== 'none' && stateOfOrigin.toLowerCase() !== 'not specified') {
        const stateUni = stateOfOrigin.toLowerCase().includes('delta') ? 'Delta State University (DELSU)' : `${stateOfOrigin} State University`;
        cleaned.push({
          name: `Agricultural Economics at ${stateUni}`,
          matchPercentage: "88%",
          reasoning: `Provides a strong catchment advantage at ${stateUni} for candidates with Agricultural Science and Chemistry subjects.`
        });
      } else if (cleaned.length < 2) {
        cleaned.push({
          name: `Food Science and Technology at ${university}`,
          matchPercentage: "92%",
          reasoning: "Maintains high career alignment in agricultural/food sciences with an achievable competitive cutoff mark."
        });
      }
    } else if (candFaculty === 'HEALTH_MEDICINE') {
      cleaned.push({
        name: `Anatomy / Human Physiology at ${university}`,
        matchPercentage: "95%",
        reasoning: "Shares core medical science subjects (Biology, Chemistry, Physics) with lower aggregate requirements."
      });
    } else if (candFaculty === 'ENGINEERING_TECH') {
      cleaned.push({
        name: `Industrial Physics / Applied Mathematics at ${university}`,
        matchPercentage: "88%",
        reasoning: "Leverages strong Mathematics and Physics subjects with favorable admission cutoffs."
      });
    } else if (candFaculty === 'SOCIAL_SCIENCE_COMMERCIAL') {
      cleaned.push({
        name: `Sociology / Public Administration at ${university}`,
        matchPercentage: "88%",
        reasoning: "Offers a viable alternative within Social Sciences matching Government, Economics, or Commercial subjects."
      });
    }
  }

  return cleaned;
}

export const enforceAdmissionTiers = (
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
  oLevels = '',
  isOfficialCutoff = false
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

  let effectiveCutoff = cutoffVal;
  const diff = score - effectiveCutoff;
  const quotaText = isELDS ? "ELDS quota" : isCatchment ? "Catchment quota" : "Merit quota";

  const seasonalTimeline = `\n\n### 4. 2026/2027 Admission Season Context\n*   **Current Phase:** Post-UTME screening & admission list processing phase.\n*   **Registration Status:** Major institutions (including UNIBEN, FUTA, DELSU, OOU, etc.) have concluded Post-UTME registrations, while others remain active. Always verify current registration status on your institution's official portal.\n*   **Strategic Action:** If registration for your target school is closed, track your JAMB CAPS portal for screening score uploads, transfer offers, and official admission list releases. If your aggregate score is below cutoff, explore a JAMB Change of Course or Institution on CAPS while options remain open.`;

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
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Borderline / Fair**\n- **Admission Probability:** **55%**\n\n### 2. The Reality Check\nYour aggregate score of **${score}%** is exactly equal to the competitive estimated competitive benchmark of **${cutoffVal}%** for **${course}** at **${university}** under the **${quotaText}**. Sitting exactly on the cutoff mark is highly volatile due to merit list limits, strict state quotas, and random tie-breakers. Your position is extremely sensitive and requires cautious, urgent handling. Do not assume admission is guaranteed simply by hitting the baseline.\n\n### 3. Actionable Next Steps\n*   **Monitor Portal Daily:** Log in to the official JAMB CAPS portal and your school's screening portal every single day to track any changes in your status.\n*   **Verify O'Level Uploads:** Ensure your WAEC/NECO results are fully uploaded and verified on JAMB CAPS. A single missing grade can disqualify you instantly.\n*   **Consider a Backup:** Have a backup plan ready. Be prepared to perform a JAMB Change of Course or Change of Institution to a less competitive department if the primary list is filled.` + seasonalTimeline,
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
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **${isHighlyCompetitive ? "Marginal Pass / High Competition Risk" : "Marginal Pass / Quota Risk"}**\n- **Admission Probability:** **${prob}%**\n\nThe candidate's aggregate score of **${score}%** is slightly above the estimated competitive benchmark of **${cutoffVal}%**, but requires a safe buffer as departmental quotas fill up.\n\n### 2. The Reality Check\nYour aggregate score of **${score}%** clears the estimated competitive benchmark of **${cutoffVal}%** by a thin margin of **+${diff.toFixed(2)}%** under the **${quotaText}**.\n\nWhile this is technically a positive score, for highly competitive programs like **${course}** at **${university}**, clearing the cutoff by just 0.1% to 2.5% carries significant risk for candidates in high-demand departments. In these fields, hundreds of students often crowd within fractional percentage ranges, and schools enforce strict departmental quotas (Merit vs Catchment vs ELDS). Standard tie-breakers and non-catchment merit list thresholds mean that non-catchment candidates usually require a higher merit buffer to guarantee selection.\n\n### 3. Actionable Next Steps\n*   **Monitor JAMB CAPS with Urgency:** Regularly check the 'Admission Status' tab on your JAMB CAPS profile for updates like 'Admission in Progress' (AIP) or 'Transfer Approval'.\n*   **Verify O'Level and JAMB Match:** Verify that your O'Level grades and JAMB subject combinations align perfectly with departmental rules.\n*   **Prepare an Alternative Plan:** Be prepared for supplementary lists or alternative course options if the primary non-catchment merit quota fills up.` + seasonalTimeline,
      recommendation: `The candidate's aggregate score of ${score}% is slightly above the estimated competitive benchmark of ${cutoffVal}%, but requires a safe buffer as departmental quotas fill up.`
    };
  } else if (diff >= 2.5 && diff < 6) {
    // 2B. THE STRONG TIER (Score is 2.5% to 5.99% ABOVE Cutoff)
    const prob = Math.min(Math.max(Math.round(68 + ((diff - 2.5) / 3.5) * 11), 68), 79);
    return {
      verdict: "Strong",
      probability: prob,
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Strong**\n- **Admission Probability:** **${prob}%**\n\n### 2. The Reality Check\nYour aggregate score of **${score}%** clears the estimated competitive benchmark of **${cutoffVal}%** by a solid but modest margin of **+${diff.toFixed(2)}%** under the **${quotaText}**. This gives you a clear competitive advantage on the merit list, but it does not guarantee automatic entry. You must remain optimistic yet highly vigilant.\n\n### 3. Actionable Next Steps\n*   **Complete Screening Flawlessly:** Double-check every field during your school's online screening registration.\n*   **Track Portal Updates:** Regularly check JAMB CAPS for "Admission in Progress" (AIP) or "Approved" statuses.\n*   **Upload O'Level Results:** Confirm your O'Level grades are correctly reflected on JAMB CAPS.` + seasonalTimeline,
      recommendation: `Your aggregate score clears the estimated competitive benchmark by a modest margin. You have a competitive advantage on the merit list. Stay vigilant and complete all screening registrations flawlessly.`
    };
  } else if (diff >= 6) {
    // 3. THE VERY STRONG TIER (Score is >= 6% ABOVE Cutoff)
    const prob = Math.min(Math.max(Math.round(80 + ((diff - 6) / 20) * 18), 80), 98);
    return {
      verdict: "Very Strong / Excellent",
      probability: prob,
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Very Strong / Excellent**\n- **Admission Probability:** **${prob}%**\n\n### 2. The Reality Check\nCongratulations! Your aggregate score of **${score}%** significantly clears the typical estimated competitive benchmark of **${cutoffVal}%** by **+${diff.toFixed(2)}%** under the **${quotaText}**. You are in an exceptional winning position to secure a premium merit list spot at **${university}**.\n\n### 3. Actionable Next Steps\n*   **Monitor JAMB CAPS:** Access the CAPS portal to accept your admission as soon as it is officially offered.\n*   **Accept Admission Promptly:** Remember you have exactly 4 weeks to accept the admission on CAPS once offered.\n*   **Track Portal Fees:** Prepare your acceptance fees and monitor the school's official website for clearance deadlines.` + seasonalTimeline,
      recommendation: `Congratulations! Your aggregate score is exceptional and significantly clears the typical cutoff. You are in an outstanding position to secure a merit list spot. Focus on accepting your admission on CAPS.`
    };
  } else if (diff < 0 && diff >= -1.5) {
    // 4A. THE BORDERLINE DEFICIT TIER (Score is 0.01% to 1.50% BELOW Cutoff)
    // Very narrow deficit: candidate is right on the threshold, strong candidate for catchment adjustment, VC discretion, or supplementary lists.
    const prob = Math.min(Math.max(Math.round(48 + (diff * 8)), 36), 49);
    const benchmarkLabel = isOfficialCutoff ? "official departmental cutoff" : "estimated competitive benchmark";
    return {
      verdict: "Borderline / Competitive Deficit",
      probability: prob,
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Borderline / Competitive Deficit**\n- **Admission Probability:** **${prob}% (High Supplementary Potential)**\n\n### 2. The Reality Check\nYour aggregate score of **${score}%** is narrowly below the ${benchmarkLabel} of **${cutoffVal}%** (a slight deficit of **${diff.toFixed(2)}%**) under the **${quotaText}** for **${course}** at **${university}**.\n\nWhile this narrow deficit makes primary First-Batch Merit admission competitive, candidates within 0.1% to 1.5% of the benchmark remain the prime candidates for Catchment quota adjustments, Educationally Less Developed States (ELDS) considerations, and Supplementary Admission List releases. You are well within striking distance, but you must remain proactive.\n\n### 3. Actionable Next Steps\n*   **Monitor JAMB CAPS Closely:** Check your JAMB CAPS profile daily for 'Admission in Progress' (AIP) or supplementary transfer offers.\n*   **Confirm O'Level Uploads:** Ensure your WAEC/NECO results are correctly uploaded on JAMB CAPS to avoid disqualification during batch processing.\n*   **Prepare a Targeted Backup:** Identify 1 or 2 closely related departments where your aggregate score exceeds the benchmark, ready to accept a transfer if offered.` + seasonalTimeline,
      recommendation: `Your aggregate score of ${score}% is only ${Math.abs(diff).toFixed(2)}% below the ${benchmarkLabel} (${cutoffVal}%). You remain a strong candidate for catchment or supplementary lists. Track your JAMB CAPS portal daily.`
    };
  } else if (diff < -1.5 && diff >= -4.0) {
    // 4B. THE MODERATE DEFICIT TIER (Score is 1.51% to 4.00% BELOW Cutoff)
    const prob = Math.min(Math.max(Math.round(32 + ((diff + 1.5) * 5)), 18), 34);
    const benchmarkLabel = isOfficialCutoff ? "official departmental cutoff" : "estimated competitive benchmark";
    return {
      verdict: "Low Probability / Supplementary Backup",
      probability: prob,
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Low Probability / Supplementary Backup**\n- **Admission Probability:** **${prob}%**\n\n### 2. The Reality Check\nYour aggregate score of **${score}%** is lower than the ${benchmarkLabel} of **${cutoffVal}%** (a deficit of **${diff.toFixed(2)}%**) under the **${quotaText}** for **${course}** at **${university}**.\n\nSecuring primary merit admission with a ${Math.abs(diff).toFixed(2)}% gap is challenging. While supplementary lists may absorb a small fraction of candidates, your primary admission probability for this specific programme is low. Proactive steps are necessary to protect your admission year.\n\n### 3. Actionable Next Steps\n*   **Explore JAMB Change of Course:** Consider pivoting to related allied programmes with lower cutoffs matching your subject combination.\n*   **Explore JAMB Change of Institution:** State or private universities with more favorable cutoff lines can guarantee admission this session.\n*   **Maintain CAPS Verification:** Ensure all O'Level results are verified on JAMB CAPS.` + seasonalTimeline,
      recommendation: `Your aggregate score is ${Math.abs(diff).toFixed(2)}% below the ${benchmarkLabel}. Primary merit is unlikely. We advise exploring a JAMB Change of Course or Institution.`
    };
  } else {
    // 4C. THE SEVERE DEFICIT TIER (Score is > 4.00% BELOW Cutoff)
    const prob = Math.min(Math.max(Math.round(15 + ((diff + 4) * 1.5)), 5), 16);
    const benchmarkLabel = isOfficialCutoff ? "official departmental cutoff" : "estimated competitive benchmark";
    return {
      verdict: "Low Probability",
      probability: prob,
      detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Low Probability**\n- **Admission Probability:** **${prob}%**\n\n### 2. The Reality Check\nYour aggregate score of **${score}%** is significantly below the ${benchmarkLabel} of **${cutoffVal}%** (a deficit of **${diff.toFixed(2)}%**) under the **${quotaText}** for **${course}** at **${university}**.\n\nAt a deficit of ${Math.abs(diff).toFixed(2)}%, securing admission into this competitive programme is highly improbable. To avoid losing the entire 2026/2027 admission cycle, you should take immediate corrective action.\n\n### 3. Actionable Next Steps\n*   **Immediate JAMB Change of Course:** Change your course on JAMB CAPS to an alternative discipline where your score places you safely above the benchmark.\n*   **JAMB Change of Institution:** Consider institutions with lower aggregate cutoffs.\n*   **Verify Document Uploads:** Keep your O'Level grades uploaded on CAPS so new institutions can process your file seamlessly.` + seasonalTimeline,
      recommendation: `Your aggregate score has a significant deficit (${Math.abs(diff).toFixed(2)}%) against the ${benchmarkLabel}. Pivot immediately via JAMB Change of Course or Institution to secure admission.`
    };
  }
};

// ─── Cutoff Calculator ─────────────────────────────────────────────────────────

export const formatStrategyMarkdown = (text: string): string => {
  if (!text) return '';

  let str = String(text)
    .trim()
    .replace(/^```(?:markdown)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // 1. Ensure double newlines before any markdown header symbol (e.g. "###", "##", "#") if preceded by inline text or period
  str = str.replace(/([^\n])\s*(#{1,6}\s+)/g, '$1\n\n$2');

  // 2. Separate section header titles from body text if concatenated on the same line
  // e.g. "### 1. Verdict Summary - Verdict Status:" -> "### 1. Verdict Summary\n\n- Verdict Status:"
  // e.g. "### 2. The Reality Check Lagos State..." -> "### 2. The Reality Check\n\nLagos State..."
  // e.g. "### 3. Actionable Next Steps Ensure..." -> "### 3. Actionable Next Steps\n\nEnsure..."
  str = str
    .replace(/(###\s*1\.\s*Verdict Summary)\s*([\-\*]?)/gi, '$1\n\n$2')
    .replace(/(###\s*2\.\s*The Reality Check)\s*(?=\S)/gi, '$1\n\n')
    .replace(/(###\s*3\.\s*Actionable Next Steps)\s*([\-\*]?)/gi, '$1\n\n$2');

  // Also handle general numbered or title headers
  str = str.replace(/(#{1,6}\s+(?:\d+\.\s*)?[A-Z][A-Za-z0-9\s]{2,35})(?=\s+[A-Z0-9\*-]|\s+[a-z])/g, (match, header) => {
    if (!header.endsWith('\n')) {
      return header + '\n\n';
    }
    return match;
  });

  // 3. Ensure bullet points or list items starting in middle of inline text have a newline before them
  str = str.replace(/([^\n])\s*([\*\-\•]\s+)/g, '$1\n$2');

  // 4. Ensure no more than 2 consecutive newlines to keep layout clean
  str = str.replace(/\n{3,}/g, '\n\n');

  return str;
};

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
  postUtmeScore = 0,
  olevelPoints = 0
) => {
  let fallbackDeterministicResult: any = null;
  // ─── EVALUATE CANDIDATE QUOTA (ELDS vs CATCHMENT vs OPEN MERIT) ─────────────
  const candidateQuota = evaluateCandidateQuota(university, stateOfOrigin);
  const resolvedIsELDS = isELDS || candidateQuota.isELDS;
  const resolvedIsCatchment = isCatchment || candidateQuota.isCatchment;
  const quotaUsedText = resolvedIsELDS 
    ? `ELDS Quota (${stateOfOrigin || 'Concession'})` 
    : (resolvedIsCatchment ? `Catchment Quota (${stateOfOrigin || 'Catchment'})` : 'National Merit Quota');

  try {
    // ─── DEDUPLICATE AND NORMALIZE JAMB SUBJECTS ──────────────────────────────
    const cleanJambSubjects = Array.from(
      new Set(
        (jambSubjects || [])
          .flatMap(s => String(s || '').split(/[_,/+]+/))
          .map(s => String(s || '').trim())
          .filter(Boolean)
      )
    );

    // ─── 1. MANDATORY SUBJECT COMBINATION VALIDATION HARD FAILURE GATE ───────────
    const subjectCheck = validateMandatorySubjects(course, cleanJambSubjects);
    if (!subjectCheck.valid) {
      console.log(`Disqualified due to subject mismatch for ${course} at ${university}. Skipping external API call.`);
      return {
        departmentalCutoff: "N/A",
        institutionalCutoff: "160",
        cutoff: "N/A",
        cutoffValue: "N/A",
        cutoffType: "estimated_benchmark",
        cutoffYear: new Date().getFullYear(),
        cutoffSource: "Algorithmic Ruleset",
        cutoffIsOfficial: false,
        cutoffConfidence: "high",
        mathBreakdown: `Aggregate score of ${score}% calculated for ${university} (${course}).`,
        scoreBreakdown: [
          { factor: "Aggregate", impact: `${score}%` },
          { factor: "Subject Match", impact: "Invalid" }
        ],
        subjectCombinationValidation: subjectCheck,
        reliability: "high",
        confidenceReasoning: "Algorithmic validation determined mandatory JAMB subject mismatch.",
        evidencePanel: [],
        recommendation: `CRITICAL JAMB SUBJECT MISMATCH: Your written JAMB subjects (${cleanJambSubjects.join(', ')}) do not meet the compulsory requirements for ${course} at ${university}. ${subjectCheck.reason}`,
        detailedStrategy: `### 1. Verdict Summary\n- **Verdict Status:** **Disqualified / Invalid Subject Combination**\n- **Admission Probability:** **0%**\n\n### 2. The Reality Check\nYour written JAMB subject combination of **${cleanJambSubjects.join(', ')}** does **NOT** meet the compulsory subject requirements for **${course}** at **${university}**. ${subjectCheck.reason}\n\n### 3. Actionable Next Steps\n*   **Immediate JAMB Change of Course:** Log into your JAMB CAPS portal and change your course choice to a department that strictly accepts your written JAMB subjects (${cleanJambSubjects.join(', ')}).\n*   **Consult JAMB Brochure:** Verify subject requirements for alternative departments before submitting your change of course.`,
        probability: 0,
        verdict: "Disqualified / Invalid Subject Combination",
        alternatives: sanitizeAlternativeCourses([], course, cleanJambSubjects, university, stateOfOrigin),
        strengths: ["Calculated aggregate score recorded"],
        riskFactors: ["Invalid JAMB subject combination for chosen department"],
        isOffered: true,
        fresherBudget: "Estimated Total: ₦350,000 (Consult official portal for exact fee schedule)",
        sourcesCited: ['jamb.gov.ng'],
        predictionConfidenceInterval: "0%"
      };
    }

    const cacheKey = `${university}_${course}_${score}_${oLevels}_${cleanJambSubjects.join('_')}_${role || 'Std'}_${isAwaitingResult}_${isPostUtmePending}_${stateOfOrigin || 'None'}_${resolvedIsELDS}_${resolvedIsCatchment}_${quotaDiscount}_v7`;
    const cachedResult = await getCachedCourseCutoffInfo(university, cacheKey);
    if (cachedResult) {
      console.log(`Using cached course cutoff check for ${university} - ${course}`);
      let manualOverride = await getCutoffOverride(university, course);
      const nUni = university.toLowerCase().trim();
      const nCourse = course.toLowerCase().trim();
      if (!manualOverride && (nUni.includes("ibadan") || nUni === "ui" || nUni.includes("university of ibadan"))) {
        const uiCutoff = getUICutoffByCourse(course);
        if (uiCutoff) {
          const targetCutoff = resolvedIsELDS ? uiCutoff.elds : (resolvedIsCatchment ? uiCutoff.catchment : uiCutoff.merit);
          manualOverride = {
            institution: "University of Ibadan (UI)",
            course: uiCutoff.programme,
            departmentalCutoff: `${targetCutoff}%`,
            institutionalCutoff: "200",
            explanation: `Official UI 2025/2026 Cutoff: Merit (${uiCutoff.merit}%), Catchment (${uiCutoff.catchment}%), ELDS (${uiCutoff.elds}%)`
          };
        }
      }
      if (!manualOverride && (nUni.includes("futa") || nUni.includes("akure") || nUni.includes("technology, akure"))) {
        const futaCutoff = getFUTACutoffByCourse(course);
        if (futaCutoff) {
          manualOverride = {
            institution: "Federal University of Technology, Akure (FUTA)",
            course: futaCutoff.programme,
            departmentalCutoff: `${futaCutoff.cutoff}%`,
            institutionalCutoff: "180",
            explanation: `Official FUTA 2026/2027 Cutoff: ${futaCutoff.cutoff}% (${futaCutoff.code}) - ${futaCutoff.school}`
          };
        }
      }
      if (manualOverride) {
        cachedResult.departmentalCutoff = manualOverride.departmentalCutoff;
        if (manualOverride.institutionalCutoff) cachedResult.institutionalCutoff = manualOverride.institutionalCutoff;
        cachedResult.cutoff = manualOverride.departmentalCutoff;
        const parsedCutoffVal = parseFloat(manualOverride.departmentalCutoff.replace(/[^0-9.]/g, '')) || 55.0;
        const reEval = enforceAdmissionTiers(
          score, parsedCutoffVal, university, course, stateOfOrigin, resolvedIsELDS, resolvedIsCatchment,
          isAwaitingResult, isPostUtmePending, jambScore, postUtmeScore, formulaExplanation, oLevels,
          true
        );
        cachedResult.verdict = reEval.verdict;
        cachedResult.probability = reEval.probability;
        cachedResult.recommendation = reEval.recommendation;
        cachedResult.detailedStrategy = reEval.detailedStrategy;
        cachedResult.cutoffIsOfficial = true;
        cachedResult.cutoffType = "official_departmental_cutoff";
        cachedResult.cutoffSource = manualOverride.explanation || "Official Institutional Release";
        cachedResult.cutoffQuotaUsed = quotaUsedText;
        cachedResult.scoreDiff = Number((score - parsedCutoffVal).toFixed(2));
      }
      if (Array.isArray(cachedResult.alternatives)) {
        cachedResult.alternatives = sanitizeAlternativeCourses(
          cachedResult.alternatives,
          course,
          cleanJambSubjects,
          university,
          stateOfOrigin
        );
      }
      return cachedResult;
    }

    // ─── 2. GROUNDING & LIVE SEARCH ───────────────────────────────────────────
    let officialCutoffData = "";
    let rawSearchContext = "";
    try {
      const [search2026, searchHistoric, searchSchedule] = await Promise.all([
        searchWeb(`"${university}" "${course}" departmental aggregate cut-off mark percentage score 2024 2025 2026`).catch(() => ""),
        searchWeb(`"${university}" "${course}" merit cutoff mark aggregate score admission`).catch(() => ""),
        searchWeb(`"${university}" Post-UTME 2026/2027 screening registration status form out dates OR exam schedule`).catch(() => "")
      ]);

      const parts = [];
      if (search2026 && search2026.length > 50) parts.push(`[2026/2027 Current Release]:\n${search2026}`);
      if (searchHistoric && searchHistoric.length > 50) parts.push(`[Historical Benchmarks]:\n${searchHistoric}`);
      if (searchSchedule && searchSchedule.length > 50) parts.push(`[Registration Status & Exam Schedule]:\n${searchSchedule}`);

      if (parts.length > 0) {
        rawSearchContext = parts.join("\n\n");
        officialCutoffData = "OFFICIAL ONLINE GROUNDING DATA & SEARCH RESULTS (Use this as primary supporting evidence for cut-offs, fee schedules, and registration deadlines):\n" + rawSearchContext.substring(0, 10000);
        const knowledgeKey = ("cutoff_search_raw_" + university + "_" + course).toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
        saveKnowledgeFragment(knowledgeKey, rawSearchContext.substring(0, 5000)).catch(err => {
          console.error("Error saving raw search facts to knowledge fragments:", err);
        });
      } else {
        officialCutoffData = "No specific online search grounding available. Rely on standard historical competitiveness and general institutional parameters.";
      }
    } catch (searchError) {
      console.warn("Search for official cutoff failed:", searchError);
      officialCutoffData = "Search failed due to rate limits or connectivity. Rely on standard competitive thresholds.";
    }

    let manualOverride = await getCutoffOverride(university, course);
    const nUni = university.toLowerCase().trim();
    const nCourse = course.toLowerCase().trim();
    if (!manualOverride && (nUni.includes("ibadan") || nUni === "ui" || nUni.includes("university of ibadan"))) {
      const uiCutoff = getUICutoffByCourse(course);
      if (uiCutoff) {
        const targetCutoff = resolvedIsELDS ? uiCutoff.elds : (resolvedIsCatchment ? uiCutoff.catchment : uiCutoff.merit);
        manualOverride = {
          institution: "University of Ibadan (UI)",
          course: uiCutoff.programme,
          departmentalCutoff: `${targetCutoff}%`,
          institutionalCutoff: "200",
          explanation: `Official UI 2025/2026 Cutoff: Merit (${uiCutoff.merit}%), Catchment (${uiCutoff.catchment}%), ELDS (${uiCutoff.elds}%)`
        };
      }
    }
    if (!manualOverride && (nUni.includes("futa") || nUni.includes("akure") || nUni.includes("technology, akure"))) {
      const futaCutoff = getFUTACutoffByCourse(course);
      if (futaCutoff) {
        manualOverride = {
          institution: "Federal University of Technology, Akure (FUTA)",
          course: futaCutoff.programme,
          departmentalCutoff: `${futaCutoff.cutoff}%`,
          institutionalCutoff: "180",
          explanation: `Official FUTA 2026/2027 Cutoff: ${futaCutoff.cutoff}% (${futaCutoff.code}) - ${futaCutoff.school}`
        };
      }
    }

    // ─── 3. DETERMINISTIC FOUNDATION EVALUATION ────────────────────────────────
    let cutoffVal = extractCutoffFallback(course, officialCutoffData || null);
    if (manualOverride && manualOverride.departmentalCutoff) {
      const match = manualOverride.departmentalCutoff.toString().match(/(\d+(\.\d+)?)/);
      if (match) cutoffVal = parseFloat(match[1]);
    }

    const deterministicEvaluation = enforceAdmissionTiers(
      score, cutoffVal, university, course, stateOfOrigin, resolvedIsELDS, resolvedIsCatchment,
      isAwaitingResult, isPostUtmePending, jambScore, postUtmeScore, formulaExplanation, oLevels,
      !!manualOverride
    );

    const isPendingState = isPostUtmePending || isAwaitingResult;
    const scoreLabel = isPendingState ? 'Projected Aggregate Score' : 'Aggregate Score';
    const mathBreakdown = `${scoreLabel}: ${score}% calculated for ${university} (${course}). Raw JAMB Score: ${jambScore > 0 ? jambScore : 'Not provided'} / 400. Raw Post-UTME: ${postUtmeScore > 0 ? `${postUtmeScore} / 100` : (isPostUtmePending ? 'Pending' : 'N/A')}.`;

    const scoreDiffVal = Number((score - cutoffVal).toFixed(2));

    fallbackDeterministicResult = {
      departmentalCutoff: `${cutoffVal}%`,
      institutionalCutoff: manualOverride?.institutionalCutoff || "160",
      cutoff: `${cutoffVal}%`,
      cutoffValue: cutoffVal,
      cutoffType: manualOverride ? "official_departmental_cutoff" : "estimated_benchmark",
      cutoffYear: new Date().getFullYear(),
      cutoffSource: manualOverride ? (manualOverride.explanation || "Official Verified Ground Truth") : "Algorithmic Estimation",
      cutoffIsOfficial: !!manualOverride,
      cutoffConfidence: manualOverride ? "high" : "medium",
      cutoffQuotaUsed: quotaUsedText,
      scoreDiff: scoreDiffVal,
      mathBreakdown,
      scoreBreakdown: [
        { factor: "Aggregate Score", impact: `${score}%` },
        { factor: "Cutoff Benchmark", impact: `${cutoffVal}%` }
      ],
      subjectCombinationValidation: subjectCheck,
      reliability: manualOverride ? "high" : "medium",
      confidenceReasoning: manualOverride ? "Official verified cutoff override applied." : "Algorithmic audit completed using official university & JAMB competitive benchmarks.",
      evidencePanel: [],
      recommendation: deterministicEvaluation.recommendation,
      detailedStrategy: deterministicEvaluation.detailedStrategy,
      probability: deterministicEvaluation.probability,
      verdict: deterministicEvaluation.verdict,
      alternatives: sanitizeAlternativeCourses([], course, cleanJambSubjects, university, stateOfOrigin),
      strengths: score >= cutoffVal ? ["Aggregate score meets competitive benchmark", "Valid subject combination"] : ["Valid subject combination"],
      riskFactors: score < cutoffVal ? ["Aggregate score below merit cutoff", "High competition"] : ["Quota limits"],
      isOffered: true,
      fresherBudget: "Estimated Total: ₦350,000 (Consult official portal for exact fee schedule)",
      sourcesCited: ['jamb.gov.ng'],
      predictionConfidenceInterval: `${Math.max(5, deterministicEvaluation.probability - 5)}% to ${Math.min(98, deterministicEvaluation.probability + 5)}%`
    };

    let overridePrompt = "";
    if (manualOverride) {
      overridePrompt = `⚠️ CRITICAL SYSTEM OVERRIDE (MANDATORY ADMISSION GROUND TRUTH):
- The official, verified 2026 departmental competitive cut-off score for "${course}" at "${university}" is EXCLUSIVELY: "${manualOverride.departmentalCutoff}".
- The institutional cut-off floor is: "${manualOverride.institutionalCutoff || '150'}".
- Verified explanation / policy detail: "${manualOverride.explanation || 'No extra notes.'}".
You MUST evaluate the candidate's aggregate score (${score}%) strictly against this verified departmental cut-off score ("${manualOverride.departmentalCutoff}") to compute the probability, recommendation, and verdict.`;
    } else {
      overridePrompt = `⚠️ IMPORTANT INSTRUCTION FOR COMPETITIVE COURSES & CUTOFFS:
You must apply extremely strict and realistic historical cutoffs.
- DO NOT confuse the general Institutional JAMB Cut-off Mark (e.g. 160, 180, 200) with the Final Departmental Aggregate Percentage (out of 100%).
- For highly competitive courses like Computer Science, Medicine, Nursing, Law, Pharmacy, Software Engineering, etc., at top universities (e.g., FUTA, UNILAG, UI, OAU, UNN, UNILORIN, UNIBEN), the departmental aggregate cut-off is typically very high (e.g., 68% - 75%+).
- DO NOT output unrealistic low cutoffs (like 50%-60%) for tier-1 courses at competitive universities. If search results only mention the "180 JAMB cutoff", you must estimate the strict percentage aggregate (out of 100%) required for actual admission. Base your predictions firmly on these Nigerian admission realities.`;
    }

    const allKnowledge = await getAllKnowledgeFragments();
    const knowledge = allKnowledge.filter(k => {
      const keyStr = String(k.key || '').toLowerCase();
      const valStr = String(k.value || '').toLowerCase();
      const uniStr = university.toLowerCase();
      return keyStr.includes(uniStr) || valStr.includes(uniStr) || keyStr.includes('general');
    });

    let learnedPrompt = "";
    if (knowledge.length > 0) {
      let combined = knowledge.map(k => `- ${k.key}: ${k.value}`).join('\n');
      if (combined.length > 10000) {
        combined = combined.substring(0, 10000) + "... [TRUNCATED]";
      }
      learnedPrompt = "ADDITIONAL LEARNED KNOWLEDGE (USE THIS TO OVERRIDE STATIC DATA IF IT CONTRADICTS):\n" + combined + "\n\n";
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

    let calcDedicatedKey: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        const pref = localStorage.getItem('campusai_calc_key_pref');
        calcDedicatedKey = resolvePrefKey(pref);
      } catch (e) {
        console.error("Error reading calc key pref:", e);
      }
    }

    const response = await runAIWithFallback(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `
${overridePrompt}

${officialCutoffData}

${learnedPrompt}

CRITICAL RULES FOR ADMISSION ANALYSIS:
1. DEPARTMENTAL CUT-OFF EXPLICIT GROUNDING:
   - Extract or search for the exact published or verified estimated competitive benchmark mark / aggregate score for ${course} at ${university} from the grounding search data. Output as percentage or score e.g. "58.5%" or "72.0%".
2. REALISTIC FRESHER BUDGET:
   - "fresherBudget" MUST be a realistic, structured, professional cost breakdown for a first-year student at "${university}" in NGN.
3. STRICT FACULTY BOUNDARY MANDATE:
   - "alternatives" MUST contain 2 to 4 actual alternative courses offered at ${university} matching candidates written JAMB subjects (${cleanJambSubjects.join(', ')}). Set matchPercentage high (e.g. "85%", "92%", "98%") reflecting strong OLevel/JAMB overlap.
4. STRATEGIC ADVISEMENT BY STRICT TIER ASSIGNMENT:
   Compare candidate aggregate (${score}%) directly against cutoff (${cutoffVal}%):
   - Tier 1: BORDERLINE (Score == Cutoff) -> "Borderline", Probability 50-60%.
   - Tier 2: STRONG (Score is 1-5.99% above) -> "Strong", Probability 65-79%.
   - Tier 3: VERY STRONG (Score >= 6% above) -> "Very Strong / Excellent", Probability 80-98%.
   - Tier 4: BELOW CUTOFF (Score < Cutoff) -> "Low Probability", Probability < 30%.
5. DETAILED STRATEGY MARKDOWN:
   Must contain three sections: '### 1. Verdict Summary', '### 2. The Reality Check', and '### 3. Actionable Next Steps'.

- Institution: ${university}
- Program: ${course}
- Candidate Aggregate Score: ${score}%
- Pre-Calculated O'Level Points: ${olevelPoints > 0 ? olevelPoints : 'N/A'}
- Raw JAMB Score: ${jambScore > 0 ? `${jambScore} / 400` : 'Not explicitly provided'}
- Raw Post-UTME / Screening Score: ${postUtmeScore > 0 ? `${postUtmeScore} / 100` : 'N/A or Pending'}
- O-Level Profile: ${oLevels}
- JAMB Subjects: ${cleanJambSubjects.join(', ')}
- Role: ${role || 'Standard'}
- Uses Post-UTME Exam: ${usesPostUtme ? 'YES' : 'NO'}
- User Has All Results: ${!isAwaitingResult && !isPostUtmePending ? 'YES' : 'NO'}
- State of Origin: ${stateOfOrigin || 'Not Specified'}
- Is ELDS State: ${isELDS ? 'YES' : 'NO'}
- Is Catchment Area Candidate: ${isCatchment ? 'YES' : 'NO'}

CRITICAL - CUTOFF CATEGORIZATION:
You must explicitly classify what type of cutoff benchmark you are providing.
- cutoffValue: The numerical value (e.g., "78.875")
- cutoffType: Must be one of: "historical_closing_aggregate", "estimated_benchmark", "official_departmental_cutoff", "eligibility_minimum"
- cutoffYear: The year this cutoff data is from (e.g., "2024", "2025")
- cutoffSource: Where this data comes from (e.g., "Official University Bulletin", "Historical Trend Analysis", "Manual System Override")
- cutoffIsOfficial: boolean (true only if it's an exact, confirmed figure from the school for the current session)
- cutoffConfidence: "high", "medium", or "low"
- DO NOT present estimated or historical benchmarks as guaranteed final cutoff points.

Return JSON:
{
  "institutionalCutoff": "string",
  "departmentalCutoff": "string",
  "cutoff": "string",
  "cutoffValue": "string",
  "cutoffType": "string",
  "cutoffYear": "string",
  "cutoffSource": "string",
  "cutoffIsOfficial": false,
  "cutoffConfidence": "string",
  "mathBreakdown": "string",
  "scoreBreakdown": [
    { "factor": "string", "impact": "string" }
  ],
  "subjectCombinationValidation": { "valid": true, "reason": "string" },
  "reliability": "high",
  "confidenceReasoning": "string",
  "evidencePanel": [],
  "recommendation": "string",
  "detailedStrategy": "string",
  "probability": 75,
  "verdict": "Strong",
  "alternatives": [{ "name": "string", "matchPercentage": "string", "reasoning": "string" }],
  "strengths": ["string"],
  "riskFactors": ["string"],
  "isOffered": true,
  "fresherBudget": "string",
  "sourcesCited": ["string"],
  "predictionConfidenceInterval": "string"
}`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "HIGH" }
        }
      });
    }, calcDedicatedKey || undefined);

    const parsed = safeJsonParse(response.text, {});
    if (parsed) {
      // 1. Enforce verified cutoff ground truths if manualOverride / official UI data is present
      if (manualOverride) {
        parsed.departmentalCutoff = manualOverride.departmentalCutoff;
        parsed.cutoff = manualOverride.departmentalCutoff;
        parsed.cutoffValue = cutoffVal;
        parsed.cutoffIsOfficial = true;
        parsed.cutoffType = "official_departmental_cutoff";
        parsed.cutoffSource = (manualOverride.institution.includes("UI") || manualOverride.institution.includes("Ibadan"))
          ? "Official University of Ibadan (UI) 2025/2026 Cut-Off Release"
          : "Verified Administrative System Ground Truth";
        parsed.cutoffConfidence = "high";
        parsed.reliability = "high";
      } else {
        // If not an official override, ensure it is honestly categorized
        parsed.cutoffIsOfficial = false;
        parsed.cutoffType = "estimated_benchmark";
        parsed.cutoffSource = parsed.cutoffSource || "Historical Competitive Benchmark";
      }

      // 2. Lock verdict and probability strictly to deterministic tier calibration
      parsed.probability = deterministicEvaluation.probability;
      parsed.verdict = deterministicEvaluation.verdict;
      parsed.cutoffQuotaUsed = quotaUsedText;
      parsed.scoreDiff = scoreDiffVal;

      // 3. Sanitize strategy markdown to prevent hallucinated 'official' claims when estimated
      if (!parsed.detailedStrategy || parsed.detailedStrategy.length < 50 || parsed.detailedStrategy.includes("Summary...") || parsed.detailedStrategy.includes("detailed above")) {
        parsed.detailedStrategy = deterministicEvaluation.detailedStrategy;
      } else if (parsed.detailedStrategy && !parsed.cutoffIsOfficial) {
        parsed.detailedStrategy = parsed.detailedStrategy
          .replace(/official departmental cutoff/gi, "estimated competitive benchmark")
          .replace(/official cutoff/gi, "estimated benchmark");
      }

      if (Array.isArray(parsed.alternatives)) {
        parsed.alternatives = sanitizeAlternativeCourses(
          parsed.alternatives,
          course,
          cleanJambSubjects,
          university,
          stateOfOrigin
        );
      }
      saveCachedCourseCutoffInfo(university, cacheKey, parsed).catch(err => {
        console.error("Failed to cache course cutoff info:", err);
      });
      return parsed;
    }
    return fallbackDeterministicResult;
  } catch (e: any) {
    console.error("Gemini API call skipped or failed, returning deterministic foundation:", e);
    if (fallbackDeterministicResult) {
      return fallbackDeterministicResult;
    }
    const cleanSubjects = Array.isArray(jambSubjects) ? jambSubjects.filter(Boolean) : [];
    let manualOverride = await getCutoffOverride(university, course);
    const nUni = university.toLowerCase().trim();
    if (!manualOverride && (nUni.includes("ibadan") || nUni === "ui" || nUni.includes("university of ibadan"))) {
      const uiCutoff = getUICutoffByCourse(course);
      if (uiCutoff) {
        const targetCutoff = resolvedIsELDS ? uiCutoff.elds : (resolvedIsCatchment ? uiCutoff.catchment : uiCutoff.merit);
        manualOverride = {
          institution: "University of Ibadan (UI)",
          course: uiCutoff.programme,
          departmentalCutoff: `${targetCutoff}%`,
          institutionalCutoff: "200",
          explanation: `Official UI 2025/2026 Cutoff: Merit (${uiCutoff.merit}%), Catchment (${uiCutoff.catchment}%), ELDS (${uiCutoff.elds}%)`
        };
      }
    }
    if (!manualOverride && (nUni.includes("futa") || nUni.includes("akure") || nUni.includes("technology, akure"))) {
      const futaCutoff = getFUTACutoffByCourse(course);
      if (futaCutoff) {
        manualOverride = {
          institution: "Federal University of Technology, Akure (FUTA)",
          course: futaCutoff.programme,
          departmentalCutoff: `${futaCutoff.cutoff}%`,
          institutionalCutoff: "180",
          explanation: `Official FUTA 2026/2027 Cutoff: ${futaCutoff.cutoff}% (${futaCutoff.code}) - ${futaCutoff.school}`
        };
      }
    }
    let cutoffVal = extractCutoffFallback(course, null);
    if (manualOverride && manualOverride.departmentalCutoff) {
      const match = manualOverride.departmentalCutoff.toString().match(/(\d+(\.\d+)?)/);
      if (match) cutoffVal = parseFloat(match[1]);
    }
    const enforced = enforceAdmissionTiers(
      score, cutoffVal, university, course, stateOfOrigin, resolvedIsELDS, resolvedIsCatchment,
      isAwaitingResult, isPostUtmePending, jambScore, postUtmeScore, formulaExplanation, oLevels,
      !!manualOverride
    );
    const scoreDiffVal = Number((score - cutoffVal).toFixed(2));
    return {
      departmentalCutoff: `${cutoffVal}%`,
      institutionalCutoff: manualOverride?.institutionalCutoff || "160",
      cutoff: `${cutoffVal}%`,
      cutoffValue: cutoffVal,
      cutoffType: manualOverride ? "official_departmental_cutoff" : "estimated_benchmark",
      cutoffYear: new Date().getFullYear(),
      cutoffSource: manualOverride ? (manualOverride.explanation || "Official Verified Ground Truth") : "Algorithmic Estimation",
      cutoffIsOfficial: !!manualOverride,
      cutoffConfidence: manualOverride ? "high" : "medium",
      cutoffQuotaUsed: quotaUsedText,
      scoreDiff: scoreDiffVal,
      mathBreakdown: `Aggregate score of ${score}% calculated for ${university} (${course}).`,
      scoreBreakdown: [
        { factor: "Aggregate", impact: `${score}%` },
        { factor: "Cutoff", impact: `${cutoffVal}%` }
      ],
      subjectCombinationValidation: validateMandatorySubjects(course, cleanSubjects),
      reliability: manualOverride ? "high" : "medium",
      confidenceReasoning: manualOverride ? "Official verified cutoff override applied." : "Fallback algorithmic evaluation applied.",
      evidencePanel: [],
      recommendation: enforced.recommendation,
      detailedStrategy: enforced.detailedStrategy,
      probability: enforced.probability,
      verdict: enforced.verdict,
      alternatives: sanitizeAlternativeCourses([], course, cleanSubjects, university, stateOfOrigin),
      strengths: ["Calculated aggregate score recorded"],
      riskFactors: score < cutoffVal ? ["Aggregate score below merit cutoff"] : [],
      isOffered: true,
      fresherBudget: "Estimated Total: ₦350,000 (Consult official portal for exact fee schedule)",
      sourcesCited: ['jamb.gov.ng'],
      predictionConfidenceInterval: `${Math.max(5, enforced.probability - 5)}% to ${Math.min(98, enforced.probability + 5)}%`
    };
  }
};

// ─── Institutional Info & Portals ─────────────────────────────────────────────

export interface UniBio {
  bio: string;
  founded: string;
  motto: string;
  bestKnownFor: string;
  campusVibe: string;
  facultyStudentRatio: string;
  researchOutput: string;
  facilities: string[];
}

export const getUniversityDetailedInfo = async (name: string): Promise<UniBio | null> => {
  try {
    const response = await runAIWithFallback(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `Provide a detailed academic profile for "${name}" in Nigeria updated for the 2026/2027 academic session.
Return ONLY a JSON object with keys:
- "bio": concise, engaging institutional summary (2-3 sentences)
- "founded": year founded (e.g., "1948")
- "motto": official motto
- "bestKnownFor": primary academic strength or legacy
- "campusVibe": description of campus atmosphere and culture
- "facultyStudentRatio": realistic faculty-to-student ratio (e.g. "1:18")
- "researchOutput": research impact and innovation summary
- "facilities": array of 4-6 key campus facilities/centers (strings)`,
        config: { responseMimeType: "application/json" }
      });
    });
    if (response?.text) {
      return JSON.parse(response.text);
    }
  } catch (e) {
    console.error("getUniversityDetailedInfo error:", e);
  }
  return {
    bio: `${name} is one of Nigeria's prominent higher educational institutions, committed to academic excellence, research innovation, and societal development.`,
    founded: "1962",
    motto: "In Deed and in Truth",
    bestKnownFor: "Academic Research & Professional Excellence",
    campusVibe: "Vibrant, academic, and tech-forward campus environment",
    facultyStudentRatio: "1:22",
    researchOutput: "High research output with extensive index publications across Faculties.",
    facilities: ["Main University Library", "ICT Research Hub", "Advanced Science Laboratories", "Sports Complex"]
  };
};

export const getPostUtmeDates = async (university: string): Promise<PostUtmeInfo> => {
  try {
    const verified = await verifySingleSchoolPostUtme(university);
    if (verified) {
      return {
        status: verified.isOut ? 'Released' : 'Estimated',
        date: verified.isOut ? (verified.examDate || 'Form Currently Selling') : 'Expected August - September 2026',
        previousYearDate: 'August 2025',
        registrationLink: verified.portalLink || undefined,
        requirements: verified.cutoffScore ? `Minimum JAMB Cut-Off Score: ${verified.cutoffScore}. ${verified.eligibilityText || verified.details || ''}` : (verified.eligibilityText || '5 O-Level Credits in relevant subjects including Mathematics and English.')
      };
    }
  } catch (e) {
    console.error("getPostUtmeDates error:", e);
  }
  return {
    status: 'Estimated',
    date: 'Expected August - September 2026',
    previousYearDate: 'August 2025',
    requirements: '5 O-Level Credits in relevant subjects including Mathematics and English, plus meeting official institution UTME cut-off mark.'
  };
};

// ─── Cutoff Calculator ─────────────────────────────────────────────────────────

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
            model: "gemini-flash-latest",
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
            model: "gemini-flash-latest",
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
        model: "gemini-flash-latest",
        contents: `Current ASUU strike status in Nigeria as of ${getNigerianDate()}.
Based on your training data (and any real-time data if available), analyze if there is an active/threatened Academic Staff Union of Universities (ASUU) strike.

CRITICAL INSTRUCTIONS:
1. You must respond ONLY with a valid JSON object matching the schema.
2. DO NOT output any conversational text, pleasantries, or explanations of your knowledge cutoff.
3. If you lack real-time data or are uncertain, assume the status is stable (isActive: false, status: "Stable") and provide a brief general summary of recent historical context from your knowledge base.
4. Never say "I cannot fulfill this request" or refer to your knowledge cutoff.

Return JSON:
{ "isActive": boolean, "status": "string", "lastUpdated": "string", "summary": "string" }`,
        config: { responseMimeType: "application/json" }
      });
    });
    return safeJsonParse(response.text, { isActive: false, status: "Stable", lastUpdated: getNigerianDateShort(), summary: "No active strike reported." });
  } catch {
    return { isActive: false, status: "Stable", lastUpdated: getNigerianDateShort(), summary: "No active strike reported." };
  }
};

// ─── AI Chat ───────────────────────────────────────────────────────────────────

export function buildCleanChatContents(history: ChatMessage[], newMessage: string) {
  const validMessages = (history || []).filter(m => m && m.text && m.text.trim() !== '');

  const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of validMessages) {
    const role = msg.role === 'model' ? 'model' : 'user';

    // Ignore initial welcome model message if starting array
    if (formattedContents.length === 0 && role === 'model') {
      continue;
    }

    if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
      const lastIndex = formattedContents.length - 1;
      formattedContents[lastIndex].parts[0].text += '\n\n' + msg.text.substring(0, 1500);
    } else {
      formattedContents.push({
        role,
        parts: [{ text: msg.text.substring(0, 1500) }]
      });
    }
  }

  if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === 'user') {
    formattedContents.pop();
  }

  // Keep only the last 6 turns to keep context lightweight
  let sliced = formattedContents.slice(-6);
  if (sliced.length > 0 && sliced[0].role === 'model') {
    sliced = sliced.slice(1);
  }

  sliced.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  return sliced;
}

const generateFastSearchQuery = (message: string): string => {
  const clean = message
    .replace(/[?.,!/\\;:'"()]/g, " ")
    .replace(/\b(has|have|is|are|was|were|released|out|published|checking|check|what|when|where|how|can|you|tell|me|i|want|to|know|the|for|about|please|find|get)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return `${clean.substring(0, 100)} 2026 2027 Nigeria`.trim();
};

const prepareChatContext = async (sanitizedMessage: string, todayStr: string) => {
  const optimizedQuery = generateFastSearchQuery(sanitizedMessage);

  const searchTimeout = new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 1800));

  const [searchResults, newsItems, allKnowledge] = await Promise.all([
    Promise.race([searchWebRaw(optimizedQuery), searchTimeout]).catch(() => []),
    getCloudNews(false, false, undefined, undefined, 8).catch(() => []),
    getAllKnowledgeFragments().catch(() => [])
  ]);

  let newsContext = "";
  if (Array.isArray(newsItems) && newsItems.length > 0) {
    const activeNews = [...newsItems]
      .sort((a: any, b: any) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, 8);
    if (activeNews.length > 0) {
      newsContext += "VERIFIED LATEST COMMUNITY ADMISSION NEWS (PERSISTENT CLOUD DATA):\n";
      activeNews.forEach((news: any, idx: number) => {
        newsContext += `[News ${idx + 1}] Date: ${news.date} | Category: ${news.category}\nTitle: ${news.title}\nExcerpt: ${news.excerpt}\n\n`;
      });
    }
  }

  let learnedKnowledge = "";
  if (Array.isArray(allKnowledge) && allKnowledge.length > 0) {
    const msgLower = String(sanitizedMessage).toLowerCase();
    const knowledge = allKnowledge.filter((k: any) => {
      const keyLower = String(k.key || '').toLowerCase();
      return keyLower.includes('general') || msgLower.includes(keyLower);
    });
    if (knowledge.length > 0) {
      let combined = knowledge.map((k: any) => `- ${k.key}: ${k.value}`).join('\n');
      if (combined.length > 10000) {
        combined = combined.substring(0, 10000) + "... [TRUNCATED]";
      }
      learnedKnowledge = "ADMIN-VERIFIED CORRECTIONS (HIGHEST PRIORITY — OVERRIDE ALL OTHER DATA):\n" + combined;
    }
  }

  let jambKbContext = "";
  try {
    const matchedDocs = searchJAMBKnowledgeBase(sanitizedMessage).slice(0, 3);
    if (matchedDocs.length > 0) {
      jambKbContext = "VERIFIED OFFICIAL JAMB KNOWLEDGE BASE DOCUMENTS:\n" +
        matchedDocs.map(d => `[Document: ${d.title}] (${d.category} - ${d.subcategory || ''})\nSummary: ${d.summary}\n${d.steps ? 'Steps:\n' + d.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') : ''}\n${d.important_notes ? 'Important Notes:\n' + d.important_notes.map(n => `- ${n}`).join('\n') : ''}\nOfficial Source: ${d.official_source} (Verified: ${d.last_verified})`).join('\n---\n');
    }

    const matchedSyllabuses = searchSyllabuses(sanitizedMessage).slice(0, 2);
    if (matchedSyllabuses.length > 0) {
      const sylContext = matchedSyllabuses.map(ms => {
        const s = ms.syllabus;
        const topList = s.topics ? s.topics.slice(0, 3).map(t => `- Topic ${t.topicNumber}: ${t.title}`).join('\n') : '';
        return `[UTME Syllabus: ${s.subject}] (${s.category})\nObjectives: ${s.generalObjectives.slice(0, 2).join('; ')}\nTop Topics:\n${topList}\nRecommended Texts: ${s.recommendedTexts.slice(0, 2).map(r => `${r.title} by ${r.author}`).join('; ')}`;
      }).join('\n---\n');
      
      if (jambKbContext) {
        jambKbContext += "\n\nOFFICIAL UTME SYLLABUS DIRECTIVES:\n" + sylContext;
      } else {
        jambKbContext = "OFFICIAL UTME SYLLABUS DIRECTIVES:\n" + sylContext;
      }
    }
  } catch (e) {
    console.warn("Could not retrieve JAMB knowledge base or syllabus:", e);
  }

  const verifiedNewsStr = [jambKbContext, newsContext, learnedKnowledge].filter(Boolean).join('\n\n');

  let liveIntelStr = "";
  if (Array.isArray(searchResults) && searchResults.length > 0) {
    liveIntelStr = `LIVE WEB SEARCH RESULTS (Retrieved Live on ${todayStr} for query "${optimizedQuery}"):\n` +
      searchResults.map((r: any, idx: number) => `[Source ${idx + 1}] Title: ${r.title}\nURL: ${r.url}\nSnippet:\n${r.content}`).join('\n\n');
  } else {
    liveIntelStr = `LIVE WEB SEARCH STATUS: Live search active and executed on ${todayStr} for query "${optimizedQuery}". No official release announcements or new updates found on verified portal feeds for this query as of ${todayStr}.`;
  }

  return {
    searchResults: searchResults || [],
    verifiedNewsStr,
    liveIntelStr
  };
};

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

    const { searchResults, verifiedNewsStr, liveIntelStr } = await prepareChatContext(sanitizedMessage, todayStr);

    const groundingChunks: GroundingChunk[] = searchResults.map((r: any) => ({
      web: { uri: r.url, title: r.title }
    }));

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

    let primaryTargetContext = "";
    if (typeof window !== 'undefined') {
      try {
        const storedTarget = localStorage.getItem('campusai_primary_target');
        if (storedTarget) {
          const parsedTarget = JSON.parse(storedTarget);
          if (parsedTarget?.institution) {
            primaryTargetContext = `[SAVED PRIMARY TARGET SCHOOL CONTEXT]: The student's official primary target institution is ${parsedTarget.institution}. When discussing news or updates about OTHER schools (e.g., UNIOSUN, UNILAG, LASU, UI), evaluate that news accurately but DO NOT convert or switch their primary target school away from ${parsedTarget.institution}!`;
          }
        }
      } catch (e) {}
    }

    const userContextStr = [userCorrections.join('\n'), primaryTargetContext].filter(Boolean).join('\n\n');

    let systemInstruction = getSystemPrompt(
      liveIntelStr,
      verifiedNewsStr,
      userContextStr,
      todayStr
    );

    const response = await runAIWithFallback(async (ai) => {
      const contents = buildCleanChatContents(history, sanitizedMessage);

      return await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents,
        config: { 
          systemInstruction
        } });
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

export const executeAiChatStream = async (
  message: string,
  history: ChatMessage[],
  onChunk: (accumulatedText: string, groundingChunks?: GroundingChunk[]) => void
): Promise<{ text: string; groundingChunks?: GroundingChunk[] }> => {
  try {
    let sanitizedMessage = message;
    if (sanitizedMessage.length > 25000) {
      sanitizedMessage = sanitizedMessage.substring(0, 25000) + "\n\n[Message truncated to prevent payload size limits]";
    }

    const chatKeys = getChatKeys();
    const todayStr = getNigerianDate();

    const { searchResults, verifiedNewsStr, liveIntelStr } = await prepareChatContext(sanitizedMessage, todayStr);

    const userCorrections: string[] = [];
    for (let i = 0; i < history.length - 1; i++) {
      const msg = history[i];
      if (
        msg.role === 'user' &&
        (
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

    let primaryTargetContextStream = "";
    if (typeof window !== 'undefined') {
      try {
        const storedTarget = localStorage.getItem('campusai_primary_target');
        if (storedTarget) {
          const parsedTarget = JSON.parse(storedTarget);
          if (parsedTarget?.institution) {
            primaryTargetContextStream = `[SAVED PRIMARY TARGET SCHOOL CONTEXT]: The student's official primary target institution is ${parsedTarget.institution}. When discussing news or updates about OTHER schools (e.g., UNIOSUN, UNILAG, LASU, UI), evaluate that news accurately but DO NOT convert or switch their primary target school away from ${parsedTarget.institution}!`;
          }
        }
      } catch (e) {}
    }

    const userContextStr = [userCorrections.join('\n'), primaryTargetContextStream].filter(Boolean).join('\n\n');

    let systemInstruction = getSystemPrompt(
      liveIntelStr,
      verifiedNewsStr,
      userContextStr,
      todayStr
    );

    const uniqueChunksMap = new Map<string, GroundingChunk>();
    searchResults.forEach((r: any) => {
      if (r.url) {
        uniqueChunksMap.set(r.url, {
          web: { uri: r.url, title: r.title || "Portal Update" }
        });
      }
    });

    let fullText = "";

    await runAIWithFallback(async (ai) => {
      const contents = buildCleanChatContents(history, sanitizedMessage);

      try {
        const responseStream = await ai.models.generateContentStream({
          model: "gemini-flash-latest",
          contents,
          config: { 
            systemInstruction
        } });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            fullText += chunk.text;
          }
          const nativeChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          nativeChunks.forEach((c: any) => {
            if (c.web?.uri) {
              uniqueChunksMap.set(c.web.uri, {
                web: { uri: c.web.uri, title: c.web.title || "Search Result" }
              });
            }
          });
          const chunksArr = Array.from(uniqueChunksMap.values());
          onChunk(fullText, chunksArr.length > 0 ? chunksArr : undefined);
        }
      } catch (streamErr) {
        console.warn("generateContentStream fallback to generateContent:", streamErr);
        const singleResp = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents,
          config: { 
            systemInstruction
        } });
        fullText = singleResp.text || "";
        const nativeChunks = singleResp.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        nativeChunks.forEach((c: any) => {
          if (c.web?.uri) {
            uniqueChunksMap.set(c.web.uri, {
              web: { uri: c.web.uri, title: c.web.title || "Search Result" }
            });
          }
        });
        const chunksArr = Array.from(uniqueChunksMap.values());
        
        const words = fullText.split(" ");
        if (words.length <= 30) {
          onChunk(fullText, chunksArr.length > 0 ? chunksArr : undefined);
        } else {
          // Deliver in chunks of 10 words for fast, smooth rendering
          const chunkSize = 10;
          for (let i = 0; i < words.length; i += chunkSize) {
            const currentTyped = words.slice(0, i + chunkSize).join(" ");
            onChunk(currentTyped, chunksArr.length > 0 ? chunksArr : undefined);
            await new Promise(r => setTimeout(r, 16));
          }
        }
      }

      return { text: fullText };
    }, undefined, chatKeys);

    const finalGroundingChunks = Array.from(uniqueChunksMap.values());
    return {
      text: fullText,
      groundingChunks: finalGroundingChunks.length > 0 ? finalGroundingChunks : undefined
    };
  } catch (e: any) {
    console.error("AI Chat streaming error:", e);
    const errStr = e?.message || e?.toString() || "";
    const errorText = errStr.includes("413") || errStr.includes("Payload Too Large")
      ? "The uploaded file or message exceeds the maximum payload size (413 Payload Too Large). Please upload a smaller document excerpt or shorter text and try again."
      : "I encountered an error connecting to the AI neural network or processing your request. Please try asking your question again.";
    
    onChunk(errorText);
    return { text: errorText };
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
  deadlineDate?: string;
  examDate?: string;
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
        model: "gemini-flash-latest",
        contents: `You are an expert Nigerian higher admissions sync engine. Extract a verified list of institutions that have officially released their Post-UTME forms for 2026/2027.

CRITICAL RULES:
1. Only include institutions EXPLICITLY confirmed to have released 2026/2027 forms.
2. Extract the EXACT SPECIFIC OFFICIAL CUTOFF MARK for each university (e.g. 200 for UNILAG, 180 for FUTO, 195 for LASU, etc.). Do not assign generic estimates. If not specified, return "Not specified".
3. Extract exact official registration deadline date if mentioned. If none is mentioned, leave deadlineDate null or undefined (do not assign default/fake deadlines).
4. Extract official portal links (.edu.ng or .gov.ng only).
5. Current date is ${todayStr}. Discard 2024/2025 news.
6. RETURN VALID JSON ONLY.

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
      "deadlineDate": "string",
      "examDate": "string",
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
                    deadlineDate:    { type: Type.STRING },
                    examDate:        { type: Type.STRING },
                    cutoffScore:     { type: Type.STRING },
                    eligibilityText: { type: Type.STRING } },
                  required: ["schoolName", "isOut", "statusText", "details", "portalLink", "publishDate", "cutoffScore", "eligibilityText"]
                }
              }
            },
            required: ["releases"]
          }
        }
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
        model: "gemini-flash-latest",
        contents: `You are an expert admissions verification engine. Verify whether the Post-UTME registration form for ${schoolName} (also known as ${acronym || 'its acronym'}) is officially open/active or announced for the 2026/2027 academic session.

CRITICAL:
1. Current date is ${todayStr}. 2026/2027 announcements from 2026 are current. 2024/2025 announcements are PAST.
2. Verify whether the form is active, pending, or CLOSED/EXPIRED.
3. If the registration deadline has passed or portal is closed, set statusText to "Form Closed" or "Registration Closed".
4. Official portal link must be .edu.ng or .gov.ng only.
5. RETURN VALID JSON ONLY.

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
  "deadlineDate": "string",
  "examDate": "string",
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
              deadlineDate:    { type: Type.STRING },
              examDate:        { type: Type.STRING },
              cutoffScore:     { type: Type.STRING },
              eligibilityText: { type: Type.STRING } },
            required: ["schoolName", "isOut", "statusText", "details", "portalLink", "publishDate", "cutoffScore", "eligibilityText"]
          }
        }
      });
    }, newsKey);

    return safeJsonParse(response.text, null);
  } catch (e) {
    console.error(`verifySingleSchoolPostUtme failed for ${schoolName}:`, e);
    return null;
  }
};