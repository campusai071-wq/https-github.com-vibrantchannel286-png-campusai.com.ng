import React from 'react';
import InviteEarn from './InviteEarn';
import SEO from './SEO';
import CutoffCalculator from './CutoffCalculator';
import NewsGrid from './NewsGrid';
import PolicySection from './PolicySection';
import RecentActivity from './RecentActivity';
import FAQSection from './FAQSection';
import PostUtmeTrackerSection from './PostUtmeTrackerSection';
import { FileCheck, ArrowRight } from 'lucide-react';

import { motion } from 'framer-motion';
import { NewsItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { useStandalone } from '../hooks/useStandalone';

import HeroSection from './HeroSection';

interface DashboardProps {
  user: any;
  onLoginRequest: () => void;
  onScholarPackRequest: () => void;
  onReadArticle: (article: NewsItem) => void;
  onNavigateToCalculator?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLoginRequest, onScholarPackRequest, onReadArticle, onNavigateToCalculator }) => {
  const navigate = useNavigate();
  const isStandalone = useStandalone();

  return (
    <div className="pb-10">
      <SEO />
      <HeroSection 
        user={user} 
        badgeText={`Welcome back, ${user?.displayName?.split(' ')[0] || 'Scholar'}`}
        title={<>Your <span className="text-blue-500">Admission</span> Dashboard</>}
        subtitle="Your AI admission strategist is active. Use the tools below to calculate your aggregate and track your chances."
        onLaunchCalculator={() => {
          if (onNavigateToCalculator) {
            onNavigateToCalculator();
          } else {
            navigate('/calculator');
          }
        }}
      />

      <div id="calculator-section" className="container mx-auto px-4 md:px-8 mt-6 relative z-20 max-w-4xl">
        <div className="flex justify-end mb-4 gap-2">
          <button
            onClick={() => window.dispatchEvent(new Event('campusai_trigger_install'))}
            className="text-xs bg-gray-700 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-colors"
          >
            Download App
          </button>
          {user?.is_premium ? (
            <div className="text-xs bg-green-900/30 text-green-400 border border-green-500/30 px-4 py-2 rounded-full font-bold">
              Scholar Pack Active
            </div>
          ) : (
            <button 
              onClick={onScholarPackRequest}
              className="text-xs bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors"
            >
              Activate Scholar Pack
            </button>
          )}
        </div>
        {user && (
          <div className="mt-12">
            <InviteEarn user={user} />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 md:px-8 mb-16 mt-16 max-w-6xl space-y-12">
        {user && <RecentActivity userId={user?.uid || null} />}
        
        {/* Live Post-UTME Release Tracker Section directly on Dashboard */}
        <PostUtmeTrackerSection 
          compact={true}
          onNavigateToFullHub={() => {
            navigate('/admissions');
            window.scrollTo(0, 0);
          }}
          onSelectSchool={(schoolName) => {
            navigate('/universities', { state: { search: schoolName } });
            window.scrollTo(0, 0);
          }}
        />

        {/* Admission Clearance Banner Teaser */}
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-gray-900/40 border border-blue-500/20 rounded-[28px] p-6 md:p-8 text-left relative overflow-hidden shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
              <FileCheck size={14} /> 2026/2027 Clearance Hub
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Post-Admission Clearance & Document Checklist
            </h3>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              Admitted on JAMB CAPS? Prepare every required document before physical screening—JAMB admission letter, statement of result, medical fitness certificate, and state of origin.
            </p>
          </div>
          <button
            onClick={() => {
              navigate('/admission-checklist');
              window.scrollTo(0, 0);
            }}
            className="shrink-0 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            Open Clearance Checklist <ArrowRight size={16} />
          </button>
        </div>
      </div>


      {/* FAQ block — back to centered */}
      <div className="mt-24 px-4 md:px-8">
        <div className="text-left p-6 md:p-8 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[32px] max-w-2xl mx-auto space-y-4">
          <h2 className="text-sm md:text-base font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            💡 How can I calculate my 2026 university aggregate score?
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            To calculate your aggregate score for the 2026 admission cycle, use the CampusAI.ng predictive engine. Our system automatically applies the latest institutional formulas for Nigerian universities—including the 50/50 JAMB-to-Post-UTME ratio, O'Level point grading, and ELDS (Educationally Less Developed States) quota criteria—while ensuring your results comply with the current 150-score national minimum threshold. You can also use our Custom Formula Mode to manually define your own aggregate percentage ratio if your institution's formula isn't listed.
          </p>
        </div>
      </div>

      <PolicySection />

      <div id="news" className="container mx-auto px-4 md:px-8 py-16">
        <NewsGrid 
          user={user} 
          onReadArticle={onReadArticle} 
          onDiscussAi={(news) => {
            if (user) {
              window.dispatchEvent(new CustomEvent('campusai_open_ai', { 
                detail: `I want to discuss the news report: "${news?.title}". Let's chat about what this means for my aggregate and cutoff requirements.` 
              }));
            } else {
              onLoginRequest();
            }
          }} 
          onLoginRequest={onLoginRequest} 
          isMiniPreview={true}
        />
      </div>

      <FAQSection />
    </div>
  );
};

export default Dashboard;
