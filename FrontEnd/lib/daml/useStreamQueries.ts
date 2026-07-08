"use client";

import { useEffect, useState } from "react";
import type { CreateEvent, Query } from "@/lib/daml/v2ledger";
import type { Template } from "@daml/types";
import { useDaml } from "@/components/daml/DamlProvider";

export interface StreamResult<T extends object, K, I extends string> {
  contracts: readonly CreateEvent<T, K, I>[];
  loading: boolean;
  error: string | null;
  /** True once the live websocket has delivered its first snapshot. */
  live: boolean;
}

/**
 * Real-time subscription to a Daml template via the JSON API websocket.
 * Every active-contract-set change on the participant is pushed here automatically —
 * this is what makes new submissions, votes, escrow releases and vault balance changes
 * appear instantly with no manual refresh.
 */
export function useStreamQueries<T extends object, K, I extends string>(
  template: Template<T, K, I>,
  queries?: Query<T>[],
  deps: ReadonlyArray<unknown> = [],
): StreamResult<T, K, I> {
  const { session } = useDaml();
  const [contracts, setContracts] = useState<readonly CreateEvent<T, K, I>[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setContracts([]);
      setLoading(false);
      setLive(false);
      return;
    }
    setLoading(true);
    setError(null);
    const stream = session.ledger.streamQueries(template, queries ?? []);

    stream.on("change", (state: readonly CreateEvent<T, K, I>[]) => {
      setContracts(state);
      setLoading(false);
      setLive(true);
    });
    stream.on("close", (closeEvent) => {
      setLive(false);
      // `@daml/ledger` auto-reconnects within reconnectThreshold; surface hard closes only.
      if (closeEvent.code !== 1000 && closeEvent.code !== 1001) {
        // Hard close = the participant/ledger went away (e.g. the in-memory sandbox was
        // restarted, resetting the ledger offset). Clear the stale active-contract set so the
        // UI stops showing GHOST contracts from the dead session — otherwise a wiped ledger
        // still renders old projects/vaults/AI verdicts that can no longer be acted on. On a
        // real reconnect a fresh snapshot repopulates via "change".
        setError(`stream closed (${closeEvent.code})`);
        setContracts([]);
        setLoading(true);
      }
    });

    return () => stream.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, ...deps]);

  return { contracts, loading, error, live };
}
