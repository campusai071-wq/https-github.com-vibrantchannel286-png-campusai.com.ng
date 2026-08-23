import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export const getApiUrl = (path: string): string => {
  if (typeof window === 'undefined') return path;
  
  // If we are running in the AI Studio container development/preview environment (*.run.app) or localhost dev port,
  // we must always use local relative paths to target the correct local API proxy.
  const isDevEnv = location.hostname.includes('.run.app') || (location.hostname === 'localhost' && location.port === '3000');
  if (isDevEnv) {
    return path;
  }
  
  // Detect if we are running in a native app context (Capacitor/Cordova) or file:// protocol
  const isNativeApp = !!(window as any).Capacitor || !!(window as any).cordova || location.protocol === 'file:';
  
  // Detect if we are on Capacitor's localhost (usually port 80 or empty)
  const isCapacitorLocalhost = location.hostname === 'localhost' && (location.port === '' || location.port === '80');
  
  if (isNativeApp || isCapacitorLocalhost) {
    const baseUrl = 'https://campusai.com.ng';
    return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }
  
  return path;
};

export const stringify = (obj: any, spacer: string = "  ") => {
  const cache = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        // Circular reference found, discard key
        return;
      }
      cache.add(value);
    }
    return value;
  }, spacer);
};

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const cleanObject = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  // Preserve Date objects, Firestore Timestamps (duck-typing via toDate), and FieldValues
  if (obj instanceof Date || typeof obj.toDate === 'function' || obj.constructor?.name === 'FieldValue' || obj.constructor?.name === 'Timestamp') {
    return obj;
  }

  if (Array.isArray(obj)) return obj.map(cleanObject).filter(v => v !== undefined);
  
  const clean: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = (typeof value === 'object' && value !== null) ? cleanObject(value) : value;
    }
  }
  return clean;
};

export const triggerBrowserNotification = async (title: string, body: string, slug?: string) => {
  if (Capacitor.isNativePlatform()) {
    try {
      let permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        permStatus = await LocalNotifications.requestPermissions();
      }
      
      if (permStatus.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: title,
              body: body,
              id: Math.floor(Math.random() * 2147483647),
              schedule: { at: new Date(Date.now() + 1000 * 1) }, // schedule for 1 second later
              actionTypeId: "",
              extra: { slug: slug }
            }
          ]
        });
      }
    } catch (e) {
      console.error("Local Notifications error", e);
    }
    return;
  }

  // Web fallback
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const url = slug ? `${window.location.origin}/news/${slug}` : window.location.origin;
    const options = {
      body: body,
      tag: slug || 'campusai-update',
      vibrate: [200, 100, 200],
      data: { url: url }
    };

    // Mobile browsers require showing notifications via Service Worker
    const fallbackNotification = () => {
      try {
        const n = new Notification(title, options);
        n.onclick = (e) => {
          e.preventDefault();
          window.focus();
          if (slug) {
            window.location.href = `/news/${slug}`;
          }
        };
      } catch (e) {
        console.error("Failed to trigger browser Notification API:", e);
      }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification(title, options)
            .catch((err) => {
              console.warn("ServiceWorker showNotification failed, trying fallback:", err);
              fallbackNotification();
            });
        })
        .catch((err) => {
          console.warn("ServiceWorker ready check failed, trying fallback:", err);
          fallbackNotification();
        });
    } else {
      fallbackNotification();
    }

  }
};


export const compressImage = (file: File, maxWidth: number = 800): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress as JPEG with 70% quality
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
