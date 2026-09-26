/**
 * useRateLimit
 * ---------------------------------------------------------------------------
 * Client-side rate-limit hook with localStorage persistence.
 *
 * Features:
 *  - Per-action configurable window + max-attempts
 *  - Sliding-window algorithm (drops individual attempts older than `windowMs`)
 *  - Survives page reloads (stored in localStorage)
 *  - Returns remaining count + msUntilReset so UI can show a countdown
 *
 * Usage:
 *   const { allowed, remaining, msUntilReset, consume } = useRateLimit('cbt_start', 5, 60_000);
 *   if (!allowed) return <BannerError message="Too many attempts. Try again in …" />;
 *   await consume(); // call before the guarded action
 */

import { useState, useCallback, useRef } from 'react';

interface RateLimitState {
  /** Timestamps (ms) of recent consume() calls within the window */
  attempts: number[];
}

interface UseRateLimitReturn {
  /** Whether the user may perform the action right now */
  allowed: boolean;
  /** How many more times they can consume() before being blocked */
  remaining: number;
  /** Milliseconds until the oldest attempt falls out of the window (0 = not blocked) */
  msUntilReset: number;
  /** Call before performing the guarded action. Returns false if blocked. */
  consume: () => boolean;
  /** Manually reset the counter (e.g., after admin grant) */
  reset: () => void;
}

function storageKey(action: string): string {
  return `campusai_rl_${action}`;
}

function loadState(action: string): RateLimitState {
  try {
    const raw = localStorage.getItem(storageKey(action));
    if (raw) {
      const parsed = JSON.parse(raw) as RateLimitState;
      if (Array.isArray(parsed.attempts)) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return { attempts: [] };
}

function saveState(action: string, state: RateLimitState): void {
  try {
    localStorage.setItem(storageKey(action), JSON.stringify(state));
  } catch {
    // localStorage might be full — silently skip persistence
  }
}

export function useRateLimit(
  action: string,
  maxAttempts: number,
  windowMs: number
): UseRateLimitReturn {
  // Initialise from localStorage so it survives reloads
  const [state, setState] = useState<RateLimitState>(() => loadState(action));

  // Keep a ref so consume() is always using the latest state without stale closures
  const stateRef = useRef(state);
  stateRef.current = state;

  const prune = useCallback((attempts: number[]): number[] => {
    const now = Date.now();
    return attempts.filter((t) => now - t < windowMs);
  }, [windowMs]);

  const now = Date.now();
  const fresh = prune(state.attempts);
  const allowed = fresh.length < maxAttempts;
  const remaining = Math.max(0, maxAttempts - fresh.length);
  const oldest = fresh[0] ?? 0;
  const msUntilReset = allowed ? 0 : Math.max(0, windowMs - (now - oldest));

  const consume = useCallback((): boolean => {
    const nowMs = Date.now();
    const current = prune(stateRef.current.attempts);
    if (current.length >= maxAttempts) return false;

    const next: RateLimitState = { attempts: [...current, nowMs] };
    stateRef.current = next;
    setState(next);
    saveState(action, next);
    return true;
  }, [action, maxAttempts, prune]);

  const reset = useCallback((): void => {
    const next: RateLimitState = { attempts: [] };
    stateRef.current = next;
    setState(next);
    saveState(action, next);
  }, [action]);

  return { allowed, remaining, msUntilReset, consume, reset };
}
