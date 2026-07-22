import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const { firestoreDatabaseId, ...standardConfig } = config;

try {
  const app = initializeApp(standardConfig);
  const db = initializeFirestore(app, {}, firestoreDatabaseId || "(default)");

  async function run() {
    const snap = await getDocs(collection(db, "news"));
    const items = [];
    snap.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    fs.writeFileSync('all-news-docs.json', JSON.stringify(items, null, 2));
    console.log(`Saved ${items.length} documents to all-news-docs.json.`);
  }
  run();
} catch (e) {
  console.error("Query Error:", e);
}
