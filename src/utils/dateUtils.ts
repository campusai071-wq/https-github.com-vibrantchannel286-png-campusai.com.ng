import { NewsItem } from '../types';

/**
 * Normalizes any timestamp representation (Firestore Timestamp, Date, ISO string, epoch number, {seconds})
 * into milliseconds since Unix epoch. Returns 0 on failure.
 */
export const normalizeToMs = (val: any): number => {
  if (!val) return 0;
  if (typeof val?.toMillis === 'function') return val.toMillis();
  if (typeof val?.toDate === 'function') return val.toDate().getTime();
  if (typeof val === 'object') {
    if ('seconds' in val && typeof val.seconds === 'number') return val.seconds * 1000;
    if ('_seconds' in val && typeof val._seconds === 'number') return val._seconds * 1000;
  }
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed.includes('[') || trimmed.includes(']')) return 0;
    const parsed = new Date(trimmed).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Extracts the most accurate publication/creation timestamp (in ms) for a news item.
 */
export const getNewsItemTimestampMs = (item: NewsItem | null | undefined, now: number = Date.now()): number => {
  if (!item) return 0;

  const maxAllowed = now + 60000;

  // 1. Check createdAt (exact creation time including hours & minutes)
  const createdMs = normalizeToMs(item.createdAt);
  if (createdMs > 0 && createdMs <= maxAllowed) {
    return createdMs;
  }

  // 2. Check archivedAt
  const archivedMs = normalizeToMs(item.archivedAt);
  if (archivedMs > 0 && archivedMs <= maxAllowed) {
    return archivedMs;
  }

  // 3. Check publication date string
  const dateStr = item.date ? item.date.trim() : '';
  const isBracketed = dateStr.includes('[') || dateStr.includes(']');
  const pubDateMs = (!isBracketed && dateStr) ? normalizeToMs(dateStr) : 0;
  if (pubDateMs > 0 && pubDateMs <= maxAllowed) {
    return pubDateMs;
  }

  // 4. Check updatedAt
  const updatedMs = normalizeToMs(item.updatedAt);
  if (updatedMs > 0 && updatedMs <= maxAllowed) {
    return updatedMs;
  }

  return 0;
};

export interface NewsTimeDisplay {
  timeAgo: string;        // e.g. "Just now", "4 mins ago", "2 hours ago", "Yesterday", "3 days ago"
  exactTime: string;      // e.g. "2:45 PM" (WAT / Lagos)
  exactDate: string;      // e.g. "March 17, 2026"
  shortDate: string;      // e.g. "Mar 17"
  dateTimeStr: string;    // e.g. "March 17, 2026 at 2:45 PM"
  combinedCard: string;   // e.g. "2 hours ago • 2:45 PM" or "4 mins ago • 10:15 AM"
  combinedDetail: string; // e.g. "March 17, 2026 at 2:45 PM (2 hours ago)"
  rawMs: number;
}

/**
 * Formats a NewsItem's publication time with both relative ("2 hours ago", "4 mins ago")
 * and exact posting time ("10:30 AM", "March 17, 2026") in West Africa Time (WAT).
 */
export const formatNewsPostTime = (item: NewsItem | null | undefined, now: number = Date.now()): NewsTimeDisplay => {
  if (!item) {
    return {
      timeAgo: 'Recently',
      exactTime: '',
      exactDate: 'Recent Update',
      shortDate: 'Recent',
      dateTimeStr: 'Recently posted',
      combinedCard: 'Recently',
      combinedDetail: 'Recently published',
      rawMs: 0
    };
  }

  const ms = getNewsItemTimestampMs(item, now);

  // If no parseable timestamp, gracefully use raw date string
  if (ms === 0) {
    const rawDate = item.date && !item.date.includes('[') ? item.date.trim() : 'Recent Update';
    return {
      timeAgo: 'Recently',
      exactTime: '',
      exactDate: rawDate,
      shortDate: rawDate,
      dateTimeStr: rawDate,
      combinedCard: rawDate,
      combinedDetail: rawDate,
      rawMs: 0
    };
  }

  const dateObj = new Date(ms);

  // Nigerian time (WAT = UTC+1)
  const exactTime = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Africa/Lagos'
  });

  const exactDate = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Africa/Lagos'
  });

  const shortDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Africa/Lagos'
  });

  const dateTimeStr = `${exactDate} at ${exactTime}`;

  // Relative elapsed time
  const diffMs = Math.max(0, now - ms);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeAgo = '';
  let combinedCard = '';

  if (diffMin < 1) {
    timeAgo = 'Just now';
    combinedCard = `Just now • ${exactTime}`;
  } else if (diffMin < 60) {
    timeAgo = `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
    combinedCard = `${timeAgo} • ${exactTime}`;
  } else if (diffHours < 24) {
    timeAgo = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    combinedCard = `${timeAgo} • ${exactTime}`;
  } else if (diffDays === 1) {
    timeAgo = 'Yesterday';
    combinedCard = `Yesterday • ${exactTime}`;
  } else if (diffDays < 7) {
    timeAgo = `${diffDays} days ago`;
    combinedCard = `${timeAgo} • ${exactTime}`;
  } else if (diffDays < 14) {
    timeAgo = '1 week ago';
    combinedCard = `1 week ago • ${shortDate}`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    timeAgo = `${weeks} weeks ago`;
    combinedCard = `${weeks} weeks ago • ${shortDate}`;
  } else {
    timeAgo = shortDate;
    combinedCard = exactDate;
  }

  const combinedDetail = `${exactDate} at ${exactTime} (${timeAgo})`;

  return {
    timeAgo,
    exactTime,
    exactDate,
    shortDate,
    dateTimeStr,
    combinedCard,
    combinedDetail,
    rawMs: ms
  };
};
