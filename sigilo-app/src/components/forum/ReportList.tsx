"use client";

import { Report } from "@/lib/types";
import { RoleBadge } from "./RoleBadge";
import { StatusBadge } from "./StatusBadge";
import { MethodPill } from "./MethodPill";

interface ReportListProps {
  reports: Report[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ReportList({ reports, selectedId, onSelect }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-[360px] bg-sigilo-surface/30 rounded-xl border border-sigilo-border/30">
        <p className="text-sigilo-text-muted text-sm">No signals match your filters</p>
      </div>
    );
  }

  return (
    <div className="h-[360px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-sigilo-border scrollbar-track-transparent">
      {reports.map((report) => {
        const isSelected = report.id === selectedId;

        return (
          <div
            key={report.id}
            onClick={() => onSelect(report.id)}
            className={`
              p-4 rounded-xl border cursor-pointer transition-all duration-200
              ${
                isSelected
                  ? "bg-sigilo-teal/10 border-sigilo-teal/40"
                  : "bg-sigilo-surface/50 border-sigilo-border/30 hover:bg-sigilo-surface hover:border-sigilo-border/50"
              }
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RoleBadge role={report.role} />
                <StatusBadge status={report.status} />
              </div>
              <span className="text-[10px] text-sigilo-text-muted font-mono">
                {report.id.substring(0, 12)}...
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-sigilo-text-secondary line-clamp-2 mb-3">
              {report.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-sigilo-text-muted mb-2">
              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              {report.location && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {report.location}
                </span>
              )}
            </div>

            {/* Methods */}
            {report.methods && report.methods.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {report.methods.map((method) => (
                  <MethodPill key={method} method={method} />
                ))}
              </div>
            )}

            {/* CID preview */}
            {report.cid && (
              <div className="mt-2 pt-2 border-t border-sigilo-border/20">
                <span className="text-[10px] text-sigilo-text-muted font-mono truncate block">
                  CID: {report.cid.substring(0, 24)}...
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
