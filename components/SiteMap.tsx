
import React, { useEffect, useRef } from 'react';
import { Site, SiteStatus } from '../types.ts';

// Use global Leaflet instance provided by script tag in index.html
declare const L: any;

interface SiteMapProps {
  sites: Site[];
  onSiteClick: (site: Site) => void;
  mini?: boolean;
}

const getStatusColor = (status: SiteStatus) => {
  switch (status) {
    case SiteStatus.COMPLETED: return "#10b981";
    case SiteStatus.IN_PROGRESS: return "#3b82f6";
    case SiteStatus.BLOCKED: return "#ef4444";
    case SiteStatus.SURVEYED: return "#f59e0b";
    default: return "#94a3b8";
  }
};

const SiteMap: React.FC<SiteMapProps> = ({ sites, onSiteClick, mini = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: !mini,
        attributionControl: !mini,
        dragging: !mini,
        scrollWheelZoom: !mini,
        doubleClickZoom: !mini,
      }).setView([12.8797, 121.7740], mini ? 5 : 6); // Centered on Philippines

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);

      markersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    // Update markers
    if (markersRef.current && mapRef.current) {
      markersRef.current.clearLayers();

      sites.forEach(site => {
        if (!site.lat || !site.lng) return;
        
        const color = getStatusColor(site.status);
        const iconSize = mini ? 10 : 14;
        
        const icon = L.divIcon({
          className: 'custom-marker-container',
          html: `<div style="background-color: ${color}; width: ${iconSize}px; height: ${iconSize}px;" class="custom-marker-dot"></div>`,
          iconSize: [iconSize, iconSize],
          iconAnchor: [iconSize / 2, iconSize / 2]
        });

        const marker = L.marker([site.lat, site.lng], { icon })
          .on('click', () => onSiteClick(site));

        if (!mini) {
          marker.bindTooltip(`
            <div style="padding: 2px 4px;">
              <div style="font-weight: 900; font-size: 10px; color: #1e293b; text-transform: uppercase;">${site.id}</div>
              <div style="font-size: 10px; color: #64748b;">${site.name}</div>
            </div>
          `, { direction: 'top', offset: [0, -5], opacity: 0.9 });
        }

        markersRef.current?.addLayer(marker);
      });

      // Fit bounds if not mini and we have valid sites
      const validSites = sites.filter(s => s.lat && s.lng);
      if (!mini && validSites.length > 0) {
        const bounds = L.latLngBounds(validSites.map(s => [s.lat, s.lng]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }

    return () => {
      // Optional: Cleanup logic
    };
  }, [sites, mini, onSiteClick]);

  return (
    <div 
      className={`relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm ${mini ? 'h-[250px]' : 'h-[600px] w-full'}`}
      style={{ zIndex: 0 }}
    >
      <div 
        ref={mapContainerRef} 
        className="w-full h-full bg-slate-50"
      />
      {mini && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-200 pointer-events-none">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Preview Mode</p>
        </div>
      )}
    </div>
  );
};

export default SiteMap;
