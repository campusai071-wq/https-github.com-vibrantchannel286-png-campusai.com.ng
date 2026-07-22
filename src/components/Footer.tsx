
import React from 'react';
import { Home, School, ShieldCheck, Mail, Twitter, Facebook, Instagram, Linkedin, Youtube, ArrowUp, Github, ExternalLink, Globe, MessageCircle, Lock, Cpu, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStandalone } from '../hooks/useStandalone';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
  onOpenSupport: () => void;
  isAdmin?: boolean;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    nairaland?: string;
    whatsapp?: string;
    role?: string;
  };
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal, onOpenSupport, isAdmin, socialLinks }) => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const isStandalone = useStandalone();

  const [stats, setStats] = React.useState<{ pageViews: number; uniqueVisitors: number } | null>(null);

  React.useEffect(() => {
    let active = true;
    const fetchFootTraffic = async () => {
      try {
        const { getTrafficStats } = await import('../services/dbService');
        const res = await getTrafficStats();
        if (active && res) {
          setStats(res);
        }
      } catch (err) {
        console.warn("Traffic stats failed inside footer:", err);
      }
    };
    fetchFootTraffic();
    return () => { active = false; };
  }, []);

  const currentYear = new Date().getFullYear();

  const defaultSocialLinks = {
    twitter: 'https://x.com/campusai_ng',
    facebook: 'https://facebook.com/campusai.ng',
    instagram: 'https://instagram.com/campusai.ng',
    linkedin: 'https://linkedin.com/company/campusai_ng',
    youtube: 'https://youtube.com/@campusai_ng',
    tiktok: 'https://tiktok.com/@campusai_ng',
    whatsapp: 'https://chat.whatsapp.com/campusai',
    nairaland: 'https://nairaland.com/campusai'
  };

  // Merge provided prop with defaults, ignoring empty strings
  const activeLinks = { ...defaultSocialLinks };
  if (socialLinks) {
    if (socialLinks.twitter !== undefined && socialLinks.twitter.trim() !== '') activeLinks.twitter = socialLinks.twitter;
    if (socialLinks.facebook !== undefined && socialLinks.facebook.trim() !== '') activeLinks.facebook = socialLinks.facebook;
    if (socialLinks.instagram !== undefined && socialLinks.instagram.trim() !== '') activeLinks.instagram = socialLinks.instagram;
    if (socialLinks.linkedin !== undefined && socialLinks.linkedin.trim() !== '') activeLinks.linkedin = socialLinks.linkedin;
    if (socialLinks.youtube !== undefined && socialLinks.youtube.trim() !== '') activeLinks.youtube = socialLinks.youtube;
    if (socialLinks.tiktok !== undefined && socialLinks.tiktok.trim() !== '') activeLinks.tiktok = socialLinks.tiktok;
    if (socialLinks.nairaland !== undefined && socialLinks.nairaland.trim() !== '') activeLinks.nairaland = socialLinks.nairaland;
    if (socialLinks.whatsapp !== undefined && socialLinks.whatsapp.trim() !== '') activeLinks.whatsapp = socialLinks.whatsapp;
  }

  return (
    <footer className="bg-gray-950 text-white pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-500"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex flex-col items-start">
              <span className="text-3xl font-black tracking-tighter">
                Campus<span className="text-cyan-400">AI</span><span className="opacity-70 font-bold">.ng</span>
              </span>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 shrink-0">
                   <ShieldCheck size={11} className="text-blue-500" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 font-mono">Verified Platform</span>
                </div>
                {stats && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 rounded-lg shrink-0">
                    <Globe size={11} className="animate-spin-slow" />
                    <span className="text-[8px] font-black tracking-widest font-mono uppercase">Visitors: {stats.uniqueVisitors.toLocaleString()}</span>
                  </div>
                )}
                {stats && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                    <Eye size={11} />
                    <span className="text-[8px] font-black tracking-widest font-mono uppercase">Updates: {stats.pageViews.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-6 leading-relaxed font-medium">
                The premiere high-intelligence companion for the Nigerian student journey. Empowering the 2026 academic cycle with real-time data and neural logic.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {activeLinks.twitter && (
                <a href={activeLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center hover:bg-black hover:border-black hover:text-white transition-all active:scale-90 border border-white/10 group" title="X (Twitter)">
                  <Twitter size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              )}
              {activeLinks.facebook && (
                <a href={activeLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all active:scale-90 border border-white/10 group" title="Facebook">
                  <Facebook size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              )}
              {activeLinks.instagram && (
                <a href={activeLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center hover:bg-pink-600 hover:border-pink-600 hover:text-white transition-all active:scale-90 border border-white/10 group" title="Instagram">
                  <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              )}
              {activeLinks.linkedin && (
                <a href={activeLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white transition-all active:scale-90 border border-white/10 group" title="LinkedIn">
                  <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              )}
              {activeLinks.youtube && (
                <a href={activeLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white transition-all active:scale-90 border border-white/10 group" title="YouTube">
                  <Youtube size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              )}
              {activeLinks.tiktok && (
                <a href={activeLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center hover:bg-black hover:border-black hover:text-white transition-all active:scale-90 border border-white/10 group" title="TikTok">
                  <span className="text-[9px] font-black tracking-tight group-hover:scale-110 transition-transform">TIK</span>
                </a>
              )}
              {activeLinks.whatsapp && (
                <a href={activeLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] hover:text-white transition-all active:scale-90 border border-white/10 group" title="WhatsApp Channel">
                  <MessageCircle size={20} className="group-hover:scale-110 transition-transform text-[#25D366] group-hover:text-white" />
                </a>
              )}
              {activeLinks.nairaland && (
                <a href={activeLinks.nairaland} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#2F5E2F] hover:border-[#2F5E2F] hover:text-white transition-all active:scale-90 border border-white/10 group" title="Nairaland Thread">
                  <span className="text-[9px] font-black tracking-tight text-emerald-400 group-hover:text-white group-hover:scale-110 transition-transform">NL</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-8">Navigation Hub</h4>
            <ul className="space-y-5">
              {[
                { label: 'Home Orbit', id: 'home' },
                { label: 'Admission Checklist', path: '/admission-checklist' },
                { label: 'Federal Directory', id: 'federal' },
                { label: 'State Gateways', id: 'state' },
                { label: 'Aggregate Calculator', id: 'calculator' },
                { label: 'AI Strategist', id: 'ai' },
                { label: 'Official JAMB News', id: 'jamb' },
                { label: 'System Status', id: 'status' },
                { label: 'Download App', id: 'download' }
              ].map((item) => (
                <li key={item.id || item.path}>
                  {item.id === 'download' ? (
                    <a 
                      href="/CampusAI.ng.apk" 
                      download="CampusAI.ng.apk"
                      className="text-cyan-400 hover:text-white transition-all text-sm font-black flex items-center gap-3 group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-150 transition-all"></div>
                      Get Android App
                    </a>
                  ) : item.path ? (
                    <a 
                      href={item.path}
                      className="text-gray-400 hover:text-white transition-all text-sm font-bold flex items-center gap-3 group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800 group-hover:bg-cyan-400 group-hover:scale-150 transition-all"></div>
                      {item.label}
                    </a>
                  ) : (
                    <button 
                      onClick={() => onNavigate(item.id!)}
                      className="text-gray-400 hover:text-white transition-all text-sm font-bold flex items-center gap-3 group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800 group-hover:bg-cyan-400 group-hover:scale-150 transition-all"></div>
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Governance & Compliance */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-8">Governance</h4>
            <ul className="space-y-5">
              <li>
                <button onClick={() => onNavigate('terms')} className="text-gray-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">Terms of Service <ExternalLink size={12} className="opacity-20" /></button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="text-gray-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">Privacy Protocol <ExternalLink size={12} className="opacity-20" /></button>
              </li>
              <li>
                <button onClick={() => onNavigate('cookies')} className="text-gray-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">Cookie Protocol <ExternalLink size={12} className="opacity-20" /></button>
              </li>
              {isAdmin && (
                <li className="pt-6">
                  <button 
                    onClick={() => onNavigate('admin')}
                    className="w-full py-3 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all animate-pulse"
                  >
                    <Lock size={12} /> Architect Portal
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Support Node */}
          <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl relative flex flex-col justify-between">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-6 flex items-center gap-2">
                <MessageCircle size={14} /> Command Desk
              </h4>
              <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed">
                Facing synchronization issues? Connect with our human architects or scan below to support our platform!
              </p>
            </div>

            {/* Google Review QR Block */}
            <div className="mb-6 p-4 bg-gradient-to-br from-amber-500/15 to-yellow-500/5 border border-amber-500/20 rounded-[24px] flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none transition-transform group-hover:scale-125" />
              <div className="bg-white p-1 rounded-xl shrink-0 shadow-xl border border-amber-500/20 hover:scale-105 transition-transform">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://g.page/r/CSYvNrgamqOHEBM/review" 
                  alt="Google Review QR Code" 
                  className="w-14 h-14 block"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left flex-1 min-w-0 relative z-10">
                <p className="text-[8px] font-black uppercase text-amber-400 tracking-widest leading-none mb-1 flex items-center gap-1">
                  Scan to review
                </p>
                <p className="text-[11px] font-black text-white leading-tight mb-2">★★★★★ 5-Stars</p>
                <a 
                  href="https://g.page/r/CSYvNrgamqOHEBM/review" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[9px] font-black text-gray-300 hover:text-amber-300 transition-colors flex items-center gap-1 active:scale-95 uppercase tracking-widest"
                >
                  Leave a Review <ExternalLink size={10} className="text-amber-400" />
                </a>
              </div>
            </div>

            <button 
              onClick={onOpenSupport} 
              className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95"
            >
              <Mail size={16} /> Open Ticket
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col items-center gap-4 text-center">
          <p className="text-[10px] text-gray-500 max-w-2xl">
            CampusAI is an independent tool using official historical university formulas. We are not officially affiliated with JAMB.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                © {currentYear} CAMPUSAI.COM.NG — FEDERATED INTELLIGENCE NETWORK
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Verified Academic Entity</span>
                </div>
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Akure, NG</span>
              </div>
            </div>

            <button 
              onClick={scrollToTop}
              className="group flex items-center gap-4 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-95"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white transition-colors">Back to Orbit</span>
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:-translate-y-1 transition-transform shadow-lg shadow-blue-600/20">
                <ArrowUp size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
