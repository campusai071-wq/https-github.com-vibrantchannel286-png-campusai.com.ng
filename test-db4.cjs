const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const appletConfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "firebase-applet-config.json"), "utf-8"));
const app = admin.initializeApp({ 
  projectId: appletConfig.projectId,
  credential: admin.credential.cert(require(path.resolve(process.cwd(), "service-account.json")).catch(()=>({})))
});
const db = admin.firestore();
