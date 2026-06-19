"use client";

import { useCallback, useRef, useState } from "react";

export type TxPhase = "idle" | "submitting" | "success" | "error";

export interface TxStatusState<R> {
  phase: TxPhase;
  result: R | null;
  error: string | null;
  /** Real on-ledger identifier of the resulting contract/exercise (Canton has no block explorer). */
  ref: string | null;
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

/** Network/participant hiccups are retryable; Daml interpretation errors (assertions) are not. */
function isRetryable(e: unknown): boolean {
  const m = errorMessage(e).toLowerCase();
  if (/(assert|abort|requires author|not visible|already|insufficient|underfunded)/.test(m)) {
    return false;
  }
  return /(fetch|network|timeout|econn|503|502|504|socket|failed to fetch)/.test(m);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Drives a single ledger command (create / exercise) with real transaction state:
 * idle → submitting → success | error, plus bounded retry on transient failures.
 */
export function useCommand<R>() {
  const [state, setState] = useState<TxStatusState<R>>({
    phase: "idle",
    result: null,
    error: null,
    ref: null,
  });
  const inFlight = useRef(false);

  const run = useCallback(
    async (
      fn: () => Promise<R>,
      opts?: { retries?: number; refOf?: (r: R) => string | null },
    ): Promise<R> => {
      if (inFlight.current) throw new Error("A transaction is already in flight");
      inFlight.current = true;
      const retries = opts?.retries ?? 2;
      setState({ phase: "submitting", result: null, error: null, ref: null });
      let lastErr: unknown;
      try {
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const result = await fn();
            setState({
              phase: "success",
              result,
              error: null,
              ref: opts?.refOf ? opts.refOf(result) : null,
            });
            return result;
          } catch (e) {
            lastErr = e;
            if (attempt < retries && isRetryable(e)) {
              await delay(400 * (attempt + 1));
              continue;
            }
            break;
          }
        }
        setState({ phase: "error", result: null, error: errorMessage(lastErr), ref: null });
        throw lastErr;
      } finally {
        inFlight.current = false;
      }
    },
    [],
  );

  const reset = useCallback(
    () => setState({ phase: "idle", result: null, error: null, ref: null }),
    [],
  );

  return { ...state, run, reset };
}
