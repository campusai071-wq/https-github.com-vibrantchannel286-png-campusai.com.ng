import { useEffect } from 'react';
import { getLocalProfile } from '../services/userService';
import { triggerBrowserNotification } from '../services/utils';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export const useNotificationManager = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Daily and status reminders
    const checkAndTrigger = () => {
      const lastTrigger = localStorage.getItem('last_notification_trigger');
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      if (!lastTrigger || now - parseInt(lastTrigger) > ONE_DAY) {
        const profile = getLocalProfile();
        
        // Reminder for free daily calculation
        if (!profile.is_premium) {
           triggerBrowserNotification(
             "CampusAI: Daily Calculation 🔔",
             "You have a free daily calculation waiting! Check your chances for 2026."
           );
        }
        
        // Notification for Scholar Pack activation status
        if (profile.is_premium) {
           triggerBrowserNotification(
             "CampusAI: Scholar Pack 🎓",
             "Your Scholar Pack is active! Enjoy your premium access and features."
           );
        }
        
        localStorage.setItem('last_notification_trigger', now.toString());
      }
    };

    const timer = setTimeout(checkAndTrigger, 5000);

    // Real-time news publish notification
    let unsubscribeNews: (() => void) | undefined;
    
    if (db) {
      let isInitial = true;
      let maxTimestamp = Date.now() - 60000; // default fallback is 1 minute ago

      const q = query(collection(db, "news"), orderBy("createdAt", "desc"), limit(10));
      unsubscribeNews = onSnapshot(q, (snapshot) => {
        let newMax = maxTimestamp;
        
        snapshot.docChanges().forEach((change) => {
          const docData = change.doc.data();
          let docTime = 0;
          const createdAt = docData.createdAt;
          
          if (createdAt && typeof createdAt.toMillis === 'function') {
            docTime = createdAt.toMillis();
          } else if (createdAt && typeof createdAt.seconds === 'number') {
            docTime = createdAt.seconds * 1000;
          } else if (typeof createdAt === 'number') {
            docTime = createdAt;
          } else if (typeof createdAt === 'string') {
            docTime = new Date(createdAt).getTime();
          } else {
            docTime = Date.now();
          }

          if (docTime > newMax) {
            newMax = docTime;
          }

          // Only trigger for newly added documents after the initial sync load
          if (change.type === 'added' && !isInitial) {
            if (docTime > maxTimestamp) {
              triggerBrowserNotification(
                `CampusAI: New Admission News 🔔`,
                `${docData.title || 'Click to view the latest update!'}`,
                docData.slug || ''
              );
            }
          }
        });

        maxTimestamp = newMax;
        isInitial = false;
      }, (error) => {
        console.warn("News notification listener error:", error);
      });
    }

    return () => {
      clearTimeout(timer);
      if (unsubscribeNews) {
        unsubscribeNews();
      }
    };
  }, []);
};
