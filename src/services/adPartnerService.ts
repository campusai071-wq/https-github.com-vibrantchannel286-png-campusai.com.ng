import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, increment } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { 
  SponsoredAd, 
  PartnerOrganization, 
  PlatformPricingConfig, 
  AdPlacementType, 
  AdPackageType,
  PartnerCategory
} from '../types';

export type { PlatformPricingConfig };

const PRICING_STORAGE_KEY = 'campusai_pricing_config';
const LOCAL_ADS_KEY = 'campusai_sponsored_ads';
const LOCAL_PARTNERS_KEY = 'campusai_partners_list';

// Default editable pricing configuration
export const DEFAULT_PRICING_CONFIG: PlatformPricingConfig = {
  adStarterPrice: 5000,        // 7 Days (1 Week)
  adGrowthPrice: 9000,         // 14 Days (2 Weeks - save ₦1,000)
  adProPrice: 18000,           // 30 Days (1 Month - save ₦2,000)
  partnerListingPrice: 25000,  // Annual Verified Directory
  partnerCbtPrice: 75000,      // Annual CBT & Institutional Portal
  adminWhatsApp: '+234 916 976 0634',
  adminEmail: 'eiweh123@gmail.com',
  bankName: '',
  accountNumber: '',
  accountName: '',
  allowNegotiation: true,
  updatedAt: new Date().toISOString()
};

// ─── 1. PRICING & CONFIG MANAGEMENT ──────────────────────────────────────────

export const getPricingConfig = async (): Promise<PlatformPricingConfig> => {
  // Check local cache first
  const localCached = localStorage.getItem(PRICING_STORAGE_KEY);
  let config: PlatformPricingConfig = localCached ? JSON.parse(localCached) : { ...DEFAULT_PRICING_CONFIG };

  // Migrate legacy 12,000 rate to the fair 9,000 rate
  if (config.adGrowthPrice === 12000) {
    config.adGrowthPrice = 9000;
  }
  if (config.adProPrice === 25000) {
    config.adProPrice = 18000;
  }

  if (!db) return config;

  try {
    const docRef = doc(db, 'platform_settings', 'pricing');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      config = { ...DEFAULT_PRICING_CONFIG, ...(snap.data() as PlatformPricingConfig) };
      localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(config));
    }
  } catch (e) {
    console.warn('Using default pricing config due to network / permission state:', e);
  }

  return config;
};

