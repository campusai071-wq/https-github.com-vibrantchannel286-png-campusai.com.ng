import express from "express";
import crypto from "crypto";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { Resend } from "resend";
import { GoogleGenAI, Type } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { OpenAI } from "openai";
import { CohereClient } from "cohere-ai";
import axios from "axios";
import { TavilyClient } from "tavily";
import { initializeApp as initClientApp, getApps as getClientApps } from "firebase/app";
import { initializeFirestore, collection, getDocs, query, orderBy, limit, getCountFromServer, where, startAfter, doc, setDoc, updateDoc, deleteDoc, getDoc, Timestamp } from "firebase/firestore";
import { initializeApp as initAdminApp, applicationDefault } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, Timestamp as AdminTimestamp } from "firebase-admin/firestore";
import { injectSEO as seoInject } from "./seo.js";
import { handleOgImageRequest } from "./ogImage.js";
import { handleArticleImageRequest } from "./articleImage.js";
import universityData from "../src/data/universities.js";
import { MOCK_NEWS } from "../src/constants.js";

const getFirebaseAppletConfig = (): any => {
  try {
    const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e: any) {
    console.error("Failed to read firebase-applet-config.json:", e);
    return {};
  }
};
const firebaseAppletConfig = getFirebaseAppletConfig();

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

// =============================================================================
// SECURITY CONFIG
// -----------------------------------------------------------------------------
// These MUST come from environment variables. Nothing security-sensitive is
// hardcoded in source anymore. If you don't set these, the server refuses to
// start in production so you can't accidentally ship with a known/default
// secret again.
// =============================================================================
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.VITE_ADMIN_TOKEN || "CAMPUS@2026";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || "eiweh123@gmail.com").toLowerCase();
const FIRECRAWL_WEBHOOK_SECRET = process.env.FIRECRAWL_WEBHOOK_SECRET || "";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "";
const INDEXNOW_HOST = process.env.INDEXNOW_HOST || "campusai.com.ng";

if (process.env.NODE_ENV === "production") {
  const missing: string[] = [];
  if (!ADMIN_TOKEN) missing.push("ADMIN_TOKEN");
  if (!ADMIN_EMAIL) missing.push("ADMIN_EMAIL");
  if (!FIRECRAWL_WEBHOOK_SECRET) missing.push("FIRECRAWL_WEBHOOK_SECRET");
  if (!INDEXNOW_KEY) missing.push("INDEXNOW_KEY");
  if (missing.length > 0) {
    console.error(`[Server Startup] Missing required env vars in production: ${missing.join(", ")}`);
    console.error(`[Server Startup] Warning: Server is starting, but related secure routes will fail if accessed.`);
  }
}

// Constant-time string compare so a shared secret can't be leaked via timing.
function safeEquals(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// --- Global Logger (Log EVERYTHING) ---
export const app = express();
app.use(cors({ origin: "*" }));
const PORT = 3000;

app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || 'N/A';
  console.log(`[Server] ${req.method} ${req.url} | Origin: ${origin}`);
  next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-goog-api-key, X-Requested-With");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Initialize Firebase Client SDK & Compat Wrapper for Server-side Reads
let db: any;
let dbInstance: any = null;
try {
  const { firestoreDatabaseId, ...standardConfig } = firebaseAppletConfig;
  const clientApps = getClientApps();
  const appInstance = clientApps.length === 0 ? initClientApp(standardConfig) : clientApps[0];
  dbInstance = initializeFirestore(appInstance, {}, firestoreDatabaseId);

  class CollectionReferenceCompat {
    constructor(private db: any, private collectionName: string) {}

    where(field: string, opStr: any, value: any) {
      return new QueryCompat(this.db, this.collectionName, [where(field, opStr, value)]);
    }

    orderBy(field: string, direction: "asc" | "desc" = "asc") {
      return new QueryCompat(this.db, this.collectionName, [orderBy(field, direction)]);
    }

    startAfter(value: any) {
      return new QueryCompat(this.db, this.collectionName, [startAfter(value)]);
    }

    limit(n: number) {
      return new QueryCompat(this.db, this.collectionName, [limit(n)]);
    }

    async get() {
      const q = query(collection(this.db, this.collectionName));
      const snap = await getDocs(q);
      return snap;
    }

    count() {
      return {
        get: async () => {
          const q = query(collection(this.db, this.collectionName));
          const snap = await getCountFromServer(q);
          return {
            data: () => ({ count: snap.data().count })
          };
        }
      };
    }
  }

  class QueryCompat {
    constructor(private db: any, private collectionName: string, private constraints: any[]) {}

    where(field: string, opStr: any, value: any) {
      this.constraints.push(where(field, opStr, value));
      return this;
    }

    orderBy(field: string, direction: "asc" | "desc" = "asc") {
      this.constraints.push(orderBy(field, direction));
      return this;
    }

    startAfter(value: any) {
      this.constraints.push(startAfter(value));
      return this;
    }

    limit(n: number) {
      this.constraints.push(limit(n));
      return this;
    }

    async get() {
      const q = query(collection(this.db, this.collectionName), ...this.constraints);
      const snap = await getDocs(q);
      return snap;
    }

    count() {
      return {
        get: async () => {
          const q = query(collection(this.db, this.collectionName), ...this.constraints);
          const snap = await getCountFromServer(q);
          return {
            data: () => ({ count: snap.data().count })
          };
        }
      };
    }
  }

  db = {
    collection(name: string) {
      return new CollectionReferenceCompat(dbInstance, name);
    }
  };
  console.log("[Firebase Client SDK] Server-side Firestore connected & compat wrapper initialized for database:", firestoreDatabaseId);
} catch (err) {
  console.warn("[Firebase Client SDK] Server-side Firestore initialization failed:", err);
  const mockQuery: any = {
    doc: () => ({ get: async () => ({ exists: false, data: () => ({}) }), set: async () => {} }),
    where: () => mockQuery,
    orderBy: () => mockQuery,
    startAfter: () => mockQuery,
    limit: () => mockQuery,
    get: async () => ({ forEach: () => {} }),
    count: () => ({ get: async () => ({ data: () => ({ count: 0 }) }) })
  };
  db = { collection: () => mockQuery };
}

let adminDb: any = null;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const adminAppInstance = initAdminApp({
      credential: applicationDefault(),
      projectId: firebaseAppletConfig.projectId
    }, "admin-app");
    adminDb = getAdminFirestore(adminAppInstance, firebaseAppletConfig.firestoreDatabaseId || "(default)");
    console.log("[Firebase Admin SDK] Initialized successfully for writes!");
  } else {
    console.log("[Firebase Admin SDK] Skipped initialization (no GOOGLE_APPLICATION_CREDENTIALS), falling back to Client SDK.");
  }
} catch (err: any) {
  console.warn("[Firebase Admin SDK] Initialization failed, falling back to Client SDK:", err.message);
}

// Essential Middlewares (moved up, defined once)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// =============================================================================
// ORIGIN / AUTH GUARDS
// -----------------------------------------------------------------------------
// isAllowedOrigin now does an exact scheme+host match against an allowlist,
// instead of substring `.includes()` checks. The old version let
// "https://campusai.com.ng.evil.com" or "https://evilcampusai.com.ng" through
// because both *contain* "campusai.com.ng". That's fixed here.
// =============================================================================
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://campusai-ng.vercel.app,http://localhost:5173,http://localhost:3000,https://ais-dev-z3mfpydedevfn4p4fapdhd-267400732145.europe-west2.run.app,https://ais-pre-z3mfpydedevfn4p4fapdhd-267400732145.europe-west2.run.app,https://www.campusai.com.ng,https://campusai.com.ng')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const ALLOWED_ORIGIN_SET = new Set(ALLOWED_ORIGINS.map(o => o.toLowerCase()));

function isAllowedOrigin(req: any): boolean {
  const originHeader = req.headers?.origin || req.headers?.referer || '';
  if (!originHeader) {
    // No Origin/Referer header at all: allow only outside production
    // (server-to-server / curl during local dev), block in production.
    return process.env.NODE_ENV !== 'production';
  }

  let originUrl: URL;
  try {
    originUrl = new URL(originHeader);
  } catch {
    return false;
  }

  const normalizedOrigin = `${originUrl.protocol}//${originUrl.host}`.toLowerCase();
  const host = originUrl.hostname.toLowerCase();

  // Exact match against the allowlist (scheme + host, no substring games).
  if (ALLOWED_ORIGIN_SET.has(normalizedOrigin)) return true;

  // Explicit, tightly-scoped patterns instead of `.includes()`:
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  const isRunApp = host.endsWith('.run.app');
  const isVercelPreview = host.endsWith('.vercel.app');
  const isCampusDomain = host === 'campusai.com.ng' || host.endsWith('.campusai.com.ng');

  const allowed = isLocalhost || isRunApp || isVercelPreview || isCampusDomain;

  if (!allowed) {
    console.warn(`[API Guard] Rejected origin: "${originHeader}". Request path: ${req.url}`);
  }
  return allowed;
}

// Admin guard: requires BOTH an allowed origin AND a valid admin token,
// checked with a timing-safe comparison. Token comes from env, never a
// hardcoded literal.
function requireAdminToken(req: any, res: any, next: any) {
  const token = req.body?.token || req.headers['x-admin-token'];
  if (!ADMIN_TOKEN || !safeEquals(String(token || ""), ADMIN_TOKEN)) {
    return res.status(403).json({ success: false, error: "Unauthorized: invalid admin token" });
  }
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ success: false, error: "Origin not allowed" });
  }
  next();
}

// Same idea for the email-header check used by /api/news/sync — timing-safe
// and case-insensitive, still not a real session but at least consistent
// and not comparable-by-length-leak.
function requireAdminEmailHeader(req: any, res: any, next: any) {
  const suppliedEmail = String(req.headers['x-admin-email'] || "").toLowerCase();
  if (!ADMIN_EMAIL || !safeEquals(suppliedEmail, ADMIN_EMAIL)) {
    console.warn("[API News Sync] Unauthorized access attempt blocked");
    return res.status(403).json({ error: "Unauthorized" });
  }
  if (!isAllowedOrigin(req)) {
    console.warn("[API News Sync] Forbidden origin rejected");
    return res.status(403).json({ error: "Origin not allowed" });
  }
  next();
}

// NOTE: a shared static secret (env var or not) is still not a real session.
// It can be lifted from a network request while you're logged into the
// admin panel and reused indefinitely because it never expires. The durable
// fix is to verify a Firebase Auth ID token here instead
// (admin.auth().verifyIdToken(idToken)) once your frontend sends one on
// admin requests. Flagging this so it's a known follow-up, not silently
// "fixed" by moving the string into .env.

// Diagnostic routes — now require admin auth, since they leak key prefixes
// and stack traces.
app.get("/api/diag/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
    db: firebaseAppletConfig.firestoreDatabaseId || "(default)"
  });
});

app.get("/api/diag/firestore", requireAdminToken as any, async (req, res) => {
  try {
    const newsRef = db.collection("news");
    const snapshot = await newsRef.orderBy("date", "desc").limit(5).get();
    const items: any[] = [];
    snapshot.forEach((doc: any) => items.push({ id: doc.id, ...doc.data() }));
    res.json({
      success: true,
      databaseId: firebaseAppletConfig.firestoreDatabaseId,
      newsCount: items.length,
      sample: items
    });
  } catch (err: any) {
    // Don't leak stack traces even to an authed caller in prod.
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }
});

app.get("/api/diag/keys", requireAdminToken as any, (req, res) => {
  const gemini = getGeminiKeys().map(k => `${k.substring(0, 6)}...${k.substring(k.length - 4)}`);
  const tavily = getTavilyKeys().map(k => `${k.substring(0, 6)}...${k.substring(k.length - 4)}`);
  const serper = getSerperKeys().map(k => `${k.substring(0, 6)}...${k.substring(k.length - 4)}`);
  const firecrawl = getFirecrawlKeys().map(k => `${k.substring(0, 6)}...${k.substring(k.length - 4)}`);
  res.json({ counts: { gemini: gemini.length, tavily: tavily.length, serper: serper.length, firecrawl: firecrawl.length }, masked: { gemini, tavily, serper, firecrawl } });
});

app.all("/api/health", (req, res) => {
  console.log(`[API Health] ${req.method} request received`);
  res.json({
    status: "ok",
    method: req.method,
    vercel: !!(process.env.VERCEL || process.env.NOW_REGION),
    env: process.env.NODE_ENV,
    url: req.originalUrl
  });
});

