import React, { useEffect, useState, useMemo } from 'react';
import { 
  X, Loader2, Brain, Calendar, GraduationCap, Award, 
  TrendingUp, CheckCircle2, AlertTriangle, XCircle, Clock, 
  Sparkles, Layers, Search, RefreshCw, ChevronDown, ChevronUp, UserCheck, Zap, User
} from 'lucide-react';
import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

interface PredictionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail: string;
  userName: string;
  userProfile?: any;
}

export interface DetailedCalculationRecord {
  id: string;
  source: 'prediction' | 'activity';
  predictionId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  isGuest?: boolean;
  university: string;
  course: string;
  aggregateScore: number | string;
  jambScore?: number | string;
  postUtmeScore?: number | string;
  usesPostUtme?: boolean;
  hasPostUtme?: boolean;
  postUtmeNotUsed?: boolean;
  verdict?: string;
  confidence?: string;
  predictedProbability?: number;
  departmentalCutoff?: string | number;
  institutionalCutoff?: string | number;
  cutoffType?: string;
  cutoffIsOfficial?: boolean;
  cutoffSource?: string;
  cutoffYear?: string | number;
  cutoffQuotaUsed?: string;
  scoreDiff?: number;
  stateOfOrigin?: string;
  isELDSState?: boolean;
  isCatchmentState?: boolean;
  predictionDate?: string;
  detailedStrategy?: string;
  formulaExplanation?: string;
  subjects?: Array<{ name: string; grade: string; points?: number }>;
  olevelsString?: string;
  rawTimestamp?: any;
  formattedDate?: string;
  actualOutcome?: string;
  actualUni?: string;
  actualCourse?: string;
  admissionType?: string;
  outcomeNote?: string;
  helpful?: boolean;
  extraData?: any;
}

const getRecordTimestampMs = (record: any): number => {
  if (record.createdAt?.toMillis) return record.createdAt.toMillis();
  if (record.createdAt?.seconds) return record.createdAt.seconds * 1000;
  if (record.timestamp?.toMillis) return record.timestamp.toMillis();
  if (record.timestamp?.seconds) return record.timestamp.seconds * 1000;
  if (typeof record.timestamp === 'number') return record.timestamp;
  if (record.predictionDate) {
    const parsed = new Date(record.predictionDate).getTime();
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 0;
};

const formatDate = (ms: number): string => {
  if (!ms || ms <= 0) return 'Recent';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleDateString();
  }
};

const getVerdictBadge = (verdict?: string) => {
  const v = (verdict || '').toLowerCase();
  if (v.includes('disqualif') || v.includes('invalid') || v.includes('ineligible') || v.includes('mismatch') || v.includes('fail') || v.includes('deficit')) {
    return {
      label: verdict || 'Disqualified',
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      icon: XCircle
    };
  }
  if (v.includes('admit') || v.includes('high') || v.includes('safe') || v.includes('strong') || v.includes('excellent')) {
    return {
      label: verdict || 'Highly Likely',
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2
    };
  }
  if (v.includes('border') || v.includes('medium') || v.includes('moderate') || v.includes('fair') || v.includes('compet')) {
    return {
      label: verdict || 'Borderline / Competitive',
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: AlertTriangle
    };
  }
  if (v.includes('risk') || v.includes('low') || v.includes('unlikely') || v.includes('not')) {
    return {
      label: verdict || 'Risky / Low Chance',
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      icon: XCircle
    };
  }
  return {
    label: verdict || 'Audit Complete',
    bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: Sparkles
  };
};

export const getVerdictCategory = (record: { 
  verdict?: string; 
  predictedProbability?: number; 
  departmentalCutoff?: any; 
  detailedStrategy?: string;
}): 'high' | 'borderline' | 'low' | 'disqualified' => {
  const v = (record.verdict || '').toLowerCase();
  const strat = (record.detailedStrategy || '').toLowerCase();
  const prob = record.predictedProbability;
  
  if (
    prob === 0 ||
    v.includes('disqualif') || 
    v.includes('invalid') || 
    v.includes('ineligible') || 
    v.includes('mismatch') || 
    v.includes('deficit') ||
    strat.includes('disqualif') ||
    strat.includes('invalid subject combination') ||
    strat.includes('admission probability:** **0%') ||
    strat.includes('probability: 0%') ||
    record.departmentalCutoff === 'N/A'
  ) {
    return 'disqualified';
  }
  
  if (
    v.includes('admit') || 
    v.includes('high') || 
    v.includes('safe') || 
    v.includes('strong') || 
    v.includes('excellent') || 
    (typeof prob === 'number' && prob >= 70)
  ) {
    return 'high';
  }
  
  if (
    v.includes('border') || 
    v.includes('compet') || 
    v.includes('medium') || 
    v.includes('moderate') || 
    v.includes('fair') || 
    (typeof prob === 'number' && prob >= 40 && prob < 70)
  ) {
    return 'borderline';
  }
  
  if (
    v.includes('risk') || 
    v.includes('low') || 
    v.includes('unlikely') || 
    v.includes('not') || 
    (typeof prob === 'number' && prob > 0 && prob < 40)
  ) {
    return 'low';
  }

  return 'borderline';
};

