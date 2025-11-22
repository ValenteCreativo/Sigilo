"use client";

import { BadgeProps } from "@/types";

const variants = {
  default: "bg-sigilo-border/50 text-sigilo-text-secondary",
  success: "bg-sigilo-teal/10 text-sigilo-teal border border-sigilo-teal/30",
  warning: "bg-sigilo-amber/10 text-sigilo-amber border border-sigilo-amber/30",
  error: "bg-sigilo-red/10 text-sigilo-red border border-sigilo-red/30",
  info: "bg-sigilo-teal-muted/50 text-sigilo-teal-light border border-sigilo-teal/20",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
      `}
    >
      {children}
    </span>
  );
}
