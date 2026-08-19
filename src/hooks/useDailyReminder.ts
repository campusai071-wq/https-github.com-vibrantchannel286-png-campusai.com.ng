import { useEffect } from 'react';
import { getLocalProfile } from '../services/userService';
import { triggerBrowserNotification } from '../services/utils';

export const useDailyReminder = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndTrigger = () => {
      const lastTrigger = localStorage.getItem('last_notification_trigger');
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      if (!lastTrigger || now - parseInt(lastTrigger) > ONE_DAY) {
        const profile = getLocalProfile();
                
        // Reminder for free daily calculation or used up status
        if (!profile.is_premium) {
           const today = new Date().toISOString().split('T')[0];
           const isNewDay = profile.daily_last_reset !== today;
           const dailyRequests = isNewDay ? 0 : (profile.daily_requests || 0);
           if (dailyRequests < 1) {
              triggerBrowserNotification(
                "CampusAI: Daily Calculation 🔔",
                "You have a free daily calculation waiting! Check your chances for 2026."
              );
           } else {
              triggerBrowserNotification(
                "CampusAI: Daily Calculation 🔔",
                "You have used up your free calculation for today. Upgrade to Scholar Pack for unlimited access!"
              );
           }
        }
                
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

