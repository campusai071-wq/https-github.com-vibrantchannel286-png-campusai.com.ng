import { useEffect } from 'react';
import { triggerBrowserNotification } from '../services/utils';

export const useDailyReminder = () => {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const messages = [
      {
        title: "CampusAI: Daily Admission Trial 🔔",
        body: "You have a free daily admission trial waiting! Check your chances today."
      },
      {
        title: "CampusAI: News Update 📰",
        body: "New verified JAMB & Post-UTME updates are available. Stay informed!"
      },
      {
        title: "CampusAI: Admission Strategy 💡",
        body: "Don't guess! Calculate your target aggregate score for 2026."
      }
    ];

    const checkAndTriggerReminder = () => {
      const lastReminder = localStorage.getItem('last_daily_reminder');
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      if (!lastReminder || now - parseInt(lastReminder) > ONE_DAY) {
        // Trigger random reminder
        const message = messages[Math.floor(Math.random() * messages.length)];
        triggerBrowserNotification(message.title, message.body);
        localStorage.setItem('last_daily_reminder', now.toString());
      }
    };

    // Check on mount, and maybe add a small delay to not block initial render
    const timer = setTimeout(checkAndTriggerReminder, 5000);
    return () => clearTimeout(timer);
  }, []);
};
