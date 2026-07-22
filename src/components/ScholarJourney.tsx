
import React, { useState, useEffect } from 'react';
import { stringify } from '../services/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Flag, Rocket, BookOpen, Search, Landmark, PartyPopper, Trophy, Star, Sparkles, ChevronRight, Wifi, GraduationCap, Briefcase, Microscope, Building, Users, Activity, Share2 } from 'lucide-react';
import { saveJourneyProgress, getLocalProfile, isRealUser } from '../services/userService';
import { UserRole } from '../types';

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PRE_ADMISSION_STEPS: JourneyStep[] = [
  { id: 1, title: "NIN & Profile Code", description: "Generate your NIN and link it to get your profile code.", icon: <Rocket size={20} /> },
  { id: 2, title: "UTME Registration", description: "Purchase e-PIN and visit an accredited CBT centre.", icon: <BookOpen size={20} /> },
  { id: 3, title: "UTME Examination", description: "Prepare hard and sit for the exam.", icon: <Star size={20} /> },
  { id: 4, title: "Post-UTME Screening", description: "Apply for institution internal screening.", icon: <Search size={20} /> },
  { id: 5, title: "CAPS Monitoring", description: "Monitor your JAMB CAPS for admission offer.", icon: <Landmark size={20} /> },
  { id: 6, title: "Gaining Admission", description: "Accept offer and pay acceptance fees.", icon: <Trophy size={20} /> }
];

const IN_CAMPUS_STEPS: JourneyStep[] = [
  { id: 1, title: "Course Registration", description: "Register your courses for the current semester.", icon: <BookOpen size={20} /> },
  { id: 2, title: "Lecture Attendance", description: "Maintain 75% attendance to qualify for exams.", icon: <Users size={20} /> },
  { id: 3, title: "Continuous Assessment", description: "Submit assignments and sit for mid-semester tests.", icon: <Microscope size={20} /> },
  { id: 4, title: "Semester Exams", description: "Final evaluation of your academic performance.", icon: <Star size={20} /> },
  { id: 5, title: "GPA Tracking", description: "Monitor your results and maintain a high CGPA.", icon: <Activity size={20} /> },
  { id: 6, title: "Level Completion", description: "Successfully move to the next academic level.", icon: <Trophy size={20} /> }
];

const GRADUATE_STEPS: JourneyStep[] = [
  { id: 1, title: "Final Clearance", description: "Complete departmental and faculty clearances.", icon: <CheckCircle2 size={20} /> },
  { id: 2, title: "NYSC Mobilization", description: "Register for the National Youth Service Corps.", icon: <Flag size={20} /> },
  { id: 3, title: "NYSC Service Year", description: "Complete your one-year mandatory service.", icon: <Building size={20} /> },
  { id: 4, title: "Job Search", description: "Build your CV and apply for professional roles.", icon: <Briefcase size={20} /> },
  { id: 5, title: "Skill Acquisition", description: "Upskill with relevant certifications.", icon: <Sparkles size={20} /> },
  { id: 6, title: "Career Growth", description: "Achieve professional excellence in your field.", icon: <GraduationCap size={20} /> }
];

const ScholarJourney: React.FC<{ role?: UserRole }> = ({ role = 'Pre-Admission' }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  const steps = role === 'In-Campus' ? IN_CAMPUS_STEPS : role === 'Graduate/Alumni' ? GRADUATE_STEPS : PRE_ADMISSION_STEPS;
  const journeyKey = `campusai_journey_${role.toLowerCase().replace('/', '_')}`;

  const loadProgress = () => {
    const saved = localStorage.getItem(journeyKey);
    if (saved) setCompletedSteps(JSON.parse(saved));
    else setCompletedSteps([]);
    
    const profile = getLocalProfile();
    setIsSynced(isRealUser(profile.uid));
  };

  useEffect(() => {
    loadProgress();
  }, [role]);

  const toggleStep = async (id: number) => {
    let updated: number[];
    if (completedSteps.includes(id)) {
      updated = completedSteps.filter(stepId => stepId !== id);
    } else {
      updated = [...completedSteps, id];
    }
    
    setCompletedSteps(updated);
    localStorage.setItem(journeyKey, stringify(updated));
    
    // Notify other components (like SidePanel)
    window.dispatchEvent(new CustomEvent('campusai_journey_updated'));
    
    const profile = getLocalProfile();
    if (isRealUser(profile.uid)) {
        await saveJourneyProgress(profile.uid, updated);
    }

    if (id === 6 && !completedSteps.includes(6)) {
      setShowCelebration(true);
    }
  };

  const progressPercentage = (completedSteps.length / steps.length) * 100;

  return (
    <section id="roadmap" className="py-24 bg-white dark:bg-gray-950 transition-colors border-b border-gray-100 dark:border-gray-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100 dark:border-blue-800">
              <Flag size={12} />
              {role} Roadmap
            </div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
              Your Scholar <span className="text-blue-600 dark:text-cyan-400">Journey</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
              {role === 'Pre-Admission' ? 'Track your progress from registration to your first day on campus.' : 
               role === 'In-Campus' ? 'Manage your academic milestones and stay on top of your studies.' :
               'Navigate your post-graduation path and career development.'}
            </p>
          </div>

          <div className="mb-12 bg-gray-100 dark:bg-gray-800 h-4 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 p-1">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progressPercentage}%` }}
               className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-500 rounded-full"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step) => {
              const isDone = completedSteps.includes(step.id);
              return (
                <motion.div 
                  key={step.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleStep(step.id)}
                  className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    isDone 
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5' 
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    isDone ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {isDone ? <CheckCircle2 size={24} /> : step.icon}
                  </div>
                  <div>
                    <h4 className={`font-black text-lg ${isDone ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-60' : 'text-gray-900 dark:text-white'}`}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[48px] p-12 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40">
                   <Trophy size={48} />
                </div>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                  MILESTONE REACHED!
                </h3>
                <p className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  You've successfully completed this phase of your journey. <br />
                  <span className="text-blue-600 dark:text-cyan-400">Keep pushing for excellence!</span>
                </p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => setShowCelebration(false)}
                    className="w-full py-5 bg-gray-900 dark:bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                  >
                    Continue Journey
                  </button>
                  <button 
                    onClick={() => {
                      setShowCelebration(false);
                      window.dispatchEvent(new CustomEvent('campusai_open_feedback'));
                    }}
                    className="w-full py-5 bg-emerald-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Share2 size={16} /> Share Your Journey
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ScholarJourney;