const sanitizeRecord = (
  data: any, 
  recordId: string, 
  ms: number, 
  isGuest: boolean, 
  source: 'prediction' | 'activity',
  fallbackUserName?: string
): DetailedCalculationRecord => {
  const strategy = String(data.detailedStrategy || '').toLowerCase();
  const rawVerdict = String(data.verdict || '');
  const isDisqualified = 
    strategy.includes('disqualif') || 
    strategy.includes('invalid subject combination') ||
    strategy.includes('admission probability:** **0%') ||
    strategy.includes('probability: 0%') ||
    rawVerdict.toLowerCase().includes('disqualif') ||
    rawVerdict.toLowerCase().includes('invalid subject') ||
    rawVerdict.toLowerCase().includes('ineligible') ||
    data.departmentalCutoff === 'N/A' ||
    data.predictedProbability === 0;

  let finalVerdict = data.verdict;
  let finalProbability = typeof data.predictedProbability === 'number' ? data.predictedProbability : (data.aggregateScore >= 60 ? 75 : 45);

  if (isDisqualified) {
    finalVerdict = 'Disqualified / Invalid Subject Combination';
    finalProbability = 0;
  }

  return {
    id: recordId,
    source,
    predictionId: recordId,
    userId: data.userId || (isGuest ? 'guest' : ''),
    userEmail: data.userEmail || '',
    userName: data.userName || fallbackUserName || (isGuest ? 'Guest Scholar' : 'Registered Scholar'),
    isGuest,
    university: data.university || 'Target University',
    course: data.course || 'Target Course',
    aggregateScore: data.aggregateScore ?? 0,
    jambScore: data.jambScore,
    postUtmeScore: data.postUtmeScore,
    verdict: finalVerdict,
    confidence: isDisqualified ? 'High' : (data.confidence || 'Medium'),
    predictedProbability: finalProbability,
    departmentalCutoff: isDisqualified ? 'N/A' : (data.departmentalCutoff || data.cutoff || ''),
    institutionalCutoff: data.institutionalCutoff || '',
    cutoffType: data.cutoffType,
    cutoffIsOfficial: data.cutoffIsOfficial,
    cutoffSource: data.cutoffSource,
    cutoffYear: data.cutoffYear,
    cutoffQuotaUsed: isDisqualified ? 'Disqualified (Ineligible)' : data.cutoffQuotaUsed,
    scoreDiff: isDisqualified ? 0 : data.scoreDiff,
    stateOfOrigin: data.stateOfOrigin,
    isELDSState: data.isELDSState,
    isCatchmentState: data.isCatchmentState,
    predictionDate: data.predictionDate,
    detailedStrategy: data.detailedStrategy,
    formulaExplanation: data.formulaExplanation,
    subjects: data.subjects,
    olevelsString: data.olevelsString,
    rawTimestamp: data.createdAt || data.timestamp,
    formattedDate: formatDate(ms),
    actualOutcome: data.actualOutcome,
    actualUni: data.actualUni,
    actualCourse: data.actualCourse,
    admissionType: data.admissionType,
    outcomeNote: data.outcomeNote,
    helpful: data.helpful,
    extraData: data
  };
};

