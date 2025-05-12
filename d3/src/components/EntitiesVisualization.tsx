'use client'

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Define the TypeScript interface for your node data
export interface EntityNode {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  source_system: string | null;
  source_id: string | null;
  // D3 simulation will add these properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

// Define the link interface
export interface EntityLink {
  source: string;
  target: string;
  value: number;
  weight?: number; // For styling based on weight
}

export interface D3GraphDataContainer {
  nodes: EntityNode[];
  links: EntityLink[];
}

// Helper functions for link styling
function getLinkColor(weight: number): string {
  if (weight <= 30) return "red";
  if (weight <= 50) return "orange";
  if (weight <= 70) return "gold";
  if (weight <= 100) return "blue";
  return "#999";
}

function getLinkStrokeWidth(weight: number): number {
  if (weight <= 30) return 1.5;
  if (weight <= 50) return 2.5;
  if (weight <= 70) return 3.5;
  if (weight <= 100) return 4.5;
  return 1;
}

// Define props for your D3 component
interface D3EntityGraphProps {
  nodesData: EntityNode[];
  linksData?: EntityLink[];
  width?: number;
  height?: number;
}

const D3EntityGraph: React.FC<D3EntityGraphProps> = ({
  nodesData,
  linksData = [],
  width = 800,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentNodes, setCurrentNodes] = useState<EntityNode[]>([]);
  const [currentLinks, setCurrentLinks] = useState<any[]>([]);
  
  // Process incoming data
  useEffect(() => {
    if (nodesData.length === 0) return;
    
    // Deep clone nodes
    const nodes = nodesData.map(node => ({...node}));
    
    // Process links and add random weights if not present
    const links = linksData.map(link => ({
      ...link,
      weight: link.weight || Math.floor(Math.random() * 100) + 1
    }));
    
    setCurrentNodes(nodes);
    setCurrentLinks(links);
  }, [nodesData, linksData]);

  useEffect(() => {
    if (!svgRef.current || currentNodes.length === 0) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
      return;
    }

    // Clear SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create tooltip - using a unique ID based on component instance
    const tooltipId = `node-tooltip-${Math.random().toString(36).substr(2, 9)}`;
    
    // Remove any existing tooltips from previous renders to avoid duplicates
    d3.select("body").selectAll("div.entity-graph-tooltip").remove();
    
    // Create a new tooltip
    const tooltip = d3.select("body").append("div")
      .attr("id", tooltipId)
      .attr("class", "entity-graph-tooltip") // Use a common class for cleanup
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(255, 255, 255, 0.95)")
      .style("padding", "10px")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("box-shadow", "0px 2px 4px rgba(0,0,0,0.1)")
      .style("pointer-events", "none") 
      .style("font-family", "sans-serif")
      .style("font-size", "12px")
      .style("z-index", "10");

    // Add zoom functionality
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);

    // Create a container group for all elements
    const g = svg.append("g");

    // Set up color scale for organizations
    const uniqueOrgIds = Array.from(new Set(currentNodes.map(node => node.organization_id)));
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(uniqueOrgIds);

    // Process nodes and links for D3
    const nodesMap = new Map(currentNodes.map(node => [node.id, { ...node }]));
    
    // Convert link IDs to actual node objects for D3 force simulation
    const processedLinks = currentLinks.map(link => ({
      source: nodesMap.get(link.source) || link.source,
      target: nodesMap.get(link.target) || link.target,
      value: link.value,
      weight: link.weight
    }));

    // Set up the force simulation
    const simulation = d3.forceSimulation(currentNodes)
      .force("link", d3.forceLink(processedLinks)
        .id((d: any) => d.id)
        .distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Create link groups (containing both lines and text)
    const linkGroup = g.append("g")
      .attr("class", "links-layer")
      .selectAll("g.link-unit")
      .data(processedLinks)
      .join("g")
      .attr("class", "link-unit");

    // Add the lines to each link group
    const links = linkGroup.append("line")
      .attr("stroke", d => getLinkColor(d.weight))
      .attr("stroke-opacity", 0.75)
      .attr("stroke-width", d => getLinkStrokeWidth(d.weight))
      .style("pointer-events", "stroke")
      .on("dblclick", handleLinkDoubleClick);

    // Add the weight text labels to each link group
    const linkLabels = linkGroup.append("text")
      .text(d => d.weight || d.value)
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .attr("pointer-events", "none");

    // Create node drag behavior
    const drag = d3.drag<SVGCircleElement, any>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Create nodes
    const nodes = g.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll<SVGCircleElement, EntityNode>("circle")
      .data(currentNodes, d => d.id)
      .join("circle")
      .attr("r", 15)
      .attr("fill", d => colorScale(d.organization_id))
      .call(drag)
      .on("dblclick", handleNodeDoubleClick)
      .on("mouseover", function(event, d) {
        // Use the tooltipId to find the current tooltip
        const currentTooltip = d3.select(`#${tooltipId}`);
        handleMouseOver(event, d, currentTooltip);
      })
      .on("mousemove", function(event, d) {
        const currentTooltip = d3.select(`#${tooltipId}`);
        handleMouseMove(event, currentTooltip);
      })
      .on("mouseout", function(event, d) {
        const currentTooltip = d3.select(`#${tooltipId}`);
        handleMouseOut(currentTooltip);
      });

    // Add node labels
    const labels = g.append("g")
      .selectAll<SVGTextElement, EntityNode>("text")
      .data(currentNodes, d => d.id)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("dy", 30)
      .text(d => d.name)
      .attr("font-size", "10px")
      .attr("font-family", "Arial")
      .attr("pointer-events", "none");

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(10, 10)`);

    uniqueOrgIds.forEach((orgId, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);
      
      legendItem.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", colorScale(orgId));
      
      legendItem.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .text(orgId)
        .attr("font-size", "12px");
    });

    // Add weight legend
    const weightLegend = svg.append("g")
      .attr("class", "weight-legend")
      .attr("transform", `translate(${width - 140}, 10)`);

    weightLegend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .text("Link Weight Legend")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");

    [
      { weight: 20, label: "≤ 30: Low" },
      { weight: 40, label: "≤ 50: Medium" },
      { weight: 60, label: "≤ 70: High" },
      { weight: 90, label: "≤ 100: Very High" }
    ].forEach((item, i) => {
      const yPos = i * 25 + 25;
      
      weightLegend.append("line")
        .attr("x1", 0)
        .attr("y1", yPos)
        .attr("x2", 30)
        .attr("y2", yPos)
        .attr("stroke", getLinkColor(item.weight))
        .attr("stroke-width", getLinkStrokeWidth(item.weight));
      
      weightLegend.append("text")
        .attr("x", 35)
        .attr("y", yPos + 4)
        .text(item.label)
        .attr("font-size", "12px");
    });

    // Update positions on each simulation tick
    simulation.on("tick", () => {
      links
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      linkLabels
        .attr("x", d => ((d.source as any).x + (d.target as any).x) / 2)
        .attr("y", d => ((d.source as any).y + (d.target as any).y) / 2);

      nodes
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      labels
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    // Handler functions for interactions
    function handleNodeDoubleClick(event: any, d_clicked_node: any) {
      event.stopPropagation();
      
      // Filter out the double-clicked node
      const filteredNodes = currentNodes.filter(n => n.id !== d_clicked_node.id);
      
      // Filter out links connected to the node
      const filteredLinks = processedLinks.filter(l => 
        l.source.id !== d_clicked_node.id && l.target.id !== d_clicked_node.id
      );
      
      // Update state with the filtered data
      setCurrentNodes(filteredNodes);
      setCurrentLinks(filteredLinks);
    }

    function handleLinkDoubleClick(event: any, d_clicked_link: any) {
      event.stopPropagation();
      
      // Filter out the double-clicked link
      const filteredLinks = processedLinks.filter(l => l !== d_clicked_link);
      
      // Update state with the filtered links
      setCurrentLinks(filteredLinks);
    }

    // Clean up on unmount
    return () => {
      simulation.stop();
      // Properly cleanup the tooltip
      d3.select(`#${tooltipId}`).remove();
      // Also clean up any other tooltips that might have been orphaned
      d3.selectAll("div.entity-graph-tooltip").remove();
    };
  }, [currentNodes, currentLinks, width, height]);

  // Tooltip handler functions
  function handleMouseOver(event: any, d: EntityNode, tooltip: any) {
    let tooltipContent = "";
    
    // Create HTML content for tooltip from node properties
    for (const key in d) {
      if (d.hasOwnProperty(key) && !key.startsWith('__') && !['x', 'y', 'vx', 'vy', 'fx', 'fy', 'index'].includes(key)) {
        const formattedKey = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());
  
        let value = (d as any)[key];
        if (typeof value === 'string' && (key === 'created_at' || key === 'updated_at')) {
          try {
            value = new Date(value).toLocaleString();
          } catch (e) {
            // Use original value if date parsing fails
          }
        }
  
        tooltipContent += `<strong>${formattedKey}:</strong> ${value}<br>`;
      }
    }
  
    tooltip.html(tooltipContent);
    tooltip.style("visibility", "visible");
    tooltip.style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 28) + "px");
  }
  
  function handleMouseMove(event: any, tooltip: any) {
    if (tooltip) {
      tooltip.style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
    }
  }
  
  function handleMouseOut(tooltip: any) {
    if (tooltip) {
      tooltip.style("visibility", "hidden");
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Entity Relationship Visualization</h3>
      <div className="text-sm mb-2">
        <ul className="list-disc list-inside">
          <li>Double-click on a node to remove it</li>
          <li>Double-click on a link to remove it</li>
          <li>Drag nodes to reposition them</li>
          <li>Link colors and thickness indicate relationship strength</li>
        </ul>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid lightgrey', borderRadius: '8px' }}
      />
    </div>
  );
};

export default D3EntityGraph;