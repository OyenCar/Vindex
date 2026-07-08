/**
 * Low-level JSON Ledger API **v2** client (Canton 3.x).
 *
 * Replaces the transport half of `@daml/ledger` (which is v1-only and does not exist for 3.x).
 * Pure fetch calls against the participant's `/v2/...` endpoints. Encoding/decoding of Daml values
 * is NOT done here — that stays in `@daml/types` (see `v2ledger.ts`); this module only moves JSON.
 *
 * Endpoints used (all confirmed against the Seaport DevNet participant, Canton 3.5.7):
 *   GET  /v2/state/ledger-end         -> { offset }
 *   POST /v2/state/active-contracts   -> [ { contractEntry|activeContract: { createdEvent } }, ... ]
 *   POST /v2/commands/submit-and-wait-for-transaction -> { transaction: { events: [...] } }
 */

export interface V2Config {
  /** Absolute base, e.g. https://ledger-api.validator.devnet.sandbox.fivenorth.io (no trailing /v2). */
  httpBase: string;
  /** Ledger-API bearer (from /api/daml-token). Carries the user; actAs is set per command. */
  token: string;
  /** Optional explicit synchronizer/domain id; omitted => participant auto-selects. */
  synchronizerId?: string;
}

/** A created contract as returned by the ledger (createArgument still raw JSON). */
export interface RawCreated {
  contractId: string;
  templateId: string;
  createArgument: unknown;
  signatories?: string[];
  observers?: string[];
}

/** Decode the `sub` (ledger user id) out of the JWT without a library. */
export function userIdFromToken(token: string): string {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      typeof atob === "function"
        ? atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        : Buffer.from(payload, "base64url").toString("utf8"),
    ) as { sub?: string };
    return json.sub ?? "";
  } catch {
    return "";
  }
}

function base(cfg: V2Config): string {
  return cfg.httpBase.replace(/\/+$/, "");
}

async function req(cfg: V2Config, path: string, init: RequestInit): Promise<unknown> {
  const res = await fetch(`${base(cfg)}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    // Surface the shortest decisive part of the ledger error.
    throw new Error(`v2 ${path} ${res.status}: ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : {};
}

/** Current ledger-end offset (needed as the snapshot point for the ACS). */
export async function ledgerEnd(cfg: V2Config): Promise<number> {
  const j = (await req(cfg, "/v2/state/ledger-end", { method: "GET" })) as { offset?: number };
  return typeof j.offset === "number" ? j.offset : 0;
}

/**
 * Active contract set for `party` at `offset`. Returns the raw created events (wildcard filter);
 * template filtering is done by the caller (client-side, by templateId suffix).
 */
export async function activeContracts(
  cfg: V2Config,
  party: string,
  offset: number,
): Promise<RawCreated[]> {
  const body = {
    activeAtOffset: offset,
    verbose: false,
    filter: {
      filtersByParty: {
        [party]: {
          cumulative: [{ identifierFilter: { WildcardFilter: { value: { includeCreatedEventBlob: false } } } }],
        },
      },
    },
  };
  const arr = (await req(cfg, "/v2/state/active-contracts", {
    method: "POST",
    body: JSON.stringify(body),
  })) as unknown[];
  const out: RawCreated[] = [];
  for (const el of Array.isArray(arr) ? arr : []) {
    const created = extractCreated(el);
    if (created) out.push(created);
  }
  return out;
}

/**
 * A single v2 command (create or exercise), already-encoded arguments. The variant tag is
 * **PascalCase** (`CreateCommand`/`ExerciseCommand`) and the create payload is **`createArguments`**
 * (plural) — camelCase or the singular field fails the sum-type decoder with a `CNil` error.
 */
export type V2Command =
  | { CreateCommand: { templateId: string; createArguments: unknown } }
  | {
      ExerciseCommand: {
        templateId: string;
        contractId: string;
        choice: string;
        choiceArgument: unknown;
      };
    };

export interface RawEvent {
  created?: RawCreated;
  archivedContractId?: string;
  exerciseResult?: unknown;
}

/** Submit one command and wait for the resulting transaction; returns its parsed events. */
export async function submitForTransaction(
  cfg: V2Config,
  command: V2Command,
  actAs: string[],
  userId: string,
): Promise<RawEvent[]> {
  // v2 wraps the JsCommands object under a top-level `commands` key:
  //   { commands: { commands: [...], commandId, actAs, readAs, userId, synchronizerId } }
  const inner: Record<string, unknown> = {
    commands: [command],
    actAs,
    readAs: actAs,
    commandId: `vindex-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    submissionId: `vindex-${Date.now()}`,
  };
  if (userId) inner.userId = userId;
  if (cfg.synchronizerId) inner.synchronizerId = cfg.synchronizerId;
  const body: Record<string, unknown> = { commands: inner };

  const resp = (await req(cfg, "/v2/commands/submit-and-wait-for-transaction", {
    method: "POST",
    body: JSON.stringify(body),
  })) as { transaction?: { events?: unknown[] } };

  const events: RawEvent[] = [];
  for (const ev of resp.transaction?.events ?? []) {
    const e = ev as Record<string, unknown>;
    const createdWrap = (e.CreatedEvent ?? e.createdEvent ?? e.created) as Record<string, unknown> | undefined;
    if (createdWrap) {
      const c = normalizeCreated(createdWrap);
      if (c) events.push({ created: c });
      continue;
    }
    const exWrap = (e.ExercisedEvent ?? e.exercisedEvent ?? e.exercised) as Record<string, unknown> | undefined;
    if (exWrap) {
      events.push({ exerciseResult: (exWrap.exerciseResult ?? exWrap.exercise_result) });
      continue;
    }
    const arWrap = (e.ArchivedEvent ?? e.archivedEvent ?? e.archived) as Record<string, unknown> | undefined;
    if (arWrap) events.push({ archivedContractId: String(arWrap.contractId ?? arWrap.contract_id ?? "") });
  }
  return events;
}

// --- shape helpers: the participant wraps created events under a few possible keys ---

export function normalizeCreated(o: Record<string, unknown>): RawCreated | null {
  const contractId = o.contractId ?? o.contract_id;
  const templateId = o.templateId ?? o.template_id;
  const createArgument = o.createArgument ?? o.create_argument ?? o.createArguments ?? o.arguments;
  if (typeof contractId !== "string" || typeof templateId !== "string") return null;
  return {
    contractId,
    templateId,
    createArgument,
    signatories: (o.signatories as string[]) ?? [],
    observers: (o.observers as string[]) ?? [],
  };
}

/** Pull a created event out of an ACS response element (several possible envelopes). */
function extractCreated(el: unknown): RawCreated | null {
  if (!el || typeof el !== "object") return null;
  const o = el as Record<string, unknown>;
  // Common v2 envelopes: { contractEntry: { JsActiveContract: { createdEvent } } },
  // { activeContract: { createdEvent } }, or a bare { createdEvent }.
  const entry =
    (o.contractEntry as Record<string, unknown>) ??
    (o.activeContract as Record<string, unknown>) ??
    o;
  const active =
    (entry.JsActiveContract as Record<string, unknown>) ??
    (entry.activeContract as Record<string, unknown>) ??
    entry;
  const created =
    (active.createdEvent as Record<string, unknown>) ??
    (active.CreatedEvent as Record<string, unknown>) ??
    (active.created as Record<string, unknown>);
  return created ? normalizeCreated(created) : null;
}
