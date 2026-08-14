import { NewsItem, BillboardAd, Comment, BroadcastEmail, ChatMessage, UserActivity, UniversityCategory, SchoolUgcPost } from '../types';
import { MOCK_NEWS, TICKER_HEADLINES } from '../constants';
import { db, firestoreDatabaseId, hasLocalFirebase } from './firebaseConfig';
export { db };
import { slugify, stringify, cleanObject, getApiUrl } from './utils';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc, Timestamp, where, updateDoc, getDoc, limit, writeBatch, getDocFromServer, increment, onSnapshot, startAfter } from "firebase/firestore";
import { handleFirestoreError, OperationType } from './firestoreUtils';
import axios from 'axios';
import { ADMIN_TOKEN } from '../lib/adminAuth';

const NEWS_KEY = 'campusai_published_news';

/**
 * Ticker Headlines Logic
 */
export const getTickerHeadlines = async (): Promise<string[]> => {
  if (!db) return TICKER_HEADLINES;
  try {
    const snap = await getDoc(doc(db, "settings", "ticker"));
    return snap.exists() ? snap.data().headlines : TICKER_HEADLINES;
  } catch (e) {
    console.warn("Could not fetch ticker headlines:", e);
    return TICKER_HEADLINES;
  }
};

export const saveTickerHeadlines = async (headlines: string[]) => {
  if (!db) return;
  try {
    await setDoc(doc(db, "settings", "ticker"), { headlines, updatedAt: Timestamp.now() });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, "settings/ticker");
  }
};

// In-memory cache variables for global sync metadata to prevent redundant reads
let cachedGlobalSyncMetadata: { lastSync: number } | null = null;
let lastMetadataFetchTime = 0;
const METADATA_CACHE_TTL_MS = 60000; // 60 seconds cache

export const getGlobalSyncMetadata = async (): Promise<{ lastSync: number }> => {
  if (!db) return { lastSync: 0 };
  
  const now = Date.now();
  if (cachedGlobalSyncMetadata && (now - lastMetadataFetchTime < METADATA_CACHE_TTL_MS)) {
    console.log("getGlobalSyncMetadata: Returning cached metadata.");
    return cachedGlobalSyncMetadata;
  }

  try {
    const snap = await getDoc(doc(db, "settings", "sync"));
    const data = snap.exists() ? { lastSync: snap.data().lastSync || 0 } : { lastSync: 0 };
    cachedGlobalSyncMetadata = data;
    lastMetadataFetchTime = now;
    return data;
  } catch (e) {
    return { lastSync: 0 };
  }
};

export const updateGlobalSyncMetadata = async (lastSync: number) => {
  if (!db) return;
  try {
    await setDoc(doc(db, "settings", "sync"), { lastSync, updatedAt: Timestamp.now() }, { merge: true });
    cachedGlobalSyncMetadata = { lastSync };
    lastMetadataFetchTime = Date.now();
  } catch (e) {
    console.error("Error updating sync metadata:", e);
  }
};


/**
 * News Persistence & Archival
 */
export const getNewsItemBySlug = async (slug: string): Promise<NewsItem | null> => {
  const cleanSlug = slug.split('?')[0].replace(/\/$/, '').toLowerCase();

  if (!db) {
    const mock = MOCK_NEWS.find(n => n.id === cleanSlug || (n.slug || slugify(n.title)) === cleanSlug) || null;
    if (mock) {
      return { ...mock, category: normalizeCategory(mock.category, mock.title) };
    }
    return null;
  }
  try {
    // 1. Check direct doc lookup by ID
    try {
      const docRef = doc(db, "news", cleanSlug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          category: normalizeCategory(data.category || 'National', data.title || '')
        } as NewsItem;
      }
    } catch (e) {}

    // 2. Query where slug == cleanSlug
    const newsRef = collection(db, "news");
    const q = query(newsRef, where("slug", "==", cleanSlug));
    let querySnapshot;
    try {
      querySnapshot = await getDocsFromServer(q);
    } catch (e) {
      querySnapshot = await getDocs(q);
    }
    if (!querySnapshot.empty) {
      let bestDoc = querySnapshot.docs[0];
      if (querySnapshot.docs.length > 1) {
        let bestTime = 0;
        querySnapshot.docs.forEach(docSnap => {
          const t = toMs(docSnap.data().updatedAt) || toMs(docSnap.data().createdAt) || 0;
          if (t > bestTime) {
            bestTime = t;
            bestDoc = docSnap;
          }
        });
      }
      const data = bestDoc.data();
      return {
        id: bestDoc.id,
        ...data,
        category: normalizeCategory(data.category || 'National', data.title || '')
      } as NewsItem;
    }

    // 3. Fallback: Search all cloud news by ID, slug, or title slugification
    const allNews = await getCloudNews(true);
    const cloudMatch = allNews.find(n => n.id === cleanSlug || n.slug === cleanSlug || slugify(n.title) === cleanSlug);
    if (cloudMatch) {
      return cloudMatch;
    }

    const mock = MOCK_NEWS.find(n => n.id === cleanSlug || (n.slug || slugify(n.title)) === cleanSlug) || null;
    if (mock) {
      return { ...mock, category: normalizeCategory(mock.category, mock.title) };
    }
    return null;
  } catch (e) {
    console.error("Error fetching news by slug:", e);
    const mock = MOCK_NEWS.find(n => n.id === cleanSlug || (n.slug || slugify(n.title)) === cleanSlug) || null;
    if (mock) {
      return { ...mock, category: normalizeCategory(mock.category, mock.title) };
    }
    return null;
  }
};

/**
 * Normalise any timestamp value (Firestore Timestamp, Date, ISO string, millis number) to milliseconds.
 * Returns 0 if the value cannot be parsed — never throws.
 */
function toMs(val: any): number {
  if (!val) return 0;
  if (typeof val?.toMillis === 'function') return val.toMillis();
  if (typeof val?.toDate  === 'function') return val.toDate().getTime();
  if (typeof val === 'object') {
    if ('seconds' in val) return val.seconds * 1000;
    if ('_seconds' in val) return val._seconds * 1000;
  }
  if (typeof val === 'number') return val;
  const t = new Date(val).getTime();
  return isNaN(t) ? 0 : t;
}

// In-memory cache variables for cloud news to prevent redundant reads
let cachedRawNews: NewsItem[] | null = null;
let lastRawFetchTime = 0;
const RAW_CACHE_TTL_MS = 60000; // 60 seconds cache

export const clearNewsCache = () => {
  cachedRawNews = null;
  lastRawFetchTime = 0;
};

// ─── Bookmark & Like Local Persistence Helpers ──────────────────────────────
export const BOOKMARKS_KEY = 'campusai_bookmarks';
export const BOOKMARKED_ARTICLES_KEY = 'campusai_bookmarked_articles';
export const NEWS_LIKES_KEY = 'campusai_news_likes';
export const NEWS_LIKE_COUNTS_KEY = 'campusai_news_like_counts';

export const readBookmarkIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); } catch { return []; }
};

export const readBookmarkedArticles = (): Record<string, NewsItem> => {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(BOOKMARKED_ARTICLES_KEY) || '{}'); } catch { return {}; }
};

export const toggleBookmarkArticle = (item: NewsItem): boolean => {
  if (!item || !item.id) return false;
  const currentIds = readBookmarkIds();
  const currentArticles = readBookmarkedArticles();
  const isBookmarked = currentIds.includes(item.id);

  let updatedIds: string[];
  let updatedArticles = { ...currentArticles };

  if (isBookmarked) {
    updatedIds = currentIds.filter(id => id !== item.id);
    delete updatedArticles[item.id];
  } else {
    updatedIds = [item.id, ...currentIds];
    updatedArticles[item.id] = item;
  }

  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedIds));
    localStorage.setItem(BOOKMARKED_ARTICLES_KEY, JSON.stringify(updatedArticles));
    window.dispatchEvent(new Event('campusai_bookmarks_updated'));
  } catch (e) {
    console.error("toggleBookmarkArticle error:", e);
  }

  return !isBookmarked;
};

export const readLikedArticleIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(NEWS_LIKES_KEY) || '[]'); } catch { return []; }
};

export const readLikeCountsMap = (): Record<string, number> => {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(NEWS_LIKE_COUNTS_KEY) || '{}'); } catch { return {}; }
};

export const getBaseLikesCount = (item: NewsItem): number => {
  if (item && typeof item.likes === 'number' && item.likes >= 0) return item.likes;
  return 0;
};

export const getArticleLikesCount = (item: NewsItem): number => {
  if (!item || !item.id) return 0;
  const likedIds = readLikedArticleIds();
  const userHasLiked = likedIds.includes(item.id);
  const base = getBaseLikesCount(item);
  const countsMap = readLikeCountsMap();

  if (countsMap[item.id] !== undefined) {
    const cachedVal = countsMap[item.id];
    // Sanity check: If cachedVal in countsMap is a legacy seeded mock count (e.g. > 5) while base is 0 and user hasn't explicitly liked it, purge it!
    if (cachedVal > 5 && base === 0 && !userHasLiked) {
      delete countsMap[item.id];
      try { localStorage.setItem(NEWS_LIKE_COUNTS_KEY, JSON.stringify(countsMap)); } catch {}
      return 0;
    }
    return cachedVal;
  }

  return userHasLiked ? base + 1 : base;
};

