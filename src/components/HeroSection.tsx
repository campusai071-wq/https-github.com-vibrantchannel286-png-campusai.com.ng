import React from 'react';
import { motion } from 'framer-motion';
import CalculationAnimation from './CalculationAnimation';

interface HeroSectionProps {
  user: any;
  onLaunchCalculator: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  badgeText?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  user, 
  onLaunchCalculator, 
  title, 
  subtitle,
  badgeText = "Nigeria's Admission Intelligence"
}) => {
  return (
    <div className="relative pt-24 pb-20 overflow-hidden bg-gray-950">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-900/30 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-900/20 rounded-full blur-[128px] transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 md:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-widest text-blue-400 uppercase border border-blue-400/20 rounded-full bg-blue-400/5"
          >
            {badgeText}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-[1.1] text-white"
          >
            {title || (
              <>Check Your <span className="text-blue-500">2026 Admission</span><br/>Chances</>
            )}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="text-base md:text-xl text-gray-400 mb-10 leading-relaxed"
          >
            {subtitle || "Nigeria's most accurate AI admission strategist. Real-time aggregate calculation and merit probability mapping for your success."}
          </motion.p>
          
          <div className="flex justify-start gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLaunchCalculator}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-600/20 text-sm uppercase tracking-widest"
            >
              Launch Calculator
            </motion.button>
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
