import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Calculator, MapPin, Globe, MessageSquare, Wallet, 
  ChevronLeft, ChevronRight, CheckCircle2, Database, Bell, ShieldCheck 
} from 'lucide-react';

interface TourProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tour: React.FC<TourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('campusai_has_seen_tour', 'true');
    onClose();
  };

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  // Core definitions for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return {
          icon: <Sparkles className="text-blue-600 animate-pulse" size={40} />,
          title: "Welcome to Campusai.com.ng!",
          subtitle: "Your AI-powered admission assistant",
          description: "We're here to help you find the perfect university program in Nigeria. Let's take a quick tour of the key features.",
          highlights: [
            "Calculate your admission aggregate scores",
            "Automatically verify Catchment Area guidelines",
            "Simulate statutory ELDS Quota advantages",
            "Track realistic campus tuitions & living costs",
            "Chat 24/7 with our live AI support drawer"
          ]
        };
      case 2:
        return {
          icon: <Calculator className="text-blue-500" size={40} />,
          title: "Cutoff Calculator",
          subtitle: "Dynamic admission formulas",
          description: "Instantly calculate your accurate aggregate marks complying with official 2026 guidelines. Enter your JAMB score, O'Level, and Post-UTME marks.",
          highlights: [
            "Applies 50/50, 60/40, or custom exams ratio",
            "Auto-compares your score against the latest departmental cutoff benchmarks",
            "Interactive charts track your target chances and historic cutoff margins"
          ]
        };
      case 3:
        return {
          icon: <Database className="text-cyan-500" size={40} />,
          title: "Course & Cutoff Handbook",
          subtitle: "Direct Accredited Catalogue",
          description: "Skip calculations entirely by exploring static accredited courses, estimated tuitions, and official cutoff benchmarks.",
          highlights: [
            "Lists accredited undergraduate programmes",
            "Estimated 2026 fresher costs and living guides",
            "Frictionless Sync: Tap 'Load' to instantly transfer school criteria into the calculator!"
          ]
        };
      case 4:
        return {
          icon: <MapPin className="text-orange-500" size={40} />,
          title: "Catchment Area Finder",
          subtitle: "Localized merit rules",
          description: "Many federal and state institutions offer localized cutoff reductions for candidate origins nearby.",
          highlights: [
            "Checks if your state is a preferred catchment",
            "Finds reduction points for localized quotas",
            "Increases admission rate suggestions by 25%"
          ]
        };
      case 5:
        return {
          icon: <Globe className="text-indigo-600" size={40} />,
          title: "ELDS Quotas",
          subtitle: "Educationally less developed states",
          description: "Candidates from ELDS regions can get bypass privileges against general strict merit boundaries.",
          highlights: [
            "Applies statutory policies for ELDS lists",
            "Covers states like Bayelsa, Ebonyi, Gombe, Sokoto, etc.",
            "Visualiza real lower boundary advantages"
          ]
        };
      case 6:
        return {
          icon: <MessageSquare className="text-emerald-500" size={40} />,
          title: "Interactive Live Chat",
          subtitle: "24/7 Academic companion",
          description: "Stuck with custom requirements, JAMB CAPS procedures, or subject combinations? Talk to the strategist model.",
          highlights: [
            "Tap the circular AI chat icon on any screen",
            "Answers specific state eligibility questions",
            "Saves history so you don't lose key guidelines"
          ]
        };
      case 7:
        return {
          icon: <Bell className="text-red-500 animate-bounce" size={40} />,
          title: "Verified News Updates",
          subtitle: "Instant Desktop & Mobile Alerts",
          description: "Stay ahead of every critical update. We track and verify official announcements so you are always the first to know.",
          highlights: [
            "Real-time notifications for official JAMB and UTME releases",
            "Instant warnings on strike updates (ASUU/NASU status)",
            "Automatic real-time background syncs every 12 hours",
            "Join our WhatsApp channel for instant mobile alerts"
          ]
        };
      case 8:
        return {
          icon: <ShieldCheck className="text-teal-500" size={40} />,
          title: "Post-UTME Release Hub",
          subtitle: "Live admission forms & results tracker",
          description: "Never miss an official screening timeline. Check registration portals, exam dates, direct links, and eligibility requirements in real-time.",
          highlights: [
            "Real-time tracking of active Post-UTME portals and cutoff scores",
            "Automated live verification powered by Gemini AI",
            "Instant checklist for requirements and registration steps"
          ]
        };
      case 9:
        return {
          icon: <Wallet className="text-purple-600" size={40} />,
          title: "Academic Budgets & Costs",
          subtitle: "True inflation estimates",
          description: "Higher education has become expensive. Avoid surprises by viewing realistic fresher tuitions and living logs.",
          highlights: [
            "Rejects outdated pre-inflation fees tables",
            "Breaks down hostel, transport, & feeding indexes",
            "Tailored precisely to the specific campus city"
          ]
        };
      default:
        return {
          icon: <Sparkles className="text-blue-600" size={40} />,
          title: "Welcome to Campusai.com.ng!",
          subtitle: "Your AI-powered admission assistant",
          description: "Start exploring our features.",
          highlights: []
        };
    }
  };

  const stepDetails = renderStepContent();

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Absolute Backdrop with blur */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={handleComplete} 
        className="absolute inset-0 bg-black/70 backdrop-blur-md" 
      />

      {/* Main Dialog Panel */}
      <motion.div 
        initial={{ scale: 0.9, y: 30, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
      >
        {/* Header decoration */}
        <div className="p-8 flex items-start gap-4 pb-4">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/40 rounded-3xl flex items-center justify-center shrink-0">
            {stepDetails.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {stepDetails.title}
            </h3>
            <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400">
              {stepDetails.subtitle}
            </p>
          </div>
          <button 
            onClick={handleComplete} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar Header */}
        <div className="px-8 pb-4">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs md:text-sm font-black text-blue-600 dark:text-blue-400">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs md:text-sm font-black text-gray-500 dark:text-gray-400">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ type: 'spring', stiffness: 80 }}
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
            />
          </div>
        </div>

        {/* Dynamic Card Content Box */}
        <div className="px-8 pb-8">
          <div className="p-6 bg-gray-50 dark:bg-gray-850/60 rounded-[30px] border border-gray-100 dark:border-gray-800 space-y-5">
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
              {stepDetails.description}
            </p>

            {stepDetails.highlights.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  What you can do:
                </p>
                <ul className="space-y-2.5">
                  {stepDetails.highlights.map((item, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2.5 text-xs md:text-[13px] text-gray-700 dark:text-gray-300 font-bold leading-normal"
                    >
                      <CheckCircle2 className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={16} />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950/40 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between gap-4">
          <button 
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
              currentStep === 1 
                ? 'opacity-40 cursor-not-allowed text-gray-400' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-gray-800 active:scale-95'
            }`}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <button 
            onClick={handleComplete}
            className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-450 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Skip Tour
          </button>

          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-400 text-white rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-md transition-all active:scale-95"
          >
            {currentStep === totalSteps ? (
              <>Finish Tour <CheckCircle2 size={16} /></>
            ) : (
              <>Next <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Tour;