export const toggleArticleLike = (item: NewsItem): { isLiked: boolean; newCount: number } => {
  if (!item || !item.id) return { isLiked: false, newCount: 0 };
  const likedIds = readLikedArticleIds();
  const countsMap = readLikeCountsMap();
  const currentlyLiked = likedIds.includes(item.id);

  const currentCount = getArticleLikesCount(item);
  const newIsLiked = !currentlyLiked;
  const newCount = newIsLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

  const updatedLikedIds = newIsLiked
    ? [...likedIds, item.id]
    : likedIds.filter(id => id !== item.id);

  countsMap[item.id] = newCount;

  try {
    localStorage.setItem(NEWS_LIKES_KEY, JSON.stringify(updatedLikedIds));
    localStorage.setItem(NEWS_LIKE_COUNTS_KEY, JSON.stringify(countsMap));
    window.dispatchEvent(new Event('campusai_likes_updated'));
  } catch (e) {
    console.error("toggleArticleLike storage error:", e);
  }

  if (db) {
    try {
      const dRef = doc(db, "news", item.id);
      updateDoc(dRef, { likes: newCount }).catch(() => {});
    } catch (e) {}
  }

  return { isLiked: newIsLiked, newCount };
};

export const getNewsSortTimestamp = (item: NewsItem, now: number = Date.now()): number => {
  if (!item) return 0;

  const dateStr = item.date ? item.date.trim() : "";
  const isBracketed = dateStr.includes("[") || dateStr.includes("]");
  let pubMs = (!isBracketed && dateStr) ? toMs(dateStr) : 0;

  let createdMs = toMs(item.createdAt);
  let updatedMs = toMs(item.updatedAt);
  let archivedMs = toMs(item.archivedAt);

  const maxAllowed = now + 60000;
  if (pubMs > maxAllowed) pubMs = now;
  if (createdMs > maxAllowed) createdMs = now;
  if (updatedMs > maxAllowed) updatedMs = now;
  if (archivedMs > maxAllowed) archivedMs = now;

  // Article's true publication date comes first
  if (pubMs > 0) {
    return pubMs;
  }

  return createdMs || archivedMs || updatedMs || 0;
};

export const getSyncTime = (item: NewsItem, now: number = Date.now()): number => {
  return getNewsSortTimestamp(item, now);
};

export const getEffectiveDateMs = (item: NewsItem, now: number = Date.now()): number => {
  return getNewsSortTimestamp(item, now);
};

export const sortNewsBySyncAndDate = (a: NewsItem, b: NewsItem, now: number = Date.now()): number => {
  if (!a || !b) return 0;
  // 1. Live news (isLive: true) always before mock news (isLive: false/undefined)
  const aLive = !!a.isLive;
  const bLive = !!b.isLive;
  if (aLive !== bLive) return aLive ? -1 : 1;

  // 2. Primary: Effective Publication/Creation Time (newest first)
  const timeA = getNewsSortTimestamp(a, now);
  const timeB = getNewsSortTimestamp(b, now);
  if (timeB !== timeA) return timeB - timeA;

  // 3. Secondary: Use fallback timestamps (createdAt, archivedAt, updatedAt) to break ties for same-day news
  const fallbackA = toMs(a.createdAt) || toMs(a.archivedAt) || toMs(a.updatedAt) || 0;
  const fallbackB = toMs(b.createdAt) || toMs(b.archivedAt) || toMs(b.updatedAt) || 0;
  if (fallbackB !== fallbackA) return fallbackB - fallbackA;

  return 0;
};

export const normalizeCategory = (cat: string, title: string = ""): UniversityCategory => {
  const clean = (cat || "").trim().toLowerCase();
  const titleLower = (title || "").toLowerCase();
  
  if (clean.includes("jamb") || clean.includes("caps") || clean.includes("utme")) return "JAMB";
  if (clean.includes("waec") || clean.includes("ssce") || clean.includes("gce")) return "National";
  if (clean.includes("scholarship") || clean.includes("bursary") || clean.includes("grant")) return "Scholarships";
  if (clean.includes("job") || clean.includes("recruit") || clean.includes("vacancy") || clean.includes("career")) return "Jobs";
  if (clean.includes("nysc") || clean.includes("corps") || clean.includes("camp")) return "NYSC";
  if (clean.includes("poly") || clean.includes("polytechnic") || clean.includes("yabatech")) return "Polytechnic";
  if (clean.includes("coe") || clean.includes("college of education")) return "COE";
  if (clean.includes("state")) return "State";
  if (clean.includes("private") || clean.includes("covenant") || clean.includes("babcock")) return "Private";
  if (clean.includes("federal") || clean.includes("asuu") || clean.includes("nuc") || clean.includes("strike")) return "Federal";
  
  // Fallback mappings based on keywords
  if (titleLower.includes("jamb") || titleLower.includes("caps")) return "JAMB";
  if (titleLower.includes("waec") || titleLower.includes("ssce")) return "National";
  if (titleLower.includes("scholarship") || titleLower.includes("bursary")) return "Scholarships";
  if (titleLower.includes("nysc") || titleLower.includes("corps")) return "NYSC";
  if (titleLower.includes("polytechnic")) return "Polytechnic";
  if (titleLower.includes("college of education")) return "COE";
  if (titleLower.includes("strike") || titleLower.includes("asuu") || titleLower.includes("federal")) return "Federal";
  
  return "National";
};

export const getStableNewsKey = (title: string = "", category: string = ""): string => {
  const titleLower = (title || "").trim().toLowerCase();
  
  // 1. Identify Entity
  let entity = "";
  if (titleLower.includes("unilag") || titleLower.includes("university of lagos")) entity = "unilag";
  else if (titleLower.includes("uniport")) entity = "uniport";
  else if (titleLower.includes("fupre")) entity = "fupre";
  else if (titleLower.includes("yabatech") || titleLower.includes("yaba college")) entity = "yabatech";
  else if (titleLower.includes("futa")) entity = "futa";
  else if (titleLower.includes("oau") || titleLower.includes("obafemi awolowo")) entity = "oau";
  else if (titleLower.includes("uniben") || titleLower.includes("university of benin")) entity = "uniben";
  else if (titleLower.includes("abu") || titleLower.includes("ahmadu bello")) entity = "abu";
  else if (titleLower.includes("buk") || titleLower.includes("bayero")) entity = "buk";
  else if (titleLower.includes("lasu") || titleLower.includes("lagos state")) entity = "lasu";
  else if (titleLower.includes("fuoye") || titleLower.includes("oye-ekiti") || titleLower.includes("oye ekiti")) entity = "fuoye";
  else if (titleLower.includes("unizik") || titleLower.includes("nnamdi azikiwe")) entity = "unizik";
  else if (titleLower.includes("funaab")) entity = "funaab";
  else if (titleLower.includes("delsu")) entity = "delsu";
  else if (titleLower.includes("eksu")) entity = "eksu";
  else if (titleLower.includes("kwasu")) entity = "kwasu";
  else if (titleLower.includes("mapoly")) entity = "mapoly";
  else if (titleLower.includes("auchi")) entity = "auchi";
  else if (titleLower.includes("unilorin") || titleLower.includes("ilorin")) entity = "unilorin";
  else if (titleLower.includes("unn") || titleLower.includes("university of nigeria")) entity = "unn";
  else if (titleLower.includes("uniuyo") || titleLower.includes("university of uyo")) entity = "uniuyo";
  else if (titleLower.includes("unical") || titleLower.includes("university of calabar")) entity = "unical";
  else if (titleLower.includes("uniabuja") || titleLower.includes("university of abuja")) entity = "uniabuja";
  else if (titleLower.includes("lautech")) entity = "lautech";
  else if (titleLower.includes("futo")) entity = "futo";
  else if (titleLower.includes("jamb") || titleLower.includes("caps")) entity = "jamb";
  else if (titleLower.includes("asuu") || titleLower.includes("strike") || titleLower.includes("strikes")) entity = "asuu";
  else if (titleLower.includes("nysc")) entity = "nysc";
  else if (titleLower.includes("nelfund") || titleLower.includes("student loan")) entity = "nelfund";
  else if (titleLower.includes("nuc")) entity = "nuc";
  else if (titleLower.includes("waec") || titleLower.includes("neco") || titleLower.includes("nabteb")) entity = "waec";
  else if (titleLower.includes("ui") || titleLower.includes("university of ibadan")) entity = "ui";

  // 2. Identify Topic
  let topic = "";
  if (titleLower.includes("post-utme") || titleLower.includes("postutme") || titleLower.includes("screening") || titleLower.includes("register") || titleLower.includes("registration")) {
    topic = "post-utme";
  } else if (titleLower.includes("admission list") || titleLower.includes("admission offer") || titleLower.includes("shortlist") || titleLower.includes("merit list")) {
    topic = "admission-list";
  } else if (titleLower.includes("cutoff") || titleLower.includes("cut-off") || titleLower.includes("cut off") || titleLower.includes("threshold")) {
    topic = "cutoff-marks";
  } else if (titleLower.includes("strike") || titleLower.includes("industrial action") || titleLower.includes("asuu")) {
    topic = "strike";
  } else if (titleLower.includes("scholarship") || titleLower.includes("bursary") || titleLower.includes("grant")) {
    topic = "scholarship";
  } else if (titleLower.includes("job") || titleLower.includes("recruit") || titleLower.includes("vacancy") || titleLower.includes("hiring")) {
    topic = "jobs";
  } else if (titleLower.includes("senate list") || titleLower.includes("mobilize") || titleLower.includes("mobilization") || titleLower.includes("orientation camp")) {
    topic = "nysc";
  } else if (titleLower.includes("result") || titleLower.includes("results") || titleLower.includes("score") || titleLower.includes("scores")) {
    topic = "exam-results";
  }

  if (entity && topic) {
    const titleSlug = slugify(title);
    // Keep entity-topic prefix for organization, but append title slug for 100% uniqueness per article
    return `${entity}-${topic}-${titleSlug}`;
  }
  
  return slugify(title);
};

