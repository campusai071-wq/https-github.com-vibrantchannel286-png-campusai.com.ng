import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ids = ["ssJNiSY6Oa5TnYAncvDC", "MaUciv37omtjrt4fAHK", "acxrM1VCsd4f8rH9VFt9"];
const collections = ["users", "news", "predictions", "user_activities", "admin_notifications", "feedback", "testimonials", "discussions", "comments", "subscribers", "knowledge_fragments", "premium_subscriptions"];

async function check() {
  for (const collection of collections) {
    for (const id of ids) {
      const d = await getDoc(doc(db, collection, id));
      if (d.exists()) {
        console.log(`Found ${id} in ${collection}`);
        console.log(d.data());
      }
    }
  }
  process.exit(0);
}
check();
