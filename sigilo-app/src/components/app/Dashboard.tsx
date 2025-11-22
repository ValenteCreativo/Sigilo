"use client";

import { useState, useRef, useEffect } from "react";
import { DashboardProps, ReportRole, Report } from "@/types";
import { Button, Badge } from "@/components/ui";
import { DashboardCard } from "./DashboardCard";
import { EncryptionProgress } from "./EncryptionProgress";
import {
  simulateEncryption,
  simulateZKProof,
  simulateEVVMSubmission,
  generateCID,
} from "@/lib/crypto";

// Processing state interface
interface ProcessingState {
  isProcessing: boolean;
  type: "encryption" | "verification" | "submission";
  progress: number;
  step: string;
}

// Icons
const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const LayersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const FingerprintIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
    />
  </svg>
);

// Generate session ID
function generateSessionId(): string {
  return `SIG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function Dashboard({
  reports,
  isRoleVerified,
  onAddReport,
  onVerifyRole,
  onLock,
}: DashboardProps) {
  const [selectedRole, setSelectedRole] = useState<ReportRole>("Citizen");
  const [description, setDescription] = useState("");
  const [evidenceFileName, setEvidenceFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [protectionLayers, setProtectionLayers] = useState({
    encryption: false,
    zkProof: false,
    evvm: false,
    filecoin: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Activate protection layers progressively
  useEffect(() => {
    const timer1 = setTimeout(() => setProtectionLayers(p => ({ ...p, encryption: true })), 500);
    const timer2 = setTimeout(() => setProtectionLayers(p => ({ ...p, zkProof: true })), 1000);
    const timer3 = setTimeout(() => setProtectionLayers(p => ({ ...p, evvm: true })), 1500);
    const timer4 = setTimeout(() => setProtectionLayers(p => ({ ...p, filecoin: true })), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFileName(file.name);
    }
  };

  const handleSubmitReport = async () => {
    if (!description.trim()) return;

    setIsSubmitting(true);

    try {
      // Phase 1: Encryption
      setProcessingState({
        isProcessing: true,
        type: "encryption",
        progress: 0,
        step: "Initializing AES-256-GCM...",
      });

      const encryptionResult = await simulateEncryption(
        description,
        (progress, step) => {
          setProcessingState((prev) => prev ? { ...prev, progress, step } : null);
        }
      );

      // Phase 2: ZK Verification
      setProcessingState({
        isProcessing: true,
        type: "verification",
        progress: 0,
        step: "Generating zero-knowledge proof...",
      });

      const zkResult = await simulateZKProof(
        selectedRole,
        (progress, step) => {
          setProcessingState((prev) => prev ? { ...prev, progress, step } : null);
        }
      );

      // Phase 3: EVVM Submission
      setProcessingState({
        isProcessing: true,
        type: "submission",
        progress: 0,
        step: "Connecting to EVVM virtual chain...",
      });

      const evvmResult = await simulateEVVMSubmission(
        encryptionResult.hash,
        (progress, step) => {
          setProcessingState((prev) => prev ? { ...prev, progress, step } : null);
        }
      );

      // Create the report with all security metadata
      const newReport: Omit<Report, "id" | "createdAt"> = {
        role: selectedRole,
        description: description.trim(),
        status: "Stored",
        cid: generateCID(),
        evidenceFileName: evidenceFileName || undefined,
        txHash: evvmResult.txHash,
        virtualChainId: evvmResult.virtualChainId,
        encryptedHash: encryptionResult.hash,
        zkProofId: zkResult.proof.substring(0, 16),
      };

      onAddReport(newReport);
      setDescription("");
      setEvidenceFileName(null);
    } catch (error) {
      console.error("Report submission failed:", error);
    } finally {
      setProcessingState(null);
      setIsSubmitting(false);
    }
  };

  const roles: ReportRole[] = ["Journalist", "Public official", "Citizen"];

  return (
    <>
      {/* Processing overlay */}
      {processingState && (
        <EncryptionProgress
          progress={processingState.progress}
          step={processingState.step}
          type={processingState.type}
        />
      )}

      <div className="min-h-screen bg-sigilo-bg p-4 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-sigilo-text-primary">SIGILO</h1>
            <Badge variant="success" size="sm">
              Protected session
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-sigilo-text-secondary">
            <FingerprintIcon />
            <span className="font-mono text-xs text-sigilo-teal">{sessionId}</span>
          </div>
        </div>

        {/* Active Protection Layers */}
        <div className="mb-4 p-3 bg-sigilo-surface/50 rounded-lg border border-sigilo-border/30">
          <p className="text-xs text-sigilo-text-muted mb-2">Active protection layers</p>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-1 rounded-full transition-all duration-500 ${protectionLayers.encryption ? 'bg-sigilo-teal/20 text-sigilo-teal' : 'bg-sigilo-border/30 text-sigilo-text-muted'}`}>
              {protectionLayers.encryption ? '✓' : '○'} AES-256-GCM
            </span>
            <span className={`text-xs px-2 py-1 rounded-full transition-all duration-500 ${protectionLayers.zkProof ? 'bg-sigilo-teal/20 text-sigilo-teal' : 'bg-sigilo-border/30 text-sigilo-text-muted'}`}>
              {protectionLayers.zkProof ? '✓' : '○'} vLayer zkTLS
            </span>
            <span className={`text-xs px-2 py-1 rounded-full transition-all duration-500 ${protectionLayers.evvm ? 'bg-sigilo-teal/20 text-sigilo-teal' : 'bg-sigilo-border/30 text-sigilo-text-muted'}`}>
              {protectionLayers.evvm ? '✓' : '○'} EVVM Chain
            </span>
            <span className={`text-xs px-2 py-1 rounded-full transition-all duration-500 ${protectionLayers.filecoin ? 'bg-sigilo-teal/20 text-sigilo-teal' : 'bg-sigilo-border/30 text-sigilo-text-muted'}`}>
              {protectionLayers.filecoin ? '✓' : '○'} Filecoin
            </span>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="space-y-4">
          {/* New Report Card */}
          <DashboardCard title="New report" icon={<DocumentIcon />}>
            <p className="text-sm text-sigilo-text-secondary mb-4">
              Describe what happened, attach your evidence and let Sigilo handle the
              encryption, storage and on-chain anchoring.
            </p>

            {/* Role Selection */}
            <div className="mb-4">
              <label className="text-sm text-sigilo-text-muted mb-2 block">
                Your role
              </label>
              <div className="flex gap-2 flex-wrap">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${
                        selectedRole === role
                          ? "bg-sigilo-teal/20 text-sigilo-teal border border-sigilo-teal/50"
                          : "bg-sigilo-border/30 text-sigilo-text-secondary hover:bg-sigilo-border/50"
                      }
                    `}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* vLayer Verification */}
            <div className="mb-4">
              {isRoleVerified ? (
                <Badge variant="success" size="md">
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Verified anonymously via vLayer
                  </span>
                </Badge>
              ) : (
                <Button variant="secondary" size="sm" onClick={onVerifyRole}>
                  Verify role with vLayer
                </Button>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-sm text-sigilo-text-muted mb-2 block">
                What happened?
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the incident, corruption, or abuse you witnessed..."
                className="w-full h-24 bg-sigilo-surface border border-sigilo-border rounded-lg p-3 text-sm text-sigilo-text-primary placeholder-sigilo-text-muted resize-none focus:outline-none focus:border-sigilo-teal/50"
              />
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {evidenceFileName || "Attach evidence (Filecoin)"}
              </Button>
              {evidenceFileName && (
                <p className="text-xs text-sigilo-text-muted mt-1">
                  Selected: {evidenceFileName}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitReport}
              disabled={!description.trim() || isSubmitting}
              isLoading={isSubmitting}
              className="w-full"
            >
              Encrypt & Submit report
            </Button>
          </DashboardCard>

          {/* My Reports Card */}
          <DashboardCard title="My encrypted reports" icon={<ShieldIcon />}>
            <p className="text-sm text-sigilo-text-secondary mb-4">
              Track the status of your reports without revealing your identity. Only
              encrypted references and technical metadata are stored here.
            </p>

            {reports.length === 0 ? (
              <p className="text-sm text-sigilo-text-muted text-center py-4">
                No reports yet
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {reports.map((report, index) => (
                  <div
                    key={report.id}
                    className="bg-sigilo-surface/50 rounded-lg p-3 border border-sigilo-border/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-sigilo-text-primary">
                        Report #{index + 1}
                      </span>
                      <Badge
                        variant={report.status === "Stored" ? "success" : "warning"}
                        size="sm"
                      >
                        {report.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-sigilo-text-muted space-y-1">
                      <p>Role: {report.role}</p>
                      {report.cid && (
                        <p className="truncate">CID: {report.cid}</p>
                      )}
                      {report.txHash && (
                        <p className="truncate font-mono text-sigilo-teal/80">
                          TX: {report.txHash}
                        </p>
                      )}
                      {report.virtualChainId && (
                        <p className="text-sigilo-text-muted">
                          Virtual Chain: {report.virtualChainId}
                        </p>
                      )}
                      {report.encryptedHash && (
                        <p className="truncate font-mono text-sigilo-amber/80">
                          Hash: {report.encryptedHash}
                        </p>
                      )}
                      <p>
                        Created:{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {/* Protection Layers Card */}
          <DashboardCard title="How Sigilo protects this session" icon={<LayersIcon />}>
            <ul className="space-y-2 text-sm text-sigilo-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-sigilo-teal mt-0.5">•</span>
                <span>
                  <strong className="text-sigilo-text-primary">AES-256-GCM</strong>{" "}
                  encrypts your report with military-grade encryption
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sigilo-teal mt-0.5">•</span>
                <span>
                  <strong className="text-sigilo-text-primary">vLayer zkTLS</strong>{" "}
                  verifies your role anonymously with zero-knowledge proofs
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sigilo-teal mt-0.5">•</span>
                <span>
                  <strong className="text-sigilo-text-primary">Filecoin</strong>{" "}
                  stores your encrypted evidence off-chain with content addressing
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sigilo-teal mt-0.5">•</span>
                <span>
                  <strong className="text-sigilo-text-primary">EVVM</strong> anchors
                  report references in isolated virtual chains for immutability
                </span>
              </li>
            </ul>
          </DashboardCard>

          {/* Emergency Mode Card */}
          <DashboardCard title="Emergency mode" icon={<AlertIcon />}>
            <p className="text-sm text-sigilo-text-secondary mb-4">
              When networks are blocked or compromised, Sigilo&apos;s emergency mode will
              use offline acoustic signals and on-device voice models to propagate
              alerts through nearby devices until they reach a safe node.
            </p>
            <Button variant="secondary" size="sm" disabled className="opacity-60">
              Trigger offline alert (coming soon)
            </Button>
          </DashboardCard>
        </div>

        {/* Lock Button */}
        <div className="fixed bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLock}
            leftIcon={<LockIcon />}
            className="w-full bg-sigilo-card/90 backdrop-blur-sm"
          >
            Lock & return to calculator
          </Button>
        </div>
      </div>
    </>
  );
}
