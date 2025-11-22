"use client";

import { Badge } from "@/components/ui";

interface ArchItem {
  name: string;
  description: string;
  planned?: boolean;
}

const architectureItems: ArchItem[] = [
  {
    name: "EVVM",
    description:
      "Virtual chains for sensitive data. Each submission is recorded in a virtual blockchain running inside a smart contract, isolating sensitive references from the public execution layer.",
  },
  {
    name: "vLayer",
    description:
      "Zero-knowledge identity proofs. zkTLS allows Sigilo to confirm that a user belongs to a specific role (journalist, official, witness) without ever revealing their personal identity.",
  },
  {
    name: "Filecoin",
    description:
      "Encrypted, decentralized storage. Evidence is stored as encrypted objects on a decentralized network, removing single points of failure and subpoena-friendly servers.",
  },
  {
    name: "Aztec",
    description:
      "A privacy-first L2 to further harden on-chain traces and interactions around sensitive reports.",
    planned: true,
  },
  {
    name: "Nym",
    description:
      "Mixnet routing to strip network metadata and make network-level surveillance significantly harder.",
    planned: true,
  },
  {
    name: "GGWave",
    description:
      "Offline acoustic relays that can carry encrypted alerts between nearby devices even when the internet is blocked.",
    planned: true,
  },
  {
    name: "ml5.js",
    description:
      "On-device safeword detection to start recording or trigger alerts without touching the screen.",
    planned: true,
  },
];

export function Architecture() {
  return (
    <section id="architecture" className="py-20 px-4 bg-sigilo-surface/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left column - text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for adversarial environments
            </h2>
            <p className="text-sigilo-text-secondary mb-6">
              Sigilo combines cutting-edge cryptographic protocols, decentralized
              infrastructure, and privacy-preserving networks to create a channel
              where evidence can move—but identities cannot be hunted.
            </p>
            <p className="text-sigilo-text-muted text-sm">
              Each layer addresses a specific attack vector: identity exposure,
              data seizure, network surveillance, and physical coercion.
            </p>
          </div>

          {/* Right column - architecture list */}
          <div className="space-y-4">
            {architectureItems.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-sigilo-card/50 border border-sigilo-border/30 hover:border-sigilo-teal/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-sigilo-text-primary">
                    {item.name}
                  </h3>
                  {item.planned && (
                    <Badge variant="warning" size="sm">
                      planned
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-sigilo-text-secondary">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
