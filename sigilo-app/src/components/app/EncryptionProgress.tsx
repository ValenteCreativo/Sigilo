"use client";

interface EncryptionProgressProps {
  progress: number;
  step: string;
  type: "encryption" | "verification" | "submission";
}

const typeConfig = {
  encryption: {
    title: "Encrypting Report",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "sigilo-teal",
  },
  verification: {
    title: "vLayer ZK Verification",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "sigilo-teal",
  },
  submission: {
    title: "EVVM Submission",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: "sigilo-teal",
  },
};

export function EncryptionProgress({ progress, step, type }: EncryptionProgressProps) {
  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Animated icon */}
        <div className="relative mb-6 inline-block">
          <div className="text-sigilo-teal animate-pulse">{config.icon}</div>
          {/* Rotating ring */}
          <div className="absolute inset-0 -m-4">
            <svg className="w-14 h-14 animate-spin" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="rgba(20, 184, 166, 0.2)"
                strokeWidth="2"
              />
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${progress * 1.26} 126`}
                transform="rotate(-90 25 25)"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-sigilo-text-primary mb-2">
          {config.title}
        </h3>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 bg-sigilo-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sigilo-teal to-sigilo-teal-light transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-sigilo-text-muted mt-1">
            <span>{progress}%</span>
            <span>{progress === 100 ? "Complete" : "Processing..."}</span>
          </div>
        </div>

        {/* Current step */}
        <p className="text-sm text-sigilo-text-secondary font-mono">{step}</p>

        {/* Binary data visualization */}
        <div className="mt-4 p-3 bg-sigilo-surface rounded-lg overflow-hidden">
          <div className="font-mono text-xs text-sigilo-teal/60 break-all animate-pulse">
            {Array.from({ length: 4 }, () =>
              Array.from({ length: 32 }, () => Math.round(Math.random())).join("")
            ).join(" ")}
          </div>
        </div>
      </div>
    </div>
  );
}
