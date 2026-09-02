import React, { useState } from 'react';
import { MapPin, Navigation, Search, Building2, BookOpen, Compass, Info, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara"
];

interface LocationItem {
  name: string;
  address: string;
  state: string;
  lga?: string;
  mapSearchQuery?: string;
  notes?: string;
}

export const CbtCenterLocator: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('Lagos');
  const [category, setCategory] = useState<'cbt_centers' | 'campuses' | 'hostels'>('cbt_centers');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    title?: string;
    summary?: string;
    locations?: LocationItem[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          state: selectedState,
          category
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setResult(resData.data);
      } else {
        setError(resData.error || "Could not retrieve map location data.");
      }
    } catch (err: any) {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  const handleQuickPreset = (presetQuery: string) => {
    setQuery(presetQuery);
    handleSearch(presetQuery);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <Compass className="w-3.5 h-3.5" />
            Google Maps Grounded AI Search
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            JAMB CBT Center & Campus Locator
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Locate official accredited JAMB CBT examination centers, university & polytechnic campuses, and nearby student accommodation across Nigeria with real-time location data.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Category Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => setCategory('cbt_centers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              category === 'cbt_centers'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Accredited CBT Centers
          </button>
          <button
            onClick={() => setCategory('campuses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              category === 'campuses'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            University & College Campuses
          </button>
          <button
            onClick={() => setCategory('hostels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              category === 'hostels'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Student Accommodation & Hostels
          </button>
        </div>

        {/* Search Input Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* State Dropdown */}
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">State / Territory</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {NIGERIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Search Field with Voice Button */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Search by Location, Center Name, or School
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={
                  category === 'cbt_centers'
                    ? `e.g. CBT exam centers in Ikeja, ${selectedState}`
                    : `e.g. Main campus location of UNILAG, ${selectedState}`
                }
                className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              
              <div className="absolute right-2 flex items-center gap-1.5">
                <VoiceInputButton onTranscript={handleVoiceTranscript} />
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Search"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Searches:</span>
          {[
            `CBT centers in ${selectedState}`,
            `University campuses in ${selectedState}`,
            `JAMB center near Ikeja/Surulere`,
            `Off-campus hostels near campus`
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => handleQuickPreset(preset)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 transition-all"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {loading && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Querying Google Maps grounding engine for verified {selectedState} details...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
          <Info className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl p-5 space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              {result.title || "Grounded Location Results"}
            </h2>
            {result.summary && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {result.summary}
              </p>
            )}
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.locations && result.locations.length > 0 ? (
              result.locations.map((loc, idx) => {
                const mapQuery = loc.mapSearchQuery || `${loc.name}, ${loc.address || ''}, ${loc.state || selectedState}, Nigeria`;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {loc.name}
                        </h3>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold rounded-full shrink-0">
                          {loc.state || selectedState}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{loc.address || "Street address available via Google Maps"}</span>
                      </p>

                      {loc.lga && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>LGA:</strong> {loc.lga}
                        </p>
                      )}

                      {loc.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          💡 {loc.notes}
                        </p>
                      )}
                    </div>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      Open Location in Google Maps
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                No location cards returned. Check your search query or try a quick preset above.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