export const getCloudNews = async (includeFuture: boolean = false, includeJunk: boolean = false, category?: string, lastCreatedAt?: any, limitOverride?: number): Promise<NewsItem[]> => {
  const now = Date.now();
  const effectiveLimit = limitOverride || 250;
  const isCacheValid = cachedRawNews && (now - lastRawFetchTime < RAW_CACHE_TTL_MS);
  const cachedLiveCount = cachedRawNews ? cachedRawNews.filter(n => n.isLive).length : 0;
  const needsMoreThanCached = cachedRawNews && cachedLiveCount < Math.min(effectiveLimit, 50);

  // Bypass cache if paginating (lastCreatedAt is present) or if we need more articles than cached
  if (cachedRawNews && isCacheValid && !needsMoreThanCached && !lastCreatedAt) {
    console.log("getCloudNews: Returning cached news list.");
    const processed = filterAndSortNews(cachedRawNews, includeFuture, now, includeJunk);
    return category ? processed.filter(n => n.category === category) : processed;
  }

  // Direct client-side Firestore fetch using standard Firebase SDK
  if (db) {
    try {
      const fetchLimit = effectiveLimit;
      console.log(`getCloudNews: Querying Firestore 'news' collection from server (limit: ${fetchLimit})...`);
      const newsRef = collection(db, "news");
      const constraints: any[] = [orderBy('createdAt', 'desc'), limit(fetchLimit)];
      
      if (lastCreatedAt !== undefined && lastCreatedAt !== null) {
        try {
          constraints.push(startAfter(lastCreatedAt));
        } catch (err) {
          console.warn("getCloudNews: Invalid startAfter cursor, ignoring cursor:", err);
        }
      }
      
      const q = query(newsRef, ...constraints);

      let querySnapshot;
      try {
        // ALWAYS try getDocsFromServer FIRST to avoid stale local IndexedDB snapshots in browser
        querySnapshot = await getDocsFromServer(q);
        console.log(`getCloudNews: Firestore server fetch successful. Found ${querySnapshot.size} documents.`);
      } catch (fetchError: any) {
        console.warn("getCloudNews: Server fetch failed, trying local cache snapshot fallback...", fetchError?.message || fetchError);
        querySnapshot = await getDocs(q);
      }

      const cloudNews: NewsItem[] = [];
      querySnapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        cloudNews.push({
          id: docSnap.id,
          ...data,
          isLive: data.isLive ?? true,
          category: normalizeCategory(data.category || 'National', data.title || '')
        });
      });

      console.log(`getCloudNews: Successfully retrieved ${cloudNews.length} items from Firestore.`);

      if (cloudNews.length > 0) {
        const localPublished = getPublishedNews();
        const bookmarkedArticles = Object.values(readBookmarkedArticles());
        
        // Filter out mock news items that share title, slug, or ID with cloud articles
        const uniqueMockNews = MOCK_NEWS.filter(m => 
          !cloudNews.some((c: any) => 
            c.id === m.id || 
            (c.slug && m.slug && c.slug.toLowerCase() === m.slug.toLowerCase()) ||
            (c.title && m.title && c.title.trim().toLowerCase() === m.title.trim().toLowerCase())
          )
        );

        // Merge local posts, bookmarks, cloud news, and non-duplicate mock news
        const mergedNews = lastCreatedAt ? cloudNews : [...localPublished, ...bookmarkedArticles, ...cloudNews, ...uniqueMockNews];

        if (!lastCreatedAt) {
          cachedRawNews = mergedNews;
          lastRawFetchTime = now;
        }

        const processed = filterAndSortNews(mergedNews, includeFuture, now, includeJunk);
        const filtered = category ? processed.filter(n => n.category === category) : processed;
        return filtered;
      }
    } catch (e: any) {
      console.error("getCloudNews: Direct Firestore fetch failed, falling back to proxy/mock:", e);
    }
  }

  // Proxy Fallback if direct db failed
  const apiUrl = getApiUrl('/api/fstore-query');
  try {
    console.log(`getCloudNews: Attempting proxy fallback fetch (limit: ${effectiveLimit})...`);
    const fetchLimit = effectiveLimit;
    const payload: any = { 
        collectionName: 'news',
        orderByField: 'createdAt',
        orderDirection: 'desc',
        limitCount: fetchLimit
    };
    if (lastCreatedAt) {
      payload.startAfterValue = lastCreatedAt;
    }
    console.log("DEBUG: Proxy fetch URL:", apiUrl);
    const res = await axios.post(apiUrl, payload);
    if (res.data.success && res.data.data && res.data.data.length > 0) {
      const cloudNews = res.data.data.map((item: any) => ({
        ...item,
        isLive: item.isLive ?? true,
        category: normalizeCategory(item.category || 'National', item.title || '')
      }));
      const localPublished = getPublishedNews();
      const bookmarkedArticles = Object.values(readBookmarkedArticles());
      const uniqueMockNews = MOCK_NEWS.filter(m => 
        !cloudNews.some((c: any) => 
          c.id === m.id || 
          (c.slug && m.slug && c.slug.toLowerCase() === m.slug.toLowerCase()) ||
          (c.title && m.title && c.title.trim().toLowerCase() === m.title.trim().toLowerCase())
        )
      );
      const mergedNews = lastCreatedAt ? cloudNews : [...localPublished, ...bookmarkedArticles, ...cloudNews, ...uniqueMockNews];
      
      if (!lastCreatedAt) {
        cachedRawNews = mergedNews;
        lastRawFetchTime = now;
      }

      const processed = filterAndSortNews(mergedNews, includeFuture, now, includeJunk);
      return category ? processed.filter(n => n.category === category) : processed;
    }
  } catch (e: any) {
    console.error("Proxy fetch failed for URL:", apiUrl, e.message, e.response?.status, e.response?.data);
  }

  // Final fallback to MOCK_NEWS if DB/Proxy are completely offline
  console.warn("getCloudNews: All cloud sources failed. Returning MOCK_NEWS.");
  const localPublished = getPublishedNews();
  const bookmarkedArticles = Object.values(readBookmarkedArticles());
  const fallbackNews = [...localPublished, ...bookmarkedArticles, ...MOCK_NEWS];
  const mockProcessed = filterAndSortNews(fallbackNews, includeFuture, now, includeJunk);
  return category ? mockProcessed.filter(n => n.category === category) : mockProcessed;
};

let cachedNewsCount: number | null = null;
let lastCountFetchTime = 0;
const COUNT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export const getCloudNewsCount = async (): Promise<number> => {
  const now = Date.now();
  if (cachedNewsCount !== null && (now - lastCountFetchTime < COUNT_CACHE_TTL_MS)) {
    return cachedNewsCount;
  }

  if (db) {
    try {
      const { getCountFromServer, collection } = await import("firebase/firestore");
      const snap = await getCountFromServer(collection(db, "news"));
      const count = snap.data().count;
      cachedNewsCount = count;
      lastCountFetchTime = now;
      return count;
    } catch (e) {
      console.warn("Client count fetch failed, trying proxy fallback:", e);
    }
  }

  try {
    const res = await axios.post(getApiUrl('/api/fstore-count'), { collectionName: 'news' });
    if (res.data.success) {
      cachedNewsCount = res.data.count;
      lastCountFetchTime = now;
      return res.data.count;
    }
  } catch (e) {
    console.warn("Proxy count fetch failed:", e);
  }

  return MOCK_NEWS.length;
};

