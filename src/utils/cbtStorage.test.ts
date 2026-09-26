import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveCbtSessionToStorage,
  loadCbtSessionFromStorage,
  clearCbtSessionFromStorage,
  updateCbtAnswerInStorage,
  PersistedCbtSession,
} from './cbtStorage';

describe('cbtStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists and loads active CBT session', () => {
    const sessionData: Partial<PersistedCbtSession> = {
      sessionId: 'sess_123',
      userId: 'user_abc',
      examType: 'JAMB',
      testMode: 'full',
      selectedSubjects: ['use_of_english', 'mathematics'],
      activeSubjectKey: 'use_of_english',
      answersBySubject: {
        use_of_english: { '1': 'A', '2': 'C' },
      },
      durationMinutes: 120,
      endTime: Date.now() + 120 * 60 * 1000,
      startedAt: Date.now(),
      status: 'in_progress',
    };

    saveCbtSessionToStorage(sessionData);

    const loaded = loadCbtSessionFromStorage();
    expect(loaded).not.toBeNull();
    expect(loaded?.sessionId).toBe('sess_123');
    expect(loaded?.answersBySubject['use_of_english']['1']).toBe('A');
  });

  it('updates answer in storage incrementally without wiping other fields', () => {
    const sessionData: Partial<PersistedCbtSession> = {
      sessionId: 'sess_999',
      userId: 'user_test',
      status: 'in_progress',
      answersBySubject: {
        mathematics: { '10': 'B' },
      },
    };

    saveCbtSessionToStorage(sessionData);
    updateCbtAnswerInStorage('mathematics', '11', 'D');

    const loaded = loadCbtSessionFromStorage();
    expect(loaded?.answersBySubject['mathematics']['10']).toBe('B');
    expect(loaded?.answersBySubject['mathematics']['11']).toBe('D');
  });

  it('clears session from storage on clearCbtSessionFromStorage', () => {
    saveCbtSessionToStorage({
      sessionId: 'sess_clean',
      userId: 'user_clean',
      status: 'in_progress',
    });

    clearCbtSessionFromStorage();
    expect(loadCbtSessionFromStorage()).toBeNull();
  });
});
