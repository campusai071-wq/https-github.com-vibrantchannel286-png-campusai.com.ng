import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';
import App from './components/App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  console.error("Global Error:", message, source, lineno, colno, error);
  if (error && error.message && error.message.includes("circular")) {
    console.error("Circular Structure Detected! Check the stack trace above.");
  }
};

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('[CampusAI] Unhandled promise rejection:', event.reason);
});

// Register Service Worker for Offline & Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(_reg => console.log('CampusAI: Offline Shield Active ✅'))
      .catch(_err => {
        console.warn('CampusAI: SW registration skipped.');
      });
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
