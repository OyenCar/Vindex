import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

// Real party allocation (registration) on the participant. Server-side: needs an admin token.
export const runtime = "nodejs";

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function adminToken(): string {
  const secret = process.env.DAML_JWT_SECRET ?? "secret";
  const ledgerId = process.env.DAML_LEDGER_ID ?? "sandbox";
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    "https://daml.com/ledger-api": { ledgerId, applicationId: "verdix", admin: true },
    exp: Math.floor(Date.now() / 1000) + 5 * 60,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = crypto.createHmac("sha256", secret).update(signingInput).digest("base64url");
  return `${signingInput}.${sig}`;
}

/** POST { identifierHint, displayName? } → allocates a real Canton party, returns its id. */
export async function POST(req: NextRequest) {
  if ((process.env.DAML_AUTH_MODE ?? "dev") !== "dev") {
    return NextResponse.json(
      { error: "party allocation is restricted to dev mode" },
      { status: 403 },
    );
  }
  let body: { identifierHint?: string; displayName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const identifierHint = (body.identifierHint ?? "").trim();
  if (!identifierHint) {
    return NextResponse.json({ error: "identifierHint is required" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_LEDGER_HTTP_URL ?? "http://localhost:7575/";
  const res = await fetch(`${base}v1/parties/allocate`, {
    method: "POST",
    headers: { authorization: `Bearer ${adminToken()}`, "content-type": "application/json" },
    body: JSON.stringify({ identifierHint, displayName: body.displayName ?? identifierHint }),
  });
  const data = (await res.json()) as { result?: { identifier?: string }; errors?: string[] };
  if (!res.ok || !data.result?.identifier) {
    return NextResponse.json(
      { error: data.errors?.join("; ") ?? `allocation failed (${res.status})` },
      { status: 502 },
    );
  }
  return NextResponse.json({ party: data.result.identifier });
}
