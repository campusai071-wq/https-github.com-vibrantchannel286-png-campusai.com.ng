const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const app = initializeApp({
  projectId: "planning-with-ai-e00fb"
});
const db = getFirestore(app);
db.collection("admission_articles").limit(1).get().then(snap => {
  console.log("Success, found", snap.size, "documents.");
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