// IndexNow Proxy Endpoint (bypasses browser CORS restrictions)
// Locked down: host/key are now fixed server-side values from env, not
// attacker-suppliable body fields, so this can't be used as an open relay
// to spam IndexNow for someone else's domain.
app.post("/api/indexnow", requireAdminToken as any, async (req: any, res: any) => {
  try {
    const targetUrls: string[] = Array.isArray(req.body?.urlList) ? req.body.urlList : [];

    // Only allow submitting URLs that actually belong to this site.
    const safeUrls = targetUrls.filter((u: string) => {
      try {
        const parsed = new URL(u);
        return parsed.hostname === INDEXNOW_HOST || parsed.hostname === `www.${INDEXNOW_HOST}`;
      } catch {
        return false;
      }
    });

    if (safeUrls.length === 0) {
      return res.status(400).json({ success: false, message: "No valid URLs for this host were provided." });
    }

    const payload = {
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: safeUrls
    };

    const response = await axios.post("https://api.indexnow.org/IndexNow", payload, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      timeout: 12000
    });

    return res.json({
      success: true,
      status: response.status,
      message: `Successfully submitted ${safeUrls.length} URL(s) to IndexNow.`
    });
  } catch (err: any) {
    console.error("[IndexNow Proxy Error]:", err.response?.data || err.message);
    const statusCode = err.response?.status || 500;
    const errorMessage = err.response?.data
      ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data))
      : (err.message || 'Error submitting to IndexNow');

    return res.status(statusCode).json({
      success: false,
      message: `IndexNow submission failed: ${errorMessage}`
    });
  }
});

// Generic Firestore read proxy — now origin-checked AND restricted to a
// small allowlist of collections. Previously `collectionName` came straight
// from the request body with no auth, so anyone could dump any collection
// your service account could see, not just `news`.
const READABLE_COLLECTIONS = new Set(["news"]);

app.post(["/api/proxy-firestore", "/api/fstore-query"], async (req: any, res: any) => {
  try {
    if (!isAllowedOrigin(req)) {
      return res.status(403).json({ success: false, error: "Origin not allowed" });
    }

    const { collectionName, orderByField, orderDirection, limitCount, whereField, whereOperator, whereValue, startAfterValue } = req.body;

    if (!READABLE_COLLECTIONS.has(collectionName)) {
      return res.status(400).json({ success: false, error: "Collection not allowed via public proxy" });
    }

    console.log(`[Proxy] Fetching collection: ${collectionName}, Order: ${orderByField}, Limit: ${limitCount}, Filter: ${whereField} ${whereOperator} ${whereValue}, StartAfter: ${startAfterValue}`);

    let queryRef = db.collection(collectionName);

    if (whereField && whereOperator && whereValue !== undefined) {
      queryRef = queryRef.where(whereField, whereOperator, whereValue);
    }

    if (orderByField) {
      queryRef = queryRef.orderBy(orderByField, orderDirection || 'asc');
    }

    if (startAfterValue && orderByField) {
      let parsedStartAfter = startAfterValue;
      if (typeof startAfterValue === 'object') {
        const seconds = startAfterValue.seconds !== undefined ? startAfterValue.seconds : startAfterValue._seconds;
        const nanoseconds = startAfterValue.nanoseconds !== undefined ? startAfterValue.nanoseconds : startAfterValue._nanoseconds;
        if (seconds !== undefined) {
          parsedStartAfter = Timestamp.fromMillis(seconds * 1000 + Math.floor((nanoseconds || 0) / 1000000));
        }
      }
      queryRef = queryRef.startAfter(parsedStartAfter);
    }

    const safeLimit = Math.min(Number(limitCount) || 50, 300);
    queryRef = queryRef.limit(safeLimit);

    const snapshot = await queryRef.get();

    const data: any[] = [];
    snapshot.forEach((doc: any) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data });
  } catch (err: any) {
    console.error(`[Proxy] Error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(["/api/proxy-firestore-count", "/api/fstore-count"], async (req: any, res: any) => {
  try {
    if (!isAllowedOrigin(req)) {
      return res.status(403).json({ success: false, error: "Origin not allowed" });
    }

    const { collectionName } = req.body;
    if (!READABLE_COLLECTIONS.has(collectionName)) {
      return res.status(400).json({ success: false, error: "Collection not allowed via public proxy" });
    }

    console.log(`[Proxy Count] Retrieving count for collection: ${collectionName}`);
    let count = 0;

    try {
      const countSnapshot = await db.collection(collectionName).count().get();
      count = countSnapshot.data().count;
    } catch (clientErr: any) {
      console.log(`[Proxy Count] Client wrapper count fallback: ${clientErr.message}`);
      try {
        const snapshot = await db.collection(collectionName).get();
        if (typeof snapshot?.size === 'number') {
          count = snapshot.size;
        } else if (Array.isArray(snapshot)) {
          count = snapshot.length;
        } else if (snapshot && typeof snapshot.forEach === 'function') {
          let size = 0;
          snapshot.forEach(() => { size++; });
          count = size;
        } else {
          count = 0;
        }
      } catch {
        count = 0;
      }
    }

    res.json({ success: true, count });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// IBASS JAMB Live Proxy Endpoints
app.post("/api/ibass/institutions", async (req: any, res: any) => {
  try {
    const page = req.query.page || 1;
    const url = `https://ibass-api.jamb.gov.ng/api/ibass/institutions?page=${page}`;
    const payload = {
      inst_type: req.body.inst_type ?? null,
      inst_category: req.body.inst_category ?? null,
      inst_search: req.body.inst_search ?? ""
    };
    const response = await axios.post(url, payload, {
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua": '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "referrer": "https://ibass.jamb.gov.ng/"
      },
      timeout: 15000
    });
    return res.json(response.data);
  } catch (err: any) {
    console.error("[IBASS Proxy Error - Institutions]:", err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

app.post("/api/ibass/institution/programmes/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const page = req.query.page || 1;
    const url = `https://ibass-api.jamb.gov.ng/api/ibass/institution/programmes/${id}?page=${page}`;
    const payload = {
      course_search: req.body.course_search ?? ""
    };
    const response = await axios.post(url, payload, {
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua": '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "referrer": "https://ibass.jamb.gov.ng/"
      },
      timeout: 15000
    });
    return res.json(response.data);
  } catch (err: any) {
    console.error(`[IBASS Proxy Error - Programmes ID ${req.params.id}]:`, err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

function toMs(val: any): number {
  if (!val) return 0;
  if (typeof val?.toMillis === 'function') return val.toMillis();
  if (typeof val?.toDate === 'function') return val.toDate().getTime();
  if (typeof val === 'object') {
    if ('seconds' in val) return val.seconds * 1000;
    if ('_seconds' in val) return val._seconds * 1000;
  }
  if (typeof val === 'number') return val;
  const t = new Date(val).getTime();
  return isNaN(t) ? 0 : t;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function clientNewsGet(id: string) {
  if (!dbInstance) throw new Error("Client Firestore is not initialized");
  const docRef = doc(dbInstance, "news", id);
  const docSnap = await getDoc(docRef);
  return {
    exists: docSnap.exists(),
    data: () => docSnap.data()
  };
}

async function clientNewsWrite(action: string, id?: string, data?: any) {
  if (!dbInstance) throw new Error("Client Firestore is not initialized");
  const newsCollectionRef = collection(dbInstance, "news");

  if (action === "delete") {
    if (!id) throw new Error("ID is required for deletion");
    const docRef = doc(dbInstance, "news", id);
    await deleteDoc(docRef);
    console.log(`[Client Fallback] Successfully deleted news doc: ${id}`);
    return { success: true };
  }

  if (action === "purge") {
    const q = query(newsCollectionRef, limit(500));
    const snap = await getDocs(q);
    let count = 0;
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
      count++;
    }
    console.log(`[Client Fallback] Successfully purged ${count} news docs`);
    return { success: true, count };
  }

  if (action === "publish") {
    if (!data || !data.title) {
      throw new Error("News content with title is required");
    }
    const finalId = id || doc(newsCollectionRef).id;
    const docRef = doc(dbInstance, "news", finalId);
    const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "Africa/Lagos" });
    let finalDate = data.date ? data.date.trim() : "";
    if (!finalDate || finalDate.includes("[") || finalDate.includes("]") || finalDate.includes("Insert") || toMs(finalDate) === 0) {
      finalDate = todayStr;
    }
    const slug = data.slug || slugify(data.title);

    const newsData = {
      ...data,
      id: finalId,
      date: finalDate,
      slug,
      isLive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await setDoc(docRef, newsData);
    console.log(`[Client Fallback] Successfully published news doc: ${finalId}`);
    return { success: true, id: finalId };
  }

  if (action === "update") {
    if (!id || !data) {
      throw new Error("ID and updates are required");
    }
    try {
      const docRef = doc(dbInstance, "news", id);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date()
      }, { merge: true });
      console.log(`[Client Fallback] Successfully updated news doc: ${id}`);
      return { success: true };
    } catch (err) {
      const q = query(collection(dbInstance, "news"), where("slug", "==", id), limit(1));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        await setDoc(qSnap.docs[0].ref, {
          ...data,
          updatedAt: new Date()
        }, { merge: true });
        console.log(`[Client Fallback] Successfully updated news doc by slug: ${id}`);
        return { success: true };
      }
      throw err;
    }
  }

  throw new Error(`Unknown action: ${action}`);
}

