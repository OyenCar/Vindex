"use client";

import { useState } from "react";
import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { useCommand } from "@/lib/daml/useCommand";
import { TxStatus } from "@/components/daml/TxStatus";
import { FileUpload } from "@/components/daml/FileUpload";
import { StatusBadge } from "@/components/daml/StatusBadge";
import { Button } from "@/components/ui/button";
import { ipfsUrl } from "@/lib/daml/storage";
import { Vindex, num, hours, days } from "@/lib/daml/vindex";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass flex flex-col gap-3 rounded-2xl p-5">
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

const PENALTY = 0.1; // penalty buffer baked into each proposed milestone

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

  const myMandates = mandates.contracts.filter((m) => m.payload.worker === party);
  const myPlans = plans.contracts.filter((p) => p.payload.worker === party);
  const myProjects = projects.contracts.filter((p) => p.payload.worker === party);
  const myApplications = applications.contracts.filter((a) => a.payload.applicant === party);
  const mySettlements = settlements.contracts.filter((s) => s.payload.worker === party);

  // Parse the comma/line-separated payments the worker enters into milestone payments.
  const payments = paymentsText
    .split(/[,\n]/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  const required = payments.reduce((sum, p) => sum + p * (1 + PENALTY), 0);
  const envelopeOf = (cid: string) =>
    vaults.contracts.find((v) => v.contractId === cid)?.payload.amount;

  const apply = (postingCid: (typeof postings.contracts)[number]["contractId"]) =>
    applyCmd
      .run(() =>
        session!.ledger.exercise(Vindex.ProjectPosting.Apply, postingCid, {
          applicant: party,
          presentationHash: presentationCid || "sha256:portfolio",
          presentationUri: presentationCid,
          contactLink: "https://Vindex.app/contact/me",
        }),
      )
      .catch(() => undefined);

  // Worker authors the plan (SOW): one milestone per payment entered, last one final.
  const proposePlan = (mandate: (typeof mandates.contracts)[number]) =>
    planCmd
      .run(() => {
        if (payments.length === 0) throw new Error("Enter at least one milestone payment");
        const maxSubmissions = Math.max(1, Math.floor(Number(maxSubText) || 1));
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
        const maxSubmissions = Math.max(1, Math.floor(Number(maxSubText) || 1));
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

  const submit = (projectCid: (typeof projects.contracts)[number]["contractId"]) =>
    submitCmd
      .run(() =>
        session!.ledger.exercise(Vindex.Project.SubmitMilestone, projectCid, {
          deliverableHash: deliverableCid,
          deliverableUri: deliverableCid,
        }),
      )
      .catch(() => undefined);

  const commitment = vaults.contracts.find((v) => v.payload.vaultType === "CommitmentV");

  // Milestone payments already released to the worker across active (not-yet-settled) projects.
  const releasedSoFar = myProjects.reduce((sum, p) => {
    const idx = Number(p.payload.currentIndex);
    return sum + p.payload.milestones.slice(0, idx).reduce((s, m) => s + Number(m.payment), 0);
  }, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Open Postings">
        {postings.contracts.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No postings visible to you.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {postings.contracts.map((p) => (
              <li key={p.contractId} className="flex flex-col gap-2 rounded-lg border border-white/8 p-3">
                <p className="text-[13px] text-text-primary">{p.payload.requirements}</p>
                {ipfsUrl(p.payload.briefUri) && (
                  <a
                    href={ipfsUrl(p.payload.briefUri)!}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-accent-soft hover:underline"
                  >
                    View project brief ↗
                  </a>
                )}
                {myApplications.some((a) => a.payload.postingCid === p.contractId) ? (
                  <Button size="sm" variant="secondary" className="w-full" disabled>
                    ✓ Applied
                  </Button>
                ) : (
                  <>
                    <FileUpload label="Your portfolio / presentation (→ IPFS, optional)" cid={presentationCid} onUploaded={setPresentationCid} />
                    <Button size="sm" onClick={() => apply(p.contractId)} disabled={applyCmd.phase === "submitting"}>
                      Apply{presentationCid ? " (with portfolio)" : ""}
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <TxStatus status={applyCmd} />
      </Card>

      <Card title="Plan Your Project">
        {myMandates.length === 0 && myPlans.length === 0 ? (
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
                    <p className="text-[12px] text-text-primary font-medium">Plan submitted — awaiting investor approval</p>
                    <p className="text-[11px] text-text-secondary">
                      Current: {pl.payload.milestones.length} milestone(s) · max {pl.payload.maxSubmissions} submissions
                    </p>
                  </div>
                  
                  <div className="border-t border-white/5 pt-2.5 flex flex-col gap-2">
                    <p className="text-[11px] text-text-primary font-medium">Update Plan / Submit New Plan:</p>
                    <Field label="New milestone payments (comma-separated)" value={paymentsText} onChange={setPaymentsText} />
                    <Field label="New max submissions" value={maxSubText} onChange={setMaxSubText} />
                    <p className="text-[11px] text-text-secondary">
                      {payments.length} milestone(s) · needs ≥{" "}
                      <span className="text-text-primary">{required.toFixed(0)}</span> (payments + {Math.round(PENALTY * 100)}% penalty buffer)
                    </p>
                    {!fits && (
                      <p className="text-[11px] text-amber-300">
                        Plan exceeds the budget envelope — lower the payments.
                      </p>
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
                  <p className="text-[12px] text-text-primary">Draft your plan (SOW)</p>
                  <p className="text-[11px] text-text-secondary">
                    {envelope != null && (
                      <>
                        Budget envelope: <span className="font-mono text-text-primary">{envelope}</span> ·{" "}
                      </>
                    )}
                    required stake: <span className="font-mono text-text-primary">{m.payload.commitmentRequired}</span>
                  </p>
                  <Field label="Milestone payments (comma-separated → one milestone each)" value={paymentsText} onChange={setPaymentsText} />
                  <Field label="Max submissions per milestone" value={maxSubText} onChange={setMaxSubText} />
                  <p className="text-[11px] text-text-secondary">
                    {payments.length} milestone(s) · needs ≥{" "}
                    <span className="text-text-primary">{required.toFixed(0)}</span> (payments + {Math.round(PENALTY * 100)}% penalty buffer)
                  </p>
                  {!fits && (
                    <p className="text-[11px] text-amber-300">
                      Plan exceeds the budget envelope — lower the payments.
                    </p>
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

      <Card title="Your Work">
        {myProjects.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No active project.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {myProjects.map((p) => {
              const submittable = p.payload.status === "Active" || p.payload.status === "Revision";
              const idx = Number(p.payload.currentIndex);
              // Milestones already accepted (index < currentIndex) have been paid from escrow.
              const earned = p.payload.milestones
                .slice(0, idx)
                .reduce((s, m) => s + Number(m.payment), 0);
              return (
                <li key={p.contractId} className="rounded-lg border border-white/8 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[12px] text-text-secondary">
                      Milestone {idx + 1}/{p.payload.milestones.length}
                    </span>
                    <StatusBadge status={p.payload.status} />
                  </div>
                  <ul className="mb-2 flex flex-col gap-1">
                    {p.payload.milestones.map((m, i) => {
                      const paid = i < idx;
                      const current = i === idx;
                      return (
                        <li key={i} className="flex items-center justify-between text-[12px]">
                          <span className={paid ? "text-success" : current ? "text-accent-soft" : "text-text-secondary"}>
                            {paid ? "✓ paid" : current ? "▶ current" : "• upcoming"} · Milestone {i + 1}
                            {m.isFinal ? " (final)" : ""}
                          </span>
                          <span className="font-mono text-text-primary">{m.payment}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mb-2 text-[12px] text-text-secondary">
                    Earned so far:{" "}
                    <span className="font-mono text-success">{earned}</span>
                  </p>
                  {submittable ? (
                    <div className="flex flex-col gap-2">
                      <FileUpload label="Deliverable file (→ IPFS)" cid={deliverableCid} onUploaded={setDeliverableCid} />
                      <Button
                        size="sm"
                        onClick={() => submit(p.contractId)}
                        disabled={submitCmd.phase === "submitting" || !deliverableCid}
                      >
                        Submit milestone
                      </Button>
                    </div>
                  ) : p.payload.status === "Submitted" ? (
                    <p className="text-[12px] text-text-secondary">Submitted — awaiting investor review.</p>
                  ) : p.payload.status === "RejPending" ? (
                    <p className="text-[12px] text-text-secondary">Disputed — under AI arbitration.</p>
                  ) : p.payload.status === "Failed" ? (
                    <p className="text-[12px] text-text-secondary">Deadline missed — awaiting the investor's decision.</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <TxStatus status={submitCmd} />
      </Card>

      <Card title="Earnings & Completed">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-text-secondary">Milestone payments released so far</span>
          <span className="font-mono text-success">{releasedSoFar}</span>
        </div>
        <p className="text-[12px] text-text-secondary">
          Commitment locked:{" "}
          <span className="font-mono text-text-primary">{commitment?.payload.amount ?? "—"}</span>
        </p>
        {mySettlements.length === 0 ? (
          <p className="text-[12px] text-text-secondary">
            No fully-settled projects yet — milestone payments above are released as each milestone is
            accepted; the final settlement appears here on completion.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 text-[13px]">
            {mySettlements.map((s) => (
              <li key={s.contractId} className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 px-3 py-2">
                <span className="text-text-secondary">✅ {s.payload.reason}</span>
                <span className="font-mono text-success">paid out {s.payload.totalPaidOut}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
