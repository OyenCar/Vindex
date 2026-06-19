import Ledger from "@daml/ledger";
import { damlConfig } from "./config";

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

/**
 * Construct a real `@daml/ledger` client. The party is carried inside the token's
 * `actAs` claim. `reconnectThreshold` gives automatic websocket reconnection.
 *
 * `@daml/ledger` requires an absolute http(s) base, so a relative proxy path
 * (e.g. "/ledger/") is resolved against the current origin at runtime.
 */
export function makeLedger(token: string): Ledger {
  let httpBaseUrl = damlConfig.httpBaseUrl;
  if (httpBaseUrl.startsWith("/") && typeof window !== "undefined") {
    httpBaseUrl = `${window.location.origin}${httpBaseUrl}`;
  }
  return new Ledger({
    token,
    httpBaseUrl,
    wsBaseUrl: damlConfig.wsBaseUrl,
    reconnectThreshold: damlConfig.reconnectThreshold,
  });
}

/** Liveness probe against the JSON API (real network detection). */
export async function pingLedger(): Promise<boolean> {
  try {
    const res = await fetch(`${damlConfig.httpBaseUrl}readyz`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
