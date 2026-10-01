import React, { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface UniversityRankingData {
  rank: number;
  name: string;
  slug: string;
  theRank: string;
  overallScoreBand: string;
  category: 'Federal' | 'Private' | 'State';
  motto: string;
  location: string;
  summary: string;
}

export const RANKING_DATA_2027: Record<string, UniversityRankingData> = {
  covenant: {
    rank: 1,
    name: "Covenant University",
    slug: "covenant",
    theRank: "801–1000",
    overallScoreBand: "36.4–40.1",
    category: "Private",
    motto: "Raising a New Generation of Leaders",
    location: "Ota, Ogun State",
    summary: "A leading private university in Nigeria, recognized for its research quality and industry integration.",
  },
  ui: {
    rank: 2,
    name: "University of Ibadan",
    slug: "ui",
    theRank: "801–1000",
    overallScoreBand: "36.4–40.1",
    category: "Federal",
    motto: "Recte Sapere Fons",
    location: "Ibadan, Oyo State",
    summary: "Nigeria's first university, consistently ranked for its research quality and academic prestige.",
  },
  unilag: {
    rank: 3,
    name: "University of Lagos",
    slug: "unilag",
    theRank: "801–1000",
    overallScoreBand: "36.4–40.1",
    category: "Federal",
    motto: "In Deed and in Truth",
    location: "Akoka, Yaba, Lagos",
    summary: "A premier public research institution at the heart of Nigeria's economic and commercial hub.",
  },
  'abu-zaria': {
    rank: 4,
    name: "Ahmadu Bello University",
    slug: "abu-zaria",
    theRank: "1001–1200",
    overallScoreBand: "33.3–36.3",
    category: "Federal",
    motto: "First in the North",
    location: "Zaria, Kaduna State",
    summary: "Nigeria's second-oldest university and a powerhouse in Agricultural and Engineering sciences.",
  },
  bayero: {
    rank: 5,
    name: "Bayero University",
    slug: "bayero",
    theRank: "1001–1200",
    overallScoreBand: "33.3–36.3",
    category: "Federal",
    motto: "And We Are All Equal",
    location: "Kano, Kano State",
    summary: "A major research institution in Northern Nigeria, strong in medical and pharmaceutical sciences.",
  },
  landmark: {
    rank: 6,
    name: "Landmark University",
    slug: "landmark",
    theRank: "1001–1200",
    overallScoreBand: "33.3–36.3",
    category: "Private",
    motto: "Breaking New Grounds",
    location: "Omu-Aran, Kwara State",
    summary: "An agricultural-focused private university with a commitment to high research quality.",
  },
};

interface TopRankingsProps {
  onSelectUni: (slug: string) => void;
}

const TopRankings: React.FC<TopRankingsProps> = ({ onSelectUni }) => {
  const [selectedUniModal, setSelectedUniModal] = useState<UniversityRankingData | null>(null);
  const topList = Object.values(RANKING_DATA_2027);

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50 transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Times Higher Education <span className="text-blue-600 dark:text-cyan-400">Rankings 2027</span>
            </h2>
            <p className="mt-4 text-gray-500 dark:text-slate-300 font-medium text-lg">
              Objective global university performance metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {topList.slice(0, 3).map((uni) => (
              <motion.div
                key={uni.slug}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedUniModal(uni)}
                className="bg-white dark:bg-gray-800 p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl cursor-pointer text-center"
              >
                <div className="text-4xl mb-4">{uni.rank === 1 ? '🥇' : uni.rank === 2 ? '🥈' : '🥉'}</div>
                <h4 className="font-black text-lg text-gray-900 dark:text-white mb-1">{uni.name}</h4>
                <p className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest mb-4">
                  Rank: {uni.theRank}
                </p>
                <button className="w-full py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-cyan-300 font-bold text-xs rounded-2xl">View Details</button>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4">
            {topList.slice(3).map((uni) => (
              <div
                key={uni.slug}
                onClick={() => setSelectedUniModal(uni)}
                className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-[24px] border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-blue-500"
              >
                <div className="flex items-center gap-4">
                  <span className="font-black text-gray-400">#{uni.rank}</span>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">{uni.name}</h5>
                    <p className="text-xs text-gray-500">Rank: {uni.theRank} • {uni.category}</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            ))}
            
            {/* New "View All Rankings" button */}
            <div className="mt-8 text-center">
              <a 
                href="https://www.campusai.com.ng/news/nigerian-universities-in-the-times-higher-education-world-university-rankings-2027" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl text-sm uppercase tracking-wider hover:bg-gray-700 transition-all"
              >
                View All University Rankings <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedUniModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUniModal(null)} className="fixed inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-white dark:bg-gray-900 p-8 rounded-[32px] max-w-lg w-full">
              <button onClick={() => setSelectedUniModal(null)} className="absolute top-6 right-6 text-gray-400"><X /></button>
              <h3 className="text-2xl font-black mb-2">{selectedUniModal.name}</h3>
              <p className="text-xs text-blue-600 dark:text-cyan-400 font-bold mb-4">World Rank: {selectedUniModal.theRank}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{selectedUniModal.summary}</p>
              <button onClick={() => { setSelectedUniModal(null); onSelectUni(selectedUniModal.slug); }} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl">Open Admission Portal</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TopRankings;
