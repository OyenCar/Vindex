/**
 * Daml / Canton ledger connection config.
 *
 * The frontend talks to a participant's **HTTP JSON Ledger API** via `@daml/ledger`.
 * For local verification this points at a `daml json-api` sidecar; for production set the
 * NEXT_PUBLIC_LEDGER_* vars to your hosted participant. Nothing here is mocked — these are the
 * real endpoints `@daml/ledger` connects to.
 */
export type Role = "investor" | "worker" | "agent";

export const damlConfig = {
  httpBaseUrl: process.env.NEXT_PUBLIC_LEDGER_HTTP_URL ?? "http://localhost:7575/",
  wsBaseUrl: process.env.NEXT_PUBLIC_LEDGER_WS_URL ?? "ws://localhost:7575/",
  // Auto-reconnect: `@daml/ledger` re-opens dropped websockets when the gap exceeds this (ms).
  reconnectThreshold: Number(process.env.NEXT_PUBLIC_LEDGER_RECONNECT_MS ?? 30000),
  // Pre-filled party ids per role (hosted: the real allocated party ids). Optional — the
  // connect screen also accepts a pasted party id.
  parties: {
    investor: process.env.NEXT_PUBLIC_PARTY_INVESTOR ?? "",
    worker: process.env.NEXT_PUBLIC_PARTY_WORKER ?? "",
    agent: process.env.NEXT_PUBLIC_PARTY_AGENT ?? "",
    public: process.env.NEXT_PUBLIC_PARTY_PUBLIC ?? "",
  } satisfies Record<Role | "public", string>,
  // Open-job audience: the registered worker parties a NEW posting is published to. These become
  // observers of the posting (Canton has no global read, so the audience is an explicit set) and
  // are the parties allowed to apply. The investor does NOT hand-pick a winner — selection is a
  // governance vote over whoever applied. Comma-separated NEXT_PUBLIC_WORKER_POOL; falls back to
  // the single known worker party so a fresh demo works with zero extra config.
  workerPool: (process.env.NEXT_PUBLIC_WORKER_POOL ?? process.env.NEXT_PUBLIC_PARTY_WORKER ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean),
} as const;

export function explorerHint(): string {
  // Canton has no public "block explorer"; on-ledger artefacts are identified by contract /
  // update ids on the participant. We surface those ids instead of a fake explorer link.
  return damlConfig.httpBaseUrl;
}
