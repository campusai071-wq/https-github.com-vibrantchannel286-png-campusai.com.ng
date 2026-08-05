const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
db.collection('news').get().then(snapshot => {
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.title.includes("2026/2027")) {
            console.log("ID:", doc.id);
            console.log("Title:", data.title);
            console.log("Date:", data.date);
            const todayStr = "Aug 05, 2026";
            const todayMidnight = new Date(todayStr).getTime();
            const t = new Date(data.date).getTime();
            console.log("t > todayMidnight:", t > todayMidnight);
        }
    });
}).catch(console.error);
