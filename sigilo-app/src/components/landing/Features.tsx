"use client";

import { Card } from "@/components/ui";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const StealthIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const VerificationIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const EncryptionIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const features: Feature[] = [
  {
    title: "Stealth interface",
    description:
      "Sigilo looks like a simple calculator. A hidden gesture and a PIN unlock a secure whistleblowing dashboard that only you can see.",
    icon: <StealthIcon />,
  },
  {
    title: "Anonymous verification",
    description:
      "vLayer zkTLS proves that you are a journalist, public official or citizen—without revealing who you are, where you work or which account you use.",
    icon: <VerificationIcon />,
  },
  {
    title: "Encrypted evidence",
    description:
      "Your reports and files are encrypted end-to-end, stored on Filecoin, and anchored into isolated virtual chains on EVVM for integrity and durability.",
    icon: <EncryptionIcon />,
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          How Sigilo protects you
        </h2>
        <p className="text-sigilo-text-secondary text-center mb-12 max-w-2xl mx-auto">
          Multiple layers of protection ensure your identity remains hidden while
          your voice is heard.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} glass glow className="hover:scale-[1.02] transition-transform duration-300">
              <div className="text-sigilo-teal mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-sigilo-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sigilo-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
