import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';
import App from './components/App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics
inject();

// Polyfill Object.hasOwn for older browser compatibility
if (!Object.hasOwn) {
  Object.hasOwn = function(object: any, property: PropertyKey): boolean {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
}

// Global Error Handler — catches errors that fall outside React's tree
window.onerror = function(message, source, lineno, colno, error) {
  if (error && error.message && error.message.includes("circular")) {
    console.error("Circular Structure Detected! Check the stack trace above.");
  }
};

// Unhandled promise rejections — prevent noisy false-positive crash alarms for benign browser/network events
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = reason?.message || String(reason || '');
  if (
    !reason ||
    reason?.name === 'AbortError' ||
    msg.includes('aborted') ||
    msg.includes('Failed to register a ServiceWorker') ||
    msg.includes('The play() request was interrupted') ||
    msg.includes('Notification') ||
    msg.includes('ResizeObserver')
  ) {
    event.preventDefault();
    return;
  }
  console.warn('[CampusAI] Handled background rejection:', msg);
});

// Register Service Worker for Offline & Notifications (safely handle sandboxed/iframe contexts)
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker.register('./sw.js')
        .then(_reg => console.log('CampusAI: Offline Shield Active ✅'))
        .catch(_err => {
          // Expected in certain sandboxed iframe environments
        });
    } catch {
      // Ignore synchronous SW registration failure in sandboxed origins
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* Top-level error boundary catches any unhandled component crash */}
    <ErrorBoundary>
      <HelmetProvider>
        <App />
        <SpeedInsights />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
