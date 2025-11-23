"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";
import {
  initGgwave,
  playPCM,
  type GgwaveContext,
  type ProtocolType,
} from "@/lib/ggwaveClient";
import { useGgwave } from "@/hooks/useGgwave";

type TransmitterStatus =
  | "idle"
  | "initializing"
  | "ready"
  | "encoding"
  | "playing"
  | "done"
  | "error";

const MAX_MESSAGE_LENGTH = 120;

interface GgwaveTransmitterProps {
  location?: { lat: number; lng: number } | null;
}

export function GgwaveTransmitter({ location }: GgwaveTransmitterProps) {
  const [message, setMessage] = useState("");
  const [protocol, setProtocol] = useState<ProtocolType>("audible");
  const [status, setStatus] = useState<TransmitterStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [looping, setLooping] = useState(false);

  const { loading: ggwaveLoading, error: ggwaveError } = useGgwave();
  const ggwaveRef = useRef<GgwaveContext | null>(null);
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (ggwaveError) {
      setStatus("error");
      setErrorMessage(ggwaveError.message);
    }
  }, [ggwaveError]);

  // Clean up loop timer on unmount
  useEffect(() => {
    return () => {
      if (loopTimerRef.current) {
        clearInterval(loopTimerRef.current);
      }
    };
  }, []);

  const initializeGgwave = useCallback(async () => {
    if (ggwaveRef.current) return ggwaveRef.current;

    setStatus("initializing");
    setErrorMessage(null);

    try {
      const context = await initGgwave();
      ggwaveRef.current = context;
      setStatus("ready");
      return context;
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to initialize ggwave"
      );
      return null;
    }
  }, []);

  const handleSend = useCallback(async () => {
    // Validate message
    if (!message.trim()) {
      setErrorMessage("Please enter a message");
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      setErrorMessage(`Message must be ${MAX_MESSAGE_LENGTH} characters or less`);
      return;
    }

    setErrorMessage(null);

    try {
      // Initialize ggwave if needed
      let context = ggwaveRef.current;
      if (!context) {
        context = await initializeGgwave();
        if (!context) return;
      }

      // Encode message
      setStatus("encoding");
      const samples = context.sendMessageToPCM(message, protocol);

      const playOnce = async () => {
        setStatus("playing");
        await playPCM(samples, context.getSampleRate());
      };

      const stopLoop = () => {
        if (loopTimerRef.current) {
          clearInterval(loopTimerRef.current);
          loopTimerRef.current = null;
        }
        setLooping(false);
        setStatus("done");
        setTimeout(() => setStatus("ready"), 1200);
        window.removeEventListener("ggwave:received", onReceived);
      };

      const onReceived = () => stopLoop();

      const startLoop = async () => {
        setLooping(true);
        await playOnce();
        loopTimerRef.current = setInterval(() => {
          void playOnce();
        }, 1200);
        window.addEventListener("ggwave:received", onReceived, { once: true });
      };

      await startLoop();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  }, [message, protocol, initializeGgwave]);

  // Emergency send with location
  const handleEmergency = useCallback(async () => {
    setErrorMessage(null);

    try {
      let context = ggwaveRef.current;
      if (!context) {
        context = await initializeGgwave();
        if (!context) return;
      }

      // Build emergency message with location
      let emergencyMsg = "EMERGENCY:HELP";
      if (location) {
        emergencyMsg = `EMERGENCY:${location.lat.toFixed(5)},${location.lng.toFixed(5)}`;
      }

      setStatus("encoding");
      const samples = context.sendMessageToPCM(emergencyMsg, "audible"); // audible for emergencies

      const playOnce = async () => {
        setStatus("playing");
        await playPCM(samples, context.getSampleRate());
      };

      const stopLoop = () => {
        if (loopTimerRef.current) {
          clearInterval(loopTimerRef.current);
          loopTimerRef.current = null;
        }
        setLooping(false);
        setStatus("done");
        setTimeout(() => setStatus("ready"), 1200);
        window.removeEventListener("ggwave:received", onReceived);
      };

      const onReceived = () => stopLoop();

      setLooping(true);
      await playOnce();
      loopTimerRef.current = setInterval(() => {
        void playOnce();
      }, 1200);
      window.addEventListener("ggwave:received", onReceived, { once: true });

    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send emergency"
      );
    }
  }, [location, initializeGgwave]);

  const getStatusDisplay = () => {
    switch (status) {
      case "idle":
        return { text: "Ready to initialize", color: "text-sigilo-text-muted" };
      case "initializing":
        return {
          text: ggwaveLoading ? "Loading audio engine..." : "Initializing ggwave...",
          color: "text-amber-400",
        };
      case "ready":
        return { text: "Ready to transmit", color: "text-sigilo-teal" };
      case "encoding":
        return { text: "Encoding message...", color: "text-amber-400" };
      case "playing":
        return {
          text: looping ? "Transmitting (looping)..." : "Playing signal...",
          color: "text-blue-400",
        };
      case "done":
        return { text: "Signal sent!", color: "text-green-400" };
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
        <div className="w-10 h-10 bg-sigilo-teal/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-sigilo-teal"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-sigilo-text-primary">
            Transmitter
          </h3>
          <p className="text-xs text-sigilo-text-muted">Open on your phone</p>
        </div>
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-sigilo-text-secondary">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          placeholder="Enter your signal message..."
          rows={3}
          className="w-full bg-sigilo-surface border border-sigilo-border rounded-lg px-3 py-2 text-sm text-sigilo-text-primary placeholder-sigilo-text-muted focus:outline-none focus:border-sigilo-teal/50 resize-none"
        />
        <p className="text-xs text-sigilo-text-muted text-right">
          {message.length}/{MAX_MESSAGE_LENGTH}
        </p>
      </div>

      {/* Protocol Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-sigilo-text-secondary">
          Signal Protocol
        </label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="protocol"
              value="ultrasonic"
              checked={protocol === "ultrasonic"}
              onChange={() => setProtocol("ultrasonic")}
              className="w-4 h-4 text-sigilo-teal bg-sigilo-surface border-sigilo-border focus:ring-sigilo-teal"
            />
            <span className="text-sm text-sigilo-text-primary">
              Ultrasonic
              <span className="text-xs text-sigilo-text-muted ml-1">
                (recommended)
              </span>
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="protocol"
              value="audible"
              checked={protocol === "audible"}
              onChange={() => setProtocol("audible")}
              className="w-4 h-4 text-sigilo-teal bg-sigilo-surface border-sigilo-border focus:ring-sigilo-teal"
            />
            <span className="text-sm text-sigilo-text-primary">Audible</span>
          </label>
        </div>
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={
          status === "encoding" ||
          status === "playing" ||
          status === "initializing" ||
          ggwaveLoading
        }
        isLoading={
          status === "encoding" || status === "playing" || status === "initializing" || ggwaveLoading
        }
        className="w-full"
      >
        {status === "playing" ? (
          <>
            <svg
              className="w-4 h-4 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            Transmitting...
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
                d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
            Send via Sound
          </>
        )}
      </Button>

      {/* Emergency Button */}
      <button
        onClick={handleEmergency}
        disabled={
          status === "encoding" ||
          status === "playing" ||
          status === "initializing" ||
          ggwaveLoading
        }
        className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-sigilo-red/20 border border-sigilo-red/50 text-sigilo-red hover:bg-sigilo-red/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        🚨 Emergency Alert
        {location && <span className="text-xs opacity-70">(+GPS)</span>}
      </button>

      {/* Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === "done"
              ? "bg-green-400"
              : status === "error"
              ? "bg-sigilo-red"
              : status === "playing"
              ? "bg-blue-400 animate-pulse"
              : status === "ready"
              ? "bg-sigilo-teal"
              : "bg-sigilo-text-muted"
          }`}
        />
        <span className={`text-xs ${statusDisplay.color}`}>
          {statusDisplay.text}
        </span>
      </div>

      {/* Help text */}
      <p className="text-xs text-sigilo-text-muted border-t border-sigilo-border/30 pt-3">
        Open this panel on your phone, type a short message and send it via
        ultrasound. The receiver device will decode it automatically.
      </p>
    </Card>
  );
}
