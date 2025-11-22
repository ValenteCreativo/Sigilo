"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Report } from "@/lib/types";

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "report" | "tag" | "method" | "location";
  label: string;
  color: string;
  size: number;
  connections: string[];
  report?: Report;
}

interface Link {
  source: string;
  target: string;
  strength: number;
}

interface ObsidianNetworkProps {
  reports: Report[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Color palette
const COLORS = {
  report: {
    Journalist: "#3b82f6",
    "Public official": "#f59e0b",
    Citizen: "#14b8a6",
  },
  tag: "#8b5cf6",
  method: "#06b6d4",
  location: "#ec4899",
};

export function ObsidianNetwork({ reports, selectedId, onSelect }: ObsidianNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const animationRef = useRef<number>();
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const isDraggingRef = useRef(false);
  const dragNodeRef = useRef<Node | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Build nodes and links from reports
  useEffect(() => {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const tagNodes = new Map<string, Node>();
    const methodNodes = new Map<string, Node>();
    const locationNodes = new Map<string, Node>();

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Create report nodes
    reports.forEach((report, index) => {
      const angle = (index / reports.length) * Math.PI * 2;
      const radius = Math.min(dimensions.width, dimensions.height) * 0.3;

      const node: Node = {
        id: report.id,
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        type: "report",
        label: `Report ${index + 1}`,
        color: COLORS.report[report.role] || "#14b8a6",
        size: 8,
        connections: [],
        report,
      };
      nodes.push(node);

      // Create/link tag nodes
      report.riskTags?.forEach((tag) => {
        if (!tagNodes.has(tag)) {
          const tagNode: Node = {
            id: `tag-${tag}`,
            x: centerX + (Math.random() - 0.5) * dimensions.width * 0.6,
            y: centerY + (Math.random() - 0.5) * dimensions.height * 0.6,
            vx: 0,
            vy: 0,
            type: "tag",
            label: tag,
            color: COLORS.tag,
            size: 6,
            connections: [],
          };
          tagNodes.set(tag, tagNode);
          nodes.push(tagNode);
        }
        node.connections.push(`tag-${tag}`);
        tagNodes.get(tag)!.connections.push(report.id);
        links.push({ source: report.id, target: `tag-${tag}`, strength: 0.3 });
      });

      // Create/link method nodes
      report.methods?.forEach((method) => {
        if (!methodNodes.has(method)) {
          const methodNode: Node = {
            id: `method-${method}`,
            x: centerX + (Math.random() - 0.5) * dimensions.width * 0.5,
            y: centerY + (Math.random() - 0.5) * dimensions.height * 0.5,
            vx: 0,
            vy: 0,
            type: "method",
            label: method,
            color: COLORS.method,
            size: 5,
            connections: [],
          };
          methodNodes.set(method, methodNode);
          nodes.push(methodNode);
        }
        node.connections.push(`method-${method}`);
        methodNodes.get(method)!.connections.push(report.id);
        links.push({ source: report.id, target: `method-${method}`, strength: 0.2 });
      });

      // Create/link location nodes
      if (report.location) {
        if (!locationNodes.has(report.location)) {
          const locNode: Node = {
            id: `loc-${report.location}`,
            x: centerX + (Math.random() - 0.5) * dimensions.width * 0.4,
            y: centerY + (Math.random() - 0.5) * dimensions.height * 0.4,
            vx: 0,
            vy: 0,
            type: "location",
            label: report.location,
            color: COLORS.location,
            size: 5,
            connections: [],
          };
          locationNodes.set(report.location, locNode);
          nodes.push(locNode);
        }
        node.connections.push(`loc-${report.location}`);
        locationNodes.get(report.location)!.connections.push(report.id);
        links.push({ source: report.id, target: `loc-${report.location}`, strength: 0.4 });
      }
    });

    nodesRef.current = nodes;
    linksRef.current = links;
  }, [reports, dimensions]);

  // Physics simulation
  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const links = linksRef.current;

    // Apply forces
    nodes.forEach((node) => {
      // Center gravity
      const dx = dimensions.width / 2 - node.x;
      const dy = dimensions.height / 2 - node.y;
      node.vx += dx * 0.0005;
      node.vy += dy * 0.0005;

      // Repulsion from other nodes
      nodes.forEach((other) => {
        if (node.id === other.id) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 300 / (dist * dist);
        node.vx += (dx / dist) * force;
        node.vy += (dy / dist) * force;
      });
    });

    // Link forces (attraction)
    links.forEach((link) => {
      const source = nodes.find((n) => n.id === link.source);
      const target = nodes.find((n) => n.id === link.target);
      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 80) * link.strength * 0.01;

      source.vx += (dx / dist) * force;
      source.vy += (dy / dist) * force;
      target.vx -= (dx / dist) * force;
      target.vy -= (dy / dist) * force;
    });

    // Update positions
    nodes.forEach((node) => {
      if (dragNodeRef.current?.id === node.id) return;

      node.vx *= 0.9; // Damping
      node.vy *= 0.9;
      node.x += node.vx;
      node.y += node.vy;

      // Boundary constraints
      const margin = 20;
      node.x = Math.max(margin, Math.min(dimensions.width - margin, node.x));
      node.y = Math.max(margin, Math.min(dimensions.height - margin, node.y));
    });
  }, [dimensions]);

  // Render
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodes = nodesRef.current;
    const links = linksRef.current;

    // Draw links
    links.forEach((link) => {
      const source = nodes.find((n) => n.id === link.source);
      const target = nodes.find((n) => n.id === link.target);
      if (!source || !target) return;

      const isHighlighted =
        selectedId === source.id ||
        selectedId === target.id ||
        hoveredNode?.id === source.id ||
        hoveredNode?.id === target.id;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = isHighlighted ? "rgba(20, 184, 166, 0.6)" : "rgba(100, 100, 120, 0.15)";
      ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedId === node.id || selectedId === node.report?.id;
      const isHovered = hoveredNode?.id === node.id;
      const isConnected = selectedId && node.connections.includes(selectedId);

      // Glow effect for selected/hovered
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + 8, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          node.x, node.y, node.size,
          node.x, node.y, node.size + 12
        );
        gradient.addColorStop(0, `${node.color}40`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fillStyle = isSelected || isHovered || isConnected ? node.color : `${node.color}80`;
      ctx.fill();

      // Border
      if (node.type === "report") {
        ctx.strokeStyle = isSelected ? "#fff" : `${node.color}60`;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();
      }

      // Label for hovered/selected nodes
      if (isHovered || isSelected) {
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#e5e7eb";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + node.size + 14);
      }
    });

    // Draw legend
    const legendY = 20;
    const legendItems = [
      { label: "Journalist", color: COLORS.report.Journalist },
      { label: "Official", color: COLORS.report["Public official"] },
      { label: "Citizen", color: COLORS.report.Citizen },
      { label: "Tag", color: COLORS.tag },
      { label: "Method", color: COLORS.method },
      { label: "Location", color: COLORS.location },
    ];

    ctx.font = "10px Inter, system-ui, sans-serif";
    let legendX = 10;
    legendItems.forEach((item) => {
      ctx.beginPath();
      ctx.arc(legendX + 5, legendY, 4, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.fillStyle = "#9ca3af";
      ctx.textAlign = "left";
      const textWidth = ctx.measureText(item.label).width;
      ctx.fillText(item.label, legendX + 12, legendY + 3);
      legendX += textWidth + 24;
    });
  }, [selectedId, hoveredNode]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      simulate();
      render();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [simulate, render]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: 400 });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Mouse handlers
  const getNodeAtPosition = (x: number, y: number): Node | null => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy < (node.size + 5) * (node.size + 5)) {
        return node;
      }
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current = { x, y };

    if (isDraggingRef.current && dragNodeRef.current) {
      dragNodeRef.current.x = x;
      dragNodeRef.current.y = y;
      dragNodeRef.current.vx = 0;
      dragNodeRef.current.vy = 0;
    } else {
      const node = getNodeAtPosition(x, y);
      setHoveredNode(node);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = node ? "pointer" : "default";
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAtPosition(x, y);

    if (node) {
      isDraggingRef.current = true;
      dragNodeRef.current = node;
    }
  };

  const handleMouseUp = () => {
    if (dragNodeRef.current && !isDraggingRef.current) {
      // It was a click, not a drag
    }
    isDraggingRef.current = false;
    dragNodeRef.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAtPosition(x, y);

    if (node?.type === "report" && node.report) {
      onSelect(node.report.id);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="bg-sigilo-surface/30 rounded-xl border border-sigilo-border/30 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
          className="w-full"
        />
      </div>

      {/* Tooltip */}
      {hoveredNode && (
        <div
          className="absolute pointer-events-none bg-sigilo-card/95 backdrop-blur-sm rounded-lg border border-sigilo-border/50 px-3 py-2 shadow-xl z-10"
          style={{
            left: Math.min(mouseRef.current.x + 10, dimensions.width - 150),
            top: Math.min(mouseRef.current.y + 10, dimensions.height - 60),
          }}
        >
          <p className="text-xs font-medium text-sigilo-text-primary">{hoveredNode.label}</p>
          <p className="text-[10px] text-sigilo-text-muted capitalize">{hoveredNode.type}</p>
          {hoveredNode.report && (
            <p className="text-[10px] text-sigilo-text-secondary mt-1 max-w-[140px] truncate">
              {hoveredNode.report.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
