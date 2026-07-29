const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const config = require("./firebase-applet-config.json");
const app = initializeApp(config);
const db = getFirestore(app);
getDocs(collection(db, "admission_articles")).then(snap => {
  console.log("Success");
  process.exit(0);
}).catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
