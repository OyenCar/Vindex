import type { Template, Choice, ContractId } from "@daml/types";
import type { loop } from "@fivenorth/loop-sdk";

/** Provider is not exported from @fivenorth/loop-sdk, so we extract it from the onAccept callback. */
type LoopInitOpts = NonNullable<Parameters<typeof loop.init>[0]>;
type OnAcceptFn = NonNullable<LoopInitOpts["onAccept"]>;
type Provider = Parameters<OnAcceptFn>[0];
import {
  type CreateEvent,
  type Query,
  type Stream,
  commandTemplateId,
  decodeCreated,
  matchesQueries,
  moduleEntity,
} from "./v2ledger";
import { type RawCreated, type RawEvent, normalizeCreated } from "./v2client";

const POLL_MS = 2500;

function extractLoopEvents(resp: any): RawEvent[] {
  if (resp.status === "failed") {
    throw new Error(`Transaction failed: ${resp.error?.error_message || "Unknown error"}`);
  }
  const events: RawEvent[] = [];
  const updateData = resp.update_data;
  let rawEvents: any[] = [];
  if (Array.isArray(updateData)) {
    rawEvents = updateData;
  } else if (updateData && typeof updateData === "object") {
    const tx = updateData.transaction || updateData;
    rawEvents = tx.events || tx.Events || [];
  }
  
  for (const ev of rawEvents) {
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
    if (arWrap) {
      events.push({ archivedContractId: String(arWrap.contractId ?? arWrap.contract_id ?? "") });
    }
  }
  return events;
}

export class LoopLedger {
  private readonly provider: Provider;
  private readonly party: string;

  constructor(provider: Provider, party: string) {
    this.provider = provider;
    this.party = party;
  }

  /** Create a contract via the Loop Wallet connect provider. */
  async create<T extends object, K, I extends string>(
    template: Template<T, K, I>,
    payload: T,
  ): Promise<CreateEvent<T, K, I>> {
    const templateIdStr = commandTemplateId(template);
    const damlCommand = {
      commands: [{
        CreateCommand: {
          templateId: templateIdStr,
          createArguments: template.encode(payload),
        },
      }],
      actAs: [this.party],
      readAs: [this.party],
      disclosedContracts: [],
    };

    const resp = await this.provider.submitAndWaitForTransaction(damlCommand, {
      message: `Create ${moduleEntity(template.templateId)}`,
    });

    const events = extractLoopEvents(resp);
    const me = moduleEntity(template.templateId);
    const created = events.find((e) => e.created && moduleEntity(e.created.templateId) === me)?.created;
    if (!created) throw new Error(`create ${me} via Loop: no created event returned`);
    return decodeCreated(template, created);
  }

  /** Exercise a choice via the Loop Wallet connect provider. */
  async exercise<T extends object, C, R, K>(
    choice: Choice<T, C, R, K>,
    contractId: ContractId<T>,
    argument: C,
  ): Promise<[R, { contractId: string }[]]> {
    const template = choice.template() as Template<T, K>;
    const templateIdStr = commandTemplateId(template);
    const damlCommand = {
      commands: [{
        ExerciseCommand: {
          templateId: templateIdStr,
          contractId: contractId as unknown as string,
          choice: choice.choiceName,
          choiceArgument: choice.argumentEncode(argument),
        },
      }],
      actAs: [this.party],
      readAs: [this.party],
      disclosedContracts: [],
    };

    const resp = await this.provider.submitAndWaitForTransaction(damlCommand, {
      message: `Exercise ${choice.choiceName} choice`,
    });

    const events = extractLoopEvents(resp);
    const exResult = events.find((e) => "exerciseResult" in e)?.exerciseResult;
    const result = choice.resultDecoder.runWithException(exResult ?? null) as R;
    const created = events
      .filter((e) => e.created)
      .map((e) => ({ contractId: e.created!.contractId }));
    return [result, created];
  }

  /** Poll the active contracts from the Loop Wallet connect provider. */
  streamQueries<T extends object, K, I extends string>(
    template: Template<T, K, I>,
    queries: Query<T>[],
  ): Stream<T, K, I, readonly CreateEvent<T, K, I>[]> {
    const me = moduleEntity(template.templateId);
    const templateIdStr = commandTemplateId(template);
    let changeCb: ((s: readonly CreateEvent<T, K, I>[]) => void) | null = null;
    let closeCb: ((e: { code: number; reason?: string }) => void) | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let lastKey = "";
    let stopped = false;

    const poll = async () => {
      try {
        // Query the provider for active contracts of this template:
        const rawContracts = await this.provider.getActiveContracts({
          templateId: templateIdStr,
        });

        const out: CreateEvent<T, K, I>[] = [];
        for (const raw of rawContracts) {
          // Map Loop SDK ActiveContract properties to RawCreated properties:
          const normalized: RawCreated | null = normalizeCreated({
            contractId: raw.contract_id || raw.contractId,
            templateId: raw.template_id || raw.templateId,
            createArgument: raw.create_argument || raw.createArgument || raw.arguments || raw.payload || raw,
            signatories: raw.signatories || [],
            observers: raw.observers || [],
          });

          if (!normalized || moduleEntity(normalized.templateId) !== me) continue;

          let ev: CreateEvent<T, K, I>;
          try {
            ev = decodeCreated(template, normalized);
          } catch {
            continue;
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