const filterAndSortNews = (items: NewsItem[], includeFuture: boolean, now: number, includeJunk: boolean = false): NewsItem[] => {
  let bookmarkedIds: string[] = readBookmarkIds();

  const liveItemsCount = items.filter(item => item.isLive).length;
  console.log(`[DEBUG filterAndSortNews] Input count: ${items.length}, Live count: ${liveItemsCount}`);

  const sorted = items
    .filter(item => {
      if (!item || !item.id || !item.title) {
        return false;
      }

      // If user has explicitly bookmarked this item, let it bypass all filters (junk & future)
      if (bookmarkedIds.includes(item.id)) {
        return true;
      }

      // If we are showing junk/raw news, bypass subsequent filters
      if (includeJunk) {
        return true;
      }

      // Junk filtering
      const titleLower = (item.title || "").toLowerCase();
      const excerptLower = (item.excerpt || "").toLowerCase();
      const contentLower = (item.fullContent || "").toLowerCase();

      if (titleLower.includes("raw data") || titleLower.includes("curation failed") || titleLower.includes("dictionary.com") || titleLower.includes("definition & meaning")) {
        if (item.isLive) console.log(`[DEBUG filterAndSortNews] Rejected live item as junk (title): ${item.title}`);
        return false;
      }
      if (excerptLower.includes("curation failed") || contentLower.includes("curation failed")) {
        if (item.isLive) console.log(`[DEBUG filterAndSortNews] Rejected live item as junk (content/excerpt): ${item.title}`);
        return false;
      }

      return true;
    })
    .sort((a, b) => sortNewsBySyncAndDate(a, b, now));

  // Deduplicate by ID, slug, and exact normalized title to prevent identical duplicates without dropping user articles
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const seenSlugs = new Set<string>();
  const deduplicated: NewsItem[] = [];

  for (const item of sorted) {
    if (!item) continue;
    const normTitle = (item.title || "").trim().toLowerCase().replace(/\s+/g, ' ');
    const slug = item.slug ? item.slug.trim().toLowerCase() : '';
    
    // Check if we already have this exact ID, exact slug, or identical title
    if (seenIds.has(item.id) || (slug && seenSlugs.has(slug)) || (normTitle && seenTitles.has(normTitle))) {
      if (item.isLive) {
        console.log(`[DEBUG filterAndSortNews] Dropped exact duplicate item: ${item.title}`);
      }
      continue;
    }
    
    seenIds.add(item.id);
    if (normTitle) seenTitles.add(normTitle);
    if (slug) seenSlugs.add(slug);
    deduplicated.push(item);
  }

  console.log(`[DEBUG filterAndSortNews] Output count: ${deduplicated.length}, Live count in output: ${deduplicated.filter(item => item.isLive).length}`);
  return deduplicated;
};

export const archiveNewsItems = async (items: NewsItem[], defaultLiveStatus: boolean = false) => {
  if (!db) {
    console.error("archiveNewsItems: db is not initialized.");
    return;
  }
  if (!items || items.length === 0) return;

  const validItems = items.filter(item => {
    if (!item || !item.title) return false;
    const titleLower = (item.title || "").toLowerCase();
    const excerptLower = (item.excerpt || "").toLowerCase();
    const contentLower = (item.fullContent || "").toLowerCase();

    if (titleLower.includes("raw data") || titleLower.includes("curation failed") || titleLower.includes("dictionary.com")) {
      return false;
    }
    if (excerptLower.includes("curation failed") || contentLower.includes("curation failed")) {
      return false;
    }
    if (titleLower.includes("definition & meaning") || titleLower.includes("dictionary.com")) {
      return false;
    }
    return true;
  });

  if (validItems.length === 0) {
    console.log("archiveNewsItems: No valid news items after junk filtering.");
    return;
  }

  console.log(`archiveNewsItems: Processing ${validItems.length} valid items for archival...`);
  try {
    const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "Africa/Lagos" });

    const refsAndData = validItems.map((item, index) => {
      const finalCategory = normalizeCategory(item.category, item.title);
      const stableKey = getStableNewsKey(item.title, finalCategory);
      const docId = stableKey.startsWith("news-") ? stableKey : `news-${stableKey}`;
      const ref = doc(collection(db, "news"), docId);
      return { item, ref, docId, finalCategory, index };
    });

    const existingSnaps = await Promise.all(
      refsAndData.map(({ ref }) => getDoc(ref))
    );

    const batch = writeBatch(db);

    refsAndData.forEach(({ item, ref, docId, finalCategory, index }, i) => {
      const slug = item.slug || slugify(item.title);

      let finalDate = item.date ? item.date.trim() : "";
      if (!finalDate || finalDate.includes("[") || finalDate.includes("]") || finalDate.includes("Insert") || toMs(finalDate) === 0) {
        finalDate = todayStr;
      }

      const nowMs = Date.now() - (index * 1000);
      const nowTimestamp = Timestamp.fromMillis(nowMs);

      const articleDateMs = toMs(finalDate) || nowMs;
      const articleTimestamp = Timestamp.fromMillis(articleDateMs);

      const existingSnap = existingSnaps[i];
      let preservedCreatedAt = existingSnap.exists()
        ? (existingSnap.data()?.createdAt || nowTimestamp)
        : nowTimestamp;

      if (preservedCreatedAt && toMs(preservedCreatedAt) > Date.now() + 60000) {
        preservedCreatedAt = nowTimestamp;
      }

      // If item already exists, respect its isLive status unless it's new.
      // If it's new and from sync, default to false.
      const preservedLiveStatus = existingSnap.exists()
        ? (existingSnap.data()?.isLive ?? defaultLiveStatus)
        : defaultLiveStatus;

      batch.set(ref, {
        ...item,
        id: docId,
        date: finalDate,
        category: finalCategory,
        slug,
        isLive: preservedLiveStatus,
        archivedAt: nowTimestamp,
        createdAt: preservedCreatedAt,
        updatedAt: Timestamp.now()
      });
    });

    await batch.commit();
    console.log(`archiveNewsItems: Batch commit successful for ${validItems.length} items.`);
    clearNewsCache();
  } catch (e) {
    console.error("News Archival Error (detailed):", e);
    throw e;
  }
};

export const getPublishedNews = (): NewsItem[] => {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(NEWS_KEY) : null;
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const publishNewsUpdate = async (news: Omit<NewsItem, 'id'>) => {
  const token = ADMIN_TOKEN;
  const slug = news.slug || slugify(news.title);
  const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "Africa/Lagos" });
  let finalDate = news.date ? news.date.trim() : "";
  if (!finalDate || finalDate.includes("[") || finalDate.includes("]") || finalDate.includes("Insert") || toMs(finalDate) === 0) {
    finalDate = todayStr;
  }

  let publishedId: string | null = null;

  try {
    const response = await axios.post(getApiUrl('/api/admin/news/action'), {
      action: 'publish',
      news,
      token
    });
    if (response.data && response.data.success) {
      publishedId = response.data.id;
    }
  } catch (err) {
    console.warn("publishNewsUpdate: Backend admin API call failed, falling back to direct client write:", err);
  }

  if (!publishedId && db) {
    try {
      const docRef = await addDoc(collection(db, "news"), {
        ...news,
        date: finalDate,
        slug,
        isLive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      publishedId = docRef.id;
    } catch (e) {
      console.warn("publishNewsUpdate direct addDoc failed:", e);
    }
  }

  if (!publishedId) {
    publishedId = Date.now().toString();
  }

  const publishedItem: NewsItem = {
    ...news,
    id: publishedId,
    date: finalDate,
    slug,
    isLive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const current = getPublishedNews();
    const updated = [publishedItem, ...current.filter(n => n.id !== publishedId && n.slug !== slug)];
    localStorage.setItem(NEWS_KEY, stringify(updated));
  } catch (e) {}

  clearNewsCache();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('campusai_news_updated'));
  }

  return publishedId;
};

export const deleteNewsUpdate = async (id: string) => {
  const token = ADMIN_TOKEN;
  try {
    const response = await axios.post(getApiUrl('/api/admin/news/action'), {
      action: 'delete',
      id,
      token
    });
    if (response.data && response.data.success) {
      clearNewsCache();
      const current = getPublishedNews();
      localStorage.setItem(NEWS_KEY, stringify(current.filter(n => n.id !== id)));
      return;
    }
  } catch (err) {
    console.warn("deleteNewsUpdate: Backend admin API call failed, falling back to direct client delete:", err);
  }

  if (db) {
    await deleteDoc(doc(db, "news", id));
    clearNewsCache();
  }
  const current = getPublishedNews();
  localStorage.setItem(NEWS_KEY, stringify(current.filter(n => n.id !== id)));
};

export const purgeAllNews = async () => {
  const token = ADMIN_TOKEN;
  try {
    const response = await axios.post(getApiUrl('/api/admin/news/action'), {
      action: 'purge',
      token
    });
    if (response.data && response.data.success) {
      clearNewsCache();
      localStorage.removeItem(NEWS_KEY);
      return;
    }
  } catch (err) {
    console.warn("purgeAllNews: Backend admin API call failed, falling back to direct client purge:", err);
  }

  if (db) {
    const newsRef = collection(db, "news");
    const snap = await getDocs(query(newsRef, limit(1000)));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    clearNewsCache();
  }
  localStorage.removeItem(NEWS_KEY);
};

