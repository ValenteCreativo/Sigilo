"use client";

interface MethodPillProps {
  method: string;
}

const methodColors: Record<string, string> = {
  "vLayer zkTLS": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Filecoin: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "EVVM anchor": "bg-sigilo-teal/20 text-sigilo-teal border-sigilo-teal/30",
  "Aztec (planned)": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function MethodPill({ method }: MethodPillProps) {
  const colorClasses = methodColors[method] || "bg-sigilo-border/30 text-sigilo-text-muted border-sigilo-border/50";

  return (
    <span
      className={`
        inline-flex items-center text-[10px] px-1.5 py-0.5 rounded border font-mono
        ${colorClasses}
      `}
    >
      {method}
    </span>
  );
}
