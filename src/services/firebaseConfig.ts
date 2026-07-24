import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer, initializeFirestore } from "firebase/firestore";
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
const configNode = MASTER_CONFIG.FIREBASE as any;
export const firestoreDatabaseId = configNode.firestoreDatabaseId;
const { firestoreDatabaseId: _, ...standardConfig } = configNode;
const app = initializeApp(standardConfig);
export const auth = getAuth(app);
// Use initializeFirestore to enable better connection reliability
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, configNode.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
