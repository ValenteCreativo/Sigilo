"use client";

import { Role } from "@/lib/types";

interface RoleBadgeProps {
  role: Role;
  size?: "sm" | "md";
}

const roleConfig: Record<Role, { bg: string; text: string; border: string }> = {
  Journalist: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  "Public official": {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  Citizen: {
    bg: "bg-sigilo-teal/20",
    text: "text-sigilo-teal",
    border: "border-sigilo-teal/30",
  },
};

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  const config = roleConfig[role];
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${config.bg} ${config.text} ${config.border} ${sizeClasses}
      `}
    >
      {role}
    </span>
  );
}
