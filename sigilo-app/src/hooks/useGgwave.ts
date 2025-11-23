"use client";

import { useEffect, useState } from "react";
import type { GgwaveModule } from "ggwave";
import { getGgwave } from "@/lib/ggwave";

type UseGgwaveState = {
  ggwave: GgwaveModule | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Client-only hook that resolves the shared ggwave WASM module.
 * Ensures components don't attempt to use ggwave before it's ready.
 */
export function useGgwave(): UseGgwaveState {
  const [state, setState] = useState<UseGgwaveState>({
    ggwave: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const module = await getGgwave();
        if (!cancelled) {
          setState({ ggwave: module, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            ggwave: null,
            loading: false,
            error: error instanceof Error ? error : new Error("Failed to load ggwave"),
          });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