export const updatePricingConfig = async (newConfig: Partial<PlatformPricingConfig>): Promise<PlatformPricingConfig> => {
  const current = await getPricingConfig();
  const updated: PlatformPricingConfig = {
    ...current,
    ...newConfig,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(updated));

  if (db) {
    try {
      await setDoc(doc(db, 'platform_settings', 'pricing'), updated, { merge: true });
    } catch (e) {
      console.warn('Error saving pricing to Firestore:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('campusai_pricing_updated', { detail: updated }));
  return updated;
};

// ─── 2. AD CAMPAIGNS SERVICE ──────────────────────────────────────────────────

export const createAdCampaign = async (data: Omit<SponsoredAd, 'id' | 'createdAt' | 'impressions' | 'clicks' | 'status'> & { id?: string; status?: SponsoredAd['status'] }): Promise<SponsoredAd> => {
  const adId = data.id || `ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newAd: SponsoredAd = {
    ...data,
    badgeText: data.badgeText || 'VERIFIED SPONSOR',
    id: adId,
    status: data.status || 'pending',
    impressions: 0,
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to local cache
  const localAds: SponsoredAd[] = JSON.parse(localStorage.getItem(LOCAL_ADS_KEY) || '[]');
  localAds.unshift(newAd);
  localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(localAds.slice(0, 100)));

  if (db) {
    try {
      await setDoc(doc(db, 'ad_campaigns', adId), newAd);
    } catch (e) {
      console.warn('Error saving ad campaign to Firestore:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('campusai_ad_created', { detail: newAd }));
  return newAd;
};

export const getActiveSponsoredAds = async (placement?: AdPlacementType): Promise<SponsoredAd[]> => {
  const adMap = new Map<string, SponsoredAd>();

  // 1. Load from local storage cache (filter out any mock entries)
  try {
    const localAds: SponsoredAd[] = JSON.parse(localStorage.getItem(LOCAL_ADS_KEY) || '[]');
    localAds.forEach(a => {
      if (a && a.id && !a.id.includes('sponsor_edupath_verified') && (a.status === 'active' || String(a.status).toLowerCase().trim() === 'active')) {
        adMap.set(a.id, a);
      }
    });
  } catch (err) {
    console.warn('Error reading local ads cache:', err);
  }

  // 2. Fetch from Firestore if available
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'ad_campaigns'));
      snap.docs.forEach(d => {
        const adData = d.data() as SponsoredAd;
        if (adData && adData.id && !adData.id.includes('sponsor_edupath_verified')) {
          if (adData.status === 'active' || String(adData.status).toLowerCase().trim() === 'active') {
            adMap.set(adData.id, adData);
          } else {
            adMap.delete(adData.id);
          }
        }
      });
    } catch (e) {
      console.warn('Falling back to cached sponsored ads:', e);
    }
  }

  const allActiveAds = Array.from(adMap.values());

  // 3. Strict Placement Filtering:
  if (placement && placement !== 'all') {
    const target = placement.toLowerCase().trim();

    return allActiveAds.filter(a => {
      const adPlacement = (a.placement || 'all').toLowerCase().trim();

      // Sitewide takeover campaigns show in all placements
      if (adPlacement === 'all') return true;

      // Exact match for the requested placement
      if (adPlacement === target) return true;

      // Top banner aliases (hero, banner, top, header)
      const isBannerTarget = target === 'banner' || target === 'hero' || target === 'top';
      const isBannerAd = adPlacement === 'banner' || adPlacement === 'hero' || adPlacement === 'top' || adPlacement === 'header';
      if (isBannerTarget && isBannerAd) return true;

      return false;
    });
  }

  return allActiveAds;
};

export const getAllAdCampaigns = async (): Promise<SponsoredAd[]> => {
  let ads: SponsoredAd[] = [];

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'ad_campaigns'));
      ads = snap.docs.map(d => d.data() as SponsoredAd).filter(a => a && a.id && !a.id.includes('sponsor_edupath_verified'));
    } catch (e) {
      console.warn('Error fetching all ads from cloud:', e);
    }
  }

  if (ads.length === 0) {
    ads = JSON.parse(localStorage.getItem(LOCAL_ADS_KEY) || '[]').filter((a: SponsoredAd) => a && a.id && !a.id.includes('sponsor_edupath_verified'));
  }

  return ads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const updateAdCampaignStatus = async (adId: string, updates: Partial<SponsoredAd>): Promise<void> => {
  const localAds: SponsoredAd[] = JSON.parse(localStorage.getItem(LOCAL_ADS_KEY) || '[]');
  const idx = localAds.findIndex(a => a.id === adId);
  if (idx !== -1) {
    localAds[idx] = { ...localAds[idx], ...updates, updatedAt: new Date().toISOString() };
  } else {
    // If not in local cache yet, push a stub/updated object so it's tracked
    localAds.unshift({
      id: adId,
      brandName: updates.brandName || 'Sponsor',
      title: updates.title || '',
      description: updates.description || '',
      placement: updates.placement || 'all',
      durationDays: 7,
      amount: updates.amount || 5000,
      status: updates.status || 'active',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...updates
    } as SponsoredAd);
  }
  localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(localAds));

  if (db) {
    try {
      await setDoc(doc(db, 'ad_campaigns', adId), {
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Error updating ad campaign status in Firestore:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('campusai_ad_updated', { detail: { adId, updates } }));
};

export const recordAdImpression = async (adId: string): Promise<void> => {
  if (db) {
    try {
      await updateDoc(doc(db, 'ad_campaigns', adId), {
        impressions: increment(1)
      });
    } catch {
      // Non-blocking telemetry
    }
  }
};

export const recordAdClick = async (adId: string): Promise<void> => {
  if (db) {
    try {
      await updateDoc(doc(db, 'ad_campaigns', adId), {
        clicks: increment(1)
      });
    } catch {
      // Non-blocking telemetry
    }
  }
};

// ─── 3. PARTNERSHIP NETWORK SERVICE ──────────────────────────────────────────

// Filter out any legacy dummy/seed partner objects from local storage
const filterRealPartners = (list: PartnerOrganization[]): PartnerOrganization[] => {
  return list.filter(p => !p.id.startsWith('partner_etc_') && 
                          !p.id.startsWith('partner_apex_') && 
                          !p.id.startsWith('partner_campus_') && 
                          !p.id.startsWith('partner_capital_') && 
                          !p.id.startsWith('partner_delsu_'));
};

export const submitPartnerApplication = async (data: Omit<PartnerOrganization, 'id' | 'createdAt' | 'status' | 'verified'>): Promise<PartnerOrganization> => {
  const partnerId = `partner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newPartner: PartnerOrganization = {
    ...data,
    id: partnerId,
    status: 'pending',
    verified: false,
    featured: false,
    createdAt: new Date().toISOString()
  };

  const localList: PartnerOrganization[] = filterRealPartners(JSON.parse(localStorage.getItem(LOCAL_PARTNERS_KEY) || '[]'));
  localList.unshift(newPartner);
  localStorage.setItem(LOCAL_PARTNERS_KEY, JSON.stringify(localList.slice(0, 100)));

  if (db) {
    try {
      await setDoc(doc(db, 'partners', partnerId), newPartner);
    } catch (e) {
      console.warn('Error submitting partner to Firestore:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('campusai_partner_applied', { detail: newPartner }));
  return newPartner;
};

export const getVerifiedPartners = async (category?: PartnerCategory, state?: string): Promise<PartnerOrganization[]> => {
  let partners: PartnerOrganization[] = [];

  if (db) {
    try {
      const q = query(
        collection(db, 'partners'),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      partners = snap.docs.map(d => d.data() as PartnerOrganization);
    } catch (e) {
      console.warn('Falling back to local verified partners:', e);
    }
  }

  // Combine with real verified local storage entries
  const localList: PartnerOrganization[] = filterRealPartners(JSON.parse(localStorage.getItem(LOCAL_PARTNERS_KEY) || '[]'));
  const mergedMap = new Map<string, PartnerOrganization>();

  localList.filter(p => p.status === 'approved').forEach(p => mergedMap.set(p.id, p));
  partners.forEach(p => mergedMap.set(p.id, p));

  let results = Array.from(mergedMap.values());

  if (category) {
    results = results.filter(p => p.category === category);
  }
  if (state && state !== 'ALL') {
    results = results.filter(p => p.state.toLowerCase() === state.toLowerCase());
  }

  // Sort featured first, then by rating
  return results.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });
};

export const getAllPartners = async (): Promise<PartnerOrganization[]> => {
  let cloudPartners: PartnerOrganization[] = [];

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'partners'));
      cloudPartners = snap.docs.map(d => d.data() as PartnerOrganization).filter(p => p && p.id && !p.id.includes('partner_edupath_hub'));
    } catch (e) {
      console.warn('Error fetching all partners from cloud:', e);
    }
  }

  const localList: PartnerOrganization[] = filterRealPartners(JSON.parse(localStorage.getItem(LOCAL_PARTNERS_KEY) || '[]')).filter(p => p && p.id && !p.id.includes('partner_edupath_hub'));
  const mergedMap = new Map<string, PartnerOrganization>();

  localList.forEach(p => mergedMap.set(p.id, p));
  cloudPartners.forEach(p => mergedMap.set(p.id, p));

  return Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const updatePartnerStatus = async (partnerId: string, updates: Partial<PartnerOrganization>): Promise<void> => {
  const localList: PartnerOrganization[] = JSON.parse(localStorage.getItem(LOCAL_PARTNERS_KEY) || '[]');
  const idx = localList.findIndex(p => p.id === partnerId);
  if (idx !== -1) {
    localList[idx] = { ...localList[idx], ...updates };
    localStorage.setItem(LOCAL_PARTNERS_KEY, JSON.stringify(localList));
  }

  if (db) {
    try {
      await updateDoc(doc(db, 'partners', partnerId), updates);
    } catch (e) {
      console.warn('Error updating partner in Firestore:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('campusai_partner_updated', { detail: { partnerId, updates } }));
};

export const deleteAdCampaign = async (adId: string): Promise<void> => {
  const localAds: SponsoredAd[] = JSON.parse(localStorage.getItem(LOCAL_ADS_KEY) || '[]');
  const filtered = localAds.filter(a => a.id !== adId);
  localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(filtered));

  if (db) {
    try {
      await deleteDoc(doc(db, 'ad_campaigns', adId));
    } catch (e) {
      console.warn('Error deleting ad campaign from Firestore:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('campusai_ad_deleted', { detail: { adId } }));
};

export const deletePartner = async (partnerId: string): Promise<void> => {
  const localList: PartnerOrganization[] = JSON.parse(localStorage.getItem(LOCAL_PARTNERS_KEY) || '[]');
  const filtered = localList.filter(p => p.id !== partnerId);
  localStorage.setItem(LOCAL_PARTNERS_KEY, JSON.stringify(filtered));

  if (db) {
    try {
      await deleteDoc(doc(db, 'partners', partnerId));
    } catch (e) {
      console.warn('Error deleting partner from Firestore:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('campusai_partner_deleted', { detail: { partnerId } }));
};
