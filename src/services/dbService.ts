import { NewsItem, BillboardAd, Comment, BroadcastEmail, ChatMessage, UserActivity, UniversityCategory, SchoolUgcPost } from '../types';
import { MOCK_NEWS, TICKER_HEADLINES } from '../constants';
import { db, firestoreDatabaseId } from './firebaseConfig';
export { db };
import { slugify, stringify, cleanObject, getApiUrl } from './utils';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc, Timestamp, where, updateDoc, getDoc, limit, writeBatch, getDocsFromServer, increment, onSnapshot, startAfter } from "firebase/firestore";
import { handleFirestoreError, OperationType } from './firestoreUtils';
import axios from 'axios';

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
  const cleanSlug = slug.split('?')[0].replace(/\/$/, '');

  if (!db) {
    const mock = MOCK_NEWS.find(n => (n.slug || slugify(n.title)) === cleanSlug) || null;
    if (mock) {
      return { ...mock, category: normalizeCategory(mock.category, mock.title) };
    }
    return null;
  }
  try {
    const newsRef = collection(db, "news");
    const q = query(newsRef, where("slug", "==", cleanSlug));
    let querySnapshot;
    try {
      querySnapshot = await getDocsFromServer(q);
    } catch (e) {
      // Fallback to cache if offline
      querySnapshot = await getDocs(q);
    }
    if (!querySnapshot.empty) {
      // If there are duplicates, pick the most recently updated one
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
    const mock = MOCK_NEWS.find(n => (n.slug || slugify(n.title)) === cleanSlug) || null;
    if (mock) {
      return { ...mock, category: normalizeCategory(mock.category, mock.title) };
    }
    return null;
  } catch (e) {
    console.error("Error fetching news by slug:", e);
    const mock = MOCK_NEWS.find(n => (n.slug || slugify(n.title)) === cleanSlug) || null;
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

const getSyncTime = (item: NewsItem, now: number = Date.now()): number => {
  const dateStr = item.date ? item.date.trim() : "";
  const isBracketed = dateStr.includes("[") || dateStr.includes("]");
  const pub = isBracketed ? 0 : toMs(dateStr);
  
  const createdVal = toMs(item.createdAt);
  const archivedVal = toMs(item.archivedAt);
  const updatedVal = toMs(item.updatedAt);

  const created = createdVal ? Math.min(now, createdVal) : 0;
  const archived = archivedVal ? Math.min(now, archivedVal) : 0;
  const updated = updatedVal ? Math.min(now, updatedVal) : 0;
  
  // Prioritize original created time over last-synced archived time to prevent
  // old re-synced items from jumping to the top of the feed.
  return created || archived || updated || (pub ? Math.min(now, pub) : 0);
};

const getEffectiveDateMs = (item: NewsItem): number => {
  const dateStr = item.date ? item.date.trim() : "";
  const isBracketed = dateStr.includes("[") || dateStr.includes("]");
  const pub = isBracketed ? 0 : toMs(dateStr);
  if (pub > 0) return pub;
  return toMs(item.createdAt) || toMs(item.archivedAt) || toMs(item.updatedAt) || 0;
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
  const isCacheValid = cachedRawNews && (now - lastRawFetchTime < RAW_CACHE_TTL_MS);
  const cachedLiveCount = cachedRawNews ? cachedRawNews.filter(n => n.isLive).length : 0;
  const needsMoreThanCached = limitOverride && limitOverride > 20 && (!cachedRawNews || cachedLiveCount < limitOverride);

  if (cachedRawNews && isCacheValid && !needsMoreThanCached) {
    console.log("getCloudNews: Returning cached news list (preventing redundant fetch).");
    return filterAndSortNews(cachedRawNews, includeFuture, now, includeJunk);
  }

  const hasLocalFirebase = typeof window !== 'undefined' && !!localStorage.getItem('campusai_firebase');

  // Try proxy first (only if we are NOT using a custom user-provisioned Firebase database)
  if (!hasLocalFirebase) {
    try {
      console.log(`getCloudNews: Attempting proxy fetch (limit: ${limitOverride || 20})...`);
      const payload: any = { 
          collectionName: 'news',
          orderByField: 'createdAt',
          orderDirection: 'desc',
          limitCount: limitOverride || 20
      };
      if (category) {
        payload.whereField = 'category';
        payload.whereOperator = '==';
        payload.whereValue = category;
      }
      if (lastCreatedAt) {
        payload.startAfterValue = lastCreatedAt;
      }
      const res = await axios.post(getApiUrl('/api/proxy-firestore'), payload);
      if (res.data.success) {
        console.log(`getCloudNews: Proxy fetch successful. Retrieved ${res.data.data.length} items.`);
        const cloudNews = res.data.data.map((item: any) => ({
          ...item,
          isLive: true,
          category: normalizeCategory(item.category || 'National', item.title || '')
        }));
        const mergedNews = [...cloudNews, ...MOCK_NEWS];
        cachedRawNews = mergedNews;
        lastRawFetchTime = now;
        return filterAndSortNews(mergedNews, includeFuture, now, includeJunk);
      }
    } catch (e) {
      console.error("Proxy fetch failed, falling back to client-side:", e);
    }
  } else {
    console.log("getCloudNews: Custom user-provisioned Firebase database is active. Bypassing proxy for direct client-side fetch.");
  }

  // Fallback to existing logic
  if (!db) {
    console.error("getCloudNews: Firestore DB is NOT initialized. Returning MOCK_NEWS.");
    return MOCK_NEWS;
  }

  try {
    console.log(`getCloudNews: Attempting cloud fetch (limit: ${limitOverride || 20})...`);
    const newsRef = collection(db, "news");
    let q;
    const constraints: any[] = [orderBy('createdAt', 'desc'), limit(limitOverride || 20)];
    if (category) constraints.unshift(where('category', '==', category));
    if (lastCreatedAt) constraints.push(startAfter(lastCreatedAt));
    
    q = query(newsRef, ...constraints);


    let querySnapshot;
    try {
      console.log(`getCloudNews: Querying collection "news" in database: ${firestoreDatabaseId || '(default)'}`);
      querySnapshot = await getDocs(q);
      console.log(`getCloudNews: Smart Firestore fetch successful. Found ${querySnapshot.size} documents.`);
    } catch (fetchError: any) {
      console.warn("getCloudNews: Smart fetch failed. Detail:", fetchError.message || fetchError);
      try {
        console.log("getCloudNews: Trying direct server fallback...");
        querySnapshot = await getDocsFromServer(q);
        console.log(`getCloudNews: Server direct fallback fetch successful. Found ${querySnapshot.size} documents.`);
      } catch (serverError: any) {
        console.error("getCloudNews: Both smart fetch and server fallback failed. Error:", serverError.message || serverError);
        return MOCK_NEWS;
      }
    }

    const cloudNews: NewsItem[] = [];
    querySnapshot.forEach((docSnap: any) => {
      const data = docSnap.data();
      cloudNews.push({
        id: docSnap.id,
        isLive: true,
        ...data,
        category: normalizeCategory(data.category || 'National', data.title || '')
      });
    });

    console.log(`getCloudNews: Retrieved ${cloudNews.length} items from Firestore.`);

    const mergedNews = [...cloudNews, ...MOCK_NEWS];

    cachedRawNews = mergedNews;
    lastRawFetchTime = now;

    return filterAndSortNews(mergedNews, includeFuture, now, includeJunk);
  } catch (e: any) {
    console.error("getCloudNews: CRITICAL FAILURE", e);
    return MOCK_NEWS;
  }
};

export const getCloudNewsCount = async (): Promise<number> => {
  const hasLocalFirebase = typeof window !== 'undefined' && !!localStorage.getItem('campusai_firebase');

  if (!hasLocalFirebase) {
    try {
      const res = await axios.post(getApiUrl('/api/proxy-firestore-count'), { collectionName: 'news' });
      if (res.data.success) {
        return res.data.count;
      }
    } catch (e) {
      console.error("Proxy count fetch failed:", e);
    }
  }

  if (!db) return MOCK_NEWS.length;
  try {
    const { getCountFromServer, collection } = await import("firebase/firestore");
    const snap = await getCountFromServer(collection(db, "news"));
    return snap.data().count;
  } catch (e) {
    console.error("Client count fetch failed:", e);
    return MOCK_NEWS.length;
  }
};

const filterAndSortNews = (items: NewsItem[], includeFuture: boolean, now: number, includeJunk: boolean = false): NewsItem[] => {
  let bookmarkedIds: string[] = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      bookmarkedIds = JSON.parse(window.localStorage.getItem('campusai_bookmarks') || '[]');
    } catch (e) {}
  }

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

      if (includeFuture) return true;
      if (!item.date) return true; // Allow items with no date through (don't accidentally hide them)
      const itemDate = new Date(item.date).getTime();
      // Allow items with no parseable date through (don't accidentally hide them)
      if (!isNaN(itemDate) && itemDate > now + (48 * 60 * 60 * 1000)) {
        if (item.isLive) {
          console.log(`[DEBUG filterAndSortNews] Rejected live item as future-dated: ${item.title} (date: ${item.date}, itemDateMs: ${itemDate}, nowMs: ${now})`);
        }
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      // 1. Live news (isLive: true) always before mock news
      const aLive = !!a.isLive;
      const bLive = !!b.isLive;
      if (aLive !== bLive) return aLive ? -1 : 1;

      // 2. Primary: Cloud Synchronization Time (newest first)
      const syncA = getSyncTime(a, now);
      const syncB = getSyncTime(b, now);
      if (syncB !== syncA) return syncB - syncA;

      // 3. Secondary: effective date of the article (newest first)
      const dateA = getEffectiveDateMs(a);
      const dateB = getEffectiveDateMs(b);
      if (dateB !== dateA) return dateB - dateA;

      return 0;
    });

  // Deduplicate by stable key, title (normalized) and slug to prevent repeated news
  const seenStableKeys = new Set<string>();
  const seenTitles = new Set<string>();
  const seenSlugs = new Set<string>();
  const deduplicated: NewsItem[] = [];

  for (const item of sorted) {
    if (!item) continue;
    const normTitle = (item.title || "").trim().toLowerCase().replace(/\s+/g, ' ');
    const slug = item.slug ? item.slug.trim().toLowerCase() : '';
    const stableKey = getStableNewsKey(item.title || "", item.category || "");
    
    // Check if we already have this stable key, title or slug
    if (seenStableKeys.has(stableKey) || seenTitles.has(normTitle) || (slug && seenSlugs.has(slug))) {
      if (item.isLive) {
        console.log(`[DEBUG filterAndSortNews] Dropped live item due to deduplication: ${item.title}. StableKey: ${stableKey}, SeenStableKey: ${seenStableKeys.has(stableKey)}, SeenTitle: ${seenTitles.has(normTitle)}, SeenSlug: ${slug && seenSlugs.has(slug)}`);
      }
      continue;
    }
    
    seenStableKeys.add(stableKey);
    seenTitles.add(normTitle);
    if (slug) {
      seenSlugs.add(slug);
    }
    deduplicated.push(item);
  }

  console.log(`[DEBUG filterAndSortNews] Output count: ${deduplicated.length}, Live count in output: ${deduplicated.filter(item => item.isLive).length}`);
  return deduplicated;
};

