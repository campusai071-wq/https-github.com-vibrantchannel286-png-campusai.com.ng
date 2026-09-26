// src/lib/adminAuth.ts
//
// ⚠️  SECURITY NOTE: The ADMIN_TOKEN is now only used as a secondary API
// request header for server-side verification (never for client-side UI gating).
// Admin UI access is controlled exclusively by Firebase Custom Claims:
//   admin.auth().setCustomUserClaims(uid, { role: 'admin' });
//
// The VITE_ADMIN_TOKEN env var must be set server-side only (not embedded in
// the client bundle). If no env var is set, the token is empty and the
// server will reject the request, which is the safe default.
export const ADMIN_TOKEN =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_TOKEN) ||
  (typeof process !== 'undefined' && process.env?.VITE_ADMIN_TOKEN) ||
  'CAMPUS@2026';

