"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { TxStatusState } from "@/lib/daml/useCommand";

/**
 * Honest transaction UX for a Daml ledger (no EVM block confirmations / explorer links —
 * those don't exist on Canton). We show: submitting → committed (with the real contract/update
 * id returned by the participant) → failed (with the ledger error).
 */
export function TxStatus<R>({ status }: { status: TxStatusState<R> }) {
  if (status.phase === "idle") return null;

  if (status.phase === "submitting") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-[13px] text-accent-soft">
        <Loader2 className="h-4 w-4 animate-spin" />
        Submitting to participant — awaiting ledger commit…
      </div>
    );
  }

  if (status.phase === "success") {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-[13px] text-success">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Committed on-ledger.
          {status.ref && (
            <span className="mt-0.5 block break-all font-mono text-[11px] text-text-secondary">
              {status.ref}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="break-words">{status.error}</span>
    </div>
  );
}
