import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeftRight, LayoutList, Table as TableIcon } from 'lucide-react';
import { trackTableHorizontalScroll } from '../services/analytics';

interface ResponsiveMarkdownTableProps {
  children: React.ReactNode;
}

export const ResponsiveMarkdownTable: React.FC<ResponsiveMarkdownTableProps> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const hasTrackedScrollRef = useRef(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const overflow = scrollWidth > clientWidth + 4;
      setIsOverflowing(overflow);
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      if (scrollLeft > 50 && !hasTrackedScrollRef.current) {
        hasTrackedScrollRef.current = true;
        const pct = Math.round(((scrollLeft + clientWidth) / scrollWidth) * 100);
        trackTableHorizontalScroll({
          direction: 'right',
          scroll_percentage: pct,
          table_title: 'article_markdown_table'
        });
      }
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(checkScroll, 300);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [children]);

  const scrollByAmount = (delta: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  return (
    <div className="my-8 rounded-3xl overflow-hidden border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl transition-all">
      {/* Top Banner Notice: Horizontal Scroll & Mobile Guidance */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-blue-900/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="motion-reduce:animate-none animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400"></span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
            Official Data Table
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Card / Table View Switcher */}
          <div className="inline-flex sm:hidden p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Table View"
              className={`px-2 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 transition-all ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <TableIcon size={11} /> Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              aria-label="Card View"
              className={`px-2 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 transition-all ${
                viewMode === 'cards' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <LayoutList size={11} /> Cards
            </button>
          </div>

          {/* Mobile Sideways Scroll Sign with Reduced Motion Support */}
          {viewMode === 'table' && (
            <div 
              onClick={() => scrollByAmount(180)}
              className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all select-none ${
                isOverflowing 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 motion-reduce:animate-none animate-pulse' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
              title="Click or swipe to scroll table"
            >
              <ChevronLeft size={12} className={canScrollLeft ? 'opacity-100' : 'opacity-40'} />
              <ArrowLeftRight size={12} className="motion-reduce:animate-none animate-bounce" />
              <span className="hidden sm:inline">Swipe sideways to view more</span>
              <span className="sm:hidden">Swipe left for links & deadlines</span>
              <ChevronRight size={12} className={canScrollRight ? 'opacity-100 motion-reduce:animate-none animate-pulse' : 'opacity-40'} />
            </div>
          )}
        </div>
      </div>

      {/* Screen-reader descriptive instruction */}
      <div id="table-scroll-hint" className="sr-only">
        Official admission table. Use your left and right arrow keys to scroll horizontally to view cutoffs, application links, and deadlines. First column remains pinned.
      </div>

      {/* Horizontal Scroll Area with Sticky First Column & Edge Fading Cues */}
      <div className="relative">
        {/* Left Scroll Cue */}
        {viewMode === 'table' && canScrollLeft && (
          <div 
            onClick={() => scrollByAmount(-180)}
            className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-30 flex items-center justify-start pl-1 cursor-pointer transition-opacity"
            title="Scroll left"
            aria-hidden="true"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900/80 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
              <ChevronLeft size={16} />
            </div>
          </div>
        )}

        {/* Right Scroll Cue */}
        {viewMode === 'table' && canScrollRight && (
          <div 
            onClick={() => scrollByAmount(180)}
            className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-30 flex items-center justify-end pr-1 cursor-pointer transition-opacity"
            title="Scroll right to view links and deadlines"
            aria-hidden="true"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 motion-reduce:animate-none animate-bounce">
              <ChevronRight size={16} />
            </div>
          </div>
        )}

        {/* Scrollable Container with keyboard accessibility (tabIndex=0) */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          tabIndex={0}
          role="region"
          aria-label="Official admission data table"
          aria-describedby="table-scroll-hint"
          className={`focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-b-3xl ${
            viewMode === 'cards'
              ? 'p-3'
              : 'overflow-x-auto no-scrollbar scroll-smooth w-full'
          }`}
        >
          <table className={`w-full text-left border-collapse ${
            viewMode === 'cards' 
              ? 'table-card-layout block w-full' 
              : 'min-w-[550px]'
          }`}>
            {children}
          </table>
        </div>
      </div>

      {/* Mobile Swipe Guidance Banner */}
      {viewMode === 'table' && isOverflowing && (
        <div className="sm:hidden px-4 py-2.5 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>👉</span>
            <span>Swipe left to view application links and deadlines</span>
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-blue-600 dark:text-cyan-400 font-black">Scrollable</span>
        </div>
      )}
    </div>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-slate-900 dark:bg-slate-800 text-white text-xs font-black uppercase tracking-wider border-b-2 border-slate-700 select-none">
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
    {children}
  </tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group">
    {children}
  </tr>
);

export const TableHeaderCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className="px-4 py-3.5 text-left text-[11px] font-black text-slate-100 uppercase tracking-wider whitespace-nowrap first:sticky first:left-0 first:z-20 first:bg-slate-900 dark:first:bg-slate-800 first:shadow-[2px_0_5px_-1px_rgba(0,0,0,0.3)]">
    {children}
  </th>
);

export const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <td className="px-4 py-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed align-middle first:sticky first:left-0 first:z-10 first:bg-white dark:first:bg-slate-900 group-hover:first:bg-blue-50 dark:group-hover:first:bg-slate-800 first:shadow-[2px_0_5px_-1px_rgba(0,0,0,0.12)]">
      {children}
    </td>
  );
};
