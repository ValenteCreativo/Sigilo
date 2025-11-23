"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";
import { initGgwave, type GgwaveContext, type GgwaveDecoder } from "@/lib/ggwaveClient";

type ReceiverStatus =
  | "idle"
  | "initializing"
  | "requesting_permission"
  | "listening"
  | "decoding"
  | "error";

type TransactionStatus = "idle" | "executed" | "error";

interface DecodedMessage {
  message: string;
  timestamp: Date;
  isTransaction: boolean;
}

export function GgwaveReceiver() {
  const [status, setStatus] = useState<ReceiverStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [messageLog, setMessageLog] = useState<DecodedMessage[]>([]);

  const ggwaveRef = useRef<GgwaveContext | null>(null);
  const decoderRef = useRef<GgwaveDecoder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Cleanup function
  const stopListening = useCallback(() => {
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

  const processDecodedMessage = useCallback((message: string) => {
    setLastMessage(message);

    // Check if it's a transaction message
    const isTransaction = message.startsWith("TX:");
    const txLabel = isTransaction ? message.slice(3).trim() : message;

    // Add to log
    const decodedMessage: DecodedMessage = {
      message: txLabel,
      timestamp: new Date(),
      isTransaction,
    };

    setMessageLog((prev) => [decodedMessage, ...prev].slice(0, 10));

    // Simulate transaction execution
    if (isTransaction) {
      setTxStatus("executed");
    } else {
      setTxStatus("executed");
    }
  }, []);

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
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create decoder
      decoderRef.current = ggwaveRef.current.createDecoder(audioContext.sampleRate);

      // Create media stream source
      const source = audioContext.createMediaStreamSource(stream);

      // Create script processor for audio processing
      // Using 4096 buffer size for better performance
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
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
        isLoading={status === "initializing" || status === "requesting_permission"}
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
              Simulated Transaction
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-sigilo-text-secondary">
              <span className="text-sigilo-text-muted">Message:</span>{" "}
              <span className="font-mono">{lastMessage}</span>
            </p>
            <p className="text-xs text-sigilo-text-secondary">
              <span className="text-sigilo-text-muted">Status:</span>{" "}
              <span className="text-green-400">Executed on EVVM demo</span>
            </p>
            <p className="text-xs text-sigilo-text-muted">
              Timestamp: {new Date().toLocaleTimeString()}
            </p>
          </div>
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
