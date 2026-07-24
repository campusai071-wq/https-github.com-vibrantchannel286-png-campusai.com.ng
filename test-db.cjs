const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const appletConfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "firebase-applet-config.json"), "utf-8"));
const app = admin.initializeApp({ projectId: appletConfig.projectId });
const db = admin.firestore();
async function run() {
  const slug = "jamb-opens-registration-for-nce-and-non-technological-agricultural-programmes";
  const doc = await db.collection("news").doc(slug).get();
  console.log("By ID:", doc.exists);
  const query = await db.collection("news").where("slug", "==", slug).limit(1).get();
  console.log("By Slug:", !query.empty);
  if (!query.empty) {
    console.log("Title:", query.docs[0].data().title);
  }
}
run().catch(console.error);
