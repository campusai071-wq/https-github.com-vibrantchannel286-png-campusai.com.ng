
import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, CheckCircle, School, MessageCircle, Sparkles } from 'lucide-react';

interface Feedback {
  id: number;
  name: string;
  school: string;
  department: string;
  content: string;
  rating: number;
  initials: string;
}

const FEEDBACK_DATA: Feedback[] = [
  {
    id: 1,
    name: "Tunde Bakare",
    school: "UNILAG",
    department: "Computer Science",
    content: "The aggregate calculator is the most accurate I've found. It predicted my admission probability perfectly based on the 2025 merit list!",
    rating: 5,
    initials: "TB"
  },
  {
    id: 2,
    name: "Chidi Okechukwu",
    school: "FUTA",
    department: "Mechanical Engineering",
    content: "CampusAI's Pro Vision recognized my JAMB slip instantly. It saved me so much stress trying to figure out if my O-Level combo was right.",
    rating: 5,
    initials: "CO"
  },
  {
    id: 3,
    name: "Amina Yusuf",
    school: "ABU Zaria",
    department: "Medicine & Surgery",
    content: "I asked the AI about the cut-off for Medicine and it gave me the exact figure from the previous 3 sessions. Truly a life-saver for candidates.",
    rating: 5,
    initials: "AY"
  },
  {
    id: 4,
    name: "Blessing Udoh",
    school: "UNIUYO",
    department: "Law",
    content: "The real-time news sync is amazing. I got the Post-UTME notification here even before it was widely shared on social media.",
    rating: 4,
    initials: "BU"
  }
];

const StudentFeedback: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-gray-950 transition-colors relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>
      
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-100 dark:border-emerald-800">
              <MessageCircle size={12} />
              Student Feedback
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              The <span className="text-blue-600 dark:text-cyan-400">CampusAI</span> Success Stories
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-2xl mx-auto">
              Join thousands of students who are using data and AI to secure their future in Nigeria's top institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEEDBACK_DATA.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-2xl transition-all relative"
              >
                <Quote className="absolute top-6 right-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" size={48} />
                
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400" fill="currentColor" />
                  ))}
                </div>

                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed mb-8 italic">
                  "{item.content}"
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
                    {item.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h4>
                      <CheckCircle size={12} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                      <School size={10} />
                      {item.school} • {item.department}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 bg-blue-600 dark:bg-blue-700 rounded-[48px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-xl border border-white/20">
                <Sparkles size={32} className="text-yellow-300" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-1">Your Success is Next.</h3>
                <p className="text-blue-100 text-sm font-medium">Over 50,000 students rely on CampusAI for accurate data.</p>
              </div>
            </div>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_feedback'))}
              className="relative z-10 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-xl"
            >
              Share Your Journey
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentFeedback;
