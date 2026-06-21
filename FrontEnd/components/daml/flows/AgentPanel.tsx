"use client";

import { useState } from "react";
import type { CreateEvent } from "@daml/ledger";
import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { useCommand } from "@/lib/daml/useCommand";
import { TxStatus } from "@/components/daml/TxStatus";
import { Button } from "@/components/ui/button";
import { ipfsUrl } from "@/lib/daml/storage";
import { runAgentVerdict, type AgentVerdictResult } from "@/lib/daml/agent";
import { Vindex, STATUS_LABEL } from "@/lib/daml/vindex";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass flex flex-col gap-3 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}

/** One disputed milestone: AI arbitration (Claude) + the on-ledger verdict. */
function DisputeCard({
  p,
  onVerdict,
  submitting,
}: {
  p: CreateEvent<Vindex.Project>;
  onVerdict: (cid: string, rejectionValid: boolean) => void;
  submitting: boolean;
}) {
  const reasons = p.payload.rejectionReasons ?? [];
  const todoUrl = ipfsUrl(p.payload.briefUri);
  const requirements = p.payload.requirements?.trim() ?? "";
  const submissionUrl = ipfsUrl(p.payload.currentSubmissionUri);

  const [todoPaste, setTodoPaste] = useState("");
  const [submissionPaste, setSubmissionPaste] = useState("");
  const [ai, setAi] = useState<AgentVerdictResult | null>(null);
  const [running, setRunning] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setAiError(null);
    setAi(null);
    try {
      const result = await runAgentVerdict({
        // Brief (IPFS) is preferred by the route; the on-ledger description is the always-present
        // fallback so the agent has a to-do even when the brief failed to pin.
        todoText: todoPaste || requirements || undefined,
        todoUri: p.payload.briefUri,
        submissionText: submissionPaste || undefined,
        submissionUri: p.payload.currentSubmissionUri,
        rejectionReasons: reasons,
      });
      setAi(result);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
      <p className="text-[12px] text-text-secondary">
        Milestone {Number(p.payload.currentIndex) + 1}/{p.payload.milestones.length}
      </p>

      <div className="break-words text-[12px] text-text-secondary">
        Rejection reasons:
        <span className="ml-1 text-text-primary">{reasons.length ? reasons.join("; ") : "—"}</span>
      </div>

      {/* The agent uses the to-do (brief from IPFS, else the on-ledger project description) and the
          deliverable. The paste boxes only appear as a fallback when neither source is available
          (e.g. a file was stored as a non-retrievable local- stand-in). */}
      <div className="flex flex-col gap-1 text-[12px]">
        {todoUrl ? (
          <span className="text-success">
            ✓ Project to-do auto-loaded from IPFS brief ·{" "}
            <a href={todoUrl} target="_blank" rel="noreferrer" className="text-accent-soft hover:underline">
              view ↗
            </a>
          </span>
        ) : requirements ? (
          <span className="text-success">✓ Project to-do from the on-ledger project description</span>
        ) : (
          <span className="text-amber-300">No to-do on ledger — paste it below.</span>
        )}
        {submissionUrl ? (
          <span className="text-success">
            ✓ Deliverable auto-loaded from IPFS ·{" "}
            <a href={submissionUrl} target="_blank" rel="noreferrer" className="text-accent-soft hover:underline">
              view ↗
            </a>
          </span>
        ) : (
          <span className="text-amber-300">Deliverable not on IPFS — paste it below.</span>
        )}
      </div>

      {!todoUrl && !requirements && (
        <textarea
          value={todoPaste}
          onChange={(e) => setTodoPaste(e.target.value)}
          rows={2}
          placeholder="Paste the project to-do list…"
          className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[12px] text-text-primary outline-none focus:border-accent/50"
        />
      )}
      {!submissionUrl && (
        <textarea
          value={submissionPaste}
          onChange={(e) => setSubmissionPaste(e.target.value)}
          rows={2}
          placeholder="Paste the worker's submission…"
          className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[12px] text-text-primary outline-none focus:border-accent/50"
        />
      )}

      <Button size="sm" variant="secondary" onClick={run} disabled={running}>
        {running ? "Claude is reviewing…" : "Run AI arbitration (Claude)"}
      </Button>

      {aiError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-[12px] text-red-300">
          {aiError}
        </p>
      )}

      {ai && (
        <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wide text-text-secondary">
              AI verdict · {ai.model}
            </span>
            <span className="text-[11px] text-text-secondary">
              confidence {Math.round((ai.confidence ?? 0) * 100)}%
            </span>
          </div>
          <p
            className={`text-[12px] font-medium ${
              ai.rejectionValid ? "text-amber-300" : "text-success"
            }`}
          >
            Recommendation:{" "}
            {ai.rejectionValid
              ? "rejection JUSTIFIED → worker revises"
              : "rejection UNJUSTIFIED → pay the worker (investor violation)"}
          </p>
          <p className="text-[12px] text-text-secondary">{ai.summary}</p>

          {ai.checklist?.length > 0 && (
            <ul className="flex flex-col gap-1">
              {ai.checklist.map((c, i) => (
                <li key={i} className="flex gap-2 text-[12px]">
                  <span className={c.met ? "text-success" : "text-red-400"}>{c.met ? "✓" : "✗"}</span>
                  <span className="text-text-secondary">
                    <span className="text-text-primary">{c.item}</span>
                    {c.evidence ? ` — ${c.evidence}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {ai.rejectionAssessment?.length > 0 && (
            <div className="flex flex-col gap-1 border-t border-white/8 pt-2">
              <span className="text-[11px] text-text-secondary">Rejection reasons assessed:</span>
              {ai.rejectionAssessment.map((r, i) => (
                <p key={i} className="text-[12px] text-text-secondary">
                  <span className={r.justified ? "text-amber-300" : "text-success"}>
                    {r.justified ? "justified" : "not justified"}
                  </span>{" "}
                  — <span className="text-text-primary">{r.reason}</span>
                  {r.note ? `: ${r.note}` : ""}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* On-ledger verdict. If the AI has run, the recommended action is highlighted. */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={ai ? (ai.rejectionValid ? "secondary" : "primary") : "outline"}
          onClick={() => onVerdict(p.contractId, false)}
          disabled={submitting}
        >
          Rejection invalid → enforce payout
        </Button>
        <Button
          size="sm"
          variant={ai ? (ai.rejectionValid ? "primary" : "secondary") : "outline"}
          onClick={() => onVerdict(p.contractId, true)}
          disabled={submitting}
        >
          Rejection valid → revision
        </Button>
      </div>
    </li>
  );
}

export function AgentPanel() {
  const { session } = useDaml();
  const party = session!.party;

  const projects = useStreamQueries(Vindex.Project);
  const vaults = useStreamQueries(Vindex.AssetVault);

  const verdictCmd = useCommand<unknown>();
  const enforceCmd = useCommand<unknown>();

  const disputed = projects.contracts.filter((p) => p.payload.status === "RejPending");
  const open = projects.contracts.filter((p) =>
    ["Active", "Submitted", "Revision"].includes(p.payload.status),
  );

  const verdict = (cid: string, rejectionValid: boolean) =>
    verdictCmd
      .run(() => session!.ledger.exercise(Vindex.Project.AgentVerdict, cid as never, { rejectionValid }))
      .catch(() => undefined);

  const enforce = (cid: (typeof projects.contracts)[number]["contractId"]) =>
    enforceCmd
      .run(() => session!.ledger.exercise(Vindex.Project.WorkerViolation, cid, { actor: party }))
      .catch(() => undefined);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Disputes — AI Arbitration">
        {disputed.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No disputes pending your ruling.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {disputed.map((p) => (
              <DisputeCard
                key={p.contractId}
                p={p}
                onVerdict={verdict}
                submitting={verdictCmd.phase === "submitting"}
              />
            ))}
          </ul>
        )}
        <TxStatus status={verdictCmd} />
      </Card>

      <Card title="Enforcement (deadline violations)">
        {open.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No open milestones to enforce.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {open.map((p) => (
              <li key={p.contractId} className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2 text-[13px]">
                <span className="text-text-secondary">
                  M{Number(p.payload.currentIndex) + 1} · {STATUS_LABEL[p.payload.status] ?? p.payload.status}
                </span>
                <Button size="sm" variant="outline" onClick={() => enforce(p.contractId)}>
                  Trigger worker violation
                </Button>
              </li>
            ))}
          </ul>
        )}
        <TxStatus status={enforceCmd} />
      </Card>

      <Card title="Vault State (live)">
        <ul className="flex flex-col gap-2 text-[13px]">
          {vaults.contracts.map((v) => (
            <li key={v.contractId} className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2">
              <span className="text-text-secondary">{v.payload.vaultType}</span>
              <span className="font-mono text-text-primary">{v.payload.amount}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
