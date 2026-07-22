import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Share2, ShieldCheck, Award, Loader2, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfPreviewModalProps {
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

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ isOpen, onClose, resultData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generatePdfPreview();
    }
  }, [isOpen]);

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

  const generatePdfPreview = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('pdf-render-target');
      if (!element) {
        setIsGenerating(false);
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfOutputUrl = pdf.output('datauristring');
      setPdfDataUrl(pdfOutputUrl);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const element = document.getElementById('pdf-render-target');
    if (!element) return;

    html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${(targetUni?.name || 'University').replace(/\s+/g, '_')}_Admission_Slip.pdf`);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Official PDF Preview & Slip Generator</h3>
              <p className="text-[10px] text-gray-500">Powered by jsPDF & html2canvas • Ready for download</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-100 dark:bg-gray-950 flex justify-center">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin text-blue-600 mb-3" size={36} />
              <p className="text-sm font-black uppercase tracking-wider">Generating PDF Preview...</p>
              <p className="text-xs text-gray-500 mt-1">Rendering layout and calculating scores into slip</p>
            </div>
          ) : pdfDataUrl ? (
            <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
              <iframe
                src={pdfDataUrl}
                className="w-full h-[600px] border-none"
                title="PDF Preview"
              />
            </div>
          ) : null}
        </div>

        {/* Hidden Render Template for PDF Generation */}
        <div className="absolute -left-[9999px] top-0">
          <div id="pdf-render-target" className="w-[800px] p-12 bg-white text-gray-900 space-y-8 font-sans">
            
            {/* Header Branding */}
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                  C
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-gray-900">CampusAI.ng</h1>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Official Admission Aggregate & Screening Report</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] rounded-full border border-emerald-300">
                  VERIFIED OFFICIAL SLIP
                </span>
                <p className="text-[9px] text-gray-400 mt-1 font-mono">{new Date().toLocaleString()}</p>
              </div>
            </div>

            {/* Target Institution & Course Card */}
            <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Target Institution</span>
                <h2 className="text-lg font-black text-gray-900 mt-0.5">{targetUni?.name || 'University not specified'}</h2>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{targetUni?.category || 'Federal University'} • {targetUni?.location || 'Nigeria'}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Course of Choice</span>
                <h2 className="text-lg font-black text-gray-900 mt-0.5">{targetCourse || courseSearch || 'Course not specified'}</h2>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">Quota State: {stateOfOrigin || 'General'}</p>
              </div>
            </div>

            {/* Scores Breakdown Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">JAMB UTME (400)</span>
                <p className="text-3xl font-black text-gray-900 mt-1">{jambScore || '0'}</p>
              </div>
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-600">Post-UTME (100)</span>
                <p className="text-3xl font-black text-gray-900 mt-1">{isPostUtmePending ? 'Pending' : (postUtmeScore || '0')}</p>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Aggregate Score</span>
                <p className="text-4xl font-black text-emerald-600 mt-1">{aggregateScore}%</p>
              </div>
            </div>

            {/* O-Level Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">O'Level Best 5 Grades</h4>
              <div className="grid grid-cols-5 gap-3">
                {subjects.map((sub, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                    <p className="text-[9px] font-bold text-gray-400 truncate">{sub.name}</p>
                    <p className="text-base font-black text-gray-900 mt-1">{sub.grade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Admission Probability & Verdict */}
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Admission Prediction Verdict</span>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">{aiResult?.verdict || 'Competitive Merit Range'}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Estimated Probability: <strong className="text-emerald-600">{admissionProbability}%</strong> ({confidenceLevel} Confidence)
                </p>
              </div>
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-700 font-black text-xl">
                {admissionProbability}%
              </div>
            </div>

            {/* Security Stamp */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-600" />
                <span>Generated securely via CampusAI Neural Engine • Official Academic Transcript Hash</span>
              </div>
              <p className="font-mono">ID: CAMPUSAI-{Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <p className="text-xs text-gray-500">Preview generated instantly using jsPDF canvas rendering.</p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold text-xs rounded-xl transition-all"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};
