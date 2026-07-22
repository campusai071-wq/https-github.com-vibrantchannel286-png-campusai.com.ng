import React from 'react';
import { Globe, Shield, Heart, Sparkles, CheckCircle, Quote, Mail, Linkedin, User, Brain, Database, Zap, ShieldCheck, ShieldAlert, XCircle, Check, Info } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-white dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Who We Are */}
          <div className="text-center space-y-6">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">Who We Are</h2>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">Your Admissions Strategist</h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto font-medium">
              <strong>Campusai.com.ng</strong> is an independent Nigerian student technology platform founded in 2026, created and developed by <strong>Emmanuel "Manny" Iweh</strong>, a metallurgical and materials engineering student at the Federal University of Technology, Akure (FUTA).
            </p>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              We focus on building Nigeria's most accurate, real-time aggregate calculation logic, university quota trackers, and AI-powered strategy checklists to guide candidates through their admission journey.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">Founded 2026</div>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">Nigeria-Based</div>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">FUTA Born</div>
            </div>
          </div>

          {/* Our Mission */}
          <div className="bg-gray-50 dark:bg-gray-900 p-8 md:p-12 rounded-[32px] border border-gray-100 dark:border-gray-800">
             <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Our Mission</h3>
             <p className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white leading-relaxed">
               To empower aspiring Nigerian students with verified, transparent, and AI-enhanced intelligence systems to navigate complex university criteria and optimize their admission success.
             </p>
          </div>

          {/* Our Approach */}
          <div className="space-y-8">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] text-center">How CampusAI Operates (Built Honestly)</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  title: "Solo Developer Driven", 
                  desc: "CampusAI is entirely built, designed, and maintained by Manny (Emmanuel Iweh). Being an engineering student at FUTA, he deeply understands the exact hurdles candidates face during registration and screening." 
                },
                { 
                  title: "Algorithmic Verification", 
                  desc: "Instead of employing expensive human departments, we write scripts and leverage advanced AI (like Google Gemini) to scan, clean, and match official bulletins, WAEC grading criteria, and university portals with pinpoint consistency." 
                },
                { 
                  title: "Direct Public Sources", 
                  desc: "All calculations, sittings discounts, and departmental thresholds are derived from official .edu.ng announcements, federal gazettes, and official JAMB CAPS handbooks, keeping everything completely factual." 
                }
              ].map((team) => (
                <div key={team.title} className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">{team.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{team.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Our Standards */}
          <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-800">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Our Verifiable Standards</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Every data point, cutoff record, and institutional parameter within CampusAI is strictly cross-referenced against official university portals (.edu.ng), federal gazettes, and authorized JAMB portals. We maintain an independent data repository to give candidates absolute verification certainty.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;