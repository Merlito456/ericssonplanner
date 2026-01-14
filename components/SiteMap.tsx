
import React, { useEffect, useRef, useState } from 'react';
import { 
  select, 
  geoMercator, 
  geoPath, 
  zoom as d3Zoom, 
  json as d3Json,
  ZoomBehavior
} from 'd3';
import { Site, SiteStatus } from '../types.ts';
import { Loader2, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface SiteMapProps {
  sites: Site[];
  onSiteClick: (site: Site) => void;
  mini?: boolean;
}

const SiteMap: React.FC<SiteMapProps> = ({ sites, onSiteClick, mini = false }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const containerWidth = svgRef.current.parentElement?.clientWidth || 800;
    const height = mini ? 250 : 600;
    
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const projection = geoMercator()
      .center([122, 13])
      .scale(mini ? 1200 : 2800)
      .translate([containerWidth / 2, height / 2]);

    const path = geoPath().projection(projection);

    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 15])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    if (!mini) {
      svg.call(zoomBehavior as any);
    }

    setLoading(true);
    setError(false);

    // Using JSDelivr CDN for better reliability and CORS handling
    d3Json('https://cdn.jsdelivr.net/gh/faeldon/philippines-json-maps@master/2023/geojson/provinces/lowres/philippines-provinces-lowres.json')
      .then((data: any) => {
        if (!data) throw new Error("No data received");
        setLoading(false);
        
        g.append("g")
          .selectAll("path")
          .data(data.features)
          .enter()
          .append("path")
          .attr("d", path as any)
          .attr("fill", "#f1f5f9")
          .attr("stroke", "#cbd5e1")
          .attr("stroke-width", 0.5)
          .attr("class", "transition-colors duration-300 hover:fill-slate-200");

        const markers = g.append("g")
          .selectAll("g")
          .data(sites)
          .enter()
          .append("g")
          .attr("transform", d => {
            const coords = projection([d.coordinates.lng, d.coordinates.lat]);
            return coords ? `translate(${coords[0]}, ${coords[1]})` : `translate(0,0)`;
          })
          .attr("class", "cursor-pointer")
          .on("click", (event, d) => {
            event.stopPropagation();
            onSiteClick(d);
          });

        markers.append("circle")
          .attr("r", mini ? 4 : 8)
          .attr("fill", d => {
            switch(d.status) {
              case SiteStatus.COMPLETED: return "#10b981";
              case SiteStatus.IN_PROGRESS: return "#3b82f6";
              case SiteStatus.BLOCKED: return "#ef4444";
              case SiteStatus.SURVEYED: return "#f59e0b";
              default: return "#94a3b8";
            }
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .attr("class", "transition-transform duration-300 hover:scale-150 shadow-xl");

        if (!mini) {
          markers.append("text")
            .attr("x", 12)
            .attr("y", 4)
            .text(d => d.id)
            .attr("class", "text-[10px] font-black fill-slate-500 pointer-events-none uppercase tracking-tighter");
        }
      })
      .catch(err => {
        console.error("Map Data Fetch Error:", err);
        setLoading(false);
        setError(true);
      });

  }, [sites, mini, onSiteClick]);

  return (
    <div className={`relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm ${mini ? 'h-[250px]' : 'h-[600px] w-full'}`}>
      {!mini && (
        <div className="absolute top-6 left-6 z-10 space-y-2">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Live Deployment Map</h3>
            <div className="space-y-2">
              {[
                { label: 'Completed', color: 'bg-emerald-500' },
                { label: 'In Progress', color: 'bg-blue-500' },
                { label: 'Blocked', color: 'bg-red-500' },
                { label: 'Planned/Pending', color: 'bg-slate-400' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color} border border-white`}></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-20 bg-slate-50/50 backdrop-blur-[2px] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Clusters...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 bg-red-50/50 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <RefreshCw className="text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Network Sync Interrupted</h3>
          <p className="text-sm text-slate-500 max-w-xs mb-6">Unable to retrieve nationwide geospatial telemetry. Please verify your connection to the Ericsson backend.</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-red-500/20">Retry Handshake</button>
        </div>
      )}

      {!mini && !error && !loading && (
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
          <button className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50 transition-colors" title="Zoom In"><ZoomIn size={18}/></button>
          <button className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50 transition-colors" title="Zoom Out"><ZoomOut size={18}/></button>
          <button className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50 transition-colors" title="Reset"><Maximize2 size={18}/></button>
        </div>
      )}

      <svg ref={svgRef} className={`w-full h-full bg-slate-50 ${mini ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`} />
    </div>
  );
};

export default SiteMap;
