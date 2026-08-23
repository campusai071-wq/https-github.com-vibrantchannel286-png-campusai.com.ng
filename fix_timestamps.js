import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, Timestamp, query, limit, orderBy } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixCollection(collectionName, timeField) {
  console.log(`Fixing ${collectionName}...`);
  let fixed = 0;
  try {
    const q = query(collection(db, collectionName), limit(500));
    const snap = await getDocs(q);
    
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const t = data[timeField];
      if (t && typeof t === 'object' && t.seconds && t.nanoseconds && !t.toDate) {
        // It's a broken timestamp map!
        const correctTimestamp = new Timestamp(t.seconds, t.nanoseconds);
        await updateDoc(docSnap.ref, { [timeField]: correctTimestamp });
        fixed++;
      } else if (t && typeof t === 'object' && t._seconds && t._nanoseconds && !t.toDate) {
        const correctTimestamp = new Timestamp(t._seconds, t._nanoseconds);
        await updateDoc(docSnap.ref, { [timeField]: correctTimestamp });
        fixed++;
      }
    }
  } catch (e) {
    console.error(`Error fixing ${collectionName}:`, e.message);
  }
  console.log(`Fixed ${fixed} broken timestamps in ${collectionName}.`);
}

async function run() {
  await fixCollection("user_activities", "timestamp");
  await fixCollection("predictions", "createdAt");
  
  // also fix users subcollection
  console.log("Checking users for broken predictions...");
  const usersSnap = await getDocs(collection(db, "users"));
  for (const u of usersSnap.docs) {
    const pSnap = await getDocs(collection(db, "users", u.id, "predictions"));
    for (const p of pSnap.docs) {
      const data = p.data();
      const t = data.createdAt;
      if (t && typeof t === 'object' && t.seconds && t.nanoseconds && !t.toDate) {
        const correctTimestamp = new Timestamp(t.seconds, t.nanoseconds);
        await updateDoc(p.ref, { createdAt: correctTimestamp });
      }
    }
  }
  
  process.exit(0);
}

run();
