import React from 'react';
import InviteEarn from './InviteEarn';
import CutoffCalculator from './CutoffCalculator';
import NewsGrid from './NewsGrid';
import PolicySection from './PolicySection';
import RecentActivity from './RecentActivity';
import FAQSection from './FAQSection';
import { AdmissionChecklist } from './AdmissionChecklist';

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

      <div className="container mx-auto px-4 md:px-8 mb-16 mt-16 max-w-5xl space-y-8">
        {user && <RecentActivity userId={user?.uid || null} />}
        <AdmissionChecklist />
      </div>


      {/* FAQ block — back to centered */}
      <div className="mt-24 px-4 md:px-8">
        <div className="text-left p-6 md:p-8 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[32px] max-w-2xl mx-auto space-y-4">
          <h2 className="text-sm md:text-base font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            💡 How can I calculate my 2026 university aggregate score?
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            To calculate your aggregate score for the 2026 admission cycle, use the CampusAI.ng predictive engine. Our system automatically applies the latest institutional formulas for Nigerian universities—including the 50/50 JAMB-to-Post-UTME ratio, O'Level point grading, and ELDS (Educationally Less Developed States) quota criteria—while ensuring your results comply with the current 150-score national minimum threshold.
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
