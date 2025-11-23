"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app";
import { Card } from "@/components/ui";
import { Button } from "@/components/ui";
import { useGgwave } from "@/hooks/useGgwave";

const textDecoder = typeof window !== "undefined" ? new TextDecoder() : null;

export default function GgwaveTestPage() {
  const { ggwave, loading, error } = useGgwave();
  const [input, setInput] = useState("signal check");
  const [decoded, setDecoded] = useState<string | null>(null);
  const [waveformInfo, setWaveformInfo] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const canRun = useMemo(() => !!ggwave && !loading && !error, [ggwave, loading, error]);

  const handleRun = async () => {
    if (!ggwave || !textDecoder) return;

    setIsRunning(true);
    setLastError(null);

    try {
      const params = ggwave.getDefaultParameters();
      const instance = ggwave.init(params);

      const waveform = ggwave.encode(
        instance,
        input,
        ggwave.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_FAST,
        10
      );

      const decodedBytes = ggwave.decode(instance, waveform);
      ggwave.free(instance);

      setWaveformInfo(`${waveform.length} samples (Int8)`);
      setDecoded(decodedBytes ? textDecoder.decode(decodedBytes) : null);
    } catch (runError) {
      setLastError(
        runError instanceof Error ? runError.message : "Failed to run ggwave test"
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AppShell title="ggwave Test">
      <main className="min-h-screen bg-sigilo-bg">
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
          <Card className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-sigilo-text-primary">
                ggwave Loopback
              </h1>
              <p className="text-sm text-sigilo-text-muted">
                Encodes your text with the bundled ggwave WASM module and immediately decodes
                it. Useful for sanity-checking initialization without touching audio devices.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-sigilo-text-secondary">
                Payload
              </label>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="w-full bg-sigilo-surface border border-sigilo-border rounded-lg px-3 py-2 text-sm text-sigilo-text-primary placeholder-sigilo-text-muted focus:outline-none focus:border-sigilo-teal/50"
                placeholder="hello js"
              />
            </div>

            <div className="flex items-center gap-3 text-sm text-sigilo-text-muted">
              <span>
                {loading && "Loading ggwave..."}
                {error && `Failed to load ggwave: ${error.message}`}
                {!loading && !error && "ggwave module ready"}
              </span>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleRun} disabled={!canRun || isRunning} isLoading={isRunning}>
                Run encode/decode
              </Button>
              {waveformInfo && (
                <div className="text-xs text-sigilo-text-muted whitespace-nowrap self-center">
                  {waveformInfo}
                </div>
              )}
            </div>

            {decoded && (
              <div className="bg-sigilo-surface/50 border border-sigilo-border/50 rounded-lg p-4 space-y-2">
                <p className="text-xs text-sigilo-text-muted">Decoded payload</p>
                <p className="font-mono text-sigilo-text-primary break-all">{decoded}</p>
              </div>
            )}

            {lastError && (
              <p className="text-sm text-sigilo-red">
                {lastError}
              </p>
            )}
          </Card>
        </div>
      </main>
    </AppShell>
  );
}
