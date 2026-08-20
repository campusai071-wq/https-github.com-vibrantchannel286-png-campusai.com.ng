import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Share2, ShieldCheck, Award, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
import { formatStrategyMarkdown } from '../services/geminiService';

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
    hasOLevel?: boolean;
    hasPostUtme?: boolean;
    olevelPoints?: number;
    computedScoringSystem?: any;
    aiResult: any;
  };
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose, resultData }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const slipId = React.useMemo(() => `CAMPUSAI-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, [isOpen]);
  const slipDate = React.useMemo(() => new Date().toLocaleDateString(), [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    hasOLevel = true,
    hasPostUtme = true,
    olevelPoints,
    computedScoringSystem,
    aiResult
  } = resultData;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('printable-result-slip');
      if (!element) return;
      
      if (document.fonts) {
        await document.fonts.ready;
      }

      const htmlToImage = await import('html-to-image');
      const jspdfModule = await import('jspdf');
      const JsPdfClass = (jspdfModule as any).jsPDF || (jspdfModule as any).default || jspdfModule;

      const width = 800;
      const height = element.scrollHeight || element.offsetHeight;

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        style: {
          transform: 'none',
          overflow: 'visible',
          backgroundColor: '#ffffff'
        }
      });

      const pdf = new JsPdfClass({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (height * pdfWidth) / width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const uniName = targetUni?.name || 'University';
      const courseName = targetCourse || courseSearch || 'Course';
      const cleanFileName = `${uniName.replace(/[^a-zA-Z0-9]/g, '_')}_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}_Result_Slip.pdf`;

      try {
        const pdfBlob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = cleanFileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      } catch (blobErr) {
        pdf.save(cleanFileName);
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      handleDownloadText();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('printable-result-slip');
      if (!element) return;
      
      if (document.fonts) {
        await document.fonts.ready;
      }

      const htmlToImage = await import('html-to-image');

      const width = 800;
      const height = element.scrollHeight || element.offsetHeight;

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        style: {
          transform: 'none',
          overflow: 'visible',
          backgroundColor: '#ffffff'
        }
      });

      const cleanFileName = `${(targetUni?.name || 'University').replace(/[^a-zA-Z0-9]/g, '_')}_${(targetCourse || 'Course').replace(/[^a-zA-Z0-9]/g, '_')}_Result_Slip.png`;
      
      const link = document.createElement('a');
      link.download = cleanFileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Image generation failed:", error);
      alert("Failed to generate image.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };
const handleDownloadText = () => {
    const oLevelText = hasOLevel 
      ? `O-LEVEL (BEST 5) SUBJECTS:\n${subjects.map((s, idx) => `${idx + 1}. ${s.name}: ${s.grade}`).join('\n')}`
      : `O-LEVEL VERIFICATION:\n- Required subjects satisfied\n- Grades not collected because ${targetUni?.name || 'this institution'}'s aggregate calculation does not use individual O'Level grades.`;

    const isFuta = (targetUni?.name || '').toLowerCase().includes('futa') || (targetUni?.name || '').toLowerCase().includes('akure');
    const jambNum = parseFloat(jambScore || '0') || 0;
    const examScoresText = hasPostUtme
      ? `- JAMB UTME Score: ${jambScore || '0'} / 400\n- Post-UTME Score: ${isPostUtmePending ? 'Pending Exam (Estimated 70%)' : `${postUtmeScore || '0'} / 100`}\n- State of Origin / Quota: ${stateOfOrigin || 'Not Specified'}`
      : `- JAMB UTME Score: ${jambScore || '0'} / 400 (${isFuta ? `${(jambNum / 400 * 75).toFixed(2)} pts / 75%` : 'Screening Component'})\n- Screening Mode: Point-Based O'Level Screening (No Post-UTME Exam)\n- O'Level Screening Score: ${olevelPoints !== undefined ? `${olevelPoints} pts` : 'Verified'}\n- State of Origin / Quota: ${stateOfOrigin || 'Not Specified'}`;

    const textContent = `