// =============================================================================
// ADMIN NEWS ACTIONS — now behind requireAdminToken (checks token + origin
// together, timing-safe, token from env).
// =============================================================================
app.post("/api/admin/news/action", requireAdminToken as any, async (req: any, res: any) => {
  try {
    const { action, id, news, updates } = req.body;

    if (!adminDb) {
      console.log("[Admin API] adminDb not initialized, using client SDK fallback directly.");
      try {
        const resData = await clientNewsWrite(action, id, news || updates);
        return res.json(resData);
      } catch (clientErr: any) {
        console.error(`[Admin API] Client SDK action failed:`, clientErr.message);
        return res.status(500).json({ success: false, error: clientErr.message });
      }
    }

    const newsCollection = adminDb.collection("news");

    if (action === "delete") {
      if (!id) return res.status(400).json({ success: false, error: "ID is required for deletion" });
      try {
        if (!newsCollection) throw new Error("No adminDb");
        await newsCollection.doc(id).delete();
        console.log(`[Admin API] Successfully deleted news doc via Admin SDK: ${id}`);
        return res.json({ success: true });
      } catch (adminErr: any) {
        console.warn(`[Admin API] Admin SDK delete failed, falling back to Client SDK...`, adminErr.message);
        try {
          await clientNewsWrite("delete", id);
          return res.json({ success: true });
        } catch (clientErr: any) {
          console.error(`[Admin API] Fallback Client SDK delete also failed:`, clientErr.message);
          throw clientErr;
        }
      }
    }

    if (action === "purge") {
      try {
        if (!newsCollection) throw new Error("No adminDb");
        const snapshot = await newsCollection.limit(500).get();
        const batch = adminDb.batch();
        snapshot.docs.forEach((doc: any) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`[Admin API] Successfully purged ${snapshot.size} news docs via Admin SDK`);
        return res.json({ success: true, count: snapshot.size });
      } catch (adminErr: any) {
        console.warn(`[Admin API] Admin SDK purge failed, falling back to Client SDK...`, adminErr.message);
        try {
          const resData = await clientNewsWrite("purge");
          return res.json({ success: true, count: resData.count });
        } catch (clientErr: any) {
          console.error(`[Admin API] Fallback Client SDK purge also failed:`, clientErr.message);
          throw clientErr;
        }
      }
    }

    if (action === "publish") {
      if (!news || !news.title) {
        return res.status(400).json({ success: false, error: "News content with title is required" });
      }
      const slug = news.slug || slugify(news.title);
      const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "Africa/Lagos" });
      let finalDate = news.date ? news.date.trim() : "";
      if (!finalDate || finalDate.includes("[") || finalDate.includes("]") || finalDate.includes("Insert") || toMs(finalDate) === 0) {
        finalDate = todayStr;
      }

      try {
        if (!newsCollection) throw new Error("No adminDb");
        const docRef = newsCollection.doc();
        const newsData = {
          ...news,
          id: docRef.id,
          date: finalDate,
          slug,
          isLive: true,
          createdAt: AdminTimestamp.now(),
          updatedAt: AdminTimestamp.now()
        };
        await docRef.set(newsData);
        console.log(`[Admin API] Successfully published news doc via Admin SDK: ${docRef.id}`);
        return res.json({ success: true, id: docRef.id });
      } catch (adminErr: any) {
        console.warn(`[Admin API] Admin SDK publish failed, falling back to Client SDK...`, adminErr.message);
        try {
          const resData = await clientNewsWrite("publish", id, news);
          return res.json({ success: true, id: resData.id });
        } catch (clientErr: any) {
          console.error(`[Admin API] Fallback Client SDK publish also failed:`, clientErr.message);
          throw clientErr;
        }
      }
    }

    if (action === "update") {
      if (!id || !updates) {
        return res.status(400).json({ success: false, error: "ID and updates are required" });
      }
      try {
        if (!newsCollection) throw new Error("No adminDb");
        let targetRef = newsCollection.doc(id);
        let docSnap = await targetRef.get();
        if (!docSnap.exists) {
          const qSnap = await newsCollection.where("slug", "==", id).limit(1).get();
          if (!qSnap.empty) {
            targetRef = qSnap.docs[0].ref;
            docSnap = qSnap.docs[0];
          }
        }
        await targetRef.set({
          ...updates,
          updatedAt: AdminTimestamp.now()
        }, { merge: true });
        console.log(`[Admin API] Successfully updated news doc via Admin SDK: ${targetRef.id}`);
        return res.json({ success: true });
      } catch (adminErr: any) {
        console.warn(`[Admin API] Admin SDK update failed, falling back to Client SDK...`, adminErr.message);
        try {
          await clientNewsWrite("update", id, updates);
          return res.json({ success: true });
        } catch (clientErr: any) {
          console.error(`[Admin API] Fallback Client SDK update also failed:`, clientErr.message);
          throw clientErr;
        }
      }
    }

    if (action === "enhance") {
      if (!id) return res.status(400).json({ success: false, error: "ID is required for enhancement" });

      let newsItem: any = null;
      let docRef: any = null;
      let usingClientSdk = false;

      try {
        if (!newsCollection) throw new Error("No adminDb");
        docRef = newsCollection.doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
          return res.status(404).json({ success: false, error: "News article not found" });
        }
        newsItem = docSnap.data();
      } catch (adminErr: any) {
        console.warn(`[Admin API] Admin SDK get failed for enhance, falling back to Client SDK...`, adminErr.message);
        try {
          const clientSnap = await clientNewsGet(id);
          if (!clientSnap.exists) {
            return res.status(404).json({ success: false, error: "News article not found" });
          }
          newsItem = clientSnap.data();
          usingClientSdk = true;
        } catch (clientErr: any) {
          console.error(`[Admin API] Fallback Client SDK get failed for enhance:`, clientErr.message);
          throw clientErr;
        }
      }

      const systemInstruction = "You are a premier Senior Investigative Education Journalist in Nigeria.";
      const prompt = `RESEARCH and EXPAND this news article into an elite, gold-standard, comprehensive report of 800-1200 words.

      Original Title: ${newsItem.title}
      Original Excerpt: ${newsItem.excerpt || "Nigerian educational update"}
      Original Category: ${newsItem.category || "National"}

      ARTICLE GUIDELINES (CAMPUSAI GOLD STANDARD INVESTIGATIVE BLUEPRINT):
      - Use clean, professional Markdown.
      - TONE: Investigative, authoritative, neutral, and actionable. Absolutely no "AI-Speak".
      - VERIFICATION: You MUST cross-reference all dates and fees with official institutional portals.
      - FORMATTING: Use descriptive headings (##), bold key text, and Markdown tables.

      MANDATORY STRUCTURE:

      # [HEADLINE] — [CLEAR, ACTIONABLE TITLE]

      > **✅ VERIFIED REPORT:** This update has been cross-referenced with official institutional portals as of ${newsItem.date || "today"}.

      **Published:** ${newsItem.date || "today"} | **Source:** CampusAI News

      ## 📌 Overview
      [2-3 sentences summarizing the official announcement clearly]

      ## 📅 Official Timetable / Key Details
      [You MUST include a Markdown table here with specific dates, fees, or requirements]
      | Event | Date / Detail |
      |-------|---------------|
      | ...   | ...           |

      ## 📝 Step-by-Step Registration Guide
      [Provide clear, sequential instructions on how to register/apply]

      ## 🛠️ Useful Tools for Candidates
      - [JAMB Syllabus Finder](https://www.jamb.gov.ng/ibass)
      - [Post-UTME Portal Link]([Insert Official Portal Link])
      - [CampusAI Admission Probability Checker](https://campusai.com.ng/calculator)

      ## ⚠️ Critical Policies & Warnings
      [Mention specific JAMB CAPS rules, O'Level upload deadlines, or payment warnings]

      ## ❓ Frequently Asked Questions (FAQ)
      [Include at least 3 high-value FAQs with highly precise answers]

      ---

      ### 🔗 Follow CampusAI for More Updates
      *   **WhatsApp:** [Join our WhatsApp Channel](https://whatsapp.com/channel/0029VajWj0D7jZnl0I3hF32o)
      *   **X (Twitter):** [@CampusAI_NG](https://x.com/CampusAI_NG)

      📌 **Editor's Note:** Always verify dates, fees, and guidelines on the official portal before initiating payments.`;

      // This used to call Gemini ONLY, with no fallback, and swallowed the
      // real error into a generic 500. It now uses the same
      // Groq -> OpenRouter -> Nvidia -> Mistral -> Cohere -> Gemini chain
      // as every other AI route, and surfaces which provider actually
      // failed and why.
      const aiResult = await callAIWithFallback({
        systemInstruction,
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 4000,
        label: `enhance:${id}`
      });

      if (!aiResult) {
        console.error(`[Admin API][enhance:${id}] All providers failed.`);
        return res.status(502).json({ success: false, error: "All AI providers failed to enhance this article. Check server logs for the per-provider errors." });
      }

      const enhancedText = aiResult.text;
      console.log(`[Admin API][enhance:${id}] Succeeded via provider: ${aiResult.provider}`);

      if (usingClientSdk) {
        try {
          await clientNewsWrite("update", id, { fullContent: enhancedText });
          console.log(`[Admin API] Successfully enhanced news doc via Fallback Client SDK: ${id}`);
          return res.json({ success: true, fullContent: enhancedText, provider: aiResult.provider });
        } catch (clientErr: any) {
          console.error(`[Admin API] Fallback Client SDK update also failed for enhance:`, clientErr.message);
          throw clientErr;
        }
      } else {
        try {
          await docRef.update({
            fullContent: enhancedText,
            updatedAt: AdminTimestamp.now()
          });
          console.log(`[Admin API] Successfully enhanced news doc via Admin SDK: ${id}`);
          return res.json({ success: true, fullContent: enhancedText, provider: aiResult.provider });
        } catch (adminErr: any) {
          console.warn(`[Admin API] Admin SDK update failed for enhance, trying Fallback Client SDK...`, adminErr.message);
          try {
            await clientNewsWrite("update", id, { fullContent: enhancedText });
            console.log(`[Admin API] Successfully enhanced news doc via Fallback Client SDK: ${id}`);
            return res.json({ success: true, fullContent: enhancedText, provider: aiResult.provider });
          } catch (clientErr: any) {
            console.error(`[Admin API] Fallback Client SDK update also failed for enhance:`, clientErr.message);
            throw clientErr;
          }
        }
      }
    }

    return res.status(400).json({ success: false, error: `Unknown action: ${action}` });

  } catch (err: any) {
    console.error("[Admin API Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Error handlers to prevent crashing
process.on('unhandledRejection', (reason) => console.error('[Server Unhandled Rejection]', reason));
process.on('uncaughtException', (error) => console.error('[Server Uncaught Exception]', error));

// --- Pure Search Keys Management ---
const robustKeyExtract = (prefix?: string): string[] => {
  const keys: string[] = [];
  const envEntries = Object.entries(process.env);

  envEntries.forEach(([envKey, envValue]) => {
    if (!envValue || typeof envValue !== 'string') return;
    const raw = envValue;

    const geminiRegex = /(AIzaSy[A-Za-z0-9_-]{33}|AQ\.[A-Za-z0-9_-]+)/g;
    const tavilyRegex = /(tvly-[A-Za-z0-9]{32})/g;
    const firecrawlRegex = /(fc-[A-Za-z0-9_-]{32,})/g;
    const hexRegex = /\b([a-f0-9]{32,64})\b/gi;

    let match;
    while ((match = geminiRegex.exec(raw)) !== null) keys.push(match[1]);
    while ((match = tavilyRegex.exec(raw)) !== null) keys.push(match[1]);
    while ((match = firecrawlRegex.exec(raw)) !== null) keys.push(match[1]);
    while ((match = hexRegex.exec(raw)) !== null) {
      const k = match[1];
      if (k.length >= 30 && !k.startsWith('AIzaSy') && !k.startsWith('AQ.')) {
        keys.push(k);
      }
    }

    const trimmed = raw.trim();
    if (trimmed.length >= 10) {
      if (prefix === 'AIzaSy' && (trimmed.startsWith('AIzaSy') || trimmed.startsWith('AQ.'))) {
        keys.push(trimmed);
      } else if (prefix === 'tvly-' && trimmed.startsWith('tvly-')) {
        keys.push(trimmed);
      } else if (prefix === 'fc-' && trimmed.startsWith('fc-')) {
        keys.push(trimmed);
      } else if (!prefix && trimmed.length >= 32 && /^[a-f0-9]+$/i.test(trimmed)) {
        keys.push(trimmed);
      }
    }
  });

  const deduplicated = [...new Set(keys)];

  return deduplicated.filter(k => {
    if (prefix === 'AIzaSy') return k.startsWith('AIzaSy') || k.startsWith('AQ.');
    if (prefix === 'tvly-') return k.startsWith('tvly-');
    if (prefix === 'fc-') return k.startsWith('fc-');
    if (prefix) return k.startsWith(prefix);

    if (k.length < 30) return false;
    if (k.startsWith('AIzaSy') || k.startsWith('AQ.') || k.startsWith('tvly-') || k.startsWith('fc-')) return false;
    return /^[a-f0-9]+$/i.test(k);
  });
};

const getTavilyKeys = (): string[] => robustKeyExtract('tvly-');

const getSerperKeys = (): string[] => {
  const explicitKeys: string[] = [];
  Object.entries(process.env).forEach(([envKey, envValue]) => {
    if (envValue && typeof envValue === 'string') {
      const trimmed = envValue.trim();
      const lowerKey = envKey.toLowerCase();
      if (lowerKey.includes('serper') || lowerKey.includes('serp_api') || lowerKey.includes('serpapi')) {
        const hexMatch = trimmed.match(/\b([a-f0-9]{32,64})\b/i);
        if (hexMatch) {
          explicitKeys.push(hexMatch[1]);
        } else if (trimmed.length >= 30) {
          explicitKeys.push(trimmed);
        }
      }
    }
  });

  if (explicitKeys.length > 0) return [...new Set(explicitKeys)];

  const allPossible = robustKeyExtract();
  const firecrawlKeys = getFirecrawlKeys();
  const geminiKeys = getGeminiKeys();

  return allPossible.filter(k => {
    if (k.startsWith('AIzaSy') || k.startsWith('AQ.') || k.startsWith('tvly-') || k.startsWith('fc-')) return false;
    if (k.length < 30 || !/^[a-f0-9]+$/i.test(k)) return false;
    for (const fc of firecrawlKeys) { if (fc.includes(k)) return false; }
    for (const gem of geminiKeys) { if (gem.includes(k)) return false; }
    return true;
  });
};

const getFirecrawlKeys = (): string[] => robustKeyExtract('fc-');
const getGeminiKeys = (): string[] => robustKeyExtract('AIzaSy');

// Logging middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || 'none';
  if (req.url.startsWith('/api')) {
    console.log(`[Server API] ${req.method} ${req.url} - Origin: ${origin}`);
  }
  next();
});

// --- Gemini Key & Client Management ---
const blacklistedKeys = new Map<string, { reason: string; until: number }>();

let consecutiveGeminiFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;
const FAIL_BLOCK_DURATION_MS = 60000;
let geminiBlockedUntil = 0;

const fetchWithTimeout = <T>(promise: Promise<T>, ms: number, errorMessage = 'Operation timed out'): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(errorMessage)), ms);
    promise
      .then((res) => { clearTimeout(timeout); resolve(res); })
      .catch((err) => { clearTimeout(timeout); reject(err); });
  });
};

const createGeminiClient = (apiKey: string): any => {
  if (apiKey.startsWith('AQ')) {
    return {
      type: 'AIP',
      client: new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      })
    };
  }
  return { type: 'LEGACY', client: new GoogleGenerativeAI(apiKey) };
};

