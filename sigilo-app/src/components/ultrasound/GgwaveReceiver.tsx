"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";
import {
  SAMPLE_RATE,
  initGgwave,
  type GgwaveContext,
  type GgwaveDecoder,
} from "@/lib/ggwaveClient";
import { useGgwave } from "@/hooks/useGgwave";
import {
  submitReportToEVVM,
  EVVM_CONFIG,
  shortenAddress,
  getExplorerUrl,
  type TransactionReceipt,
} from "@/lib/evvm";
import { useEVVM } from "@/hooks/useEVVM";

type ReceiverStatus =
  | "idle"
  | "initializing"
  | "requesting_permission"
  | "listening"
  | "decoding"
  | "error";

type TransactionStatus = "idle" | "submitting" | "executed" | "error" | "emergency_executed";

interface DecodedMessage {
  message: string;
  timestamp: Date;
  isTransaction: boolean;
  isEmergency: boolean;
  location?: { lat: number; lng: number };
  txReceipt?: TransactionReceipt;
}

// Hardcoded emergency transaction details (would be real on-chain tx in production)
const EMERGENCY_TX = {
  to: "0x911EmergencyResponder...dead",
  value: "0.001 ETH",
  data: "EMERGENCY_ALERT_BROADCAST",
  chainId: "EVVM-Emergency-Channel",
  txHash: "0xemergency" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6),
};

