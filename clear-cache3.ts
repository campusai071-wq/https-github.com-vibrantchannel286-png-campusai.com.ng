import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from "fs";

async function clearCache() {
  const firebaseAppletConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  const app = initializeApp(firebaseAppletConfig.firebaseConfig);
  const db = getFirestore(app, firebaseAppletConfig.firestoreDatabaseId || "(default)");

  const snapshot = await getDocs(collection(db, 'course_cutoffs'));
  let count = 0;
  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, 'course_cutoffs', document.id));
    count++;
  }
  console.log(`Deleted ${count} cached cutoffs.`);
}

clearCache().catch(console.error).finally(() => process.exit(0));
