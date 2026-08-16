import React, { useEffect, useState, useMemo } from 'react';
import { 
  X, Loader2, Brain, Calendar, GraduationCap, Award, 
  TrendingUp, CheckCircle2, AlertTriangle, XCircle, Clock, 
  Sparkles, Layers, Search, RefreshCw, ChevronDown, ChevronUp, UserCheck
} from 'lucide-react';
import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
  university: string;
  course: string;
  aggregateScore: number | string;
  jambScore?: number | string;
  postUtmeScore?: number | string;
  verdict?: string;
  confidence?: string;
  predictedProbability?: number;
  departmentalCutoff?: string | number;
  institutionalCutoff?: string | number;
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
  if (v.includes('admit') || v.includes('high') || v.includes('safe') || v.includes('strong')) {
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

  const fetchUserData = async () => {
    if (!db || (!userEmail && !userId)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const mergedRecordsMap = new Map<string, DetailedCalculationRecord>();

      // 1. Query "predictions" by userEmail (without composite index orderBy)
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
            mergedRecordsMap.set(recordId, {
              id: recordId,
              source: 'prediction',
              predictionId: recordId,
              userId: data.userId,
              userEmail: data.userEmail,
              university: data.university || 'Target University',
              course: data.course || 'Target Course',
              aggregateScore: data.aggregateScore ?? 0,
              jambScore: data.jambScore,
              postUtmeScore: data.postUtmeScore,
              verdict: data.verdict,
              confidence: data.confidence,
              predictedProbability: data.predictedProbability,
              departmentalCutoff: data.departmentalCutoff,
              institutionalCutoff: data.institutionalCutoff,
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
            });
          });
        } catch (err: any) {
          console.warn("Predictions by email fetch notice:", err?.message || err);
        }
      }

      // 2. Query "predictions" by userId (if available)
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
              mergedRecordsMap.set(recordId, {
                id: recordId,
                source: 'prediction',
                predictionId: recordId,
                userId: data.userId,
                userEmail: data.userEmail,
                university: data.university || 'Target University',
                course: data.course || 'Target Course',
                aggregateScore: data.aggregateScore ?? 0,
                jambScore: data.jambScore,
                postUtmeScore: data.postUtmeScore,
                verdict: data.verdict,
                confidence: data.confidence,
                predictedProbability: data.predictedProbability,
                departmentalCutoff: data.departmentalCutoff,
                institutionalCutoff: data.institutionalCutoff,
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
              });
            }
          });
        } catch (err: any) {
          console.warn("Predictions by UID fetch notice:", err?.message || err);
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
              
              // Only insert if not already captured from predictions collection
              const existingMatch = Array.from(mergedRecordsMap.values()).find(
                r => r.university === (meta.university || data.description) && 
                     r.course === meta.course && 
                     Math.abs(getRecordTimestampMs(r) - ms) < 5000
              );

              if (!existingMatch) {
                mergedRecordsMap.set(recordId, {
                  id: recordId,
                  source: 'activity',
                  userId: data.userId,
                  university: meta.university || (data.description ? data.description.replace('Calculated aggregate for ', '').split(' at ')[1] : 'Audited School'),
                  course: meta.course || (data.description ? data.description.replace('Calculated aggregate for ', '').split(' at ')[0] : 'Audited Course'),
                  aggregateScore: meta.aggregateScore ?? 0,
                  jambScore: meta.jambScore,
                  postUtmeScore: meta.postUtmeScore,
                  verdict: meta.verdict || 'Audited',
                  formulaExplanation: meta.formula,
                  subjects: meta.subjects,
                  rawTimestamp: data.timestamp,
                  formattedDate: formatDate(ms),
                  extraData: data
                });
              }
            }
          });
        } catch (err: any) {
          console.warn("Activities fetch notice:", err?.message || err);
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
    }
  }, [isOpen, userEmail, userId]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const s = searchTerm.toLowerCase();
    return records.filter(r => 
      (r.university && r.university.toLowerCase().includes(s)) ||
      (r.course && r.course.toLowerCase().includes(s)) ||
      (r.verdict && r.verdict.toLowerCase().includes(s)) ||
      (r.formattedDate && r.formattedDate.toLowerCase().includes(s))
    );
  }, [records, searchTerm]);

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
    const maxJamb = jambScores.length > 0 ? Math.max(...jambScores) : (userProfile?.jambScore || 0);

    return {
      total: records.length,
      topAggregate: maxAgg > 0 ? `${maxAgg.toFixed(1)}%` : 'N/A',
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
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <Brain size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-white leading-tight">
                  {userName || 'Scholar'}
                </h2>
                {userProfile?.is_premium && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-full border border-amber-500/20 uppercase tracking-wider">
                    Scholar Pack Pro
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center gap-2 mt-0.5">
                <span>{userEmail || 'No email registered'}</span>
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
            <div className="p-2 rounded-xl bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total Audits</p>
              <p className="text-sm font-black text-blue-600 dark:text-blue-400">{stats.total} calculations</p>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Top Aggregate</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{stats.topAggregate}</p>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Best JAMB Score</p>
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{stats.topJamb}</p>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Credits Remaining</p>
              <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                {userProfile?.scholarCredits || 0} SP
              </p>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by university, course or verdict..."
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 dark:text-white"
            />
          </div>
          <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap">
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">JAMB Score</p>
                          <p className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {item.jambScore ? `${item.jambScore} / 400` : 'Not provided'}
                          </p>
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Post-UTME</p>
                          <p className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">
                            {item.postUtmeScore ? `${item.postUtmeScore}` : 'Pending / 0'}
                          </p>
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dept Cutoff</p>
                          <p className="text-base font-black text-gray-700 dark:text-gray-300 mt-0.5">
                            {item.departmentalCutoff || 'Official Cutoff'}
                          </p>
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Probability</p>
                          <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {item.predictedProbability ? `${item.predictedProbability}%` : 'High'}
                          </p>
                        </div>
                      </div>

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
