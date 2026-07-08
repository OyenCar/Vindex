import { damlConfig } from "./config";
import { VindexLedger } from "./v2ledger";
import type { V2Config } from "./v2client";

/** Request a real ledger JWT for a party from our server-side token endpoint. */
export async function fetchToken(party: string): Promise<string> {
  const res = await fetch("/api/daml-token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ party }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      `Token request failed (${res.status})${
        (detail as { error?: string }).error ? `: ${(detail as { error?: string }).error}` : ""
      }`,
    );
  }
  const { token } = (await res.json()) as { token: string };
  return token;
}

/** Resolve the (possibly relative "/ledger/") base to an absolute URL in the browser. */
function absoluteBase(): string {
  let base = damlConfig.httpBaseUrl;
  if (base.startsWith("/") && typeof window !== "undefined") {
    base = `${window.location.origin}${base}`;
  }
  return base;
}

/**
 * Construct the JSON Ledger API **v2** client shim (Canton 3.x). Replaces `@daml/ledger` (v1-only).
 * `party` is the connected acting party — v2 sets `actAs` per command, and the client polls that
 * party's active-contract set for streaming.
 */
export function makeLedger(token: string, party: string): VindexLedger {
  const cfg: V2Config = {
    httpBase: absoluteBase(),
    token,
    synchronizerId: damlConfig.synchronizerId || undefined,
  };
  return new VindexLedger(cfg, party);
}

/** Liveness probe against the JSON API (real network detection). */
export async function pingLedger(): Promise<boolean> {
  try {
    const res = await fetch(`${absoluteBase().replace(/\/+$/, "")}/readyz`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
