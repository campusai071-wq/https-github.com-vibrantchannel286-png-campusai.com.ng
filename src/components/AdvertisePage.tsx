import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  MousePointerClick, 
  ShieldCheck, 
  HelpCircle, 
  MessageSquare, 
  PhoneCall, 
  CreditCard, 
  Building2, 
  Copy, 
  Check, 
  Globe, 
  TrendingUp, 
  Layers, 
  ChevronRight,
  ExternalLink,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getPricingConfig, 
  createAdCampaign, 
  PlatformPricingConfig, 
  DEFAULT_PRICING_CONFIG 
} from '../services/adPartnerService';
import { getTrafficStats } from '../services/dbService';
import { getTotalUserCount } from '../services/userService';
import { AdPackageType, AdPlacementType, SponsoredAd } from '../types';
import SEO from './SEO';

interface AdvertisePageProps {
  onNavigate?: (route: string) => void;
}

export const AdvertisePage: React.FC<AdvertisePageProps> = ({ onNavigate }) => {
  const [config, setConfig] = useState<PlatformPricingConfig>(DEFAULT_PRICING_CONFIG);
  const [trafficStats, setTrafficStats] = useState<{ pageViews: number; uniqueVisitors: number; totalCalculations: number }>({
    pageViews: 0,
    uniqueVisitors: 0,
    totalCalculations: 0
  });
  const [userCount, setUserCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<AdPackageType>('growth_14d');
  const [placement, setPlacement] = useState<AdPlacementType>('all');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<SponsoredAd | null>(null);

  // Form inputs
  const [brandName, setBrandName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [ctaText, setCtaText] = useState('Learn More');
  const [targetUrl, setTargetUrl] = useState('https://');
  const [badgeText, setBadgeText] = useState('Verified Sponsor');
  const [imageUrl, setImageUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'paystack' | 'whatsapp'>('whatsapp');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    getPricingConfig().then(setConfig);
    Promise.all([
      getTrafficStats().catch(err => {
        console.warn('Could not fetch traffic stats:', err);
        return null;
      }),
      getTotalUserCount().catch(err => {
        console.warn('Could not fetch user count:', err);
        return null;
      })
    ]).then(([stats, count]) => {
      if (stats) setTrafficStats(stats);
      if (count && count > 0) setUserCount(count);
    }).finally(() => {
      setLoadingStats(false);
    });
  }, []);

  const getPackageDetails = (type: AdPackageType) => {
    switch (type) {
      case 'starter_7d':
        return {
          title: 'Starter Campaign',
          duration: 7,
          price: config.adStarterPrice,
          badge: 'Popular for Events & Hostels',
          features: [
            '7 Days Active Display',
            'Placement across Articles & Native Slots',
            'Direct Click-Through Tracking',
            'Standard WhatsApp & Phone Leads'
          ]
        };
      case 'growth_14d':
        return {
          title: 'Growth Campaign',
          duration: 14,
          price: config.adGrowthPrice,
          badge: 'Most Recommended',
          features: [
            '14 Days Active Display',
            'Priority Slot on JAMB Cut-off Calculator',
            'Placement across CBT Simulator & Articles',
            'Direct WhatsApp Click-to-Chat CTA',
            'Weekly Click & Impression Report'
          ]
        };
      case 'pro_30d':
        return {
          title: 'Pro Takeover (30 Days)',
          duration: 30,
          price: config.adProPrice,
          badge: 'Maximum Reach & Conversions',
          features: [
            'Full 30 Days Sitewide Takeover',
            'Top Sticky Banner + Result Cards + Hubs',
            'Verified Sponsor Gold Badge',
            'Included in Admission Newsletters',
            'Dedicated WhatsApp Referral Routing'
          ]
        };
      case 'custom':
        return {
          title: 'Custom Enterprise / School Launch',
          duration: 60,
          price: 50000,
          badge: 'Full Media Package',
          features: [
            'Custom Multi-Month Placement',
            'Targeted by State / University Candidates',
            'Dedicated Sponsored Feature Article',
            'Direct WhatsApp Account Manager'
          ]
        };
    }
  };

  const currentPkg = getPackageDetails(selectedPackage);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(config.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello CampusAI Advertising Team!\n\nI want to sponsor an ad campaign on CampusAI.ng:\n\n• Brand: ${brandName || 'My Business'}\n• Package: ${currentPkg.title} (₦${currentPkg.price.toLocaleString()})\n• Duration: ${currentPkg.duration} Days\n• Placement: ${placement.toUpperCase()}\n• Contact: ${contactPhone || contactEmail}\n\nPlease let me know how we can proceed with activation or negotiation.`
    );
    window.open(`https://wa.me/${config.adminWhatsApp}?text=${text}`, '_blank');
  };

  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!brandName.trim()) {
      setFormError('Please provide your Brand or Institution name.');
      return;
    }
    if (!adTitle.trim() || !adDescription.trim()) {
      setFormError('Please fill in your Ad Headline and Description.');
      return;
    }
    if (!contactPhone.trim() && !contactEmail.trim()) {
      setFormError('Please provide a contact phone number or email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAdCampaign({
        brandName: brandName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        whatsapp: whatsapp.trim() || contactPhone.trim(),
        packageType: selectedPackage,
        packageName: currentPkg.title,
        amount: currentPkg.price,
        durationDays: currentPkg.duration,
        placement,
        title: adTitle.trim(),
        description: adDescription.trim(),
        ctaText: ctaText.trim() || 'Learn More',
        targetUrl: targetUrl.trim(),
        imageUrl: imageUrl.trim() || undefined,
        badgeText: badgeText.trim() || 'Verified Sponsor',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod === 'whatsapp' ? 'admin' : paymentMethod
      });

      setSubmissionSuccess(created);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white pb-20">
      <SEO 
        title="Advertise With Us - Reach Nigerian Students & JAMB Candidates | CampusAI"
        description="Promote your tutorial center, accredited CBT hub, student hostel, educational services, or campus brand to over 200,000+ prospective Nigerian undergraduates."
        canonical="/advertise"
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-wider mb-6">
            <Megaphone size={14} className="text-blue-400 animate-pulse" />
            Direct High-Intent Student Audience
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Promote Your Brand Directly To <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Nigerian Scholars</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Connect your CBT centre, tutorial academy, student housing, pre-degree consult, or campus service to active admission seekers and university undergraduates.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-black text-blue-400 font-mono">
                {loadingStats ? (
                  <span className="inline-block w-12 h-6 bg-slate-800 rounded animate-pulse" />
                ) : (
                  trafficStats.pageViews.toLocaleString()
                )}
              </div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Monthly Page Views</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {loadingStats ? (
                  <span className="inline-block w-12 h-6 bg-slate-800 rounded animate-pulse" />
                ) : (
                  trafficStats.uniqueVisitors.toLocaleString()
                )}
              </div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Visitors</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {loadingStats ? (
                  <span className="inline-block w-12 h-6 bg-slate-800 rounded animate-pulse" />
                ) : (
                  `${(userCount > 0 ? userCount : Math.max(trafficStats.uniqueVisitors, 1)).toLocaleString()}+`
                )}
              </div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Users+</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-black text-amber-400 font-mono">
                ₦{config.adStarterPrice.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Starter Entry Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Step 1: Package Selector */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">Step 1</span>
              <h2 className="text-2xl font-black text-white">Choose Your Campaign Plan</h2>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              Rates are fully negotiable
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['starter_7d', 'growth_14d', 'pro_30d'] as AdPackageType[]).map((pkgKey) => {
              const pkg = getPackageDetails(pkgKey);
              const isSelected = selectedPackage === pkgKey;

              return (
                <div
                  key={pkgKey}
                  onClick={() => setSelectedPackage(pkgKey)}
                  className={`relative cursor-pointer rounded-3xl p-6 transition-all border ${
                    isSelected 
                      ? 'bg-blue-950/30 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/40' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {pkgKey === 'growth_14d' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black text-white">{pkg.title}</h3>
                      <p className="text-xs text-slate-400 font-bold">{pkg.duration} Days Display</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-slate-700 text-transparent'
                    }`}>
                      <Check size={14} />
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-black text-white">₦{pkg.price.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 font-bold ml-1.5">/ {pkg.duration} days</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-slate-800/80 text-center">
                    <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                      {isSelected ? '✓ Selected Plan' : 'Select Plan'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Form & Real-Time Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800">
            <div className="mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">Step 2</span>
              <h2 className="text-2xl font-black text-white">Ad Creative & Business Details</h2>
              <p className="text-xs text-slate-400 mt-1">Configure what students will see when your ad runs.</p>
            </div>

            {formError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                {formError}
              </div>
            )}

            {submissionSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center"
              >
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Campaign Received!</h3>
                <p className="text-xs text-slate-300 mb-6 max-w-md mx-auto">
                  Your ad for <strong className="text-emerald-400">{submissionSuccess.brandName}</strong> has been logged with ID: <code className="bg-slate-900 px-2 py-0.5 rounded text-amber-300">{submissionSuccess.id}</code>. Our support team will review and activate it within 2 hours.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleWhatsAppInquiry}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <MessageSquare size={16} /> Fast-Track on WhatsApp
                  </button>
                  <button
                    onClick={() => setSubmissionSuccess(null)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Create Another Ad
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitAd} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                      Brand / Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                    Ad Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={70}
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <div className="text-[10px] text-slate-500 text-right mt-1">{adTitle.length}/70</div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                    Ad Description / Pitch *
                  </label>
                  <textarea
                    rows={3}
                    required
                    maxLength={160}
                    value={adDescription}
                    onChange={(e) => setAdDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <div className="text-[10px] text-slate-500 text-right mt-1">{adDescription.length}/160</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                      Destination Link / WhatsApp Link
                    </label>
                    <input
                      type="url"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                      CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                      Target Placement Area
                    </label>
                    <select
                      value={placement}
                      onChange={(e) => setPlacement(e.target.value as AdPlacementType)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">Sitewide (All Pages & Hubs)</option>
                      <option value="calculator">Cut-off Calculator Result Page</option>
                      <option value="cbt">JAMB CBT Practice Simulator</option>
                      <option value="native">Admission Articles & Guides</option>
                      <option value="banner">Top Header Sticky Banner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                      Banner Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Payment Option selection */}
                <div className="pt-4 border-t border-slate-800">
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-3">
                    Preferred Payment / Activation Option
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('whatsapp')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        paymentMethod === 'whatsapp'
                          ? 'bg-emerald-950/40 border-[#25D366] text-white ring-1 ring-[#25D366]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-xs text-[#25D366] mb-1">
                        <MessageSquare size={16} /> WhatsApp / Negotiate
                      </div>
                      <div className="text-[11px] text-slate-400">Discuss custom terms, discount, or payment on WhatsApp.</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-xs text-blue-400 mb-1">
                        <Building2 size={16} /> Direct Bank Transfer
                      </div>
                      <div className="text-[11px] text-slate-400">Pay directly to our verified bank account.</div>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'bank_transfer' && (
                  <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/40">
                    <div className="text-xs font-bold text-blue-300 mb-2">CampusAI Bank Account Details:</div>
                    {config.accountNumber ? (
                      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div>
                          <div className="text-xs text-slate-400">{config.bankName}</div>
                          <div className="text-sm font-black text-white font-mono">{config.accountNumber}</div>
                          <div className="text-[10px] text-slate-500">{config.accountName}</div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          {copiedAccount ? <Check size={12} /> : <Copy size={12} />}
                          {copiedAccount ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-300">
                        Official bank account details are provided upon request. Please click Negotiate on WhatsApp or submit to receive account info.
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
                  >
                    {isSubmitting ? 'Submitting Campaign...' : `Submit Campaign (₦${currentPkg.price.toLocaleString()})`}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleWhatsAppInquiry}
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquare size={16} /> Negotiate on WhatsApp
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Eye size={16} className="text-blue-400" /> Live Interactive Preview
              </h3>
              <span className="text-[10px] font-bold text-slate-500">Real Placement Render</span>
            </div>

            {/* Native Card Preview */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {badgeText || 'Verified Sponsor'}
                </span>
                <span className="text-[9px] font-bold text-slate-500">Sponsored Ad</span>
              </div>

              {imageUrl && (
                <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 bg-slate-950 border border-slate-800">
                  <img src={imageUrl} alt="Ad creative" className="w-full h-full object-cover" />
                </div>
              )}

              <h4 className="text-base font-black text-white mb-1.5 leading-snug">
                {adTitle || 'Your Compelling Headline Appears Here (e.g. Student Hostels in Yaba)'}
              </h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed line-clamp-3">
                {adDescription || 'Provide clear details about your services, promo pricing, or registration instructions so candidates click immediately.'}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-black">
                    {(brandName || 'B')[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">
                    {brandName || 'Brand Name'}
                  </span>
                </div>

                <a
                  href={targetUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
                >
                  {ctaText || 'Learn More'} <ArrowRight size={12} />
                </a>
              </div>
            </div>

            {/* Placement Information Card */}
            <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-5 text-xs text-slate-400 space-y-3">
              <div className="font-bold text-slate-200">Why Advertise on CampusAI?</div>
              <p>• <strong>Zero Waste</strong>: Your ads are shown directly to candidates searching for cut-off marks, CBT tests, and accommodation.</p>
              <p>• <strong>High Click-Through Rate</strong>: Native student-friendly design ensures high engagement and direct WhatsApp clicks.</p>
              <p>• <strong>Instant Support</strong>: Reach the admin directly anytime for creative changes or campaign extensions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisePage;
