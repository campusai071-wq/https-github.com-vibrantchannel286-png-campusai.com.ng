/**
 * cacheService — Multi-tier AI response cache
 * ---------------------------------------------------------------------------
 * L1: In-memory Map  (fastest — cleared on page reload)
 * L2: localStorage   (persists across sessions — 5 MB limit)
 * L3: Firestore      (shared across devices — ~24 h TTL)
 *
 * Read strategy:  L1 → L2 → L3 → miss
 * Write strategy: L1 + L2 (always) + L3 (if user is logged in)
 *
 * Cache keys are normalised lowercase-trimmed query strings.
 * Each entry carries a TTL timestamp so stale entries are auto-evicted.
 */

import { db } from '../services/firebaseConfig';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const L2_CACHE_TTL_MS  = 4 * 60 * 60 * 1000;   // 4 hours for local cache
const L3_CACHE_TTL_MS  = 24 * 60 * 60 * 1000;  // 24 hours for Firestore
const L2_MAX_ENTRIES   = 150;                    // evict oldest when exceeded
const L2_STORAGE_KEY   = 'campusai_l2_cache';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CacheEntry {
  answer: string;
  createdAt: number; // epoch ms
}

type L2Store = Record<string, CacheEntry>;

// ---------------------------------------------------------------------------
// L1 — In-memory
// ---------------------------------------------------------------------------
const l1: Map<string, CacheEntry> = new Map();

// ---------------------------------------------------------------------------
// L2 — localStorage helpers
// ---------------------------------------------------------------------------
function l2Load(): L2Store {
  try {
    const raw = localStorage.getItem(L2_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as L2Store) : {};
  } catch {
    return {};
  }
}

function l2Save(store: L2Store): void {
  try {
    localStorage.setItem(L2_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage full — evict half the entries and retry once
    try {
      const entries = Object.entries(store);
      const half = entries.slice(Math.floor(entries.length / 2));
      localStorage.setItem(L2_STORAGE_KEY, JSON.stringify(Object.fromEntries(half)));
    } catch {
      // give up — L2 write fails silently
    }
  }
}

function l2Get(key: string): string | null {
  const store = l2Load();
  const entry = store[key];
  if (!entry) return null;
  if (Date.now() - entry.createdAt > L2_CACHE_TTL_MS) {
    // Evict stale entry
    delete store[key];
    l2Save(store);
    return null;
  }
  return entry.answer;
}

function l2Set(key: string, answer: string): void {
  let store = l2Load();
  store[key] = { answer, createdAt: Date.now() };

  // Enforce max-entries cap by evicting oldest
  const entries = Object.entries(store);
  if (entries.length > L2_MAX_ENTRIES) {
    entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
    const evicted = entries.slice(entries.length - L2_MAX_ENTRIES);
    store = Object.fromEntries(evicted);
  }
  l2Save(store);
}

// ---------------------------------------------------------------------------
// L3 — Firestore helpers
// ---------------------------------------------------------------------------
async function l3Get(key: string): Promise<string | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'cache', key));
    if (!snap.exists()) return null;
    const data = snap.data() as { answer: string; createdAt: Timestamp };
    const ageMs = Date.now() - data.createdAt.toMillis();
    if (ageMs > L3_CACHE_TTL_MS) return null;
    return data.answer;
  } catch {
    return null;
  }
}

async function l3Set(key: string, answer: string): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'cache', key), {
      answer,
      createdAt: Timestamp.now(),
    });
  } catch {
    // Firestore write failure is non-fatal
  }
}

// ---------------------------------------------------------------------------
// Key normalisation
// ---------------------------------------------------------------------------
function normalise(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 512);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve a cached AI answer.
 * Checks L1 → L2 → L3 in order. Backfills faster tiers on L3 hit.
 */
export const getCachedAnswer = async (query: string): Promise<string | null> => {
  const key = normalise(query);

  // L1
  const mem = l1.get(key);
  if (mem && Date.now() - mem.createdAt < L2_CACHE_TTL_MS) return mem.answer;

  // L2
  const local = l2Get(key);
  if (local) {
    l1.set(key, { answer: local, createdAt: Date.now() }); // backfill L1
    return local;
  }

  // L3
  const remote = await l3Get(key);
  if (remote) {
    l1.set(key, { answer: remote, createdAt: Date.now() }); // backfill L1
    l2Set(key, remote);                                      // backfill L2
    return remote;
  }

  return null;
};

/**
 * Store an AI answer in all cache tiers.
 * L3 write is fire-and-forget (skipped for guest sessions to avoid Firestore rules errors).
 */
export const saveToCache = async (
  query: string,
  answer: string,
  persistToFirestore = true
): Promise<void> => {
  const key = normalise(query);
  const entry: CacheEntry = { answer, createdAt: Date.now() };

  l1.set(key, entry);    // L1
  l2Set(key, answer);    // L2

  if (persistToFirestore) {
    l3Set(key, answer);  // L3 — fire and forget
  }
};

/**
 * Purge all cache tiers (useful after a major knowledge base update).
 */
export const clearAllCache = async (): Promise<void> => {
  l1.clear();
  localStorage.removeItem(L2_STORAGE_KEY);
  // L3 (Firestore) is not bulk-deleted from the client — do that via admin console or a Cloud Function.
};
