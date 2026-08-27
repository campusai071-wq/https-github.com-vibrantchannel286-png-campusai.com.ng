import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function clean() {
  const snap = await getDocs(collection(db, 'users'));
  let deletedCount = 0;
  for (const userDoc of snap.docs) {
    const id = userDoc.id;
    const data = userDoc.data();
    
    // Condition to delete: starts with 'email-user-', 'local-', or has undefined/empty email but it's not a valid ID
    if (id.startsWith('email-user-') || id.startsWith('local-') || (!data.email && data.displayName && !data.email?.includes('@'))) {
        console.log(`Deleting invalid user: ${id} (${data.displayName})`);
        await deleteDoc(doc(db, 'users', id));
        deletedCount++;
    }
  }
  console.log(`Deleted ${deletedCount} ghost profiles.`);
  process.exit(0);
}
clean().catch(console.error);
