/**
 * `VindexLedger` — a drop-in replacement for the `@daml/ledger` client, backed by the JSON Ledger
 * API **v2**. Exposes the same `create` / `exercise` / `streamQueries` surface the panels and
 * `useStreamQueries` already call, so the UI is unchanged; only the transport swaps.
 *
 * Encoding/decoding of Daml values reuses the `@daml/types` metadata carried by the generated
 * `@daml.js/vindex` templates (`template.encode/.decoder`, `choice.argumentEncode/.resultDecoder`).
 *
 * Streaming is implemented by **polling the active-contract set** (`/v2/state/active-contracts`)
 * rather than the `/v2/updates` websocket: browsers can't set the `Authorization` header on a WS,
 * and the ACS is the source of truth. Poll cadence is `POLL_MS`.
 */
import type { Template, Choice, ContractId } from "@daml/types";
import {
  type V2Config,
  activeContracts,
  ledgerEnd,
  submitForTransaction,
  userIdFromToken,
  type RawCreated,
} from "./v2client";

const POLL_MS = 2500;

/** A created contract, decoded. Mirrors the old `@daml/ledger` `CreateEvent`. */
export interface CreateEvent<T extends object, K = unknown, I extends string = string> {
  templateId: I;
  contractId: ContractId<T>;
  signatories: string[];
  observers: string[];
  payload: T;
  key?: K;
}

/** Partial-match query over a template's fields (OR semantics across the array). */
export type Query<T> = Partial<{ [P in keyof T]: unknown }>;

export interface Stream<T extends object, K, I extends string, State> {
  on(event: "change", cb: (state: State) => void): this;
  on(event: "close", cb: (e: { code: number; reason?: string }) => void): this;
  close(): void;
}

/** `Vindex:Project` from `#pkg:Vindex:Project` or `pkgid:Vindex:Project` — for template matching. */
function moduleEntity(templateId: string): string {
  const parts = templateId.replace(/^#/, "").split(":");
  return parts.slice(-2).join(":");
}

/**
 * The templateId to send in a v2 command. Uses the exact **package-ID** reference
 * `<pkgId>:Module:Entity` (NO `#` prefix — `#` denotes a package-NAME ref, which made the
 * participant read the hash as a package name → `PACKAGE_NAMES_NOT_FOUND`). Codegen emits
 * `templateIdWithPackageId` as `#<pkgId>:…`, so we strip the leading `#`.
 */
function commandTemplateId<T extends object, K, I extends string>(t: Template<T, K, I>): string {
  const withPkg = (t as unknown as { templateIdWithPackageId?: string }).templateIdWithPackageId;
  if (withPkg) return withPkg.replace(/^#/, "");
  return t.templateId.replace(/^#/, "");
}

function decodeCreated<T extends object, K, I extends string>(
  template: Template<T, K, I>,
  raw: RawCreated,
): CreateEvent<T, K, I> {
  const payload = template.decoder.runWithException(raw.createArgument) as T;
  return {
    templateId: template.templateId,
    contractId: raw.contractId as ContractId<T>,
    signatories: raw.signatories ?? [],
    observers: raw.observers ?? [],
    payload,
  };
}

/** A contract matches the query set if it matches ANY query (each query = all listed fields equal). */
function matchesQueries<T extends object>(payload: T, queries: Query<T>[]): boolean {
  if (!queries || queries.length === 0) return true;
  return queries.some((q) =>
    Object.entries(q).every(
      ([k, v]) => JSON.stringify((payload as Record<string, unknown>)[k]) === JSON.stringify(v),
    ),
  );
}

export class VindexLedger {
  private readonly cfg: V2Config;
  private readonly party: string;
  private readonly userId: string;

  constructor(cfg: V2Config, party: string) {
    this.cfg = cfg;
    this.party = party;
    this.userId = userIdFromToken(cfg.token);
  }

  /** Create a contract; returns the decoded created event. */
  async create<T extends object, K, I extends string>(
    template: Template<T, K, I>,
    payload: T,
  ): Promise<CreateEvent<T, K, I>> {
    const events = await submitForTransaction(
      this.cfg,
      { CreateCommand: { templateId: commandTemplateId(template), createArguments: template.encode(payload) } },
      [this.party],
      this.userId,
    );
    const me = moduleEntity(template.templateId);
    const created = events.find((e) => e.created && moduleEntity(e.created.templateId) === me)?.created;
    if (!created) throw new Error(`create ${me}: no created event returned`);
    return decodeCreated(template, created);
  }

  /** Exercise a choice; returns `[decodedResult, events]` like `@daml/ledger`. */
  async exercise<T extends object, C, R, K>(
    choice: Choice<T, C, R, K>,
    contractId: ContractId<T>,
    argument: C,
  ): Promise<[R, { contractId: string }[]]> {
    const template = choice.template() as Template<T, K>;
    const events = await submitForTransaction(
      this.cfg,
      {
        ExerciseCommand: {
          templateId: commandTemplateId(template),
          contractId: contractId as unknown as string,
          choice: choice.choiceName,
          choiceArgument: choice.argumentEncode(argument),
        },
      },
      [this.party],
      this.userId,
    );
    const exResult = events.find((e) => "exerciseResult" in e)?.exerciseResult;
    const result = choice.resultDecoder.runWithException(exResult ?? null) as R;
    const created = events
      .filter((e) => e.created)
      .map((e) => ({ contractId: e.created!.contractId }));
    return [result, created];
  }

  /** Poll the ACS for `template`, filtered by `queries`, emitting `change` with the decoded set. */
  streamQueries<T extends object, K, I extends string>(
    template: Template<T, K, I>,
    queries: Query<T>[],
  ): Stream<T, K, I, readonly CreateEvent<T, K, I>[]> {
    const me = moduleEntity(template.templateId);
    let changeCb: ((s: readonly CreateEvent<T, K, I>[]) => void) | null = null;
    let closeCb: ((e: { code: number; reason?: string }) => void) | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let lastKey = "";
    let stopped = false;

    const poll = async () => {
      try {
        const offset = await ledgerEnd(this.cfg);
        const raws = await activeContracts(this.cfg, this.party, offset);
        const out: CreateEvent<T, K, I>[] = [];
        for (const raw of raws) {
          if (moduleEntity(raw.templateId) !== me) continue;
          let ev: CreateEvent<T, K, I>;
          try {
            ev = decodeCreated(template, raw);
          } catch {
            continue; // a contract of another template that shares module:entity name — skip
          }
          if (matchesQueries(ev.payload, queries)) out.push(ev);
        }
        const key = JSON.stringify(out.map((c) => c.contractId).sort());
        if (!stopped && key !== lastKey) {
          lastKey = key;
          changeCb?.(out);
        }
      } catch (e) {
        if (!stopped) closeCb?.({ code: 1006, reason: e instanceof Error ? e.message : String(e) });
      }
    };

    // Kick off immediately, then on an interval.
    void poll();
    timer = setInterval(poll, POLL_MS);

    const stream: Stream<T, K, I, readonly CreateEvent<T, K, I>[]> = {
      on(event, cb) {
        if (event === "change") changeCb = cb as typeof changeCb;
        else closeCb = cb as typeof closeCb;
        return stream;
      },
      close() {
        stopped = true;
        if (timer) clearInterval(timer);
      },
    };
    return stream;
  }
}
