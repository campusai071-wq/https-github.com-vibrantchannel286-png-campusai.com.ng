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
  Edit3,
  Trash2,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { 
  getAllAdCampaigns, 
  updateAdCampaignStatus, 
  createAdCampaign,
  deleteAdCampaign,
  getAllPartners, 
  updatePartnerStatus, 
  submitPartnerApplication,
  deletePartner,
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
  const [adFilter, setAdFilter] = useState<'all' | 'active' | 'pending' | 'pending_payment' | 'rejected' | 'paused'>('all');
  const [adSearch, setAdSearch] = useState('');
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);

  // In-app Action Notification Banner
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Ad Modals State
  const [adToReject, setAdToReject] = useState<SponsoredAd | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [adToDelete, setAdToDelete] = useState<SponsoredAd | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [adToApprove, setAdToApprove] = useState<SponsoredAd | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Partner Modals State
  const [partnerToDelete, setPartnerToDelete] = useState<PartnerOrganization | null>(null);
  const [isDeletingPartner, setIsDeletingPartner] = useState(false);

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
  const [newAdBadge, setNewAdBadge] = useState('VERIFIED SPONSOR');
  const [isCreatingAd, setIsCreatingAd] = useState(false);

  // Edit Ad Modal State
  const [editingAd, setEditingAd] = useState<SponsoredAd | null>(null);
  const [editBrand, setEditBrand] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCta, setEditCta] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAmount, setEditAmount] = useState(0);
  const [editPlacement, setEditPlacement] = useState<AdPlacementType>('all');
  const [editBadge, setEditBadge] = useState('VERIFIED SPONSOR');
  const [isSavingEditAd, setIsSavingEditAd] = useState(false);

  const handleStartEditAd = (ad: SponsoredAd) => {
    setEditingAd(ad);
    setEditBrand(ad.brandName || '');
    setEditTitle(ad.title || '');
    setEditDesc(ad.description || '');
    setEditCta(ad.ctaText || 'Learn More');
    setEditUrl(ad.targetUrl || '');
    setEditPhone(ad.contactPhone || '');
    setEditAmount(ad.amount || 0);
    setEditPlacement(ad.placement || 'all');
    setEditBadge(ad.badgeText || 'VERIFIED SPONSOR');
  };

  const handleSaveEditAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    setIsSavingEditAd(true);
    try {
      const updates: Partial<SponsoredAd> = {
        brandName: editBrand.trim(),
        title: editTitle.trim(),
        description: editDesc.trim(),
        ctaText: editCta.trim(),
        targetUrl: editUrl.trim(),
        contactPhone: editPhone.trim(),
        amount: Number(editAmount),
        placement: editPlacement,
        badgeText: editBadge.trim() || 'VERIFIED SPONSOR',
        updatedAt: new Date().toISOString()
      };
      await updateAdCampaignStatus(editingAd.id, updates);
      setAds(prev => prev.map(a => a.id === editingAd.id ? { ...a, ...updates } : a));
      setEditingAd(null);
    } catch (e) {
      alert('Failed to update ad campaign.');
    } finally {
      setIsSavingEditAd(false);
    }
  };

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
    try {
      await updateAdCampaignStatus(adId, { status: nextStatus, paymentStatus: 'paid' });
      setAds(prev => prev.map(a => a.id === adId ? { ...a, status: nextStatus, paymentStatus: 'paid' } : a));
      setActionNotice({ type: 'success', message: `Campaign status changed to ${nextStatus}.` });
    } catch (e) {
      console.error('Failed to toggle ad status:', e);
      setActionNotice({ type: 'error', message: 'Failed to update campaign status.' });
    }
  };

  const handleApproveAdConfirm = async () => {
    if (!adToApprove) return;
    setIsApproving(true);
    try {
      await updateAdCampaignStatus(adToApprove.id, { status: 'pending_payment' });
      setAds(prev => prev.map(a => a.id === adToApprove.id ? { ...a, status: 'pending_payment' } : a));
      setActionNotice({ type: 'success', message: `Campaign for "${adToApprove.brandName}" approved! Now awaiting advertiser payment.` });
      setAdToApprove(null);
    } catch (e) {
      console.error('Failed to approve ad:', e);
      setActionNotice({ type: 'error', message: 'Failed to approve ad campaign.' });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectAdConfirm = async () => {
    if (!adToReject) return;
    const reason = rejectionReasonInput.trim() || 'Did not meet platform advertising guidelines.';
    setIsRejecting(true);
    try {
      await updateAdCampaignStatus(adToReject.id, { status: 'rejected', rejectionReason: reason });
      setAds(prev => prev.map(a => a.id === adToReject.id ? { ...a, status: 'rejected', rejectionReason: reason } : a));
      setActionNotice({ type: 'success', message: `Campaign "${adToReject.brandName}" rejected. Feedback recorded.` });
      setAdToReject(null);
      setRejectionReasonInput('');
    } catch (e) {
      console.error('Failed to reject ad:', e);
      setActionNotice({ type: 'error', message: 'Failed to reject ad campaign.' });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDeleteAdConfirm = async () => {
    if (!adToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAdCampaign(adToDelete.id);
      setAds(prev => prev.filter(a => a.id !== adToDelete.id));
      setActionNotice({ type: 'success', message: `Campaign "${adToDelete.brandName}" permanently deleted.` });
      setAdToDelete(null);
    } catch (e) {
      console.error('Failed to delete ad:', e);
      setActionNotice({ type: 'error', message: 'Failed to delete ad campaign.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeletePartnerConfirm = async () => {
    if (!partnerToDelete) return;
    setIsDeletingPartner(true);
    try {
      await deletePartner(partnerToDelete.id);
      setPartners(prev => prev.filter(p => p.id !== partnerToDelete.id));
      setActionNotice({ type: 'success', message: `Partner organization "${partnerToDelete.institutionName}" deleted.` });
      setPartnerToDelete(null);
    } catch (e) {
      console.error('Failed to delete partner:', e);
      setActionNotice({ type: 'error', message: 'Failed to delete partner organization.' });
    } finally {
      setIsDeletingPartner(false);
    }
  };

  const handleTogglePartnerVerified = async (partnerId: string, currentVerified: boolean) => {
    const nextVerified = !currentVerified;
    const nextStatus = nextVerified ? 'approved' : 'pending';
    try {
      await updatePartnerStatus(partnerId, { verified: nextVerified, status: nextStatus });
      setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, verified: nextVerified, status: nextStatus } : p));
      setActionNotice({ type: 'success', message: `Partner verification set to ${nextVerified ? 'Verified' : 'Pending'}.` });
    } catch (e) {
      console.error('Failed to update partner verification:', e);
      setActionNotice({ type: 'error', message: 'Failed to update partner verification.' });
    }
  };

  const handleTogglePartnerFeatured = async (partnerId: string, currentFeatured: boolean) => {
    const nextFeatured = !currentFeatured;
    try {
      await updatePartnerStatus(partnerId, { featured: nextFeatured });
      setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, featured: nextFeatured } : p));
      setActionNotice({ type: 'success', message: `Partner feature status set to ${nextFeatured ? 'Featured' : 'Standard'}.` });
    } catch (e) {
      console.error('Failed to toggle partner featured:', e);
      setActionNotice({ type: 'error', message: 'Failed to update partner feature status.' });
    }
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
        badgeText: newAdBadge.trim() || 'VERIFIED SPONSOR',
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

      {/* Global In-App Action Notice */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between transition-all ${
          actionNotice.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <span>{actionNotice.message}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-gray-400 hover:text-white ml-2 p-1 text-sm leading-none"
          >
            ✕
          </button>
        </div>
      )}

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
                <option value="all">All Campaigns ({ads.length})</option>
                <option value="pending">Pending Review ({ads.filter(a => a.status === 'pending').length})</option>
                <option value="pending_payment">Awaiting Payment ({ads.filter(a => a.status === 'pending_payment').length})</option>
                <option value="active">Active & Live ({ads.filter(a => a.status === 'active').length})</option>
                <option value="paused">Paused ({ads.filter(a => a.status === 'paused').length})</option>
                <option value="rejected">Rejected ({ads.filter(a => a.status === 'rejected').length})</option>
              </select>
            </div>

            <button
              onClick={() => {
                setNewAdBrand('');
                setNewAdTitle('');
                setNewAdDesc('');
                setNewAdBadge('VERIFIED SPONSOR');
                setShowCreateAdModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          ad.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : ad.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : ad.status === 'pending_payment'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : ad.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {ad.status === 'pending_payment' ? 'AWAITING PAYMENT' : ad.status.toUpperCase()}
                        </span>
                        {ad.badgeText && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Sparkles size={10} className="text-amber-500" /> {ad.badgeText}
                          </span>
                        )}
                      </div>
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

                    {ad.imageUrl && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 h-28 w-full relative">
                        <img 
                          src={ad.imageUrl} 
                          alt={ad.title} 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-200 dark:border-gray-800/80 pt-2">
                      <span className="font-bold text-gray-700 dark:text-gray-200">{ad.brandName}</span>
                      <span className="font-mono text-blue-500">₦{(ad.amount || 0).toLocaleString()}</span>
                    </div>

                    {ad.rejectionReason && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px]">
                        <strong>Rejection Reason:</strong> {ad.rejectionReason}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-4 text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye size={12} className="text-cyan-400" /> {ad.impressions || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointerClick size={12} className="text-emerald-400" /> {ad.clicks || 0} clicks
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                    {ad.status === 'pending' && (
                      <button
                        onClick={() => setAdToApprove(ad)}
                        className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all border border-emerald-500/20"
                        title="Approve & Request Payment"
                      >
                        <CheckCircle2 size={14} /> Approve & Pay
                      </button>
                    )}

                    {ad.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          setAdToReject(ad);
                          setRejectionReasonInput(ad.rejectionReason || '');
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all border border-rose-500/20"
                        title="Reject Application"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}

                    {ad.status === 'rejected' && (
                      <button
                        onClick={() => {
                          setAdToReject(ad);
                          setRejectionReasonInput(ad.rejectionReason || '');
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all border border-rose-500/20"
                        title="Update Rejection Reason"
                      >
                        <Edit3 size={12} /> Edit Reason
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleAdStatus(ad.id, ad.status)}
                      className={`flex-1 min-w-[90px] py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        ad.status === 'active'
                          ? 'bg-amber-600/10 text-amber-500 hover:bg-amber-600/20 border border-amber-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      {ad.status === 'active' ? <><PauseCircle size={14} /> Pause</> : <><PlayCircle size={14} /> Activate</>}
                    </button>

                    <button
                      onClick={() => setAdToDelete(ad)}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
                      title="Permanently Delete Campaign"
                    >
                      <Trash2 size={14} />
                    </button>

                    <button
                      onClick={() => handleStartEditAd(ad)}
                      className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit Campaign"
                    >
                      <Edit3 size={14} />
                    </button>

                    {ad.targetUrl && (
                      <a
                        href={ad.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        title="Visit Target Link"
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

                  <button
                    onClick={() => setPartnerToDelete(partner)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
                    title="Permanently Delete Partner Organization"
                  >
                    <Trash2 size={14} />
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
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Target Placement *</label>
                  <select
                    value={newAdPlacement}
                    onChange={e => setNewAdPlacement(e.target.value as AdPlacementType)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  >
                    <option value="banner">Top Header Banner</option>
                    <option value="all">Sitewide Takeover (All)</option>
                    <option value="calculator">Cut-off Calculator</option>
                    <option value="cbt">JAMB CBT Simulator</option>
                    <option value="native">News Articles & Guides</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Package Plan</label>
                  <select
                    value={newAdPkg}
                    onChange={e => setNewAdPkg(e.target.value as AdPackageType)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  >
                    <option value="starter_7d">Starter (7 Days)</option>
                    <option value="growth_14d">Growth (14 Days)</option>
                    <option value="pro_30d">Pro Takeover (30 Days)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newAdPhone}
                    onChange={e => setNewAdPhone(e.target.value)}
                    placeholder="080..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  />
                </div>
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
              <div className="grid grid-cols-3 gap-3">
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
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={newAdBadge}
                    onChange={e => setNewAdBadge(e.target.value)}
                    placeholder="VERIFIED SPONSOR"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800 font-bold"
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

      {/* Edit Ad Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Edit3 size={18} className="text-blue-500" /> Edit Ad Campaign
              </h3>
              <button onClick={() => setEditingAd(null)} className="text-gray-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleSaveEditAdSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={editBrand}
                    onChange={e => setEditBrand(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Target Placement</label>
                  <select
                    value={editPlacement}
                    onChange={e => setEditPlacement(e.target.value as AdPlacementType)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  >
                    <option value="all">Sitewide</option>
                    <option value="banner">Top Header Banner</option>
                    <option value="calculator">Cut-off Calculator</option>
                    <option value="cbt">CBT Simulator</option>
                    <option value="native">Admission Articles</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Headline / Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={editCta}
                    onChange={e => setEditCta(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(Number(e.target.value))}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Target URL</label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={e => setEditUrl(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editBadge}
                    onChange={e => setEditBadge(e.target.value)}
                    placeholder="VERIFIED SPONSOR"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800 font-bold"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSavingEditAd}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
              >
                {isSavingEditAd ? 'Saving Changes...' : 'Save Ad Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. REJECT AD MODAL WITH REASON INPUT ── */}
      {adToReject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  Reject Campaign
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1">
                  Reject "{adToReject.brandName}"?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Provide constructive feedback for the advertiser. They will see this reason in their Self-Service Portal so they can correct and resubmit their ad.
                </p>
              </div>
              <button
                onClick={() => setAdToReject(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick preset chips */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Click a Preset Reason</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Inappropriate or prohibited content',
                  'Destination URL broken or invalid',
                  'Low resolution or blurry banner image',
                  'Unverified credentials or misleading claims',
                  'Violates student safety policies'
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReasonInput(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      rejectionReasonInput === preset
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                        : 'bg-gray-100 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Detailed Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReasonInput}
                onChange={e => setRejectionReasonInput(e.target.value)}
                placeholder="Explain what needs to be fixed before this ad can be accepted..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setAdToReject(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRejecting || !rejectionReasonInput.trim()}
                onClick={handleRejectAdConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {isRejecting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle size={14} /> Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. DELETE AD CONFIRMATION MODAL ── */}
      {adToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Permanently Delete Ad Campaign?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Are you sure you want to permanently delete the campaign for <strong className="text-gray-900 dark:text-white">"{adToDelete.brandName}"</strong> ({adToDelete.title})?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              ⚠️ <strong>Irreversible:</strong> This will permanently delete the campaign, click/impression analytics, and assets from the database and live display.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setAdToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAdConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Yes, Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. APPROVE AD CONFIRMATION MODAL ── */}
      {adToApprove && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Approve Campaign & Request Payment
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Approve <strong className="text-gray-900 dark:text-white">"{adToApprove.brandName}"</strong> ({adToApprove.title})?
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              The status will update to <strong className="text-blue-400 font-mono">AWAITING PAYMENT</strong>. The advertiser will be notified to pay <strong className="text-emerald-400 font-mono">₦{(adToApprove.amount || 5000).toLocaleString()}</strong> via Flutterwave to launch their campaign.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setAdToApprove(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleApproveAdConfirm}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                {isApproving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} /> Confirm & Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. DELETE PARTNER CONFIRMATION MODAL ── */}
      {partnerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Delete Partner Organization?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Permanently remove <strong className="text-gray-900 dark:text-white">"{partnerToDelete.institutionName}"</strong> ({partnerToDelete.city}, {partnerToDelete.state}) from the partner directory?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setPartnerToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPartner}
                onClick={handleDeletePartnerConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {isDeletingPartner ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Yes, Delete Partner
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdsAndPartners;
