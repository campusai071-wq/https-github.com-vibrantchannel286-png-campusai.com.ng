import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, query, where } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const { firestoreDatabaseId, ...standardConfig } = config;

const app = initializeApp(standardConfig);
const db = initializeFirestore(app, {}, firestoreDatabaseId || "(default)");

async function run() {
  const q = query(collection(db, "news"), where("slug", "==", "new-jamb-registrar-unveils-five-year-plan-to-transform-admissions"));
  const snap = await getDocs(q);
  console.log("Docs found with lowercase slug:", snap.size);
  snap.forEach(doc => console.log(doc.id, doc.data().slug));

  const q2 = query(collection(db, "news"), where("slug", "==", "new-JAMB-Registrar-Unveils-Five-Year-Plan-to-Transform-admissions"));
  const snap2 = await getDocs(q2);
  console.log("Docs found with mixed case slug:", snap2.size);
  snap2.forEach(doc => console.log(doc.id, doc.data().slug));
  
  process.exit(0);
}
run().catch(console.error);
