/**
 * Zero-Data Loss Local CBT Session Persistence
 * Ensures candidate responses and timer progress survive accidental reloads,
 * network dropouts, and mobile battery shutdowns.
 */

export interface PersistedCbtSession {
  sessionId: string;
  userId: string;
  userEmail?: string;
  examType: string;
  testMode: 'practice' | 'full';
  selectedSubjects: string[];
  activeSubjectKey: string;
  shuffledQuestionIds: Record<string, (string | number)[]>;
  questionsBySubject: Record<string, any[]>;
  answersBySubject: Record<string, Record<string | number, string>>;
  currentIndexBySubject: Record<string, number>;
  completedSubjects: Record<string, boolean>;
  bookmarkedQuestions: Record<string | number, boolean>;
  durationMinutes: number;
  endTime: number;
  startedAt: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  updatedAt: number;
}

const STORAGE_KEY = 'campusai_cbt_session_active';
const SESSION_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export function saveCbtSessionToStorage(session: Partial<PersistedCbtSession>): void {
  try {
    const existing = loadCbtSessionFromStorage();
    const updated: PersistedCbtSession = {
      ...(existing || {}),
      ...session,
      updatedAt: Date.now(),
    } as PersistedCbtSession;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[CBT Storage] Failed to persist active session to localStorage:', err);
  }
}

export function loadCbtSessionFromStorage(): PersistedCbtSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: PersistedCbtSession = JSON.parse(raw);
    const now = Date.now();

    // Validate expiration
    const lastActive = parsed.updatedAt || parsed.startedAt || now;
    if (now - lastActive > SESSION_TTL_MS) {
      clearCbtSessionFromStorage();
      return null;
    }

    if (parsed.status !== 'in_progress') {
      clearCbtSessionFromStorage();
      return null;
    }

    return parsed;
  } catch (err) {
    console.warn('[CBT Storage] Failed to parse persisted CBT session:', err);
    return null;
  }
}

export function clearCbtSessionFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('campus_cbt_active_session_id');
  } catch (err) {
    console.warn('[CBT Storage] Failed to clear local storage:', err);
  }
}

export function updateCbtAnswerInStorage(
  subjectKey: string,
  questionId: string | number,
  optionKey: string | null
): void {
  try {
    const session = loadCbtSessionFromStorage();
    if (!session) return;

    if (!session.answersBySubject) session.answersBySubject = {};
    if (!session.answersBySubject[subjectKey]) session.answersBySubject[subjectKey] = {};

    if (optionKey === null) {
      delete session.answersBySubject[subjectKey][questionId];
    } else {
      session.answersBySubject[subjectKey][questionId] = optionKey;
    }

    session.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('[CBT Storage] Error updating answer in local storage:', err);
  }
}

export function updateCbtBookmarkInStorage(questionId: string | number, isBookmarked: boolean): void {
  try {
    const session = loadCbtSessionFromStorage();
    if (!session) return;

    if (!session.bookmarkedQuestions) session.bookmarkedQuestions = {};
    if (isBookmarked) {
      session.bookmarkedQuestions[questionId] = true;
    } else {
      delete session.bookmarkedQuestions[questionId];
    }

    session.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('[CBT Storage] Error updating bookmark in local storage:', err);
  }
}
