import React, { useState, useEffect } from 'react';
import { Megaphone, Sparkles, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { SponsoredAd } from '../types';
import { getActiveSponsoredAds, recordAdClick, recordAdImpression } from '../services/adPartnerService';

interface TopHeaderBannerProps {
  showImportantBanner?: boolean;
  onNavigate?: (tab: string) => void;
}

export const TopHeaderBanner: React.FC<TopHeaderBannerProps> = ({
  showImportantBanner = true,
  onNavigate
}) => {
  const [activeAd, setActiveAd] = useState<SponsoredAd | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadBannerAd = () => {
      getActiveSponsoredAds('banner').then(ads => {
        if (!isMounted) return;
        if (ads && ads.length > 0) {
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          setActiveAd(randomAd);
          recordAdImpression(randomAd.id);
        } else {
          setActiveAd(null);
        }
      });
    };

    loadBannerAd();

    const handleUpdate = () => {
      loadBannerAd();
    };

    window.addEventListener('campusai_ad_updated', handleUpdate);
    window.addEventListener('campusai_config_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    
    // Poll every 8s in case of status activation
    const interval = setInterval(loadBannerAd, 8000);

    return () => {
      isMounted = false;
      window.removeEventListener('campusai_ad_updated', handleUpdate);
      window.removeEventListener('campusai_config_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // 1. If an active sponsored ad targeting 'banner' or 'all' exists:
  // Persistent, premium sponsor ribbon (no dismiss button - 100% impression delivery)
  if (activeAd) {
    return (
      <aside 
        aria-label="Sponsored Announcement"
        className="relative z-40 bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white border-b border-amber-500/30 px-3 sm:px-6 py-2 shadow-md transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm font-black">
              <ShieldCheck size={12} className="stroke-[2.5]" /> {activeAd.badgeText || 'VERIFIED SPONSOR'}
            </span>

            <div className="flex items-center gap-2 truncate">
              <strong className="font-bold text-amber-200 shrink-0">
                {activeAd.brandName}:
              </strong>
              <span className="truncate text-slate-200">
                {activeAd.title} — {activeAd.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={activeAd.targetUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordAdClick(activeAd.id)}
              className="px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow hover:shadow-amber-500/30 active:scale-95"
            >
              <span>{activeAd.ctaText || 'Learn More'}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </aside>
    );
  }

  // 2. If no active ad, but the Admin has toggled "Top Important Update Banner" ON:
  // Authoritative admission announcement ribbon (controlled via Admin Dashboard)
  if (showImportantBanner) {
    return (
      <aside 
        aria-label="Important Admission Update"
        className="relative z-40 bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 text-white border-b border-cyan-500/30 px-3 sm:px-6 py-2 shadow-md transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Megaphone size={11} className="fill-slate-950" /> PINNED UPDATE
            </span>

            <p className="truncate text-slate-200 font-medium">
              <strong className="text-cyan-300">2026/2027 Admissions:</strong> Post-UTME screening forms, cut-off marks, and verification tools are now active.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate ? onNavigate('calculator') : (window.location.href = '/calculator')}
              className="px-3.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow active:scale-95 cursor-pointer"
            >
              Check Cut-Off <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
};

export default TopHeaderBanner;
