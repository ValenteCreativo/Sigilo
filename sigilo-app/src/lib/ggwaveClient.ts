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

const SAMPLE_RATE = 48000;
const SAMPLES_PER_FRAME = 1024;
const DEFAULT_VOLUME = 10;

const textDecoder = new TextDecoder();

let ggwaveModulePromise: Promise<GgwaveModule> | null = null;

const ensureModule = () => {
  if (!ggwaveModulePromise) {
    ggwaveModulePromise = getGgwave();
  }
  return ggwaveModulePromise;
};

const normalizePCM = (samples: Int8Array | Float32Array): Float32Array => {
  if (samples instanceof Float32Array) return samples;
  const result = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    result[i] = samples[i] / 127;
  }
  return result;
};

const concatFloat32 = (
  first: Float32Array,
  second: Float32Array
): Float32Array => {
  const merged = new Float32Array(first.length + second.length);
  merged.set(first, 0);
  merged.set(second, first.length);
  return merged;
};

const bytesToString = (data: Int8Array): string => textDecoder.decode(data);

/**
 * Initialize ggwave (browser-only, lazy-loaded)
 * @returns Promise resolving to GgwaveContext
 */
export async function initGgwave(): Promise<GgwaveContext> {
  if (typeof window === "undefined") {
    throw new Error("ggwave can only be initialized in the browser");
  }

  const ggwave = await ensureModule();

  // Create encoder instance
  const encoderParams = ggwave.getDefaultParameters();
  encoderParams.sampleRateOut = SAMPLE_RATE;
  encoderParams.samplesPerFrame = SAMPLES_PER_FRAME;
  encoderParams.sampleFormatOut = ggwave.SampleFormat.GGWAVE_SAMPLE_FORMAT_F32;

  const encoderInstance = ggwave.init(encoderParams);

  const context: GgwaveContext = {
    sendMessageToPCM(
      message: string,
      protocol: ProtocolType = "ultrasonic"
    ): Float32Array {
      const protocolId =
        protocol === "ultrasonic"
          ? ggwave.TxProtocolId.GGWAVE_TX_PROTOCOL_ULTRASOUND_NORMAL
          : ggwave.TxProtocolId.GGWAVE_TX_PROTOCOL_AUDIBLE_NORMAL;

      const encoded = ggwave.encode(
        encoderInstance,
        message,
        protocolId,
        DEFAULT_VOLUME
      );

      return normalizePCM(encoded);
    },

    createDecoder(sampleRate: number): GgwaveDecoder {
      const decoderParams = ggwave.getDefaultParameters();
      decoderParams.sampleRateInp = sampleRate;
      decoderParams.samplesPerFrame = SAMPLES_PER_FRAME;
      decoderParams.sampleFormatInp = ggwave.SampleFormat.GGWAVE_SAMPLE_FORMAT_F32;

      const decoderInstance = ggwave.init(decoderParams);

      // Buffer to accumulate PCM before feeding to the decoder
      let sampleBuffer: Float32Array = new Float32Array(0);

      return {
        processSamples(chunk: Float32Array): string | null {
          try {
            sampleBuffer = concatFloat32(sampleBuffer, chunk);

            if (sampleBuffer.length >= SAMPLES_PER_FRAME) {
              const decoded = ggwave.decode(decoderInstance, sampleBuffer);
              if (decoded && decoded.length > 0) {
                sampleBuffer = new Float32Array(0);
                return bytesToString(decoded);
              }
            }

            // Trim runaway buffers to roughly two seconds of audio
            const maxBuffered = SAMPLE_RATE * 2;
            if (sampleBuffer.length > maxBuffered) {
              sampleBuffer = sampleBuffer.slice(sampleBuffer.length - maxBuffered);
            }
          } catch (error) {
            console.error("ggwave decode error", error);
          }

          return null;
        },

        reset(): void {
          sampleBuffer = new Float32Array(0);
        },

        dispose(): void {
          sampleBuffer = new Float32Array(0);
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
 * Play PCM samples through the speakers
 * @param samples - PCM samples (Float32 [-1,1] or Int8)
 * @param sampleRate - Sample rate of the audio (default 48000)
 */
export async function playPCM(
  samples: Float32Array | Int8Array,
  sampleRate: number = SAMPLE_RATE
): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("playPCM can only be called in the browser");
  }

  const normalizedSamples = normalizePCM(samples);

  const audioContext = new AudioContext({ sampleRate });

  // Create buffer
  const buffer = audioContext.createBuffer(1, normalizedSamples.length, sampleRate);
  buffer.getChannelData(0).set(normalizedSamples);

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
