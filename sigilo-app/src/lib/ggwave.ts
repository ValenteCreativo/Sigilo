"use client";

import ggwave_factory from "ggwave";
import type { GgwaveModule } from "ggwave";

let ggwavePromise: Promise<GgwaveModule> | null = null;

/**
 * Lazy-load the ggwave WASM module in the browser.
 * Uses a singleton promise so the module is only instantiated once.
 */
export function getGgwave(): Promise<GgwaveModule> {
  if (typeof window === "undefined") {
    throw new Error("ggwave can only be used in the browser");
  }

  if (!ggwavePromise) {
    ggwavePromise = (async () => {
      const module = (await ggwave_factory()) as GgwaveModule & {
        ready?: Promise<unknown>;
      };

      if (module.ready) {
        await module.ready;
      }

      return module;
    })();
  }

  return ggwavePromise;
}
