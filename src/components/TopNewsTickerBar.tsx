import React, { useState, useEffect } from 'react';
import { Flame, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCloudNews } from '../services/dbService';
import { NewsItem } from '../types';

interface TopNewsTickerBarProps {
  onNavigate?: (page: string) => void;
}

const TopNewsTickerBar: React.FC<TopNewsTickerBarProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [tickerNews, setTickerNews] = useState<NewsItem[]>([]);
  const [tickerSpeed, setTickerSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('campusai_news_ticker_speed');
    return saved ? parseInt(saved, 10) : 80; // Default: 80s for news ticker
  });

  useEffect(() => {
    let isMounted = true;

    const handleSpeedUpdate = () => {
      const saved = localStorage.getItem('campusai_news_ticker_speed');
      if (saved) setTickerSpeed(parseInt(saved, 10));
    };

    window.addEventListener('campusai_news_speed_updated', handleSpeedUpdate);

    const loadTickerNews = () => {
      getCloudNews().then((news) => {
        if (!isMounted) return;
        if (news && news.length > 0) {
          // Explicitly prioritized articles toggled by admin with news scrolling button (isTicker)
          const tickerItems = news.filter(n => n.isTicker);
          if (tickerItems.length > 0) {
            setTickerNews(tickerItems);
          } else {
            // Fallback to pinned / important articles, or recent top 8
            const fallbackItems = news.filter(n => n.isPinned || n.isImportant);
            setTickerNews(fallbackItems.length > 0 ? fallbackItems : news.slice(0, 8));
          }
        }
      }).catch(err => console.warn('[TopNewsTickerBar] error loading news:', err));
    };

    loadTickerNews();
    window.addEventListener('campusai_news_updated', loadTickerNews);

    return () => {
      isMounted = false;
      window.removeEventListener('campusai_news_speed_updated', handleSpeedUpdate);
      window.removeEventListener('campusai_news_updated', loadTickerNews);
    };
  }, []);

  if (!tickerNews || tickerNews.length === 0) return null;

  const handleArticleClick = (item: NewsItem) => {
    const slugOrId = item.slug || item.id;
    if (onNavigate) {
      navigate(`/news/${slugOrId}`);
    } else {
      window.location.href = `/news/${slugOrId}`;
    }
  };

  // Duplicate list to create a seamless infinite marquee loop
  const displayItems = [...tickerNews, ...tickerNews];

  return (
    <aside aria-label="Admission News Ticker" className="w-full bg-slate-950/95 text-white border-b border-cyan-500/20 py-1.5 px-3 sm:px-6 overflow-hidden flex items-center gap-3 text-xs shadow-inner">
      <div className="shrink-0 text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span> UPDATES
      </div>

      <div className="relative flex-1 overflow-hidden flex items-center h-5">
        <div 
          className="animate-marquee gap-16 cursor-pointer"
          style={{ animationDuration: `${tickerSpeed}s` }}
        >
          {displayItems.map((item, idx) => (
            <span
              key={`${item.id || idx}-${idx}`}
              onClick={() => handleArticleClick(item)}
              className="inline-flex items-center gap-2 text-slate-200 hover:text-cyan-400 font-medium text-[11px] sm:text-xs transition-colors shrink-0"
            >
              <span className="text-cyan-500 font-bold">•</span>
              <span className="hover:underline underline-offset-2">{item.title}</span>
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default TopNewsTickerBar;
