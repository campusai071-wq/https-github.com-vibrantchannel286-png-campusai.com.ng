const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

try {
  const app = initializeApp({
    credential: applicationDefault(),
    projectId: firebaseConfig.projectId
  });
  
  const defaultDb = getFirestore(app);
  const namedDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

  async function check() {
    try {
      const defaultUsers = await defaultDb.collection("users").count().get();
      console.log("Default DB users:", defaultUsers.data().count);
    } catch(e) { console.log("Default DB error:", e.message); }

    try {
      const namedUsers = await namedDb.collection("users").count().get();
      console.log("Named DB users:", namedUsers.data().count);
    } catch(e) { console.log("Named DB error:", e.message); }
  }
  check();
} catch (e) {
  console.log("Admin init error:", e.message);
}