export const updateNewsItem = async (id: string, updates: Partial<NewsItem>) => {
  const token = ADMIN_TOKEN;
  const syncLocal = () => {
    clearNewsCache();

    // 1. Update in-memory MOCK_NEWS array
    for (let i = 0; i < MOCK_NEWS.length; i++) {
      if (MOCK_NEWS[i].id === id || MOCK_NEWS[i].slug === id) {
        MOCK_NEWS[i] = { ...MOCK_NEWS[i], ...updates };
      }
    }

    // 2. Update localStorage published news
    const current = getPublishedNews();
    if (current && current.length > 0) {
      const updated = current.map(n => (n.id === id || n.slug === id) ? { ...n, ...updates } : n);
      localStorage.setItem(NEWS_KEY, stringify(updated));
    } else {
      // If local storage was empty, save this item into local storage
      const existingItem = MOCK_NEWS.find(n => n.id === id || n.slug === id);
      if (existingItem) {
        localStorage.setItem(NEWS_KEY, stringify([{ ...existingItem, ...updates }]));
      }
    }
  };

  try {
    const response = await axios.post(getApiUrl('/api/admin/news/action'), {
      action: 'update',
      id,
      updates,
      token
    });
    if (response.data && response.data.success) {
      syncLocal();
      return;
    }
  } catch (err) {
    console.warn("updateNewsItem: Backend admin API call failed, falling back to direct client update:", err);
  }

  if (!db) {
    syncLocal();
    return;
  }

  try {
    const newsRef = doc(db, "news", id);
    await setDoc(newsRef, { ...updates, updatedAt: Timestamp.now() }, { merge: true });
    syncLocal();
  } catch (e) {
    console.warn(`Direct update failed for ID ${id}, trying slug-based update...`, e);
    try {
      const newsCollectionRef = collection(db, "news");
      const q = query(newsCollectionRef, where("slug", "==", id), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        await setDoc(querySnapshot.docs[0].ref, { ...updates, updatedAt: Timestamp.now() }, { merge: true });
        syncLocal();
      } else {
        syncLocal();
      }
    } catch (slugErr) {
      console.error("Error updating news item:", slugErr);
      syncLocal();
    }
  }
};

export const updateNewsArticleContent = async (id: string, fullContent: string) => {
  const token = ADMIN_TOKEN;
  const syncLocal = () => {
    clearNewsCache();
    const current = getPublishedNews();
    if (current && current.length > 0) {
      const updated = current.map(n => (n.id === id || n.slug === id) ? { ...n, fullContent } : n);
      localStorage.setItem(NEWS_KEY, stringify(updated));
    }
  };

  try {
    const response = await axios.post(getApiUrl('/api/admin/news/action'), {
      action: 'update',
      id,
      updates: { fullContent },
      token
    });
    if (response.data && response.data.success) {
      syncLocal();
      return;
    }
  } catch (err) {
    console.warn("updateNewsArticleContent: Backend admin API call failed, falling back to direct client update:", err);
  }

  if (!db) {
    syncLocal();
    return;
  }

  try {
    const newsRef = doc(db, "news", id);
    await updateDoc(newsRef, { fullContent, updatedAt: Timestamp.now() });
    syncLocal();
  } catch (e: any) {
    console.warn(`Direct update failed for ID ${id}, trying slug-based update...`, e);
    
    try {
      // Try to find the document by slug if ID update failed
      const newsRef = collection(db, "news");
      const q = query(newsRef, where("slug", "==", id), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { fullContent, updatedAt: Timestamp.now() });
        syncLocal();
        console.log(`Slug-based update successful for slug: ${id}`);
        return;
      }
    } catch (slugError) {
      console.error("Error during slug-based update:", slugError);
    }
    
    console.error("Error updating article content:", e);
    throw e;
  }
};

export const enhanceNewsArticleContent = async (id: string): Promise<string> => {
  const token = ADMIN_TOKEN;
  const response = await axios.post(getApiUrl('/api/admin/news/action'), {
    action: 'enhance',
    id,
    token
  });
  if (response.data && response.data.success) {
    clearNewsCache();
    return response.data.fullContent;
  }
  throw new Error(response.data?.error || "Failed to enhance article");
};

/**
 * Global Forum / Comments Logic
 */
export const fetchNewsComments = async (newsId: string): Promise<Comment[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, "comments"), where("newsId", "==", newsId));
    const snapshot = await getDocs(q);
    const comments: Comment[] = [];
    snapshot.forEach((docSnap: any) => {
      comments.push({ id: docSnap.id, ...docSnap.data() });
    });
    return comments.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (e) {
    console.error("Comment Sync Error:", e);
    return [];
  }
};

export const postNewsComment = async (comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment | null> => {
  if (!db) return null;
  try {
    const commentData = { ...comment, createdAt: Timestamp.now() };
    const docRef = await addDoc(collection(db, "comments"), commentData);
    return { id: docRef.id, ...commentData };
  } catch (e) {
    console.error("Comment Post Error:", e);
    return null;
  }
};

export const deleteNewsComment = async (commentId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "comments", commentId));
    return true;
  } catch (e) {
    console.error("Comment Deletion Error:", e);
    return false;
  }
};

/**
 * Subscriber Sync
 */
export const subscribeEmail = async (email: string) => {
  if (!db) return true;
  try {
    await setDoc(doc(db, "subscribers", email.replace(/\./g, '_')), {
      email,
      subscribedAt: Timestamp.now()
    });
    return true;
  } catch (e) { return false; }
};

export const getSubscribers = async () => {
  if (!db) return [];
  try {
    const snapshot = await getDocs(collection(db, "subscribers"));
    const subs: any[] = [];
    snapshot.forEach((docSnap: any) => subs.push({ id: docSnap.id, ...docSnap.data() }));
    return subs;
  } catch (e) { return []; }
};

/**
 * Knowledge Fragments (for AI "Learning")
 */
export const saveKnowledgeFragment = async (key: string, value: string) => {
  if (!db) return;
  try {
    await setDoc(doc(collection(db, "knowledge_fragments"), key), {
      key,
      value,
      learnedAt: Timestamp.now()
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, "knowledge_fragments/" + key);
  }
};

let cachedKnowledgeFragments: any[] | null = null;
let lastKnowledgeFetchTime = 0;
const KNOWLEDGE_CACHE_TTL_MS = 3 * 60 * 1000;

export const getAllKnowledgeFragments = async () => {
  if (cachedKnowledgeFragments && Date.now() - lastKnowledgeFetchTime < KNOWLEDGE_CACHE_TTL_MS) {
    return cachedKnowledgeFragments;
  }
  if (!db) return cachedKnowledgeFragments || [];
  try {
    const snapshot = await getDocs(collection(db, "knowledge_fragments"));
    cachedKnowledgeFragments = snapshot.docs.map(d => d.data());
    lastKnowledgeFetchTime = Date.now();
    return cachedKnowledgeFragments;
  } catch (e) {
    console.error("Error fetching knowledge fragments:", e);
    return cachedKnowledgeFragments || [];
  }
};

/**
 * Institutional Data Cache
 */
export const getGlobalScoringSystem = async (slug: string) => {
  if (!db) return null;
  const snap = await getDoc(doc(db, "institutional_logic", slug));
  return snap.exists() ? snap.data() : null;
};

export const saveGlobalScoringSystem = async (slug: string, data: any) => {
  if (!db) return;
  await setDoc(doc(db, "institutional_logic", slug), data);
};

/**
 * Global Configuration Persistence
 */
let cachedGlobalConfig: any = null;
let lastConfigFetchTime = 0;
const CONFIG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export const getGlobalConfig = async (): Promise<any> => {
  const now = Date.now();
  if (cachedGlobalConfig && (now - lastConfigFetchTime < CONFIG_CACHE_TTL_MS)) {
    return cachedGlobalConfig;
  }
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "settings", "global"));
    const data = snap.exists() ? snap.data() : null;
    if (data) {
      cachedGlobalConfig = data;
      lastConfigFetchTime = now;
    }
    return data;
  } catch (e) {
    console.warn("Global config fetch failed (possibly offline/warmup):", e);
    return null;
  }
};

export const saveGlobalConfig = async (config: any) => {
  if (!db) return;
  try {
    await setDoc(doc(db, "settings", "global"), {
      ...config,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, "settings/global");
  }
};

/**
 * ASUU Strike Status Logic
 */
export const getASUUStatusFromDB = async (): Promise<{ isActive: boolean, status: string, summary: string, lastUpdated: string } | null> => {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "settings", "asuu"));
    if (snap.exists()) {
      const data = snap.data();
      return {
        isActive: data.isActive,
        status: data.status,
        summary: data.summary,
        lastUpdated: data.updatedAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString()
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const saveASUUStatusToDB = async (data: { isActive: boolean, status: string, summary: string }) => {
  if (!db) return;
  await setDoc(doc(db, "settings", "asuu"), {
    ...data,
    updatedAt: Timestamp.now()
  });
};

/**
 * Premium Subscriptions
 */
export const savePremiumSubscription = async (data: { email: string; paymentTimestamp: any; tx_ref: string }) => {
  if (!db) return;
  try {
    await addDoc(collection(db, "premium_subscriptions"), {
      ...data,
      createdAt: Timestamp.now()
    });
  } catch (e) {
    console.error("Error saving subscription:", e);
    throw e;
  }
};

/**
 * User Activity Logging
 */
export const logUserActivity = async (activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('campusai_local_activities');
      const localList = stored ? JSON.parse(stored) : [];
      const localActivity = {
        id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...activity,
        timestamp: new Date().toISOString()
      };
      localList.unshift(localActivity);
      localStorage.setItem('campusai_local_activities', JSON.stringify(localList.slice(0, 30)));
    } catch (err) {
      console.error("Local activity logging error:", err);
    }
  }

  if (!db || !activity.userId) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('campusai_activity_logged'));
    }
    return;
  }

  try {
    const activityData = { ...activity, timestamp: Timestamp.now() };
    await addDoc(collection(db, "user_activities"), cleanObject(activityData));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('campusai_activity_logged'));
    }
  } catch (e) {
    console.error("Error logging activity:", e);
  }
};

