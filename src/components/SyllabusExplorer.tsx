import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Book, Sparkles, ChevronRight, CheckCircle2, FileText, Bookmark, Share2, Layers, Download, MessageSquare, Filter } from 'lucide-react';
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

  const handleAskAITopic = (topic: SyllabusTopic, subjectName: string) => {
    if (onAskAI) {
      onAskAI(`Explain the UTME syllabus topic '${topic.title}' for ${subjectName}. What key concepts, formulas, or rules must I master for JAMB examination?`);
    }
  };

  return (
    <div className="w-full bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[700px] max-w-6xl mx-auto my-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-1">
            <BookOpen size={18} />
            <span>Official JAMB UTME Syllabus Suite</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30">{ALL_UTME_SYLLABUSES.length} Subjects</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            UTME Master Syllabus Explorer
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Official examination syllabus, topic objectives & recommended textbooks verified for 2026/2027 JAMB Candidates.
          </p>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Sidebar Subject Selection */}
        <div className="w-full lg:w-80 bg-slate-950/80 border-r border-slate-800 p-4 flex flex-col gap-4 flex-shrink-0">
          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search topics, terms, or subjects..."
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
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[400px] lg:max-h-[500px]">
            {filteredSyllabuses.map(syl => {
              const isSelected = syl.id === selectedSubjectId;
              return (
                <button
                  key={syl.id}
                  onClick={() => {
                    setSelectedSubjectId(syl.id);
                    setExpandedTopicId(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 border border-cyan-500/50 text-white font-semibold' 
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {syl.subject.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{syl.subject}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{syl.category}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className={`transition-transform ${isSelected ? 'translate-x-1 text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}

            {filteredSyllabuses.length === 0 && (
              <div className="p-4 text-center text-slate-500 text-xs">
                No matching subjects found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Syllabus Detail Panel */}
        <div className="flex-1 bg-slate-900/60 p-6 overflow-y-auto flex flex-col gap-6">
          {activeSyllabus && (
            <>
              {/* Subject Title Banner */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-cyan-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {activeSyllabus.category}
                    </span>
                    <span className="text-slate-400 text-xs">Verified 2026/2027 JAMB Edition</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-1">{activeSyllabus.subject} Syllabus</h3>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('topics')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'topics' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Detailed Topics
                  </button>
                  <button
                    onClick={() => setActiveTab('objectives')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'objectives' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    General Objectives
                  </button>
                  <button
                    onClick={() => setActiveTab('textbooks')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'textbooks' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Recommended Texts ({activeSyllabus.recommendedTexts.length})
                  </button>
                </div>
              </div>

              {/* TAB 1: TOPICS & OBJECTIVES */}
              {activeTab === 'topics' && (
                <div className="space-y-4">
                  {/* Sections or Direct Topics */}
                  {activeSyllabus.sections ? (
                    activeSyllabus.sections.map((section, sIdx) => (
                      <div key={section.id} className="space-y-3">
                        <div className="bg-slate-950/80 border-l-4 border-cyan-500 p-3 rounded-r-xl text-cyan-300 font-bold text-sm tracking-wide flex items-center gap-2">
                          <Layers size={16} />
                          <span>{section.title}</span>
                        </div>
                        <div className="space-y-3 pl-2">
                          {section.topics.map(topic => (
                            <TopicCard 
                              key={topic.id} 
                              topic={topic} 
                              subjectName={activeSyllabus.subject}
                              isExpanded={expandedTopicId === topic.id}
                              onToggle={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)}
                              onAskAI={handleAskAITopic}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    activeSyllabus.topics?.map(topic => (
                      <TopicCard 
                        key={topic.id} 
                        topic={topic} 
                        subjectName={activeSyllabus.subject}
                        isExpanded={expandedTopicId === topic.id}
                        onToggle={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)}
                        onAskAI={handleAskAITopic}
                      />
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: GENERAL OBJECTIVES */}
              {activeTab === 'objectives' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
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
        className="p-4 cursor-pointer flex items-center justify-between gap-4 select-none hover:bg-slate-900/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-400 font-black text-xs flex items-center justify-center border border-slate-700">
            {topic.topicNumber}
          </span>
          <h4 className="text-sm font-bold text-slate-100">{topic.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAskAI(topic, subjectName);
            }}
            className="flex items-center gap-1.5 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition-colors"
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
