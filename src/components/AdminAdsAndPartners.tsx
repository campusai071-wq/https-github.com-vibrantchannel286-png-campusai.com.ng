import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  PlayCircle, 
  Eye, 
  MousePointerClick, 
  Sparkles, 
  Save, 
  Plus, 
  Filter, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MessageSquare,
  Globe,
  Star,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { 
  getAllAdCampaigns, 
  updateAdCampaignStatus, 
  createAdCampaign,
  getAllPartners, 
  updatePartnerStatus, 
  submitPartnerApplication,
  getPricingConfig, 
  updatePricingConfig, 
  DEFAULT_PRICING_CONFIG 
} from '../services/adPartnerService';
import { 
  SponsoredAd, 
  PartnerOrganization, 
  PlatformPricingConfig, 
  AdPlacementType, 
  AdPackageType, 
  PartnerCategory, 
  PartnerTier 
} from '../types';

export const AdminAdsAndPartners: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ads' | 'partners' | 'pricing'>('ads');

  // Pricing State
  const [pricing, setPricing] = useState<PlatformPricingConfig>(DEFAULT_PRICING_CONFIG);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState<string | null>(null);

  // Ads State
  const [ads, setAds] = useState<SponsoredAd[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adFilter, setAdFilter] = useState<'all' | 'active' | 'pending' | 'paused' | 'expired'>('all');
  const [adSearch, setAdSearch] = useState('');
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);

  // Partners State
  const [partners, setPartners] = useState<PartnerOrganization[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnerFilter, setPartnerFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [showCreatePartnerModal, setShowCreatePartnerModal] = useState(false);

  // New Ad Form
  const [newAdBrand, setNewAdBrand] = useState('');
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdDesc, setNewAdDesc] = useState('');
  const [newAdCta, setNewAdCta] = useState('Learn More');
  const [newAdUrl, setNewAdUrl] = useState('https://');
  const [newAdPhone, setNewAdPhone] = useState('');
  const [newAdPkg, setNewAdPkg] = useState<AdPackageType>('growth_14d');
  const [newAdPlacement, setNewAdPlacement] = useState<AdPlacementType>('all');
  const [isCreatingAd, setIsCreatingAd] = useState(false);

  // New Partner Form
  const [newPartName, setNewPartName] = useState('');
  const [newPartCat, setNewPartCat] = useState<PartnerCategory>('cbt_centre');
  const [newPartTier, setNewPartTier] = useState<PartnerTier>('verified_directory');
  const [newPartState, setNewPartState] = useState('Lagos');
  const [newPartCity, setNewPartCity] = useState('');
  const [newPartAddress, setNewPartAddress] = useState('');
  const [newPartContact, setNewPartContact] = useState('');
  const [newPartPhone, setNewPartPhone] = useState('');
  const [newPartDesc, setNewPartDesc] = useState('');
  const [newPartJambCode, setNewPartJambCode] = useState('');
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setAdsLoading(true);
    setPartnersLoading(true);
    try {
      const [pricingData, adsData, partnersData] = await Promise.all([
        getPricingConfig(),
        getAllAdCampaigns(),
        getAllPartners()
      ]);
      setPricing(pricingData);
      setAds(adsData);
      setPartners(partnersData);
    } catch (e) {
      console.error('Error loading ads and partners admin data:', e);
    } finally {
      setAdsLoading(false);
      setPartnersLoading(false);
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPricing(true);
    setPricingSuccessMsg(null);
    try {
      const updated = await updatePricingConfig(pricing);
      setPricing(updated);
      setPricingSuccessMsg('✅ Platform rates & bank payment settings updated successfully!');
      setTimeout(() => setPricingSuccessMsg(null), 4000);
    } catch (e) {
      alert('Failed to save pricing configuration.');
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleToggleAdStatus = async (adId: string, currentStatus: SponsoredAd['status']) => {
    const nextStatus: SponsoredAd['status'] = currentStatus === 'active' ? 'paused' : 'active';
    await updateAdCampaignStatus(adId, { status: nextStatus, paymentStatus: 'paid' });
    setAds(prev => prev.map(a => a.id === adId ? { ...a, status: nextStatus, paymentStatus: 'paid' } : a));
  };

  const handleTogglePartnerVerified = async (partnerId: string, currentVerified: boolean) => {
    const nextVerified = !currentVerified;
    const nextStatus = nextVerified ? 'approved' : 'pending';
    await updatePartnerStatus(partnerId, { verified: nextVerified, status: nextStatus });
    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, verified: nextVerified, status: nextStatus } : p));
  };

  const handleTogglePartnerFeatured = async (partnerId: string, currentFeatured: boolean) => {
    const nextFeatured = !currentFeatured;
    await updatePartnerStatus(partnerId, { featured: nextFeatured });
    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, featured: nextFeatured } : p));
  };

  const handleCreateAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdBrand || !newAdTitle || !newAdDesc) return;
    setIsCreatingAd(true);
    try {
      const duration = newAdPkg === 'starter_7d' ? 7 : newAdPkg === 'growth_14d' ? 14 : 30;
      const amount = newAdPkg === 'starter_7d' ? pricing.adStarterPrice : newAdPkg === 'growth_14d' ? pricing.adGrowthPrice : pricing.adProPrice;

      const created = await createAdCampaign({
        brandName: newAdBrand.trim(),
        contactEmail: 'eiweh123@gmail.com',
        contactPhone: newAdPhone.trim(),
        packageType: newAdPkg,
        packageName: newAdPkg.toUpperCase(),
        amount,
        durationDays: duration,
        placement: newAdPlacement,
        title: newAdTitle.trim(),
        description: newAdDesc.trim(),
        ctaText: newAdCta.trim() || 'Learn More',
        targetUrl: newAdUrl.trim(),
        badgeText: 'Verified Sponsor',
        status: 'active',
        paymentStatus: 'paid',
        paymentMethod: 'admin'
      });

      setAds(prev => [created, ...prev]);
      setShowCreateAdModal(false);
      setNewAdBrand('');
      setNewAdTitle('');
      setNewAdDesc('');
      setNewAdPhone('');
    } catch (e) {
      alert('Failed to create sponsored ad.');
    } finally {
      setIsCreatingAd(false);
    }
  };

  const handleCreatePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName || !newPartContact || !newPartPhone) return;
    setIsCreatingPartner(true);
    try {
      const fee = newPartTier === 'cbt_institutional' ? pricing.partnerCbtPrice : pricing.partnerListingPrice;
      const created = await submitPartnerApplication({
        institutionName: newPartName.trim(),
        category: newPartCat,
        tier: newPartTier,
        state: newPartState,
        city: newPartCity.trim(),
        address: newPartAddress.trim(),
        contactPerson: newPartContact.trim(),
        email: 'eiweh123@gmail.com',
        phone: newPartPhone.trim(),
        whatsapp: newPartPhone.trim(),
        description: newPartDesc.trim(),
        jambCentreCode: newPartJambCode.trim() || undefined,
        servicesOffered: ['Accredited Registration', 'Admissions Coaching'],
        paymentStatus: 'paid',
        amountPaid: fee,
        rating: 5.0,
        featured: true
      });

      await updatePartnerStatus(created.id, { verified: true, status: 'approved' });
      setPartners(prev => [{ ...created, verified: true, status: 'approved' }, ...prev]);
      setShowCreatePartnerModal(false);
      setNewPartName('');
      setNewPartContact('');
      setNewPartPhone('');
      setNewPartDesc('');
    } catch (e) {
      alert('Failed to create partner.');
    } finally {
      setIsCreatingPartner(false);
    }
  };

  const filteredAds = ads.filter(a => {
    const matchesFilter = adFilter === 'all' || a.status === adFilter;
    const matchesSearch = !adSearch || 
      a.brandName.toLowerCase().includes(adSearch.toLowerCase()) || 
      a.title.toLowerCase().includes(adSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredPartners = partners.filter(p => {
    const matchesFilter = partnerFilter === 'all' || p.status === partnerFilter;
    const matchesSearch = !partnerSearch || 
      p.institutionName.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.city.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.state.toLowerCase().includes(partnerSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('ads')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeSubTab === 'ads'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Megaphone size={14} /> Sponsored Ads ({ads.length})
          </button>
          <button
            onClick={() => setActiveSubTab('partners')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeSubTab === 'partners'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Building2 size={14} /> Partner Network ({partners.length})
          </button>
          <button
            onClick={() => setActiveSubTab('pricing')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeSubTab === 'pricing'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <DollarSign size={14} /> Pricing & Bank Setup
          </button>
        </div>

        <button
          onClick={loadAllData}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-white transition-colors"
          title="Reload dataset"
        >
          <RefreshCw size={14} className={adsLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── 1. ADS TAB ── */}
      {activeSubTab === 'ads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={adSearch}
                  onChange={e => setAdSearch(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={adFilter}
                onChange={e => setAdFilter(e.target.value as any)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="pending">Pending Approval</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateAdModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Plus size={14} /> New Sponsored Ad
            </button>
          </div>

          {filteredAds.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-gray-200 dark:border-gray-800">
              <Megaphone size={32} className="text-gray-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-gray-400">No ad campaigns matching this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAds.map((ad) => (
                <div
                  key={ad.id}
                  className="p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        ad.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : ad.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {ad.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">
                        {ad.placement} • {ad.durationDays}d
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-gray-900 dark:text-white leading-snug">
                      {ad.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 line-clamp-2">
                      {ad.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-200 dark:border-gray-800/80 pt-2">
                      <span className="font-bold text-gray-700 dark:text-gray-200">{ad.brandName}</span>
                      <span className="font-mono text-blue-500">₦{(ad.amount || 0).toLocaleString()}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye size={12} className="text-cyan-400" /> {ad.impressions || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointerClick size={12} className="text-emerald-400" /> {ad.clicks || 0} clicks
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => handleToggleAdStatus(ad.id, ad.status)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        ad.status === 'active'
                          ? 'bg-amber-600/10 text-amber-500 hover:bg-amber-600/20 border border-amber-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      {ad.status === 'active' ? <><PauseCircle size={14} /> Pause</> : <><PlayCircle size={14} /> Activate</>}
                    </button>

                    {ad.targetUrl && (
                      <a
                        href={ad.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 2. PARTNERS TAB ── */}
      {activeSubTab === 'partners' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={partnerSearch}
                  onChange={e => setPartnerSearch(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={partnerFilter}
                onChange={e => setPartnerFilter(e.target.value as any)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved & Verified</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreatePartnerModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Plus size={14} /> Add Partner Institution
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        partner.verified
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {partner.verified ? '✓ Verified' : 'Pending'}
                      </span>
                      {partner.featured && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ★ Featured
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-gray-400 font-bold">
                      {partner.state} State
                    </span>
                  </div>

                  <h4 className="text-base font-black text-gray-900 dark:text-white leading-snug">
                    {partner.institutionName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {partner.city} • {partner.address}
                  </p>
                  {partner.jambCentreCode && (
                    <div className="text-[10px] font-mono font-bold text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded mt-2 inline-block">
                      JAMB Code: {partner.jambCentreCode}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-200 dark:border-gray-800/80 pt-2">
                    <span>Contact: <strong className="text-gray-700 dark:text-gray-200">{partner.contactPerson}</strong></span>
                    <span>{partner.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => handleTogglePartnerVerified(partner.id, partner.verified)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                      partner.verified
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <ShieldCheck size={14} /> {partner.verified ? 'Revoke Verification' : 'Verify & Approve'}
                  </button>

                  <button
                    onClick={() => handleTogglePartnerFeatured(partner.id, partner.featured || false)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      partner.featured
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-gray-200 dark:bg-gray-800 border-transparent text-gray-400 hover:text-white'
                    }`}
                    title="Toggle featured flag"
                  >
                    <Star size={14} className={partner.featured ? 'fill-amber-400' : ''} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. PRICING & BANK CONFIG TAB ── */}
      {activeSubTab === 'pricing' && (
        <form onSubmit={handleSavePricing} className="space-y-6">
          {pricingSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              {pricingSuccessMsg}
            </div>
          )}

          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
              <Megaphone size={14} /> Sponsored Ad Package Pricing (NGN)
            </h3>
            <p className="text-xs text-gray-400">
              Set default package rates for advertisers. Prices remain fully negotiable per campaign.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Starter (7 Days)</label>
                <input
                  type="number"
                  value={pricing.adStarterPrice}
                  onChange={e => setPricing({ ...pricing, adStarterPrice: Number(e.target.value) })}
                  className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl font-mono text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Growth (14 Days)</label>
                <input
                  type="number"
                  value={pricing.adGrowthPrice}
                  onChange={e => setPricing({ ...pricing, adGrowthPrice: Number(e.target.value) })}
                  className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl font-mono text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Pro Takeover (30 Days)</label>
                <input
                  type="number"
                  value={pricing.adProPrice}
                  onChange={e => setPricing({ ...pricing, adProPrice: Number(e.target.value) })}
                  className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl font-mono text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <Building2 size={14} /> Partner Network Annual Membership Pricing (NGN)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Verified Directory Listing (Annual)</label>
                <input
                  type="number"
                  value={pricing.partnerListingPrice}
                  onChange={e => setPricing({ ...pricing, partnerListingPrice: Number(e.target.value) })}
                  className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl font-mono text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">CBT & Institutional Partner (Annual)</label>
                <input
                  type="number"
                  value={pricing.partnerCbtPrice}
                  onChange={e => setPricing({ ...pricing, partnerCbtPrice: Number(e.target.value) })}
                  className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl font-mono text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-purple-500 flex items-center gap-2">
              <DollarSign size={14} /> Bank Account & WhatsApp Negotiation Channel
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={pricing.bankName}
                  onChange={e => setPricing({ ...pricing, bankName: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Account Number</label>
                <input
                  type="text"
                  value={pricing.accountNumber}
                  onChange={e => setPricing({ ...pricing, accountNumber: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl font-mono text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Account Name</label>
                <input
                  type="text"
                  value={pricing.accountName}
                  onChange={e => setPricing({ ...pricing, accountName: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Admin WhatsApp (for negotiations & support)</label>
              <input
                type="text"
                value={pricing.adminWhatsApp}
                onChange={e => setPricing({ ...pricing, adminWhatsApp: e.target.value })}
                className="w-full p-3 bg-white dark:bg-gray-950 rounded-xl font-mono text-xs dark:text-white border border-gray-200 dark:border-gray-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingPricing}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <Save size={16} /> {isSavingPricing ? 'Saving Settings...' : 'Save Pricing & Bank Settings'}
          </button>
        </form>
      )}

      {/* ── CREATE AD MODAL ── */}
      {showCreateAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Create Sponsored Ad</h3>
              <button onClick={() => setShowCreateAdModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateAdSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={newAdBrand}
                  onChange={e => setNewAdBrand(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Ad Headline *</label>
                <input
                  type="text"
                  required
                  value={newAdTitle}
                  onChange={e => setNewAdTitle(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Ad Pitch *</label>
                <textarea
                  rows={2}
                  required
                  value={newAdDesc}
                  onChange={e => setNewAdDesc(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Target URL</label>
                  <input
                    type="url"
                    value={newAdUrl}
                    onChange={e => setNewAdUrl(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">CTA Button</label>
                  <input
                    type="text"
                    value={newAdCta}
                    onChange={e => setNewAdCta(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isCreatingAd}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
              >
                {isCreatingAd ? 'Saving...' : 'Deploy Sponsored Campaign'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE PARTNER MODAL ── */}
      {showCreatePartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Add Partner Center</h3>
              <button onClick={() => setShowCreatePartnerModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreatePartnerSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={newPartName}
                  onChange={e => setNewPartName(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Category</label>
                  <select
                    value={newPartCat}
                    onChange={e => setNewPartCat(e.target.value as any)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  >
                    <option value="cbt_centre">CBT Centre</option>
                    <option value="tutorial_academy">Tutorial Academy</option>
                    <option value="hostel_housing">Hostel / Housing</option>
                    <option value="predegree_consult">Pre-Degree Consult</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newPartState}
                    onChange={e => setNewPartState(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={newPartContact}
                    onChange={e => setNewPartContact(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newPartPhone}
                    onChange={e => setNewPartPhone(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isCreatingPartner}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
              >
                {isCreatingPartner ? 'Saving...' : 'Add Verified Partner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdsAndPartners;
