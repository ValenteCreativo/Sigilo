"use client";

const CodeBlock = ({ code, language = "typescript" }: { code: string; language?: string }) => (
  <pre className="bg-sigilo-bg rounded-lg p-4 overflow-x-auto border border-sigilo-border/30">
    <code className="text-sm text-sigilo-text-secondary font-mono whitespace-pre">
      {code}
    </code>
  </pre>
);

const RoleCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div className="bg-sigilo-surface/50 rounded-xl border border-sigilo-border/30 p-6 hover:border-sigilo-teal/30 transition-colors">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-sigilo-text-primary mb-2">{title}</h3>
    <p className="text-sm text-sigilo-text-secondary">{description}</p>
  </div>
);

const StepCard = ({
  number,
  title,
  description,
  code,
}: {
  number: number;
  title: string;
  description: string;
  code?: string;
}) => (
  <div className="relative pl-12">
    <div className="absolute left-0 top-0 w-8 h-8 bg-sigilo-teal/20 rounded-full flex items-center justify-center">
      <span className="text-sigilo-teal font-bold text-sm">{number}</span>
    </div>
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-sigilo-text-primary">{title}</h3>
      <p className="text-sm text-sigilo-text-secondary">{description}</p>
      {code && <CodeBlock code={code} />}
    </div>
  </div>
);