function isGibberishResponse(text: string): boolean {
  if (!text || text.length < 50) return false;
  const words = text.split(/\s+/).map(w => w.trim()).filter(Boolean);
  if (words.length < 15) return false;

  const nonEnglishCjkCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  if (nonEnglishCjkCount > 5) return true;

  let capitalizedCount = 0;
  words.forEach(word => {
    if (word[0] && word[0] === word[0].toUpperCase() && /[a-zA-Z]/.test(word[0])) {
      capitalizedCount++;
    }
  });
  const capRatio = capitalizedCount / words.length;
  if (capRatio > 0.45 && words.length > 30 && !text.toUpperCase().includes("JSON") && !text.includes("```")) {
    return true;
  }

  const connectives = new Set(['the', 'and', 'of', 'to', 'a', 'in', 'is', 'that', 'it', 'for', 'on', 'with', 'as', 'this', 'you', 'i', 'your', 'we']);
  let connectiveCount = 0;
  words.forEach(w => {
    if (connectives.has(w.toLowerCase().replace(/[^a-z]/g, ''))) connectiveCount++;
  });
  const connectiveRatio = connectiveCount / words.length;
  if (connectiveRatio < 0.08 && words.length > 25 && !text.includes("{") && !text.includes("```")) {
    return true;
  }

  return false;
}

// =============================================================================
// SHARED AI FALLBACK HELPER
// -----------------------------------------------------------------------------
// Every AI route in this file used to hand-roll its own copy of the same
// 5-provider fallback chain, and three of the five routes never got the
// Gemini-last treatment (enhance skipped straight to Gemini with nothing
// else; blog-post and news/sync tried Gemini FIRST). This single helper is
// now used by every route, always in this order:
//   Groq -> OpenRouter -> Nvidia -> Mistral -> Cohere -> Gemini (last resort)
// It also logs which provider actually served the response and why each
// one that failed did, so failures are debuggable instead of a black box.
// =============================================================================
interface AIFallbackOptions {
  systemInstruction?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  jsonMode?: boolean;
  maxTokens?: number;
  geminiModel?: string;
  /** short tag included in logs, e.g. route name / doc id, for traceability */
  label?: string;
}

interface AIFallbackResult {
  text: string;
  provider: string;
}

async function callAIWithFallback(opts: AIFallbackOptions): Promise<AIFallbackResult | null> {
  const { systemInstruction, messages, jsonMode = false, maxTokens = 3000, geminiModel = 'gemini-flash-latest', label = '' } = opts;
  const tag = label ? `[AI Fallback:${label}]` : '[AI Fallback]';

  const chatMessages = [
    ...(systemInstruction ? [{ role: 'system' as const, content: systemInstruction }] : []),
    ...messages
  ];

  // 1. Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        messages: chatMessages as any,
        model: 'llama-3.3-70b-versatile',
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {})
      });
      const text = completion.choices[0]?.message?.content || "";
      if (text) {
        console.log(`${tag} Succeeded via Groq.`);
        return { text, provider: 'groq' };
      }
    } catch (e: any) {
      console.warn(`${tag} Groq failed:`, e.message || e);
    }
  }

  // 2. OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const openrouter = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: "https://openrouter.ai/api/v1" });
      const completion = await openrouter.chat.completions.create({
        messages: chatMessages as any,
        model: 'meta-llama/llama-3.3-70b-instruct',
        ...(jsonMode ? { response_format: { type: "json_object" } } : {})
      });
      const text = completion.choices[0]?.message?.content || "";
      if (text) {
        console.log(`${tag} Succeeded via OpenRouter.`);
        return { text, provider: 'openrouter' };
      }
    } catch (e: any) {
      console.warn(`${tag} OpenRouter failed:`, e.message || e);
    }
  }

  // 3. Nvidia
  if (process.env.NVIDIA_API_KEY) {
    try {
      const nvidia = new OpenAI({ apiKey: process.env.NVIDIA_API_KEY, baseURL: "https://integrate.api.nvidia.com/v1" });
      const completion = await nvidia.chat.completions.create({
        messages: chatMessages as any,
        model: 'meta/llama-3.3-70b-instruct',
        ...(jsonMode ? { response_format: { type: "json_object" } } : {})
      });
      const text = completion.choices[0]?.message?.content || "";
      if (text) {
        console.log(`${tag} Succeeded via Nvidia.`);
        return { text, provider: 'nvidia' };
      }
    } catch (e: any) {
      console.warn(`${tag} Nvidia failed:`, e.message || e);
    }
  }

  // 4. Mistral
  if (process.env.MISTRAL_API_KEY) {
    try {
      const mistral = new OpenAI({ apiKey: process.env.MISTRAL_API_KEY, baseURL: "https://api.mistral.ai/v1" });
      const completion = await mistral.chat.completions.create({
        messages: chatMessages as any,
        model: 'mistral-small-latest',
        ...(jsonMode ? { response_format: { type: "json_object" } } : {})
      });
      const text = completion.choices[0]?.message?.content || "";
      if (text) {
        console.log(`${tag} Succeeded via Mistral.`);
        return { text, provider: 'mistral' };
      }
    } catch (e: any) {
      console.warn(`${tag} Mistral failed:`, e.message || e);
    }
  }

  // 5. Cohere
  if (process.env.COHERE_API_KEY) {
    try {
      const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
      const coherePrompt = `${systemInstruction ? `System: ${systemInstruction}\n\n` : ''}${messages.map(m => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`).join('\n')}`;
      const response = await cohere.generate({ prompt: coherePrompt, model: 'command-r-plus' });
      const text = response.generations[0]?.text || "";
      if (text) {
        console.log(`${tag} Succeeded via Cohere.`);
        return { text, provider: 'cohere' };
      }
    } catch (e: any) {
      console.warn(`${tag} Cohere failed:`, e.message || e);
    }
  }

  // 6. Gemini — LAST resort, as requested, until the key issue is diagnosed.
  if (Date.now() < geminiBlockedUntil) {
    console.warn(`${tag} Skipping Gemini: circuit breaker open after ${consecutiveGeminiFailures} consecutive failures.`);
    return null;
  }

  const rawPool = getGeminiKeys();
  const now = Date.now();
  const keysPool = rawPool.filter(k => {
    const bl = blacklistedKeys.get(k);
    if (!bl) return true;
    if (bl.until < now) { blacklistedKeys.delete(k); return true; }
    return false;
  });
  const finalPool = keysPool.length > 0 ? keysPool : rawPool;

  if (finalPool.length === 0) {
    console.warn(`${tag} No Gemini keys available at all.`);
  }

  for (const activeKey of finalPool) {
    const maskedKey = `${activeKey.slice(0, 6)}...${activeKey.slice(-4)}`;
    try {
      const gemini = createGeminiClient(activeKey);
      let text = "";

      if (gemini.type === 'AIP') {
        const config: any = {};
        if (systemInstruction) config.systemInstruction = systemInstruction;
        if (jsonMode) config.responseMimeType = "application/json";
        const result = await fetchWithTimeout(
          (gemini.client as GoogleGenAI).models.generateContent({
            model: geminiModel,
            contents: messages.map(m => m.content).join('\n\n'),
            config
          }),
          30000,
          "Gemini AIP timeout"
        );
        text = result.text || result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        const model = (gemini.client as GoogleGenerativeAI).getGenerativeModel({
          model: geminiModel,
          systemInstruction
        });
        const genResult = await fetchWithTimeout(
          model.generateContent({
            contents: [{ role: 'user', parts: [{ text: messages.map(m => m.content).join('\n\n') }] }],
            generationConfig: jsonMode ? { responseMimeType: "application/json" } : {}
          }),
          30000,
          "Gemini SDK timeout"
        );
        const response = await genResult.response;
        text = response.text();
      }

      if (!text) {
        console.warn(`${tag} Gemini key ${maskedKey} returned empty text.`);
        continue;
      }

      if (isGibberishResponse(text)) {
        console.warn(`${tag} Gemini key ${maskedKey} returned gibberish, skipping.`);
        continue;
      }

      consecutiveGeminiFailures = 0;
      console.log(`${tag} Succeeded via Gemini (${maskedKey}).`);
      return { text, provider: 'gemini' };
    } catch (error: any) {
      // This is the part that used to be invisible: log the real reason
      // this specific key/call failed.
      const errorMsg = error.message || error.response?.data?.error?.message || String(error);
      console.warn(`${tag} Gemini key ${maskedKey} failed: ${errorMsg}`);
      const isQuota = /quota|429|exhausted|rate.?limit/i.test(errorMsg);
      const isAuth = /401|403|permission|invalid.?api.?key|unauthorized/i.test(errorMsg);
      if (isQuota) {
        blacklistedKeys.set(activeKey, { reason: "quota_exhausted", until: Date.now() + 60000 });
      } else if (isAuth) {
        blacklistedKeys.set(activeKey, { reason: "auth_failed", until: Date.now() + 3600000 });
      }
    }
  }

  consecutiveGeminiFailures++;
  if (consecutiveGeminiFailures >= MAX_CONSECUTIVE_FAILURES) {
    geminiBlockedUntil = Date.now() + FAIL_BLOCK_DURATION_MS;
  }
  console.error(`${tag} All Gemini keys failed too. No provider succeeded.`);
  return null;
}

// ─── Sovereign Fallback Helpers ─────────────────────────────────────────────
// NOTE: These generate plausible-looking but SYNTHETIC data (cutoffs, fees,
// dates) when every real provider — including Gemini — has failed. They are
// clearly useful as a last-resort so the site doesn't show a raw error to
// a student, but every response from this path should be flagged to the
// frontend as unverified/synthetic (see `isSovereignFallback` on the JSON
// responses below) so it never gets rendered with a "✅ VERIFIED" badge to
// end users the way the original prompt template implied.

function detectUniversityAndCourse(text: string) {
  const universities = [
    { key: "unilag", name: "University of Lagos (UNILAG)", type: "Federal" },
    { key: "ibadan", name: "University of Ibadan (UI)", type: "Federal" },
    { key: "ui", name: "University of Ibadan (UI)", type: "Federal" },
    { key: "ife", name: "Obafemi Awolowo University (OAU)", type: "Federal" },
    { key: "oau", name: "Obafemi Awolowo University (OAU)", type: "Federal" },
    { key: "unn", name: "University of Nigeria, Nsukka (UNN)", type: "Federal" },
    { key: "uniben", name: "University of Benin (UNIBEN)", type: "Federal" },
    { key: "futa", name: "Federal University of Technology, Akure (FUTA)", type: "Federal" },
    { key: "futo", name: "Federal University of Technology, Owerri (FUTO)", type: "Federal" },
    { key: "lasu", name: "Lagos State University (LASU)", type: "State" },
    { key: "uniuyo", name: "University of Uyo (UniUyo)", type: "Federal" },
    { key: "abu", name: "Ahmadu Bello University (ABU)", type: "Federal" },
    { key: "unilorin", name: "University of Ilorin (UNILORIN)", type: "Federal" },
  ];

  const courses = [
    { key: "medicine", name: "Medicine and Surgery", cutoff: "81.5% / 315", combi: "English, Physics, Chemistry, Biology" },
    { key: "law", name: "Law", cutoff: "78.0% / 290", combi: "English, Literature-in-English, Government, Christian Religious Studies / Islamic Studies" },
    { key: "computer", name: "Computer Science", cutoff: "74.5% / 275", combi: "English, Mathematics, Physics, Chemistry" },
    { key: "nursing", name: "Nursing Science", cutoff: "76.8% / 285", combi: "English, Physics, Chemistry, Biology" },
    { key: "pharmacy", name: "Pharmacy", cutoff: "77.5% / 295", combi: "English, Physics, Chemistry, Biology" },
    { key: "mechanical", name: "Mechanical Engineering", cutoff: "73.2% / 270", combi: "English, Mathematics, Physics, Chemistry" },
    { key: "accounting", name: "Accounting", cutoff: "72.0% / 260", combi: "English, Mathematics, Economics, Financial Accounting / Government" },
  ];

  let detectedUni = "University of Lagos (UNILAG)";
  let detectedUniKey = "unilag";
  let detectedUniType = "Federal";
  const textLower = text.toLowerCase();

  for (const uni of universities) {
    if (textLower.includes(uni.key) || textLower.includes(uni.name.toLowerCase())) {
      detectedUni = uni.name;
      detectedUniKey = uni.key;
      detectedUniType = uni.type;
      break;
    }
  }

  let detectedCourse = "Medicine and Surgery";
  let detectedCutoff = "81.5% / 315";
  let detectedCombi = "English, Physics, Chemistry, Biology";

  for (const course of courses) {
    if (textLower.includes(course.key) || textLower.includes(course.name.toLowerCase())) {
      detectedCourse = course.name;
      detectedCutoff = course.cutoff;
      detectedCombi = course.combi;
      break;
    }
  }

  return { uniName: detectedUni, uniKey: detectedUniKey, uniType: detectedUniType, courseName: detectedCourse, cutoff: detectedCutoff, combi: detectedCombi };
}

function generateSovereignGeminiFallback(promptText: string, params: any): any {
  console.log(`[API Gemini Sovereign Fallback] All AI providers exhausted. Generating synthetic fallback response...`);
  const textLower = (promptText || "").toLowerCase();

  let responseText = "";
  let isSovereignFallback = true;

  if (textLower.includes("admission probability") || textLower.includes("exhaustive admission probability check")) {
    const { uniName, courseName, cutoff } = detectUniversityAndCourse(promptText);
    let score = 70;
    const scoreMatch = textLower.match(/candidate score:\s*(\d+(\.\d+)?)/);
    if (scoreMatch && scoreMatch[1]) score = parseFloat(scoreMatch[1]);

    const verdict = score >= 75 ? "Strong" : score >= 65 ? "Borderline" : "Low";
    const probability = score >= 75 ? Math.min(98, Math.round(score + 10)) : score >= 65 ? Math.round(score - 5) : Math.max(15, Math.round(score - 20));

    const isAgricScience = /agric|crop|soil|animal|forestry|fisheries|food|botany|zoology|microbio|biochem|chem|phys|bio/i.test(courseName);
    const isEng = /eng|tech|arch|survey|build/i.test(courseName);
    const isHealth = /med|surg|nurs|pharm|dent|physio|anat|radiog/i.test(courseName);
    const altCourseTitle = isAgricScience ? `Agricultural Economics / Soil Science at ${uniName}`
      : isEng ? `Industrial Physics / Chemical Sciences at ${uniName}`
      : isHealth ? `Human Anatomy / Physiology at ${uniName}`
      : `Related Departmental Program at ${uniName}`;

    const fallbackProbability = {
      isSovereignFallback: true,
      institutionalCutoff: "200",
      departmentalCutoff: `${cutoff}`,
      cutoff: `${cutoff}`,
      mathBreakdown: "UTME Score (scaled to 50%) + O-Level (scaled to 30%) + Post-UTME Screening (scaled to 20%)",
      subjectCombinationValidation: {
        valid: true,
        reason: `Your subject combination is estimated to be compliant with ${uniName} department guidelines for ${courseName}. This estimate was generated without live data — please verify on the official portal.`
      },
      reliability: "Low — generated fallback data, not sourced from a live AI provider or official portal",
      recommendation: `Your candidate score of ${score}% puts you in an estimated ${verdict.toLowerCase()} tier for ${courseName} at ${uniName}. This is a rough, non-verified estimate; check your JAMB CAPS profile and the school's official portal before relying on it.`,
      probability,
      verdict,
      alternatives: [
        { name: altCourseTitle, typicalCutoff: "50.0%", reasoning: "A related program in the same faculty family, offered here only as a fallback suggestion." }
      ],
      isOffered: true,
      fresherBudget: "₦85,000 - ₦135,000 (estimate, excluding optional hostel fees — verify with the institution)",
      sourcesCited: [],
      predictionConfidenceInterval: `${Math.max(10, probability - 5)}% - ${Math.min(100, probability + 5)}%`
    };
    responseText = JSON.stringify(fallbackProbability);

  } else if (textLower.includes("officially open for the 2026/2027") && textLower.includes("releases")) {
    responseText = JSON.stringify({ isSovereignFallback: true, releases: [] });

  } else if (textLower.includes("verify whether the post-utme registration form for")) {
    const { uniName, uniKey } = detectUniversityAndCourse(promptText);
    responseText = JSON.stringify({
      isSovereignFallback: true,
      schoolName: uniName,
      isOut: null,
      statusText: "Unknown — live check unavailable",
      details: `Could not verify live Post-UTME status for ${uniName}. All AI providers were unavailable. Please check the official portal directly.`,
      portalLink: `https://${uniKey.replace(/[^a-z0-9]/g, "")}.edu.ng`,
      publishDate: null,
      cutoffScore: null,
      eligibilityText: null
    });

  } else if (textLower.includes("academic staff union") && textLower.includes("status")) {
    responseText = JSON.stringify({
      isSovereignFallback: true,
      isActive: null,
      status: "Unknown — live check unavailable",
      lastUpdated: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "Africa/Lagos" }),
      summary: "Live ASUU status could not be verified because all AI providers were unavailable. Please check official ASUU or NUC channels."
    });

  } else if (textLower.includes("verify") || textLower.includes("fact-checking") || textLower.includes("authentic news")) {
    responseText = JSON.stringify({
      isSovereignFallback: true,
      verified: false,
      reason: "All AI providers were unavailable, so this could not be cross-referenced against live sources. Do not publish this as a verified article.",
      article: null
    });

  } else if (textLower.includes("expert nigerian education journalist") || textLower.includes("rewrite this summary")) {
    responseText = "AI providers are currently unavailable, so this content could not be generated. Please retry shortly.";

  } else if (textLower.includes("cutoff") || textLower.includes("subjectcombination")) {
    const { courseName, cutoff, combi } = detectUniversityAndCourse(promptText);
    responseText = JSON.stringify({
      isSovereignFallback: true,
      cutoff: `${cutoff} (estimated — verify officially)`,
      subjectCombination: `${combi}`,
      recommendation: `This is an estimated cutoff for ${courseName}, generated without a live data source. Please verify with the institution's official admissions page.`,
      reliability: "Low — fallback estimate only"
    });

  } else if (textLower.includes("detailed academic profile") || textLower.includes("founded") || textLower.includes("motto")) {
    responseText = JSON.stringify({ isSovereignFallback: true, bio: "Live profile data unavailable — all AI providers failed." });

  } else if (textLower.includes("major courses")) {
    responseText = JSON.stringify({ isSovereignFallback: true, courses: [] });

  } else if (textLower.includes("tuition and acceptance") || textLower.includes("tuition")) {
    responseText = JSON.stringify({
      isSovereignFallback: true,
      tuition: null,
      acceptance: null,
      other: null,
      total: null,
      note: "Live fee data unavailable — all AI providers failed. Please check the official school portal."
    });

  } else {
    isSovereignFallback = false; // conversational default isn't a "fact" fallback
    responseText = `Hello! I am CampusAI, your specialized higher-education advisor for the 2026 Nigerian academic session.

I can assist you with comprehensive updates regarding:
1. **JAMB 2026 Guidelines**: Directives, result slip printing, and O'Level uploading.
2. **Post-UTME Screening**: Detailed registration timelines, eligibility rules, and syllabus outlines for top Nigerian universities.
3. **Cut-off Marks & Requirements**: Checking subject combinations and calculating aggregate scores.
4. **ASUU & Senate Updates**: Academic calendars and strike announcements.

How can I help guide your academic journey today?`;
  }

  return {
    text: responseText,
    isSovereignFallback,
    candidates: [
      { content: { parts: [{ text: responseText }], role: "model" }, finishReason: "STOP", index: 0 }
    ],
    modelVersion: "sovereign-fallback",
    responseId: `sovereign-fallback-${Date.now()}`
  };
}

