import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const { firestoreDatabaseId, ...standardConfig } = config;

try {
  const app = initializeApp(standardConfig);
  const db = initializeFirestore(app, {}, firestoreDatabaseId || "(default)");

  async function run() {
    console.log("Querying all news document titles and ids in Firestore:");
    const snap = await getDocs(collection(db, "news"));
    console.log(`Found ${snap.size} news documents.`);
    snap.forEach(doc => {
      const data = doc.data();
      console.log(`- ID: ${doc.id} | Title: "${data.title}" | Category: "${data.category}" | isLive: ${data.isLive} | Date: "${data.date}" | createdAt: ${data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : 'none'}`);
    });
    console.log("Completed query.");
  }
  run();
} catch (e) {
  console.error("Query Error:", e);
}
