import { useEffect } from 'react';
import { getLocalProfile } from '../services/userService';
import { triggerBrowserNotification } from '../services/utils';

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

    return () => {
      clearTimeout(timer);
    };
  }, []);
};

