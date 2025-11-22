"use client";

import { ReportStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ReportStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<ReportStatus, { bg: string; text: string; border: string; icon: string }> = {
  Pending: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    icon: "○",
  },
  Stored: {
    bg: "bg-sigilo-teal/20",
    text: "text-sigilo-teal",
    border: "border-sigilo-teal/30",
    icon: "◉",
  },
  Verified: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500/30",
    icon: "✓",
  },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${config.bg} ${config.text} ${config.border} ${sizeClasses}
      `}
    >
      <span className="text-[10px]">{config.icon}</span>
      {status}
    </span>
  );
}
