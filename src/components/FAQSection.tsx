
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles, Brain, Target, ShieldCheck, Zap } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'Admission' | 'Academic' | 'Technical' | 'General';
}

const faqs: FAQItem[] = [
  {
    category: 'Admission',
    question: "How can I calculate my 2026 university aggregate score?",
    answer: "To calculate your aggregate score for the 2026 admission cycle, use the Campusai.com.ng predictive engine. Our system automatically applies the latest institutional formulas for Nigerian universities—including the 50/50 JAMB-to-Post-UTME ratio, O’Level point grading, and ELDS (Educationally Less Developed States) quota criteria—while ensuring your results comply with the current 150-score national minimum threshold."
  },
  {
    category: 'Admission',
    question: "What is the JAMB 2026 Registration Deadline?",
    answer: "The JAMB 2026 registration officially ends on February 28, 2026. The Board has explicitly stated there will be NO EXTENSION. Ensure you have your profile code and ePIN before the deadline."
  },
  {
    category: 'Admission',
    question: "How is the 50:30:20 aggregate calculated?",
    answer: "This is common for schools like UNILAG. JAMB (400) is scaled to 50%, Post-UTME (100) to 30%, and O-Level (5 subjects) to 20%. Our Aggregate Calculator handles this automatically for supported schools."
  },
  {
    category: 'Academic',
    question: "How does the CGPA Predictor work?",
    answer: "The predictor uses your current GPA and target grades to calculate the exact performance needed in future semesters to reach your goal. It's a logic-driven tool for academic planning."
  },
  {
    category: 'Technical',
    question: "Is my data secure on CampusAI?",
    answer: "Yes. We use Firebase's secure infrastructure and encrypted local storage. Your academic records and chat history are private and protected by industry-standard security protocols."
  },
  {
    category: 'General',
    question: "What are 'Intelligence Nodes'?",
    answer: "Intelligence Nodes are our AI-powered features. Each node (Chat, News, Calculator) uses specific neural models synchronized with the 2026 Nigerian academic database."
  },
  {
    category: 'General',
    question: "How do I get real-time admission alerts?",
    answer: "You can join our verified WhatsApp Updates Channel for instant notifications on JAMB releases, school updates, and urgent alerts. Look for the 'Join Channel' banner on your dashboard."
  }
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-cyan-400">
            <HelpCircle size={14} /> Knowledge Base
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white">
            Frequently Asked <br /><span className="text-blue-600 dark:text-cyan-400">Questions</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Everything you need to know about the 2026 academic cycle.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-[32px] border transition-all overflow-hidden ${
                openIndex === idx 
                  ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
              }`}
            >
              <button 
                id={`faq-button-${idx}`}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
                aria-expanded={openIndex === idx}
                aria-controls={`faq-answer-${idx}`}
                aria-label={`FAQ Question: ${faq.question}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    openIndex === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {faq.category === 'Admission' && <Target size={20} />}
                    {faq.category === 'Academic' && <Brain size={20} />}
                    {faq.category === 'Technical' && <ShieldCheck size={20} />}
                    {faq.category === 'General' && <Zap size={20} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-cyan-300 mb-1 block">{faq.category}</span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{faq.question}</h3>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === idx ? 180 : 0 }}
                  className="text-gray-400"
                >
                  <ChevronDown size={24} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-button-${idx}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-8 pb-8"
                  >
                    <div className="pt-4 border-t border-blue-100 dark:border-blue-800/50">
                      <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gray-900 rounded-[40px] text-center space-y-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            <Sparkles size={32} className="text-white" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Still have questions?</h3>
          <p className="text-gray-400 font-medium">Our AI Strategist is available 24/7 to help you navigate your academic journey.</p>
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('campusai_open_ai', { detail: 'I have some questions about the 2026 admission cycle.' }));
            }}
            className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-50 transition-all"
          >
            Ask AI Strategist
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
