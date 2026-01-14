
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
          .attr("stroke-width", 0.5);

        const markers = g.append("g")
          .selectAll("g")
          .data(sites)
          .enter()
          .append("g")
          .attr("transform", d => {
            // Updated to use d.lng and d.lat from database schema
            const coords = projection([d.lng, d.lat]);
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
          .attr("stroke-width", 2);

        if (!mini) {
          markers.append("text")
            .attr("x", 12)
            .attr("y", 4)
            .text(d => d.id)
            .attr("class", "text-[10px] font-black fill-slate-500 pointer-events-none uppercase tracking-tighter");
        }
      })
      .catch(err => {
        console.error("Map Sync Error:", err);
        setLoading(false);
        setError(true);
      });

  }, [sites, mini, onSiteClick]);

  return (
    <div className={`relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm ${mini ? 'h-[250px]' : 'h-[600px] w-full'}`}>
      {loading && (
        <div className="absolute inset-0 z-20 bg-slate-50/50 backdrop-blur-[2px] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map Telemetry Sync...</p>
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full bg-slate-50" />
    </div>
  );
};

export default SiteMap;
