// src/lib/adminAuth.ts
export const ADMIN_TOKEN = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_TOKEN) || (typeof process !== 'undefined' && process.env && process.env.VITE_ADMIN_TOKEN) || 'CAMPUS@2026';