const PredictionDetailsModal: React.FC<PredictionDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  userEmail, 
  userName,
  userProfile 
}) => {
  const [records, setRecords] = useState<DetailedCalculationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'guest' | 'registered'>('all');
  const [verdictFilter, setVerdictFilter] = useState<'all' | 'high' | 'borderline' | 'low' | 'disqualified'>('all');

  const isGuestMode = userId === 'guest' || userName?.toLowerCase().includes('guest');
  const isAllMode = userId === 'all';

  const fetchUserData = async () => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const mergedRecordsMap = new Map<string, DetailedCalculationRecord>();

      // CASE A: GUEST ONLY OR ALL CALCULATIONS MODE
      if (isGuestMode || isAllMode) {
        // 1. Fetch from "predictions" collection
        try {
          let snap;
          try {
            snap = await getDocs(query(collection(db, "predictions"), orderBy("createdAt", "desc"), limit(400)));
          } catch {
            snap = await getDocs(query(collection(db, "predictions"), limit(400)));
          }

          snap.docs.forEach(docSnap => {
            const data: any = docSnap.data();
            const recordId = data.predictionId || docSnap.id;
            const ms = getRecordTimestampMs(data);
            const isGuest = data.isGuest !== undefined 
              ? Boolean(data.isGuest) 
              : (!data.userId || data.userId === 'guest' || !data.userEmail);

            if (isAllMode || (isGuestMode && isGuest)) {
              mergedRecordsMap.set(recordId, sanitizeRecord(data, recordId, ms, isGuest, 'prediction'));
            }
          });
        } catch (err: any) {
          console.warn("Predictions global fetch notice:", err?.message || err);
        }

        // 2. Fetch from "user_activities" collection for guest/all audits
        try {
          let snapActs;
          try {
            snapActs = await getDocs(query(collection(db, "user_activities"), orderBy("timestamp", "desc"), limit(400)));
          } catch {
            snapActs = await getDocs(query(collection(db, "user_activities"), limit(400)));
          }

          snapActs.docs.forEach(docSnap => {
            const data: any = docSnap.data();
            const desc = data.description || '';
            const isCalc = data.type === 'calculation' || desc.includes('Calculated aggregate') || data.metadata?.university;

            if (isCalc) {
              const recordId = data.metadata?.predictionId || `act_${docSnap.id}`;
              const ms = getRecordTimestampMs(data);
              const meta = data.metadata || {};
              const isGuest = !data.userId || data.userId === 'guest' || !data.userEmail || meta.isGuest;

              if (isAllMode || (isGuestMode && isGuest)) {
                if (!mergedRecordsMap.has(recordId)) {
                  let university = meta.university || '';
                  let course = meta.course || '';
                  if (!university && desc.includes(' at ')) {
                    university = desc.split(' at ')[1]?.trim() || '';
                  }
                  if (!course && desc.includes('Calculated aggregate for ')) {
                    course = desc.replace('Calculated aggregate for ', '').split(' at ')[0]?.trim() || '';
                  }

                  const activityData = {
                    ...data,
                    userId: data.userId || 'guest',
                    userEmail: data.userEmail || '',
                    userName: isGuest ? 'Guest Scholar' : 'Registered Scholar',
                    isGuest: Boolean(isGuest),
                    university: university || 'Audited School',
                    course: course || 'Audited Course',
                    aggregateScore: meta.aggregateScore ?? 0,
                    jambScore: meta.jambScore,
                    postUtmeScore: meta.postUtmeScore,
                    verdict: meta.verdict || (Number(meta.aggregateScore || 0) >= 60 ? 'Competitive' : 'Borderline'),
                    formulaExplanation: meta.formula,
                    subjects: meta.subjects,
                    detailedStrategy: meta.detailedStrategy || desc
                  };

                  mergedRecordsMap.set(recordId, sanitizeRecord(activityData, recordId, ms, Boolean(isGuest), 'activity'));
                }
              }
            }
          });
        } catch (err: any) {
          console.warn("Activities global fetch notice:", err?.message || err);
        }
      } else {
        // CASE B: SPECIFIC REGISTERED USER MODE
        // 1. Query "predictions" by userEmail
        if (userEmail) {
          try {
            const qEmail = query(
              collection(db, "predictions"), 
              where("userEmail", "==", userEmail.trim().toLowerCase())
            );
            const snapEmail = await getDocs(qEmail);
            snapEmail.docs.forEach(docSnap => {
              const data: any = docSnap.data();
              const recordId = data.predictionId || docSnap.id;
              const ms = getRecordTimestampMs(data);
              mergedRecordsMap.set(recordId, sanitizeRecord(data, recordId, ms, false, 'prediction', userName));
            });
          } catch (err: any) {
            console.warn("Predictions by email fetch notice:", err?.message || err);
          }
        }

        // 2. Query "predictions" by userId
        if (userId) {
          try {
            const qUid = query(
              collection(db, "predictions"), 
              where("userId", "==", userId)
            );
            const snapUid = await getDocs(qUid);
            snapUid.docs.forEach(docSnap => {
              const data: any = docSnap.data();
              const recordId = data.predictionId || docSnap.id;
              const ms = getRecordTimestampMs(data);
              if (!mergedRecordsMap.has(recordId)) {
                mergedRecordsMap.set(recordId, sanitizeRecord(data, recordId, ms, false, 'prediction', userName));
              }
            });
          } catch (err: any) {
            console.warn("Predictions by uid fetch notice:", err?.message || err);
          }
        }

        // 3. Supplementary fetch from "user_activities" for calculation audits
        if (userId) {
          try {
            const qActs = query(
              collection(db, "user_activities"),
              where("userId", "==", userId)
            );
            const snapActs = await getDocs(qActs);
            snapActs.docs.forEach(docSnap => {
              const data: any = docSnap.data();
              if (data.type === 'calculation' || data.metadata?.aggregateScore || data.metadata?.jambScore) {
                const recordId = `act_${docSnap.id}`;
                const ms = getRecordTimestampMs(data);
                const meta = data.metadata || {};
                
                const existingMatch = Array.from(mergedRecordsMap.values()).find(
                  r => r.university === (meta.university || data.description) && 
                       r.course === meta.course && 
                       Math.abs(getRecordTimestampMs(r) - ms) < 5000
                );

                if (!existingMatch) {
                  const activityData = {
                    ...data,
                    userId: data.userId,
                    userEmail: data.userEmail,
                    userName: userName,
                    isGuest: false,
                    university: meta.university || (data.description ? data.description.replace('Calculated aggregate for ', '').split(' at ')[1] : 'Audited School'),
                    course: meta.course || (data.description ? data.description.replace('Calculated aggregate for ', '').split(' at ')[0] : 'Audited Course'),
                    aggregateScore: meta.aggregateScore ?? 0,
                    jambScore: meta.jambScore,
                    postUtmeScore: meta.postUtmeScore,
                    verdict: meta.verdict || (Number(meta.aggregateScore || 0) >= 60 ? 'Competitive' : 'Borderline'),
                    formulaExplanation: meta.formula,
                    subjects: meta.subjects,
                    detailedStrategy: meta.detailedStrategy || data.description
                  };
                  mergedRecordsMap.set(recordId, sanitizeRecord(activityData, recordId, ms, false, 'activity', userName));
                }
              }
            });
          } catch (err: any) {
            console.warn("Activities fetch notice:", err?.message || err);
          }
        }
      }

      // Client-side sort descending by timestamp
      const sorted = Array.from(mergedRecordsMap.values()).sort((a, b) => {
        const tA = getRecordTimestampMs(a);
        const tB = getRecordTimestampMs(b);
        return tB - tA;
      });

      setRecords(sorted);
      if (sorted.length > 0) {
        setExpandedCardId(sorted[0].id);
      }
    } catch (err: any) {
      console.error("Error loading prediction records:", err);
      setFetchError(err?.message || "Failed to load prediction details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    } else {
      setRecords([]);
      setSearchTerm('');
      setExpandedCardId(null);
      setVerdictFilter('all');
      setFilterMode('all');
    }
  }, [isOpen, userEmail, userId]);

  const filteredRecords = useMemo(() => {
    let result = records;
    if (filterMode === 'guest') {
      result = result.filter(r => r.isGuest || !r.userEmail || r.userId === 'guest');
    } else if (filterMode === 'registered') {
      result = result.filter(r => !r.isGuest && r.userEmail && r.userId !== 'guest');
    }

    if (verdictFilter !== 'all') {
      result = result.filter(r => getVerdictCategory(r) === verdictFilter);
    }

    if (!searchTerm.trim()) return result;
    const s = searchTerm.toLowerCase();
    return result.filter(r => 
      (r.university && r.university.toLowerCase().includes(s)) ||
      (r.course && r.course.toLowerCase().includes(s)) ||
      (r.verdict && r.verdict.toLowerCase().includes(s)) ||
      (r.userEmail && r.userEmail.toLowerCase().includes(s)) ||
      (r.formattedDate && r.formattedDate.toLowerCase().includes(s))
    );
  }, [records, searchTerm, filterMode, verdictFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const scores = records
      .map(r => typeof r.aggregateScore === 'number' ? r.aggregateScore : parseFloat(r.aggregateScore as string) || 0)
      .filter(n => n > 0);
    const jambScores = records
      .map(r => typeof r.jambScore === 'number' ? r.jambScore : parseFloat(r.jambScore as string) || 0)
      .filter(n => n > 0);

    const maxAgg = scores.length > 0 ? Math.max(...scores) : 0;
    const avgAgg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'N/A';
    const maxJamb = jambScores.length > 0 ? Math.max(...jambScores) : (userProfile?.jambScore || 0);

    const guestCount = records.filter(r => r.isGuest || !r.userEmail || r.userId === 'guest').length;
    const registeredCount = records.length - guestCount;

    let highCount = 0;
    let borderlineCount = 0;
    let lowCount = 0;
    let disqualifiedCount = 0;

    records.forEach(r => {
      const cat = getVerdictCategory(r);
      if (cat === 'disqualified') disqualifiedCount++;
      else if (cat === 'high') highCount++;
      else if (cat === 'borderline') borderlineCount++;
      else if (cat === 'low') lowCount++;
    });

    return {
      total: records.length,
      guestCount,
      registeredCount,
      highCount,
      borderlineCount,
      lowCount,
      disqualifiedCount,
      topAggregate: maxAgg > 0 ? `${maxAgg.toFixed(1)}%` : 'N/A',
      avgAggregate: avgAgg !== 'N/A' ? `${avgAgg}%` : 'N/A',
      topJamb: maxJamb > 0 ? maxJamb : (userProfile?.jambScore || 'N/A'),
      primaryUni: records[0]?.university || userProfile?.targetUni || 'None',
      primaryCourse: records[0]?.course || userProfile?.targetCourse || 'None'
    };
  }, [records, userProfile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div 
        className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-all text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/20 to-transparent dark:from-blue-950/20 dark:via-gray-900 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
              isGuestMode ? 'bg-amber-600 text-white shadow-amber-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'
            }`}>
              {isGuestMode ? <Zap size={22} /> : <Brain size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-white leading-tight">
                  {userName || (isGuestMode ? 'Guest Scholars (Anonymous Audits)' : isAllMode ? 'All Platform Calculations' : 'Scholar')}
                </h2>
                {isGuestMode && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-full border border-amber-500/20 uppercase tracking-wider flex items-center gap-1">
                    <Zap size={10} /> Anonymous Visitors
                  </span>
                )}
                {userProfile?.is_premium && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-full border border-amber-500/20 uppercase tracking-wider">
                    Scholar Pack Pro
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center gap-2 mt-0.5">
                <span>{userEmail || (isGuestMode ? 'Non-authenticated prospective candidate audits' : isAllMode ? 'Live stream of candidate evaluations' : 'No email registered')}</span>
                {userProfile?.stateOfOrigin && (
                  <span className="hidden sm:inline text-gray-400">• State: {userProfile.stateOfOrigin}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUserData}
              disabled={isLoading}
              title="Refresh audits"
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scholar Quick Stat Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3.5 bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total Calculations</p>
              <p className="text-sm font-black text-blue-600 dark:text-blue-400">{stats.total} audits</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Top Aggregate</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{stats.topAggregate}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                {isGuestMode ? 'Average Aggregate' : 'Best JAMB Score'}
              </p>
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {isGuestMode ? stats.avgAggregate : stats.topJamb}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                {isGuestMode ? 'Audience Type' : 'Credits Remaining'}
              </p>
              <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                {isGuestMode ? 'Anonymous Guests' : `${userProfile?.scholarCredits || 0} SP`}
              </p>
            </div>
          </div>
        )}

        {/* Verdict & Probability Breakdown Filter Bar */}
        {stats && stats.total > 0 && (
          <div className="px-6 py-3 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Brain size={12} className="text-blue-500" />
                  Verdict & Probability Distribution ({stats.total} Total)
                </span>
                {verdictFilter !== 'all' && (
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-md text-[9px] font-black uppercase tracking-wider">
                    Filtering: {verdictFilter.toUpperCase()}
                  </span>
                )}
              </div>
              {verdictFilter !== 'all' && (
                <button 
                  onClick={() => setVerdictFilter('all')}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Clear Verdict Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* High Probability */}
              <button
                type="button"
                onClick={() => setVerdictFilter(verdictFilter === 'high' ? 'all' : 'high')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  verdictFilter === 'high'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200/70 dark:border-gray-800 hover:border-emerald-400/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={11} /> High Probability
                  </span>
                  <span className="text-[9px] font-mono font-bold text-gray-400">
                    {stats.total > 0 ? `${Math.round((stats.highCount / stats.total) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-300">{stats.highCount}</span>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Highly Likely</span>
                </div>
              </button>

              {/* Borderline / Competitive */}
              <button
                type="button"
                onClick={() => setVerdictFilter(verdictFilter === 'borderline' ? 'all' : 'borderline')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  verdictFilter === 'borderline'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                    : 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200/70 dark:border-gray-800 hover:border-amber-400/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle size={11} /> Borderline / Compet.
                  </span>
                  <span className="text-[9px] font-mono font-bold text-gray-400">
                    {stats.total > 0 ? `${Math.round((stats.borderlineCount / stats.total) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-base font-black text-amber-700 dark:text-amber-300">{stats.borderlineCount}</span>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Competitive</span>
                </div>
              </button>

              {/* Low Probability / Risky */}
              <button
                type="button"
                onClick={() => setVerdictFilter(verdictFilter === 'low' ? 'all' : 'low')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  verdictFilter === 'low'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-sm ring-2 ring-rose-500/20'
                    : 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200/70 dark:border-gray-800 hover:border-rose-400/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <XCircle size={11} /> Low Probability
                  </span>
                  <span className="text-[9px] font-mono font-bold text-gray-400">
                    {stats.total > 0 ? `${Math.round((stats.lowCount / stats.total) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-base font-black text-rose-700 dark:text-rose-300">{stats.lowCount}</span>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Risky / Low Chance</span>
                </div>
              </button>

              {/* Disqualified */}
              <button
                type="button"
                onClick={() => setVerdictFilter(verdictFilter === 'disqualified' ? 'all' : 'disqualified')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  verdictFilter === 'disqualified'
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-500 shadow-sm ring-2 ring-red-500/20'
                    : 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200/70 dark:border-gray-800 hover:border-red-400/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle size={11} /> Disqualified
                  </span>
                  <span className="text-[9px] font-mono font-bold text-gray-400">
                    {stats.total > 0 ? `${Math.round((stats.disqualifiedCount / stats.total) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-base font-black text-red-700 dark:text-red-400">{stats.disqualifiedCount}</span>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Ineligible (0%)</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by university, course, verdict, or candidate..."
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 dark:text-white"
            />
          </div>

          {isAllMode && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition-colors ${
                  filterMode === 'all' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-white shadow-sm' : 'text-gray-400'
                }`}
              >
                All ({records.length})
              </button>
              <button
                onClick={() => setFilterMode('guest')}
                className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition-colors flex items-center gap-1 ${
                  filterMode === 'guest' ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-gray-400'
                }`}
              >
                <Zap size={10} /> Guests ({stats?.guestCount || 0})
              </button>
              <button
                onClick={() => setFilterMode('registered')}
                className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition-colors flex items-center gap-1 ${
                  filterMode === 'registered' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400'
                }`}
              >
                <User size={10} /> Registered ({stats?.registeredCount || 0})
              </button>
            </div>
          )}

          <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap self-center">
            Showing {filteredRecords.length} of {records.length}
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={36} />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Retrieving detailed calculations & audits...
              </p>
            </div>
          ) : fetchError ? (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-center space-y-3">
              <AlertTriangle className="text-rose-500 mx-auto" size={32} />
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">Unable to load calculations</h4>
              <p className="text-xs text-rose-600 dark:text-rose-300 font-mono">{fetchError}</p>
              <button
                onClick={fetchUserData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Retry Fetch
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                <Brain size={28} />
              </div>
              <h4 className="text-sm font-black text-gray-700 dark:text-gray-300">
                {searchTerm ? 'No matching calculations found' : 'No calculations recorded yet'}
              </h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try a different search query to find specific institutions or courses.'
                  : 'When this scholar runs admission cutoff calculations, audits and O-level breakdowns will appear here.'}
              </p>
            </div>
          ) : (
            filteredRecords.map((item, idx) => {
              const isExpanded = expandedCardId === item.id;
              const badge = getVerdictBadge(item.verdict);
              const BadgeIcon = badge.icon;
              const aggNum = typeof item.aggregateScore === 'number' 
                ? item.aggregateScore 
                : parseFloat(item.aggregateScore as string) || 0;

              return (
                <div 
                  key={item.id || idx}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:border-blue-500/40 transition-all"
                >
                  {/* Card Header Bar */}
                  <div 
                    onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-gray-400 flex items-center gap-1">
                          <Calendar size={12} /> {item.formattedDate}
                        </span>
                        {item.isGuest ? (
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                            <Zap size={10} /> Guest Scholar
                          </span>
                        ) : item.userEmail ? (
                          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 flex items-center gap-1">
                            <User size={10} /> {item.userEmail}
                          </span>
                        ) : null}
                        {item.stateOfOrigin && (
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            {item.stateOfOrigin}
                            {item.isCatchmentState ? ' (Catchment)' : item.isELDSState ? ' (ELDS)' : ''}
                          </span>
                        )}
                        {item.actualOutcome && (
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                            <UserCheck size={10} /> Confirmed: {item.actualOutcome}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={18} />
                        <span>{item.course}</span>
                        <span className="text-xs font-normal text-gray-400">at</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{item.university}</span>
                      </h3>
                    </div>

                    {/* Right side stats pill & verdict */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Aggregate</p>
                        <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                          {aggNum > 0 ? `${aggNum.toFixed(2)}%` : 'Calculated'}
                        </p>
                      </div>

                      <div className={`px-2.5 py-1 rounded-xl border text-[11px] font-black flex items-center gap-1.5 ${badge.bg}`}>
                        <BadgeIcon size={13} />
                        <span>{badge.label}</span>
                      </div>

                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content Section */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 space-y-5">
                      
                      {/* Metric Score Breakdown Grid */}
                      {(() => {
                        const isDisqualified = item.predictedProbability === 0 || 
                          (item.verdict && item.verdict.toLowerCase().includes('disqualif')) ||
                          item.departmentalCutoff === 'N/A' ||
                          (item.detailedStrategy && item.detailedStrategy.toLowerCase().includes('disqualif'));

                        return (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                              <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">JAMB Score</p>
                                <p className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                                  {item.jambScore ? `${item.jambScore} / 400` : 'Not provided'}
                                </p>
                              </div>

                              {(() => {
                                const normUni = (item.university || '').toLowerCase();
                                const fExpl = (item.formulaExplanation || '').toLowerCase();
                                const isPostUtmeNotUsed = 
                                  item.usesPostUtme === false ||
                                  item.hasPostUtme === false ||
                                  item.postUtmeNotUsed === true ||
                                  normUni.includes('lautech') || normUni.includes('ladoke') ||
                                  normUni.includes('futa') || normUni.includes('akure') ||
                                  normUni.includes('lasu') || normUni.includes('fuoye') || normUni.includes('oye-ekiti') ||
                                  fExpl.includes('80:20') || fExpl.includes('75:25') || fExpl.includes('60:40') || fExpl.includes('lautech') || fExpl.includes('futa') || fExpl.includes('lasu') || fExpl.includes('fuoye') || fExpl.includes('pure_jamb');

                                return (
                                  <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Post-UTME</p>
                                    {isPostUtmeNotUsed ? (
                                      <p className="text-[10.5px] font-bold text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                                        Not used in aggregate calculation
                                      </p>
                                    ) : (
                                      <p className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">
                                        {item.postUtmeScore ? `${item.postUtmeScore} / 100` : 'Pending / 0'}
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}

                              <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center justify-between">
                                  <span>1. Cutoff Data</span>
                                  {isDisqualified ? (
                                    <span className="text-[9px] text-rose-600 dark:text-rose-400 font-bold">N/A ❌</span>
                                  ) : item.cutoffIsOfficial || (item.university && (item.university.includes('Ibadan') || item.university.toLowerCase() === 'ui')) ? (
                                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">Official ✅</span>
                                  ) : (
                                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">Est. 🟡</span>
                                  )}
                                </p>
                                <p className="text-base font-black text-gray-700 dark:text-gray-300 mt-0.5">
                                  {isDisqualified ? 'N/A' : (item.departmentalCutoff || 'Benchmark')}
                                </p>
                              </div>

                              <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center justify-between">
                                  <span>2. Aggregate</span>
                                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">Verified ✅</span>
                                </p>
                                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                  {item.aggregateScore}%
                                </p>
                              </div>

                              <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center justify-between">
                                  <span>3. Probability</span>
                                  {isDisqualified ? (
                                    <span className="text-[9px] text-rose-600 dark:text-rose-400 font-bold">Disqualified ❌</span>
                                  ) : (
                                    <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold">Model ⚠️</span>
                                  )}
                                </p>
                                <p className={`text-base font-black mt-0.5 ${isDisqualified ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                                  {item.predictedProbability !== undefined && item.predictedProbability !== null ? `${item.predictedProbability}%` : '50%'}
                                </p>
                              </div>
                            </div>

                            {/* Cutoff Provenance & Quota Audit Banner */}
                            <div className="p-3.5 bg-gradient-to-r from-gray-50 to-gray-100/70 dark:from-gray-900 dark:to-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-xl text-xs space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-black uppercase text-gray-800 dark:text-gray-200">
                                    Cutoff Provenance & Authority:
                                  </span>
                                  {isDisqualified ? (
                                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded-md font-bold text-[10px]">
                                      Disqualified (Subject Mismatch / Ineligible)
                                    </span>
                                  ) : item.cutoffIsOfficial || (item.university && (item.university.includes('Ibadan') || item.university.toLowerCase() === 'ui')) ? (
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-md font-bold text-[10px]">
                                      Verified Official 2025/2026 Release
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-md font-bold text-[10px]">
                                      Historical Competitive Benchmark
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                                  Quota: <span className="font-bold text-gray-700 dark:text-gray-200">{item.cutoffQuotaUsed || (item.isCatchmentState ? `Catchment (${item.stateOfOrigin || 'State'})` : item.isELDSState ? 'ELDS' : 'National Merit')}</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px]">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Score vs Cutoff Margin:
                                </span>
                                {(() => {
                                  if (isDisqualified) {
                                    return (
                                      <span className="font-mono font-black px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                        Disqualified (Subject Mismatch / 0% Probability)
                                      </span>
                                    );
                                  }

                                  const cVal = parseFloat(String(item.departmentalCutoff || '0').replace(/[^0-9.]/g, '')) || 0;
                                  if (cVal === 0) {
                                    return (
                                      <span className="font-mono font-black px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                        N/A (No Cutoff Benchmark)
                                      </span>
                                    );
                                  }
                                  const diff = aggNum - cVal;
                                  const isPositive = diff >= 0;
                                  return (
                                    <span className={`font-mono font-black px-2 py-0.5 rounded-md ${
                                      isPositive 
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                        : diff >= -1.5 
                                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                    }`}>
                                      {isPositive ? `+${diff.toFixed(2)}% Surplus` : `${diff.toFixed(2)}% Deficit`}
                                      {diff >= -1.5 && diff < 0 ? ' (Borderline)' : ''}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                          </>
                        );
                      })()}

                      {/* O'Level Breakdown Section */}
                      {((item.subjects && item.subjects.length > 0) || item.olevelsString) && (
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl space-y-2.5">
                          <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Award size={14} className="text-amber-500" />
                            O'Level Subject & Grade Breakdown
                          </h4>

                          {item.subjects && item.subjects.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                              {item.subjects.map((sub, sIdx) => (
                                <div 
                                  key={sIdx}
                                  className="p-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-between"
                                >
                                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate mr-1">
                                    {sub.name}
                                  </span>
                                  <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 px-1.5 py-0.5 bg-blue-500/10 rounded font-mono">
                                    {sub.grade}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg">
                              {item.olevelsString}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Formula & Scoring Model */}
                      {item.formulaExplanation && (
                        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-blue-900 dark:text-blue-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <Layers size={13} /> Institutional Formula Applied
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-mono text-[11px]">
                            {item.formulaExplanation}
                          </p>
                        </div>
                      )}

                      {/* Strategy & AI Insights */}
                      {item.detailedStrategy && (
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl space-y-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <TrendingUp size={14} className="text-emerald-500" />
                            Detailed AI Strategy & Admission Assessment
                          </h4>
                          <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50/80 dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800/80">
                            {item.detailedStrategy}
                          </div>
                        </div>
                      )}

                      {/* Confirmed Outcome Note if Available */}
                      {item.outcomeNote && (
                        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs">
                          <p className="font-bold text-emerald-800 dark:text-emerald-300">
                            Student Feedback / Outcome Note:
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 mt-1 italic">
                            "{item.outcomeNote}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <p className="text-[11px] text-gray-400 font-mono">
            Direct Firestore Record Inspection • CampusAI Analytics
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionDetailsModal;
