import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, User, ShieldCheck } from 'lucide-react';
import { getTestimonials } from '../services/dbService';

const FALLBACK_TESTIMONIALS = [
  {
    name: "Tobi Adebayo",
    role: "2024 UNILAG Aspirant",
    content: "CampusAI accurately predicted my admission probability for Computer Science. The aggregate calculator is the most precise tool I've used so far.",
    rating: 5,
    school: "UNILAG"
  },
  {
    name: "Chiamaka Okeke",
    role: "Medical Student",
    content: "The AI Strategist helped me understand the catchment area advantages for UI. It's like having a personal admission consultant in your pocket.",
    rating: 5,
    school: "University of Ibadan"
  },
  {
    name: "Musa Ibrahim",
    role: "Engineering Applicant",
    content: "I was confused about the Post-UTME scoring for FUTA, but the calculator broke it down perfectly. Highly recommend for any serious 2026 candidate.",
    rating: 5,
    school: "FUTA"
  }
];

const Testimonials: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTestimonials();
        if (res && res.length > 0) {
          setData(res);
        } else {
          setData(FALLBACK_TESTIMONIALS);
        }
      } catch (e) {
        setData(FALLBACK_TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const reviewLink = "https://g.page/r/CSYvNrgamqOHEBM/review";

  return (
    <section className="py-24 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800 mb-6"
          >
            <Star size={14} className="text-blue-600 fill-blue-600" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Scholar Success Stories</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">
            Trusted by Thousands of <span className="text-blue-600">Scholars</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold max-w-2xl mx-auto">
            Join the elite community of students using neural-logic to secure their future in Nigeria's top tertiary institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border border-gray-100 dark:border-gray-800 relative group hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg hover:shadow-2xl shadow-blue-500/5"
            >
              <div className="absolute top-8 right-8 text-blue-600/10 group-hover:text-blue-600/20 transition-colors">
                <Quote size={48} fill="currentColor" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-8 relative z-10">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                  <User size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      {testimonial.name}
                    </h4>
                    <ShieldCheck size={14} className="text-blue-500" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={() => window.open(reviewLink, '_blank')}
            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Leave a Review on Google
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
