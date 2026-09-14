import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Loader2, 
  Info,
  Check,
  X
} from 'lucide-react';
import { 
  fetchIbassInstitutions, 
  fetchIbassProgrammes, 
  parseUtmeRequirements, 
  evaluateEligibility, 
  IbassInstitution, 
  IbassProgramme,
  EvaluationResult,
  ParsedRequirements
} from '../services/jambIbassService';
import { getLocalProfile, updateUserProfile } from '../services/userService';

const UTME_SUBJECTS_LIST = [
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Agricultural Science',
  'Economics',
  'Geography',
  'Government',
  'Literature in English',
  'CRS',
  'IRS',
  'Commerce',
  'Accounting',
  'History',
  'French',
  'Hausa',
  'Igbo',
  'Yoruba',
  'Computer Studies',
  'Further Mathematics'
];

const OLEVEL_SUBJECTS_LIST = [
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Agricultural Science',
  'Economics',
  'Geography',
  'Government',
  'Literature in English',
  'CRS',
  'Civic Education',
  'Commerce',
  'Financial Accounting',
  'Computer Studies',
  'Further Mathematics'
];

const GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

export const EligibilityCheck: React.FC = () => {
  // Candidate Profile State
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [selectedInst, setSelectedInst] = useState<IbassInstitution | null>(null);
  const [institutionsList, setInstitutionsList] = useState<IbassInstitution[]>([]);
  const [isInstLoading, setIsInstLoading] = useState(false);

  const [programmesList, setProgrammesList] = useState<IbassProgramme[]>([]);
  const [selectedProg, setSelectedProg] = useState<IbassProgramme | null>(null);
  const [isProgLoading, setIsProgLoading] = useState(false);

  const [jambScore, setJambScore] = useState<string>('240');
  const [utmeSubjects, setUtmeSubjects] = useState<string[]>(['English Language', 'Mathematics', 'Physics', 'Chemistry']);
  const [olevelResults, setOlevelResults] = useState<Array<{ subject: string; grade: string }>>([
    { subject: 'English Language', grade: 'B3' },
    { subject: 'Mathematics', grade: 'C4' },
    { subject: 'Physics', grade: 'C5' },
    { subject: 'Chemistry', grade: 'C6' },
    { subject: 'Biology', grade: 'B2' }
  ]);

  const [evaluationState, setEvaluationState] = useState<{
    status: 'idle' | 'eligible' | 'not_eligible' | 'incomplete';
    result?: EvaluationResult;
    rules?: ParsedRequirements;
    errorMsg?: string;
  }>({ status: 'idle' });

  // Pre-fill from UserProfile if available
  useEffect(() => {
    const profile = getLocalProfile();
    const pSubjects = profile.utmeSubjects || profile.academicProfile?.utmeSubjects;
    if (pSubjects && pSubjects.length > 0) {
      setUtmeSubjects(pSubjects.slice(0, 4));
    }
    const score = profile.jambScore || profile.academicProfile?.jambScore || profile.targetScore || profile.targetUTMEScore || profile.academicProfile?.targetUTMEScore;
    if (score) {
      setJambScore(String(score));
    }
    
    // Support all O-Level formats from profile
    if (profile.oLevelGrades || profile.olevelGrades || profile.academicProfile?.olevelGrades) {
      let mapped: any[] = [];
      if (profile.oLevelGrades && !Array.isArray(profile.oLevelGrades)) {
        mapped = Object.entries(profile.oLevelGrades).map(([subject, grade]) => ({ subject, grade }));
      } else if (Array.isArray(profile.olevelGrades)) {
        mapped = profile.olevelGrades;
      } else if (Array.isArray(profile.academicProfile?.olevelGrades)) {
        mapped = profile.academicProfile.olevelGrades;
      }
      
      if (mapped.length > 0) {
        setOlevelResults(mapped);
      }
    }

    const targetUni = profile.university || profile.academicProfile?.targetInstitution;
    if (targetUni) {
      setInstitutionSearch(targetUni);
    }
  }, []);

  // Fetch institutions on search
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsInstLoading(true);
      const res = await fetchIbassInstitutions({ search: institutionSearch });
      setInstitutionsList(res.items.slice(0, 15));
      setIsInstLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [institutionSearch]);

  // Fetch programmes when institution selected
  useEffect(() => {
    if (!selectedInst) {
      setProgrammesList([]);
      return;
    }
    const loadProgs = async () => {
      setIsProgLoading(true);
      const res = await fetchIbassProgrammes(selectedInst.id || 1);
      setProgrammesList(res.items);
      setIsProgLoading(false);
    };
    loadProgs();
  }, [selectedInst]);

  // Handle evaluation with robust edge-case validation
  const handleEvaluate = () => {
    const jScore = parseFloat(jambScore);
    if (isNaN(jScore) || jScore < 0 || jScore > 400) {
      setEvaluationState({ status: 'incomplete', errorMsg: 'Invalid JAMB UTME score. Must be a valid number between 0 and 400.' });
      return;
    }

    if (!selectedInst || !selectedProg) {
      setEvaluationState({ status: 'incomplete', errorMsg: 'Please select both an institution and a course programme to evaluate.' });
      return;
    }

    if (utmeSubjects.length < 4 || utmeSubjects.some(s => !s)) {
      setEvaluationState({ status: 'incomplete', errorMsg: 'Please select all 4 required UTME subjects (English + 3 elective subjects).' });
      return;
    }

    // Check for duplicate UTME subjects
    const uniqueUtme = new Set(utmeSubjects.map(s => s.toLowerCase()));
    if (uniqueUtme.size < utmeSubjects.length) {
      setEvaluationState({ status: 'incomplete', errorMsg: 'Duplicate UTME subjects detected. Each of the 4 UTME subjects must be unique.' });
      return;
    }

    // Validate O'Level subjects and grades
    if (olevelResults.length === 0) {
      setEvaluationState({ status: 'incomplete', errorMsg: 'Please add at least one O\'Level sitting grade record.' });
      return;
    }

    for (const o of olevelResults) {
      if (!o.subject || !o.grade) {
        setEvaluationState({ status: 'incomplete', errorMsg: 'Missing O\'Level subject or grade selection. Please complete all fields.' });
        return;
      }
      if (!GRADES.includes(o.grade)) {
        setEvaluationState({ status: 'incomplete', errorMsg: `Invalid grade "${o.grade}" selected. Must be WAEC/NECO grade A1–F9.` });
        return;
      }
    }

    // Check for duplicate O'Level subjects
    const olevelSubjSet = new Set();
    for (const o of olevelResults) {
      const norm = o.subject.toLowerCase();
      if (olevelSubjSet.has(norm)) {
        setEvaluationState({ status: 'incomplete', errorMsg: `Repeated O'Level subject "${o.subject}". Please combine or remove duplicates.` });
        return;
      }
      olevelSubjSet.add(norm);
    }

    const credits = olevelResults
      .filter(o => ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(o.grade))
      .map(o => o.subject);

    if (credits.length === 0) {
      setEvaluationState({ status: 'incomplete', errorMsg: 'No passing O\'Level credits (C6 or better) found in your sitting record.' });
      return;
    }

    // Parse official IBASS requirements from programme
    const rawUtmeReq = selectedProg.utme_subjects || '';
    const rawOlevelReq = selectedProg.olevel_requirements || '';

    if (!rawUtmeReq && !rawOlevelReq) {
      setEvaluationState({
        status: 'incomplete',
        errorMsg: 'Requirement data could not be verified. Official IBASS criteria for this specific programme are currently unavailable in the live repository.'
      });
      return;
    }

    const rules = parseUtmeRequirements(rawUtmeReq, rawOlevelReq);
    const evaluation = evaluateEligibility({
      utmeSubjects,
      olevelCredits: credits
    }, rules);

    let status: 'eligible' | 'not_eligible' | 'incomplete' = 'not_eligible';
    if (evaluation.isEligible && jScore >= 160) {
      status = 'eligible';
    } else {
      status = 'not_eligible';
    }

    setEvaluationState({
      status,
      result: evaluation,
      rules
    });

    // Persist eligibility evaluation for Command Center & UserProfile
    try {
      const eligibilitySummary = {
        status,
        institution: selectedInst.name,
        programme: selectedProg.course_name,
        jambScore: jScore,
        utmeMatch: evaluation.checks?.utmeValid ?? evaluation.isEligible,
        olevelMatch: evaluation.checks?.olevelValid ?? evaluation.isEligible,
        timestamp: Date.now()
      };
      localStorage.setItem('campusai_eligibility_last_result', JSON.stringify(eligibilitySummary));
      
      updateUserProfile({
        academicProfile: {
          ...getLocalProfile().academicProfile,
          targetInstitution: selectedInst.name,
          targetCourse: selectedProg.course_name,
          jambScore: jScore,
          utmeSubjects,
          olevelGrades: olevelResults
        },
        admissionStatus: {
          ...getLocalProfile().admissionStatus,
          targetSchool: selectedInst.name,
          targetCourse: selectedProg.course_name,
          lastEligibilityVerdict: status === 'eligible' ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
          lastVerifiedAt: Date.now()
        }
      });
    } catch (e) {
      console.warn('Failed to persist eligibility telemetry:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-white/10 shadow-xl text-white space-y-2">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="text-cyan-400" size={24} />
          <h2 className="text-xl font-black uppercase tracking-wider">Unified Admission Eligibility & O'Level Checker</h2>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Evaluate your O'Level credits, UTME subject combination, and JAMB score against official JAMB IBASS guidelines and institutional cutoffs in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Profile Inputs */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <BookOpen size={15} /> 1. Candidate Profile & Target
          </h3>

          {/* Institution Selection */}
          <div className="space-y-1.5 relative">
            <label htmlFor="eligibility-inst-search" className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Target Institution</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                id="eligibility-inst-search"
                name="eligibility-inst-search"
                type="text"
                placeholder="Search university (e.g. UNILAG, UI, OAU)..."
                value={institutionSearch}
                onChange={e => {
                  setInstitutionSearch(e.target.value);
                  setSelectedInst(null);
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-cyan-500"
              />
            </div>
            {institutionsList.length > 0 && !selectedInst && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-950 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-40 shadow-2xl">
                {institutionsList.map((inst: any) => (
                  <button
                    key={inst.id || inst.institution_name}
                    type="button"
                    onClick={() => {
                      setSelectedInst(inst);
                      setInstitutionSearch(inst.name || inst.institution_name || '');
                      setInstitutionsList([]);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-cyan-500/10 text-xs font-bold text-gray-200 border-b border-white/5 last:border-0"
                  >
                    {inst.name || inst.institution_name}
                  </button>
                ))}
              </div>
            )}
            {selectedInst && (
              <p className="text-[10px] text-emerald-400 font-bold mt-1">
                ✓ Selected: {selectedInst.name || selectedInst.institution_name}
              </p>
            )}
          </div>

          {/* Programme Selection */}
          <div className="space-y-1.5">
            <label htmlFor="eligibility-prog-select" className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Course / Programme</label>
            <select
              id="eligibility-prog-select"
              name="eligibility-prog-select"
              aria-label="Course / Programme"
              disabled={!selectedInst || isProgLoading}
              value={selectedProg ? selectedProg.id : ''}
              onChange={e => {
                const found = programmesList.find(p => p.id.toString() === e.target.value);
                setSelectedProg(found || null);
              }}
              className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              <option value="">{isProgLoading ? 'Loading programmes...' : selectedInst ? '-- Select Course --' : 'Select institution first'}</option>
              {programmesList.map(prog => (
                <option key={prog.id} value={prog.id} className="bg-gray-950 text-white">
                  {prog.course_name} ({prog.course_code || 'Degree'})
                </option>
              ))}
            </select>
          </div>

          {/* JAMB Score */}
          <div className="space-y-1.5">
            <label htmlFor="eligibility-jamb-score" className="text-[9px] font-black uppercase text-gray-400 tracking-wider">JAMB UTME Score (0 - 400)</label>
            <input
              id="eligibility-jamb-score"
              name="eligibility-jamb-score"
              type="number"
              min="0"
              max="400"
              value={jambScore}
              onChange={e => setJambScore(e.target.value)}
              className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs font-black text-cyan-300 outline-none focus:border-cyan-500"
            />
          </div>

          {/* 4 UTME Subjects */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">4 UTME Subjects (Must include English)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {utmeSubjects.map((subj, idx) => (
                <select
                  key={idx}
                  id={`eligibility-utme-subj-${idx}`}
                  name={`eligibility-utme-subj-${idx}`}
                  aria-label={`UTME Subject ${idx + 1}`}
                  value={subj}
                  onChange={e => {
                    const next = [...utmeSubjects];
                    next[idx] = e.target.value;
                    setUtmeSubjects(next);
                  }}
                  className="px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-[11px] font-bold text-white outline-none focus:border-cyan-500"
                >
                  {UTME_SUBJECTS_LIST.map(s => (
                    <option key={s} value={s} className="bg-gray-950 text-white">{s}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: O'Level Grades & Evaluation Trigger */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Award size={15} /> 2. O'Level Sitting & Grades (WAEC/NECO)
            </h3>
            <p className="text-[10px] text-gray-400">
              Select your best O'Level subjects and grades (A1 to C6 qualify as credits).
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {olevelResults.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
                  <select
                    id={`eligibility-olevel-subj-${idx}`}
                    name={`eligibility-olevel-subj-${idx}`}
                    aria-label={`O-Level Subject ${idx + 1}`}
                    value={item.subject}
                    onChange={e => {
                      const next = [...olevelResults];
                      next[idx].subject = e.target.value;
                      setOlevelResults(next);
                    }}
                    className="flex-1 bg-transparent border-0 text-[11px] font-bold text-white outline-none"
                  >
                    {OLEVEL_SUBJECTS_LIST.map(s => (
                      <option key={s} value={s} className="bg-gray-950 text-white">{s}</option>
                    ))}
                  </select>
                  <select
                    id={`eligibility-olevel-grade-${idx}`}
                    name={`eligibility-olevel-grade-${idx}`}
                    aria-label={`O-Level Grade for Subject ${idx + 1}`}
                    value={item.grade}
                    onChange={e => {
                      const next = [...olevelResults];
                      next[idx].grade = e.target.value;
                      setOlevelResults(next);
                    }}
                    className={`w-20 px-2 py-1 rounded-lg text-xs font-black outline-none ${
                      ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(item.grade)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {GRADES.map(g => (
                      <option key={g} value={g} className="bg-gray-950 text-white">{g}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setOlevelResults(olevelResults.filter((_, i) => i !== idx));
                    }}
                    className="text-gray-500 hover:text-rose-400 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setOlevelResults([...olevelResults, { subject: 'Agricultural Science', grade: 'C6' }])}
                className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-cyan-400 border border-dashed border-white/10 transition-all"
              >
                + Add Another O'Level Subject
              </button>
            </div>
          </div>

          {/* Evaluate Button */}
          <button
            type="button"
            onClick={handleEvaluate}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase text-xs tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check size={16} /> Evaluate Admission Eligibility Now
          </button>
        </div>
      </div>

      {/* Evaluation Results Section */}
      {evaluationState.status !== 'idle' && (
        <div className="mt-6 p-6 bg-black/60 border rounded-2xl space-y-4 animate-fade-in shadow-2xl">
          {evaluationState.errorMsg ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-300">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider">Verification Notice / Incomplete Data</p>
                <p className="text-xs leading-relaxed">{evaluationState.errorMsg}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Status Header */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                evaluationState.status === 'eligible' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-3">
                  {evaluationState.status === 'eligible' ? <CheckCircle2 size={24} className="text-emerald-400" /> : <XCircle size={24} className="text-rose-400" />}
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider">
                      {evaluationState.status === 'eligible' ? '🎉 ELIGIBLE FOR ADMISSION CONSIDERATION' : '❌ NOT ELIGIBLE / DEFICIT FOUND'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {evaluationState.status === 'eligible' 
                        ? `All verified IBASS requirements and cutoff criteria are satisfied for ${selectedProg?.course_name || 'this programme'} at ${selectedInst?.name || selectedInst?.institution_name}.`
                        : `One or more specific requirements were not met based on official IBASS rules.`}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                  evaluationState.status === 'eligible' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {evaluationState.status === 'eligible' ? 'Verified Eligible' : 'Deficit Identified'}
                </span>
              </div>

              {/* Specific Diagnostics Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* UTME Subject Diagnostics */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2.5">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <BookOpen size={13} className="text-cyan-400" /> UTME Subject Combination
                  </h5>
                  <div className="space-y-1.5 text-xs">
                    {evaluationState.result?.checks.utmeValid ? (
                      <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <Check size={14} /> UTME subject combination satisfied
                      </p>
                    ) : (
                      <p className="text-rose-400 font-bold flex items-center gap-1.5">
                        <X size={14} /> Required UTME subject combination not satisfied
                      </p>
                    )}
                    {evaluationState.result?.checks.missingUtmeMandatory && evaluationState.result.checks.missingUtmeMandatory.length > 0 && (
                      <p className="text-[11px] text-amber-300">
                        Missing mandatory subjects: {evaluationState.result.checks.missingUtmeMandatory.join(', ')}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400">
                      Official IBASS Rule: {selectedProg?.utme_subjects || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* O'Level Credits Diagnostics */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2.5">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <Award size={13} className="text-cyan-400" /> O'Level Credits Requirement
                  </h5>
                  <div className="space-y-1.5 text-xs">
                    {evaluationState.result?.checks.olevelValid ? (
                      <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <Check size={14} /> Required O'Level credits satisfied (5+ Credits including Maths & English)
                      </p>
                    ) : (
                      <p className="text-rose-400 font-bold flex items-center gap-1.5">
                        <X size={14} /> O'Level credit requirement deficit
                      </p>
                    )}
                    {evaluationState.result?.checks.missingOlevelMandatory && evaluationState.result.checks.missingOlevelMandatory.length > 0 && (
                      <p className="text-[11px] text-amber-300">
                        Missing required O'Level subjects: {evaluationState.result.checks.missingOlevelMandatory.join(', ')}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400">
                      Official IBASS Rule: {selectedProg?.olevel_requirements || '5 Credits in relevant subjects'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Source & Freshness Trust Notice */}
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl flex items-center justify-between text-[10px] text-gray-300">
                <span className="flex items-center gap-2">
                  <Info size={14} className="text-cyan-400 shrink-0" />
                  <span>Data sourced live from official JAMB IBASS repository. Requirements verified for {selectedInst?.name || selectedInst?.institution_name}.</span>
                </span>
                <span className="font-mono text-cyan-300 font-bold">IBASS Official</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
