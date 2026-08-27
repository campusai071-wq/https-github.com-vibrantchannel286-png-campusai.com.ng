import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getCountFromServer, getDocs, query, limit } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  try {
    const snap = await getCountFromServer(collection(db, "users"));
    console.log("ACTUAL USER COUNT (getCountFromServer):", snap.data().count);
  } catch (e) {
    console.log("Error with getCountFromServer:", e.message);
  }
}
check();
