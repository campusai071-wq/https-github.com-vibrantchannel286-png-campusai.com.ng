import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from '../../firebase-applet-config.json';
declare var process: any;

let localFirebaseConfig = null;
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('campusai_firebase');
    if (stored) {
      localFirebaseConfig = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse local firebase config:", e);
  }
}

export const MASTER_CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "", 
  FLUTTERWAVE_PUBLIC_KEY: process.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK-f26c5e3b665384b21c780ad1f752954e-X",
  FIREBASE: localFirebaseConfig || firebaseConfig
};
export const hasLocalFirebase = !!localFirebaseConfig;

const configNode = MASTER_CONFIG.FIREBASE as any;
export const firestoreDatabaseId = configNode.firestoreDatabaseId;
const { firestoreDatabaseId: _, ...standardConfig } = configNode;

const app = getApps().length > 0 ? getApp() : initializeApp(standardConfig);
export const auth = getAuth(app);

// Suppress benign connection logs and offline notifications in console
try {
  setLogLevel('silent');
} catch (e) {}

// Resilient Firestore initialization conforming to Firebase Skill guidelines
// Uses experimentalAutoDetectLongPolling instead of experimentalForceLongPolling to avoid connection dropouts
let firestoreInstance: any;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true
  }, firestoreDatabaseId);
} catch (e) {
  firestoreInstance = getFirestore(app, firestoreDatabaseId);
}

export const db = firestoreInstance;
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