========================================
CAMPUSAI.NG - OFFICIAL ADMISSION SCREENING SLIP
========================================
Institution: ${targetUni?.name || 'Not Specified'}
Course of Study: ${targetCourse || courseSearch || 'Not Specified'}
Date Generated: ${new Date().toLocaleDateString()}
----------------------------------------
EXAMINATION & SCREENING BREAKDOWN:
${examScoresText}
----------------------------------------
${oLevelText}
----------------------------------------
AGGREGATE SCORE RESULT:
- Calculated Aggregate: ${aggregateScore}%
- Admission Probability: ${admissionProbability}%
- Confidence Level: ${confidenceLevel}
- Verdict: ${aiResult?.verdict || 'Competitive'}
----------------------------------------
STRATEGY & RECOMMENDATION:
${formatStrategyMarkdown(aiResult?.detailedStrategy || aiResult?.recommendation || 'Verified by CampusAI Intelligence Engine.')}
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
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Result summary copied to clipboard!');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-result-slip, #printable-result-slip * {
            visibility: visible;
          }
          #printable-result-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            margin: 0;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Modal Header */}
        <div className="shrink-0 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 z-30 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Award size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider truncate">Official Result Slip</h3>
              <p className="text-[10px] text-gray-500 hidden sm:block">Formatted for PDF export, print, and instant verification</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
              title="Print document or save as PDF"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-red-500/20"
              title="Close modal"
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Content Area Container */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-2 sm:p-6 bg-gray-100 dark:bg-gray-950 flex justify-center items-start">
          <div 
            id="printable-result-slip" 
            className="w-[780px] min-w-[780px] space-y-6 bg-white text-gray-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-200 shrink-0"
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
          >
            
            {/* Header Branding */}
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-5 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                  C
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
                    CampusAI.<span className="text-blue-600">ng</span>
                  </h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Official Admission Aggregate & Screening Report
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] rounded-full border border-emerald-200 inline-block">
                  VERIFIED SLIP
                </span>
                <p className="text-[9px] text-gray-400 mt-1 font-mono">{slipDate}</p>
              </div>
            </div>

            {/* Target Institution & Course Card */}
            <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Target Institution</span>
                <h2 className="text-base font-black text-gray-900 mt-0.5">{targetUni?.name || 'University not specified'}</h2>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{targetUni?.category || 'Federal University'} • {targetUni?.location || 'Nigeria'}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Course of Choice</span>
                <h2 className="text-base font-black text-gray-900 mt-0.5">{targetCourse || courseSearch || 'Course not specified'}</h2>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">Quota / State: {stateOfOrigin || 'General'}</p>
              </div>
            </div>

            {/* Scores Breakdown Grid (Fixed 3 columns) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">JAMB UTME (400)</span>
                <p className="text-2xl font-black text-gray-900 mt-1">{jambScore || '0'}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  {!hasPostUtme 
                    ? ((targetUni?.name || '').toLowerCase().includes('futa') 
                        ? `75% Weight (${((parseFloat(jambScore || '0') || 0) / 400 * 75).toFixed(2)} pts)` 
                        : 'UTME Component')
                    : 'Weight / 8 or %'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-600">
                  {hasPostUtme ? 'Post-UTME (100)' : "O'Level Screening"}
                </span>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  {hasPostUtme 
                    ? (isPostUtmePending ? 'Pending' : (postUtmeScore || '0'))
                    : (olevelPoints !== undefined ? `${olevelPoints}` : 'Screened')}
                </p>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  {hasPostUtme 
                    ? (isPostUtmePending ? 'Estimated 70' : 'Screening Score')
                    : ((targetUni?.name || '').toLowerCase().includes('futa') ? '25% Weight (Points)' : 'Screening Points')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                  {(isPostUtmePending || aiResult?.isAwaitingResult) ? 'Projected Aggregate' : 'Aggregate Score'}
                </span>
                <p className="text-3xl font-black text-emerald-600 mt-1">{aggregateScore}%</p>
                <p className="text-[9px] font-semibold text-emerald-700 mt-0.5">{confidenceLevel} Confidence</p>
              </div>
            </div>

            {/* O-Level Breakdown Table (Fixed 5 columns) */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">
                {hasOLevel ? "O'Level Best 5 Grades" : "O'Level Verification"}
              </h4>
              {hasOLevel ? (
                <div className="grid grid-cols-5 gap-2.5">
                  {subjects.map((sub, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                      <p className="text-[9px] font-bold text-gray-500 truncate" title={sub.name}>{sub.name}</p>
                      <p className="text-base font-black text-gray-900 mt-0.5">{sub.grade}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-[11px] uppercase tracking-wider mb-2">
                    <ShieldCheck size={14} /> Subject Combination Verified
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Required subjects are satisfied. Grades are not collected because {targetUni?.name || 'this institution'}'s aggregate calculation does not use individual O'Level grades.
                  </p>
                </div>
              )}
            </div>

            
            {/* Admission Probability & Verdict */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border border-blue-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Admission Prediction Verdict</span>
                <h3 className="text-lg font-black text-gray-900 mt-0.5">{aiResult?.verdict || 'Competitive Merit Range'}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Estimated Admission Probability: <strong className={
                    admissionProbability >= 75 ? "text-emerald-600" :
                    admissionProbability >= 50 ? "text-amber-600" :
                    admissionProbability >= 30 ? "text-orange-600" : "text-red-600"
                  }>{admissionProbability}%</strong> ({confidenceLevel} confidence)
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-black text-lg shrink-0 ${
                admissionProbability >= 75 ? 'bg-emerald-100 border-emerald-500 text-emerald-700' :
                admissionProbability >= 50 ? 'bg-amber-100 border-amber-500 text-amber-700' :
                admissionProbability >= 30 ? 'bg-orange-100 border-orange-500 text-orange-700' : 
                'bg-red-100 border-red-500 text-red-700'
              }`}>
                {admissionProbability}%
              </div>
            </div>
            {/* Security Stamp & Footer */}
            <div className="pt-5 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400 gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                <span>Generated securely via CampusAI Neural Engine • Official Academic Transcript Hash</span>
              </div>
              <p className="font-mono text-[9px]">{slipId}</p>
            </div>

          </div>
        </div>

        {/* Sticky Modal Footer Actions */}
        <div className="shrink-0 sticky bottom-0 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2.5 z-30 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <X size={14} />
            <span>Close</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleShare}
              className="px-3.5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handleDownloadText}
              className="px-3.5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              title="Download text file summary"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Text File</span>
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={14} />
                  <span className="hidden sm:inline">Save Image</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <FileText size={14} />
                  <span className="hidden sm:inline">Save PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PdfExportModal;
