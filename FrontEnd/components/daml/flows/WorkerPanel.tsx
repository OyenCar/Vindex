"use client";

import { useState, useEffect } from "react";
import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { useCommand } from "@/lib/daml/useCommand";
import { TxStatus } from "@/components/daml/TxStatus";
import { FileUpload } from "@/components/daml/FileUpload";
import { StatusBadge } from "@/components/daml/StatusBadge";
import { Button } from "@/components/ui/button";
import { ipfsUrl, openEncrypted } from "@/lib/daml/storage";
import { Vindex, num, hours, days } from "@/lib/daml/vindex";
import type { ContractId } from "@daml/types";
import { cn } from "@/lib/utils";
import { Info, Send, FileText, CheckCircle, ChevronDown, ChevronUp, Cpu, Loader2, Bell } from "lucide-react";

// ─── Shared primitives ───────────────────────────────────────────────────────

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("glass flex flex-col gap-3 rounded-2xl p-5", className)}>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-text-secondary">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[13px] text-text-primary outline-none focus:border-accent/50"
      />
    </label>
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const WORKER_TABS = [
  { id: "browse", label: "Browse Jobs" },
  { id: "plan", label: "Plan" },
  { id: "work", label: "My Work" },
  { id: "history", label: "History" },
] as const;

type WorkerTab = (typeof WORKER_TABS)[number]["id"];

function TabBar({
  active,
  onChange,
  dots,
}: {
  active: WorkerTab;
  onChange: (t: WorkerTab) => void;
  dots?: Partial<Record<WorkerTab, boolean>>;
}) {
  return (
    <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-full border border-[var(--border-light)] max-w-fit">
      {WORKER_TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative flex items-center justify-center gap-1.5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 rounded-full cursor-pointer",
            active === t.id
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5",
          )}
        >
          {t.label}
          {dots?.[t.id] ? (
            <span
              className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.9)]"
              title="Pending activity"
            />
          ) : null}
        </button>
      ))}
    </div>
  );
}

// ─── Tab content components ───────────────────────────────────────────────────

// ─── AI Audit Section ────────────────────────────────────────────────────────

interface AiVerdict {
  rejectionValid: boolean;
  confidence: number;
  summary: string;
  checklist?: { item: string; met: boolean; evidence: string }[];
  rejectionAssessment?: { reason: string; justified: boolean; note: string }[];
}

