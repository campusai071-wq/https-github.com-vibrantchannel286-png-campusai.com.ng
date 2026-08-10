const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function clearCache() {
  const snapshot = await db.collection('course_cutoffs').get();
  let count = 0;
  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
    count++;
  });
  if (count > 0) {
    await batch.commit();
    console.log(`Deleted ${count} cached cutoffs.`);
  } else {
    console.log("No cached cutoffs found.");
  }
}

clearCache().catch(console.error);