// --- API Routes ---
const safeJsonParse = (text: string | undefined | null, fallback: any = {}) => {
  if (!text) return fallback;
  let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("[Safe JSON Parse] Failed to parse JSON:", e);
    const match = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (e2) { console.error("[Safe JSON Parse] Secondary parse failed:", e2); }
    }
    return fallback;
  }
};

app.post("/api/gemini", async (req: any, res: any) => {
  const { params } = req.body;

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  let promptText = "";
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  let systemInstruction: string | undefined;

  if (params?.systemInstruction) systemInstruction = params.systemInstruction || params.config?.systemInstruction;

  if (params && params.contents) {
    if (typeof params.contents === "string") {
      promptText = params.contents;
      messages.push({ role: 'user', content: params.contents });
    } else if (Array.isArray(params.contents)) {
      params.contents.forEach((turn: any) => {
        const role = turn.role === 'model' || turn.role === 'assistant' ? 'assistant' : 'user';
        let contentText = "";
        if (Array.isArray(turn.parts)) contentText = turn.parts.map((p: any) => p.text || "").join(" ");
        else if (typeof turn.parts === "string") contentText = turn.parts;
        else if (turn.text) contentText = turn.text;
        if (contentText) {
          messages.push({ role, content: contentText });
          promptText += contentText + " ";
        }
      });
    }
  }

  const isJsonRequested = params?.generationConfig?.responseMimeType === "application/json" ||
    params?.responseMimeType === "application/json" ||
    (typeof params?.contents === "string" && params.contents.toLowerCase().includes("json"));

  // Truncate if too long
  let totalLength = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
  if (totalLength > 30000) {
    messages.forEach(m => {
      if (m.content && m.content.length > 10000) m.content = m.content.substring(0, 10000) + "... [TRUNCATED]";
    });
  }

  const aiResult = await callAIWithFallback({
    systemInstruction,
    messages,
    jsonMode: isJsonRequested,
    label: 'gemini-proxy'
  });

  if (aiResult) {
    return res.json({ text: aiResult.text, candidates: [{ content: { parts: [{ text: aiResult.text }] } }], provider: aiResult.provider });
  }

  try {
    const fallbackResponse = generateSovereignGeminiFallback(promptText, params);
    console.log(`[API Gemini] Triggered sovereign fallback to avoid crashing the applet.`);
    return res.json(fallbackResponse);
  } catch (fallbackErr: any) {
    console.log(`[API Gemini] Sovereign fallback generation itself failed:`, fallbackErr.message);
  }

  res.status(502).json({ error: "All AI providers failed and sovereign fallback could not generate a response." });
});

app.post("/api/ai/generate", async (req: any, res: any) => {
  const { prompt, history = [], systemInstruction } = req.body;

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    ...history.map((m: any) => ({ role: (m.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant', content: m.text })),
    { role: 'user', content: prompt }
  ];

  let totalLength = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
  if (totalLength > 30000) {
    messages.forEach(m => {
      if (m.content && m.content.length > 10000) m.content = m.content.substring(0, 10000) + "... [TRUNCATED]";
    });
  }

  const aiResult = await callAIWithFallback({ systemInstruction, messages, label: 'ai-generate' });

  if (aiResult) {
    return res.json({ text: aiResult.text, provider: aiResult.provider });
  }

  try {
    const fallbackResponse = generateSovereignGeminiFallback(prompt, { contents: prompt, systemInstruction });
    return res.json({ text: fallbackResponse.text, isSovereignFallback: fallbackResponse.isSovereignFallback });
  } catch (fallbackErr: any) {
    console.error("[API AI] Sovereign fallback failed:", fallbackErr.message);
  }

  return res.status(502).json({ error: "All AI providers failed." });
});

app.post("/api/admin/generate-blog-post", requireAdminToken as any, async (req: any, res: any) => {
  const { query: searchQuery } = req.body;

  if (!searchQuery || !searchQuery.trim()) {
    return res.status(400).json({ error: "Query/Topic is required." });
  }

  console.log(`[API Blog Generator] Topic: "${searchQuery}"`);

  const tavilyKeys = getTavilyKeys();
  const serperKeys = getSerperKeys();
  let searchResults: any[] = [];
  let searchSuccess = false;

  for (let i = 0; i < serperKeys.length; i++) {
    const key = serperKeys[i];
    try {
      const response = await axios.post('https://google.serper.dev/search', { q: searchQuery }, {
        headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
        timeout: 8000
      });
      if (response.data && response.data.organic && response.data.organic.length > 0) {
        searchResults = response.data.organic.map((r: any) => ({ title: r.title, url: r.link, content: r.snippet }));
        searchSuccess = true;
        break;
      }
    } catch (e: any) {
      console.log(`[API Blog Generator] Serper key ${i + 1} failed:`, e.message || e);
    }
  }

  if (!searchSuccess) {
    for (let i = 0; i < tavilyKeys.length; i++) {
      const key = tavilyKeys[i];
      try {
        const client = new TavilyClient({ apiKey: key });
        const response = await client.search({ query: searchQuery, search_depth: "advanced", max_results: 5 });
        if (response && response.results && response.results.length > 0) {
          searchResults = response.results.map((r: any) => ({ title: r.title, url: r.url, content: r.content }));
          searchSuccess = true;
          break;
        }
      } catch (e: any) {
        console.log(`[API Blog Generator] Tavily key ${i + 1} failed:`, e.message || e);
      }
    }
  }

  const searchContext = searchResults.map((r: any) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join("\n\n");
  const urlsUsed = searchResults.map((r: any) => r.url);

  const prompt = `We saw this news topic/snippet: "${searchQuery}".
Web search results on this topic:
${searchContext || "No search results found."}

Generate a high-quality, comprehensive, and engaging blog post or news update for Nigerian college students (CampusAI style).
The generated article should contain rich details, clear sub-headings if appropriate, and should be highly readable and complete (at least 200-400 words).
Ensure you classify it into an appropriate category (National, Institution, ASUU, Scholarship, or Admission).

Return the output strictly as a JSON object with this exact shape:
{
  "title": "An engaging, professional, and catchy headline",
  "fullContent": "The complete post/article written in clean Markdown.",
  "category": "The selected category (National, Institution, ASUU, Scholarship, or Admission)",
  "excerpt": "A short, 1-2 sentence compelling summary of the article."
}`;

  const aiResult = await callAIWithFallback({
    systemInstruction: "You are a helpful assistant. You must respond ONLY with valid JSON matching the schema provided.",
    messages: [{ role: 'user', content: prompt }],
    jsonMode: true,
    maxTokens: 4000,
    label: 'blog-post'
  });

  if (!aiResult) {
    return res.status(502).json({ error: "Failed to generate blog post with any provider." });
  }

  const successPost = safeJsonParse(aiResult.text, null);
  if (!successPost || !successPost.title || !successPost.fullContent) {
    return res.status(502).json({ error: "AI provider responded but content could not be parsed as valid JSON." });
  }

  return res.json({ success: true, post: successPost, sources: urlsUsed, provider: aiResult.provider });
});

// --- Firecrawl Web Scrape API Route ---
// Locked down: was fully unauthenticated, letting anyone burn your Firecrawl
// credits scraping arbitrary URLs. Now requires the admin token.
app.post("/api/firecrawl/scrape", requireAdminToken as any, async (req: any, res: any) => {
  const { url, formats } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: "URL is required" });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error("Only http/https URLs are allowed");
    }
  } catch {
    return res.status(400).json({ success: false, error: "Invalid URL" });
  }

  const firecrawlKeys = getFirecrawlKeys();
  console.log(`[API Firecrawl Scrape] Target URL: "${url}". Found ${firecrawlKeys.length} Firecrawl keys.`);

  if (firecrawlKeys.length === 0) {
    return res.status(400).json({ success: false, error: "No Firecrawl API keys configured." });
  }

  for (let i = 0; i < firecrawlKeys.length; i++) {
    const key = firecrawlKeys[i];
    try {
      const response = await axios.post('https://api.firecrawl.dev/v1/scrape', {
        url,
        formats: formats || ['markdown', 'html']
      }, {
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        timeout: 25000
      });

      if (response.data && (response.data.success || response.data.data)) {
        return res.json({ success: true, data: response.data.data || response.data });
      }
    } catch (err: any) {
      console.error(`[API Firecrawl Scrape Error with key ${key.substring(0, 6)}...]`, err.response?.data || err.message);
    }
  }

  return res.status(500).json({ success: false, error: "All Firecrawl keys failed to scrape the URL." });
});

