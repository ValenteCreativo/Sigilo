"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Report } from "@/types";
import { Calculator, Dashboard, AppShell } from "@/components/app";
import { Modal, Button } from "@/components/ui";
import { useAuth } from "@/contexts";
import { initGgwave, playPCM, type GgwaveContext } from "@/lib/ggwaveClient";
import { useGgwave } from "@/hooks/useGgwave";

export default function AppPage() {
  const { isAuthenticated, isRoleVerified, hasPin, authenticate, createPin, lock, verifyRole } = useAuth();
  const { loading: ggwaveLoading, error: ggwaveError } = useGgwave();

  // Local report state
  const [reports, setReports] = useState<Report[]>([]);

  // Modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [confirmPin, setConfirmPin] = useState("");
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  // ggwave ref for emergency signal
  const ggwaveRef = useRef<GgwaveContext | null>(null);

  // Handle unlock attempt from calculator
  const handleUnlockAttempt = useCallback(() => {
    if (!hasPin) {
      setIsCreatingPin(true);
      setShowPinModal(true);
    } else {
      setIsCreatingPin(false);
      setShowPinModal(true);
    }
  }, [hasPin]);

  // Handle emergency signal (911=)
  const handleEmergency = useCallback(async () => {
    if (isEmergencyActive) return;

    setIsEmergencyActive(true);

    if (ggwaveLoading) {
      setIsEmergencyActive(false);
      return;
    }

    if (ggwaveError) {
      console.error("Emergency signal failed:", ggwaveError);
      setIsEmergencyActive(false);
      return;
    }

    try {
      // Request location permission and get coordinates
      let locationString = "HELP IM IN DANGER";

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });

          const lat = position.coords.latitude.toFixed(5);
          const lng = position.coords.longitude.toFixed(5);
          locationString = `${lat},${lng}`;
        } catch (geoError) {
          console.warn("Could not get location:", geoError);
          // Continue without location
        }
      }

      const emergencyMessage = `EMERGENCY:${locationString}`;
      console.log("Sending emergency signal:", emergencyMessage);

      // Initialize ggwave if needed
      if (!ggwaveRef.current) {
        ggwaveRef.current = await initGgwave();
      }

      // Encode and play emergency signal via AUDIBLE (more reliable than ultrasonic)
      const samples = ggwaveRef.current.sendMessageToPCM(emergencyMessage, "audible");

      // Play it multiple times for redundancy with loop
      for (let i = 0; i < 3; i++) {
        await playPCM(samples, ggwaveRef.current.getSampleRate());
        await new Promise(resolve => setTimeout(resolve, 800));
      }

    } catch (error) {
      console.error("Emergency signal failed:", error);
    } finally {
      setIsEmergencyActive(false);
    }
  }, [isEmergencyActive, ggwaveLoading, ggwaveError]);

  // Handle PIN submission
  const handlePinSubmit = () => {
    if (isCreatingPin) {
      // Creating new PIN
      if (pinInput.length < 4 || pinInput.length > 6) {
        setPinError("PIN must be 4-6 digits");
        return;
      }
      if (!/^\d+$/.test(pinInput)) {
        setPinError("PIN must contain only numbers");
        return;
      }
      if (pinInput !== confirmPin) {
        setPinError("PINs do not match");
        return;
      }

      createPin(pinInput);
      resetPinModal();
    } else {
      // Verifying existing PIN
      if (authenticate(pinInput)) {
        resetPinModal();
      } else {
        setPinError("Incorrect PIN");
        setPinInput("");
      }
    }
  };

  const resetPinModal = () => {
    setShowPinModal(false);
    setPinInput("");
    setConfirmPin("");
    setPinError(null);
  };

  // Handle adding new report
  const handleAddReport = (
    reportData: Omit<Report, "id" | "createdAt">
  ) => {
    const newReport: Report = {
      ...reportData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "Stored",
    };
    setReports((prev) => [newReport, ...prev]);

    // Persist latest report for the forum page (client-side only)
    if (typeof window !== "undefined") {
      const forumPayload = {
        id: newReport.id,
        role: newReport.role,
        description: newReport.description,
        status: newReport.status,
        cid: newReport.cid,
        createdAt: newReport.createdAt,
        location: "User submission",
        methods: ["vLayer zkTLS", "Filecoin", "EVVM anchor"],
        riskTags: ["user-submitted"],
      };
      window.localStorage.setItem("sigilo.latestReport", JSON.stringify(forumPayload));
    }
  };

  // Handle lock
  const handleLock = () => {
    lock();
  };

  return (
    <div className="min-h-screen bg-sigilo-bg">
      {!isAuthenticated ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Calculator onUnlockAttempt={handleUnlockAttempt} onEmergency={handleEmergency} />
        </div>
      ) : (
        <AppShell title="SIGILO">
          <Dashboard
            reports={reports}
            isRoleVerified={isRoleVerified}
            onAddReport={handleAddReport}
            onVerifyRole={verifyRole}
            onLock={handleLock}
          />
        </AppShell>
      )}

      {/* PIN Modal */}
      <Modal
        isOpen={showPinModal}
        onClose={resetPinModal}
        title={isCreatingPin ? "Create your PIN" : "Enter PIN"}
      >
        <div className="space-y-4">
          {isCreatingPin ? (
            <>
              <p className="text-sm text-sigilo-text-secondary">
                Create a 4-6 digit PIN to protect your Sigilo dashboard.
              </p>

              <div>
                <label className="text-sm text-sigilo-text-muted block mb-2">
                  New PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, ""));
                    setPinError(null);
                  }}
                  className="w-full bg-sigilo-surface border border-sigilo-border rounded-lg p-3 text-center text-2xl tracking-widest text-sigilo-text-primary focus:outline-none focus:border-sigilo-teal/50"
                  placeholder="••••"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm text-sigilo-text-muted block mb-2">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => {
                    setConfirmPin(e.target.value.replace(/\D/g, ""));
                    setPinError(null);
                  }}
                  className="w-full bg-sigilo-surface border border-sigilo-border rounded-lg p-3 text-center text-2xl tracking-widest text-sigilo-text-primary focus:outline-none focus:border-sigilo-teal/50"
                  placeholder="••••"
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-sigilo-text-secondary">
                Enter your PIN to access Sigilo.
              </p>

              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ""));
                  setPinError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePinSubmit();
                }}
                className="w-full bg-sigilo-surface border border-sigilo-border rounded-lg p-3 text-center text-2xl tracking-widest text-sigilo-text-primary focus:outline-none focus:border-sigilo-teal/50"
                placeholder="••••"
                autoFocus
              />
            </>
          )}

          {pinError && (
            <p className="text-sm text-sigilo-red text-center">{pinError}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={resetPinModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handlePinSubmit}
              className="flex-1"
              disabled={
                isCreatingPin
                  ? pinInput.length < 4 || confirmPin.length < 4
                  : pinInput.length < 4
              }
            >
              {isCreatingPin ? "Create PIN" : "Unlock"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
