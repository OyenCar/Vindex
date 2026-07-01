import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

// Real token issuance. Runs server-side so secrets never reach the browser.
export const runtime = "nodejs";

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * Issues a Daml Ledger-API JWT for a party.
 *
 *  - DAML_AUTH_MODE=hosted  → return the operator-provided token (or wire your OIDC
 *    client-credentials exchange here). This is the production path for a hosted participant.
 *  - DAML_AUTH_MODE=dev (default) → mint an HS256 token for a local sandbox started with
 *    `--auth-jwt-hs256-unsafe=<DAML_JWT_SECRET>`. Dev only; never use in production.
 */
export async function POST(req: NextRequest) {
  let party: unknown;
  try {
    ({ party } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (typeof party !== "string" || party.length === 0) {
    return NextResponse.json({ error: "party (string) is required" }, { status: 400 });
  }

  const mode = process.env.DAML_AUTH_MODE ?? "dev";

  if (mode === "hosted") {
    // Option A: a pre-issued token for the participant (simplest for a demo).
    const token = process.env.DAML_HOSTED_TOKEN;
    if (token) return NextResponse.json({ token });
    // Option B: exchange OIDC client credentials for a ledger token.
    const tokenUrl = process.env.DAML_OIDC_TOKEN_URL;
    if (tokenUrl) {
      const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.DAML_OIDC_CLIENT_ID ?? "",
        client_secret: process.env.DAML_OIDC_CLIENT_SECRET ?? "",
        audience: process.env.DAML_OIDC_AUDIENCE ?? "",
        scope: process.env.DAML_OIDC_SCOPE ?? "",
      });
      const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) {
        return NextResponse.json(
          { error: `OIDC token exchange failed: ${res.status}` },
          { status: 502 },
        );
      }
      const data = (await res.json()) as { access_token?: string };
      if (!data.access_token) {
        return NextResponse.json({ error: "OIDC response missing access_token" }, { status: 502 });
      }
      return NextResponse.json({ token: data.access_token });
    }
    return NextResponse.json(
      { error: "hosted mode: set DAML_HOSTED_TOKEN or DAML_OIDC_TOKEN_URL" },
      { status: 500 },
    );
  }

  // dev: unsafe HS256 token for a local sandbox.
  const secret = process.env.DAML_JWT_SECRET ?? "secret";
  const ledgerId = process.env.DAML_LEDGER_ID ?? "sandbox";
  const header = { alg: "HS256", typ: "JWT" };
  const getRole = (p: string) => p.split("::")[0];
  const role = getRole(party);
  const isAuthorizedRole = role === "Worker" || role === "Investor" || role === "Agent";
  const publicParty = process.env.NEXT_PUBLIC_PARTY_PUBLIC ?? "";
  const readAs = [party];
  if (isAuthorizedRole && publicParty && !readAs.includes(publicParty)) {
    readAs.push(publicParty);
  }
  const payload = {
    "https://daml.com/ledger-api": {
      ledgerId,
      applicationId: "Vindex",
      actAs: [party],
      readAs,
    },
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");

  return NextResponse.json({ token: `${signingInput}.${signature}` });
}
