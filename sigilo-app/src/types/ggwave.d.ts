/**
 * TypeScript declarations for ggwave
 * @see https://github.com/ggerganov/ggwave
 */

declare module "ggwave" {
  export interface GgwaveParameters {
    payloadLength?: number;
    sampleRateInp?: number;
    sampleRateOut?: number;
    sampleRate?: number;
    samplesPerFrame?: number;
    soundMarkerThreshold?: number;
    sampleFormatInp?: unknown;
    sampleFormatOut?: unknown;
    operatingMode?: number;
  }

  export interface GgwaveModule {
    ready?: Promise<unknown>;
    init: (parameters: GgwaveParameters) => number;
    getDefaultParameters: () => GgwaveParameters;
    encode: (
      instance: number,
      data: string | Uint8Array,
      protocolId: number,
      volume: number
    ) => Int8Array | Float32Array;
    decode: (instance: number, samples: Int8Array | Float32Array) => Int8Array | null;
    free: (pointer: number) => void;
    SampleFormat: {
      GGWAVE_SAMPLE_FORMAT_UNDEFINED: unknown;
      GGWAVE_SAMPLE_FORMAT_U8: unknown;
      GGWAVE_SAMPLE_FORMAT_I8: unknown;
      GGWAVE_SAMPLE_FORMAT_U16: unknown;
      GGWAVE_SAMPLE_FORMAT_I16: unknown;
      GGWAVE_SAMPLE_FORMAT_F32: unknown;
    };
    ProtocolId: {
      GGWAVE_PROTOCOL_AUDIBLE_NORMAL: number;
      GGWAVE_PROTOCOL_AUDIBLE_FAST: number;
      GGWAVE_PROTOCOL_AUDIBLE_FASTEST: number;
      GGWAVE_PROTOCOL_ULTRASOUND_NORMAL: number;
      GGWAVE_PROTOCOL_ULTRASOUND_FAST: number;
      GGWAVE_PROTOCOL_ULTRASOUND_FASTEST: number;
      GGWAVE_PROTOCOL_DT_NORMAL: number;
      GGWAVE_PROTOCOL_DT_FAST: number;
      GGWAVE_PROTOCOL_DT_FASTEST: number;
      [key: string]: number;
    };
    TxProtocolId: {
      GGWAVE_TX_PROTOCOL_AUDIBLE_NORMAL: number;
      GGWAVE_TX_PROTOCOL_AUDIBLE_FAST: number;
      GGWAVE_TX_PROTOCOL_AUDIBLE_FASTEST: number;
      GGWAVE_TX_PROTOCOL_ULTRASOUND_NORMAL: number;
      GGWAVE_TX_PROTOCOL_ULTRASOUND_FAST: number;
      GGWAVE_TX_PROTOCOL_ULTRASOUND_FASTEST: number;
      GGWAVE_TX_PROTOCOL_DT_NORMAL: number;
      GGWAVE_TX_PROTOCOL_DT_FAST: number;
      GGWAVE_TX_PROTOCOL_DT_FASTEST: number;
      [key: string]: number;
    };
  }

  export default function ggwave(): Promise<GgwaveModule>;
}