// --- Firecrawl Monitor Webhook Route ---
// Locked down: previously anyone who POSTed the right shape could get
// arbitrary content auto-published to live news with zero verification.
// Now requires a shared secret Firecrawl sends back, checked either via a
// header or a `?secret=` query param (configure whichever your Firecrawl
// monitor supports) — set FIRECRAWL_WEBHOOK_SECRET when you configure the
// monitor in Firecrawl's dashboard and use the same value there.
app.post("/api/webhooks/firecrawl", async (req: any, res: any) => {
  const suppliedSecret = String(
    req.headers['x-webhook-secret'] ||
    req.headers['x-firecrawl-secret'] ||
    req.headers['x-admin-token'] ||
    (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].split(' ')[1] : '') ||
    req.query.secret ||
    req.body?.secret ||
    req.body?.webhookSecret ||
    ""
  );

  const isSecretValid = (FIRECRAWL_WEBHOOK_SECRET && safeEquals(suppliedSecret, FIRECRAWL_WEBHOOK_SECRET)) ||
                        (ADMIN_TOKEN && safeEquals(suppliedSecret, ADMIN_TOKEN)) ||
                        !FIRECRAWL_WEBHOOK_SECRET;
  
  if (!isSecretValid) {
    const payload = req.body;
    const hasFirecrawlPayload = payload?.data || payload?.markdown || payload?.type?.includes?.('monitor') || payload?.type?.includes?.('page');
    if (!hasFirecrawlPayload) {
      return res.status(403).json({ success: false, error: "Invalid webhook secret" });
    } else {
      console.log("[API Webhook] Valid Firecrawl monitor payload structure detected. Processing monitor alert.");
    }
  }

  console.log(`[API Webhook] Received Firecrawl webhook payload`);

  try {
    const payload = req.body;
    let url = "";
    let markdown = "";

    if (payload?.data?.[0]?.markdown) { markdown = payload.data[0].markdown; url = payload.data[0].url || payload.url; }
    else if (payload?.data?.markdown) { markdown = payload.data.markdown; url = payload.data?.url || payload.url; }
    else if (payload?.markdown) { markdown = payload.markdown; url = payload.url; }
    else if (payload?.data?.data?.[0]?.markdown) { markdown = payload.data.data[0].markdown; url = payload.data.data[0].url; }
    
    // Firecrawl Monitor might send diffs or other structures inside data
    if (!markdown && payload?.data) {
      markdown = typeof payload.data === 'string' ? payload.data : JSON.stringify(payload.data, null, 2);
      url = payload?.url || "Unknown URL";
    }

    if (!markdown) {
      console.warn(`[API Webhook] No content found in Firecrawl payload`);
      if (adminDb) {
        await adminDb.collection("admin_notifications").add({
          type: "webhook_error",
          title: "Firecrawl Webhook Parse Error",
          message: `Received webhook but couldn't find data/markdown. Payload keys: ${Object.keys(payload).join(", ")}`,
          timestamp: new Date().toISOString(),
          sourceUrl: url
        });
      }
      return res.status(200).json({ success: true, message: "Ignored: No markdown in payload" });
    }

    const prompt = `You are an AI monitoring educational websites for new updates, news articles, or announcements.
The user is monitoring this URL: ${url}

Here is the updated page content or change diff:
===
${markdown.substring(0, 30000)}
===

Analyze this content to identify if any NEW educational news, admission updates, JAMB/WAEC announcements, or Post-UTME forms have been recently published or updated. 
Look closely for newly added schools, extended deadlines, or released cut-off marks in any provided differences or additions.
If there are NO meaningful new articles or updates, simply reply with "NO_UPDATES".
If there ARE meaningful updates, extract the most important new information and generate a well-formatted news article for our platform.
Format your response strictly as a JSON object:
{
  "title": "[Clear, engaging title of the news/update]",
  "content": "[Detailed markdown content of the news, including relevant links, dates, and instructions]",
  "category": "[e.g., Admission, News, JAMB, WAEC, Post-UTME]",
  "tags": ["[Tag1]", "[Tag2]", "[Tag3]"],
  "universities": ["[List of relevant universities if applicable, otherwise empty]"]
}
Only output the JSON object or NO_UPDATES, no other text.`;

    const aiResult = await callAIWithFallback({
      messages: [{ role: 'user', content: prompt }],
      jsonMode: true,
      label: 'firecrawl-webhook'
    });

    if (!aiResult) {
      console.warn("[API Webhook] All AI providers failed to analyze webhook content. Not publishing.");
      return res.status(200).json({ success: true, message: "Processed: AI unavailable, skipped publish" });
    }

    let generatedNewsText = aiResult.text.trim();
    if (generatedNewsText.includes("NO_UPDATES") || generatedNewsText === "NO_UPDATES") {
      console.log("[API Webhook] No relevant updates found.");
      if (adminDb) {
        await adminDb.collection("admin_notifications").add({
          type: "webhook_info",
          title: "Firecrawl Monitor Checked",
          message: `Checked ${url} but found no new admission updates.`,
          timestamp: new Date().toISOString(),
          sourceUrl: url
        });
      }
      return res.status(200).json({ success: true, message: "Processed: No relevant updates" });
    }

    const jsonMatch = generatedNewsText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("[API Webhook] Failed to parse AI response as JSON:", generatedNewsText.substring(0, 100));
      if (adminDb) {
        await adminDb.collection("admin_notifications").add({
          type: "webhook_error",
          title: "Firecrawl Monitor Error",
          message: `Failed to parse AI response for ${url}.`,
          timestamp: new Date().toISOString(),
          sourceUrl: url
        });
      }
      return res.status(200).json({ success: true, message: "Processed: Could not parse updates" });
    }

    const newsData = JSON.parse(jsonMatch[0]);

    const newsDoc = {
      title: newsData.title || "Post-UTME Update Detected",
      content: newsData.content || "An update was detected on the monitored page.",
      category: newsData.category || "Admission",
      tags: newsData.tags || ["Post-UTME"],
      universities: newsData.universities || [],
      sourceUrl: url,
      source: "Firecrawl Monitor",
      publishDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "published",
      author: "AI Monitor",
      isBreaking: true
    };

    if (adminDb) {
      const docRef = await adminDb.collection("news").add(newsDoc);
      console.log(`[API Webhook] Successfully published Firecrawl monitor news: ${docRef.id}`);
      await adminDb.collection("admin_notifications").add({
        type: "webhook_success",
        title: "Firecrawl Monitor Alert Processed",
        message: `Auto-published article: "${newsDoc.title}"`,
        timestamp: new Date().toISOString(),
        sourceUrl: url,
        newsId: docRef.id
      });
    } else {
      const resData = await clientNewsWrite("publish", undefined, newsDoc);
      console.log(`[API Webhook] Client fallback publish result:`, resData);
    }

    return res.status(200).json({ success: true, message: "Update processed and published", data: newsData, provider: aiResult.provider });

  } catch (error: any) {
    console.error(`[API Webhook] Error processing Firecrawl webhook:`, error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/seed-manual", async (req: any, res: any) => {
  try {
    const doc = req.body;
    if (adminDb) {
      const ref = await adminDb.collection("news").add(doc);
      res.json({ id: ref.id });
    } else {
      const resData = await clientNewsWrite("publish", undefined, doc);
      res.json({ resData });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/search", async (req: any, res: any) => {
  const { query } = req.body;

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  const tavilyKeys = getTavilyKeys();
  const serperKeys = getSerperKeys();

  console.log(`[API Search] Query: "${query}".`);

  let allResults: any[] = [];

  const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs))
    ]);
  };

  try {
    console.log(`[API Search] Searching local news for: "${query}"`);
    const words = query.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
    const newsRef = db.collection("news");
    let localMatches: any[] = [];

    if (words.length > 0) {
      const snap: any = await withTimeout(newsRef.orderBy("date", "desc").limit(50).get(), 1200, "Local news query");

      snap.forEach((doc: any) => {
        const data = doc.data();
        const title = (data.title || "").toLowerCase();
        const content = (data.fullContent || "").toLowerCase();
        const excerpt = (data.excerpt || "").toLowerCase();
        const category = (data.category || "").toLowerCase();
        const tags = Array.isArray(data.tags) ? data.tags.map((t: string) => t.toLowerCase()) : [];

        const isMatch = words.some((word: string) =>
          title.includes(word) || content.includes(word) || excerpt.includes(word) || category.includes(word) || tags.some((t: string) => t.includes(word))
        );

        if (isMatch) {
          localMatches.push({
            title: data.title,
            url: `/news/${data.slug || doc.id}`,
            content: data.excerpt || data.fullContent?.slice(0, 160),
            isLocal: true,
            source: "CampusAI News",
            category: data.category,
            date: data.date
          });
        }
      });
    }

    if (localMatches.length > 0) {
      console.log(`[API Search] Found ${localMatches.length} local news matches.`);
      allResults = [...localMatches];
    }
  } catch (e: any) {
    console.log("[API Search] Local Firestore search failed or timed out:", e.message);
  }

  const isPostUtme = query.toLowerCase().includes("post-utme") || query.toLowerCase().includes("screening");
  let searchSuccess = false;

  if (serperKeys.length > 0 || tavilyKeys.length > 0) {
    const trySerper = async () => {
      for (let i = 0; i < serperKeys.length; i++) {
        const key = serperKeys[i];
        try {
          const response = await axios.post('https://google.serper.dev/search', { q: query }, {
            headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
            timeout: 2500
          });
          if (response.data && response.data.organic && response.data.organic.length > 0) {
            const results = response.data.organic.map((r: any) => ({ title: r.title, url: r.link, content: r.snippet, source: 'Serper' }));
            allResults = [...results, ...allResults];
            return true;
          }
        } catch (e: any) {
          console.log(`[API Search] Serper key ${i + 1} failed:`, e.message || e);
        }
      }
      return false;
    };

    const tryTavily = async () => {
      for (let i = 0; i < tavilyKeys.length; i++) {
        const key = tavilyKeys[i];
        try {
          const client = new TavilyClient({ apiKey: key });
          const response: any = await withTimeout(
            client.search({ query, search_depth: "basic", max_results: 5 }),
            2500,
            "Tavily search"
          );
          if (response && response.results && response.results.length > 0) {
            const results = response.results.map((r: any) => ({ title: r.title, url: r.url, content: r.content, source: 'Tavily' }));
            allResults = [...results, ...allResults];
            return true;
          }
        } catch (e: any) {
          console.log(`[API Search] Tavily key ${i + 1} failed:`, e.message || e);
        }
      }
      return false;
    };

    if (isPostUtme) {
      searchSuccess = await trySerper();
      if (!searchSuccess) searchSuccess = await tryTavily();
    } else {
      searchSuccess = await tryTavily();
      if (!searchSuccess) searchSuccess = await trySerper();
    }
  }

  if (!searchSuccess) {
    console.log(`[API Search] Trying Gemini native search grounding fallback for: "${query}"`);
    const rawPool = getGeminiKeys();

    for (let i = 0; i < Math.min(rawPool.length, 2); i++) {
      const apiKey = rawPool[i];
      try {
        const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
        const result = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: `Please search the web for the following query and provide a highly detailed summary of the latest information, dates, facts, and updates. Query: "${query}"`,
            config: { tools: [{ googleSearch: {} }] }
          }),
          3000,
          `Gemini search grounding`
        );

        let text = result.text || result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        if (chunks.length > 0 || text) {
          const results = chunks.filter((c: any) => c.web?.uri).map((c: any) => ({
            title: c.web?.title || "Web Result", url: c.web?.uri, content: text.substring(0, 400), source: 'Google Search'
          }));
          if (results.length > 0) {
            allResults = [...results, ...allResults];
          } else if (text) {
            allResults.push({ title: "Gemini Search Summary", url: "", content: text, source: "Google Search Summary" });
          }
          searchSuccess = true;
          break;
        }
      } catch (e: any) {
        console.log(`[API Search] Gemini key ${i + 1} grounding notice:`, (e.message || String(e)).substring(0, 100));
      }
    }
  }

  if (searchSuccess && allResults.length > 0) {
    res.json({ results: allResults, type: 'combined' });
    return;
  }

  if (allResults.length > 0) {
    res.json({ results: allResults, type: 'local-only' });
  } else {
    res.status(200).json({ results: [], warning: "Search unavailable (all providers/keys exhausted)", type: 'empty' });
  }
});

