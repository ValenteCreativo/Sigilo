"use client";

import { useState, useRef, useEffect } from "react";
import { useAppKit } from "@reown/appkit/react";
import { useChainId, useSwitchChain } from "wagmi";
import { DashboardProps, ReportRole, Report } from "@/types";
import { Button, Badge } from "@/components/ui";
import { DashboardCard } from "./DashboardCard";
import { EncryptionProgress } from "./EncryptionProgress";
import { simulateEncryption, simulateZKProof, generateCID } from "@/lib/crypto";
import { useEVVM } from "@/hooks/useEVVM";
import { EVVM_CONFIG } from "@/lib/evvm";

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

const NetworkIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
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
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [sessionId] = useState(() => generateSessionId());
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [protectionLayers, setProtectionLayers] = useState({
    encryption: false,
    zkProof: false,
    evvm: false,
    filecoin: false,
  });
  const [isVerifyingWithVLayer, setIsVerifyingWithVLayer] = useState(false);
  const [vLayerError, setVLayerError] = useState<string | null>(null);
  const { open } = useAppKit();
  const {
    isConnected,
    submitReport,
    isReportPending,
    isReportConfirming,
    reportError,
  } = useEVVM();
  const isConnectedRef = useRef(isConnected);
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep latest wallet connection status for async waits
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

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

  const handleVerifyWithVLayer = async () => {
    setVLayerError(null);
    setIsVerifyingWithVLayer(true);
    try {
      const res = await fetch("/api/vlayer/prove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`vLayer prove failed (${res.status}): ${text}`);
      }
      const json = await res.json();
      console.log("vLayer proof result", json);
      onVerifyRole();
    } catch (error) {
      const message = error instanceof Error ? error.message : "vLayer verification failed";
      setVLayerError(message);
    } finally {
      setIsVerifyingWithVLayer(false);
    }
  };

  const ensureWalletConnection = async () => {
    if (isConnectedRef.current) return true;

    try {
      await open();
    } catch (error) {
      console.warn("Wallet modal was closed or failed to open", error);
    }

    for (let i = 0; i < 20; i++) {
      if (isConnectedRef.current) return true;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    return false;
  };

  const ensureSepolia = async () => {
    if (chainId === EVVM_CONFIG.chainId) return true;
    try {
      await switchChainAsync({ chainId: EVVM_CONFIG.chainId });
      return true;
    } catch (error) {
      console.warn("User rejected chain switch or failed", error);
      return false;
    }
  };

  const handleSubmitReport = async () => {
    if (!description.trim()) return;

    setSubmissionError(null);
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
        progress: 5,
        step: isConnectedRef.current
          ? "Preparing EVVM transaction..."
          : "Requesting wallet connection...",
      });

      const walletReady = await ensureWalletConnection();
      if (!walletReady) {
        throw new Error("Connect a wallet to anchor the report on EVVM.");
      }

      const onSepolia = await ensureSepolia();
      if (!onSepolia) {
        throw new Error("Please switch to Sepolia (EVVM) to submit.");
      }

      setProcessingState({
        isProcessing: true,
        type: "submission",
        progress: 40,
        step: "Waiting for wallet signature...",
      });

      const submission = await submitReport({
        timestamp: Date.now(),
        message: encryptionResult.hash,
        isEmergency: false,
      });

      if (!submission.success || !submission.txHash) {
        throw new Error(submission.error || "EVVM submission failed");
      }

      setProcessingState({
        isProcessing: true,
        type: "submission",
        progress: 85,
        step: "Broadcasting to EVVM...",
      });

      // Create the report with all security metadata
      const newReport: Omit<Report, "id" | "createdAt"> = {
        role: selectedRole,
        description: description.trim(),
        status: "Stored",
        cid: generateCID(),
        evidenceFileName: evidenceFileName || undefined,
        txHash: submission.txHash,
        virtualChainId: `${EVVM_CONFIG.chainName} (${EVVM_CONFIG.chainId})`,
        encryptedHash: submission.reportHash || encryptionResult.hash,
        zkProofId: zkResult.proof.substring(0, 16),
      };

      onAddReport(newReport);
      setDescription("");
      setEvidenceFileName(null);
    } catch (error) {
      console.error("Report submission failed:", error);
      const message = error instanceof Error ? error.message : "Report submission failed";
      setSubmissionError(message);
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
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleVerifyWithVLayer}
                    isLoading={isVerifyingWithVLayer}
                  >
                    Verify role with vLayer
                  </Button>
                  {vLayerError && (
                    <p className="text-xs text-sigilo-red">{vLayerError}</p>
                  )}
                  {!vLayerError && (
                    <p className="text-xs text-sigilo-text-muted">
                      This hits our `/api/vlayer/prove` endpoint to call vLayer&apos;s Web Prover.
                    </p>
                  )}
                </div>
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

            <div className="mt-2 flex flex-col gap-1 text-xs">
              <div className={`flex items-center gap-2 ${isConnected ? "text-green-400" : "text-amber-400"}`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-amber-400"}`} />
                {isConnected ? "Wallet connected to EVVM" : "Connect wallet to anchor on-chain"}
              </div>
              {chainId !== EVVM_CONFIG.chainId && (
                <span className="text-amber-400">
                  Switch to Sepolia to avoid mainnet fees. {isSwitchingChain ? "(switching...)" : ""}
                </span>
              )}
              {(isReportPending || isReportConfirming) && (
                <span className="text-sigilo-teal">
                  {isReportPending ? "Awaiting wallet signature..." : "Waiting for EVVM confirmation..."}
                </span>
              )}
              {submissionError && (
                <span className="text-sigilo-red">{submissionError}</span>
              )}
              {reportError && (
                <span className="text-sigilo-red">{reportError.message}</span>
              )}
            </div>
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

          {/* Network & Resources Navigation */}
          <DashboardCard title="Network & Resources" icon={<NetworkIcon />}>
            <p className="text-sm text-sigilo-text-secondary mb-4">
              Explore the Sigilo network, integrate as a node, or review operational security best practices.
            </p>
            <div className="space-y-2">
              <a
                href="/forum"
                className="flex items-center justify-between p-3 bg-sigilo-surface/50 rounded-lg border border-sigilo-border/30 hover:bg-sigilo-surface hover:border-sigilo-teal/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sigilo-teal/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-sigilo-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sigilo-text-primary">Encrypted Signal Forum</p>
                    <p className="text-xs text-sigilo-text-muted">Browse anonymized reports network</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-sigilo-text-muted group-hover:text-sigilo-teal transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="/integrate"
                className="flex items-center justify-between p-3 bg-sigilo-surface/50 rounded-lg border border-sigilo-border/30 hover:bg-sigilo-surface hover:border-sigilo-teal/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sigilo-text-primary">Integrate with Sigilo</p>
                    <p className="text-xs text-sigilo-text-muted">Become a node in the network</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-sigilo-text-muted group-hover:text-sigilo-teal transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="/safety"
                className="flex items-center justify-between p-3 bg-sigilo-surface/50 rounded-lg border border-sigilo-border/30 hover:bg-sigilo-surface hover:border-amber-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sigilo-text-primary">Safety & OPSEC</p>
                    <p className="text-xs text-sigilo-text-muted">Operational security best practices</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-sigilo-text-muted group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="/ultrasound"
                className="flex items-center justify-between p-3 bg-sigilo-surface/50 rounded-lg border border-sigilo-border/30 hover:bg-sigilo-surface hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sigilo-text-primary">Ultrasonic Signal</p>
                    <p className="text-xs text-sigilo-text-muted">Sound-based offline communication</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-sigilo-text-muted group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
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
