import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from "fs";

async function clearCache() {
  const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId || "(default)");

  const snapshot = await getDocs(collection(db, 'cached_course_cutoff_info'));
  let count = 0;
  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, 'cached_course_cutoff_info', document.id));
    count++;
  }
  console.log(`Deleted ${count} cached cutoffs.`);
}

clearCache().catch(console.error).finally(() => process.exit(0));
