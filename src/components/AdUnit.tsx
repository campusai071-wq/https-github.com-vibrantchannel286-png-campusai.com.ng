import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ExternalLink, Megaphone, ShieldCheck } from 'lucide-react';
import { getActiveSponsoredAds, recordAdClick, recordAdImpression } from '../services/adPartnerService';
import { AdPlacementType, SponsoredAd } from '../types';

interface AdUnitProps {
  type: 'leaderboard' | 'rectangle' | 'sidebar' | 'billboard';
  placement?: AdPlacementType;
  className?: string;
  onNavigateToAdvertise?: () => void;
}

const AdUnit: React.FC<AdUnitProps> = ({ 
  type, 
  placement = 'all', 
  className = '', 
  onNavigateToAdvertise 
}) => {
  const [activeAd, setActiveAd] = useState<SponsoredAd | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getActiveSponsoredAds(placement).then((ads) => {
      if (isMounted) {
        if (ads && ads.length > 0) {
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          setActiveAd(randomAd);
          recordAdImpression(randomAd.id);
        }
        setLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [placement]);

  const handleAdClick = (ad: SponsoredAd) => {
    recordAdClick(ad.id);
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNavigate = () => {
    if (onNavigateToAdvertise) {
      onNavigateToAdvertise();
    } else {
      window.dispatchEvent(new CustomEvent('campusai_navigate', { detail: 'advertise' }));
    }
  };

  // Fixed minimum height container to prevent Cumulative Layout Shift (CLS)
  if (!loaded) {
    return (
      <div className={`relative overflow-hidden rounded-3xl bg-slate-900/50 border border-slate-800/60 p-4 sm:p-5 min-h-[110px] sm:min-h-[96px] animate-pulse ${className}`}>
        <div className="h-4 w-24 bg-slate-800 rounded-full mb-3"></div>
        <div className="h-5 w-3/4 bg-slate-800 rounded-lg mb-2"></div>
        <div className="h-3 w-1/2 bg-slate-800 rounded-lg"></div>
      </div>
    );
  }

  // If a real sponsored ad is loaded, render the authentic campaign
  if (activeAd) {
    return (
      <div 
        className={`relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl group p-4 sm:p-5 flex flex-col justify-between min-h-[110px] sm:min-h-[96px] ${className}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
            <Sparkles size={10} /> {activeAd.badgeText || 'Sponsored'}
          </span>
          <button
            onClick={handleNavigate}
            className="text-[9px] font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider"
          >
            Advertise Here
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors leading-snug">
              {activeAd.title}
            </h4>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {activeAd.description}
            </p>
          </div>

          <button
            onClick={() => handleAdClick(activeAd)}
            className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            {activeAd.ctaText || 'Learn More'} <ArrowRight size={12} />
          </button>
        </div>
      </div>
    );
  }

  // Native CampusAI Self-Promote / "Advertise With Us" Slot
  return (
    <div 
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[110px] sm:min-h-[96px] ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <Megaphone size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Reach 250k+ Scholars</span>
            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">From ₦5,000</span>
          </div>
          <p className="text-xs font-bold text-white mt-0.5">
            Promote your CBT Centre, Tutorial Academy, or Student Hostel here.
          </p>
        </div>
      </div>

      <button
        onClick={handleNavigate}
        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
      >
        Advertise With Us <ArrowRight size={12} />
      </button>
    </div>
  );
};

export default AdUnit;
