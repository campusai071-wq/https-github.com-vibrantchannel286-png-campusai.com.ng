import React, { useState } from 'react';
import { CheckCircle2, FileText, ShieldAlert, Award, ArrowRight, Sparkles, AlertCircle, Check } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  category: 'essential' | 'biometric' | 'medical' | 'financial';
  description: string;
  tip: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'jamb-admission',
    title: 'JAMB Admission Letter (Institution & Candidate Copies)',
    category: 'essential',
    description: 'Must be printed in colour directly from your official JAMB CAPS portal once admission status changes to "ADMITTED".',
    tip: 'Print at least 4 colored copies. You will need them for clearance, department file, and student affairs.'
  },
  {
    id: 'jamb-result',
    title: 'Original JAMB UTME Result Slip',
    category: 'essential',
    description: 'The official result slip bearing your passport photograph and aggregate score.',
    tip: 'Ensure your passport is clear and details match your NIN / WAEC.'
  },
  {
    id: 'olevel-result',
    title: 'O\'Level Certificate or Statement of Result (WAEC/NECO/NABTEB)',
    category: 'essential',
    description: 'Must match the grades uploaded on JAMB CAPS during registration. Scratch card pins may be requested for verification.',
    tip: 'If using awaiting results, ensure you uploaded them immediately upon release before admission lists close.'
  },
  {
    id: 'state-origin',
    title: 'Certificate of State / Local Government of Origin',
    category: 'essential',
    description: 'Signed by the Chairman of your Local Government Area or traditional authority.',
    tip: 'Must bear official stamp and signature. Essential for catchment/indigene quota verification.'
  },
  {
    id: 'birth-cert',
    title: 'Birth Certificate or Declaration of Age',
    category: 'essential',
    description: 'National Population Commission (NPC) birth certificate or sworn court affidavit of age.',
    tip: 'Must correspond with your date of birth on JAMB and NIN.'
  },
  {
    id: 'medical-cert',
    title: 'Medical Fitness Certificate',
    category: 'medical',
    description: 'Issued by an approved Government Hospital or University Medical Centre after laboratory tests (Chest X-Ray, PCV, Urinalysis, Stool, Widal).',
    tip: 'Do this early to avoid long queues during university clearance week.'
  },
  {
    id: 'acceptance-fee',
    title: 'Acceptance Fee & School Fees Receipts',
    category: 'financial',
    description: 'Generated via the university portal after accepting your admission on JAMB CAPS.',
    tip: 'Keep both the Remita Retrieval Reference (RRR) slip and the verified university portal e-receipt.'
  },
  {
    id: 'passports',
    title: 'Recent Coloured Passport Photographs (12-16 copies)',
    category: 'biometric',
    description: 'Standard white background passport photographs taken within the last 3 months.',
    tip: 'Write your Full Name, JAMB Reg No, and Course on the back of each passport.'
  },
  {
    id: 'sponsor-letter',
    title: "Sponsor's Guarantee / Letter of Financial Undertaking",
    category: 'financial',
    description: 'A signed letter from your parent, guardian, or financial sponsor committing to cover your tuition and living expenses throughout your study duration.',
    tip: 'Some universities require this to be stamped or notarized by a commissioner of oaths or magistrate.'
  },
  {
    id: 'referral-letter',
    title: 'Character Reference / Letter of Recommendation',
    category: 'essential',
    description: 'A letter of attestation to your good character and conduct signed by a reputable person (clergyman, senior civil servant, lawyer, or former principal).',
    tip: 'Must bear official letterhead, contact phone number, and stamp of the referee.'
  },
  {
    id: 'school-admission-letter',
    title: 'JAMB & Institution Admission Letter (Coloured Prints)',
    category: 'essential',
    description: 'Official admission letters printed directly from the JAMB portal (caps) and your admitted university student portal.',
    tip: 'Print at least 4 colored copies as different university units (Registry, Faculty, Department, Library) collect separate copies.'
  },
  {
    id: 'faculty-department-dues',
    title: 'Faculty & Departmental Association Dues Receipts',
    category: 'financial',
    description: 'Receipts for compulsory departmental association dues, faculty dues, SUG fees, and departmental handbook/ID card payments.',
    tip: 'Pay only through the approved departmental bank account or designated portal cashier and obtain signed receipts.'
  }
];

export const AdmissionChecklist: React.FC = () => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCompletedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="container mx-auto px-4 md:px-8 my-16">
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 border border-blue-500/20 rounded-[32px] p-8 md:p-12 shadow-2xl overflow-hidden text-left">
        
        {/* Background Decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs uppercase tracking-wider mb-3">
                <Sparkles size={14} /> 2026/2027 Admission Readiness Hub
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Post-Admission Registration & Clearance Checklist
              </h2>
              <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                Got admitted on JAMB CAPS? Start preparing these official documents immediately to breeze through physical clearance and departmental registration.
              </p>
            </div>

            {/* Progress Badge */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 min-w-[200px] text-center shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Readiness Progress</span>
              <div className="text-3xl font-black text-emerald-400 mb-1">{progressPercentage}%</div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block font-mono">{completedCount} of {CHECKLIST_ITEMS.length} documents ready</span>
            </div>
          </div>

          {/* Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHECKLIST_ITEMS.map((item) => {
              const isChecked = !!completedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`group relative p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                      : 'bg-black/40 border-white/5 hover:border-blue-500/30 text-white'
                  }`}
                >
                  <div className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                      : 'bg-gray-800 border-gray-700 text-transparent group-hover:border-blue-500'
                  }`}>
                    <Check size={14} className={isChecked ? 'stroke-[3]' : 'opacity-0'} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-black tracking-tight ${isChecked ? 'line-through text-gray-400' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.category === 'essential' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        item.category === 'medical' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        item.category === 'financial' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/10 rounded-xl p-2.5 text-[11px] text-blue-300">
                      <Sparkles size={13} className="shrink-0 mt-0.5 text-blue-400" />
                      <span><strong>Pro Tip:</strong> {item.tip}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom alert banner */}
          <div className="mt-8 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-200">
            <AlertCircle size={22} className="shrink-0 text-amber-400" />
            <div className="text-xs">
              <strong className="font-black uppercase tracking-wider block text-amber-400 mb-0.5">Important Clearance Warning</strong>
              Do not patronize unauthorized campus agents for clearance documents. All original credentials (WAEC, JAMB, Birth Certificate) must be presented physically during biometric screening at your faculty or admissions office.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
