import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BookOpen, Search, Book, Sparkles, ChevronRight, CheckCircle2, 
  Layers, MessageSquare, ArrowLeft, ArrowUp, ChevronLeft, 
  ListFilter, Grid, RefreshCw, X
} from 'lucide-react';
import { ALL_UTME_SYLLABUSES, UTMESyllabus, SyllabusTopic, searchSyllabuses } from '../data/syllabuses';
import { motion, AnimatePresence } from 'framer-motion';

interface SyllabusExplorerProps {
  onAskAI?: (topicQuery: string) => void;
  onClose?: () => void;
}

export const SyllabusExplorer: React.FC<SyllabusExplorerProps> = ({ onAskAI, onClose }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("chemistry");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<'topics' | 'textbooks' | 'objectives'>('topics');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Mobile page state: 'directory' (select subject) vs 'syllabus' (reading current subject)
  const [mobileView, setMobileView] = useState<'directory' | 'syllabus'>('directory');
  
  // Topic pagination state
  const [topicPage, setTopicPage] = useState<number>(1);
  const [topicSearchQuery, setTopicSearchQuery] = useState("");
  const topicsPerPage = 8;

  const topRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const categories = ["All", "Science", "Commercial", "Social Science", "Arts"];

  const filteredSyllabuses = useMemo(() => {
    let result = ALL_UTME_SYLLABUSES;
    if (selectedCategory !== "All") {
      result = result.filter(s => s.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const matches = searchSyllabuses(searchQuery);
      const matchedIds = new Set(matches.map(m => m.syllabus.id));
      result = result.filter(s => matchedIds.has(s.id));
    }
    return result;
  }, [selectedCategory, searchQuery]);

  const activeSyllabus = useMemo(() => {
    return ALL_UTME_SYLLABUSES.find(s => s.id === selectedSubjectId) || ALL_UTME_SYLLABUSES[0];
  }, [selectedSubjectId]);

  // Reset page when subject or topic search changes
  useEffect(() => {
    setTopicPage(1);
    setExpandedTopicId(null);
  }, [selectedSubjectId, topicSearchQuery]);

  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id);
    setMobileView('syllabus');
    setExpandedTopicId(null);
    setTopicPage(1);
    setTopicSearchQuery("");
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAskAITopic = (topic: SyllabusTopic, subjectName: string) => {
    if (onAskAI) {
      onAskAI(`Explain the UTME syllabus topic '${topic.title}' for ${subjectName}. What key concepts, formulas, or rules must I master for JAMB examination?`);
    }
  };

  // Extract flat list of topics or filtered topics
  const allTopicsForActiveSyllabus = useMemo(() => {
    if (!activeSyllabus) return [];
    let topicsList: { topic: SyllabusTopic; sectionTitle?: string }[] = [];

    if (activeSyllabus.sections) {
      activeSyllabus.sections.forEach(sec => {
        sec.topics.forEach(top => {
          topicsList.push({ topic: top, sectionTitle: sec.title });
        });
      });
    } else if (activeSyllabus.topics) {
      activeSyllabus.topics.forEach(top => {
        topicsList.push({ topic: top });
      });
    }

    if (topicSearchQuery.trim()) {
      const query = topicSearchQuery.toLowerCase();
      topicsList = topicsList.filter(item => 
        item.topic.title.toLowerCase().includes(query) ||
        item.topic.contents.some(c => c.toLowerCase().includes(query)) ||
        item.topic.objectives.some(o => o.toLowerCase().includes(query))
      );
    }

    return topicsList;
  }, [activeSyllabus, topicSearchQuery]);

  const totalTopicPages = Math.ceil(allTopicsForActiveSyllabus.length / topicsPerPage) || 1;
  const paginatedTopics = useMemo(() => {
    const start = (topicPage - 1) * topicsPerPage;
    return allTopicsForActiveSyllabus.slice(start, start + topicsPerPage);
  }, [allTopicsForActiveSyllabus, topicPage]);

  return (
    <div ref={topRef} className="w-full bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[700px] max-w-6xl mx-auto my-4 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-4 md:p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs md:text-sm uppercase tracking-wider mb-1">
            <BookOpen size={18} />
            <span>Official JAMB UTME Syllabus Suite</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30">{ALL_UTME_SYLLABUSES.length} Subjects</span>
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">
            UTME Master Syllabus Explorer
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Official examination syllabus, topic objectives & recommended textbooks verified for 2025/2026 JAMB Candidates.
          </p>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors self-end md:self-auto"
            aria-label="Close Syllabus Explorer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Mobile Screen Breadcrumb Header (Visible on Mobile when reading a Syllabus) */}
      <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
        {mobileView === 'syllabus' ? (
          <>
            <button
              onClick={() => setMobileView('directory')}
              className="flex items-center gap-1.5 text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-xl transition-all"
            >
              <ArrowLeft size={15} />
              <span>All Subjects</span>
            </button>

            {/* Quick Subject Picker Dropdown */}
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSelectSubject(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold rounded-xl px-2 py-1.5 focus:outline-none focus:border-cyan-500 max-w-[180px] truncate"
            >
              {ALL_UTME_SYLLABUSES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.subject} ({s.category})
                </option>
              ))}
            </select>
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Grid size={16} className="text-cyan-400" />
            <span>Select a Subject Syllabus ({filteredSyllabuses.length})</span>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        {/* Sidebar Subject Selection - Shown on Desktop OR on Mobile Page 1 'directory' */}
        <div className={`w-full lg:w-80 bg-slate-950/80 border-r border-slate-800 p-4 flex-col gap-4 flex-shrink-0 ${
          mobileView === 'directory' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search subjects or terms..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedCategory === cat 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Subject List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[480px] lg:max-h-[550px]">
            {filteredSyllabuses.map(syl => {
              const isSelected = syl.id === selectedSubjectId;
              const topicCount = syl.sections 
                ? syl.sections.reduce((acc, sec) => acc + sec.topics.length, 0)
                : (syl.topics?.length || 0);

              return (
                <button
                  key={syl.id}
                  onClick={() => handleSelectSubject(syl.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 border border-cyan-500/50 text-white font-semibold shadow-md' 
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {syl.subject.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium leading-tight">{syl.subject}</div>
                      <div className="text-[11px] text-slate-400 font-normal flex items-center gap-2 mt-0.5">
                        <span>{syl.category}</span>
                        <span>•</span>
                        <span className="text-cyan-400/80">{topicCount} Topics</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className={`transition-transform ${isSelected ? 'translate-x-1 text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}

            {filteredSyllabuses.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-800">
                No matching subjects found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Syllabus Detail Panel - Shown on Desktop OR on Mobile Page 2 'syllabus' */}
        <div className={`flex-1 bg-slate-900/60 p-4 md:p-6 overflow-y-auto flex-col gap-6 ${
          mobileView === 'syllabus' ? 'flex' : 'hidden lg:flex'
        }`}>
          {activeSyllabus && (
            <>
              {/* Subject Header Banner */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-cyan-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {activeSyllabus.category}
                    </span>
                    <span className="text-slate-400 text-xs">2025/2026 JAMB Official Edition</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{activeSyllabus.subject} Syllabus</h3>
                </div>

                {/* Desktop & Mobile Tab Switcher Bar */}
                <div className="w-full md:w-auto flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('topics')}
                    className={`flex-1 md:flex-initial px-3 py-2 rounded-lg transition-all text-center ${
                      activeTab === 'topics' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Topics ({allTopicsForActiveSyllabus.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('objectives')}
                    className={`flex-1 md:flex-initial px-3 py-2 rounded-lg transition-all text-center ${
                      activeTab === 'objectives' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Objectives
                  </button>
                  <button
                    onClick={() => setActiveTab('textbooks')}
                    className={`flex-1 md:flex-initial px-3 py-2 rounded-lg transition-all text-center ${
                      activeTab === 'textbooks' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Texts ({activeSyllabus.recommendedTexts.length})
                  </button>
                </div>
              </div>

              {/* TAB 1: TOPICS & OBJECTIVES WITH PAGINATION & FILTER */}
              {activeTab === 'topics' && (
                <div className="space-y-4">
                  {/* Topic Search & Quick Controls */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        value={topicSearchQuery}
                        onChange={e => setTopicSearchQuery(e.target.value)}
                        placeholder={`Filter topics in ${activeSyllabus.subject}...`}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                      {topicSearchQuery && (
                        <button 
                          onClick={() => setTopicSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-400 font-medium">
                      <span>Showing {paginatedTopics.length} of {allTopicsForActiveSyllabus.length} topics</span>
                      {totalTopicPages > 1 && (
                        <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-cyan-400 font-semibold">
                          Page {topicPage}/{totalTopicPages}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Paginated Topics List */}
                  {paginatedTopics.length > 0 ? (
                    <div className="space-y-3">
                      {paginatedTopics.map((item) => (
                        <div key={item.topic.id} className="space-y-2">
                          {item.sectionTitle && (
                            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border-l-2 border-cyan-500 px-2.5 py-1 rounded-r-md mt-1">
                              {item.sectionTitle}
                            </div>
                          )}
                          <TopicCard 
                            topic={item.topic} 
                            subjectName={activeSyllabus.subject}
                            isExpanded={expandedTopicId === item.topic.id}
                            onToggle={() => setExpandedTopicId(expandedTopicId === item.topic.id ? null : item.topic.id)}
                            onAskAI={handleAskAITopic}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                      <p>No topics found matching "{topicSearchQuery}"</p>
                      <button 
                        onClick={() => setTopicSearchQuery("")} 
                        className="text-cyan-400 underline font-semibold hover:text-cyan-300"
                      >
                        Clear Topic Filter
                      </button>
                    </div>
                  )}

                  {/* Topic Pagination Controls */}
                  {totalTopicPages > 1 && (
                    <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800 mt-4">
                      <button
                        disabled={topicPage <= 1}
                        onClick={() => {
                          setTopicPage(prev => Math.max(1, prev - 1));
                          topRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <ChevronLeft size={16} />
                        <span>Previous Page</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalTopicPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => {
                              setTopicPage(p);
                              topRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                              topicPage === p 
                                ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <button
                        disabled={topicPage >= totalTopicPages}
                        onClick={() => {
                          setTopicPage(prev => Math.min(totalTopicPages, prev + 1));
                          topRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <span>Next Page</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GENERAL OBJECTIVES */}
              {activeTab === 'objectives' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-cyan-400" size={20} />
                    <span>General Examination Objectives</span>
                  </h4>
                  <p className="text-slate-400 text-sm">
                    The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in {activeSyllabus.subject} is to prepare candidates for the Board's examination by testing comprehension of these core competencies:
                  </p>
                  <ul className="space-y-3">
                    {activeSyllabus.generalObjectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 text-sm text-slate-200">
                        <CheckCircle2 size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TAB 3: RECOMMENDED TEXTBOOKS */}
              {activeTab === 'textbooks' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                      <Book className="text-indigo-400" size={20} />
                      <span>JAMB Official Recommended Reading List</span>
                    </h4>
                    <p className="text-slate-400 text-sm">
                      These are the official literature and textbook references approved by the Joint Admissions and Matriculation Board for {activeSyllabus.subject}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSyllabus.recommendedTexts.map((text, idx) => (
                      <div key={idx} className="bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/40 p-4 rounded-xl space-y-2 transition-all group">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-indigo-400 font-semibold">{text.year || 'Standard Edition'}</span>
                        </div>
                        <h5 className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors text-sm">
                          {text.title}
                        </h5>
                        <p className="text-xs text-slate-400">Author: <span className="text-slate-300">{text.author}</span></p>
                        {text.publisher && <p className="text-[11px] text-slate-500">Publisher: {text.publisher}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sticky Navigation Bar (When viewing a syllabus on mobile) */}
      {mobileView === 'syllabus' && (
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-2.5 flex items-center justify-around gap-1 sticky bottom-0 z-30 shadow-2xl">
          <button
            onClick={() => {
              setActiveTab('topics');
              topRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'topics' ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={16} />
            <span>Topics</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('objectives');
              topRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'objectives' ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={16} />
            <span>Objectives</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('textbooks');
              topRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'textbooks' ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Book size={16} />
            <span>Texts</span>
          </button>

          <button
            onClick={() => setMobileView('directory')}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-cyan-300"
          >
            <ArrowLeft size={16} />
            <span>Subjects</span>
          </button>
        </div>
      )}
    </div>
  );
};

interface TopicCardProps {
  topic: SyllabusTopic;
  subjectName: string;
  isExpanded: boolean;
  onToggle: () => void;
  onAskAI: (topic: SyllabusTopic, subjectName: string) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, subjectName, isExpanded, onToggle, onAskAI }) => {
  return (
    <div className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-xl overflow-hidden transition-all">
      <div 
        onClick={onToggle}
        className="p-3.5 md:p-4 cursor-pointer flex items-center justify-between gap-3 select-none hover:bg-slate-900/60 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-400 font-black text-xs flex items-center justify-center border border-slate-700 flex-shrink-0">
            {topic.topicNumber}
          </span>
          <h4 className="text-xs md:text-sm font-bold text-slate-100 truncate">{topic.title}</h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAskAI(topic, subjectName);
            }}
            className="flex items-center gap-1.5 text-[11px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition-colors"
            title="Ask AI Tutor to teach this topic"
          >
            <MessageSquare size={13} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
          <ChevronRight size={18} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-90 text-cyan-400' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-800/80 p-4 bg-slate-900/40 space-y-4 text-xs"
          >
            {/* Topic Contents */}
            <div>
              <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] block mb-1.5">
                TOPICS / CONTENTS / NOTES
              </span>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside pl-1">
                {topic.contents.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            {/* Topic Learning Objectives */}
            <div className="pt-2 border-t border-slate-800/60">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1.5">
                CANDIDATES SHOULD BE ABLE TO (OBJECTIVES)
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {topic.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-400 font-bold mt-0.5">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SyllabusExplorer;
