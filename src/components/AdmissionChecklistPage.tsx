import React from 'react';
import { AdmissionChecklist } from './AdmissionChecklist';
import SEO from './SEO';
import { Sparkles, ArrowLeft, FileCheck, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdmissionChecklistPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-20">
      <SEO 
        title="2026/2027 Admission Clearance & Registration Documents Checklist" 
        description="Comprehensive list of official documents needed for Nigerian university clearance after admission on JAMB CAPS. Prepare your JAMB admission letter, O'Level results, medical certificates, and state of origin."
        keywords="admission clearance documents 2026, JAMB admission letter, university registration requirements Nigeria, WAEC result verification, medical fitness certificate university, acceptance fee receipt"
      />

      <div className="container mx-auto px-4 md:px-8 mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Calculator & Home
        </button>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-5xl mb-12">
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-gray-900/40 border border-blue-500/20 rounded-[32px] p-8 md:p-12 text-left relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs uppercase tracking-wider mb-4">
            <FileCheck size={16} /> Official 2026/2027 Clearance Guide
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Post-Admission Clearance & Registration Document Checklist
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl">
            Have you checked your JAMB CAPS and seen <span className="text-emerald-400 font-black">"ADMITTED"</span>? Congratulations! Before you can resume lectures or obtain your matriculation number, you must complete physical clearance at your university faculty or admissions office. Here is the ultimate verified checklist of every document you need to prepare right now.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
              <span className="text-xs font-black uppercase tracking-widest text-blue-400 block mb-1">Step 1</span>
              <p className="text-xs text-gray-300 font-medium">Accept admission & print JAMB admission letter on CAPS portal.</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block mb-1">Step 2</span>
              <p className="text-xs text-gray-300 font-medium">Pay acceptance and school charges on official university portal.</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-1">Step 3</span>
              <p className="text-xs text-gray-300 font-medium">Compile physical files with credentials for faculty screening.</p>
            </div>
          </div>
        </div>
      </div>

      <AdmissionChecklist />

      <div className="container mx-auto px-4 md:px-8 max-w-5xl mt-12">
        <div className="p-8 bg-gray-900 border border-gray-800 rounded-3xl text-left space-y-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-400" /> Frequently Asked Questions About Clearance
          </h3>
          <div className="space-y-4 text-xs md:text-sm text-gray-300">
            <div>
              <strong className="text-white block mb-1 font-bold">1. How many copies of my JAMB Admission Letter should I print?</strong>
              <p className="text-gray-400">Print at least 4 colored copies (both Institution and Candidate copies). One is for school admissions office, one for your department file, one for student affairs, and one for your personal records.</p>
            </div>
            <div>
              <strong className="text-white block mb-1 font-bold">2. What if my O'Level result is awaiting (AR)?</strong>
              <p className="text-gray-400">If you were admitted with an awaiting result, ensure you upload your WAEC/NECO/NABTEB grades immediately via a CBT centre to JAMB CAPS and the university portal before the clearance deadline closes.</p>
            </div>
            <div>
              <strong className="text-white block mb-1 font-bold">3. Where should I do my Medical Fitness test?</strong>
              <p className="text-gray-400">Most Nigerian universities require you to perform your medical screening at the official University Medical Centre or an approved Government Teaching Hospital.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionChecklistPage;
