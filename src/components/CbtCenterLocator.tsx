import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Navigation, Search, Building2, BookOpen, Compass,
  Info, CheckCircle, ExternalLink, RefreshCw, Map as MapIcon,
  Layers, ChevronRight, Phone, Users, Globe
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { OpenStreetMapViewer } from './OpenStreetMapViewer';
import { VoiceInputButton } from './VoiceInputButton';
import { getCentersForState, getCampusesForState, getHostelsForState, STATE_COORDINATES, CbtCenter } from '../data/cbtCentersData';

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
  lat?: number;
  lng?: number;
  capacity?: number;
  mapSearchQuery?: string;
  notes?: string;
}

export const CbtCenterLocator: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('Lagos');
  const [category, setCategory] = useState<'cbt_centers' | 'campuses' | 'hostels'>('cbt_centers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapEngine, setMapEngine] = useState<'osm' | 'google'>('osm');

  // Google Maps API Key from environment
  const googleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

  // Active selected center for map inspection
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<LocationItem | null>(null);

  // Locations state: initialized with verified state database
  const [locations, setLocations] = useState<LocationItem[]>(() => {
    return getCentersForState('Lagos');
  });

  const [summary, setSummary] = useState<string>(
    'Showing verified, accredited JAMB CBT examination and testing centers in Lagos.'
  );

  // Update list when state or category changes
  useEffect(() => {
    let stateData: LocationItem[] = [];
    let summaryText = '';

    if (category === 'campuses') {
      stateData = getCampusesForState(selectedState);
      summaryText = `Showing verified university & tertiary campuses in ${selectedState}.`;
    } else if (category === 'hostels') {
      stateData = getHostelsForState(selectedState);
      summaryText = `Showing verified student accommodation & off-campus hostels in ${selectedState}.`;
    } else {
      stateData = getCentersForState(selectedState);
      summaryText = `Showing verified, accredited JAMB CBT centers in ${selectedState}.`;
    }

    setLocations(stateData);
    setSelectedLocation(stateData[0] || null);
    setSelectedMarker(null);
    setSummary(summaryText);
  }, [selectedState, category]);

  // Center coordinates for map view
  const mapCenter = useMemo(() => {
    if (selectedLocation?.lat && selectedLocation?.lng) {
      return { lat: selectedLocation.lat, lng: selectedLocation.lng };
    }
    const stateDefault = STATE_COORDINATES[selectedState];
    if (stateDefault) {
      return { lat: stateDefault.lat, lng: stateDefault.lng };
    }
    return { lat: 6.5244, lng: 3.3792 }; // Lagos default
  }, [selectedLocation, selectedState]);

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery !== undefined ? searchQuery : query).trim();
    if (!q) return;

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
        const receivedLocations: LocationItem[] = resData.data.locations || [];

        // If returned locations lack coordinates, supplement with state defaults
        const baseCoords = STATE_COORDINATES[selectedState] || { lat: 6.5244, lng: 3.3792 };
        const enriched = receivedLocations.map((loc, idx) => ({
          ...loc,
          state: loc.state || selectedState,
          lat: loc.lat || baseCoords.lat + (idx * 0.008 - 0.004),
          lng: loc.lng || baseCoords.lng + (idx * 0.008 - 0.004)
        }));

        if (enriched.length > 0) {
          setLocations(enriched);
          setSelectedLocation(enriched[0]);
          setSelectedMarker(null);
        }
        setSummary(resData.data.summary || `Results for "${q}" in ${selectedState}`);
      } else {
        setError(resData.error || "Could not retrieve map location data.");
      }
    } catch (err: any) {
      console.warn("[CBT Center Locator Search Error]:", err);
      // Fall back to local verified category data for this state
      const fallback = category === 'campuses'
        ? getCampusesForState(selectedState)
        : category === 'hostels'
          ? getHostelsForState(selectedState)
          : getCentersForState(selectedState);
      setLocations(fallback);
      setSelectedLocation(fallback[0] || null);
      setSummary(`Showing offline verified ${category === 'campuses' ? 'campuses' : (category === 'hostels' ? 'student accommodation' : 'CBT centers')} for ${selectedState}.`);
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

  // Active query for external map and embedded iframe fallback
  const activeMapQuery = useMemo(() => {
    if (selectedLocation) {
      return `${selectedLocation.name}, ${selectedLocation.address}, ${selectedLocation.state || selectedState}, Nigeria`;
    }
    return `JAMB CBT Center, ${selectedState}, Nigeria`;
  }, [selectedLocation, selectedState]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <Compass className="w-3.5 h-3.5" />
            Google Maps Platform Grounded Locator
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            JAMB CBT Center & Campus Locator
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Locate official accredited JAMB CBT examination centers, university & polytechnic campuses, and candidate accommodation across Nigeria with real-time Google Maps integration.
          </p>
        </div>
      </div>

      {/* OpenStreetMap & Map Engine Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 sm:p-5 text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <p className="font-bold text-emerald-950 dark:text-emerald-100">
                Interactive Campus & CBT Center Navigation
              </p>
              <span className="px-2 py-0.5 bg-emerald-200/70 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-semibold text-[10px] rounded-full">
                Live OpenStreetMap
              </span>
            </div>
            <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
              Explore official accredited testing centers, university faculties, and candidate routes. Tap any marker to view location details and open turn-by-turn directions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://www.openstreetmap.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold whitespace-nowrap transition-all shadow-sm"
          >
            Visit OpenStreetMap.org
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
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
                    : `e.g. Main campus location in ${selectedState}`
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
            `Student hostels in ${selectedState}`,
            `Off-campus lodges near campus`
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                if (preset.includes('campus') || preset.includes('University')) {
                  if (category !== 'campuses') setCategory('campuses');
                } else if (preset.includes('hostel') || preset.includes('lodges')) {
                  if (category !== 'hostels') setCategory('hostels');
                } else {
                  if (category !== 'cbt_centers') setCategory('cbt_centers');
                }
                handleQuickPreset(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map & Center List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map Container */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
          <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Interactive Center Map ({selectedState})
              </h2>
            </div>

            {/* Map Engine Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMapEngine('osm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mapEngine === 'osm'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                OpenStreetMap (Free)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (googleMapsApiKey) {
                    setMapEngine('google');
                  } else {
                    const searchTerm = query.trim() || `${selectedState} CBT centers and universities`;
                    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchTerm)}`;
                    window.open(gmapsUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mapEngine === 'google'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Google Maps ↗
              </button>
            </div>
          </div>

          {/* Map View Area */}
          <div className="w-full h-[450px] relative bg-slate-100 dark:bg-slate-800">
            {mapEngine === 'osm' ? (
              <OpenStreetMapViewer
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={(loc) => {
                  setSelectedLocation(loc);
                  setSelectedMarker(loc);
                }}
                centerCoords={mapCenter}
              />
            ) : googleMapsApiKey ? (
              <APIProvider apiKey={googleMapsApiKey} language="en" region="NG">
                <Map
                  mapId="DEMO_MAP_ID"
                  defaultCenter={mapCenter}
                  center={mapCenter}
                  defaultZoom={12}
                  style={{ width: '100%', height: '100%' }}
                  internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                  gestureHandling="greedy"
                >
                  {locations.map((loc, idx) => (
                    loc.lat && loc.lng ? (
                      <AdvancedMarker
                        key={idx}
                        position={{ lat: loc.lat, lng: loc.lng }}
                        onClick={() => {
                          setSelectedMarker(loc);
                          setSelectedLocation(loc);
                        }}
                      >
                        <Pin
                          background={selectedLocation?.name === loc.name ? '#059669' : '#0284c7'}
                          borderColor="#ffffff"
                          glyphColor="#ffffff"
                        />
                      </AdvancedMarker>
                    ) : null
                  ))}

                  {selectedMarker && selectedMarker.lat && selectedMarker.lng && (
                    <InfoWindow
                      position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="p-2 max-w-[220px] text-slate-900">
                        <h4 className="font-bold text-xs">{selectedMarker.name}</h4>
                        <p className="text-[11px] text-slate-600 mt-1">{selectedMarker.address}</p>
                        {selectedMarker.lga && (
                          <p className="text-[10px] text-slate-500 font-medium">LGA: {selectedMarker.lga}</p>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${selectedMarker.name}, ${selectedMarker.address}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                        >
                          Directions in Google Maps →
                        </a>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              // Embedded Interactive Google Map Iframe Fallback
              <iframe
                title="Google Maps CBT Center Locator"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(activeMapQuery)}&output=embed`}
              />
            )}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Click any center from the list to focus on the map</span>
            {mapEngine === 'osm' ? (
              <a
                href={selectedLocation?.lat && selectedLocation?.lng
                  ? `https://www.openstreetmap.org/?mlat=${selectedLocation.lat}&mlon=${selectedLocation.lng}#map=16/${selectedLocation.lat}/${selectedLocation.lng}`
                  : `https://www.openstreetmap.org/search?query=${encodeURIComponent(activeMapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Open in OpenStreetMap
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Open Full Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Centers & Institutions List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-100 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {category === 'campuses' ? 'Verified Campuses & Institutions' : (category === 'hostels' ? 'Verified Student Accommodation' : 'Verified Accredited Centers')} ({locations.length})
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {summary}
            </p>
          </div>

          {loading && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Updating centers from Google Maps grounding...
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {locations.map((loc, idx) => {
              const isSelected = selectedLocation?.name === loc.name;
              const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${loc.name}, ${loc.address}, ${loc.state || selectedState}, Nigeria`)}`;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setSelectedMarker(loc);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 shadow-sm ring-1 ring-emerald-400/40'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {loc.name}
                    </h4>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md shrink-0">
                      {loc.lga || loc.state || selectedState}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{loc.address}</span>
                  </p>

                  {loc.capacity && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Seating Capacity: {loc.capacity} candidates</span>
                    </p>
                  )}

                  {loc.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg mt-2 border border-slate-100 dark:border-slate-800">
                      💡 {loc.notes}
                    </p>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      Focus on Map
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {loc.lat && loc.lng && (
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=16/${loc.lat}/${loc.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded-lg transition-all"
                          title="View on OpenStreetMap"
                        >
                          <Globe className="w-2.5 h-2.5 text-emerald-600" />
                          OSM View
                          <ExternalLink className="w-2 h-2 opacity-70" />
                        </a>
                      )}

                      <a
                        href={mapDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-xs"
                      >
                        <Navigation className="w-3 h-3" />
                        Directions
                        <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
