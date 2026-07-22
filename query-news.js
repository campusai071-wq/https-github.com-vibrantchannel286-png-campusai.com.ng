import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const { firestoreDatabaseId, ...standardConfig } = config;

try {
  const app = initializeApp(standardConfig);
  const db = initializeFirestore(app, {}, firestoreDatabaseId || "(default)");

  async function test() {
    console.log("Searching for LASU or 457369235...");
    const snap = await getDocs(collection(db, "news"));
    snap.forEach(doc => {
      const data = doc.data();
      const content = JSON.stringify(data).toLowerCase();
      if (content.includes("lasu") || content.includes("457369235")) {
        console.log("\nFound MATCH:");
        console.log("ID:", doc.id);
        console.log("Title:", data.title);
        console.log("Content:", JSON.stringify(data, null, 2));
      }
    });
    console.log("Done.");
  }
  test();
} catch (e) {
  console.error("Fetch error:", e);
}
