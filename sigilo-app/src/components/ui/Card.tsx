"use client";

import { CardProps } from "@/types";

export function Card({
  children,
  className = "",
  glass = true,
  glow = false,
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl p-6
        ${glass ? "glass" : "bg-sigilo-card border border-sigilo-border"}
        ${glow ? "glow-teal" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
