// vLayer Web Prover Server integration
// Uses TLSNotary-based Web Proofs via https://web-prover.vlayer.xyz

import { verifyProof } from "@/lib/VLayer/vlayerClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body) {
      return Response.json({ ok: false, error: "Missing proof payload" }, { status: 400 });
    }

    const verification = await verifyProof(body);

    return Response.json({ ok: true, verification }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
