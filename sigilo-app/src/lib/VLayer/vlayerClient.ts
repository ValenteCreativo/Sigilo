// vLayer Web Prover Server integration
// Uses TLSNotary-based Web Proofs via https://web-prover.vlayer.xyz

type ProveResponse = {
  data: string;
  version: string;
  meta?: Record<string, unknown>;
};

type VerifyResponse = {
  success: boolean;
  serverDomain?: string;
  notaryKeyFingerprint?: string;
  request?: unknown;
  response?: unknown;
  error?: string;
};

function getEnvVars() {
  const baseUrl = process.env.VLAYER_WEB_PROVER_URL || "https://web-prover.vlayer.xyz";
  const clientId = process.env.VLAYER_CLIENT_ID;
  const apiKey = process.env.VLAYER_API_KEY;

  if (!clientId) throw new Error("Missing env VLAYER_CLIENT_ID");
  if (!apiKey) throw new Error("Missing env VLAYER_API_KEY");

  return { baseUrl, clientId, apiKey };
}

async function handleResponse(res: Response) {
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    const message = typeof json === "object" ? JSON.stringify(json) : String(json);
    throw new Error(`vLayer request failed (${res.status}): ${message}`);
  }

  return json;
}

export async function proveRequest(targetUrl: string): Promise<ProveResponse> {
  const { baseUrl, clientId, apiKey } = getEnvVars();

  const res = await fetch(`${baseUrl}/api/v1/prove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url: targetUrl,
      headers: [],
    }),
  });

  return handleResponse(res) as Promise<ProveResponse>;
}

export async function verifyProof(proof: unknown): Promise<VerifyResponse> {
  const { baseUrl, clientId, apiKey } = getEnvVars();

  const res = await fetch(`${baseUrl}/api/v1/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(proof),
  });

  return handleResponse(res) as Promise<VerifyResponse>;
}

// Tiny helper to call our own Next.js API from the client (for demos)
export async function demoCallProve(endpoint = "/api/vlayer/prove") {
  const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  if (!res.ok) throw new Error(`Local prove endpoint failed (${res.status})`);
  return res.json();
}
