"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { TxStatusState } from "@/lib/daml/useCommand";

/**
 * Translate raw Daml/ledger errors into a sentence a non-engineer can act on. The contract's
 * `assertMsg` text is echoed inside a noisy interpretation-error blob; we match on it and surface
 * the cause. The original message is kept on hover (`title`) for debugging.
 */
function humanize(raw: string | null): string {
  if (!raw) return "The action failed.";
  const m = raw.toLowerCase();
  if (m.includes("budget vault underfunded"))
    return "Budget is too low: it must cover every milestone payment plus its penalty buffer. Raise the budget or lower the payment.";
  if (m.includes("worker deadline not passed"))
    return "The worker's deadline hasn't passed yet, so a violation can't be triggered. (A static-time sandbox clock doesn't advance on its own.)";
  if (m.includes("worker deadline passed"))
    return "The worker's submission deadline has already passed for this milestone.";
  if (m.includes("rejection reasons required") || m.includes("reasons required"))
    return "Record structured rejection reasons before finalizing a rejected milestone.";
  if (m.includes("insufficient funds") || m.includes("spend: insufficient"))
    return "The vault doesn't hold enough funds for this action (it may be frozen — try a governance top-up).";
  if (m.includes("not in the worker pool") || m.includes("not an invited candidate"))
    return "This party isn't in the posting's worker pool, so it can't apply. Add it to NEXT_PUBLIC_WORKER_POOL.";
  if (m.includes("already voted"))
    return "This party has already voted in the current cycle.";
  if (m.includes("max submissions"))
    return "The worker has used all allowed submissions for this milestone.";
  if (m.includes("proposal not passed") || m.includes("not passed"))
    return "The governance proposal hasn't reached the required threshold/quorum yet.";
  if (m.includes("cannot resolve template"))
    return "The ledger doesn't have the Vindex package — upload the DAR to the sandbox.";
  if (m.includes("failed to fetch"))
    return "Can't reach the ledger. Check that the sandbox + JSON API are running.";
  if (m.includes("unhandled daml exception") || m.includes("interpretation error"))
    return "The contract rejected this action — a precondition wasn't met. Hover for details.";
  // Fall back to the raw text but trim the giant interpretation blob.
  return raw.length > 200 ? `${raw.slice(0, 200)}…` : raw;
}

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
    <div
      className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-300"
      title={status.error ?? undefined}
    >
      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="break-words">{humanize(status.error)}</span>
    </div>
  );
}
