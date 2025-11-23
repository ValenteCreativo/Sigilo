"use client";

import type { GgwaveModule } from "ggwave";
import { getGgwave } from "@/lib/ggwave";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type ProtocolType = "audible" | "ultrasonic";

export interface GgwaveContext {
  /**
   * Encode a message to PCM audio samples
   * @param message - The message to encode (max ~120 chars)
   * @param protocol - "audible" for normal frequency, "ultrasonic" for high frequency
   * @returns Int8Array of PCM samples at 48kHz (ggwave native format)
   */
  sendMessageToPCM(message: string, protocol?: ProtocolType): Int8Array;

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
   * @param chunk - Float32Array of mono audio samples from microphone
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

export const SAMPLE_RATE = 48000;
const SAMPLES_PER_FRAME = 1024;
const DEFAULT_VOLUME = 25; // Increased volume for better transmission

const textDecoder = new TextDecoder();

let ggwaveModulePromise: Promise<GgwaveModule> | null = null;

const ensureModule = () => {
  if (!ggwaveModulePromise) {
    ggwaveModulePromise = getGgwave();
  }
  return ggwaveModulePromise;
};

/**
 * Convert Int8Array (ggwave native) to Float32Array for Web Audio API playback
 * ggwave outputs Int8 samples in range [-128, 127], we need Float32 in [-1, 1]
 */
const int8ToFloat32 = (data: Int8Array): Float32Array => {
  const result = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    // Normalize Int8 [-128, 127] to Float32 [-1, 1]
    result[i] = data[i] / 128.0;
  }
  return result;
};

/**
 * Convert Float32Array from microphone to Int8Array for ggwave decoder
 * Microphone gives Float32 in [-1, 1], ggwave expects Int8 in [-128, 127]
 */
const float32ToInt8 = (data: Float32Array): Int8Array => {
  const result = new Int8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    // Clamp and convert Float32 [-1, 1] to Int8 [-128, 127]
    const clamped = Math.max(-1, Math.min(1, data[i]));
    result[i] = Math.round(clamped * 127);
  }
  return result;
};

const concatInt8 = (first: Int8Array, second: Int8Array): Int8Array => {
  const merged = new Int8Array(first.length + second.length);
  merged.set(first, 0);
  merged.set(second, first.length);
  return merged;
};

const bytesToString = (data: Int8Array): string => textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));

/**
 * Initialize ggwave (browser-only, lazy-loaded)
 * @returns Promise resolving to GgwaveContext
 */
export async function initGgwave(): Promise<GgwaveContext> {
  if (typeof window === "undefined") {
    throw new Error("ggwave can only be initialized in the browser");
  }

  const ggwave = await ensureModule();

  // Create encoder instance with proper configuration
  const encoderParams = ggwave.getDefaultParameters();
  encoderParams.sampleRateOut = SAMPLE_RATE;
  encoderParams.sampleRateInp = SAMPLE_RATE;
  encoderParams.samplesPerFrame = SAMPLES_PER_FRAME;

  const encoderInstance = ggwave.init(encoderParams);

  const context: GgwaveContext = {
    sendMessageToPCM(
      message: string,
      protocol: ProtocolType = "ultrasonic"
    ): Int8Array {
      // Select protocol - use the ProtocolId enum object directly
      const protocolId =
        protocol === "ultrasonic"
          ? ggwave.ProtocolId.GGWAVE_PROTOCOL_ULTRASOUND_NORMAL
          : ggwave.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_NORMAL;

      // Encode message to Int8Array waveform
      const encoded = ggwave.encode(
        encoderInstance,
        message,
        protocolId,
        DEFAULT_VOLUME
      );

      return encoded;
    },

    createDecoder(sampleRate: number): GgwaveDecoder {
      // Create decoder instance with input sample rate from microphone
      const decoderParams = ggwave.getDefaultParameters();
      decoderParams.sampleRateInp = sampleRate;
      decoderParams.sampleRateOut = SAMPLE_RATE;
      decoderParams.samplesPerFrame = SAMPLES_PER_FRAME;

      const decoderInstance = ggwave.init(decoderParams);

      // Buffer to accumulate PCM samples before feeding to the decoder
      let sampleBuffer: Int8Array = new Int8Array(0);

      return {
        processSamples(chunk: Float32Array): string | null {
          try {
            // Convert Float32 microphone samples to Int8 for ggwave
            const converted = float32ToInt8(chunk);
            sampleBuffer = concatInt8(sampleBuffer, converted);

            // Try to decode from accumulated buffer
            // ggwave.decode expects the full waveform buffer
            const decoded = ggwave.decode(decoderInstance, sampleBuffer);

            if (decoded && decoded.length > 0) {
              // Successfully decoded a message - clear buffer
              sampleBuffer = new Int8Array(0);
              return bytesToString(decoded);
            }

            // Trim runaway buffers to roughly 10 seconds of audio to prevent memory issues
            const maxBuffered = SAMPLE_RATE * 10;
            if (sampleBuffer.length > maxBuffered) {
              // Keep only the last ~5 seconds
              sampleBuffer = sampleBuffer.slice(sampleBuffer.length - SAMPLE_RATE * 5);
            }
          } catch (error) {
            console.error("ggwave decode error:", error);
          }

          return null;
        },

        reset(): void {
          sampleBuffer = new Int8Array(0);
        },

        dispose(): void {
          sampleBuffer = new Int8Array(0);
          ggwave.free(decoderInstance);
        },
      };
    },

    getSampleRate(): number {
      return SAMPLE_RATE;
    },

    dispose(): void {
      ggwave.free(encoderInstance);
    },
  };

  return context;
}

/**
 * Play Int8 PCM samples through the speakers using Web Audio API
 * @param samples - Int8Array of PCM samples from ggwave encoder
 * @param sampleRate - Sample rate of the audio (default 48000)
 */
export async function playPCM(
  samples: Int8Array,
  sampleRate: number = SAMPLE_RATE
): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("playPCM can only be called in the browser");
  }

  // Convert Int8 to Float32 for Web Audio API
  const float32Samples = int8ToFloat32(samples);

  const audioContext = new AudioContext({ sampleRate });

  // Create audio buffer
  const buffer = audioContext.createBuffer(1, float32Samples.length, sampleRate);
  buffer.getChannelData(0).set(float32Samples);

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