export const getUserActivities = async (userId: string | null, max: number = 20): Promise<UserActivity[]> => {
  if (!userId) {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('campusai_local_activities');
        const localList = stored ? JSON.parse(stored) : [];
        return localList.slice(0, max);
      } catch (err) { return []; }
    }
    return [];
  }

  if (!db) {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('campusai_local_activities');
        const localList = stored ? JSON.parse(stored) : [];
        return localList.filter((x: any) => x.userId === userId).slice(0, max);
      } catch (err) {}
    }
    return [];
  }

  try {
    const q = query(collection(db, "user_activities"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const activities = snap.docs.map(docSnap => {
      const data = docSnap.data();
      return { id: docSnap.id, ...data, timestamp: data.timestamp };
    }) as UserActivity[];

    return activities
      .sort((a, b) => {
        const timeA = toMs(a.timestamp);
        const timeB = toMs(b.timestamp);
        return timeB - timeA;
      })
      .slice(0, max);
  } catch (e) {
    console.error("Error fetching activities:", e);
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('campusai_local_activities');
        const localList = stored ? JSON.parse(stored) : [];
        return localList.filter((x: any) => x.userId === userId).slice(0, max);
      } catch (err) {}
    }
    return [];
  }
};

export const getAllUserActivities = async (limitCount: number = 300): Promise<UserActivity[]> => {
  if (!db) {
    if (typeof window !== 'undefined') {
      try {
      } catch (err) { return []; }
    }
    return [];
  }
  try {
    const q = query(collection(db, "user_activities"), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp
    })) as UserActivity[];
  } catch (e) {
    console.error("Error fetching all activities:", e);
    return [];
  }
};

export interface AdminNotification {
  id?: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  sourceUrl?: string;
  newsId?: string;
}

export const getAdminNotifications = async (): Promise<AdminNotification[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, "admin_notifications"), orderBy("timestamp", "desc"), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminNotification));
  } catch (e) {
    console.error("Error fetching admin notifications:", e);
    return [];
  }
};

export const getTrafficStats = async (): Promise<{ pageViews: number; uniqueVisitors: number }> => {
  if (!db) return { pageViews: 0, uniqueVisitors: 0 };
  try {
    const docRef = doc(db, "site_analytics", "traffic");
    const snap = await getDocFromServer(docRef);
    if (snap.exists()) {
      const d = snap.data();
      return { pageViews: d.pageViews || 0, uniqueVisitors: d.uniqueVisitors || 0 };
    }
    return { pageViews: 0, uniqueVisitors: 0 };
  } catch (e: any) {
    if (e.message?.includes('offline')) {
      console.warn("Traffic stats: client is offline, skipping read.");
    } else {
      console.error("Error reading traffic stats:", e);
    }
    return { pageViews: 0, uniqueVisitors: 0 };
  }
};

export const incrementTrafficStats = async (isNewVisitor: boolean) => {
  if (!db) return;
  try {
    const docRef = doc(db, "site_analytics", "traffic");
    const snap = await getDocFromServer(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        pageViews: 1,
        uniqueVisitors: isNewVisitor ? 1 : 0,
        lastUpdated: Timestamp.now()
      });
    } else {
      await updateDoc(docRef, {
        pageViews: increment(1),
        uniqueVisitors: isNewVisitor ? increment(1) : increment(0),
        lastUpdated: Timestamp.now()
      });
    }
  } catch (e: any) {
    if (e.message?.includes('offline')) {
      console.warn("Traffic stats: client is offline, skipping update.");
    } else {
      console.error("Error updating traffic stats:", e);
    }
  }
};

export const resetTrafficStats = async () => {
  if (!db) return;
  try {
    const docRef = doc(db, "site_analytics", "traffic");
    await setDoc(docRef, { pageViews: 0, uniqueVisitors: 0, lastUpdated: Timestamp.now() });
  } catch (e) {
    console.error("Error resetting traffic stats:", e);
  }
};

export const purgeUserActivities = async () => {
  if (!db) {
    if (typeof window !== 'undefined') localStorage.removeItem('campusai_local_activities');
    return;
  }
  try {
    const q = query(collection(db, "user_activities"), limit(500));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (e) {
    console.error("Error purging activities:", e);
  }
};

/**
 * Cached University Course Offerings & Cutoffs
 */
export const getCachedUniversityCourses = async (institution: string): Promise<string[] | null> => {
  if (!db) return null;
  try {
    const key = slugify(institution);
    const snap = await getDoc(doc(db, "cached_university_courses", key));
    if (snap.exists()) {
      const d = snap.data();
      if (Array.isArray(d.courses) && d.courses.length > 0) return d.courses;
    }
    return null;
  } catch (e) {
    console.warn("Error reading cached courses:", e);
    return null;
  }
};

export const saveCachedUniversityCourses = async (institution: string, courses: string[]) => {
  if (!db || !courses || courses.length === 0) return;
  try {
    const key = slugify(institution);
    await setDoc(doc(db, "cached_university_courses", key), {
      institution,
      courses,
      updatedAt: Timestamp.now()
    });
  } catch (e) {
    console.error("Error writing cached courses:", e);
  }
};

export const getCachedCourseCutoffInfo = async (institution: string, course: string): Promise<any | null> => {
  const key = slugify(`${institution}_${course}`);
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "cached_course_cutoff_info", key));
    if (snap.exists()) {
      const d = snap.data();
      const resData = d.data || d;
      return resData;
    }
    return null;
  } catch (e) {
    console.warn("Error reading cached cutoff info from DB:", e);
    return null;
  }
};

export const saveCachedCourseCutoffInfo = async (institution: string, course: string, data: any) => {
  if (!data) return;
  const key = slugify(`${institution}_${course}`);
  if (!db) return;
  try {
    await setDoc(doc(db, "cached_course_cutoff_info", key), {
      institution,
      course,
      data,
      updatedAt: Timestamp.now()
    });
  } catch (e) {
    console.error("Error writing cached cutoff info:", e);
  }
};

/**
 * ─── Cutoff Overrides & Curation ───────────────────────────────────────────────
 */
export interface CutoffOverride {
  institution: string;
  course: string;
  departmentalCutoff: string;
  institutionalCutoff?: string;
  explanation?: string;
  updatedAt?: any;
}

export const getCutoffOverride = async (institution: string, course: string): Promise<CutoffOverride | null> => {
  if (!db) return null;
  try {
    const key = slugify(`${institution}_${course}`);
    const snap = await getDoc(doc(db, "cutoff_overrides", key));
    if (snap.exists()) return snap.data() as CutoffOverride;
    return null;
  } catch (e) {
    console.warn("Error reading cutoff override:", e);
    return null;
  }
};

export const saveCutoffOverride = async (
  institution: string,
  course: string,
  departmentalCutoff: string,
  institutionalCutoff?: string,
  explanation?: string
) => {
  if (!db) return;
  try {
    const key = slugify(`${institution}_${course}`);
    await setDoc(doc(db, "cutoff_overrides", key), {
      institution,
      course,
      departmentalCutoff,
      institutionalCutoff: institutionalCutoff || "",
      explanation: explanation || "",
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (e) {
    console.error("Error saving cutoff override:", e);
  }
};

export const deleteCutoffOverride = async (institution: string, course: string) => {
  if (!db) return;
  try {
    const key = slugify(`${institution}_${course}`);
    await deleteDoc(doc(db, "cutoff_overrides", key));
  } catch (e) {
    console.error("Error deleting cutoff override:", e);
  }
};

export const getAllCutoffOverrides = async (): Promise<CutoffOverride[]> => {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, "cutoff_overrides"));
    const overrides: CutoffOverride[] = [];
    snap.forEach((docSnap: any) => overrides.push(docSnap.data() as CutoffOverride));
    return overrides;
  } catch (e) {
    console.error("Error fetching all cutoff overrides:", e);
    return [];
  }
};

export const getPostUtmeReleasesFull = async (): Promise<{ releases: any[]; updatedAt: any } | null> => {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "settings", "post_utme_releases"));
    if (snap.exists()) {
      const data = snap.data();
      return {
        releases: data.releases || [],
        updatedAt: data.updatedAt || null
      };
    }
    return null;
  } catch (e) {
    console.warn("Error fetching full Post-UTME releases:", e);
    return null;
  }
};