function AiAuditSection({
  project,
  milestoneIndex,
  milestoneSpec,
}: {
  project: any;
  milestoneIndex: number;
  milestoneSpec: any;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<AiVerdict | null>(null);

  const storageKey = `vindex:verdict:${project.payload.briefUri || project.payload.requirements}-${milestoneIndex}`;

  useEffect(() => {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        setVerdict(JSON.parse(cached));
      } catch (e) {
        // ignore
      }
    }
  }, [storageKey]);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent-verdict", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          todoText: project.payload.requirements,
          todoUri: project.payload.briefUri,
          submissionText: undefined,
          submissionUri: project.payload.currentSubmissionUri || null,
          rejectionReasons: project.payload.rejectionReasons || ["Deliverable needs verification"],
          milestoneIndex,
          totalMilestones: project.payload.milestones.length,
          milestoneSpec,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to run AI audit");
      }
      setVerdict(data);
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 border-t border-white/5 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[11px] text-accent-soft hover:text-white transition-colors cursor-pointer outline-none select-none"
      >
        <Cpu className="h-3.5 w-3.5" />
        <span>AI Arbitration / Audit</span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-2 p-2.5 rounded-lg border border-white/5 bg-black/10 flex flex-col gap-2">
          {verdict ? (
            <div className="flex flex-col gap-2">
              <div className={cn(
                "p-2 rounded border text-[11px]",
                verdict.rejectionValid
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              )}>
                <p className="font-bold uppercase tracking-wider text-[9px] mb-0.5">
                  AI Verdict ({Math.round(verdict.confidence * 100)}% confidence)
                </p>
                <p className="font-semibold mb-1">
                  {verdict.rejectionValid
                    ? "REJECTION JUSTIFIED → Work revision required."
                    : "REJECTION UNJUSTIFIED → Release payout / pass milestone."}
                </p>
                <p className="text-[10px] text-text-secondary leading-relaxed">{verdict.summary}</p>
              </div>

              {verdict.checklist && verdict.checklist.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold">Requirements Checklist:</span>
                  <ul className="flex flex-col gap-1">
                    {verdict.checklist.map((item, idx) => (
                      <li key={idx} className="text-[10px] flex items-start gap-1.5 bg-white/[0.01] p-1.5 rounded">
                        <span className={item.met ? "text-emerald-400 font-bold shrink-0" : "text-amber-400 font-bold shrink-0"}>
                          {item.met ? "✓" : "✗"}
                        </span>
                        <div className="flex-1">
                          <p className="text-text-primary font-medium">{item.item}</p>
                          <p className="text-text-secondary text-[9px] leading-normal">{item.evidence}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-[11px] text-text-secondary mb-2">No AI audit record found for this milestone.</p>
              <Button
                size="sm"
                variant="secondary"
                onClick={runAudit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] h-7"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Running AI Audit...
                  </>
                ) : (
                  "Run AI Audit Analysis"
                )}
              </Button>
            </div>
          )}

          {error && (
            <p className="text-[10px] text-red-400 font-medium">⚠️ Error: {error}</p>
          )}
        </div>
      )}
    </div>
  );
}

const PENALTY = 0.1;

