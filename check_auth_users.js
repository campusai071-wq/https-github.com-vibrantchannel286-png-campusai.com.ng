import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
try {
  const app = initializeApp({
    credential: applicationDefault()
  });
  async function checkAuthUsers() {
    try {
      let count = 0;
      let pageToken;
      do {
         const res = await getAuth(app).listUsers(1000, pageToken);
         count += res.users.length;
         pageToken = res.pageToken;
      } while (pageToken);
      console.log("TOTAL AUTH USERS:", count);
    } catch (e) {
      console.log("Auth error:", e);
    }
  }
  checkAuthUsers();
} catch (e) {
  console.log("Init error:", e);
}