let cachedPostUtmeReleases: any[] | null = null;
let lastPostUtmeFetchTime = 0;
const POSTUTME_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export const getPostUtmeReleases = async (): Promise<any[] | null> => {
  const now = Date.now();
  if (cachedPostUtmeReleases && (now - lastPostUtmeFetchTime < POSTUTME_CACHE_TTL_MS)) {
    return cachedPostUtmeReleases;
  }
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "settings", "post_utme_releases"));
    const data = snap.exists() ? snap.data().releases : null;
    if (data) {
      cachedPostUtmeReleases = data;
      lastPostUtmeFetchTime = now;
    }
    return data;
  } catch (e) {
    console.warn("Error fetching Post-UTME releases:", e);
    return null;
  }
};

export const savePostUtmeReleases = async (releases: any[]) => {
  if (!db) return;
  try {
    console.log(`[DB Service] Saving ${releases.length} Post-UTME releases to cloud...`);
    await setDoc(doc(db, "settings", "post_utme_releases"), cleanObject({ 
      releases, 
      updatedAt: Timestamp.now() 
    }), { merge: true });
    console.log(`[DB Service] Post-UTME releases saved successfully.`);
  } catch (e) {
    console.error("Error saving Post-UTME releases:", e);
  }
};

export interface CalculationAttemptDoc {
  id?: string;
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

// Save a new calculation attempt for a logged-in user
export const saveCalculationAttempt = async (userId: string, attempt: CalculationAttemptDoc) => {
  const ref = collection(db, 'users', userId, 'calculationAttempts');
  await addDoc(ref, {
    ...attempt,
    createdAt: Timestamp.now(),
  });
};

// Fetch the last N calculation attempts for a logged-in user
export const getCalculationAttempts = async (userId: string, max = 5): Promise<CalculationAttemptDoc[]> => {
  const ref = collection(db, 'users', userId, 'calculationAttempts');
  const q = query(ref, orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as CalculationAttemptDoc);
};

/**
 * Testimonials & Feedback
 */
export const getTestimonials = async (onlyFeatured = false): Promise<any[]> => {
  if (!db) return [];
  try {
    const coll = collection(db, "testimonials");
    let q = query(coll, orderBy("createdAt", "desc"));
    if (onlyFeatured) {
      q = query(coll, where("isFeatured", "==", true), orderBy("createdAt", "desc"));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Error fetching testimonials:", e);
    return [];
  }
};

export const addTestimonial = async (data: any) => {
  if (!db) return;
  await addDoc(collection(db, "testimonials"), {
    ...data,
    createdAt: Timestamp.now(),
    isFeatured: data.isFeatured || false
  });
};

export const deleteTestimonial = async (id: string) => {
  if (!db) return;
  await deleteDoc(doc(db, "testimonials", id));
};

export const submitFeedback = async (data: { type: string; subject?: string; content: string; userId?: string; email?: string }) => {
  if (!db) return;
  await addDoc(collection(db, "feedback"), {
    ...data,
    status: 'pending',
    createdAt: Timestamp.now()
  });
};

export const getFeedbackList = async (): Promise<any[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
};

/**
 * School Student UGC (User-Generated Content) helpers
 */
export const getSchoolUgc = async (schoolSlug: string): Promise<SchoolUgcPost[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "school_ugc"),
      where("schoolSlug", "==", schoolSlug.toLowerCase())
    );
    const snap = await getDocs(q);
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolUgcPost));
    posts.sort((a, b) => {
      const getMs = (val: any) => {
        if (!val) return 0;
        if (typeof val.toMillis === 'function') return val.toMillis();
        if (val.seconds) return val.seconds * 1000;
        if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
        return new Date(val).getTime();
      };
      return getMs(b.createdAt) - getMs(a.createdAt);
    });
    return posts;
  } catch (e) {
    console.error(`getSchoolUgc error for ${schoolSlug}:`, e);
    return [];
  }
};

export const addSchoolUgc = async (
  schoolSlug: string,
  userId: string,
  userName: string,
  photoURL: string,
  content: string,
  category: 'tip' | 'question' | 'review' | 'experience',
  rating?: number
): Promise<string | null> => {
  if (!db) return null;
  const path = "school_ugc";
  try {
    const payload = {
      schoolSlug: schoolSlug.toLowerCase(),
      userId,
      userName,
      photoURL: photoURL || "",
      content,
      category,
      rating: rating || 5,
      likes: 0,
      likedBy: [],
      createdAt: Timestamp.now()
    };
    const ref = await addDoc(collection(db, path), payload);
    return ref.id;
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
    return null;
  }
};

