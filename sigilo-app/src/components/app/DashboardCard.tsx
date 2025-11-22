"use client";

import { DashboardCardProps } from "@/types";

export function DashboardCard({
  title,
  children,
  className = "",
  icon,
}: DashboardCardProps) {
  return (
    <div
      className={`
        bg-sigilo-card/80 backdrop-blur-sm
        border border-sigilo-border/50
        rounded-xl p-4
        ${className}
      `}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-sigilo-teal">{icon}</span>}
        <h3 className="font-semibold text-sigilo-text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}
