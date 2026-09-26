/**
 * ErrorBoundary
 * ---------------------------------------------------------------------------
 * Production-grade React Error Boundary with:
 *  - Structured crash reporting to /api/errors (fire-and-forget)
 *  - Retry / reload actions for the user
 *  - Graceful "chunk failed" detection (code-split lazy import failure)
 *  - Optional fallback prop for component-level containment
 *  - Development-mode full stack trace rendering
 *
 * Usage (page-level):
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Usage (component-level with custom fallback):
 *   <ErrorBoundary fallback={<p>Something went wrong loading the calculator.</p>}>
 *     <CutoffCalculator … />
 *   </ErrorBoundary>
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { getApiUrl } from '../services/utils';

// ---------------------------------------------------------------------------
// Crash reporter — fire-and-forget POST to server
// ---------------------------------------------------------------------------
async function reportCrash(
  error: Error,
  info: ErrorInfo,
  location: string
): Promise<void> {
  try {
    await fetch(getApiUrl('/api/errors'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        name: error.name,
        stack: error.stack?.slice(0, 4000), // limit payload size
        componentStack: info.componentStack?.slice(0, 4000),
        url: location,
        userAgent: navigator.userAgent,
        ts: new Date().toISOString(),
      }),
      // Don't block the UI
      keepalive: true,
    });
  } catch {
    // If crash reporting fails, we MUST still render the fallback — never throw.
  }
}

// ---------------------------------------------------------------------------
// Chunk-load error detection (lazy() failures after a deploy)
// ---------------------------------------------------------------------------
function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    /loading chunk/i.test(error.message) ||
    /failed to fetch/i.test(error.message) ||
    /dynamically imported module/i.test(error.message)
  );
}

// ---------------------------------------------------------------------------
// Props & State
// ---------------------------------------------------------------------------
interface Props {
  children: ReactNode;
  /** Custom fallback UI to render instead of the default crash screen */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isChunkError: boolean;
  retryCount: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isChunkError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      isChunkError: isChunkLoadError(error),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ errorInfo: info });

    // Report to server asynchronously
    reportCrash(error, info, window.location.href);

    // For chunk-load errors (new deploy invalidated old chunks), auto-reload once
    if (isChunkLoadError(error) && this.state.retryCount === 0) {
      console.warn('[ErrorBoundary] Chunk load failure detected — refreshing page.');
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      isChunkError: false,
      retryCount: prev.retryCount + 1,
    }));
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Custom fallback
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const isDev = import.meta.env.DEV;
    const { error, errorInfo, isChunkError } = this.state;

    // Auto-reloading after chunk error
    if (isChunkError && this.state.retryCount === 0) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-white">Updating CampusAI…</h1>
            <p className="text-gray-400 text-sm">
              A new version was just deployed. Reloading to apply the update…
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-gray-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          {/* Icon */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Something went wrong</h1>
              <p className="text-gray-400 text-xs mt-0.5">
                Our team has been notified. You can try again or go back home.
              </p>
            </div>
          </div>

          {/* Error summary (production: generic; dev: detailed) */}
          <div className="bg-gray-950/70 rounded-xl p-4 border border-white/5">
            <p className="text-red-300 text-sm font-mono break-all">
              {isDev ? error?.message : 'An unexpected error occurred. Please try again.'}
            </p>
            {isDev && errorInfo && (
              <details className="mt-3">
                <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 transition-colors">
                  Component stack (dev only)
                </summary>
                <pre className="mt-2 text-gray-400 text-[10px] overflow-auto max-h-48 whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleRetry}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm transition-colors border border-white/10"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
