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
  ArrowRight,
  CheckCircle2,
  Newspaper,
  Target,
  ExternalLink
} from 'lucide-react';
import CalculationAnimation from './CalculationAnimation';
import { trackCalculatorOpen, trackCbtSessionStarted } from '../services/analytics';

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

  // Close dropdown on outside click or escape key
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
      trackCalculatorOpen({ source: 'hero_primary_cta' });
      onLaunchCalculator();
    } else {
      navigate(path);
      window.scrollTo(0, 0);
    }
  };

  const pathwayCards = [
    {
      title: "Check my admission chances",
      subtitle: "Instant aggregate calculation, probability scoring & historical cutoffs",
      icon: <Target className="w-5 h-5 text-cyan-400" />,
      tag: "Free Calculator",
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      cta: "Calculate Chances",
      action: () => {
        trackCalculatorOpen({ source: 'hero_pathway_card' });
        onLaunchCalculator();
      }
    },
    {
      title: "Practice CBT questions",
      subtitle: "Timed mock exams with past questions and instant step-by-step AI working",
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      tag: "JAMB & Post-UTME",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      cta: "Start Free Mock",
      action: () => {
        trackCbtSessionStarted({ exam_type: 'JAMB', mode: 'pathway_card' });
        navigate('/cbt-simulator');
      }
    },
    {
      title: "Find admission updates",
      subtitle: "Verified Post-UTME screening forms, closing dates & scholarship bulletins",
      icon: <Newspaper className="w-5 h-5 text-amber-400" />,
      tag: "Verified Intelligence",
      badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      cta: "Read Latest News",
      action: () => {
        const newsEl = document.getElementById('news-section');
        if (newsEl) {
          newsEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate('/news');
        }
      }
    }
  ];

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
    <div className="relative pt-24 pb-16 overflow-visible bg-gray-950">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-900/30 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-900/20 rounded-full blur-[128px] transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-14">
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
            
            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-start items-stretch sm:items-center gap-3.5 relative z-30">
              {/* PRIMARY HERO CTA: Calculate Your Aggregate */}
              <div className="relative inline-block text-left" ref={dropdownRef}>
                <div className="flex rounded-2xl shadow-xl shadow-blue-600/30 overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all border border-blue-400/30">
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTool('/calculator')}
                    className="text-white font-black py-4 pl-7 pr-3 text-sm uppercase tracking-wider cursor-pointer flex items-center gap-2.5"
                    aria-label="Calculate Your Aggregate"
                  >
                    <Calculator size={18} className="text-cyan-200" />
                    <span>Calculate Your Aggregate</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                    className="py-4 px-3.5 bg-blue-800/60 hover:bg-blue-800 text-white flex items-center justify-center border-l border-blue-400/30 cursor-pointer transition-colors"
                    title="Choose other tools"
                    aria-label="Toggle other academic tools menu"
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
              
              {/* Secondary Action 1: Sign Up Free */}
              {!user && onSignUpRequest && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onSignUpRequest}
                  className="bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white font-bold py-4 px-6 rounded-2xl transition-all border border-slate-700/80 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  Sign Up Free
                </motion.button>
              )}

              {/* Secondary Action 2: Generate Verification Code */}
              <motion.a 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="https://buyresultsverificationcode.ng/?fbclid=IwY2xjawT83JFwZG9mAWV4dG4DYWVtAjEwAGJyaWQRMVl2M3BqODFFcTUwSGtwbWhzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEe10oz4ePhZXWZvYxSjH_eeJsTj49p4KWzIzA7vTBCTYps-6xrG7536zJnmgk_aem_zxhBW4ca0ejN3YDJVPL6QA"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 font-bold py-4 px-6 rounded-2xl transition-all text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5"
                title="Purchase or generate official WAEC/NECO/NABTEB verification code"
              >
                <span>Generate Verification Code</span>
                <ExternalLink size={13} className="opacity-75" />
              </motion.a>
            </div>
          </div>
          
          <div className="hidden md:block">
            <CalculationAnimation />
          </div>
        </div>

        {/* THREE CLEAR PATHWAY CARDS BELOW HERO */}
        <div className="pt-6 border-t border-slate-800/70">
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <span>Fast-Track Admission Pathways</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pathwayCards.map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                onClick={card.action}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-cyan-900/10"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
                      {card.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {card.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-bold text-slate-300 group-hover:text-cyan-400">
                  <span>{card.cta}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
