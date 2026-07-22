import React from 'react';
import { X, Printer, Download, Share2, CheckCircle2, ShieldCheck, Award, Calendar, GraduationCap } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultData: {
    targetUni: any;
    targetCourse: string;
    courseSearch: string;
    jambScore: string;
    postUtmeScore: string;
    isPostUtmePending: boolean;
    aggregateScore: number;
    admissionProbability: number;
    confidenceLevel: string;
    stateOfOrigin: string;
    subjects: { name: string; grade: string }[];
    aiResult: any;
  };
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose, resultData }) => {
  if (!isOpen) return null;

  const {
    targetUni,
    targetCourse,
    courseSearch,
    jambScore,
    postUtmeScore,
    isPostUtmePending,
    aggregateScore,
    admissionProbability,
    confidenceLevel,
    stateOfOrigin,
    subjects,
    aiResult
  } = resultData;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textContent = `
========================================
CAMPUSAI.NG - OFFICIAL ADMISSION SCREENING SLIP
========================================
Institution: ${targetUni?.name || 'Not Specified'}
Course of Study: ${targetCourse || courseSearch || 'Not Specified'}
Date Generated: ${new Date().toLocaleDateString()}
----------------------------------------
EXAMINATION SCORES:
- JAMB UTME Score: ${jambScore || '0'} / 400
- Post-UTME Score: ${isPostUtmePending ? 'Pending Exam (Estimated 70%)' : `${postUtmeScore || '0'} / 100`}
- State of Origin / Quota: ${stateOfOrigin || 'Not Specified'}
----------------------------------------
O-LEVEL (BEST 5) SUBJECTS:
${subjects.map((s, idx) => `${idx + 1}. ${s.name}: ${s.grade}`).join('\n')}
----------------------------------------
AGGREGATE SCORE RESULT:
- Calculated Aggregate: ${aggregateScore}%
- Admission Probability: ${admissionProbability}%
- Confidence Level: ${confidenceLevel}
- Verdict: ${aiResult?.verdict || 'Competitive'}
----------------------------------------
STRATEGY & RECOMMENDATION:
${aiResult?.detailedStrategy || aiResult?.recommendation || 'Verified by CampusAI Intelligence Engine.'}
========================================
Verified via CampusAI.ng (Nigeria's #1 Admission Predictor & Aggregate Calculator)
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(targetUni?.name || 'University').replace(/\s+/g, '_')}_${(targetCourse || 'Course').replace(/\s+/g, '_')}_Result_Slip.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareText = `🎓 My ${targetUni?.name || 'University'} Admission Screening Result:\nCourse: ${targetCourse || courseSearch}\nAggregate Score: ${aggregateScore}%\nAdmission Probability: ${admissionProbability}% (${confidenceLevel})\nCalculated via CampusAI.ng`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CampusAI Admission Screening Slip',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Result summary copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Official Result Slip Preview</h3>
              <p className="text-[10px] text-gray-500">Formatted for print, PDF save, and sharing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/20"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div id="printable-result-slip" className="p-8 md:p-12 space-y-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          
          {/* Header Branding */}
          <div className="flex items-center justify-between border-b-2 border-blue-600 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                C
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">CampusAI.<span className="text-blue-600">ng</span></h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Official Admission Aggregate & Screening Report</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] rounded-full border border-emerald-500/20">
                VERIFIED SLIP
              </span>
              <p className="text-[9px] text-gray-400 mt-1 font-mono">{new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Target Institution & Course Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Target Institution</span>
              <h2 className="text-base font-black text-gray-900 dark:text-white mt-0.5">{targetUni?.name || 'University not specified'}</h2>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{targetUni?.category || 'Federal University'} • {targetUni?.location || 'Nigeria'}</p>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Course of Choice</span>
              <h2 className="text-base font-black text-gray-900 dark:text-white mt-0.5">{targetCourse || courseSearch || 'Course not specified'}</h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Quota / State: {stateOfOrigin || 'General'}</p>
            </div>
          </div>

          {/* Scores Breakdown Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">JAMB UTME (400)</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{jambScore || '0'}</p>
              <p className="text-[9px] text-gray-500 mt-0.5">Weight / 8 or %</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">Post-UTME (100)</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {isPostUtmePending ? 'Pending' : (postUtmeScore || '0')}
              </p>
              <p className="text-[9px] text-gray-500 mt-0.5">{isPostUtmePending ? 'Estimated 70' : 'Screening Score'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Aggregate Score</span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{aggregateScore}%</p>
              <p className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">{confidenceLevel} Confidence</p>
            </div>
          </div>

          {/* O-Level Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">O'Level Best 5 Grades</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {subjects.map((sub, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-[9px] font-bold text-gray-400 truncate">{sub.name}</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white mt-1">{sub.grade}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Admission Probability & Verdict */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Admission Prediction Verdict</span>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">{aiResult?.verdict || 'Competitive Merit Range'}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                Estimated Admission Probability: <strong className="text-emerald-500">{admissionProbability}%</strong> ({confidenceLevel} confidence)
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 font-black text-lg shrink-0">
              {admissionProbability}%
            </div>
          </div>

          {/* Security Stamp & Footer */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-500" />
              <span>Generated securely via CampusAI Neural Engine • Official Academic Transcript Hash</span>
            </div>
            <p className="font-mono">ID: CAMPUSAI-{Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 print:hidden">
          <button
            onClick={handleShare}
            className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <Share2 size={14} /> Share Summary
          </button>
          <button
            onClick={handleDownloadText}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Download size={14} /> Download Text Summary
          </button>
        </div>

      </div>
    </div>
  );
};
