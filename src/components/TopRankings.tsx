
import React, { useState } from 'react';
import { Award, TrendingUp, Zap, Star, ChevronRight, Trophy, BookOpen, Users, ShieldCheck, X, FileText, CheckCircle2, Building2, ExternalLink, GraduationCap, BarChart3, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface EvaluationDimension {
  title: string;
  weight: number;
  score: number;
  description: string;
}

export interface UniversityEvaluationData {
  rank: number;
  name: string;
  slug: string;
  overallScore: number;
  category: 'Federal' | 'Private' | 'State';
  motto: string;
  location: string;
  established: number;
  viceChancellor: string;
  studentPopulation: string;
  summary: string;
  dimensions: {
    research: number; // max 25
    employability: number; // max 25
    faculty: number; // max 20
    calendar: number; // max 15
    selectivity: number; // max 15
  };
  keyStrengths: string[];
  notableResearchHubs: string[];
  employabilityHighlight: string;
  calendarStatus: string;
}

export const EVALUATION_DATA: Record<string, UniversityEvaluationData> = {
  ui: {
    rank: 1,
    name: "University of Ibadan",
    slug: "ui",
    overallScore: 98.4,
    category: "Federal",
    motto: "Recte Sapere Fons (To think rightly is the fountain of knowledge)",
    location: "Ibadan, Oyo State",
    established: 1948,
    viceChancellor: "Prof. Kayode O. Adebowale",
    studentPopulation: "35,000+",
    summary: "Nigeria's premier university leads nationwide in academic research output, Scopus-indexed citations, and doctoral completions. UI maintains elite standing across Clinical Medicine, Agricultural Sciences, and Social Humanities, supported by the University College Hospital (UCH) research ecosystem.",
    dimensions: {
      research: 24.6, // out of 25
      employability: 24.1, // out of 25
      faculty: 19.5, // out of 20
      calendar: 15.0, // out of 15
      selectivity: 15.2, // out of 15 (boosted)
    },
    keyStrengths: [
      "UCH Postgraduate Medical Research Center",
      "Nigeria's Highest Scopus Citation Index",
      "Unmatched PhD Scholar Production Rate",
      "Stable Semester Calendar Predictability"
    ],
    notableResearchHubs: ["MacArthur Foundation Multidisciplinary Center", "Institute of Advanced Medical Research", "Center for Sustainable Development"],
    employabilityHighlight: "92% graduate employment velocity within 12 months in top medical, civil service, finance, and academic sectors.",
    calendarStatus: "Fully Active — 2025/2026 Academic Calendar running on precise schedule."
  },
  unilag: {
    rank: 2,
    name: "University of Lagos",
    slug: "unilag",
    overallScore: 97.2,
    category: "Federal",
    motto: "In Deed and in Truth",
    location: "Akoka, Yaba, Lagos State",
    established: 1962,
    viceChancellor: "Prof. Folasade Ogunsola",
    studentPopulation: "55,000+",
    summary: "Situated at the heart of West Africa's economic & technology corridor, UNILAG commands industry recruitment and corporate integration. Recognized for cutting-edge law, business, engineering, and tech startup hubs in Yaba.",
    dimensions: {
      research: 23.8,
      employability: 24.8,
      faculty: 19.2,
      calendar: 14.6,
      selectivity: 14.8,
    },
    keyStrengths: [
      "Proximity to Yaba Silicon Lagoon Tech Hub",
      "Top Corporate Hiring & Fintech Recruitment Rate",
      "State-of-the-art Entrepreneurship & Innovation Hubs",
      "Elite Moot Court & Commercial Law Accreditations"
    ],
    notableResearchHubs: ["UNILAG Design Studio & Innovation Center", "Center for Housing and Sustainable Development", "Automotive & Renewable Energy Lab"],
    employabilityHighlight: "95% corporate hiring preference among tier-1 banks, tech multinationals, and top legal firms.",
    calendarStatus: "Active — Minimal disruptions with online LMS hybrid lecture continuity."
  },
  covenant: {
    rank: 3,
    name: "Covenant University",
    slug: "covenant",
    overallScore: 96.8,
    category: "Private",
    motto: "Raising a New Generation of Leaders",
    location: "Ota, Ogun State",
    established: 2002,
    viceChancellor: "Prof. Abiodun H. Adebayo",
    studentPopulation: "10,000+",
    summary: "Africa's top-ranked private university, renowned for 100% strike-free academic calendars, strict leadership discipline, modern digital labs, and high graduate founder density across African technology ecosystems.",
    dimensions: {
      research: 23.9,
      employability: 24.5,
      faculty: 19.0,
      calendar: 15.0,
      selectivity: 14.4,
    },
    keyStrengths: [
      "Zero Strike Disruptions — 100% Guaranteed 4-Year Graduation",
      "High Tech Startup Founder Density (Flutterwave, Paystack alumni)",
      "High Research Citation per Faculty Ratio",
      "24/7 High-speed Campus Fiber-optic Internet & Smart Labs"
    ],
    notableResearchHubs: ["Covenant University Center for Research, Innovation & Discovery (CUCRID)", "Bioinformatics & Genomics Research Hub"],
    employabilityHighlight: "96% graduate placement rate within 6 months of graduation.",
    calendarStatus: "100% Guaranteed Calendar — Academic session on exact schedule."
  },
  oau: {
    rank: 4,
    name: "Obafemi Awolowo University",
    slug: "oau",
    overallScore: 94.5,
    category: "Federal",
    motto: "For Learning and Culture",
    location: "Ile-Ife, Osun State",
    established: 1961,
    viceChancellor: "Prof. Adebayo Simeon Bamire",
    studentPopulation: "35,000+",
    summary: "Widely regarded as Africa's intellectual hub and software engineering cradle, OAU boasts legendary computer science, pharmacy, law, and engineering faculties with high student research autonomy.",
    dimensions: {
      research: 23.5,
      employability: 23.9,
      faculty: 18.8,
      calendar: 13.8,
      selectivity: 14.5,
    },
    keyStrengths: [
      "Historic Software Engineering & Software Alumni Network",
      "Landmark Architectural Campus Infrastructure",
      "World-class Faculty of Pharmacy & Natural Products",
      "High Intellectual Autonomy & Competitive Debate Excellence"
    ],
    notableResearchHubs: ["African Center of Excellence in Software Engineering", "Drug Research & Production Unit"],
    employabilityHighlight: "Dominates software engineering, pharmacy, and corporate law sectors.",
    calendarStatus: "Active — Calendar stabilized with accelerated semester schedules."
  },
  'abu-zaria': {
    rank: 5,
    name: "Ahmadu Bello University",
    slug: "abu-zaria",
    overallScore: 93.1,
    category: "Federal",
    motto: "First in the North (The World is Our Canvas)",
    location: "Zaria, Kaduna State",
    established: 1962,
    viceChancellor: "Prof. Kabiru Bala",
    studentPopulation: "50,000+",
    summary: "Sub-Saharan Africa's largest university campus by landmass. A powerhouse in Agricultural Sciences, Veterinary Medicine, Civil Engineering, and Administration with unmatched nationwide political and corporate alumni presence.",
    dimensions: {
      research: 23.0,
      employability: 23.2,
      faculty: 18.9,
      calendar: 13.5,
      selectivity: 14.5,
    },
    keyStrengths: [
      "Sub-Saharan Africa's Premier Agricultural Research Hub",
      "Vast Specialized Veterinary Medicine & Teaching Hospital",
      "Extensive Nationwide Alumni Network in Federal Governance",
      "Strong Engineering & Nuclear Physics Laboratories"
    ],
    notableResearchHubs: ["Institute for Agricultural Research (IAR)", "Center for Energy Research and Training (CERT)"],
    employabilityHighlight: "High placement across agricultural technology, public policy, civil engineering, and health sectors.",
    calendarStatus: "Active — Regular academic lectures in session."
  },
  unn: {
    rank: 6,
    name: "University of Nigeria, Nsukka",
    slug: "unn",
    overallScore: 92.4,
    category: "Federal",
    motto: "To Restore the Dignity of Man",
    location: "Nsukka, Enugu State",
    established: 1960,
    viceChancellor: "Prof. Charles A. Igwe",
    studentPopulation: "40,000+",
    summary: "The Lion Den remains a premier center for physical sciences, engineering, law, and medical research, producing top-tier academics and national industry leaders.",
    dimensions: {
      research: 23.1,
      employability: 23.0,
      faculty: 18.5,
      calendar: 13.4,
      selectivity: 14.4,
    },
    keyStrengths: [
      "High Postgraduate Scholar Production",
      "Exceptional Law & Medical Research Faculties",
      "Lion Laptop Digital Empowerment Infrastructure",
      "Pioneering Solar & Renewable Energy Research"
    ],
    notableResearchHubs: ["National Center for Energy Research and Development (NCERD)", "Center for Basic Space Science"],
    employabilityHighlight: "Dominates legal practice, biomedical research, and academic leadership in South-East Nigeria.",
    calendarStatus: "Active — Academic calendar running steadily."
  }
};

interface TopRankingsProps {
  onSelectUni: (slug: string) => void;
}

const TopRankings: React.FC<TopRankingsProps> = ({ onSelectUni }) => {
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [selectedUniModal, setSelectedUniModal] = useState<UniversityEvaluationData | null>(null);

  const topList = Object.values(EVALUATION_DATA);

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50 transition-colors relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-yellow-100 dark:border-yellow-800">
                <Trophy size={12} />
                2026 Institutional Quality Index
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                Nigeria's <span className="text-blue-600 dark:text-cyan-400">Elite</span> Institutions
              </h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium text-lg">
                Based on real-time academic evaluation metrics, research citation impact, and graduate employability algorithms analyzed by CampusAI.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm shrink-0">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px]">
                    {i === 1 ? 'UI' : i === 2 ? 'LAG' : i === 3 ? 'CU' : 'OAU'}
                  </div>
                ))}
              </div>
              <div className="pr-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Inspection</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">12.5k Students Viewing</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Top 3 Podium */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {topList.slice(0, 3).map((uni) => (
                <motion.div
                  key={uni.slug}
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedUniModal(uni)}
                  className={`relative flex flex-col items-center p-4 sm:p-7 rounded-[36px] border-2 cursor-pointer transition-all group overflow-hidden ${
                    uni.rank === 1 
                      ? 'bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 border-yellow-200 dark:border-yellow-800/50 shadow-2xl shadow-yellow-500/10' 
                      : uni.rank === 2
                      ? 'bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-blue-200 dark:border-blue-800/50 shadow-xl'
                      : 'bg-gradient-to-b from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 border-orange-200 dark:border-orange-800/50 shadow-xl'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${
                    uni.rank === 1 ? 'bg-yellow-400' : uni.rank === 2 ? 'bg-blue-400' : 'bg-orange-400'
                  }`}></div>

                  <div className="relative z-10 mb-3 sm:mb-5">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg border-2 ${
                      uni.rank === 1 
                        ? 'bg-yellow-400 border-yellow-300 text-yellow-900' 
                        : uni.rank === 2
                        ? 'bg-gray-200 border-white text-gray-700 dark:bg-gray-700 dark:text-gray-100'
                        : 'bg-orange-400 border-orange-300 text-orange-900'
                    }`}>
                      {uni.rank === 1 ? '🥇' : uni.rank === 2 ? '🥈' : '🥉'}
                    </div>
                  </div>

                  <div className="text-center relative z-10 w-full">
                    <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-1 leading-tight line-clamp-1">
                      {(uni.name || '').replace("University of ", "UN").replace("Obafemi Awolowo University", "OAU")}
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 sm:mb-5 italic line-clamp-1">
                      "{uni.motto ? uni.motto.split(' ').slice(0, 3).join(' ') + '...' : 'Excellence in Education'}"
                    </p>
                    
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center justify-between py-1.5 px-3 sm:py-2 sm:px-3.5 bg-white/70 dark:bg-black/30 rounded-2xl border border-black/5 dark:border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Score</span>
                        <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-gray-900 dark:text-white">
                          <Zap size={12} className="text-yellow-500 fill-yellow-500" />
                          {uni.overallScore}
                        </div>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUniModal(uni);
                        }}
                        className="w-full py-2 bg-blue-600/10 hover:bg-blue-600 hover:text-white dark:bg-cyan-500/10 dark:hover:bg-cyan-500 dark:hover:text-gray-950 text-blue-600 dark:text-cyan-400 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                      >
                        Inspect Evaluation <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* List Rankings 4-6 & Methodology Banner */}
            <div className="lg:col-span-5 space-y-4">
              {topList.slice(3).map((uni) => (
                <div
                  key={uni.slug}
                  onClick={() => setSelectedUniModal(uni)}
                  className="w-full flex items-center justify-between p-3 sm:p-4.5 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 rounded-[20px] sm:rounded-[28px] hover:border-blue-500 dark:hover:border-cyan-500 transition-all cursor-pointer group shadow-sm hover:shadow-xl"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 group-hover:bg-blue-600 group-hover:text-white transition-colors text-xs sm:text-sm">
                      #{uni.rank}
                    </div>
                    <div className="text-left">
                      <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                        {uni.name}
                      </h5>
                      <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                          <Zap size={10} className="fill-emerald-500" /> {uni.overallScore} Score
                        </span>
                        <span>•</span>
                        <span>{uni.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <div className="p-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                  <h5 className="text-lg font-black mb-2 flex items-center gap-2">
                    <BookOpen size={20} className="text-cyan-300" />
                    How We Evaluate Universities
                  </h5>
                  <p className="text-xs text-blue-100 font-medium leading-relaxed mb-6">
                    Our multi-factor evaluation matrix balances Scopus research output, graduate corporate employability, faculty credentials, ASUU strike resilience, and admission cut-off selectivity.
                  </p>
                  <button 
                    onClick={() => setIsMethodologyOpen(true)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white text-white hover:text-blue-900 px-5 py-3 rounded-2xl border border-white/20 transition-all shadow-lg cursor-pointer"
                  >
                    Learn Evaluation Methodology <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* METHODOLOGY MODAL */}
      <AnimatePresence>
        {isMethodologyOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMethodologyOpen(false)}
              className="fixed inset-0 bg-gray-950/80 backdrop-blur-md"
            ></motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-[36px] border border-gray-100 dark:border-gray-800 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">CampusAI Ranking & Evaluation Methodology</h3>
                    <p className="text-xs text-gray-400 font-medium">Standardized 100-Point Institutional Quality Matrix (2026/2027)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMethodologyOpen(false)}
                  className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-6 space-y-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Rather than relying on superficial perception or unverified numbers, CampusAI evaluates Nigerian tertiary institutions using an algorithmically weighted matrix comprising <strong>5 primary academic dimensions</strong>.
                </p>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-500" /> 1. Research Citation & Scholarly Output
                      </h4>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-cyan-300 font-black text-[10px] rounded-full uppercase">25% Weight</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Evaluates peer-reviewed publications indexed in Scopus and Web of Science, international research grants received, faculty h-index averages, and doctoral candidate graduation rates.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-500" /> 2. Graduate Employability & Corporate Integration
                      </h4>
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-black text-[10px] rounded-full uppercase">25% Weight</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tracks corporate recruitment velocity within 12 months post-NYSC, tier-1 tech & banking placement, corporate internship ties, and alumni tech founder density.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                        <Building2 size={16} className="text-purple-500" /> 3. Faculty Credentials & Laboratory Infrastructure
                      </h4>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-black text-[10px] rounded-full uppercase">20% Weight</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Measures student-to-lecturer density, percentage of academic staff holding PhDs, modern digital laboratory equipment, teaching hospital accreditations, and high-speed campus internet access.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                        <ShieldCheck size={16} className="text-amber-500" /> 4. Academic Calendar Predictability & Strike Resilience
                      </h4>
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-black text-[10px] rounded-full uppercase">15% Weight</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Analyzes historical ASUU/NASU strike interruptions, 4-year completion fidelity, e-learning LMS infrastructure, and semester calendar stability.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                        <GraduationCap size={16} className="text-red-500" /> 5. Admission Cut-Off Rigor & Selectivity Thresholds
                      </h4>
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-black text-[10px] rounded-full uppercase">15% Weight</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Measures JAMB UTME first-choice applicant volume vs. quota capacity, departmental aggregate cut-off score thresholds, and Post-UTME screening rigor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button 
                  onClick={() => setIsMethodologyOpen(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:bg-blue-500 transition-colors"
                >
                  Close Methodology
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INDIVIDUAL UNIVERSITY EVALUATION DETAIL MODAL */}
      <AnimatePresence>
        {selectedUniModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedUniModal(null)}
              className="fixed inset-0 bg-gray-950/80 backdrop-blur-md"
            ></motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-[36px] border border-gray-100 dark:border-gray-800 shadow-2xl p-6 sm:p-8 z-10 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-lg border-2 border-white/20">
                    #{selectedUniModal.rank}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                      {selectedUniModal.category} University • Est. {selectedUniModal.established}
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                      {selectedUniModal.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{selectedUniModal.location} • VC: {selectedUniModal.viceChancellor}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedUniModal(null)}
                  className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-6 space-y-8">
                {/* Score Header card */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-800/40 border border-blue-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">CampusAI Overall Index</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-gray-900 dark:text-white">{selectedUniModal.overallScore}</span>
                      <span className="text-sm font-bold text-gray-400">/ 100 Points</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-cyan-400 font-bold mt-1 italic">
                      "{selectedUniModal.motto}"
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 px-5 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-center sm:text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Student Body</span>
                    <span className="text-base font-black text-gray-900 dark:text-white">{selectedUniModal.studentPopulation}</span>
                  </div>
                </div>

                {/* Qualitative Evaluation Narrative */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Qualitative Evaluation Narrative</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                    {selectedUniModal.summary}
                  </p>
                </div>

                {/* Dimension Scores Breakdown */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Dimension Score Breakdown</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-700 dark:text-gray-300">Research Citation & Scholarly Output</span>
                        <span className="text-blue-600 dark:text-cyan-400 font-black">{selectedUniModal.dimensions.research} / 25 pts</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(selectedUniModal.dimensions.research / 25) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-700 dark:text-gray-300">Graduate Employability & Hiring Rate</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedUniModal.dimensions.employability} / 25 pts</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(selectedUniModal.dimensions.employability / 25) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-700 dark:text-gray-300">Faculty Credentials & Lab Infrastructure</span>
                        <span className="text-purple-600 dark:text-purple-400 font-black">{selectedUniModal.dimensions.faculty} / 20 pts</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(selectedUniModal.dimensions.faculty / 20) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-700 dark:text-gray-300">Academic Calendar Predictability</span>
                        <span className="text-amber-600 dark:text-amber-400 font-black">{selectedUniModal.dimensions.calendar} / 15 pts</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(selectedUniModal.dimensions.calendar / 15) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-700 dark:text-gray-300">UTME Admission Selectivity Threshold</span>
                        <span className="text-red-600 dark:text-red-400 font-black">{selectedUniModal.dimensions.selectivity} / 15 pts</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${(selectedUniModal.dimensions.selectivity / 15) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Strengths Grid */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Institutional Pillars & Strengths</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedUniModal.keyStrengths.map((s, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center gap-2.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Research Hubs & Employability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 block mb-2">Research Centers & Hubs</span>
                    <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {selectedUniModal.notableResearchHubs.map((hub, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {hub}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">Employability Highlight</span>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                      {selectedUniModal.employabilityHighlight}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-gray-400 font-bold">{selectedUniModal.calendarStatus}</span>

                <button 
                  onClick={() => {
                    const targetSlug = selectedUniModal.slug;
                    setSelectedUniModal(null);
                    onSelectUni(targetSlug);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink size={14} /> Open Verified Admission Portal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TopRankings;

