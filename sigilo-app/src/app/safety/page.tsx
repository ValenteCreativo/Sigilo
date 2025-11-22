"use client";

import { AppShell } from "@/components/app";

const ChecklistItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3 p-4 bg-sigilo-surface/50 rounded-lg border border-sigilo-border/30">
    <div className="flex-shrink-0 w-6 h-6 bg-sigilo-teal/20 rounded-full flex items-center justify-center mt-0.5">
      <svg
        className="w-4 h-4 text-sigilo-teal"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <span className="text-sm text-sigilo-text-secondary">{children}</span>
  </li>
);

const BulletPoint = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2">
    <span className="text-sigilo-teal mt-1">•</span>
    <span className="text-sm text-sigilo-text-secondary">{children}</span>
  </li>
);

const WarningBullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2">
    <span className="text-amber-400 mt-1">⚠</span>
    <span className="text-sm text-sigilo-text-secondary">{children}</span>
  </li>
);

export default function SafetyPage() {
  return (
    <AppShell title="Safety & OPSEC">
      <main className="min-h-screen bg-sigilo-bg">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-12">
        {/* Hero */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-sigilo-text-primary">
            Safety & Operational Security
          </h1>
          <p className="text-sigilo-text-secondary max-w-2xl mx-auto text-lg">
            Sigilo reduces your digital exposure. It does not eliminate risk. Use it as
            one layer in your protection, not as your only shield.
          </p>
        </header>

        {/* What Sigilo protects */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-sigilo-text-primary flex items-center gap-2">
            <svg
              className="w-6 h-6 text-sigilo-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            What Sigilo Protects
          </h2>
          <div className="bg-sigilo-surface/50 rounded-xl border border-sigilo-border/30 p-6">
            <ul className="space-y-3">
              <BulletPoint>
                <strong className="text-sigilo-text-primary">Encryption at rest</strong> for
                reports and attachments using AES-256-GCM before any data leaves your device
              </BulletPoint>
              <BulletPoint>
                <strong className="text-sigilo-text-primary">
                  Removal of direct identifiers
                </strong>{" "}
                from the reporting flow—no names, emails, or account links are transmitted
              </BulletPoint>
              <BulletPoint>
                <strong className="text-sigilo-text-primary">
                  Privacy-preserving primitives
                </strong>{" "}
                including zero-knowledge proofs (vLayer zkTLS), decentralized storage
                (Filecoin), and isolated virtual chains (EVVM)
              </BulletPoint>
              <BulletPoint>
                <strong className="text-sigilo-text-primary">Stealth interface</strong> that
                presents as a calculator instead of a whistleblowing application
              </BulletPoint>
              <BulletPoint>
                <strong className="text-sigilo-text-primary">On-chain anchoring</strong> that
                creates immutable, timestamped proof that your report existed at a specific
                moment
              </BulletPoint>
            </ul>
          </div>
        </section>

        {/* What Sigilo does NOT protect */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-sigilo-text-primary flex items-center gap-2">
            <svg
              className="w-6 h-6 text-amber-400"
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
            What Sigilo Does NOT Protect
          </h2>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
            <ul className="space-y-3">
              <WarningBullet>
                <strong className="text-sigilo-text-primary">
                  Your physical environment
                </strong>
                —who sees your screen, who is in the room, whether you&apos;re being observed
              </WarningBullet>
              <WarningBullet>
                <strong className="text-sigilo-text-primary">Your device security</strong>
                —malware, compromised operating systems, keyloggers, or screen capture
                software
              </WarningBullet>
              <WarningBullet>
                <strong className="text-sigilo-text-primary">
                  Your accounts outside Sigilo
                </strong>
                —email, social media, messaging apps, or other services that could be
                correlated
              </WarningBullet>
              <WarningBullet>
                <strong className="text-sigilo-text-primary">Self-identification</strong>
                —mentioning names, unique details, or information in your report that directly
                identifies you
              </WarningBullet>
              <WarningBullet>
                <strong className="text-sigilo-text-primary">Activity patterns</strong>
                —using the same device or network for both sensitive and non-sensitive
                activities
              </WarningBullet>
            </ul>
          </div>
        </section>

        {/* Practical OPSEC checklist */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-sigilo-text-primary flex items-center gap-2">
            <svg
              className="w-6 h-6 text-sigilo-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Practical OPSEC Checklist
          </h2>
          <ul className="space-y-3">
            <ChecklistItem>
              If possible, use a device that is not tied to your real name or main
              accounts—a secondary phone, a borrowed laptop, or a device purchased with cash.
            </ChecklistItem>
            <ChecklistItem>
              Avoid using Sigilo on networks you know are monitored, such as workplace Wi-Fi,
              government facilities, or networks controlled by parties related to your report.
            </ChecklistItem>
            <ChecklistItem>
              Close other apps and browser tabs that might leak information about you through
              notifications, location services, or background sync.
            </ChecklistItem>
            <ChecklistItem>
              Do not reuse passwords. Consider using a password manager with a strong master
              password that you do not use elsewhere.
            </ChecklistItem>
            <ChecklistItem>
              Keep your operating system and security patches up to date. Unpatched
              vulnerabilities are a common attack vector.
            </ChecklistItem>
            <ChecklistItem>
              If you attach media (photos, documents, audio), consider removing obvious
              metadata, faces, or identifying features when it is safe to do so.
            </ChecklistItem>
            <ChecklistItem>
              Be mindful of your writing style. Unusual phrases, specific terminology, or
              formatting habits can sometimes be used to identify authors.
            </ChecklistItem>
            <ChecklistItem>
              Consider the timing of your report. Submitting immediately after an incident
              you witnessed could narrow down who had access to that information.
            </ChecklistItem>
            <ChecklistItem>
              If you&apos;re in a high-risk situation, consider using Tor Browser or a VPN as
              an additional layer—but understand their limitations.
            </ChecklistItem>
          </ul>
        </section>

        {/* Immediate danger */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-sigilo-text-primary flex items-center gap-2">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            If You Are in Immediate Danger
          </h2>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <p className="text-sigilo-text-secondary leading-relaxed">
              If you believe you are in immediate physical danger, your safety comes before
              any digital tool.{" "}
              <strong className="text-sigilo-text-primary">
                Prioritize getting to a safe place
              </strong>
              , contacting trusted people, or reaching local emergency services if that is
              safe for you. Sigilo cannot guarantee protection against urgent physical
              threats. No technology can replace human support networks and real-world
              safety planning.
            </p>
            <div className="mt-4 pt-4 border-t border-red-500/20">
              <p className="text-sm text-sigilo-text-muted">
                Organizations like{" "}
                <span className="text-sigilo-text-secondary">
                  Committee to Protect Journalists
                </span>
                ,{" "}
                <span className="text-sigilo-text-secondary">
                  Reporters Without Borders
                </span>
                , and{" "}
                <span className="text-sigilo-text-secondary">
                  Electronic Frontier Foundation
                </span>{" "}
                offer resources for journalists and activists in high-risk situations.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="space-y-4">
          <div className="bg-sigilo-surface/50 rounded-xl border border-sigilo-border/30 p-6">
            <div className="flex items-start gap-4">
              <div className="text-sigilo-text-muted mt-1">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sigilo-text-primary mb-2">Disclaimer</h3>
                <p className="text-sm text-sigilo-text-secondary leading-relaxed">
                  Sigilo is security-oriented software under active development. It is
                  designed to lower your exposure, not to make you invisible. Always combine
                  Sigilo with strong operational security practices and, when possible,
                  guidance from organizations experienced in digital and physical protection.
                  The developers of Sigilo cannot guarantee absolute anonymity or safety in
                  all circumstances.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-sigilo-border/30">
          <p className="text-xs text-sigilo-text-muted">
            Safety documentation v1.0 · This guidance is not legal advice · Last updated
            November 2025
          </p>
        </footer>
        </div>
      </main>
    </AppShell>
  );
}
