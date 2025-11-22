"use client";

import { useState, useMemo } from "react";
import { Report, Role } from "@/lib/types";

interface ReportNetworkProps {
  reports: Report[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const roleColors: Record<Role, { fill: string; stroke: string; glow: string }> = {
  Journalist: {
    fill: "#3b82f6",
    stroke: "#60a5fa",
    glow: "rgba(59, 130, 246, 0.4)",
  },
  "Public official": {
    fill: "#f59e0b",
    stroke: "#fbbf24",
    glow: "rgba(245, 158, 11, 0.4)",
  },
  Citizen: {
    fill: "#14b8a6",
    stroke: "#2dd4bf",
    glow: "rgba(20, 184, 166, 0.4)",
  },
};

export function ReportNetwork({ reports, selectedId, onSelect }: ReportNetworkProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Calculate node positions in a radial layout
  const nodes = useMemo(() => {
    const centerX = 200;
    const centerY = 180;
    const baseRadius = 120;

    return reports.map((report, index) => {
      const angle = (index / reports.length) * Math.PI * 2 - Math.PI / 2;
      // Add some variation to radius for organic feel
      const radiusVariation = (index % 3) * 15;
      const radius = baseRadius + radiusVariation;

      return {
        report,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        angle,
      };
    });
  }, [reports]);

  // Generate connections between nearby nodes
  const connections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];

    for (let i = 0; i < nodes.length; i++) {
      // Connect to next 2 neighbors
      for (let j = 1; j <= 2; j++) {
        const nextIndex = (i + j) % nodes.length;
        const node1 = nodes[i];
        const node2 = nodes[nextIndex];

        lines.push({
          x1: node1.x,
          y1: node1.y,
          x2: node2.x,
          y2: node2.y,
          opacity: 0.15 - j * 0.03,
        });
      }
    }

    return lines;
  }, [nodes]);

  const activeNode = nodes.find(
    (n) => n.report.id === hoveredId || n.report.id === selectedId
  );

  return (
    <div className="relative w-full h-[360px] bg-sigilo-surface/30 rounded-xl border border-sigilo-border/30 overflow-hidden">
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <svg viewBox="0 0 400 360" className="w-full h-full">
        {/* Connection lines */}
        {connections.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(20, 184, 166, 0.3)"
            strokeWidth="1"
            opacity={line.opacity}
          />
        ))}

        {/* Center node */}
        <circle
          cx="200"
          cy="180"
          r="8"
          fill="rgba(20, 184, 166, 0.3)"
          stroke="rgba(20, 184, 166, 0.6)"
          strokeWidth="1"
        />

        {/* Report nodes */}
        {nodes.map(({ report, x, y }) => {
          const colors = roleColors[report.role];
          const isActive = report.id === selectedId || report.id === hoveredId;

          return (
            <g key={report.id}>
              {/* Connection to center */}
              <line
                x1={x}
                y1={y}
                x2="200"
                y2="180"
                stroke="rgba(20, 184, 166, 0.15)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Glow effect for active */}
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r="18"
                  fill={colors.glow}
                  className="animate-pulse"
                />
              )}

              {/* Pulse animation ring */}
              <circle
                cx={x}
                cy={y}
                r="12"
                fill="none"
                stroke={colors.stroke}
                strokeWidth="1"
                opacity="0.3"
                className="animate-ping"
                style={{ animationDuration: `${2 + (report.id.charCodeAt(5) % 3)}s` }}
              />

              {/* Main node */}
              <circle
                cx={x}
                cy={y}
                r={isActive ? 10 : 8}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isActive ? 2 : 1}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelect(report.id)}
                onMouseEnter={() => setHoveredId(report.id)}
                onMouseLeave={() => setHoveredId(null)}
              />

              {/* Status indicator */}
              <circle
                cx={x + 6}
                cy={y - 6}
                r="3"
                fill={
                  report.status === "Verified"
                    ? "#22c55e"
                    : report.status === "Stored"
                    ? "#14b8a6"
                    : "#eab308"
                }
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {activeNode && (
        <div
          className="absolute z-10 bg-sigilo-card/95 backdrop-blur-sm border border-sigilo-border rounded-lg p-3 max-w-[220px] shadow-xl"
          style={{
            left: Math.min(activeNode.x + 20, 180),
            top: Math.min(activeNode.y - 10, 260),
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: roleColors[activeNode.report.role].fill }}
            />
            <span className="text-xs font-medium text-sigilo-text-primary">
              {activeNode.report.role}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                activeNode.report.status === "Verified"
                  ? "bg-green-500/20 text-green-400"
                  : activeNode.report.status === "Stored"
                  ? "bg-sigilo-teal/20 text-sigilo-teal"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {activeNode.report.status}
            </span>
          </div>
          <p className="text-xs text-sigilo-text-secondary line-clamp-2 mb-2">
            {activeNode.report.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {activeNode.report.methods?.map((method) => (
              <span
                key={method}
                className="text-[9px] px-1 py-0.5 bg-sigilo-border/30 text-sigilo-text-muted rounded"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-4 text-[10px] text-sigilo-text-muted">
        {(Object.keys(roleColors) as Role[]).map((role) => (
          <div key={role} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: roleColors[role].fill }}
            />
            <span>{role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
