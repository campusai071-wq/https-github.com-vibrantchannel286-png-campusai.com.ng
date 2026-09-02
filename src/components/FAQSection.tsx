
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles, Brain, Target, ShieldCheck, Zap } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  category: 'Admission' | 'Academic' | 'Technical' | 'General';
}

const faqs: FAQItem[] = [
  {
    category: 'Academic',
    question: "How does the JAMB Target System and Score Gap Analysis work?",
    answer: "The CampusAI Target System allows you to select your dream university (e.g., UNILAG, FUTA, UI) and course of study, then set a target UTME score (e.g., 250). CampusAI automatically compares your current CBT equivalent, computes your score gap, highlights priority subjects, and recommends high-yield focus topics to close the gap."
  },
  {
    category: 'Academic',
    question: "Can I track my monthly exam score improvements over time?",
    answer: "Yes! CampusAI features an interactive Monthly Progress Tracker where you can log and view your score evolution month by month (e.g., August: 178, September: 193, October: 211, November: 228, December: 241) to watch yourself improve steadily toward your admission target."
  },
  {
    category: 'Academic',
    question: "Are CBT practice questions repeated or randomized?",
    answer: "Our CBT Simulator features an advanced randomization and shuffling engine coupled with high-temperature AI fallback generation. This ensures that every time you start a practice test, questions and options are thoroughly shuffled so you never encounter identical question sequences across attempts."
  },
  {
    category: 'General',
    question: "How does the PDF Store & Document Vault work?",
    answer: "The CampusAI PDF Store allows candidates to browse official JAMB syllabuses, Post-UTME past question booklets, and upload custom PDF study notes and result slips. Uploaded files are securely cached and ready for instant preview and download across your devices."
  },
  {
    category: 'Admission',
    question: "How do I verify and upload my O'Level results?",
    answer: (
      <>
        Uploading your WAEC, NECO, or NABTEB results on JAMB CAPS is mandatory for admission. To do this, you must first generate a unique Verification Code using your NIN. This code is required to purchase Result Verification PINs. You can{" "}
        <a 
          href="https://buyresultsverificationcode.ng/?fbclid=IwY2xjawT83JFwZG9mAWV4dG4DYWVtAjEwAGJyaWQRMVl2M3BqODFFcTUwSGtwbWhzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEe10oz4ePhZXWZvYxSjH_eeJsTj49p4KWzIzA7vTBCTYps-6xrG7536zJnmgk_aem_zxhBW4ca0ejN3YDJVPL6QA" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-cyan-400 font-bold hover:underline"
        >
          generate your O'Level Verification Code here
        </a>.
      </>
    )
  },
  {
    category: 'Admission',
    question: "How do I generate a profile code?",
    answer: "Kindly send the acronym NIN, then a space, followed by your 11-digit National Identification Number to 55019 or 66019 in the format below: NIN 00123456789. Note: There should be a space between the word NIN and your 11-digit NIN."
  },
  {
    category: 'Admission',
    question: "How old should I be for me to be eligible?",
    answer: "Only candidates who will be 16 years old by 30th September, 2026/2026, are eligible to apply. Candidates who would be less than 16 years old can only apply for trial mock examination. However, exceptional students who are below 16 can apply and be considered provided they score 80% in the UTME, SSCE and Post-UTME and the exceptional candidates' examination."
  },
  {
    category: 'Admission',
    question: "Can I pay cash for the application documents?",
    answer: "To safeguard candidates from unnecessary exploitation, the Board has maintained its cashless registration regime for the UTME/DE application and other services."
  },
  {
    category: 'Admission',
    question: "How much is the application documents?",
    answer: "For the UTME/DE application, there are four application options: 1. UTME with Mock: N8,700; 2. UTME without Mock: N7,200; 3. Direct Entry (DE): N5,700; 4. Trial-Testing Mock Examination for underage candidates: N3,500."
  },
  {
    category: 'Admission',
    question: "When would the sale of application documents commence?",
    answer: "Monday, 3rd February to Saturday, 8th March."
  },
  {
    category: 'Admission',
    question: "When would the sale of Direct Entry application documents commence?",
    answer: "Saturday, 8th March and end by Monday, 7th April."
  },
  {
    category: 'Admission',
    question: "How do I know the right subject combinations to suit my choice of course/programme?",
    answer: "The IBASS Eligibility Checker provides candidates with the list of available programmes in each tertiary institution as well as UTME subject combinations for each course. It is crucial for all candidates to verify requirements prior to application."
  },
  {
    category: 'Admission',
    question: "What are the necessary documents to bring to register for DE?",
    answer: "At the point of registration, all DE candidates must provide: a) Registration/Matriculation Number of previous school attended where qualification was obtained; b) Course(s); c) Awarding Institution; and d) Year of graduation."
  },
  {
    category: 'Admission',
    question: "Can I register more than once?",
    answer: "Candidates are not permitted to register more than once. In the event of any error during registration, candidates are to seek correction from the Board and not obtain a fresh application document."
  },
  {
    category: 'Technical',
    question: "Can I go to any CBT centre or cybercafé to register?",
    answer: "Registration can only be done at JAMB-approved Computer-Based Testing Centres across the country."
  },
  {
    category: 'General',
    question: "Can I use the same mobile number (SIM) as my sister/brother/parent?",
    answer: "No two candidates can use the same mobile number for registration. Every candidate is required to use a unique phone number (SIM) for registration as this remains your unique identifier for present and future services. It must not be lost, and if lost, must be retrieved immediately."
  },
  {
    category: 'General',
    question: "What is a 'Keep My Number' feature?",
    answer: "This feature is a special service by Telcos that keeps the SIM active even if unused for an initial period of 3 years, renewable afterwards. Contact your telecommunication provider for more info."
  },
  {
    category: 'Admission',
    question: "What do I do after getting my profile code?",
    answer: "Present the profile code at the point of vending e-PIN for the application document (Banks, MMOs, MFBs, USSD). Present the Profile code and e-PIN at any JAMB accredited CBT Centre for registration."
  },
  {
    category: 'Technical',
    question: "My fingers can’t be read by the scanner what do I do?",
    answer: "Candidates with biometric abnormality can only register and sit the examination at the JAMB National Headquarters, Abuja on the last day of the national examination calendar. The Board facilitates travel expenses for concerned candidates."
  },
  {
    category: 'General',
    question: "How do I retrieve a lost profile code / e-PIN?",
    answer: "To retrieve a lost Profile Code, send the word RESEND from the same mobile number to 55019 or 66019. To reset password, send PASSWORD [email address] to 55019 or 66019. If e-PIN is lost, send UTMEPIN to 55019 or 66019."
  },
  {
    category: 'Admission',
    question: "I generated a profile code last year but wasn't admitted, will it still be active?",
    answer: "Kindly refresh the profile code by sending RESEND to either 55019 or 66019 to reactivate the code for new registration."
  },
  {
    category: 'Admission',
    question: "Can foreign candidates purchase application documents?",
    answer: "The Board conducts registration and UTME in Abidjan, Accra, Banjul, Beau, Cotonou, Jeddah, Johannesburg, and London ($50 fee or equivalent). Complete application documents downloaded from JAMB website."
  },
  {
    category: 'General',
    question: "I want to distribute free application documents to prospective applicants, is this possible?",
    answer: "Any philanthropist wishing to distribute free application documents should contact the Board on +2348027641663 or e-mail fabian.benjamin@jamb.gov.ng for special offer."
  },
  {
    category: 'Admission',
    question: "After getting my e-PIN what do I do?",
    answer: "Proceed to any JAMB-accredited CBT centre to complete registration. Present Profile code and e-PIN. Biometrics (all 10 fingers) and photograph will be captured. Ensure details tally with NIN before confirming."
  },
  {
    category: 'Admission',
    question: "What should a candidate provide at the point of registration?",
    answer: "i. Choice of institutions and programmes; ii. Valid functional email; iii. Qualification with grades and dates if not awaiting results; iv. Upload relevant certificates; v. Upload pin for automatic O/L and/or A/L grade upload; vi. UTME subjects and exam towns."
  },
  {
    category: 'Admission',
    question: "I have awaiting result can I still register?",
    answer: "Candidates awaiting results should supply (upload) results online on the JAMB portal as soon as available. No recommendation from any institution will be considered without uploading results."
  },
  {
    category: 'General',
    question: "Are there provisions for People with Disabilities?",
    answer: "Yes. Provisions have been made for candidates with disabilities who indicate their disability at registration. They are assigned to JAMB Equal Opportunity Group (JEOG) centres for special attention."
  },
  {
    category: 'Technical',
    question: "Can I give anyone my profile code or log in details?",
    answer: "Candidates are advised to keep security details (registration numbers, passwords, ATM card numbers, email, e-PINs) strictly private and confidential. No centre is allowed to request or accept a candidate's password."
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
          <p className="text-gray-500 dark:text-slate-300 font-medium text-lg">Everything you need to know about the 2026 academic cycle.</p>
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
                      <p className="text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
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
