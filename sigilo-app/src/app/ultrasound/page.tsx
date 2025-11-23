"use client";

import { useState, useEffect } from "react";
import { GgwaveTransmitter, GgwaveReceiver } from "@/components/ultrasound";
import { AppShell } from "@/components/app";

export default function UltrasoundPage() {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Watch location when enabled
  useEffect(() => {
    if (!locationEnabled) {
      setCurrentLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError(error.message);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationEnabled]);

  return (
    <AppShell title="Signal Transmission">
      <main className="min-h-screen bg-sigilo-bg">
        <div className="max-w-5xl mx-auto px-4 py-16 space-y-10">
          {/* Header */}
          <header className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sigilo-teal/20 rounded-2xl mb-4">
              <svg
                className="w-8 h-8 text-sigilo-teal"
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
            <h1 className="text-4xl font-bold text-sigilo-text-primary">
              Sound-Based Signal
            </h1>
            <p className="text-sigilo-text-secondary max-w-2xl mx-auto">
              Send a short encrypted signal from one device using sound (ultrasonic or audible)
              and let another device decode it and trigger a transaction.
            </p>

            {/* Tech badges */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <span className="px-3 py-1 bg-sigilo-teal/10 border border-sigilo-teal/30 rounded-full text-xs font-medium text-sigilo-teal">
                ggwave FSK
              </span>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-medium text-blue-400">
                Ultrasonic + Audible
              </span>
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-medium text-purple-400">
                Web Audio API
              </span>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-medium text-amber-400">
                EVVM Integration
              </span>
            </div>
          </header>

          {/* How it works */}
          <section className="bg-sigilo-surface/30 rounded-xl border border-sigilo-border/30 p-6">
            <h2 className="text-lg font-semibold text-sigilo-text-primary mb-4 flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-sigilo-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-sigilo-teal">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-sigilo-text-primary">
                    Encode message
                  </p>
                  <p className="text-xs text-sigilo-text-muted">
                    Type a message and encode it as FSK audio signal
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-400">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-sigilo-text-primary">
                    Transmit via sound
                  </p>
                  <p className="text-xs text-sigilo-text-muted">
                    Play ultrasonic or audible frequencies through speaker
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-green-400">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-sigilo-text-primary">
                    Decode & execute
                  </p>
                  <p className="text-xs text-sigilo-text-muted">
                    Receiver decodes signal and triggers simulated transaction
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Main panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Tracking Toggle (moved closer to sender/receiver) */}
            <div className="lg:col-span-2 bg-sigilo-surface/30 rounded-lg border border-sigilo-border/30 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={locationEnabled}
                    onChange={(e) => setLocationEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-sigilo-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sigilo-red"></div>
                </label>
                <span className="text-sm font-medium text-sigilo-text-primary flex items-center gap-2">
                  <svg className="w-4 h-4 text-sigilo-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location Tracking (Emergency)
                </span>
              </div>

              {locationEnabled && (
                <div className="text-xs text-sigilo-text-muted bg-sigilo-surface/50 px-4 py-2 rounded-lg border border-sigilo-border/30">
                  {locationError ? (
                    <span className="text-sigilo-red">{locationError}</span>
                  ) : currentLocation ? (
                    <span className="font-mono">
                      📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </span>
                  ) : (
                    <span>Acquiring location...</span>
                  )}
                </div>
              )}

              <p className="text-xs text-sigilo-text-muted/70">
                When enabled, emergency signals will include your GPS coordinates for rescue teams.
              </p>
            </div>

            {/* Transmitter */}
            <div>
              <h2 className="text-sm font-medium text-sigilo-text-muted mb-3 flex items-center gap-2">
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
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Phone / Sender
              </h2>
              <GgwaveTransmitter location={currentLocation} />
            </div>

            {/* Receiver */}
            <div>
              <h2 className="text-sm font-medium text-sigilo-text-muted mb-3 flex items-center gap-2">
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Laptop / Receiver
              </h2>
              <GgwaveReceiver />
            </div>
          </div>

          {/* Use cases */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-sigilo-text-primary flex items-center gap-2">
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Use Cases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sigilo-surface/30 rounded-lg border border-sigilo-border/30 p-4">
                <h3 className="text-sm font-medium text-sigilo-text-primary mb-2">
                  Offline Transaction Signing
                </h3>
                <p className="text-xs text-sigilo-text-muted">
                  Air-gapped devices can communicate transaction approvals via
                  sound, ensuring no network connection is ever required for
                  signing.
                </p>
              </div>
              <div className="bg-sigilo-surface/30 rounded-lg border border-sigilo-border/30 p-4">
                <h3 className="text-sm font-medium text-sigilo-text-primary mb-2">
                  Emergency Alert Propagation
                </h3>
                <p className="text-xs text-sigilo-text-muted">
                  When networks are blocked, alerts can propagate through
                  ultrasonic mesh between nearby devices until reaching a safe
                  node.
                </p>
              </div>
              <div className="bg-sigilo-surface/30 rounded-lg border border-sigilo-border/30 p-4">
                <h3 className="text-sm font-medium text-sigilo-text-primary mb-2">
                  Covert Key Exchange
                </h3>
                <p className="text-xs text-sigilo-text-muted">
                  Exchange cryptographic keys or seeds between devices without
                  any visible or detectable digital communication.
                </p>
              </div>
              <div className="bg-sigilo-surface/30 rounded-lg border border-sigilo-border/30 p-4">
                <h3 className="text-sm font-medium text-sigilo-text-primary mb-2">
                  Proximity Verification
                </h3>
                <p className="text-xs text-sigilo-text-muted">
                  Prove physical proximity between devices for secure
                  handoffs or multi-device authentication ceremonies.
                </p>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div className="text-center pt-8 border-t border-sigilo-border/30">
            <p className="text-xs text-sigilo-text-muted max-w-xl mx-auto">
              This demo uses ggwave for FSK audio encoding/decoding. Ultrasonic
              mode operates at 18-20 kHz, which is inaudible to most humans but
              may be heard by some. For true covert operation, ensure your
              environment is appropriate.
            </p>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
