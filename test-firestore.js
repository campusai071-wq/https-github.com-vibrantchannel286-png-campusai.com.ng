const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
db.collection('post_utme_news').get().then(snapshot => {
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(data.title, data.date);
    });
}).catch(console.error);
