// vLayer Web Prover Server integration
// Uses TLSNotary-based Web Proofs via https://web-prover.vlayer.xyz

import { proveRequest } from "@/lib/VLayer/vlayerClient";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetUrl =
      typeof body?.url === "string" && body.url.length > 0
        ? body.url
        : "https://data-api.binance.vision/api/v3/exchangeInfo?symbol=ETHUSDC";

    const proof = await proveRequest(targetUrl);

    return Response.json({ ok: true, proof }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
