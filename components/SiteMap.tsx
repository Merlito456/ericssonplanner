
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Site, SiteStatus } from '../types.ts';

interface SiteMapProps {
  sites: Site[];
  onSiteClick: (site: Site) => void;
}

const SiteMap: React.FC<SiteMapProps> = ({ sites, onSiteClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Projection focused on Philippines
    const projection = d3.geoMercator()
      .center([121.7740, 12.8797])
      .scale(2500)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Using a more reliable GeoJSON source for Philippines to avoid 404s
    d3.json('https://raw.githubusercontent.com/macapagaljs/philippines-geojson/master/philippines.json')
      .then((data: any) => {
        svg.append("g")
          .selectAll("path")
          .data(data.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "#e2e8f0")
          .attr("stroke", "#94a3b8")
          .attr("stroke-width", 0.5);

        // Plot sites
        const siteMarkers = svg.append("g")
          .selectAll("circle")
          .data(sites)
          .enter()
          .append("circle")
          .attr("cx", d => {
            const coords = projection([d.coordinates.lng, d.coordinates.lat]);
            return coords ? coords[0] : 0;
          })
          .attr("cy", d => {
            const coords = projection([d.coordinates.lng, d.coordinates.lat]);
            return coords ? coords[1] : 0;
          })
          .attr("r", 8)
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
          .attr("class", "cursor-pointer hover:scale-125 transition-transform")
          .on("click", (event, d) => onSiteClick(d));
        
        // Add labels for some sites
        svg.append("g")
          .selectAll("text")
          .data(sites)
          .enter()
          .append("text")
          .attr("x", d => {
            const coords = projection([d.coordinates.lng, d.coordinates.lat]);
            return coords ? coords[0] + 10 : 0;
          })
          .attr("y", d => {
            const coords = projection([d.coordinates.lng, d.coordinates.lat]);
            return coords ? coords[1] + 4 : 0;
          })
          .text(d => d.id)
          .attr("font-size", "10px")
          .attr("class", "pointer-events-none fill-slate-500 font-medium");
      })
      .catch(error => {
        console.error("Map Load Error", error);
        // Fallback or error state UI
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .text("Failed to load map data. Please check connectivity.");
      });

  }, [sites, onSiteClick]);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800">Deployment Geospatial View</h3>
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> In Progress</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Blocked</div>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-[500px]" />
    </div>
  );
};

export default SiteMap;