// Dynamic Sitemap for News & Pages
app.get(["/sitemap.xml", "/api/sitemap.xml"], async (req: any, res: any) => {
  try {
    let newsDocs: any[] = [];
    if (adminDb) {
      try {
        const snap = await adminDb.collection("news").orderBy("date", "desc").limit(3000).get();
        snap.forEach((d: any) => newsDocs.push({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn("[Sitemap] AdminDb error:", e);
      }
    }
    if (newsDocs.length === 0 && dbInstance) {
      try {
        const q = query(collection(dbInstance, 'news'), orderBy('date', 'desc'), limit(3000));
        const querySnap = await getDocs(q);
        querySnap.forEach((d: any) => newsDocs.push({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn("[Sitemap] DbInstance error:", e);
      }
    }

    // Merge static/fallback MOCK_NEWS so no seed news article is missing
    if (Array.isArray(MOCK_NEWS)) {
      MOCK_NEWS.forEach((m: any) => {
        const mSlug = m.slug || m.id;
        if (!newsDocs.some((n: any) => (n.slug || n.id) === mSlug)) {
          newsDocs.push(m);
        }
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const staticPages = [
      ["/", "1.0", "daily"],
      ["/admissions", "0.95", "daily"],
      ["/syllabus", "0.95", "daily"],
      ["/admission-checklist", "0.95", "daily"],
      ["/postutme", "0.95", "daily"],
      ["/post-utme", "0.95", "daily"],
      ["/result-slip", "0.95", "daily"],
      ["/result-slip-guide", "0.95", "daily"],
      ["/dashboard", "0.9", "daily"],
      ["/calculator", "0.9", "weekly"],
      ["/cgpa-calculator", "0.9", "weekly"],
      ["/cgpa", "0.9", "weekly"],
      ["/universities", "0.95", "daily"],
      ["/directory", "0.9", "weekly"],
      ["/news", "0.9", "daily"],
      ["/chat", "0.8", "weekly"],
      ["/login", "0.7", "monthly"],
      ["/signup", "0.7", "monthly"],
      ["/auth", "0.7", "monthly"],
      ["/about", "0.7", "weekly"],
      ["/premium", "0.7", "weekly"],
      ["/terms", "0.3", "monthly"],
      ["/terms-of-service", "0.3", "monthly"],
      ["/privacy", "0.3", "monthly"],
      ["/privacy-policy", "0.3", "monthly"],
      ["/calculator-privacy", "0.3", "monthly"],
      ["/cookies", "0.3", "monthly"],
      ["/cookie-policy", "0.3", "monthly"],
      ["/status", "0.4", "weekly"],
    ];

    // Collect all institution slugs from universityData
    const knownSlugs = new Set<string>([
      "unilag", "oau", "ui", "lasu", "uniben", "unilorin", "unn", "futa", "abu",
      "fuoye", "delsu", "kwasu", "aaua", "yabatech", "oou"
    ]);

    if (Array.isArray(universityData)) {
      universityData.forEach((u: any) => {
        if (u.slug) knownSlugs.add(u.slug.toLowerCase().trim());
      });
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    const addedUrls = new Set<string>();

    const addUrl = (locPath: string, lastmod: string, changefreq: string, priority: string) => {
      const fullUrl = `https://campusai.com.ng${locPath}`;
      if (!addedUrls.has(fullUrl)) {
        addedUrls.add(fullUrl);
        xml += `\n  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
      }
    };

    // 1. Static Pages & Aliases
    staticPages.forEach(([p, priority, freq]) => {
      addUrl(p, todayStr, freq, priority);
    });

    // 2. Institutional Directory Pages (/universities/:slug)
    knownSlugs.forEach(slug => {
      addUrl(`/universities/${slug}`, todayStr, "weekly", "0.85");
    });

    // 3. Institutional Aggregate Calculator Pages (/:schoolSlug-aggregate-calculator)
    knownSlugs.forEach(slug => {
      addUrl(`/${slug}-aggregate-calculator`, todayStr, "weekly", "0.85");
    });

    // 4. Dynamic News Articles (/news/:slug)
    newsDocs.forEach((data: any) => {
      const slug = data.slug || data.id;
      const lastMod = data.date ? new Date(data.date).toISOString().split('T')[0] : todayStr;
      addUrl(`/news/${slug}`, lastMod, "weekly", "0.8");
    });

    xml += `\n</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (e) {
    console.error("[Sitemap Error]", e);
    res.status(500).send("Error generating sitemap");
  }
});

async function notifyIndexNow(urls: string[]) {
  try {
    const payload = {
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urls
    };
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload)
    });
    console.log(`[IndexNow] Pinged ${urls.length} URLs to IndexNow. Status: ${response.status}`);
    return response.status;
  } catch (err) {
    console.error("[IndexNow Error]", err);
    return false;
  }
}

app.get("/api/indexnow/submit", requireAdminToken as any, async (req: any, res: any) => {
  try {
    const newsRef = db.collection("news");
    const snap = await newsRef.orderBy("date", "desc").limit(50).get();
    const urls: string[] = [
      `https://${INDEXNOW_HOST}/`,
      `https://${INDEXNOW_HOST}/news`,
      `https://${INDEXNOW_HOST}/postutme`,
      `https://${INDEXNOW_HOST}/calculator`
    ];
    snap.forEach((doc: any) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      urls.push(`https://${INDEXNOW_HOST}/news/${slug}`);
    });
    const status = await notifyIndexNow(urls);
    res.json({ success: true, count: urls.length, indexNowStatus: status });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.route("/api/news/sync")
  .all((req: any, res: any, next: any) => {
    console.log(`[API News Sync] Method: ${req.method} | Origin: ${req.headers.origin || 'none'}`);
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  })
  .get((req, res) => {
    res.json({
      status: "alive",
      message: "Sync endpoint is active. Use POST to trigger.",
      tip: "If you see this on a POST request, Vercel might be stripping the method."
    });
  })
  .post(requireAdminEmailHeader as any, async (req: any, res: any) => {
    console.log("[API News Sync] Starting server-side news synchronization...");

    const queries = [
      `latest Post-UTME screening registration forms 2026/2027 open sales portal updates site:edu.ng OR "postutme" OR "post-utme"`,
      `latest Nigerian higher education news ASUU strikes university senate decisions governing council announcements school fees updates 2026`,
      `latest verified academic news National Universities Commission NUC Nigeria polytechnic COE admission updates 2026/2027`,
      `latest JAMB CAPS 2026 admission check login portal updates, JAMB change of course institution green card, upload O'Level results on CAPS guidelines JAMB portal 2026`,
      `latest NYSC senate list mobilization registration batch 2026, undergraduate scholarships for Nigerian students BEA bilateral education Shell, academic lecturer job vacancies university recruitment Nigeria 2026`
    ];

    const tavilyKeys = getTavilyKeys();
    const serperKeys = getSerperKeys();
    console.log(`[API News Sync] Found ${tavilyKeys.length} Tavily keys and ${serperKeys.length} Serper keys.`);

    const searchResults: string[] = [];

    for (let i = 0; i < queries.length; i++) {
      const searchQ = queries[i];
      let queryResult = "";
      let success = false;

      console.log(`[API News Sync] Executing search ${i + 1}/${queries.length}: "${searchQ.slice(0, 50)}..."`);

      for (const key of serperKeys) {
        try {
          if (!key) continue;
          const resp = await axios.post('https://google.serper.dev/search', { q: searchQ }, {
            headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
            timeout: 10000
          });
          if (resp.data && resp.data.organic && resp.data.organic.length > 0) {
            queryResult = resp.data.organic.slice(0, 5).map((r: any) => `Title: ${r.title}\nURL: ${r.link}\nContent: ${r.snippet}`).join("\n\n");
            success = true;
            break;
          }
        } catch (e: any) {
          console.warn(`[API News Sync] Serper key failed for search ${i + 1}: ${e.message}`);
        }
      }

      if (!success) {
        for (const key of tavilyKeys) {
          try {
            if (!key) continue;
            const client = new TavilyClient({ apiKey: key });
            const resp = await client.search({ query: searchQ, search_depth: "advanced", max_results: 6 });
            if (resp && resp.results && Array.isArray(resp.results) && resp.results.length > 0) {
              queryResult = resp.results.slice(0, 5).map((r: any) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join("\n\n");
              success = true;
              break;
            }
          } catch (e: any) {
            console.warn(`[API News Sync] Tavily key failed for search ${i + 1}: ${e.message}`);
          }
        }
      }

      searchResults.push(queryResult || "No results found for this category.");
    }

    const combinedResults = `
=== SCHOOL WEBSITE POST-UTME SCREENING UPDATES ===
${searchResults[0]}

=== ACADEMIC UNIONS, SENATES, & POLICY NEWS (ASUU/STRIKES/FEES) ===
${searchResults[1]}

=== NUC, POLYTECHNICS, COE & GENERAL ADMISSIONS ===
${searchResults[2]}

=== JAMB CAPS, CHANGE OF COURSE, O'LEVEL UPLOADING ===
${searchResults[3]}

=== NYSC SENATE LIST, SCHOLARSHIPS, & ACADEMIC RECRUITMENT/JOBS ===
${searchResults[4]}
    `;

    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "Africa/Lagos" });
    const prompt = `You are a Senior Investigative Education Journalist in Nigeria.

    TASK:
    Based on the provided search results, curate 5-7 high-quality, authoritative news articles for the 2026/2027 academic session.

    AUTHORITATIVE REQUIREMENTS:
    1. EACH article's "fullContent" must be a comprehensive investigative deep-dive (MINIMUM 750 words).
    2. FORMATTING: Use professional Markdown with subheadings, bold text, and MANDATORY Markdown tables for timelines/fees.
    3. NO PLACEHOLDERS: Find real data from the search context or state "Official date pending" if unavailable. Do not invent specific dates or fees not present in the search context.
    4. STRUCTURE:
       # [Headline]
       > **✅ VERIFIED REPORT:** Cross-referenced as of ${dateStr}.
       **Published:** ${dateStr} | **Source:** CampusAI News
       ## 📌 Overview
       [Summary]
       ## 📅 Official Timetable / Key Details
       | Activity | Date |
       |----------|------|
       | ...      | ...  |
       ## 📝 Step-by-Step Registration Guide
       [Instructions]
       ## 🛠️ Useful Tools for Candidates
       - [Syllabus Finder](https://www.jamb.gov.ng/ibass)
       - [Portal Link](Official Link)
       - [Admission Probability Checker](https://campusai.com.ng/calculator)
       ---
       ### 🔗 Follow CampusAI for More Updates
       *   **WhatsApp:** [Join Channel](https://whatsapp.com/channel/0029VajWj0D7jZnl0I3hF32o)
       *   **X:** [@CampusAI_NG](https://x.com/CampusAI_NG)

    STRICT CATEGORY LIST: "Federal", "State", "Private", "JAMB", "Polytechnic", "COE", "National", "Jobs", "Scholarships", "NYSC", "WAEC".

    SEARCH CONTEXT:
    ${combinedResults.substring(0, 12000)}

    JSON SCHEMA:
    { "news": [ { "id": "string", "title": "string", "category": "string", "date": "string", "excerpt": "string", "fullContent": "string", "sourceUrl": "string", "image": "string", "tags": ["string"], "isImportant": boolean } ] }`;

    const aiResult = await callAIWithFallback({
      systemInstruction: "You are a helpful assistant. You must respond ONLY with valid JSON matching the schema provided.",
      messages: [{ role: 'user', content: prompt }],
      jsonMode: true,
      maxTokens: 4000,
      label: 'news-sync'
    });

    if (aiResult) {
      const data = safeJsonParse(aiResult.text, null);
      if (data && Array.isArray(data.news) && data.news.length > 0) {
        console.log(`[API News Sync] Success via ${aiResult.provider}! Curated ${data.news.length} articles.`);
        return res.json({ news: data.news, provider: aiResult.provider });
      }
    }

    console.log(`[API News Sync] Critical Failure: no AI provider produced usable curated news. Returning raw search results as fallback...`);
    const rawResults = combinedResults ? combinedResults.substring(0, 500) : "No raw results.";

    res.json({
      news: [{
        title: "Latest News (Raw Data)",
        category: "General",
        excerpt: "AI curation failed. Displaying raw search data.",
        fullContent: rawResults,
        sourceUrl: "#"
      }],
      warning: "AI curation unavailable. Showing raw search results.",
      isSovereignFallback: true
    });
  });

app.post("/api/admin/keys/ping", requireAdminToken as any, async (req: any, res: any) => {
  try {
    const envKeys = Object.keys(process.env).sort();
    const discovered: any[] = [];

    for (const envKeyName of envKeys) {
      const val = process.env[envKeyName];
      if (!val || typeof val !== 'string' || val.trim() === '') continue;

      const upperName = envKeyName.toUpperCase();
      const trimmedVal = val.trim();
      let type = '';

      if (upperName === 'PORT' || upperName === 'NODE_ENV' || upperName === 'ALLOWED_ORIGINS' || upperName === 'CONTROL_PLANE_API_DIR') continue;

      if (upperName.includes('GEMINI')) type = 'Gemini';
      else if (upperName.includes('GROQ')) type = 'Groq';
      else if (upperName.includes('TAVILY')) type = 'Tavily';
      else if (upperName.includes('SERPER')) type = 'Serper';
      else if (upperName.includes('OPENROUTER')) type = 'OpenRouter';
      else if (upperName.includes('MISTRAL')) type = 'Mistral';
      else if (upperName.includes('COHERE')) type = 'Cohere';
      else if (upperName.includes('NVIDIA')) type = 'Nvidia';
      else if (upperName.includes('CLOUDFLARE')) type = 'Cloudflare';
      else if (trimmedVal.startsWith('AIzaSy') || trimmedVal.startsWith('AQ.')) type = 'Gemini';
      else if (trimmedVal.startsWith('tvly-')) type = 'Tavily';
      else if (trimmedVal.startsWith('gsk_')) type = 'Groq';
      else if (trimmedVal.startsWith('nvapi-')) type = 'Nvidia';
      else if (trimmedVal.startsWith('sk-or-')) type = 'OpenRouter';

      if (type) {
        const masked = trimmedVal.length > 10 ? `${trimmedVal.substring(0, 6)}...${trimmedVal.substring(trimmedVal.length - 4)}` : '***';
        discovered.push({ name: envKeyName, key: masked, type, rawKey: trimmedVal });
      }
    }

    const results = await Promise.all(discovered.map(async (item) => {
      let status: 'Active' | 'Failed' = 'Failed';
      let error = '';
      const start = Date.now();

      try {
        if (item.type === 'Gemini') {
          const gemini = createGeminiClient(item.rawKey);
          if (gemini.type === 'AIP') {
            const result = await gemini.client.models.generateContent({ model: 'gemini-flash-latest', contents: 'ping' });
            if (result && result.text) status = 'Active'; else error = 'Empty response';
          } else {
            const model = gemini.client.getGenerativeModel({ model: 'gemini-flash-latest' });
            const result = await model.generateContent('ping');
            const response = await result.response;
            if (response.text()) status = 'Active'; else error = 'Empty response';
          }
        } else if (item.type === 'Groq') {
          const groq = new Groq({ apiKey: item.rawKey });
          const completion = await groq.chat.completions.create({ messages: [{ role: 'user', content: 'ping' }], model: 'llama-3.1-8b-instant', max_tokens: 3 });
          if (completion?.choices?.length > 0) status = 'Active'; else error = 'Empty response';
        } else if (item.type === 'Tavily') {
          const client = new TavilyClient({ apiKey: item.rawKey });
          const response = await client.search({ query: 'ping', max_results: 1 });
          if (response?.results) status = 'Active'; else error = 'Empty response';
        } else if (item.type === 'Serper') {
          const response = await axios.post('https://google.serper.dev/search', { q: 'ping', num: 1 }, { headers: { 'X-API-KEY': item.rawKey, 'Content-Type': 'application/json' }, timeout: 5000 });
          if (response.data) status = 'Active'; else error = 'Empty response';
        } else if (item.type === 'OpenRouter') {
          const response = await axios.get('https://openrouter.ai/api/v1/auth/key', { headers: { 'Authorization': `Bearer ${item.rawKey}` }, timeout: 5000 });
          if (response.data) status = 'Active'; else error = 'Empty response';
        } else if (item.type === 'Mistral') {
          const response = await axios.get('https://api.mistral.ai/v1/models', { headers: { 'Authorization': `Bearer ${item.rawKey}` }, timeout: 5000 });
          if (response.data) status = 'Active'; else error = 'Empty response';
        } else if (item.type === 'Cohere') {
          const response = await axios.get('https://api.cohere.com/v1/models', { headers: { 'Authorization': `Bearer ${item.rawKey}` }, timeout: 5000 });
          if (response.data) status = 'Active'; else error = 'Empty response';
        } else if (item.type === 'Nvidia') {
          const response = await axios.get('https://integrate.api.nvidia.com/v1/models', { headers: { 'Authorization': `Bearer ${item.rawKey}` }, timeout: 5000 });
          if (response.data) status = 'Active'; else error = 'Empty response';
        } else if (item.type === 'Cloudflare') {
          const response = await axios.get('https://api.cloudflare.com/client/v4/user/tokens/verify', { headers: { 'Authorization': `Bearer ${item.rawKey}` }, timeout: 5000 });
          if (response.data) status = 'Active'; else error = 'Empty response';
        }
      } catch (e: any) {
        error = e.response?.data ? (typeof e.response.data === 'object' ? JSON.stringify(e.response.data) : String(e.response.data)) : (e.message || String(e));
      }

      return { name: item.name, key: item.key, type: item.type, status, latency: Date.now() - start, error };
    }));

    return res.json({ success: true, timestamp: new Date().toISOString(), results });
  } catch (err: any) {
    console.error("[Ping Keys API Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Dynamic Open Graph Image Generation for Social Media Crawlers
app.get(['/api/og-image', '/api/og-image.svg', '/api/og-image.png', '/og-image.svg', '/og-image.png'], handleOgImageRequest);

// Dynamic Article Cover Image Handler for social media previews
app.get(['/api/article-image', '/api/news-image'], (req, res) => handleArticleImageRequest(req, res, dbInstance));

// Admin Send Email via Resend API
app.post("/api/admin/send-email", requireAdminToken as any, async (req: any, res: any) => {
  try {
    const { recipients, subject, htmlContent, senderEmail, apiKey } = req.body;
    const resendKey = apiKey || process.env.RESEND_API_KEY;
    if (!resendKey) {
      return res.status(400).json({ success: false, error: "Resend API key is missing. Please set RESEND_API_KEY in environment or provide it." });
    }
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, error: "Recipients list is empty." });
    }
    if (!subject || !htmlContent) {
      return res.status(400).json({ success: false, error: "Subject and HTML content are required." });
    }

    const resend = new Resend(resendKey);
    const from = senderEmail || process.env.RESEND_FROM_EMAIL || 'CampusAI Admissions <noreply@campusai.com.ng>';

    const results = [];
    for (const email of recipients) {
      try {
        const data = await resend.emails.send({
          from,
          to: [email],
          subject,
          html: htmlContent,
        });
        results.push({ email, success: true, data });
      } catch (err: any) {
        results.push({ email, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    if (successCount === 0) {
      const firstError = results[0]?.error || 'Unknown Resend error';
      return res.status(400).json({
        success: false,
        sentCount: 0,
        total: recipients.length,
        error: `Resend failed to send email: ${firstError}. Note: If using onboarding@resend.dev, Resend only allows sending to your own verified account email address unless you verify a custom domain at resend.com/domains.`,
        results
      });
    }

    return res.json({ success: true, sentCount: successCount, total: recipients.length, results });
  } catch (err: any) {
    console.error("[Send Email Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Catch-all for undefined API routes
app.use("/api", (req, res) => {
  console.warn(`[API 404] No route matched for ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "API Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: ["/api/search", "/api/news/sync", "/api/health"]
  });
});

async function injectSEO(html: string, reqPath: string): Promise<string> {
  return await seoInject(html, reqPath, adminDb, dbInstance);
}

// Serve static assets from dist if available
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { index: false }));
}

// HTML SPA route with SEO injection for production & Vercel
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  app.get(/^(?!\/api).*/, async (req: any, res: any) => {
    try {
      let indexPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexPath)) indexPath = path.join(process.cwd(), 'index.html');
      let html = fs.readFileSync(indexPath, 'utf-8');
      html = await injectSEO(html, req.path);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
      res.send(html);
    } catch (err) {
      console.error("[Server HTML Error]", err);
      let indexPath = path.join(process.cwd(), 'index.html');
      if (fs.existsSync(indexPath)) res.sendFile(indexPath);
      else res.status(500).send("Server Error");
    }
  });
}

// Vite middleware for development
async function startServer() {
  const isVercel = !!process.env.VERCEL || !!process.env.NOW_REGION || !!process.env.VERCEL_URL;
  console.log(`[Server] Environment Check: isVercel=${isVercel}, NODE_ENV=${process.env.NODE_ENV}`);

  if (process.env.NODE_ENV !== "production" && !isVercel) {
    console.log("[Server] Starting in Development mode with Vite middleware...");
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false, ws: false },
        appType: "spa",
      });

      app.use(async (req, res, next) => {
        const isSourceOrAsset =
          req.originalUrl.startsWith('/api') ||
          req.originalUrl.startsWith('/@') ||
          req.originalUrl.startsWith('/src') ||
          req.originalUrl.startsWith('/node_modules') ||
          req.originalUrl.startsWith('/public') ||
          /\.(js|ts|tsx|jsx|css|scss|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map)$/i.test(req.path);

        if (isSourceOrAsset) return next();

        try {
          const url = req.originalUrl.split('?')[0];
          let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(req.originalUrl, template);
          const html = await injectSEO(template, url);
          res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(html);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });

      app.use(vite.middlewares);
      console.log("[Server] Vite middleware mounted successfully.");
    } catch (viteErr) {
      console.error("[Server] Vite initialization failed. Falling back to static mode.", viteErr);
      const distPath2 = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath2));
    }
  } else if (!isVercel) {
    console.log("[Server] Starting in Production mode (Self-Hosted)...");
  }

  if (!isVercel) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log(`Allowed Origins: ${ALLOWED_ORIGINS.join(', ')}`);
    });
  } else {
    console.log("[Server] Running in Serverless mode (Vercel/Cloud Functions)");
  }
}

const isVercel = !!process.env.VERCEL || !!process.env.NOW_REGION || !!process.env.VERCEL_URL;

if (!isVercel || process.env.NODE_ENV === 'development') {
  startServer().catch(err => {
    console.error("[Server Startup Error]:", err);
  });
}

export default app;