function BrowseTab({
  postings,
  myApplications,
  presentationCid,
  setPresentationCid,
  applyCmd,
  apply,
}: {
  postings: any;
  myApplications: any[];
  presentationCid: string;
  setPresentationCid: (v: string) => void;
  applyCmd: any;
  apply: (cid: string) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      {/* Left Col: Job Postings */}
      <Card title="Open Postings" className="flex-1">
        {postings.contracts.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No postings visible to you.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {postings.contracts.map((p: any) => (
              <li key={p.contractId} className="flex flex-col gap-2 rounded-lg border border-white/8 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] text-text-primary font-medium">{p.payload.requirements}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      p.payload.recruitmentMode === "OPEN_POOL"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-violet-500/15 text-violet-400",
                    )}
                  >
                    {p.payload.recruitmentMode === "OPEN_POOL" ? "Open Pool" : "Invite Only"}
                  </span>
                </div>

                {ipfsUrl(p.payload.briefUri) && (
                  <button
                    type="button"
                    onClick={() => openEncrypted(p.payload.briefUri).catch(() => {})}
                    className="text-[12px] text-accent-soft hover:underline w-fit text-left cursor-pointer"
                  >
                    View project brief ↗
                  </button>
                )}

                <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-1">
                  <span>Required Stake:</span>
                  <span className="font-mono text-text-primary font-semibold">{p.payload.commitmentRequired}</span>
                </div>

                <div className="border-t border-white/5 pt-2.5 mt-1">
                  {myApplications.some((a) => a.payload.postingCid === p.contractId) ? (
                    <Button size="sm" variant="secondary" className="w-full" disabled>
                      ✓ Applied
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <FileUpload
                        label="Your portfolio / presentation (→ IPFS, optional)"
                        cid={presentationCid}
                        onUploaded={setPresentationCid}
                      />
                      <Button
                        size="sm"
                        onClick={() => apply(p.contractId)}
                        disabled={applyCmd.phase === "submitting"}
                      >
                        Apply{presentationCid ? " (with portfolio)" : ""}
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <TxStatus status={applyCmd} />
      </Card>

      {/* Right Col: Your Applications Dashboard */}
      <Card title="Your Applications">
        {myApplications.length === 0 ? (
          <p className="text-[12px] text-text-secondary leading-relaxed">
            You haven't applied to any job postings yet. Select an open job posting on the left to submit your bid.
          </p>
        ) : (
          <ul className="flex flex-col gap-3.5">
            {myApplications.map((app) => (
              <li key={app.contractId} className="flex flex-col gap-1.5 rounded-lg bg-white/[0.02] border border-white/5 p-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Send className="h-3 w-3 text-accent-soft" />
                    Submitted
                  </span>
                </div>
                
                {ipfsUrl(app.payload.presentationUri) ? (
                  <button
                    type="button"
                    onClick={() => openEncrypted(app.payload.presentationUri).catch(() => {})}
                    className="text-[11px] text-accent-soft hover:underline truncate block text-left cursor-pointer"
                  >
                    View Presentation Document ↗
                  </button>
                ) : (
                  <span className="text-[11px] text-text-secondary">No portfolio uploaded</span>
                )}
                
                <span className="text-[10px] font-mono text-text-secondary truncate mt-1 block">
                  ID: {app.contractId.slice(0, 12)}…
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function PlanTab({
  myMandates,
  myPlans,
  paymentsText,
  setPaymentsText,
  maxSubText,
  setMaxSubText,
  payments,
  required,
  envelopeOf,
  planCmd,
  proposePlan,
  proposePlanAgain,
  withdrawPlan,
}: {
  myMandates: any[];
  myPlans: any[];
  paymentsText: string;
  setPaymentsText: (v: string) => void;
  maxSubText: string;
  setMaxSubText: (v: string) => void;
  payments: number[];
  required: number;
  envelopeOf: (cid: string) => string | undefined;
  planCmd: ReturnType<typeof useCommand>;
  proposePlan: (m: any) => void;
  proposePlanAgain: (pl: any) => void;
  withdrawPlan: (pl: any) => void;
}) {
  const hasActiveItem = myMandates.length > 0 || myPlans.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      {/* Left Col: Invitations and active proposals */}
      <div className="flex flex-col gap-4">
        <Card title="Planning Workspace">
          {!hasActiveItem ? (
            <p className="text-[12px] text-text-secondary">
              No planning invitations yet. Apply to a posting and get selected first.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {myPlans.map((pl) => {
                const envelope = envelopeOf(pl.payload.budgetVault);
                const fits = envelope == null || required <= Number(envelope);
                return (
                  <div key={pl.contractId} className="flex flex-col gap-3 rounded-lg border border-success/25 bg-success/5 p-3">
                    <div>
                      <p className="text-[12px] text-text-primary font-semibold">Plan submitted — awaiting investor approval</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Current: {pl.payload.milestones.length} milestone(s) · max {pl.payload.maxSubmissions} submissions
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-2.5 flex flex-col gap-2">
                      <p className="text-[11px] text-text-primary font-semibold">Update Plan / Submit New Plan:</p>
                      <Field label="New milestone payments (comma-separated)" value={paymentsText} onChange={setPaymentsText} />
                      <Field label="New max submissions" value={maxSubText} onChange={setMaxSubText} />
                      <p className="text-[11px] text-text-secondary">
                        {payments.length} milestone(s) · needs ≥{" "}
                        <span className="text-text-primary font-semibold">{required.toFixed(0)}</span>{" "}
                        (payments + {Math.round(PENALTY * 100)}% penalty buffer)
                      </p>
                      {!fits && (
                        <p className="text-[11px] text-amber-300">Plan exceeds the budget envelope — lower the payments.</p>
                      )}
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          onClick={() => proposePlanAgain(pl)}
                          disabled={planCmd.phase === "submitting" || payments.length === 0 || !fits}
                        >
                          Submit New Plan
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => withdrawPlan(pl)}
                          disabled={planCmd.phase === "submitting"}
                        >
                          Withdraw &amp; Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {myMandates.map((m) => {
                const envelope = envelopeOf(m.payload.budgetVault);
                const fits = envelope == null || required <= Number(envelope);
                return (
                  <div key={m.contractId} className="flex flex-col gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3">
                    <p className="text-[12px] text-text-primary font-semibold">Draft your plan (SOW)</p>
                    <p className="text-[11px] text-text-secondary">
                      {envelope != null && (
                        <>Budget envelope: <span className="font-mono text-text-primary font-semibold">{envelope}</span> · </>
                      )}
                      required stake: <span className="font-mono text-text-primary font-semibold">{m.payload.commitmentRequired}</span>
                    </p>
                    <Field label="Milestone payments (comma-separated → one milestone each)" value={paymentsText} onChange={setPaymentsText} />
                    <Field label="Max submissions per milestone" value={maxSubText} onChange={setMaxSubText} />
                    <p className="text-[11px] text-text-secondary">
                      {payments.length} milestone(s) · needs ≥{" "}
                      <span className="text-text-primary font-semibold">{required.toFixed(0)}</span>{" "}
                      (payments + {Math.round(PENALTY * 100)}% penalty buffer)
                    </p>
                    {!fits && (
                      <p className="text-[11px] text-amber-300">Plan exceeds the budget envelope — lower the payments.</p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => proposePlan(m)}
                      disabled={planCmd.phase === "submitting" || payments.length === 0 || !fits}
                    >
                      Submit plan for approval
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          <TxStatus status={planCmd} />
        </Card>
      </div>

      {/* Right Col: SOW Planning Guide */}
      <Card title="SOW Planning Guide">
        <div className="flex flex-col gap-3 text-[12px] text-text-secondary leading-relaxed">
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-accent-soft shrink-0" />
            <p>Drafting a milestone plan details the exact stages and payouts of the project execution.</p>
          </div>
          <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
            <h4 className="font-semibold text-text-primary text-[11px] uppercase tracking-wider">Guidelines:</h4>
            <ul className="flex flex-col gap-2 list-disc pl-4 text-[11px]">
              <li>Enter milestone payments as comma-separated digits (e.g. <code>1000, 2000, 3000</code>).</li>
              <li>A <strong>10% penalty buffer</strong> is dynamically added to each proposed plan to hedge escrow governance.</li>
              <li>Ensure the total requested sum fits the budget envelope.</li>
              <li>Specify a reasonable attempt count for milestone revision cycles.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

function WorkTab({
  myProjects,
  deliverableCid,
  setDeliverableCid,
  submitCmd,
  submit,
}: {
  myProjects: any[];
  deliverableCid: string;
  setDeliverableCid: (v: string) => void;
  submitCmd: ReturnType<typeof useCommand>;
  submit: (cid: ContractId<Vindex.Project>) => void;
}) {
  const hasActiveProject = myProjects.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      {/* Left Col: Projects & Milestones Timeline */}
      <Card title="Active Work & Timeline">
        {!hasActiveProject ? (
          <p className="text-[12px] text-text-secondary">No active project.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {myProjects.map((p) => {
              const idx = Number(p.payload.currentIndex);
              const earned = p.payload.milestones
                .slice(0, idx)
                .reduce((s: number, m: any) => s + Number(m.payment), 0);
              return (
                <div key={p.contractId} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[12px] font-semibold text-text-secondary">
                      Milestone {idx + 1}/{p.payload.milestones.length}
                    </span>
                    <StatusBadge status={p.payload.status} />
                  </div>
                  <ul className="flex flex-col gap-2">
                    {p.payload.milestones.map((m: any, i: number) => {
                      const paid = i < idx;
                      const current = i === idx;
                        <li key={i} className="flex flex-col gap-1 rounded-lg bg-white/[0.01] border border-white/5 p-3 text-[12px]">
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "font-medium",
                                paid ? "text-success" : current ? "text-accent-soft" : "text-text-secondary"
                              )}
                            >
                              {paid ? "✓ paid" : current ? "▶ current" : "• upcoming"} · Milestone {i + 1}
                              {m.isFinal ? " (final)" : ""}
                            </span>
                            <span className="font-mono text-text-primary font-semibold">{m.payment}</span>
                          </div>

                          {(paid || current) && (
                            <AiAuditSection project={p} milestoneIndex={i} milestoneSpec={m} />
                          )}
                        </li>
                    })}
                  </ul>
                  <div className="flex justify-between items-center text-[12px] text-text-secondary mt-1">
                    <span>Earned so far:</span>
                    <span className="font-mono text-success font-semibold">{earned}</span>
                  </div>
                </div>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Right Col: Deliverable submission workspace */}
      <Card title="Submission Workspace">
        {!hasActiveProject ? (
          <p className="text-[12px] text-text-secondary leading-relaxed">
            Active milestone delivery forms will unlock here once your SOW plan is approved and active.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {myProjects.map((p) => {
              const submittable = p.payload.status === "Active" || p.payload.status === "Revision";
              return (
                <div key={p.contractId} className="flex flex-col gap-3">
                  {submittable ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-[12px] text-text-secondary leading-normal">
                        Submit your file deliverable to IPFS and trigger the ledger milestone review request.
                      </p>
                      <FileUpload
                        label="Deliverable file (→ IPFS)"
                        cid={deliverableCid}
                        onUploaded={setDeliverableCid}
                      />
                      <Button
                        size="sm"
                        onClick={() => submit(p.contractId)}
                        disabled={submitCmd.phase === "submitting" || !deliverableCid}
                      >
                        Submit milestone
                      </Button>
                    </div>
                  ) : p.payload.status === "Submitted" ? (
                    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-[12px] text-text-secondary">
                      <CheckCircle className="h-4 w-4 text-accent-soft shrink-0" />
                      <span>Submitted — awaiting investor review.</span>
                    </div>
                  ) : p.payload.status === "RejPending" ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-[12px] text-red-300">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>Disputed — under AI arbitration.</span>
                    </div>
                  ) : p.payload.status === "Failed" ? (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-[12px] text-amber-300">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>Deadline missed — awaiting decision.</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
            <TxStatus status={submitCmd} />
          </div>
        )}
      </Card>
    </div>
  );
}

function HistoryTab({
  mySettlements,
  releasedSoFar,
  commitment,
}: {
  mySettlements: any[];
  releasedSoFar: number;
  commitment: any;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      {/* Left Col: Settlements List */}
      <Card title="Settlement Records">
        {mySettlements.length === 0 ? (
          <p className="text-[12px] text-text-secondary leading-relaxed">
            No fully-settled projects yet. Milestone payouts are released incrementally; on completion, the settlement record is generated.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {mySettlements.map((s) => (
              <li
                key={s.contractId}
                className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 px-3 py-2.5 text-[13px]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-primary font-medium">✅ {s.payload.reason}</span>
                  <span className="text-[11px] text-text-secondary font-mono truncate max-w-[200px]" title={s.contractId}>
                    ID: {s.contractId.slice(0, 16)}…
                  </span>
                </div>
                <span className="font-mono text-success font-bold shrink-0">paid out {s.payload.totalPaidOut}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Right Col: Ledger Stats */}
      <Card title="Audit Summary">
        <div className="flex flex-col gap-3 text-[12px] text-text-secondary">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span>Milestone Released:</span>
            <span className="font-mono text-success font-bold">{releasedSoFar}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span>Commitment Deposit:</span>
            <span className="font-mono text-text-primary font-bold">{commitment?.payload.amount ?? "—"}</span>
          </div>
          
          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 text-[11px] mt-1 leading-relaxed">
            <span className="font-bold text-text-primary block mb-1">Financial Conservation</span>
            Vindex enforces double-entry conservation equations on the Canton Network. Vault balances are programmatically constrained so payouts can never double-spend.
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function WorkerPanel() {
  const { session } = useDaml();
  const party = session!.party;

  const postings = useStreamQueries(Vindex.ProjectPosting);
  const mandates = useStreamQueries(Vindex.PlanningMandate);
  const plans = useStreamQueries(Vindex.WorkPlan);
  const projects = useStreamQueries(Vindex.Project);
  const vaults = useStreamQueries(Vindex.AssetVault);
  const applications = useStreamQueries(Vindex.Application);
  const settlements = useStreamQueries(Vindex.Settlement);

  const applyCmd = useCommand<unknown>();
  const planCmd = useCommand<unknown>();
  const submitCmd = useCommand<unknown>();

  const [presentationCid, setPresentationCid] = useState("");
  const [deliverableCid, setDeliverableCid] = useState("");
  const [paymentsText, setPaymentsText] = useState("1000, 2000");
  const [maxSubText, setMaxSubText] = useState("3");
  const [activeTab, setActiveTab] = useState<WorkerTab>("browse");

  const myMandates = mandates.contracts.filter((m) => m.payload.worker === party);
  const myPlans = plans.contracts.filter((p) => p.payload.worker === party);
  const myProjects = projects.contracts.filter((p) => p.payload.worker === party);
  const myApplications = applications.contracts.filter((a) => a.payload.applicant === party);
  const mySettlements = settlements.contracts.filter((s) => s.payload.worker === party);

  const payments = paymentsText
    .split(/[,\n]/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  const required = payments.reduce((sum, p) => sum + p * (1 + PENALTY), 0);
  const envelopeOf = (cid: string) =>
    vaults.contracts.find((v) => v.contractId === cid)?.payload.amount;
  const commitment = vaults.contracts.find((v) => v.payload.vaultType === "CommitmentV");

  const releasedSoFar = myProjects.reduce((sum, p) => {
    const idx = Number(p.payload.currentIndex);
    return sum + p.payload.milestones.slice(0, idx).reduce((s: number, m: any) => s + Number(m.payment), 0);
  }, 0);

  const apply = (postingCid: string) =>
    applyCmd
      .run(() =>
        session!.ledger.exercise(Vindex.ProjectPosting.Apply, postingCid as any, {
          applicant: party,
          presentationHash: presentationCid || "sha256:portfolio",
          presentationUri: presentationCid,
          contactLink: "https://Vindex.app/contact/me",
        }),
      )
      .catch(() => undefined);

  const proposePlan = (mandate: (typeof mandates.contracts)[number]) =>
    planCmd
      .run(() => {
        if (payments.length === 0) throw new Error("Enter at least one milestone payment");
        // Clamp to the investor's revision ceiling (maxRevisions) — the ledger rejects a higher value.
        const cap = Math.max(1, Math.floor(Number(mandate.payload.maxRevisions) || 3));
        const maxSubmissions = Math.min(cap, Math.max(1, Math.floor(Number(maxSubText) || 1)));
        const milestones = payments.map((pay, i) => ({
          deliverablesHash: `sha256:milestone-${i + 1}`,
          payment: num(pay),
          workerWindow: days(2),
          reviewWindow: hours(24),
          violationPct: num(PENALTY),
          isFinal: i === payments.length - 1,
        }));
        return session!.ledger.exercise(Vindex.PlanningMandate.ProposePlan, mandate.contractId, {
          milestones,
          maxSubmissions: num(maxSubmissions),
        });
      })
      .catch(() => undefined);

  const proposePlanAgain = (plan: (typeof plans.contracts)[number]) =>
    planCmd
      .run(() => {
        if (payments.length === 0) throw new Error("Enter at least one milestone payment");
        // Clamp to the investor's revision ceiling (maxRevisions) — the ledger rejects a higher value.
        const cap = Math.max(1, Math.floor(Number(plan.payload.maxRevisions) || 3));
        const maxSubmissions = Math.min(cap, Math.max(1, Math.floor(Number(maxSubText) || 1)));
        const milestones = payments.map((pay, i) => ({
          deliverablesHash: `sha256:milestone-${i + 1}`,
          payment: num(pay),
          workerWindow: days(2),
          reviewWindow: hours(24),
          violationPct: num(PENALTY),
          isFinal: i === payments.length - 1,
        }));
        return session!.ledger.exercise(Vindex.WorkPlan.ProposePlanAgain, plan.contractId, {
          newMilestones: milestones,
          newMaxSubmissions: num(maxSubmissions),
        });
      })
      .catch(() => undefined);

  const withdrawPlan = (plan: (typeof plans.contracts)[number]) =>
    planCmd
      .run(() => session!.ledger.exercise(Vindex.WorkPlan.WithdrawPlan, plan.contractId, {}))
      .catch(() => undefined);

  const submit = (projectCid: ContractId<Vindex.Project>) =>
    submitCmd
      .run(() =>
        session!.ledger.exercise(Vindex.Project.SubmitMilestone, projectCid, {
          deliverableHash: deliverableCid,
          deliverableUri: deliverableCid,
        }),
      )
      .catch(() => undefined);

  // Auto-redirect to relevant tab based on active data
  const hasPendingPlanning = myMandates.length > 0 || myPlans.length > 0;
  const hasActiveWork = myProjects.length > 0;

  const workerDots: Partial<Record<WorkerTab, boolean>> = { plan: hasPendingPlanning, work: hasActiveWork };
  const workerPending = myMandates.length + myPlans.length + myProjects.length;

  return (
    <div className="flex flex-col gap-0">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <TabBar active={activeTab} onChange={setActiveTab} dots={workerDots} />
        <button
          type="button"
          onClick={() => setActiveTab(hasPendingPlanning ? "plan" : "work")}
          title={workerPending > 0 ? `${workerPending} item(s) need your attention` : "No notifications"}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {workerPending > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-[var(--bg)]" />
          )}
        </button>
      </div>

      {activeTab === "browse" && (
        <BrowseTab
          postings={postings}
          myApplications={myApplications}
          presentationCid={presentationCid}
          setPresentationCid={setPresentationCid}
          applyCmd={applyCmd}
          apply={apply}
        />
      )}

      {activeTab === "plan" && (
        <PlanTab
          myMandates={myMandates}
          myPlans={myPlans}
          paymentsText={paymentsText}
          setPaymentsText={setPaymentsText}
          maxSubText={maxSubText}
          setMaxSubText={setMaxSubText}
          payments={payments}
          required={required}
          envelopeOf={envelopeOf}
          planCmd={planCmd}
          proposePlan={proposePlan}
          proposePlanAgain={proposePlanAgain}
          withdrawPlan={withdrawPlan}
        />
      )}

      {activeTab === "work" && (
        <WorkTab
          myProjects={myProjects}
          deliverableCid={deliverableCid}
          setDeliverableCid={setDeliverableCid}
          submitCmd={submitCmd}
          submit={submit}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab
          mySettlements={mySettlements}
          releasedSoFar={releasedSoFar}
          commitment={commitment}
        />
      )}

      {/* Subtle hint badges in the tab bar when there's pending activity */}
      {hasPendingPlanning && activeTab !== "plan" && (
        <p className="mt-3 text-[11px] text-amber-400">
          💡 You have pending planning tasks — check the <button className="underline font-bold" onClick={() => setActiveTab("plan")}>Plan</button> tab.
        </p>
      )}
      {hasActiveWork && activeTab !== "work" && (
        <p className="mt-1 text-[11px] text-accent-soft">
          ▶ Active project in progress — check the <button className="underline font-bold" onClick={() => setActiveTab("work")}>My Work</button> tab.
        </p>
      )}
    </div>
  );
}
