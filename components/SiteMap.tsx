
import React, { useEffect, useRef } from 'react';
import { Site, SiteStatus } from '../types.ts';

// Use global Leaflet instance provided by script tags in index.html
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
        // Start centered on the Philippines
        center: [12.8797, 121.7740],
        zoom: mini ? 5 : 6,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);

      // Initialize MarkerClusterGroup instead of LayerGroup
      if (!mini && L.markerClusterGroup) {
        markersRef.current = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          disableClusteringAtZoom: 16
        }).addTo(mapRef.current);
      } else {
        markersRef.current = L.layerGroup().addTo(mapRef.current);
      }

      // CRITICAL: Leaflet needs to know the container size after it's rendered in the DOM.
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    }

    // Update markers and adjust focus
    if (markersRef.current && mapRef.current) {
      markersRef.current.clearLayers();

      const validSites = (sites || []).filter(s => s.lat && s.lng);

      validSites.forEach(site => {
        const color = getStatusColor(site.status);
        const dotSize = mini ? 8 : 12;
        
        // Custom HTML for the icon including Site ID and Name
        const iconHtml = `
          <div style="display: flex; flex-direction: column; align-items: center; pointer-events: none;">
            <div style="background-color: ${color}; width: ${dotSize}px; height: ${dotSize}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); margin-bottom: 2px;"></div>
            ${!mini ? `
              <div style="
                white-space: nowrap; 
                background: rgba(255, 255, 255, 0.95); 
                padding: 1px 4px; 
                border-radius: 4px; 
                border: 1px solid #e2e8f0; 
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0px;
              ">
                <span style="color: #2563eb; font-weight: 900; font-size: 8px; text-transform: uppercase; line-height: 1;">${site.id}</span>
                <span style="color: #475569; font-weight: 600; font-size: 8px; line-height: 1.2;">${site.name}</span>
              </div>
            ` : ''}
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-marker-wrapper',
          html: iconHtml,
          iconSize: [100, 40], // Large enough area for the text
          iconAnchor: [50, 6] // Anchored at the horizontal center of the dot
        });

        const marker = L.marker([site.lat, site.lng], { icon })
          .on('click', () => onSiteClick(site));

        markersRef.current?.addLayer(marker);
      });

      // Adjust focus
      if (!mini) {
        if (validSites.length > 0) {
          const bounds = L.latLngBounds(validSites.map(s => [s.lat, s.lng]));
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitBounds(bounds, { 
                padding: [50, 50], 
                maxZoom: 12,
                animate: true 
              });
            }
          }, 150);
        } else {
          mapRef.current.setView([12.8797, 121.7740], 6);
        }
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (mapContainerRef.current) {
        resizeObserver.unobserve(mapContainerRef.current);
      }
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
        style={{ height: '100%', width: '100%' }}
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
