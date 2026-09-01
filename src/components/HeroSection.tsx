import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Calculator, 
  Activity, 
  GraduationCap, 
  BookOpen, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import CalculationAnimation from './CalculationAnimation';

interface HeroSectionProps {
  user: any;
  onLaunchCalculator: () => void;
  onSignUpRequest?: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  badgeText?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  user, 
  onLaunchCalculator, 
  onSignUpRequest,
  title, 
  subtitle,
  badgeText = "Nigeria's Admission & Academic Intelligence"
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectTool = (path: string) => {
    setIsDropdownOpen(false);
    if (path === '/calculator') {
      onLaunchCalculator();
    } else {
      navigate(path);
      window.scrollTo(0, 0);
    }
  };

  const tools = [
    {
      id: 'calculator',
      title: 'Aggregate Calculator',
      description: 'Official 2026/2027 institutional Post-UTME cutoff & probability mapping',
      path: '/calculator',
      icon: <Calculator className="text-blue-400" size={20} />,
      badge: 'Admission',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      id: 'cbt',
      title: 'JAMB CBT Exam Simulator',
      description: 'Timed past question mock exams with instant step-by-step AI working',
      path: '/cbt-simulator',
      icon: <Activity className="text-emerald-400" size={20} />,
      badge: 'Live Mock',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'cgpa',
      title: 'CGPA & Transcript Studio',
      description: 'Nigerian University semester GPA tracking & graduation target calculator',
      path: '/cgpa-calculator',
      icon: <GraduationCap className="text-purple-400" size={20} />,
      badge: 'University',
      badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      id: 'study',
      title: 'Topic Study & Revision Hub',
      description: 'Topic-by-topic practice drills, formulas sheet, and novel summaries',
      path: '/study-hub',
      icon: <BookOpen className="text-amber-400" size={20} />,
      badge: 'Revision',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
  ];

  return (
    <div className="relative pt-24 pb-20 overflow-visible bg-gray-950">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-900/30 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-900/20 rounded-full blur-[128px] transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 md:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-left">
          <div className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-widest text-emerald-400 uppercase border border-emerald-400/20 rounded-full bg-emerald-400/5">
            {badgeText}
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-[1.1] text-white">
            {title || (
              <>Master Your <span className="text-emerald-400">CBT, Aggregate</span><br/>& CGPA Success</>
            )}
          </h1>
          <p className="text-base md:text-xl text-gray-400 mb-10 leading-relaxed max-w-xl">
            {subtitle || "Nigeria's ultimate AI admission and academic powerhouse. Practice live CBT exams with step-by-step AI solutions, calculate post-UTME aggregates instantly, and track your university CGPA."}
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap justify-start items-stretch sm:items-center gap-4 relative z-30">
            {/* Split / Dropdown Launch Button */}
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <div className="flex rounded-2xl shadow-xl shadow-blue-600/20 overflow-hidden bg-blue-600 hover:bg-blue-500 transition-all">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectTool('/calculator')}
                  className="text-white font-black py-4 pl-8 pr-4 text-sm uppercase tracking-widest cursor-pointer flex items-center gap-2"
                >
                  <span>Launch Calculator</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  className="py-4 px-3.5 bg-blue-700/80 hover:bg-blue-700 text-white flex items-center justify-center border-l border-blue-500/40 cursor-pointer transition-colors"
                  title="Choose tool"
                >
                  <ChevronDown size={18} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>

              {/* Animated Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-0 mt-3 w-80 sm:w-96 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl p-2 z-50 divide-y divide-slate-800/60"
                  >
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Select Quick Tool</span>
                      <Sparkles size={12} className="text-emerald-400" />
                    </div>

                    <div className="py-1 space-y-1">
                      {tools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleSelectTool(tool.path)}
                          className="w-full p-3 rounded-2xl text-left hover:bg-slate-800/80 transition-all flex items-start gap-3.5 group cursor-pointer"
                        >
                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 group-hover:border-slate-700 transition-colors">
                            {tool.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors truncate">
                                {tool.title}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tool.badgeClass}`}>
                                {tool.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                          <ArrowRight size={14} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all mt-3" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {!user && onSignUpRequest && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSignUpRequest}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-cyan-500/20 text-sm uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer border border-cyan-300/30"
              >
                Sign Up Free
              </motion.button>
            )}

            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://buyresultsverificationcode.ng/?fbclid=IwY2xjawT83JFwZG9mAWV4dG4DYWVtAjEwAGJyaWQRMVl2M3BqODFFcTUwSGtwbWhzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEe10oz4ePhZXWZvYxSjH_eeJsTj49p4KWzIzA7vTBCTYps-6xrG7536zJnmgk_aem_zxhBW4ca0ejN3YDJVPL6QA"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-black py-4 px-8 rounded-2xl transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              Generate Verification Code
            </motion.a>
          </div>
        </div>
        
        <div className="hidden md:block">
          <CalculationAnimation />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
