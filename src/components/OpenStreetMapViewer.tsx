import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink } from 'lucide-react';

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

interface OpenStreetMapViewerProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (loc: LocationItem) => void;
  centerCoords: { lat: number; lng: number };
}

// Self-contained SVG markers so no external PNG downloads or CORS issues occur
const createMarkerIcon = (isSelected: boolean) => {
  const bg = isSelected ? '#059669' : '#0284c7';
  const size = isSelected ? 36 : 28;
  const half = size / 2;
  return L.divIcon({
    className: 'custom-osm-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${bg};
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        color: #ffffff;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <svg width="${isSelected ? 20 : 16}" height="${isSelected ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half]
  });
};

export const OpenStreetMapViewer: React.FC<OpenStreetMapViewerProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  centerCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) return;

    // Safety clear any residual leaflet DOM cache
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    try {
      const initialLat = centerCoords.lat || 6.5244;
      const initialLng = centerCoords.lng || 3.3792;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size to guarantee tiles render properly within layout
      const timer = setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (e) {}
      }, 150);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {}
          mapInstanceRef.current = null;
        }
      };
    } catch (err) {
      console.warn('Leaflet map initialization warning:', err);
    }
  }, []);

  // Update center when centerCoords change
  useEffect(() => {
    if (mapInstanceRef.current && centerCoords?.lat && centerCoords?.lng) {
      mapInstanceRef.current.setView([centerCoords.lat, centerCoords.lng], 12);
    }
  }, [centerCoords.lat, centerCoords.lng]);

  // Update markers whenever locations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => {
      try {
        m.remove();
      } catch (e) {}
    });
    markersRef.current = {};

    locations.forEach((loc) => {
      if (!loc.lat || !loc.lng) return;

      const isSelected = selectedLocation?.name === loc.name;
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createMarkerIcon(isSelected),
        title: loc.name
      }).addTo(map);

      const osmDirectionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${loc.lat}%2C${loc.lng}`;
      const osmDetailUrl = `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=16/${loc.lat}/${loc.lng}`;

      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 250px; padding: 4px;">
          <h4 style="font-weight: 700; font-size: 13px; margin: 0 0 4px 0; color: #0f172a; line-height: 1.3;">${loc.name}</h4>
          <p style="font-size: 11px; margin: 0 0 4px 0; color: #475569; line-height: 1.4;">${loc.address}</p>
          ${loc.lga ? `<p style="font-size: 10px; margin: 0 0 6px 0; color: #059669; font-weight: 700;">LGA: ${loc.lga}</p>` : ''}
          ${loc.capacity ? `<p style="font-size: 10px; margin: 0 0 6px 0; color: #64748b; font-weight: 600;">Capacity: ${loc.capacity} workstations</p>` : ''}
          <div style="display: flex; gap: 8px; margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <a href="${osmDetailUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #059669; text-decoration: underline; font-weight: 700;">
              OpenStreetMap ↗
            </a>
            <a href="${osmDirectionsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #2563eb; text-decoration: underline; font-weight: 700;">
              Directions ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      markersRef.current[loc.name] = marker;
    });
  }, [locations, selectedLocation, onSelectLocation]);

  // Smoothly fly to selected location and open popup
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocation?.lat || !selectedLocation?.lng) return;

    try {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 14, {
        duration: 0.8
      });

      const activeMarker = markersRef.current[selectedLocation.name];
      if (activeMarker) {
        activeMarker.setIcon(createMarkerIcon(true));
        activeMarker.openPopup();
      }

      // Reset others
      Object.entries(markersRef.current).forEach(([name, marker]) => {
        if (name !== selectedLocation.name) {
          marker.setIcon(createMarkerIcon(false));
        }
      });
    } catch (e) {
      console.warn('Map flyTo warning:', e);
    }
  }, [selectedLocation]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Attribution and OpenStreetMap direct link badge */}
      <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1 z-1000 shadow-xs">
        <span>Powered by</span>
        <a
          href="https://www.openstreetmap.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-emerald-600 hover:text-emerald-700 underline flex items-center gap-0.5"
        >
          OpenStreetMap
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
