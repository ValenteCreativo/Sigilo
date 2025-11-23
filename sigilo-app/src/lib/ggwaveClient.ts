/**
 * ggwave Client Wrapper
 * Encapsulates ggwave WASM initialization and provides clean encode/decode APIs
 * Uses CDN loading to avoid webpack bundling issues with WASM
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type ProtocolType = "audible" | "ultrasonic";

// CDN URL for ggwave
const GGWAVE_CDN_URL = "https://cdn.jsdelivr.net/npm/ggwave@0.4.2/ggwave.js";

// Type definitions (since we're loading from CDN)
interface GgwaveModule {
  getDefaultParameters(): any;
  init(params: any): GgwaveInstance;
  TxProtocolId: {
    GGWAVE_TX_PROTOCOL_AUDIBLE_NORMAL: number;
    GGWAVE_TX_PROTOCOL_ULTRASOUND_NORMAL: number;
  };
}

interface GgwaveInstance {
  encode(message: string, protocol: number, volume: number): Float32Array;
  decode(samples: Float32Array): string | null;
  free(): void;
}

export interface GgwaveContext {
  /**
   * Encode a message to PCM audio samples
   * @param message - The message to encode (max ~120 chars)
   * @param protocol - "audible" for normal frequency, "ultrasonic" for high frequency
   * @returns Float32Array of PCM samples at 48kHz
   */
  sendMessageToPCM(message: string, protocol?: ProtocolType): Float32Array;

  /**
   * Create a decoder for processing incoming audio samples
   * @param sampleRate - The sample rate of the incoming audio (usually from AudioContext)
   */
  createDecoder(sampleRate: number): GgwaveDecoder;

  /**
   * Get the output sample rate used by the encoder
   */
  getSampleRate(): number;

  /**
   * Clean up resources
   */
  dispose(): void;
}

export interface GgwaveDecoder {
  /**
   * Process a chunk of audio samples
   * @param chunk - Float32Array of mono audio samples
   * @returns Decoded message string if successful, null if still accumulating
   */
  processSamples(chunk: Float32Array): string | null;

  /**
   * Reset the decoder state
   */
  reset(): void;

  /**
   * Clean up decoder resources
   */
  dispose(): void;
}

// Module-level cache for the ggwave WASM module
let ggwaveModule: GgwaveModule | null = null;
let modulePromise: Promise<GgwaveModule> | null = null;

// Constants
const SAMPLE_RATE = 48000;
const SAMPLES_PER_FRAME = 1024;

/**
 * Initialize ggwave (browser-only, lazy-loaded)
 * @returns Promise resolving to GgwaveContext
 */
export async function initGgwave(): Promise<GgwaveContext> {
  // Guard for SSR
  if (typeof window === "undefined") {
    throw new Error("ggwave can only be initialized in the browser");
  }

  // Load the module if not already loaded
  if (!ggwaveModule) {
    if (!modulePromise) {
      modulePromise = loadGgwaveModule();
    }
    ggwaveModule = await modulePromise;
  }

  // Create encoder instance
  const encoderParams = ggwaveModule.getDefaultParameters();
  encoderParams.sampleRateOut = SAMPLE_RATE;
  encoderParams.samplesPerFrame = SAMPLES_PER_FRAME;

  const encoderInstance = ggwaveModule.init(encoderParams);

  const context: GgwaveContext = {
    sendMessageToPCM(
      message: string,
      protocol: ProtocolType = "ultrasonic"
    ): Float32Array {
      if (!ggwaveModule) {
        throw new Error("ggwave not initialized");
      }

      // Select protocol based on type
      const protocolId =
        protocol === "ultrasonic"
          ? ggwaveModule.TxProtocolId.GGWAVE_TX_PROTOCOL_ULTRASOUND_NORMAL
          : ggwaveModule.TxProtocolId.GGWAVE_TX_PROTOCOL_AUDIBLE_NORMAL;

      // Encode message to PCM samples (volume 10 = 10%)
      const samples = encoderInstance.encode(message, protocolId, 10);

      return samples;
    },

    createDecoder(sampleRate: number): GgwaveDecoder {
      if (!ggwaveModule) {
        throw new Error("ggwave not initialized");
      }

      // Create decoder instance with input sample rate
      const decoderParams = ggwaveModule.getDefaultParameters();
      decoderParams.sampleRateInp = sampleRate;
      decoderParams.samplesPerFrame = SAMPLES_PER_FRAME;

      const decoderInstance = ggwaveModule.init(decoderParams);

      // Buffer to accumulate samples for processing
      let sampleBuffer: Float32Array = new Float32Array(0);

      return {
        processSamples(chunk: Float32Array): string | null {
          // Append new samples to buffer
          const newBuffer = new Float32Array(sampleBuffer.length + chunk.length);
          newBuffer.set(sampleBuffer);
          newBuffer.set(chunk, sampleBuffer.length);
          sampleBuffer = newBuffer;

          // Process in chunks of SAMPLES_PER_FRAME
          while (sampleBuffer.length >= SAMPLES_PER_FRAME) {
            const frameToProcess = sampleBuffer.slice(0, SAMPLES_PER_FRAME);
            sampleBuffer = sampleBuffer.slice(SAMPLES_PER_FRAME);

            const result = decoderInstance.decode(frameToProcess);
            if (result && result.length > 0) {
              return result;
            }
          }

          return null;
        },

        reset(): void {
          sampleBuffer = new Float32Array(0);
        },

        dispose(): void {
          decoderInstance.free();
          sampleBuffer = new Float32Array(0);
        },
      };
    },

    getSampleRate(): number {
      return SAMPLE_RATE;
    },

    dispose(): void {
      encoderInstance.free();
    },
  };

  return context;
}

/**
 * Load ggwave script from CDN
 */
function loadGgwaveScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).ggwave) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = GGWAVE_CDN_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load ggwave from CDN"));
    document.head.appendChild(script);
  });
}

/**
 * Load the ggwave WASM module
 */
async function loadGgwaveModule(): Promise<GgwaveModule> {
  // Load script from CDN first
  await loadGgwaveScript();

  // Get the ggwave factory from global scope and initialize
  const ggwaveFactory = (window as any).ggwave;
  if (!ggwaveFactory) {
    throw new Error("ggwave not available after script load");
  }

  const module = await ggwaveFactory();
  return module;
}

/**
 * Play PCM samples through the speakers
 * @param samples - Float32Array of PCM samples
 * @param sampleRate - Sample rate of the audio (default 48000)
 */
export async function playPCM(
  samples: Float32Array,
  sampleRate: number = SAMPLE_RATE
): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("playPCM can only be called in the browser");
  }

  const audioContext = new AudioContext({ sampleRate });

  // Create buffer
  const buffer = audioContext.createBuffer(1, samples.length, sampleRate);
  buffer.getChannelData(0).set(samples);

  // Create source and play
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  return new Promise((resolve, reject) => {
    source.onended = () => {
      audioContext.close();
      resolve();
    };

    try {
      source.start();
    } catch (error) {
      audioContext.close();
      reject(error);
    }
  });
}
