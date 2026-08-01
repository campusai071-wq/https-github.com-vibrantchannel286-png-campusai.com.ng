import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  const querySnapshot = await getDocs(collection(db, "knowledge_fragments"));
  let found = false;
  querySnapshot.forEach((doc) => {
    if (doc.id.includes('babcock')) {
      console.log("Found Babcock record:", doc.id);
      found = true;
    }
  });
  if (!found) {
     console.log("No Babcock record found.");
  }
  process.exit(0);
}
check();
