/**
 * TypeScript declarations for ggwave
 * @see https://github.com/ggerganov/ggwave
 */

declare module "ggwave" {
  export interface GgwaveModule {
    init: (parameters: GgwaveParameters) => GgwaveInstance;
    getDefaultParameters: () => GgwaveParameters;
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
    };
  }

  export interface GgwaveParameters {
    sampleRateInp?: number;
    sampleRateOut?: number;
    samplesPerFrame?: number;
    soundMarkerThreshold?: number;
    payloadLength?: number;
    operatingMode?: number;
  }

  export interface GgwaveInstance {
    encode: (
      data: string | Uint8Array,
      protocolId: number,
      volume: number
    ) => Float32Array;
    decode: (samples: Float32Array) => string | null;
    free: () => void;
  }

  export default function ggwave(): Promise<GgwaveModule>;
}
