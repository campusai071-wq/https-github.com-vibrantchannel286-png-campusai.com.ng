import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footprints, History, Newspaper, Calculator, UserCheck, Loader2, ChevronDown } from 'lucide-react';
import { UserActivity } from '../types';
import { getUserActivities } from '../services/dbService';

interface RecentActivityProps {
  userId: string | null;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ userId }) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [maxToShow, setMaxToShow] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('campusai_recent_activity_limit');
      return stored !== null ? Number(stored) : 3;
    } catch (e) {
      return 3;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('campusai_recent_activity_limit', String(maxToShow));
    } catch (e) {}
  }, [maxToShow]);

  useEffect(() => {
    loadActivities();
    if (maxToShow === 0) setMaxToShow(3);
  }, [userId]);

  useEffect(() => {
    const handleActivityLogged = () => {
      loadActivities();
    };
    window.addEventListener('campusai_activity_logged', handleActivityLogged);
    return () => {
      window.removeEventListener('campusai_activity_logged', handleActivityLogged);
    };
  }, [userId]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const data = await getUserActivities(userId, 50);
      setActivities(data);
    } catch (e) {
      console.error("Failed to load activities", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'calculation': return <Calculator size={14} className="text-blue-500" />;
      case 'news_read': return <Newspaper size={14} className="text-emerald-500" />;
      case 'profile_update': return <UserCheck size={14} className="text-purple-500" />;
      default: return <History size={14} className="text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const displayedActivities = activities.slice(0, maxToShow);
  const totalReadCount = activities.filter(a => a.type === 'news_read').length;

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[32px] p-6 border border-gray-100 dark:border-gray-800">
      <div>
        <div className="flex items-center justify-between mb-4 relative">
          <div className="flex items-center gap-2">
            <Footprints className="text-blue-600 animate-pulse" size={20} />
            <h3 className="font-black text-gray-900 dark:text-white uppercase text-[10px] tracking-widest">
              {userId ? 'Recent Activity' : 'Local Recent Activity'}
            </h3>
          </div>
          
          <div className="text-[9px] font-black uppercase text-gray-500 tracking-wider">
            Articles Read: <span className="text-emerald-500">{totalReadCount}</span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-800 text-[9px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all shadow-sm cursor-pointer"
            >
              <span>{maxToShow === 0 ? "Collapsed" : `Show: ${maxToShow}`}</span>
              <ChevronDown size={10} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl py-1 z-50 text-left overflow-hidden"
                  >
                    {[3, 5, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setMaxToShow(num);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-[10px] font-bold text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors cursor-pointer ${
                          maxToShow === num ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <span>{num} Items</span>
                        {maxToShow === num && <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setMaxToShow(0);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-[10px] font-bold text-left border-t border-gray-100 dark:border-gray-700/50 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-between transition-colors cursor-pointer ${
                        maxToShow === 0 ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <span>Collapse All</span>
                      {maxToShow === 0 && <span className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full" />}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {maxToShow > 0 && displayedActivities.length > 0 ? (
              displayedActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex gap-3 items-start group"
                >
                  <div className="mt-0.5 p-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                      {activity.title}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[9px] text-gray-500 font-medium truncate max-w-[150px] md:max-w-[200px]">
                        {activity.description}
                      </p>
                      <span className="text-[9px] text-gray-400 font-black uppercase">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : maxToShow > 0 ? (
              !isLoading && (
                <p className="text-center py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  No recent activity logged
                </p>
              )
            ) : (
              <p className="text-center py-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest italic select-none">
                Activity panel minimized.
              </p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
