declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_IDS = ['G-W136GWE5E0', 'G-QN3QBT9QX4'];
export const GA_MEASUREMENT_ID = 'G-W136GWE5E0';

/**
 * Tracks a pageview in Google Analytics across all measurement IDs
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    GA_MEASUREMENT_IDS.forEach((id) => {
      window.gtag!('config', id, {
        page_path: url,
        page_title: title || document.title,
        page_location: window.location.href,
      });
    });
  } catch (err) {
    console.warn("[GA] trackPageView error:", err);
  }
};

/**
 * Tracks custom user interaction events in Google Analytics
 */
export const trackEvent = (action: string, category?: string, label?: string, value?: number) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } catch (err) {
    console.warn("[GA] trackEvent error:", err);
  }
};