export const archiveNewsItems = async (items: NewsItem[]) => {
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

    // FIX: read each target doc first so we know whether it already exists.
    // This is what lets us preserve the ORIGINAL createdAt on re-syncs,
    // instead of resetting it to "now" every time a stable-key doc is
    // overwritten by the auto-sync. Without this, evergreen auto-synced
    // docs (JAMB2026, NATIONAL2026, etc.) permanently occupy the top of
    // any orderBy('createdAt', 'desc') query, burying real new articles.
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

      // FIX: preserve the existing document's original createdAt if it
      // already exists. Only brand-new documents get a fresh createdAt.
      const existingSnap = existingSnaps[i];
      const preservedCreatedAt = existingSnap.exists()
        ? (existingSnap.data()?.createdAt || articleTimestamp)
        : articleTimestamp;

      batch.set(ref, {
        ...item,
        id: docId,
        date: finalDate,
        category: finalCategory,
        slug,
        isLive: true,
        archivedAt: nowTimestamp,       // fine to bump — reflects "last synced"
        createdAt: preservedCreatedAt,  // ← never resets on repeat syncs anymore
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
  const stored = localStorage.getItem(NEWS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const publishNewsUpdate = async (news: Omit<NewsItem, 'id'>) => {
  const token = 'CAMPUS@2026';
  try {
    const response = await axios.post(getApiUrl('/api/admin/news/action'), {
      action: 'publish',
      news,
      token
    });
    if (response.data && response.data.success) {
      clearNewsCache();
      return response.data.id;
    }
  } catch (err) {
    console.warn("publishNewsUpdate: Backend admin API call failed, falling back to direct client write:", err);
  }

  const slug = news.slug || slugify(news.title);
  const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "Africa/Lagos" });
  let finalDate = news.date ? news.date.trim() : "";
  if (!finalDate || finalDate.includes("[") || finalDate.includes("]") || finalDate.includes("Insert") || toMs(finalDate) === 0) {
    finalDate = todayStr;
  }

  if (db) {
    const docRef = await addDoc(collection(db, "news"), {
      ...news,
      date: finalDate,
      slug,
      isLive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    clearNewsCache();
    return docRef.id;
  }
  const current = getPublishedNews();
  const newItem = { ...news, date: finalDate, id: Date.now().toString(), slug };
  localStorage.setItem(NEWS_KEY, stringify([newItem, ...current]));
  return newItem.id;
};

export const deleteNewsUpdate = async (id: string) => {
  const token = 'CAMPUS@2026';
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
  const token = 'CAMPUS@2026';
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
  const token = 'CAMPUS@2026';
  try {
    const response = await axios.post(getApiUrl('/api/admin/news/action'), {
      action: 'update',
      id,
      updates,
      token
    });
    if (response.data && response.data.success) {
      clearNewsCache();
      return;
    }
  } catch (err) {
    console.warn("updateNewsItem: Backend admin API call failed, falling back to direct client update:", err);
  }

  if (!db) return;
  try {
    const newsRef = doc(db, "news", id);
    await updateDoc(newsRef, { ...updates, updatedAt: Timestamp.now() });
    clearNewsCache();
  } catch (e) {
    console.error("Error updating news item:", e);
  }
};

export const updateNewsArticleContent = async (id: string, fullContent: string) => {
  const token = 'CAMPUS@2026';
  try {
    const response = await axios.post(getApiUrl('/api/admin/news/action'), {
      action: 'update',
      id,
      updates: { fullContent },
      token
    });
    if (response.data && response.data.success) {
      clearNewsCache();
      return;
    }
  } catch (err) {
    console.warn("updateNewsArticleContent: Backend admin API call failed, falling back to direct client update:", err);
  }

  if (!db) return;
  try {
    const newsRef = doc(db, "news", id);
    await updateDoc(newsRef, { fullContent, updatedAt: Timestamp.now() });
    clearNewsCache();
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
        clearNewsCache();
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
  const token = 'CAMPUS@2026';
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

export const getAllKnowledgeFragments = async () => {
  if (!db) return [];
  try {
    const snapshot = await getDocs(collection(db, "knowledge_fragments"));
    return snapshot.docs.map(d => d.data());
  } catch (e) {
    console.error("Error fetching knowledge fragments:", e);
    return [];
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
export const getGlobalConfig = async (): Promise<any> => {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "settings", "global"));
    return snap.exists() ? snap.data() : null;
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
      const localList = JSON.parse(localStorage.getItem('campusai_local_activities') || '[]');
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
        const localList = JSON.parse(localStorage.getItem('campusai_local_activities') || '[]');
        return localList.slice(0, max);
      } catch (err) { return []; }
    }
    return [];
  }

  if (!db) {
    if (typeof window !== 'undefined') {
      try {
        const localList = JSON.parse(localStorage.getItem('campusai_local_activities') || '[]');
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
        const localList = JSON.parse(localStorage.getItem('campusai_local_activities') || '[]');
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
        return JSON.parse(localStorage.getItem('campusai_local_activities') || '[]');
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

export const getTrafficStats = async (): Promise<{ pageViews: number; uniqueVisitors: number }> => {
  if (!db) return { pageViews: 0, uniqueVisitors: 0 };
  try {
    const docRef = doc(db, "site_analytics", "traffic");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const d = snap.data();
      return { pageViews: d.pageViews || 0, uniqueVisitors: d.uniqueVisitors || 0 };
    }
    return { pageViews: 0, uniqueVisitors: 0 };
  } catch (e) {
    console.error("Error reading traffic stats:", e);
    return { pageViews: 0, uniqueVisitors: 0 };
  }
};

export const incrementTrafficStats = async (isNewVisitor: boolean) => {
  if (!db) return;
  try {
    const docRef = doc(db, "site_analytics", "traffic");
    const snap = await getDoc(docRef);
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
  } catch (e) {
    console.error("Error updating traffic stats:", e);
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
  if (!db) return null;
  try {
    const key = slugify(`${institution}_${course}`);
    const snap = await getDoc(doc(db, "cached_course_cutoff_info", key));
    if (snap.exists()) {
      const d = snap.data();
      return d.data || d;
    }
    return null;
  } catch (e) {
    console.warn("Error reading cached cutoff info:", e);
    return null;
  }
};

export const saveCachedCourseCutoffInfo = async (institution: string, course: string, data: any) => {
  if (!db || !data) return;
  try {
    const key = slugify(`${institution}_${course}`);
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

export const getPostUtmeReleases = async (): Promise<any[] | null> => {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "settings", "post_utme_releases"));
    return snap.exists() ? snap.data().releases : null;
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
  uniName: string;
  courseName: string;
  jambScore: string;
  postUtmeScore: string;
  stateOfOrigin: string;
  aggregateScore: number;
  isAR: boolean;
  isPostUtmePending: boolean;
  timestamp: number;
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