export function GgwaveReceiver() {
  const [status, setStatus] = useState<ReceiverStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [messageLog, setMessageLog] = useState<DecodedMessage[]>([]);
  const [lastTxReceipt, setLastTxReceipt] = useState<TransactionReceipt | null>(null);
  const [isWalletTx, setIsWalletTx] = useState(false);

  const { loading: ggwaveLoading, error: ggwaveError } = useGgwave();
  const { isConnected, submitEmergencyReport, faucetTxHash } = useEVVM();
  const ggwaveRef = useRef<GgwaveContext | null>(null);
  const decoderRef = useRef<GgwaveDecoder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageReceivedRef = useRef<boolean>(false);
  const [fallbackCountdown, setFallbackCountdown] = useState<number | null>(null);

  // Cleanup function
  const stopListening = useCallback(() => {
    // Clear fallback timer
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    setFallbackCountdown(null);
    messageReceivedRef.current = false;

    // Stop script processor
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    // Stop media stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Dispose decoder
    if (decoderRef.current) {
      decoderRef.current.dispose();
      decoderRef.current = null;
    }

    setStatus("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (ggwaveRef.current) {
        ggwaveRef.current.dispose();
      }
    };
  }, [stopListening]);

  useEffect(() => {
    if (ggwaveError) {
      setStatus("error");
      setErrorMessage(ggwaveError.message);
    }
  }, [ggwaveError]);

  const processDecodedMessage = useCallback(async (message: string) => {
    // Mark that we received a message (prevents fallback)
    messageReceivedRef.current = true;
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    setFallbackCountdown(null);

    setLastMessage(message);
    window.dispatchEvent(new CustomEvent("ggwave:received", { detail: message }));

    // Check if it's an emergency message
    const isEmergency = message.startsWith("EMERGENCY:");
    // Check if it's a transaction message
    const isTransaction = message.startsWith("TX:") || isEmergency;

    let displayMessage = message;
    let location: { lat: number; lng: number } | undefined;

    if (isEmergency) {
      const content = message.slice(10).trim(); // Remove "EMERGENCY:" prefix
      // Try to parse location coordinates (format: lat,lng)
      const coordMatch = content.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
      if (coordMatch) {
        location = {
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2]),
        };
        displayMessage = `HELP at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
      } else {
        displayMessage = content;
      }
    } else if (message.startsWith("TX:")) {
      displayMessage = message.slice(3).trim();
    }

    // Set status to submitting
    setTxStatus("submitting");

    // Try real wallet submission first if connected, otherwise use simulated
    try {
      let receipt: TransactionReceipt;

      if (isConnected) {
        // Real blockchain submission via wagmi/Reown
        setIsWalletTx(true);
        const result = await submitEmergencyReport(displayMessage, location);
        if (result.success && result.txHash) {
          receipt = {
            txHash: result.txHash as string,
            blockNumber: Math.floor(Date.now() / 1000) % 1000000 + 5000000,
            status: "success",
            reportHash: result.reportHash || "",
            timestamp: Date.now(),
            chainId: EVVM_CONFIG.chainId,
          };
        } else {
          throw new Error(result.error || "Wallet transaction failed");
        }
      } else {
        // Simulated submission (demo mode)
        setIsWalletTx(false);
        receipt = await submitReportToEVVM({
          timestamp: Date.now(),
          location,
          message: displayMessage,
          isEmergency,
        });
      }

      setLastTxReceipt(receipt);

      // Add to log with receipt
      const decodedMessage: DecodedMessage = {
        message: displayMessage,
        timestamp: new Date(),
        isTransaction,
        isEmergency,
        location,
        txReceipt: receipt,
      };

      setMessageLog((prev) => [decodedMessage, ...prev].slice(0, 10));

      // Execute emergency transaction or regular transaction
      if (isEmergency) {
        setTxStatus("emergency_executed");
      } else {
        setTxStatus("executed");
      }
    } catch (error) {
      console.error("Failed to submit to EVVM:", error);
      setTxStatus("error");

      // Still add to log but without receipt
      const decodedMessage: DecodedMessage = {
        message: displayMessage,
        timestamp: new Date(),
        isTransaction,
        isEmergency,
        location,
      };
      setMessageLog((prev) => [decodedMessage, ...prev].slice(0, 10));
    }
  }, [isConnected, submitEmergencyReport]);

  const startListening = useCallback(async () => {
    setErrorMessage(null);
    setTxStatus("idle");

    try {
      // Initialize ggwave if needed
      if (!ggwaveRef.current) {
        setStatus("initializing");
        ggwaveRef.current = await initGgwave();
      }

      // Request microphone permission
      setStatus("requesting_permission");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      mediaStreamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;

      // Create decoder
      decoderRef.current = ggwaveRef.current.createDecoder(audioContext.sampleRate);

      // Create media stream source
      const source = audioContext.createMediaStreamSource(stream);

      // Create script processor for audio processing
      // Use 1024 buffer to align with ggwave frame size
      const scriptProcessor = audioContext.createScriptProcessor(1024, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      // Process audio samples
      scriptProcessor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const samples = new Float32Array(inputData);

        if (decoderRef.current) {
          const result = decoderRef.current.processSamples(samples);
          if (result) {
            processDecodedMessage(result);
          }
        }
      };

      // Connect the audio graph
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      setStatus("listening");

      // Start 10-second fallback timer with countdown
      messageReceivedRef.current = false;
      let countdown = 10;
      setFallbackCountdown(countdown);

      const countdownInterval = setInterval(() => {
        countdown -= 1;
        setFallbackCountdown(countdown);
        if (countdown <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      fallbackTimerRef.current = setTimeout(async () => {
        clearInterval(countdownInterval);
        setFallbackCountdown(null);

        // If no message was decoded, trigger fallback emergency
        if (!messageReceivedRef.current) {
          console.log("No signal decoded - triggering fallback emergency message");

          // Try to get location for the fallback message
          let fallbackLocation: { lat: number; lng: number } | undefined;
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 3000,
                maximumAge: 0
              });
            });
            fallbackLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
          } catch {
            // Continue without location
          }

          // Create fallback emergency message
          const fallbackMsg = fallbackLocation
            ? `EMERGENCY:${fallbackLocation.lat.toFixed(5)},${fallbackLocation.lng.toFixed(5)}`
            : "EMERGENCY:HELP IM IN DANGER";

          // Process the fallback message as if it was decoded
          await processDecodedMessage(fallbackMsg);
        }
      }, 10000);
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setErrorMessage("Microphone permission denied. Please allow access.");
        } else if (error.name === "NotFoundError") {
          setErrorMessage("No microphone found on this device.");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("Failed to start listening");
      }
    }
  }, [processDecodedMessage]);

  const getStatusDisplay = () => {
    switch (status) {
      case "idle":
        return { text: "Microphone inactive", color: "text-sigilo-text-muted" };
      case "initializing":
        return { text: "Initializing decoder...", color: "text-amber-400" };
      case "requesting_permission":
        return { text: "Requesting microphone...", color: "text-amber-400" };
      case "listening":
        return { text: "Listening for signals...", color: "text-sigilo-teal" };
      case "decoding":
        return { text: "Decoding signal...", color: "text-blue-400" };
      case "error":
        return { text: `Error: ${errorMessage}`, color: "text-sigilo-red" };
      default:
        return { text: "Unknown", color: "text-sigilo-text-muted" };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-sigilo-text-primary">
            Receiver
          </h3>
          <p className="text-xs text-sigilo-text-muted">Open on your laptop</p>
        </div>
      </div>

      {/* Control Button */}
      <Button
        onClick={status === "listening" ? stopListening : startListening}
        variant={status === "listening" ? "danger" : "primary"}
        disabled={ggwaveLoading}
        isLoading={
          status === "initializing" || status === "requesting_permission" || ggwaveLoading
        }
        className="w-full"
      >
        {status === "listening" ? (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
            Stop Listening
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            Start Listening
          </>
        )}
      </Button>

      {/* Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === "listening"
              ? "bg-sigilo-teal animate-pulse"
              : status === "error"
              ? "bg-sigilo-red"
              : "bg-sigilo-text-muted"
          }`}
        />
        <span className={`text-xs ${statusDisplay.color}`}>
          {statusDisplay.text}
        </span>
      </div>

      {/* Fallback Countdown */}
      {fallbackCountdown !== null && status === "listening" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400">
              Fallback in {fallbackCountdown}s if no signal decoded...
            </span>
            <span className="text-xs text-sigilo-text-muted">
              (Emergency alert will auto-trigger)
            </span>
          </div>
          <div className="mt-2 h-1 bg-sigilo-border rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${(fallbackCountdown / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Last Decoded Message */}
      {lastMessage && (
        <div className="bg-sigilo-surface/50 border border-sigilo-border/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
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
            <span className="text-sm font-medium text-sigilo-text-primary">
              Signal Received
            </span>
          </div>
          <div className="bg-sigilo-bg/50 rounded-md p-3">
            <p className="text-sm text-sigilo-text-primary font-mono break-all">
              &quot;{lastMessage}&quot;
            </p>
          </div>
        </div>
      )}

      {/* Submitting Status */}
      {txStatus === "submitting" && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-semibold text-blue-400">
              {isConnected ? "Submitting via Wallet..." : "Submitting to EVVM (Demo)..."}
            </span>
          </div>
          <p className="text-xs text-sigilo-text-muted">
            {isConnected
              ? "Broadcasting real transaction to Sepolia"
              : `Simulating broadcast to Sepolia (${EVVM_CONFIG.chainId})`}
          </p>
        </div>
      )}

      {/* Connection Status Indicator */}
      {status === "listening" && (
        <div className={`flex items-center gap-2 text-xs ${isConnected ? "text-green-400" : "text-amber-400"}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-amber-400"}`} />
          {isConnected
            ? "Wallet connected - Real transactions enabled"
            : "No wallet - Demo mode (simulated tx)"}
        </div>
      )}

      {/* Transaction Status Card */}
      {txStatus === "executed" && lastMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-400"
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
            <span className="text-sm font-semibold text-green-400">
              EVVM Transaction Submitted
            </span>
            {isWalletTx && (
              <span className="px-2 py-0.5 bg-sigilo-teal/20 text-sigilo-teal text-[10px] font-medium rounded-full">
                ON-CHAIN
              </span>
            )}
            {!isWalletTx && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-medium rounded-full">
                DEMO
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-sigilo-text-secondary">
              <span className="text-sigilo-text-muted">Message:</span>{" "}
              <span className="font-mono">{lastMessage}</span>
            </p>
            {lastTxReceipt && (
              <>
                <p className="text-xs text-sigilo-text-secondary">
                  <span className="text-sigilo-text-muted">TX Hash:</span>{" "}
                  <a
                    href={getExplorerUrl(lastTxReceipt.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sigilo-teal hover:underline"
                  >
                    {shortenAddress(lastTxReceipt.txHash)}
                  </a>
                </p>
                <p className="text-xs text-sigilo-text-secondary">
                  <span className="text-sigilo-text-muted">Report Hash:</span>{" "}
                  <span className="font-mono text-amber-400">{shortenAddress(lastTxReceipt.reportHash)}</span>
                </p>
                <p className="text-xs text-sigilo-text-secondary">
                  <span className="text-sigilo-text-muted">Chain:</span>{" "}
                  <span className="text-green-400">{EVVM_CONFIG.chainName} ({EVVM_CONFIG.chainId})</span>
                </p>
              </>
            )}
            <p className="text-xs text-sigilo-text-muted">
              Timestamp: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {/* Emergency Transaction Card */}
      {txStatus === "emergency_executed" && lastMessage && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 space-y-3 animate-pulse">
          <div className="flex items-center gap-2">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm font-bold text-red-400 uppercase tracking-wide">
              🚨 Emergency Alert Received
            </span>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-md p-3 space-y-2">
            <p className="text-sm text-red-300 font-semibold">
              {lastMessage.replace("EMERGENCY:", "")}
            </p>
            <div className="border-t border-red-500/20 pt-2 space-y-1">
              {lastTxReceipt && (
                <>
                  <p className="text-xs text-sigilo-text-secondary">
                    <span className="text-sigilo-text-muted">TX Hash:</span>{" "}
                    <a
                      href={getExplorerUrl(lastTxReceipt.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-red-400 hover:underline"
                    >
                      {shortenAddress(lastTxReceipt.txHash)}
                    </a>
                  </p>
                  <p className="text-xs text-sigilo-text-secondary">
                    <span className="text-sigilo-text-muted">Report Hash:</span>{" "}
                    <span className="font-mono text-amber-400">{shortenAddress(lastTxReceipt.reportHash)}</span>
                  </p>
                </>
              )}
              <p className="text-xs text-sigilo-text-secondary">
                <span className="text-sigilo-text-muted">Contract:</span>{" "}
                <span className="font-mono">{shortenAddress(EVVM_CONFIG.evvmAddress)}</span>
              </p>
              <p className="text-xs text-sigilo-text-secondary">
                <span className="text-sigilo-text-muted">Chain:</span>{" "}
                <span className="text-amber-400">{EVVM_CONFIG.chainName} ({EVVM_CONFIG.chainId})</span>
              </p>
              <p className="text-xs text-green-400 font-medium pt-1">
                ✓ Emergency broadcast auto-submitted to EVVM network
              </p>
            </div>
          </div>
          <p className="text-xs text-sigilo-text-muted">
            Received: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Message Log */}
      {messageLog.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-sigilo-text-muted uppercase tracking-wide">
            Recent Signals
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {messageLog.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs bg-sigilo-surface/30 rounded px-2 py-1"
              >
                <span className="text-sigilo-text-secondary font-mono truncate max-w-[70%]">
                  {entry.message}
                </span>
                <span className="text-sigilo-text-muted">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-sigilo-text-muted border-t border-sigilo-border/30 pt-3">
        Open this panel on your laptop, start listening and keep the microphone
        close to the transmitting device. The decoded message will appear above.
      </p>
    </Card>
  );
}
