const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");
const config = require("./firebase-applet-config.json");
const app = initializeApp(config);
const db = getFirestore(app);
setDoc(doc(db, "admission_articles", "test-123"), { test: true }).then(() => {
  console.log("Write Success");
  process.exit(0);
}).catch(err => {
  console.error("Write Error:", err.message);
  process.exit(1);
});
