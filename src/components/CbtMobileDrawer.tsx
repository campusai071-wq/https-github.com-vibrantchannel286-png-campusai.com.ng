import React from 'react';
import { X, Bookmark, CheckCircle2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CbtMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Array<{ id: string | number }>;
  answers: Record<string | number, string>;
  bookmarks: Record<string | number, boolean>;
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
  activeSubjectLabel: string;
}

export const CbtMobileDrawer: React.FC<CbtMobileDrawerProps> = ({
  isOpen,
  onClose,
  questions,
  answers,
  bookmarks,
  currentIndex,
  onSelectQuestion,
  activeSubjectLabel,
}) => {
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(bookmarks).filter(Boolean).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm sm:hidden">
          {/* Backdrop dismiss */}
          <div className="flex-1" onClick={onClose} />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-3xl max-h-[75vh] flex flex-col shadow-2xl border-t border-slate-200 overflow-hidden pb-6"
          >
            {/* Sheet Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base capitalize flex items-center gap-2">
                  <span>{activeSubjectLabel} Palette</span>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {answeredCount}/{questions.length}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tap any number to jump directly to that question
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                aria-label="Close question palette"
              >
                <X size={16} />
              </button>
            </div>

            {/* Status Legend */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-around text-[10px] font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
                <span>Flagged ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-900 inline-block" />
                <span>Current</span>
              </div>
            </div>

            {/* Question Bubbles Grid */}
            <div className="p-5 overflow-y-auto max-h-[48vh]">
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = currentIndex === idx;
                  const isFlagged = bookmarks[q.id];

                  let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';
                  if (isCurrent) {
                    btnStyle = 'bg-slate-900 text-white font-black shadow-lg ring-2 ring-emerald-500 border-slate-900';
                  } else if (isAnswered) {
                    btnStyle = 'bg-emerald-500 text-white font-black shadow-sm border-emerald-600';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        onSelectQuestion(idx);
                        onClose();
                      }}
                      className={`h-11 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 ring-2 ring-white flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="px-5 pt-2 flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 text-white text-xs font-extrabold rounded-2xl shadow-md hover:bg-slate-800"
              >
                Back to Exam Question
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
