import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Globe, 
  CheckCircle2, 
  Star, 
  Users, 
  ExternalLink, 
  ArrowRight,
  PlusCircle,
  X,
  Award,
  BookOpen,
  Home,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getVerifiedPartners, 
  submitPartnerApplication, 
  getPricingConfig, 
  PlatformPricingConfig, 
  DEFAULT_PRICING_CONFIG
} from '../services/adPartnerService';
import { PartnerCategory, PartnerOrganization, PartnerTier } from '../types';
import SEO from './SEO';

interface PartnerNetworkPageProps {
  onNavigate?: (route: string) => void;
}

const NIGERIAN_STATES = [
  'ALL',
  'Lagos',
  'FCT Abuja',
  'Oyo',
  'Edo',
  'Delta',
  'Enugu',
  'Ondo',
  'Rivers',
  'Kaduna',
  'Kano',
  'Osun',
  'Ogun',
  'Kwara',
  'Imo',
  'Anambra',
  'Akwa Ibom'
];

const CATEGORIES: { id: PartnerCategory | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'All Partners', icon: Building2 },
  { id: 'cbt_centre', label: 'Accredited CBT Centres', icon: GraduationCap },
  { id: 'tutorial_academy', label: 'Tutorial Academies', icon: BookOpen },
  { id: 'hostel_housing', label: 'Student Hostels & Housing', icon: Home },
  { id: 'predegree_consult', label: 'Pre-Degree & Remedials', icon: Award }
];

