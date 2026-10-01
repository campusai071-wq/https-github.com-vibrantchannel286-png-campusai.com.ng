import React from 'react';
import SEO from './SEO';
import {
  Brain,
  Calculator,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Target,
  Sparkles,
  Award,
  Globe,
  Users,
  GraduationCap,
  FileCheck,
  Building2,
  Newspaper,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Activity,
  Search,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutSection: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 transition-colors">
      <SEO 
        title="About CampusAI.ng | Nigeria's Academic & Admission Intelligence Platform" 
        description="Learn about CampusAI.ng: Our story, mission, admission intelligence tools, aggregate calculators, JAMB CAPS tracking, and AI-powered academic decision support."
        canonical="/about"
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-blue-900/10 via-emerald-900/5 to-transparent dark:from-blue-950/40 dark:via-gray-950 dark:to-gray-950 border-b border-slate-200/80 dark:border-gray-800/80">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-cyan-400 text-xs font-black uppercase tracking-widest border border-blue-500/20 mb-6">
            <Compass size={14} className="animate-spin-slow" />
            Nigeria’s Academic & Admission Intelligence Platform
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
            About <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">CampusAI.ng</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-4xl mb-8">
            <strong>CampusAI.ng</strong> is a Nigerian education technology platform built to help students navigate one of the most complicated parts of the Nigerian education system: <span className="text-blue-600 dark:text-cyan-400 font-bold">admissions, examinations, academic information, and the decisions that come with them.</span>
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mb-10">
            From JAMB and UTME to Post-UTME, JAMB CAPS, admission lists, school requirements, cut-off marks, eligibility, academic planning, and study preparation, CampusAI brings important information and practical tools together in one place.
          </p>

          {/* Core Mission Callout */}
          <div className="p-6 md:p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xl shadow-slate-900/5 dark:shadow-none space-y-3">
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Target size={15} /> Our Goal is Simple
            </p>
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              &ldquo;Make reliable academic and admission information easier for Nigerian students to find, understand, and use.&rdquo;
            </blockquote>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-2 leading-relaxed">
              CampusAI.ng is built for students who need more than scattered information from social media posts, group chats, search results, or word of mouth. We are building a platform where students can access structured information, calculators, tracking tools, study resources, AI-powered assistance, and admission intelligence designed specifically around the Nigerian education landscape.
            </p>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-900/50">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-10">
          <div>
            <span className="text-xs font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest">Origins & Purpose</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Our Story</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-5 text-sm sm:text-base leading-relaxed">
            <p>
              CampusAI started in <strong>May 2026</strong> with a simple observation: Nigerian students often have to search through multiple platforms, websites, social media pages, school portals, and discussion groups to answer questions that directly affect their academic future.
            </p>

            <div className="p-6 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 my-6">
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <HelpCircle size={16} className="text-blue-500" /> Questions Students Grapple With Every Single Day:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-1 shrink-0" /> What is the current admission status?</div>
                <div className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-1 shrink-0" /> Has my university released its Post-UTME result?</div>
                <div className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-1 shrink-0" /> What is the institution's aggregate calculation method?</div>
                <div className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-1 shrink-0" /> Am I eligible for this course?</div>
                <div className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-1 shrink-0" /> What score do I need to target?</div>
                <div className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-1 shrink-0" /> Has the admission list been released?</div>
                <div className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-1 shrink-0" /> What is happening on JAMB CAPS?</div>
                <div className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-1 shrink-0" /> Which deadlines are approaching?</div>
                <div className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-1 shrink-0" /> How should I prepare for the next examination?</div>
                <div className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-1 shrink-0" /> Where can I find the official information?</div>
              </div>
            </div>

            <p>
              The information may exist, but it is often <strong>fragmented, difficult to interpret, outdated, or mixed with unverified claims</strong>.
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              CampusAI was created to address that problem.
            </p>
            <p>
              Rather than being just another education blog, CampusAI is being developed as a <strong>student-focused academic intelligence platform</strong> combining information, tools, technology, and artificial intelligence.
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-base sm:text-lg">
              We believe students should not have to become expert researchers just to understand what is happening with their admission.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT CAMPUSAI DOES */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-gray-800/80">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">What CampusAI Does</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              CampusAI.ng combines several services into one platform designed around the Nigerian student's academic journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. Admission Intelligence */}
            <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-black">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">1. Admission Intelligence</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Admissions are one of the biggest reasons students need timely and accurate information. CampusAI tracks and organizes admission-related developments across Nigerian institutions including:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 grid grid-cols-2">
                <li>• JAMB admissions</li>
                <li>• JAMB CAPS tracking</li>
                <li>• Post-UTME screening</li>
                <li>• Direct Entry (DE)</li>
                <li>• Merit & supplementary lists</li>
                <li>• Departmental cutoffs</li>
                <li>• Catchment & ELDS quotas</li>
                <li>• Official bulletins</li>
              </ul>
              <p className="text-xs text-slate-500 italic pt-2">
                Instead of forcing students to search through dozens of pages independently, CampusAI turns scattered information into actionable clarity.
              </p>
            </div>

            {/* 2. Admission Calculators */}
            <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <Calculator size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">2. Admission Calculators & Academic Tools</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                CampusAI provides tools that help students understand how their academic results interact with institutional admission requirements:
              </p>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <p><strong>• Aggregate Calculation:</strong> Precise formulas for UNILAG (50:30:20), OAU (50:40:10), UI (50:50), FUTA (75:25), LASU, and 150+ institutions.</p>
                <p><strong>• Cut-Off Analysis:</strong> Compare scores with published merit, catchment, and ELDS requirements.</p>
                <p><strong>• Reverse Target Score Planning:</strong> Work backwards to calculate the UTME or Post-UTME score you need.</p>
                <p><strong>• Eligibility & CGPA Studio:</strong> Review course requirements and monitor semester GPA/CGPA.</p>
              </div>
            </div>

            {/* 3. JAMB & CAPS Intelligence */}
            <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">3. JAMB & CAPS Intelligence</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The Joint Admissions and Matriculation Board plays a central role in undergraduate admissions in Nigeria. CampusAI provides a dedicated live tracker for students following JAMB CAPS:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <li>• Live admission status tracking (AIP, Recommended, Admitted)</li>
                <li>• Institutional approval progress & daily acceptance telemetry</li>
                <li>• CAPS deadlines and outstanding transfer marketplace notifications</li>
              </ul>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-2">
                Our objective is to reduce the gap between official announcements and student understanding.
              </p>
            </div>

            {/* 4. Post-UTME & University Updates */}
            <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">4. Post-UTME & University Updates</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The Nigerian university admission process is not controlled by one single timeline. Different institutions have different schedules, screening methods, and deadlines.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                CampusAI monitors these developments continuously, organizing them around the institutions and students affected by them, directing candidates toward verified official sources.
              </p>
            </div>

            {/* 5. News & Academic Updates */}
            <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black">
                <Newspaper size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">5. News & Academic Updates</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                We publish verified academic and admission updates covering JAMB, Post-UTME, WAEC, NECO, NABTEB, education policy, and student scholarships.
              </p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                We aim to distinguish between confirmed information, developing information, and claims that still require verification.
              </p>
            </div>

            {/* 6. AI-Powered Assistance */}
            <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">6. AI-Powered Academic Assistance</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Through CampusAI’s AI-powered features, students receive personalized guidance with concepts, subject combinations, admission interpretation, and examination goals.
              </p>
              <p className="text-xs text-slate-500 italic">
                The purpose of our AI is not simply to generate answers — it is to help students think, understand, prepare, and make better-informed decisions.
              </p>
            </div>

            {/* 7. CBT & Exam Preparation */}
            <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">7. CBT & Examination Preparation</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Our authentic CBT simulator allows candidates to practice under timed conditions with past UTME and Post-UTME questions, tracking performance and building exam-hall resilience.
              </p>
            </div>

            {/* 8. Study Resources */}
            <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">8. Study Resources & E-Vault</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Connects admission intelligence with academic preparation: access downloadable study materials, official JAMB syllabus breakdowns, and high-yield topic summaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO CAMPUSAI IS FOR */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-gray-800/80 bg-slate-100/50 dark:bg-gray-900/40">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-10">
          <div>
            <span className="text-xs font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest">Audience & Community</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Who CampusAI Is For</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "JAMB UTME Candidates",
                desc: "Preparing for UTME, selecting first-choice institutions, and validating subject combinations.",
                icon: <GraduationCap size={20} className="text-blue-500" />
              },
              {
                title: "Post-UTME Aspirants",
                desc: "Understanding screening procedures, aggregate formulas, departmental benchmarks, and deadlines.",
                icon: <Calculator size={20} className="text-emerald-500" />
              },
              {
                title: "Admission Seekers",
                desc: "Tracking JAMB CAPS, monitoring merit lists, and comparing scores against published cutoffs.",
                icon: <Activity size={20} className="text-amber-500" />
              },
              {
                title: "University Undergraduates",
                desc: "Calculating semester GPA/CGPA, academic planning, and exploring student opportunities.",
                icon: <Award size={20} className="text-indigo-500" />
              },
              {
                title: "Parents & Guardians",
                desc: "Seeking clear, transparent information about the admission process their children are navigating.",
                icon: <Users size={20} className="text-purple-500" />
              },
              {
                title: "Secondary School Students",
                desc: "Preparing early for WAEC, NECO, and transitioning into higher education with clarity.",
                icon: <BookOpen size={20} className="text-cyan-500" />
              }
            ].map((card, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-2">
                <div className="p-2.5 bg-slate-100 dark:bg-gray-800 rounded-xl w-fit">{card.icon}</div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">{card.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR APPROACH TO INFORMATION & SOURCES */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-gray-800/80">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-10">
          <div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Integrity & Reliability</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Our Approach to Information</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-4 text-sm sm:text-base leading-relaxed">
            <p>
              We take accuracy seriously because academic and admission information can directly affect real decisions. A wrong deadline, incorrect aggregate formula, outdated cut-off mark, or unverified announcement can cause confusion and, in some cases, financial or academic loss.
            </p>
            <p>
              For that reason, CampusAI's approach is built around <strong>verification, context, and transparency</strong>. Where possible, we prioritize information from authoritative sources including:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 pb-4 text-xs font-bold text-slate-800 dark:text-slate-200">
              <div className="p-3 bg-slate-100 dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800">• Universities & Polytechnics (.edu.ng)</div>
              <div className="p-3 bg-slate-100 dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800">• Joint Admissions & Matriculation Board (JAMB)</div>
              <div className="p-3 bg-slate-100 dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800">• National Universities Commission (NUC)</div>
              <div className="p-3 bg-slate-100 dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800">• NBTE & NCCE</div>
              <div className="p-3 bg-slate-100 dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800">• Federal Ministry of Education</div>
              <div className="p-3 bg-slate-100 dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800">• WAEC, NECO & NABTEB</div>
            </div>

            <p>
              We also recognize that official information can change — a deadline may be extended, a portal may temporarily close, or a policy may be updated. Therefore, CampusAI aims to <strong>keep students aware of when information has changed and where the latest official confirmation can be found.</strong>
            </p>
          </div>

          {/* Institutional Disclaimer Box */}
          <div className="p-6 md:p-8 bg-amber-500/10 dark:bg-amber-950/20 rounded-3xl border border-amber-500/30 space-y-3">
            <h3 className="text-base font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={18} /> CampusAI Is Not an Admission Office
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              CampusAI is an <strong>independent information and technology platform</strong>. We do not make admission decisions for universities, JAMB, or other educational institutions. We do not control JAMB CAPS, institutional portals, Post-UTME screenings, or official quota allocations. Our calculators and estimates are <strong>decision-support resources</strong> designed to guide preparation. The final authority remains with the respective institution or examination body.
            </p>
          </div>
        </div>
      </section>

      {/* CORE PRINCIPLES */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-900/50">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest">Guiding Philosophy</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Our Core Principles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Student First",
                desc: "Everything starts with a simple question: 'Does this help the student?' We design around the student's journey, not the bureaucracy."
              },
              {
                title: "Accuracy Over Hype",
                desc: "In education, being first is useful; being correct is far more important. We verify before repeating unconfirmed claims."
              },
              {
                title: "Clarity",
                desc: "Admission rules are already complex. We break information down into plain, understandable, and actionable steps."
              },
              {
                title: "Transparency",
                desc: "We clearly distinguish between officially confirmed facts, developing updates, and estimated projections."
              },
              {
                title: "Technology With Purpose",
                desc: "We build AI, search systems, and calculation engines to solve real student problems. Helping students is the destination."
              },
              {
                title: "Accessibility",
                desc: "High-level academic intelligence shouldn't be a privilege. We deliver it via a fast, free digital platform accessible on any device."
              }
            ].map((p, idx) => (
              <div key={idx} className="p-6 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" /> {p.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CAMPUSAI EXISTS & VISION */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-gray-800/80">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Our Purpose</span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Why CampusAI Exists</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The Nigerian education system contains enormous amounts of information. The problem is often not the absence of information — it is the difficulty of <strong>finding the right information, understanding it, verifying it, and knowing what to do with it.</strong>
              </p>
              <div className="p-4 bg-blue-50/80 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/50 space-y-1.5 text-xs font-bold text-blue-900 dark:text-cyan-300">
                <p>• Confusion → <strong>Clarity</strong></p>
                <p>• Scattered information → <strong>Structured intelligence</strong></p>
                <p>• Guesswork → <strong>Better-informed planning</strong></p>
                <p>• Waiting → <strong>Real-time tracking</strong></p>
                <p>• Preparation without direction → <strong>Purposeful preparation</strong></p>
              </div>
            </div>

            <div className="p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={14} /> Long-Term Vision
              </span>
              <h3 className="text-2xl font-black tracking-tight">The Academic Intelligence Layer</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We envision a platform where a student can come to one trusted environment and move seamlessly through every major stage of their academic career:
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-black">
                <span className="px-2.5 py-1 bg-cyan-400 rounded-lg">Discover</span>
                <span className="px-2.5 py-1 bg-emerald-400 rounded-lg">Prepare</span>
                <span className="px-2.5 py-1 bg-amber-400 rounded-lg">Calculate</span>
                <span className="px-2.5 py-1 bg-purple-400 rounded-lg">Apply</span>
                <span className="px-2.5 py-1 bg-blue-400 rounded-lg">Track</span>
                <span className="px-2.5 py-1 bg-rose-400 rounded-lg">Understand</span>
                <span className="px-2.5 py-1 bg-white rounded-lg">Decide</span>
              </div>
              <p className="text-xs text-slate-400 italic">
                From choosing a course to calculating an aggregate score and tracking JAMB CAPS, CampusAI is your digital companion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OUR PROMISE & FOOTER BANNER */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-blue-900/10 dark:to-blue-950/30">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center space-y-8">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-600/30">
            <GraduationCap size={32} />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest">Our Commitment</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Our Promise to Students</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We cannot control when a university releases a result. We cannot decide whether a student receives admission. We cannot change a JAMB deadline. But we can help students <strong>understand what is happening, find the relevant information, prepare better, and make decisions with more context.</strong>
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/calculator"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
            >
              <Calculator size={15} /> Open Aggregate Calculator
            </Link>
            <Link
              to="/jamb-caps"
              className="px-6 py-3.5 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-900 dark:text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all border border-slate-200 dark:border-gray-700 flex items-center gap-2"
            >
              <Activity size={15} className="text-emerald-500" /> Live CAPS Tracker
            </Link>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-gray-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300">CampusAI.ng — Nigeria’s Academic & Admission Intelligence Platform</p>
            <p>Built for students. Built around the Nigerian education system.</p>
            <p className="text-blue-600 dark:text-cyan-400 font-bold">CampusAI.com.ng</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;
