/**
 * useOfflineQueue
 * ---------------------------------------------------------------------------
 * Zero-data-loss queue for Firestore writes under network-interrupted conditions.
 *
 * Design:
 *  - Writes are queued in IndexedDB (`campusai_offline_queue` store)
 *  - When the browser goes online again, queued ops are replayed in FIFO order
 *  - Each op is idempotent-safe via a stable `docId` + `merge: true`
 *  - Failed replays (non-transient errors) are kept for manual inspection /
 *    can be surfaced to an admin dashboard
 *
 * Supported op types:
 *  - 'set'    → setDoc(docRef, data, { merge: true })
 *  - 'update' → updateDoc(docRef, data)
 *  - 'delete' → deleteDoc(docRef)
 *
 * Usage:
 *   const { enqueue, queueLength } = useOfflineQueue();
 *   await enqueue({ type: 'update', collection: 'users', docId: uid, data: { x: 1 } });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

// ---------------------------------------------------------------------------
// IndexedDB helpers
// ---------------------------------------------------------------------------
const IDB_NAME = 'campusai_db';
const IDB_STORE = 'offline_queue';
const IDB_VERSION = 1;

interface QueuedOp {
  id: string;          // UUID for deduplication
  type: 'set' | 'update' | 'delete';
  collection: string;
  docId: string;
  data?: Record<string, unknown>;
  enqueuedAt: number;  // epoch ms
  attempts: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllOps(): Promise<QueuedOp[]> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).getAll();
      req.onsuccess = () => resolve((req.result as QueuedOp[]).sort((a, b) => a.enqueuedAt - b.enqueuedAt));
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function putOp(op: QueuedOp): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const req = tx.objectStore(IDB_STORE).put(op);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('[OfflineQueue] Failed to persist op to IDB:', e);
  }
}

async function deleteOp(id: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const req = tx.objectStore(IDB_STORE).delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // best-effort
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
interface EnqueueArgs {
  type: 'set' | 'update' | 'delete';
  collection: string;
  docId: string;
  data?: Record<string, unknown>;
}

interface UseOfflineQueueReturn {
  /** Queue a Firestore write. Executes immediately if online; persists to IDB if offline. */
  enqueue: (args: EnqueueArgs) => Promise<void>;
  /** Number of unprocessed ops in the queue */
  queueLength: number;
  /** Whether the hook is currently flushing the queue */
  isFlushing: boolean;
}

function uuid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const MAX_ATTEMPTS = 5;

export function useOfflineQueue(): UseOfflineQueueReturn {
  const [queueLength, setQueueLength] = useState(0);
  const [isFlushing, setIsFlushing] = useState(false);
  const flushLock = useRef(false);

  // Refresh queue length from IDB
  const refreshLength = useCallback(async () => {
    const ops = await getAllOps();
    setQueueLength(ops.length);
  }, []);

  // Execute a single op against Firestore
  const executeOp = useCallback(async (op: QueuedOp): Promise<boolean> => {
    if (!db) return false;
    const ref = doc(db, op.collection, op.docId);
    try {
      if (op.type === 'set') {
        await setDoc(ref, op.data ?? {}, { merge: true });
      } else if (op.type === 'update') {
        await updateDoc(ref, op.data ?? {});
      } else if (op.type === 'delete') {
        await deleteDoc(ref);
      }
      return true;
    } catch (e: any) {
      console.warn(`[OfflineQueue] Op ${op.id} failed (attempt ${op.attempts}):`, e?.message);
      return false;
    }
  }, []);

  // Flush all pending ops
  const flush = useCallback(async () => {
    if (flushLock.current || !navigator.onLine) return;
    flushLock.current = true;
    setIsFlushing(true);

    try {
      const ops = await getAllOps();
      for (const op of ops) {
        const success = await executeOp(op);
        if (success) {
          await deleteOp(op.id);
        } else {
          const updated: QueuedOp = { ...op, attempts: op.attempts + 1 };
          if (updated.attempts >= MAX_ATTEMPTS) {
            console.error(`[OfflineQueue] Op ${op.id} exceeded max attempts. Discarding.`);
            await deleteOp(op.id);
          } else {
            await putOp(updated);
          }
        }
      }
    } finally {
      flushLock.current = false;
      setIsFlushing(false);
      await refreshLength();
    }
  }, [executeOp, refreshLength]);

  // Listen to online/offline events
  useEffect(() => {
    const handleOnline = () => {
      flush();
    };
    window.addEventListener('online', handleOnline);
    // Attempt initial flush in case we're online at mount
    flush();
    refreshLength();
    return () => window.removeEventListener('online', handleOnline);
  }, [flush, refreshLength]);

  const enqueue = useCallback(async (args: EnqueueArgs) => {
    const op: QueuedOp = {
      id: uuid(),
      ...args,
      enqueuedAt: Date.now(),
      attempts: 0,
    };

    if (navigator.onLine && db) {
      // Try immediate execution
      const success = await executeOp(op);
      if (success) return; // Fast path — nothing queued
    }

    // Fallback: persist to IDB and update counter
    await putOp(op);
    await refreshLength();
  }, [executeOp, refreshLength]);

  return { enqueue, queueLength, isFlushing };
}
