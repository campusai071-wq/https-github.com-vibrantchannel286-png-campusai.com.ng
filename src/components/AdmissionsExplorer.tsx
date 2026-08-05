import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, School, AlertCircle, Info, CheckCircle2, ChevronRight, Filter, GraduationCap, X, FileText, Calendar, DollarSign } from 'lucide-react';
import { admissionsService } from '../services/admissionsService';
import { MasterCourse, AdmissionInstitution, AdmissionRequirementOverride, AdmissionArticle } from '../types';

interface AdmissionsExplorerProps {
  initialArticleId?: string;
  initialTab?: 'articles' | 'courses' | 'institutions';
}

const AdmissionsExplorer: React.FC<AdmissionsExplorerProps> = ({ initialArticleId, initialTab }) => {
  const [courses, setCourses] = useState<MasterCourse[]>([]);
  const [institutions, setInstitutions] = useState<AdmissionInstitution[]>([]);
  const [articles, setArticles] = useState<AdmissionArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<MasterCourse | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<AdmissionInstitution | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<AdmissionArticle | null>(null);
  const [overrides, setOverrides] = useState<AdmissionRequirementOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'courses' | 'institutions'>('articles');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialArticleId && articles.length > 0) {
      const art = articles.find(a => a.id === initialArticleId || a.slug === initialArticleId);
      if (art) {
        setSelectedArticle(art);
        setActiveTab('articles');
      }
    }
  }, [initialArticleId, articles]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [c, i, a] = await Promise.all([
          admissionsService.getAllMasterCourses(),
          admissionsService.getAllInstitutions(),
          admissionsService.getAllAdmissionArticles()
        ]);
        setCourses(c);
        setInstitutions(i);
        setArticles(a);
      } catch (err) {
        console.error("Error loading admissions data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedInstitution) {
      const fetchOverrides = async () => {
        const o = await admissionsService.getOverrides(selectedInstitution.id, selectedCourse.id);
        setOverrides(o);
      };
      fetchOverrides();
    } else {
      setOverrides([]);
    }
  }, [selectedCourse, selectedInstitution]);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => 
      (c.courseName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (c.faculty || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );
  }, [courses, searchQuery]);

  const filteredInstitutions = useMemo(() => {
    return institutions.filter(i => 
      (i.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (i.state || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );
  }, [institutions, searchQuery]);

  const filteredArticles = useMemo(() => {
    return articles.filter(a => 
      (a.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (a.category || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      a.keywords?.some(k => (k || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
    );
  }, [articles, searchQuery]);

  const handleReset = () => {
    setSelectedCourse(null);
    setSelectedInstitution(null);
    setSelectedArticle(null);
    setSearchQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter">
          Admissions <span className="text-blue-500">Knowledge Base</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
          Official JAMB-compliant requirements, subject combinations, and institution-specific special considerations for the 2026 cycle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Search & Selector Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex gap-2 mb-6 bg-gray-950 p-1 rounded-2xl">
              <button 
                onClick={() => setActiveTab('articles')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'articles' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                Articles
              </button>
              <button 
                onClick={() => setActiveTab('courses')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'courses' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                Courses
              </button>
              <button 
                onClick={() => setActiveTab('institutions')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'institutions' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                Institutions
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-800/50 rounded-2xl animate-pulse" />
                ))
              ) : activeTab === 'articles' ? (
                filteredArticles.map((article, index) => (
                  <button
                    key={`${article.id}-${index}`}
                    onClick={() => { setSelectedArticle(article); setSelectedCourse(null); setSelectedInstitution(null); }}
                    className={`w-full text-left p-4 rounded-2xl transition-all group border ${selectedArticle?.id === article.id ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-gray-950/50 border-gray-800/50 hover:border-gray-700 hover:bg-gray-800/50'}`}
                  >
                    <p className={`text-sm font-bold leading-tight mb-1 ${selectedArticle?.id === article.id ? 'text-indigo-400' : 'text-gray-200 group-hover:text-white'}`}>{article.title}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{article.category}</span>
                      {article.institution && <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[150px]">{article.institution}</span>}
                    </div>
                  </button>
                ))
              ) : activeTab === 'courses' ? (
                filteredCourses.map((course, index) => (
                  <button
                    key={`${course.id}-${index}`}
                    onClick={() => { setSelectedCourse(course); setSelectedArticle(null); }}
                    className={`w-full text-left p-4 rounded-2xl transition-all group border ${selectedCourse?.id === course.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-gray-950/50 border-gray-800/50 hover:border-gray-700 hover:bg-gray-800/50'}`}
                  >
                    <p className={`text-sm font-bold ${selectedCourse?.id === course.id ? 'text-blue-400' : 'text-gray-200'}`}>{course.courseName}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{course.faculty || 'General'}</p>
                  </button>
                ))
              ) : (
                filteredInstitutions.map((inst, index) => (
                  <button
                    key={`${inst.id}-${index}`}
                    onClick={() => { setSelectedInstitution(inst); setSelectedArticle(null); }}
                    className={`w-full text-left p-4 rounded-2xl transition-all group border ${selectedInstitution?.id === inst.id ? 'bg-emerald-600/10 border-emerald-500/50' : 'bg-gray-950/50 border-gray-800/50 hover:border-gray-700 hover:bg-gray-800/50'}`}
                  >
                    <p className={`text-sm font-bold ${selectedInstitution?.id === inst.id ? 'text-emerald-400' : 'text-gray-200'}`}>{inst.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{inst.state} • {inst.type}</p>
                  </button>
                ))
              )}
              {((activeTab === 'courses' && filteredCourses.length === 0) || (activeTab === 'institutions' && filteredInstitutions.length === 0) || (activeTab === 'articles' && filteredArticles.length === 0)) && !loading && (
                <div className="text-center py-12 px-6">
                  <Info className="mx-auto text-blue-500/50 mb-4" size={32} />
                  <p className="text-gray-200 text-sm font-bold mb-2">Knowledge Base Empty</p>
                  <p className="text-gray-500 text-xs leading-relaxed mb-6">
                    This is a new feature. You need to import course data from IBASS or use the seeder tool.
                  </p>
                  <a 
                    href="/dashboard?tab=admissions_kb"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Go to Admin Seeder
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Display Panel */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!selectedCourse && !selectedInstitution && !selectedArticle ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full bg-gray-900/30 border border-dashed border-gray-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[500px]"
              >
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-4">
                  <GraduationCap size={40} />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Select an item to view</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Choose an article, course, or institution from the left to explore detailed requirements and intelligence.
                </p>
              </motion.div>
            ) : selectedArticle ? (
              <motion.div 
                key={selectedArticle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl"
              >
                {/* Article Header */}
                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 border-b border-gray-800 relative">
                  <button 
                    onClick={handleReset}
                    className="absolute top-4 right-4 p-2 bg-gray-950/50 hover:bg-gray-800 text-gray-400 rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20 shrink-0">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                        {selectedArticle.title}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-3 py-1 bg-gray-950/50 border border-gray-800 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
                          {selectedArticle.category}
                        </span>
                        {selectedArticle.institution && (
                          <span className="px-3 py-1 bg-gray-950/50 border border-gray-800 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {selectedArticle.institution}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Summary */}
                  <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl text-indigo-100/80 leading-relaxed text-sm">
                    {selectedArticle.summary}
                  </div>

                  {/* Content */}
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Overview</h4>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedArticle.content}
                    </p>
                  </div>

                  {/* Requirements & Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {selectedArticle.requirements && selectedArticle.requirements.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <CheckCircle2 size={14} /> Requirements
                        </h4>
                        <ul className="space-y-3">
                          {selectedArticle.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                              <span className="leading-relaxed">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedArticle.steps && selectedArticle.steps.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Filter size={14} /> Action Steps
                        </h4>
                        <ol className="space-y-3">
                          {selectedArticle.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                              <span className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* Dates & Fees */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {selectedArticle.important_dates && selectedArticle.important_dates.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Calendar size={14} /> Important Dates
                        </h4>
                        <div className="space-y-3">
                          {selectedArticle.important_dates.map((d, i) => (
                            <div key={i} className="p-3 bg-gray-950/50 border border-gray-800 rounded-xl">
                              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{d.event}</p>
                              <p className="text-sm text-gray-300">{d.date}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedArticle.fees && selectedArticle.fees.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <DollarSign size={14} /> Official Fees
                        </h4>
                        <div className="space-y-3">
                          {selectedArticle.fees.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-950/50 border border-gray-800 rounded-xl">
                              <p className="text-xs text-gray-400">{f.item}</p>
                              <p className="text-sm font-bold text-gray-200 text-right ml-4">{f.amount}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FAQ */}
                  {selectedArticle.faq && selectedArticle.faq.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Info size={14} /> Frequently Asked Questions
                      </h4>
                      <div className="space-y-4">
                        {selectedArticle.faq.map((faq, i) => (
                          <div key={i} className="p-4 bg-gray-950/50 border border-gray-800 rounded-2xl">
                            <p className="text-sm font-bold text-gray-200 mb-2">{faq.question}</p>
                            <p className="text-sm text-gray-400 leading-relaxed">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedArticle.notes && (
                    <div className="mt-8 pt-6 border-t border-gray-800">
                      <p className="text-[10px] font-mono text-gray-500">
                        <strong className="text-gray-400">Editor Note:</strong> {selectedArticle.notes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedCourse?.id || selectedInstitution?.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 border-b border-gray-800 relative">
                  <button 
                    onClick={handleReset}
                    className="absolute top-4 right-4 p-2 bg-gray-950/50 hover:bg-gray-800 text-gray-400 rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                      {selectedCourse ? <BookOpen size={24} /> : <School size={24} />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">
                        {selectedCourse ? selectedCourse.courseName : selectedInstitution?.name}
                      </h2>
                      <p className="text-xs text-gray-400 mt-2 font-medium tracking-wide">
                        {selectedCourse ? `FACULTY OF ${selectedCourse.faculty?.toUpperCase() || 'GENERAL STUDIES'}` : `${selectedInstitution?.type} • ${selectedInstitution?.category} • ${selectedInstitution?.state}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {selectedCourse && (
                    <>
                      {/* UTME Subjects */}
                      <div>
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <CheckCircle2 size={14} /> UTME Subject Combination
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCourse.utmeSubjects?.map((sub, i) => (
                            <span key={i} className="px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs font-bold text-gray-300">
                              {sub}
                            </span>
                          ))}
                          {(!selectedCourse.utmeSubjects || selectedCourse.utmeSubjects.length === 0) && (
                            <p className="text-gray-500 text-xs italic">Baseline subject info not set. Usually English + 3 relevant subjects.</p>
                          )}
                        </div>
                      </div>

                      {/* O'Level Requirements */}
                      <div>
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <CheckCircle2 size={14} /> O'Level Credits Required
                        </h4>
                        <ul className="space-y-2">
                          {selectedCourse.olevelRequirements?.map((req, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                              {req}
                            </li>
                          ))}
                          {(!selectedCourse.olevelRequirements || selectedCourse.olevelRequirements.length === 0) && (
                            <li className="text-gray-500 text-xs italic">5 SSCE credits including English and Mathematics.</li>
                          )}
                        </ul>
                      </div>

                      {/* Direct Entry */}
                      {selectedCourse.directEntryRequirements && (
                        <div>
                          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <GraduationCap size={14} /> Direct Entry Baseline
                          </h4>
                          <div className="p-4 bg-gray-950/50 border border-gray-800 rounded-2xl text-xs text-gray-400 leading-relaxed">
                            {selectedCourse.directEntryRequirements}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedInstitution && (
                    <div>
                      <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Filter size={14} /> Available Courses
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedInstitution.courses?.map((cName, i) => (
                          <button 
                            key={i}
                            onClick={() => {
                              const found = courses.find(c => c.courseName === cName);
                              if (found) setSelectedCourse(found);
                            }}
                            className="text-left p-3 bg-gray-950/50 border border-gray-800 rounded-xl text-xs text-gray-400 hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center justify-between"
                          >
                            {cName}
                            <ChevronRight size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Considerations / Overrides */}
                  {selectedCourse && selectedInstitution && (
                    <div className="mt-12 pt-8 border-t border-gray-800">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <AlertCircle size={14} /> Special Considerations
                        </h4>
                        <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {selectedInstitution.name}
                        </span>
                      </div>
                      
                      {overrides.length > 0 ? (
                        <div className="space-y-4">
                          {overrides.map(ov => (
                            <div key={ov.id} className="p-5 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                              <p className="text-[10px] font-black text-orange-500 uppercase mb-2">{ov.type} Override</p>
                              <p className="text-sm text-gray-300 leading-relaxed">{ov.requirementText}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
                          <p className="text-xs text-emerald-500 font-bold mb-1">Standard Requirements Apply</p>
                          <p className="text-[10px] text-gray-500">This institution follows the standard JAMB baseline for this course.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Tips Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-[32px] space-y-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <Info size={20} />
          </div>
          <h4 className="text-sm font-bold text-white">Course by Course</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Requirements are defined per course. Start by picking your intended programme to see the national baseline.
          </p>
        </div>
        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-[32px] space-y-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
            <Filter size={20} />
          </div>
          <h4 className="text-sm font-bold text-white">Waivers & Variants</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Select both a course AND a school to reveal institution-specific waivers or special subject considerations.
          </p>
        </div>
        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-[32px] space-y-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
            <AlertCircle size={20} />
          </div>
          <h4 className="text-sm font-bold text-white">Always Verify</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            While we source from official JAMB documents, always cross-check with the institution's official portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsExplorer;
