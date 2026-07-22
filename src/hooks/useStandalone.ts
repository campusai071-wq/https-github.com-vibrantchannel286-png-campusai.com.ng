import { useState, useEffect } from 'react';

export function useStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone || 
        document.referrer.includes('android-app://') ||
        // Check for Capacitor
        !!(window as any).Capacitor?.isNative ||
        !!(window as any).Capacitor ||
        // Check for Android WebView (often used in APK wrappers)
        /wv|WebView/.test(navigator.userAgent) ||
        // Another common pattern for Android WebViews
        (/Android/.test(navigator.userAgent) && /Version\//.test(navigator.userAgent)) ||
        // Check for custom URL parameter (e.g. ?source=apk or ?app=true)
        window.location.search.includes('source=apk') ||
        window.location.search.includes('app=true');
        
      setIsStandalone(!!isStandaloneMode);
    };

    checkStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const listener = (e: MediaQueryListEvent) => {
        if (e.matches) setIsStandalone(true);
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return isStandalone;
}
