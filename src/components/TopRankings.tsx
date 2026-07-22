
import React from 'react';
import { Award, TrendingUp, Zap, Star, ChevronRight, Trophy, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface RankingItem {
  rank: number;
  name: string;
  slug: string;
  score: number;
  metric: string;
  motto: string;
}

const TOP_UNIS: RankingItem[] = [
  { rank: 1, name: "University of Ibadan", slug: "ui", score: 98.4, metric: "92% Research Output", motto: "Recte Sapere Fons" },
  { rank: 2, name: "University of Lagos", slug: "unilag", score: 97.2, metric: "95% Employability", motto: "In Deed and in Truth" },
  { rank: 3, name: "Covenant University", slug: "covenant", score: 96.8, metric: "Top Private Uni", motto: "Raising a New Generation of Leaders" },
  { rank: 4, name: "Obafemi Awolowo University", slug: "oau", score: 94.5, metric: "ICT Excellence", motto: "For Learning and Culture" },
  { rank: 5, name: "Ahmadu Bello University", slug: "abu-zaria", score: 93.1, metric: "Northern Hub", motto: "The First in the North" },
  { rank: 6, name: "University of Nigeria, Nsukka", slug: "unn", "score": 92.4, metric: "Lion Pride", motto: "To Restore the Dignity of Man" },
];

interface TopRankingsProps {
  onSelectUni: (slug: string) => void;
}

const TopRankings: React.FC<TopRankingsProps> = ({ onSelectUni }) => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50 transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-yellow-100 dark:border-yellow-800">
                <Trophy size={12} />
                2026 Academic Leaderboard
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                Nigeria's <span className="text-blue-600 dark:text-cyan-400">Elite</span> Institutions
              </h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium text-lg">
                Based on real-time data integration, research impact, and alumni success rates as analyzed by CampusAI.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700"></div>
                ))}
              </div>
              <div className="pr-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Seekers</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">12.5k Students Viewing</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Top 3 Podium */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {TOP_UNIS.slice(0, 3).map((uni) => (
                <motion.button
                  key={uni.slug}
                  whileHover={{ y: -10 }}
                  onClick={() => onSelectUni(uni.slug)}
                  className={`relative flex flex-col items-center p-8 rounded-[40px] border-2 transition-all group overflow-hidden ${
                    uni.rank === 1 
                      ? 'bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 border-yellow-200 dark:border-yellow-800/50 shadow-2xl shadow-yellow-500/10' 
                      : uni.rank === 2
                      ? 'bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-blue-200 dark:border-blue-800/50'
                      : 'bg-gradient-to-b from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 border-orange-200 dark:border-orange-800/50'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${
                    uni.rank === 1 ? 'bg-yellow-400' : uni.rank === 2 ? 'bg-blue-400' : 'bg-orange-400'
                  }`}></div>

                  <div className="relative z-10 mb-6">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-3xl shadow-lg border-2 ${
                      uni.rank === 1 
                        ? 'bg-yellow-400 border-yellow-300 text-yellow-900' 
                        : uni.rank === 2
                        ? 'bg-gray-200 border-white text-gray-700 dark:bg-gray-700 dark:text-gray-100'
                        : 'bg-orange-400 border-orange-300 text-orange-900'
                    }`}>
                      {uni.rank === 1 ? '🥇' : uni.rank === 2 ? '🥈' : '🥉'}
                    </div>
                  </div>

                  <div className="text-center relative z-10">
                    <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                      {uni.name.replace("University of ", "UN").replace("Obafemi Awolowo University", "OAU")}
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 italic">
                      "{uni.motto.split(' ').slice(0, 3).join(' ')}..."
                    </p>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-1.5 py-2 px-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5">
                        <Zap size={12} className="text-yellow-500" />
                        <span className="text-sm font-black text-gray-900 dark:text-white">{uni.score}</span>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">CampusAI Score</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* List Rankings 4-10 */}
            <div className="lg:col-span-5 space-y-4">
              {TOP_UNIS.slice(3).map((uni) => (
                <button
                  key={uni.slug}
                  onClick={() => onSelectUni(uni.slug)}
                  className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-[32px] hover:border-blue-500 dark:hover:border-cyan-500 transition-all group shadow-sm hover:shadow-xl"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center font-black text-gray-400 dark:text-gray-600 border border-gray-100 dark:border-gray-800 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      #{uni.rank}
                    </div>
                    <div className="text-left">
                      <h5 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                        {uni.name}
                      </h5>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        <span className="flex items-center gap-1">
                          <TrendingUp size={10} className="text-emerald-500" />
                          {uni.metric}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </button>
              ))}

              <div className="pt-6">
                 <div className="p-8 bg-blue-600 rounded-[40px] text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <h5 className="text-lg font-black mb-2 flex items-center gap-2">
                       <BookOpen size={20} />
                       How we rank
                    </h5>
                    <p className="text-xs text-blue-100 font-medium leading-relaxed mb-6">
                       Our algorithm evaluates 12 unique factors including faculty-to-student ratio, graduate salary data, and social media sentiment.
                    </p>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full border border-white/20 transition-all">
                       Learn More <ChevronRight size={12} />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopRankings;