export const PartnerNetworkPage: React.FC<PartnerNetworkPageProps> = ({ onNavigate }) => {
  const [partners, setPartners] = useState<PartnerOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PartnerCategory | 'all'>('all');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [config, setConfig] = useState<PlatformPricingConfig>(DEFAULT_PRICING_CONFIG);

  // Application Form State
  const [institutionName, setInstitutionName] = useState('');
  const [appCategory, setAppCategory] = useState<PartnerCategory>('cbt_centre');
  const [appTier, setAppTier] = useState<PartnerTier>('verified_directory');
  const [appState, setAppState] = useState('Lagos');
  const [appCity, setAppCity] = useState('');
  const [appAddress, setAppAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [jambCode, setJambCode] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number>(300);
  const [servicesInput, setServicesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  useEffect(() => {
    loadPartners();
    getPricingConfig().then(setConfig);
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const data = await getVerifiedPartners();
      setPartners(data);
    } catch (e) {
      console.warn('Could not load partners:', e);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesState = selectedState === 'ALL' || p.state.toLowerCase() === selectedState.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        p.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.jambCentreCode && p.jambCentreCode.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesState && matchesSearch;
    });
  }, [partners, selectedCategory, selectedState, searchQuery]);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppError(null);

    if (!institutionName.trim() || !contactPerson.trim() || !phone.trim()) {
      setAppError('Please fill in the required fields (Institution Name, Contact Person, Phone Number).');
      return;
    }

    setIsSubmitting(true);
    try {
      const services = servicesInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const fee = appTier === 'cbt_institutional' ? config.partnerCbtPrice : config.partnerListingPrice;

      await submitPartnerApplication({
        institutionName: institutionName.trim(),
        category: appCategory,
        tier: appTier,
        state: appState,
        city: appCity.trim(),
        address: appAddress.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        jambCentreCode: jambCode.trim() || undefined,
        description: description.trim(),
        studentCapacity: Number(capacity) || 200,
        servicesOffered: services.length > 0 ? services : ['JAMB Examination', 'Candidate Registration'],
        paymentStatus: 'pending',
        amountPaid: fee,
        rating: 5.0,
        featured: false
      });

      setSubmitSuccess(true);
      loadPartners();
    } catch (err: any) {
      setAppError(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppInquiry = (customText?: string) => {
    const text = encodeURIComponent(
      customText ||
      `Hello CampusAI Admin, I would like to register our institution (${institutionName || 'Our Center'}) as an official Verified Educational Partner.\n\nTier: ${appTier === 'cbt_institutional' ? 'CBT Institutional' : 'Verified Directory'}\nState: ${appState}\nPhone: ${phone}`
    );
    window.open(`https://wa.me/${config.adminWhatsApp}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white pb-20">
      <SEO
        title="Verified Educational & Campus Partner Network | CampusAI"
        description="Browse accredited JAMB CBT centres, top tutorial academies, student housing, and campus service partners verified across Nigerian states."
        canonical="/partners"
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider mb-6">
            <ShieldCheck size={14} className="text-emerald-400" />
            Accredited & Verified Institutional Network
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Verified Educational & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Campus Partners</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Discover accredited CBT testing centers, reputable pre-degree tutorial academies, and verified student hostel facilities across Nigeria.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              <PlusCircle size={16} /> Register Your Centre / Business
            </button>
            <button
              onClick={() => onNavigate ? onNavigate('advertise') : null}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              Sponsored Ad Campaigns <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Filters Bar */}
        <div className="bg-slate-900/80 rounded-3xl p-4 sm:p-6 border border-slate-800 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* State Selector */}
            <div className="w-full md:w-56">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {NIGERIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st === 'ALL' ? '🌍 All Nigerian States' : `📍 ${st} State`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Directory Results */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">
            Showing <strong className="text-emerald-400">{filteredPartners.length}</strong> Verified Partner{filteredPartners.length === 1 ? '' : 's'}
          </div>
          <div className="text-xs text-slate-500 font-bold">
            All listings undergo verification
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Loading verified directory...
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center">
            <Building2 size={36} className="text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No verified partners found in this filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              Are you an accredited center or hostel owner in this area? Register today to be listed.
            </p>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider"
            >
              Apply as Pioneer Partner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-emerald-950/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                      </span>
                      {partner.tier === 'cbt_institutional' && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                          Institutional CBT
                        </span>
                      )}
                    </div>
                    {partner.rating && (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {partner.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors mb-2 leading-snug">
                    {partner.institutionName}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <MapPin size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{partner.city}, {partner.state} State</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {partner.description}
                  </p>

                  {partner.jambCentreCode && (
                    <div className="text-[11px] font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 mb-4 inline-block">
                      JAMB Code: <span className="text-white">{partner.jambCentreCode}</span>
                    </div>
                  )}

                  {partner.servicesOffered && partner.servicesOffered.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {partner.servicesOffered.slice(0, 3).map((srv, idx) => (
                        <span key={idx} className="text-[10px] font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800/80">
                          {srv}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${partner.phone}`}
                    className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Phone size={12} /> Call
                  </a>

                  {partner.whatsapp && (
                    <a
                      href={`https://wa.me/${partner.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(`Hello, I saw ${partner.institutionName} on CampusAI Verified Partner Directory.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <MessageSquare size={12} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Partnership Registration Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative my-8"
            >
              <button
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setSubmitSuccess(false);
                }}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-950 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Institutional Onboarding</span>
                <h2 className="text-2xl font-black text-white mt-1">Register as a Verified Partner</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Get certified in the official CampusAI directory and gain student inquiries across your state.
                </p>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Application Submitted!</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mb-6">
                    Our compliance team has received your institution's profile. We will verify your center and reach out to complete onboarding.
                  </p>
                  <button
                    onClick={() => handleWhatsAppInquiry()}
                    className="px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    <MessageSquare size={16} /> Fast-Track Verification on WhatsApp
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  {appError && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                      {appError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setAppTier('verified_directory')}
                      className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                        appTier === 'verified_directory'
                          ? 'bg-emerald-950/30 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-black text-white">Verified Directory Listing</div>
                      <div className="text-sm font-black text-emerald-400 mt-1">₦{config.partnerListingPrice.toLocaleString()}<span className="text-[10px] text-slate-400">/year</span></div>
                      <div className="text-[10px] text-slate-400 mt-1">Verified badge, call/WhatsApp buttons, state directory priority.</div>
                    </div>

                    <div
                      onClick={() => setAppTier('cbt_institutional')}
                      className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                        appTier === 'cbt_institutional'
                          ? 'bg-blue-950/30 border-blue-500 text-white ring-1 ring-blue-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-black text-white">Institutional CBT & Portal</div>
                      <div className="text-sm font-black text-blue-400 mt-1">₦{config.partnerCbtPrice.toLocaleString()}<span className="text-[10px] text-slate-400">/year</span></div>
                      <div className="text-[10px] text-slate-400 mt-1">Includes CBT mock licenses, dedicated banner ad, priority accreditation.</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                      Institution / Center / Hostel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                        Category *
                      </label>
                      <select
                        value={appCategory}
                        onChange={(e) => setAppCategory(e.target.value as PartnerCategory)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="cbt_centre">Accredited CBT Centre</option>
                        <option value="tutorial_academy">Tutorial / Remedial Academy</option>
                        <option value="hostel_housing">Student Hostel / Accommodation</option>
                        <option value="predegree_consult">Pre-Degree & JUPEB Consult</option>
                        <option value="school">Secondary School / College</option>
                        <option value="other">Campus Student Union / Service</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                        State Location *
                      </label>
                      <select
                        value={appState}
                        onChange={(e) => setAppState(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        {NIGERIAN_STATES.filter(s => s !== 'ALL').map((st) => (
                          <option key={st} value={st}>{st} State</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        required
                        value={appCity}
                        onChange={(e) => setAppCity(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                        JAMB Centre Code (If CBT Centre)
                      </label>
                      <input
                        type="text"
                        value={jambCode}
                        onChange={(e) => setJambCode(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Physical Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={appAddress}
                      onChange={(e) => setAppAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                        WhatsApp Line
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                      Overview / Facility Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                      Services Offered (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={servicesInput}
                      onChange={(e) => setServicesInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Partner Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppInquiry()}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 font-black text-xs uppercase tracking-wider"
                    >
                      Talk to Admin
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerNetworkPage;
