import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

async function clearCache() {
  const firebaseAppletConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  const adminApp = initializeApp({
    credential: applicationDefault(),
    projectId: firebaseAppletConfig.projectId
  }, "admin-app");
  const adminDb = getFirestore(adminApp, firebaseAppletConfig.firestoreDatabaseId || "(default)");

  const snapshot = await adminDb.collection('course_cutoffs').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    count++;
  }
  console.log(`Deleted ${count} cached cutoffs.`);
}

clearCache().catch(console.error).finally(() => process.exit(0));
