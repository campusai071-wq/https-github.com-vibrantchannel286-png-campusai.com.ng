import { UserProfile, UserRole } from '../types';
import { db, auth } from './firebaseConfig';
import { stringify } from './utils';
import { doc, updateDoc, setDoc, collection, query, orderBy, limit, getDocs, Timestamp, getDoc, getCountFromServer, onSnapshot, where, getAggregateFromServer, sum, addDoc, deleteDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from './firestoreUtils';
import { validateUserProfile } from '../lib/validation';

const JOURNEY_KEY = 'campusai_journey_progress';
export const DAILY_LIMIT = 1;
export const QUOTA_KEY = 'campusai_user_profile';
export const FREE_GUEST_LIMIT = 1;
export const FREE_USER_LIMIT = 1;

export const isPremiumChatLimitActive = (activatedAtStr?: string): boolean => {
  if (!activatedAtStr) return false;
  try {
    const activatedAt = new Date(activatedAtStr).getTime();
    const elapsedMs = Date.now() - activatedAt;
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000; // 48 hours for 2 days
    return elapsedMs < twoDaysMs;
  } catch (e) {
    return false;
  }
};

export const getChatLimits = (profile: UserProfile): { maxChats: number, remainingChats: number } => {
  const today = new Date().toISOString().split('T')[0];
  const dailyChatsUsed = profile.daily_chat_last_reset === today ? (profile.daily_chats || 0) : 0;
  
  const isRegistered = isRealUser(profile.uid);
  const isScholarPackActive = Boolean(
    profile.is_premium || 
    (profile.scholarCredits || 0) > 0 || 
    isPremiumChatLimitActive(profile.premium_activated_at)
  );
  
  // Base daily chat limit:
  // - Scholar Pack active: 10 daily chats (10/day for 2 days)
  // - Registered free: 5 daily chats
  // - Guest: 1 trial chat
  let maxChats = 5;
  if (isScholarPackActive) {
    maxChats = 10;
  } else if (!isRegistered) {
    maxChats = 1;
  }
  
  const remainingChats = Math.max(0, maxChats - dailyChatsUsed);
  return { maxChats, remainingChats };
};

export const checkAndIncrementChats = async (uid: string) => {
  const profile = getLocalProfile();
  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile.daily_chat_last_reset !== today;
  
  const daily_chats = isNewDay ? 0 : (profile.daily_chats || 0);
  const { maxChats } = getChatLimits(profile);

  if (daily_chats >= maxChats) {
    return { allowed: false, current: daily_chats, limit: maxChats };
  }

  const updated: UserProfile = { 
    ...profile, 
    daily_chats: daily_chats + 1,
    daily_chat_last_reset: today
  };
  
  localStorage.setItem(QUOTA_KEY, stringify(updated));
  
  if (db && isRealUser(uid)) {
    try {
      await updateDoc(doc(db, "users", uid), { 
        daily_chats: updated.daily_chats,
        daily_chat_last_reset: updated.daily_chat_last_reset
      });
    } catch (e) {
      console.warn("Failed to sync chats to DB:", e);
    }
  }
  
  window.dispatchEvent(new CustomEvent('campusai_quota_updated', { detail: updated }));
  return { allowed: true, current: updated.daily_chats, limit: maxChats };
};

export const isRealUser = (uid?: string) => {
  if (!uid) return false;
  return !uid.startsWith('local-') && !uid.startsWith('email-user-');
};

/**
 * ATOMIC LOCAL PROFILE RETRIEVAL
 */
export const getLocalProfile = (): UserProfile => {
  const stored = localStorage.getItem(QUOTA_KEY);
  
  if (stored) {
    try {
      const data = JSON.parse(stored) as UserProfile;
      return data;
    } catch (e) {
      localStorage.removeItem(QUOTA_KEY);
    }
  }

  const newProfile: UserProfile = {
    uid: 'local-' + Math.random().toString(36).substr(2, 9),
    displayName: 'Scholar',
    role: 'Pre-Admission',
    lifetime_calculations: 0,
    is_premium: false
  };
  localStorage.setItem(QUOTA_KEY, stringify(newProfile));
  return newProfile;
};

/**
 * CLOUD SYNCHRONIZATION ENGINE
 */
export const syncAndValidateProfile = async (uid: string, firebaseUser?: any): Promise<UserProfile> => {
  const local = getLocalProfile();
  const isSameUser = local.uid === uid;

  if (!db || !isRealUser(uid)) return local;

  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef).catch(e => handleFirestoreError(e, OperationType.GET, `users/${uid}`));
    
    if (snap && snap.exists()) {
      const cloud = snap.data();
      const baseLocal: Partial<UserProfile> = isSameUser ? local : {};
      const merged: any = { 
        ...baseLocal, 
        ...cloud,
        uid: uid,
      };

      // Ensure we don't accidentally wipe progress or premium state if local is ahead for same user
      if (isSameUser) {
        const finalCalculations = Math.max(local.lifetime_calculations || 0, cloud.lifetime_calculations || 0);
        merged.lifetime_calculations = finalCalculations;
        merged.is_premium = Boolean(local.is_premium || cloud.is_premium);
        merged.scholarCredits = Math.max(local.scholarCredits || 0, cloud.scholarCredits || 0);
        merged.premium_activated_at = local.premium_activated_at || cloud.premium_activated_at;
      }

      const validation = validateUserProfile(merged);
      if (!validation.success) {
          console.error("Cloud data invalid, not syncing:", validation.error);
          return (cloud as UserProfile) || local;
      }
      const finalProfile = validation.data as UserProfile;
      localStorage.setItem(QUOTA_KEY, stringify(finalProfile));
      return finalProfile;
    } else {
      // Create new user in cloud
      const baseLocal: Partial<UserProfile> = isSameUser ? local : {};
      const fallbackUser = firebaseUser || auth.currentUser;
      const newProfile: UserProfile = {
        ...baseLocal,
        uid: uid,
        email: fallbackUser?.email || '',
        displayName: fallbackUser?.displayName || (isSameUser ? local.displayName : '') || 'Scholar',
        photoURL: fallbackUser?.photoURL || '',
        role: (baseLocal.role as UserRole) || 'Pre-Admission',
        is_premium: Boolean(baseLocal.is_premium),
        daily_requests: 0,
        scholarCredits: baseLocal.scholarCredits || 0,
        meritUsageCount: 0,
        lifetime_calculations: baseLocal.lifetime_calculations || 0,
        last_active: new Date().toISOString()
      };
      if (baseLocal.premium_activated_at) {
        newProfile.premium_activated_at = baseLocal.premium_activated_at;
      }
      await setDoc(userRef, newProfile).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${uid}`));
      localStorage.setItem(QUOTA_KEY, stringify(newProfile));
      return newProfile;
    }
  } catch (e) {
    console.warn("Cloud sync deferred:", e);
    return local;
  }
};

export const deductScholarCredit = async (uid: string) => {
  if (!db || !isRealUser(uid)) return;
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const current = data.scholarCredits || 0;
    if (current > 0) {
      const nextCredits = current - 1;
      const updates: any = { scholarCredits: nextCredits };
      if (nextCredits === 0) {
        updates.is_premium = false;
      }
      await updateDoc(userRef, updates);
      
      const profile = getLocalProfile();
      if (profile.uid === uid) {
        const updated = { ...profile, ...updates };
        localStorage.setItem(QUOTA_KEY, stringify(updated));
        window.dispatchEvent(new CustomEvent('campusai_quota_updated', { detail: updated }));
      }
    }
  } catch (e) {
    console.error("Failed to deduct scholar credit:", e);
  }
};

export const trackReferral = async (referrerUid: string, invitedUid: string) => {
  if (!db) return;
  try {
    const referrerRef = doc(db, "users", referrerUid);
    const referrerDoc = await getDoc(referrerRef);
    if (!referrerDoc.exists()) return;

    const data = referrerDoc.data();
    const registrationRewardGranted = data.registration_reward_granted || false;
    
    // Increment total successful referrals
    const count = (data.referral_count || 0) + 1;
    const updateData: any = { referral_count: count };
    
    // Grant 5 free trials (scholar credits) on the FIRST registration
    if (count >= 1 && !registrationRewardGranted) {
      const currentCredits = data.scholarCredits || 0;
      updateData.scholarCredits = currentCredits + 5;
      updateData.registration_reward_granted = true;
    }
    
    await updateDoc(referrerRef, updateData);
  } catch (e) {
    console.error("Referral tracking error:", e);
  }
};

export const initializeUserProfile = async (user?: any, role?: UserRole): Promise<UserProfile> => {
  if (user && isRealUser(user.uid)) {
    if (role) {
      const local = getLocalProfile();
      localStorage.setItem(QUOTA_KEY, stringify({ ...local, role }));
    }
    return await syncAndValidateProfile(user.uid, user);
  }
  return getLocalProfile();
};

export const incrementMeritUsage = async (uid?: string) => {
  if (!uid) {
    const guestUsage = parseInt(localStorage.getItem('guest_merit_usage') || '0');
    localStorage.setItem('guest_merit_usage', (guestUsage + 1).toString());
    return;
  }

  if (!db || !isRealUser(uid)) return;

  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    const data = snap.data() || {};
    const current = data.meritUsageCount || 0;
    
    await updateDoc(userRef, {
      meritUsageCount: current + 1
    });
    
    // Dispatch update event to refresh UI
    window.dispatchEvent(new CustomEvent('campusai_quota_updated', { detail: { ...data, meritUsageCount: current + 1 } }));
  } catch (e) {
    console.error("Failed to increment merit usage:", e);
  }
};

export const subscribeToUserProfile = (uid: string, callback: (profile: UserProfile) => void) => {
  if (!db || !isRealUser(uid)) return () => {};
  // Replaced redundant onSnapshot real-time listener with a one-time getDoc read to audit and eliminate excessive Firestore reads
  getDoc(doc(db, "users", uid)).then((snapshot: any) => {
    if (snapshot.exists()) {
      const cloudData = snapshot.data();
      const local = getLocalProfile();
      
      const merged: UserProfile = {
        ...local,
        ...cloudData,
        uid: uid,
        is_premium: Boolean(local.is_premium || cloudData.is_premium),
        scholarCredits: Math.max(local.scholarCredits || 0, cloudData.scholarCredits || 0),
        premium_activated_at: local.premium_activated_at || cloudData.premium_activated_at,
      };
      
      localStorage.setItem(QUOTA_KEY, stringify(merged));
      callback(merged);
    }
  }).catch((error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  });
  return () => {}; // No-op unsubscribe function
};

export const updateUserProfile = async (data: Partial<UserProfile>, uid?: string) => {
  const profile = getLocalProfile();
  const targetUid = uid || profile.uid;
  const updated = { ...profile, ...data, uid: targetUid };
  
  const validation = validateUserProfile(updated);
  if (!validation.success) {
      console.error("Updated profile data invalid:", validation.error);
      return profile;
  }
  
  const finalProfile = validation.data as UserProfile;
  localStorage.setItem(QUOTA_KEY, stringify(finalProfile));
  
  if (db && isRealUser(targetUid)) {
    try { 
      const normalizedData = { ...data };
      if (data.role) normalizedData.role = finalProfile.role;
      if (data.displayName) normalizedData.displayName = finalProfile.displayName;
      if (data.email) normalizedData.email = finalProfile.email;
      
      await updateDoc(doc(db, "users", targetUid), normalizedData); 
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${targetUid}`);
    }
  }

  window.dispatchEvent(new CustomEvent('campusai_quota_updated', { detail: finalProfile }));
  return finalProfile;
};

