/**
 * AdminContext — Server-verified admin role via Firebase Custom Claims.
 *
 * Admin status is determined ONLY by checking `claims.role === 'admin'`
 * on a force-refreshed Firebase ID token. No email strings, no bundled
 * secrets, no client-side string comparisons are used.
 *
 * To grant admin access run the Admin SDK once:
 *   admin.auth().setCustomUserClaims(uid, { role: 'admin' });
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AdminContextValue {
  /** True only when Firebase token custom claim `role === 'admin'` is verified. */
  isAdmin: boolean;
  /** True while the initial claim check is in flight. */
  isCheckingAdmin: boolean;
  /**
   * Force-refreshes the ID token and re-evaluates the admin claim.
   * Call after a privilege escalation to reflect newly granted claims
   * without a full page reload.
   */
  verifyAdminClaim: () => Promise<boolean>;
  /** Clears admin state immediately (e.g. on logout). */
  clearAdmin: () => void;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  isCheckingAdmin: true,
  verifyAdminClaim: async () => false,
  clearAdmin: () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  const checkClaim = useCallback(async (user: User | null): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return false;
    }
    try {
      // forceRefresh=true reads the latest server-set claims, not a stale local cache.
      const result = await user.getIdTokenResult(true);
      const hasAdminClaim = result.claims['role'] === 'admin';
      setIsAdmin(hasAdminClaim);
      setIsCheckingAdmin(false);
      return hasAdminClaim;
    } catch (err) {
      console.error('[AdminContext] Token claim check failed:', err);
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return false;
    }
  }, []);

  useEffect(() => {
    setIsCheckingAdmin(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkClaim(user);
    });
    return unsubscribe;
  }, [checkClaim]);

  const verifyAdminClaim = useCallback(async (): Promise<boolean> => {
    return checkClaim(auth.currentUser);
  }, [checkClaim]);

  const clearAdmin = useCallback(() => {
    setIsAdmin(false);
    setIsCheckingAdmin(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, isCheckingAdmin, verifyAdminClaim, clearAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

/** Use inside any component to access the server-verified admin role. */
export function useAdminRole() {
  return useContext(AdminContext);
}
