import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, AlertCircle, Type, FileText, Image as ImageIcon, Link as LinkIcon, Tag, Sparkles } from 'lucide-react';
import { NewsItem, UniversityCategory } from '../types';

interface NewsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsItem | null;
  onSave: (updatedNews: Partial<NewsItem>) => Promise<void>;
}

const NewsEditModal: React.FC<NewsEditModalProps> = ({ isOpen, onClose, news, onSave }) => {
  const [formData, setFormData] = useState<Partial<NewsItem>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || '',
        excerpt: news.excerpt || '',
        fullContent: news.fullContent || '',
        category: news.category || 'National',
        image: news.image || '',
        sourceUrl: news.sourceUrl || '',
        tags: news.tags || [],
      });
    }
  }, [news]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!news) return;
    
    console.log("Saving news with data:", formData);
    setIsSaving(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      console.error("NewsEditModal save error:", err);
      setError(err.message || 'Failed to save news article');
    } finally {
      setIsSaving(false);
    }
  };

  const categories: UniversityCategory[] = ['Federal', 'State', 'Private', 'JAMB', 'Polytechnic', 'COE', 'National', 'Jobs', 'Scholarships', 'NYSC'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Edit News Article</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Article ID: {news?.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-bold animate-shake">
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Metadata */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Type size={12} /> Article Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white"
                    placeholder="Enter article title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={12} /> Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as UniversityCategory })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon size={12} /> Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <LinkIcon size={12} /> Source URL
                  </label>
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={e => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white"
                    placeholder="https://unilag.edu.ng/..."
                  />
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={12} /> Short Excerpt
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.excerpt}
                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white resize-none"
                    placeholder="Brief summary of the news..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={12} /> Full Content (Markdown Supported)
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        const clean = (formData.fullContent || '')
                          .replace(/As a result of Admission into our institution, determined Additional Evidence of requirements following Eastern higher completion milestones.*/gi, '')
                          .replace(/Minimum 135 year incorporating.*/gi, '')
                          .replace(/Candidate unconditional Pl age gorgeous.*/gi, '')
                          .replace(/Timroduce web र DO not written hmm.*/gi, '')
                          .replace(/html At trader injected trades Lil seats.*/gi, '')
                          .replace(/Quick Action Checklist for 2026\/2027 Post-UTME Candidates.*/gi, 'Quick Action Checklist for 2026/2027 Post-UTME Candidates')
                          .replace(/ClassName|className|#html|lmore|Timroduce|hmm|il thereby|dan,K detox|\/|\\|:|\$|र| 준비|準備/gi, ' ')
                          .replace(/[\u0370-\u03FF\u1F00-\u1FFF]/g, '')
                          .replace(/\s\s+/g, ' ')
                          .trim();
                        setFormData({ ...formData, fullContent: clean });
                      }}
                      className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Sparkles size={10} /> Sanitize AI Content
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    required
                    value={formData.fullContent}
                    onChange={e => setFormData({ ...formData, fullContent: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white resize-none font-mono"
                    placeholder="## Introduction\n\nDetailed content goes here..."
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              onClick={handleSubmit}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
            >
              {isSaving ? (
                <>Saving Changes...</>
              ) : (
                <>
                  <Save size={14} /> Update Article
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewsEditModal;