export default function IntegratePage() {
  return (
    <main className="min-h-screen bg-sigilo-bg">
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* Hero */}
        <header className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-sigilo-text-primary">
            Integrate with Sigilo
          </h1>
          <p className="text-sigilo-text-secondary max-w-2xl mx-auto text-lg">
            Become part of the network that receives, validates and protects encrypted
            signals from high-risk environments.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <a
              href="mailto:security@sigilo.network"
              className="px-6 py-3 bg-sigilo-teal text-sigilo-bg font-medium rounded-lg hover:bg-sigilo-teal-light transition-colors"
            >
              Contact the team
            </a>
            <a
              href="https://github.com/ValenteCreativo/Sigilo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-sigilo-surface border border-sigilo-border text-sigilo-text-primary font-medium rounded-lg hover:bg-sigilo-card transition-colors"
            >
              View GitHub
            </a>
          </div>
        </header>

        {/* Roles section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-sigilo-text-primary text-center">
            Roles in the Network
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoleCard
              icon="🛰"
              title="Signal Receiver Node"
              description="NGOs, human-rights groups and newsrooms that subscribe to encrypted signals and, with the whistleblower's consent, can request decryption keys."
            />
            <RoleCard
              icon="🛡"
              title="Relay Node"
              description="Civic infrastructure, community servers or aligned institutions that relay encrypted payloads, increase availability and help bridge offline / online gaps."
            />
            <RoleCard
              icon="📦"
              title="Storage Witness"
              description="Infrastructure operators who pin and mirror encrypted Filecoin CIDs, guaranteeing long-term durability without accessing plaintext."
            />
          </div>
        </section>

        {/* Getting started */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-sigilo-text-primary text-center">
            Getting Started
          </h2>

          <div className="space-y-12">
            <StepCard
              number={1}
              title="Obtain Credentials"
              description="Contact the Sigilo team to receive your node keys, or generate them via the CLI tool. Your public key will be registered on the network."
            />

            <StepCard
              number={2}
              title="Register Your Node"
              description="Submit your node registration to the Sigilo API with your public key and role designation."
              code={`await fetch("https://api.sigilo.network/nodes/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    publicKey,
    role: "receiver", // "relay" | "witness"
    contact: "security@your-org.org",
  }),
});`}
            />

            <StepCard
              number={3}
              title="Subscribe to Encrypted Signals"
              description="Connect to the real-time signal stream using Server-Sent Events (SSE). You'll receive encrypted payloads as they're submitted to the network."
              code={`const stream = new EventSource(
  "https://api.sigilo.network/signals/stream?role=receiver&publicKey=..."
);

stream.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  // payload contains cid, methods[], regionHint, createdAt, etc.
};`}
            />

            <StepCard
              number={4}
              title="Request Decryption (with consent)"
              description="When investigating a case, submit a decryption request. The whistleblower must approve before keys are released."
              code={`await fetch("https://api.sigilo.network/signals/request-access", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    signalId,
    nodePublicKey,
    justification: "Investigating municipal corruption case #123",
  }),
});`}
            />
          </div>
        </section>

        {/* Signal payload format */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-sigilo-text-primary text-center">
            Signal Payload Format
          </h2>
          <CodeBlock
            code={`{
  "id": "sig_01HZX5...",
  "cid": "bafybeigd...",
  "createdAt": "2025-11-22T03:17:00.000Z",
  "role": "Journalist",
  "regionHint": "MX-CENTRO",
  "status": "Pending",
  "methods": ["vLayer zkTLS", "Filecoin", "EVVM anchor"],
  "riskTags": ["corruption", "threats", "municipal"],
  "previewHash": "0xabc123...",
  "version": 1
}`}
          />
          <div className="bg-sigilo-surface/50 rounded-xl border border-sigilo-border/30 p-6">
            <h3 className="text-sm font-medium text-sigilo-text-primary mb-4">
              Field Reference
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-4">
                <dt className="font-mono text-sigilo-teal w-28 flex-shrink-0">id</dt>
                <dd className="text-sigilo-text-secondary">
                  Unique signal identifier, prefixed with sig_
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="font-mono text-sigilo-teal w-28 flex-shrink-0">cid</dt>
                <dd className="text-sigilo-text-secondary">
                  Filecoin Content Identifier for encrypted payload
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="font-mono text-sigilo-teal w-28 flex-shrink-0">createdAt</dt>
                <dd className="text-sigilo-text-secondary">ISO 8601 timestamp of submission</dd>
              </div>
              <div className="flex gap-4">
                <dt className="font-mono text-sigilo-teal w-28 flex-shrink-0">role</dt>
                <dd className="text-sigilo-text-secondary">
                  Reporter category: Journalist, Public official, or Citizen
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="font-mono text-sigilo-teal w-28 flex-shrink-0">regionHint</dt>
                <dd className="text-sigilo-text-secondary">
                  Coarse geographic indicator (optional, user-provided)
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="font-mono text-sigilo-teal w-28 flex-shrink-0">status</dt>
                <dd className="text-sigilo-text-secondary">
                  Processing state: Pending, Stored, or Verified
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="font-mono text-sigilo-teal w-28 flex-shrink-0">methods</dt>
                <dd className="text-sigilo-text-secondary">
                  Array of privacy technologies applied to this signal
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="font-mono text-sigilo-teal w-28 flex-shrink-0">riskTags</dt>
                <dd className="text-sigilo-text-secondary">
                  Classification tags for routing and prioritization
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="font-mono text-sigilo-teal w-28 flex-shrink-0">previewHash</dt>
                <dd className="text-sigilo-text-secondary">
                  Hash of encrypted content for integrity verification
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="font-mono text-sigilo-teal w-28 flex-shrink-0">version</dt>
                <dd className="text-sigilo-text-secondary">Protocol version number</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Security & responsibilities */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-sigilo-text-primary text-center">
            Security & Responsibilities
          </h2>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-amber-400 mt-1">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-sigilo-text-primary">
                  Critical Security Notice
                </h3>
                <p className="text-sm text-sigilo-text-secondary">
                  Sigilo never exposes identities; only encrypted signals and limited
                  metadata flow through the network. Node operators bear significant
                  responsibility for protecting this infrastructure.
                </p>
                <ul className="space-y-2 text-sm text-sigilo-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>
                      <strong className="text-sigilo-text-primary">Protect your keys:</strong>{" "}
                      Store node private keys in secure hardware or HSMs when possible
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>
                      <strong className="text-sigilo-text-primary">Comply with local law:</strong>{" "}
                      Understand your jurisdiction&apos;s requirements for handling sensitive data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>
                      <strong className="text-sigilo-text-primary">
                        Treat all signals as sensitive:
                      </strong>{" "}
                      Even encrypted metadata can reveal patterns
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>
                      <strong className="text-sigilo-text-primary">
                        Never attempt deanonymization:
                      </strong>{" "}
                      Correlating signals to identify sources violates network trust
                    </span>
                  </li>
                </ul>
                <p className="text-xs text-sigilo-text-muted pt-2 border-t border-amber-500/20">
                  Full threat models, legal documentation, and key-rotation policies will be
                  published as the network matures. Contact security@sigilo.network for
                  current guidelines.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-sigilo-border/30">
          <p className="text-xs text-sigilo-text-muted">
            Integration documentation v1.0 · Last updated November 2025
          </p>
        </footer>
      </div>
    </main>
  );
}
