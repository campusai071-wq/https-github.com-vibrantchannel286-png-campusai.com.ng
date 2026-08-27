import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  try {
    const snap = await getDocs(collection(db, "users"));
    console.log("TOTAL USERS IN FIRESTORE:", snap.size);
  } catch (e) {
    console.log("Error with getDocs:", e.message);
  }
}
check();