/**
 * PERSISTENT PROFILE MANAGEMENT
 */
export const saveUserProfile = async (userId: string, data: any) => {
  if (!db) return;
  try {
    await setDoc(doc(db, 'users', userId, 'profile', 'data'), data, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `users/${userId}/profile/data`);
  }
};

export const getUserProfile = async (userId: string) => {
  if (!db) return null;
  try {
    const docRef = doc(db, 'users', userId, 'profile', 'data');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, `users/${userId}/profile/data`);
    return null;
  }
};

export const checkAndIncrementCalculations = async (uid: string) => {
  const profile = getLocalProfile();
  const nextCalculations = (profile.lifetime_calculations || 0) + 1;
  
  if (profile.is_premium) {
    const updated: UserProfile = {
      ...profile,
      lifetime_calculations: nextCalculations
    };
    localStorage.setItem(QUOTA_KEY, stringify(updated));
    if (db && isRealUser(uid)) {
      try {
        await updateDoc(doc(db, "users", uid), {
          lifetime_calculations: nextCalculations
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
      }
    }
    window.dispatchEvent(new CustomEvent('campusai_quota_updated', { detail: updated }));
    return { allowed: true, current: nextCalculations, limit: Infinity };
  }
  
  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile.daily_last_reset !== today;
  
  const daily_requests = isNewDay ? 0 : (profile.daily_requests || 0);
  const limit = DAILY_LIMIT;

  if (daily_requests >= limit) {
    return { allowed: false, current: daily_requests, limit };
  }

  const updated: UserProfile = { 
    ...profile, 
    daily_requests: daily_requests + 1,
    daily_last_reset: today,
    lifetime_calculations: nextCalculations 
  };
  
  localStorage.setItem(QUOTA_KEY, stringify(updated));
  
  if (db && isRealUser(uid)) {
    try {
      await updateDoc(doc(db, "users", uid), { 
        daily_requests: updated.daily_requests,
        daily_last_reset: updated.daily_last_reset,
        lifetime_calculations: updated.lifetime_calculations 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  }
  
  window.dispatchEvent(new CustomEvent('campusai_quota_updated', { detail: updated }));
  return { allowed: true, current: updated.daily_requests, limit };
};

export const checkCalculationsLimit = async (uid: string): Promise<{ allowed: boolean; current: number; limit: number }> => {
  const profile = getLocalProfile();
  if (profile.is_premium || (profile.scholarCredits || 0) > 0) {
    return { allowed: true, current: profile.lifetime_calculations || 0, limit: Infinity };
  }
  
  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile.daily_last_reset !== today;
  
  const daily_requests = isNewDay ? 0 : (profile.daily_requests || 0);
  const limit = DAILY_LIMIT;

  if (daily_requests >= limit) {
    return { allowed: false, current: daily_requests, limit };
  }
  
  return { allowed: true, current: daily_requests, limit };
};

export const incrementCalculations = async (uid: string): Promise<{ current: number; limit: number }> => {
  const profile = getLocalProfile();
  const nextCalculations = (profile.lifetime_calculations || 0) + 1;
  
  if (profile.is_premium) {
    const updated: UserProfile = {
      ...profile,
      lifetime_calculations: nextCalculations
    };
    localStorage.setItem(QUOTA_KEY, stringify(updated));
    if (db && isRealUser(uid)) {
      try {
        await updateDoc(doc(db, "users", uid), {
          lifetime_calculations: nextCalculations
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
      }
    }
    window.dispatchEvent(new CustomEvent('campusai_quota_updated', { detail: updated }));
    return { current: nextCalculations, limit: Infinity };
  }
  
  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile.daily_last_reset !== today;
  
  const daily_requests = isNewDay ? 0 : (profile.daily_requests || 0);
  const limit = DAILY_LIMIT;

  const updated: UserProfile = { 
    ...profile, 
    daily_requests: daily_requests + 1,
    daily_last_reset: today,
    lifetime_calculations: nextCalculations 
  };
  
  localStorage.setItem(QUOTA_KEY, stringify(updated));
  
  if (db && isRealUser(uid)) {
    try {
      await updateDoc(doc(db, "users", uid), { 
        daily_requests: updated.daily_requests,
        daily_last_reset: updated.daily_last_reset,
        lifetime_calculations: updated.lifetime_calculations 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  }
  
  window.dispatchEvent(new CustomEvent('campusai_quota_updated', { detail: updated }));
  return { current: updated.daily_requests || 0, limit };
};

export const fetchRecentUsers = async (): Promise<UserProfile[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, "users"), orderBy("last_active", "desc"), limit(200));
    const snap = await getDocs(q);
    const users = snap.docs.map((d: any) => ({ uid: d.id, ...d.data() }));
    
    // Backfill real calculation count from predictions table for accuracy (disabled to avoid quota issues)
    const enhancedUsers = users.map((u) => {
        return { ...u, lifetime_calculations: u.lifetime_calculations || u.meritUsageCount || 0 };
    });
    return enhancedUsers;
  } catch (e: any) { console.error("fetchRecentUsers error:", e); return []; }
};

let cachedTotalUserCount: number | null = null;
let lastTotalUserCountTime = 0;
const USER_COUNT_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export const getTotalUserCount = async (): Promise<number> => {
  if (!db) return 0;
  const now = Date.now();
  if (cachedTotalUserCount !== null && (now - lastTotalUserCountTime < USER_COUNT_CACHE_TTL)) {
    return cachedTotalUserCount;
  }
  try {
    const snap = await getCountFromServer(collection(db, "users"));
    const count = snap.data().count;
    cachedTotalUserCount = count;
    lastTotalUserCountTime = now;
    return count;
  } catch (e: any) {
    console.warn("getTotalUserCount: getCountFromServer failed:", e);
    return cachedTotalUserCount || 0;
  }
};

export const getGlobalCalculationsSum = async (): Promise<number> => {
  if (!db) return 0;
  try {
    const coll = collection(db, "users");
    const snapshot = await getAggregateFromServer(coll, {
      total: sum('lifetime_calculations')
    });
    return snapshot.data().total;
  } catch (e: any) {
    console.error("getGlobalCalculationsSum error:", e);
    return 0;
  }
};

export const saveJourneyProgress = async (uid: string, progress: number[]) => {
  localStorage.setItem(JOURNEY_KEY, stringify(progress));
  if (db && isRealUser(uid)) {
    try { await updateDoc(doc(db, "users", uid), { journey_progress: progress }); } catch (e) {}
  }
};

/**
 * USER ACTIVITIES SUBCOLLECTION (/users/{userId}/activities/{activityId})
 */
export const saveUserActivity = async (userId: string, activity: { type: string; title: string; details?: any; timestamp?: string }) => {
  const payload = {
    ...activity,
    userId,
    createdAt: activity.timestamp || new Date().toISOString()
  };

  // Local mirror
  try {
    const localKey = `campusai_activities_${userId}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    existing.unshift(payload);
    localStorage.setItem(localKey, stringify(existing.slice(0, 50)));
  } catch (e) {}

  if (db && isRealUser(userId)) {
    try {
      await addDoc(collection(db, "users", userId, "activities"), payload);
    } catch (e) {
      console.warn("Failed to write activity subcollection:", e);
    }
  }
};

export const getUserActivities = async (userId: string, maxLimit: number = 20): Promise<any[]> => {
  if (!db || !isRealUser(userId)) {
    try {
      const localKey = `campusai_activities_${userId}`;
      return JSON.parse(localStorage.getItem(localKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  try {
    const q = query(
      collection(db, "users", userId, "activities"),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("Failed to load user activities from cloud:", e);
    const localKey = `campusai_activities_${userId}`;
    return JSON.parse(localStorage.getItem(localKey) || '[]');
  }
};

/**
 * USER PREDICTIONS & CALCULATIONS SUBCOLLECTION (/users/{userId}/predictions/{predictionId})
 */
export const saveUserPrediction = async (userId: string, prediction: { course: string; institution: string; score: number; aggregate: number; chance: string; details?: any }) => {
  const payload = {
    ...prediction,
    userId,
    createdAt: new Date().toISOString()
  };

  // Local storage cache
  try {
    const localKey = `campusai_user_predictions_${userId}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    existing.unshift(payload);
    localStorage.setItem(localKey, stringify(existing.slice(0, 30)));
  } catch (e) {}

  if (db && isRealUser(userId)) {
    try {
      await addDoc(collection(db, "users", userId, "predictions"), payload);
    } catch (e) {
      console.warn("Failed to persist user prediction:", e);
    }
  }
};

export const getUserPredictions = async (userId: string, maxLimit: number = 20): Promise<any[]> => {
  if (!db || !isRealUser(userId)) {
    try {
      const localKey = `campusai_user_predictions_${userId}`;
      return JSON.parse(localStorage.getItem(localKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  try {
    const q = query(
      collection(db, "users", userId, "predictions"),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    const localKey = `campusai_user_predictions_${userId}`;
    return JSON.parse(localStorage.getItem(localKey) || '[]');
  }
};

/**
 * USER BOOKMARKS SUBCOLLECTION (/users/{userId}/bookmarks/{bookmarkId})
 */
export const saveUserBookmark = async (userId: string, bookmark: { id: string; title: string; type: 'news' | 'course' | 'institution'; data?: any }) => {
  if (!userId) return;
  const docId = `${bookmark.type}_${bookmark.id}`;

  if (db && isRealUser(userId)) {
    try {
      await setDoc(doc(db, "users", userId, "bookmarks", docId), {
        ...bookmark,
        userId,
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Failed to save cloud bookmark:", e);
    }
  }
};

export const removeUserBookmark = async (userId: string, bookmarkId: string, type: 'news' | 'course' | 'institution') => {
  if (!userId) return;
  const docId = `${type}_${bookmarkId}`;

  if (db && isRealUser(userId)) {
    try {
      await deleteDoc(doc(db, "users", userId, "bookmarks", docId));
    } catch (e) {
      console.warn("Failed to delete cloud bookmark:", e);
    }
  }
};

export const syncUserBookmarks = async (userId: string, localBookmarkIds: string[]): Promise<string[]> => {
  if (!db || !isRealUser(userId)) return localBookmarkIds;

  try {
    const snap = await getDocs(collection(db, "users", userId, "bookmarks"));
    const cloudIds = snap.docs.map(d => d.data().id || d.id.replace(/^news_/, ''));
    const union = Array.from(new Set([...localBookmarkIds, ...cloudIds]));
    return union;
  } catch (e) {
    return localBookmarkIds;
  }
};

