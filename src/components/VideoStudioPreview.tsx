
import React from 'react';
import { Video, Sparkles, Film, Wand2, Play, Zap, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const VideoStudioPreview: React.FC = () => {
  const features = [
    { icon: <Film size={14} />, text: "Automated Campus Tours" },
    { icon: <Wand2 size={14} />, text: "AI Admission Reels" },
    { icon: <Zap size={14} />, text: "Dept. Spotlights" }
  ];

  return (
    <section id="video-studio" className="py-20 bg-white dark:bg-gray-950 transition-colors scroll-mt-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gray-900 rounded-[48px] md:rounded-[64px] p-8 md:p-20 overflow-hidden border border-white/5 shadow-2xl min-h-[500px] flex items-center">
            
            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-20">
              <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-white"></div>
              <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-white"></div>
              <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-white"></div>
              <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-white"></div>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
            </div>

            {/* Background Glows */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>

            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10 w-full">
              
              {/* Text Side */}
              <div className="lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-8 border border-white/10">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Coming Soon: Q2 2026
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
                  CampusAI <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Video Studio</span>
                </h2>
                
                <p className="text-gray-400 text-lg font-medium leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                  Turn institutional data into stunning visuals. Create personalized campus reels, virtual department tours, and admission guides automatically.
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-300 hover:border-cyan-500/50 transition-all cursor-default group">
                      <span className="text-cyan-400 group-hover:scale-110 transition-transform">{f.icon}</span>
                      {f.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Box Side */}
              <div className="lg:w-1/2 w-full">
                <div className="relative aspect-video bg-black rounded-[32px] md:rounded-[40px] border border-white/10 shadow-2xl flex items-center justify-center group overflow-hidden">
                  {/* Fake Video Still */}
                  <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale group-hover:scale-105 transition-transform duration-1000"></div>
                  
                  {/* UI Elements */}
                  <div className="absolute top-6 left-6 flex flex-col gap-1 z-30">
                    <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">Veo 3.1 FAST</div>
                    <div className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                       <Sparkles size={10} /> Rendering Engine
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-6 z-30">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white/40 border border-white/10">
                       <Play size={20} />
                    </div>
                  </div>

                  {/* Play Button Center */}
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    className="relative z-30 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 cursor-pointer hover:bg-blue-500 transition-colors"
                  >
                    <Video size={32} fill="currentColor" />
                  </motion.div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-20"></div>
                  <div className="absolute bottom-6 left-6 text-white font-black text-xs uppercase tracking-[0.4em] z-30">
                    Project: UNILAG_Tour.mp4
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-600">
                  <div className="flex items-center gap-1.5"><Info size={12} /> Powered by Veo 3.1</div>
                  <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                  <div className="flex items-center gap-1.5">1080p Generation</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoStudioPreview;