export const likeSchoolUgc = async (ugcId: string, userId: string): Promise<void> => {
  if (!db) return;
  const path = `school_ugc/${ugcId}`;
  try {
    const dRef = doc(db, "school_ugc", ugcId);
    const dSnap = await getDoc(dRef);
    if (!dSnap.exists()) return;
    const data = dSnap.data();
    const likedByList = data.likedBy || [];
    let updatedLikedBy = [...likedByList];
    let newLikes = data.likes || 0;

    if (likedByList.includes(userId)) {
      updatedLikedBy = updatedLikedBy.filter(id => id !== userId);
      newLikes = Math.max(0, newLikes - 1);
    } else {
      updatedLikedBy.push(userId);
      newLikes += 1;
    }

    await updateDoc(dRef, {
      likedBy: updatedLikedBy,
      likes: newLikes
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
};

// ── Article Views Tracker ─────────────────────────────────────────────────────
const getDeterministicBaselineViews = (newsId: string): number => {
  return 1;
};

export const incrementAndGetArticleViews = async (newsId: string, initialViews?: number): Promise<number> => {
  if (!newsId) return 1;
  
  const localKey = `campusai_article_views_${newsId}`;
  let localViews = 0;
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(localKey) : null;
    if (stored) {
      localViews = parseInt(stored, 10) || 0;
    }
  } catch (e) {}

  localViews += 1;
  try {
    localStorage.setItem(localKey, localViews.toString());
  } catch (e) {}

  const baseViews = (typeof initialViews === 'number' && initialViews > 0) ? initialViews : 0;

  if (db) {
    const ref = doc(db, "article_views", newsId);
    try {
      await setDoc(ref, { views: increment(1), lastViewed: Timestamp.now() }, { merge: true });
      const snap = await getDoc(ref);
      if (snap.exists() && typeof snap.data().views === 'number') {
        return baseViews + snap.data().views;
      }
    } catch (e) {
      console.warn("Failed to update article views in Firestore:", e);
    }
  }

  return Math.max(1, baseViews + localViews);
};

export const getArticleViews = async (newsId: string, initialViews?: number): Promise<number> => {
  if (!newsId) return 1;
  const localKey = `campusai_article_views_${newsId}`;
  let localViews = 0;
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(localKey) : null;
    if (stored) localViews = parseInt(stored, 10) || 0;
  } catch (e) {}

  const baseViews = (typeof initialViews === 'number' && initialViews > 0) ? initialViews : 0;

  if (db) {
    try {
      const snap = await getDoc(doc(db, "article_views", newsId));
      if (snap.exists() && typeof snap.data().views === 'number') {
        return baseViews + snap.data().views;
      }
    } catch (e) {}
  }

  return Math.max(1, baseViews + localViews);
};

// ─── Prediction & Accuracy Tracking Engine ────────────────────────────────────

export interface GlobalPredictionRecord {
  id?: string;
  predictionId: string;
  userId: string;
  userEmail?: string;
  university: string;
  course: string;
  aggregateScore: number;
  jambScore: number;
  postUtmeScore: number;
  verdict: string;
  confidence: string;
  predictedProbability: number;
  departmentalCutoff: string;
  institutionalCutoff?: string;
  stateOfOrigin: string;
  isELDSState: boolean;
  isCatchmentState: boolean;
  predictionDate: string;
  detailedStrategy?: string;
  formulaExplanation?: string;
  createdAt?: any;
  helpful?: boolean;
  helpfulRating?: number;
  actualOutcome?: 'admitted' | 'not_admitted' | 'changed_course' | 'still_waiting';
  actualUni?: string;
  actualCourse?: string;
  admissionType?: 'merit' | 'catchment' | 'elds' | 'transfer' | 'other';
  outcomeNote?: string;
  outcomeSubmittedAt?: any;
}

export const savePredictionRecord = async (prediction: GlobalPredictionRecord) => {
  if (!db) return null;
  try {
    const docRef = doc(db, "predictions", prediction.predictionId);
    await setDoc(docRef, {
      ...prediction,
      createdAt: Timestamp.now()
    }, { merge: true });
    return prediction.predictionId;
  } catch (e) {
    console.error("Error saving global prediction record:", e);
    return null;
  }
};

export const updatePredictionHelpfulness = async (predictionId: string, helpful: boolean) => {
  if (!db || !predictionId) return;
  try {
    const docRef = doc(db, "predictions", predictionId);
    await updateDoc(docRef, {
      helpful,
      helpfulRating: helpful ? 5 : 1,
      updatedAt: Timestamp.now()
    });
  } catch (e) {
    console.error("Error updating prediction helpfulness:", e);
  }
};

export const submitAdmissionOutcome = async (
  predictionId: string,
  userId: string,
  outcomeData: {
    actualOutcome: 'admitted' | 'not_admitted' | 'changed_course' | 'still_waiting';
    actualUni?: string;
    actualCourse?: string;
    admissionType?: 'merit' | 'catchment' | 'elds' | 'transfer' | 'other';
    outcomeNote?: string;
  }
) => {
  if (!db) return;
  try {
    const outcomeId = `outcome_${predictionId || Date.now()}`;
    const payload = {
      outcomeId,
      predictionId,
      userId,
      ...outcomeData,
      submittedAt: Timestamp.now()
    };
    await setDoc(doc(db, "admission_outcomes", outcomeId), payload, { merge: true });

    if (predictionId) {
      await setDoc(doc(db, "predictions", predictionId), {
        actualOutcome: outcomeData.actualOutcome,
        actualUni: outcomeData.actualUni || '',
        actualCourse: outcomeData.actualCourse || '',
        admissionType: outcomeData.admissionType || 'merit',
        outcomeNote: outcomeData.outcomeNote || '',
        outcomeSubmittedAt: Timestamp.now()
      }, { merge: true });
    }
  } catch (e) {
    console.error("Error submitting admission outcome:", e);
  }
};

export const getPredictionAccuracyStats = async () => {
  if (!db) return null;
  try {
    const predictions: GlobalPredictionRecord[] = [];
    const seenPredictionIds = new Set<string>();

    // 1. Safe fetch from "predictions" collection
    try {
      let predictionsSnap;
      try {
        predictionsSnap = await getDocs(query(collection(db, "predictions"), orderBy("createdAt", "desc"), limit(500)));
      } catch (err) {
        predictionsSnap = await getDocs(query(collection(db, "predictions"), limit(500)));
      }
      
      predictionsSnap.docs.forEach(docSnap => {
        const data = docSnap.data();
        const predId = data.predictionId || docSnap.id;
        seenPredictionIds.add(predId);
        predictions.push({
          id: docSnap.id,
          ...data
        } as GlobalPredictionRecord);
      });
    } catch (e) {
      console.warn("Notice: Fetching 'predictions' collection encountered non-fatal error:", e);
    }

    // 2. Fallback / supplementary fetch from "user_activities" collection for all historical calculations
    try {
      const activitiesSnap = await getDocs(query(collection(db, "user_activities"), limit(500)));
      activitiesSnap.docs.forEach(docSnap => {
        const data = docSnap.data();
        const desc = data.description || '';
        const isCalcActivity = data.type === 'calculation' || desc.includes('Calculated aggregate') || data.metadata?.university;
        
        if (isCalcActivity) {
          const actId = data.metadata?.predictionId || `act_${docSnap.id}`;
          if (!seenPredictionIds.has(actId)) {
            seenPredictionIds.add(actId);
            let university = data.metadata?.university || '';
            let course = data.metadata?.course || '';
            
            if (!university && desc.includes(' at ')) {
              const parts = desc.split(' at ');
              university = parts[1]?.trim() || '';
            }
            if (!course && desc.includes('Calculated aggregate for ')) {
              const parts = desc.replace('Calculated aggregate for ', '').split(' at ');
              course = parts[0]?.trim() || '';
            }

            const aggregateScore = Number(data.metadata?.aggregateScore || 0);
            const jambScore = Number(data.metadata?.jambScore || 0);
            const postUtmeScore = Number(data.metadata?.postUtmeScore || 0);

            predictions.push({
              id: docSnap.id,
              predictionId: actId,
              userId: data.userId || 'guest',
              userEmail: data.userEmail || '',
              university: university || 'Nigerian Higher Institution',
              course: course || 'General Admission Program',
              aggregateScore,
              jambScore,
              postUtmeScore,
              verdict: data.metadata?.verdict || (aggregateScore >= 60 ? 'Competitive' : 'Borderline'),
              confidence: 'High',
              predictedProbability: aggregateScore >= 70 ? 88 : aggregateScore >= 55 ? 65 : 40,
              departmentalCutoff: data.metadata?.cutoff || '',
              stateOfOrigin: data.metadata?.stateOfOrigin || '',
              isELDSState: false,
              isCatchmentState: false,
              predictionDate: data.timestamp?.toDate ? data.timestamp.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              createdAt: data.timestamp || Timestamp.now()
            });
          }
        }
      });
    } catch (e) {
      console.warn("Notice: Fetching 'user_activities' collection encountered non-fatal error:", e);
    }

    // 3. Check "admission_outcomes" collection to attach any outcomes to corresponding predictions
    try {
      const outcomesSnap = await getDocs(query(collection(db, "admission_outcomes"), limit(500)));
      const outcomesMap = new Map<string, any>();
      outcomesSnap.docs.forEach(docSnap => {
        const d = docSnap.data();
        if (d.predictionId) outcomesMap.set(d.predictionId, d);
      });

      if (outcomesMap.size > 0) {
        predictions.forEach(p => {
          if (p.predictionId && outcomesMap.has(p.predictionId)) {
            const outcome = outcomesMap.get(p.predictionId);
            p.actualOutcome = outcome.actualOutcome;
            p.actualUni = outcome.actualUni;
            p.actualCourse = outcome.actualCourse;
            p.admissionType = outcome.admissionType;
          }
        });
      }
    } catch (e) {
      console.warn("Notice: Fetching 'admission_outcomes' collection encountered non-fatal error:", e);
    }

    // 4. Calculate Aggregate Benchmark Stats
    let userLifetimeCalculations = 0;
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      usersSnap.docs.forEach(docSnap => {
        const u = docSnap.data();
        if (u.lifetime_calculations) {
          userLifetimeCalculations += Number(u.lifetime_calculations);
        }
      });
    } catch (e) {
      console.warn("Notice: Fetching 'users' collection encountered non-fatal error:", e);
    }

    const totalPredictions = Math.max(predictions.length, userLifetimeCalculations);
    const confirmedOutcomes = predictions.filter(p => p.actualOutcome && p.actualOutcome !== 'still_waiting');
    
    let correctCount = 0;
    const byUni: Record<string, { total: number; correct: number; predictions: number }> = {};
    const byCourse: Record<string, { total: number; correct: number; predictions: number }> = {};
    const confidenceMatrix: Record<string, { total: number; correct: number }> = {
      'High': { total: 0, correct: 0 },
      'Medium': { total: 0, correct: 0 },
      'Low': { total: 0, correct: 0 }
    };

    let helpfulCount = 0;
    let feedbackTotal = 0;

    // Check feedback & testimonials for user helpfulness ratings if predictions ratings are sparse
    try {
      const feedbackSnap = await getDocs(collection(db, "feedback"));
      feedbackSnap.docs.forEach(docSnap => {
        const d = docSnap.data();
        if (typeof d.helpful === 'boolean') {
          feedbackTotal++;
          if (d.helpful) helpfulCount++;
        }
      });
    } catch (e) {}

    predictions.forEach(p => {
      if (typeof p.helpful === 'boolean') {
        feedbackTotal++;
        if (p.helpful) helpfulCount++;
      }

      const uni = p.university || 'Higher Institution';
      if (!byUni[uni]) byUni[uni] = { total: 0, correct: 0, predictions: 0 };
      byUni[uni].predictions++;

      const course = p.course || 'Academic Program';
      if (!byCourse[course]) byCourse[course] = { total: 0, correct: 0, predictions: 0 };
      byCourse[course].predictions++;

      if (p.actualOutcome && p.actualOutcome !== 'still_waiting') {
        const isAdmitted = p.actualOutcome === 'admitted';
        const predictedHighProb = (p.predictedProbability || 0) >= 50;
        const isMatch = (isAdmitted && predictedHighProb) || (!isAdmitted && !predictedHighProb);

        if (isMatch) correctCount++;

        byUni[uni].total++;
        if (isMatch) byUni[uni].correct++;

        byCourse[course].total++;
        if (isMatch) byCourse[course].correct++;

        const conf = p.confidence || 'Medium';
        if (!confidenceMatrix[conf]) confidenceMatrix[conf] = { total: 0, correct: 0 };
        confidenceMatrix[conf].total++;
        if (isMatch) confidenceMatrix[conf].correct++;
      }
    });

    const overallAccuracy = confirmedOutcomes.length > 0 
      ? Math.round((correctCount / confirmedOutcomes.length) * 100) 
      : 0;

    const helpfulnessRate = feedbackTotal > 0 
      ? Math.round((helpfulCount / feedbackTotal) * 100) 
      : 0;

    // Sort predictions by timestamp or createdAt
    predictions.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.predictionDate || 0).getTime();
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.predictionDate || 0).getTime();
      return timeB - timeA;
    });

    return {
      totalPredictions,
      confirmedCount: confirmedOutcomes.length,
      overallAccuracy,
      helpfulnessRate,
      feedbackTotal,
      byUni,
      byCourse,
      confidenceMatrix,
      recentPredictions: predictions.slice(0, 50)
    };
  } catch (e) {
    console.error("Error fetching prediction accuracy stats:", e);
    return null;
  }
};

