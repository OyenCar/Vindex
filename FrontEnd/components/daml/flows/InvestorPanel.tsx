"use client";

import { useState } from "react";
import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { useCommand } from "@/lib/daml/useCommand";
import { TxStatus } from "@/components/daml/TxStatus";
import { FileUpload } from "@/components/daml/FileUpload";
import { Button } from "@/components/ui/button";
import { damlConfig } from "@/lib/daml/config";
import { ipfsUrl } from "@/lib/daml/storage";
import { Vindex, num, hours, STATUS_LABEL } from "@/lib/daml/vindex";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-text-secondary">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[13px] text-text-primary outline-none focus:border-accent/50"
      />
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass flex flex-col gap-3 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}

export function InvestorPanel() {
  const { session } = useDaml();
  const party = session!.party;

  // Live ledger state (auto-updates on every change).
  const parties = useStreamQueries(Vindex.InvestorParty);
  const postings = useStreamQueries(Vindex.ProjectPosting);
  const mandates = useStreamQueries(Vindex.PlanningMandate);
  const plans = useStreamQueries(Vindex.WorkPlan);
  const projects = useStreamQueries(Vindex.Project);
  const reviews = useStreamQueries(Vindex.MilestoneReview);
  const vaults = useStreamQueries(Vindex.AssetVault);
  const settlements = useStreamQueries(Vindex.Settlement);
  const applications = useStreamQueries(Vindex.Application);

  const createCmd = useCommand<unknown>();
  const postCmd = useCommand<unknown>();
  const voteCmd = useCommand<unknown>();
  const selectCmd = useCommand<unknown>();
  const planCmd = useCommand<unknown>();

  const [agent, setAgent] = useState("");
  const [budget, setBudget] = useState("4000");
  const [agentFee, setAgentFee] = useState("300");
  const [commitment, setCommitment] = useState("500");
  const [reasonsText, setReasonsText] = useState("Deliverable does not meet the milestone spec");
  const [requirements, setRequirements] = useState("Build the Vindex milestone deliverables");
  const [briefCid, setBriefCid] = useState("");
  const [workers, setWorkers] = useState<string[]>(damlConfig.workerPool);
  const [newWorkerInput, setNewWorkerInput] = useState("");
  const [isOpenPool, setIsOpenPool] = useState(true);

  const [editingPostingCid, setEditingPostingCid] = useState<string | null>(null);
  const [editingRequirements, setEditingRequirements] = useState("");

  const addWorker = () => {
    const w = newWorkerInput.trim();
    if (w && !workers.includes(w)) {
      setWorkers([...workers, w]);
      setNewWorkerInput("");
    }
  };

  const removeWorker = (w: string) => {
    setWorkers(workers.filter((item) => item !== w));
  };

  // New-project flow: each project is its own InvestorParty. `newPartyMode` forces the create form
  // even when an old (settled) party exists; `preferredPartyCid` keeps the UI on the party just made.
  const [newPartyMode, setNewPartyMode] = useState(false);
  const [preferredPartyCid, setPreferredPartyCid] = useState<string | null>(null);

  // Find all stages of jobs for this party
  const myPostings = postings.contracts.filter((p) => p.payload.members.includes(party));
  const myMandates = mandates.contracts.filter((m) => m.payload.members.includes(party));
  const myPlans = plans.contracts.filter((p) => p.payload.members.includes(party));
  const myProjects = projects.contracts.filter((p) => p.payload.members.includes(party));
  const myReviews = reviews.contracts.filter((r) => r.payload.members.includes(party));
  const myVaults = vaults.contracts.filter((v) => v.payload.funders.includes(party) || v.payload.stakeholders.includes(party));
  const mySettlements = settlements.contracts.filter((s) => s.payload.members.includes(party));

  // An investor can run many projects, each a separate InvestorParty.
  const myParties = parties.contracts.filter((c) => c.payload.members.includes(party));
  const myParty =
    (preferredPartyCid ? myParties.find((c) => c.contractId === preferredPartyCid) : undefined) ||
    myParties[0];

  const budgetNum = Number(budget);
  const budgetValid = Number.isFinite(budgetNum) && budgetNum > 0;

  const createParty = () =>
    createCmd
      .run(
        async () => {
          const created = await session!.ledger.create(Vindex.InvestorParty, {
            admin: party,
            members: [party],
            pending: [],
            contributions: [
              {
                investor: party,
                projectFunding: num(budget),
                agentFeeFunding: num(agentFee),
                weight: num(1),
              },
            ],
            config: {
              maxInvestors: num(5),
              votingModel: "SimpleMajority",
              thresholdFraction: num(0.5),
              weighted: false,
              quorumFraction: num(0.5),
              defaultReviewWindow: hours(24),
            },
            agent,
          });
          // Follow the party we just created (so a fresh project uses it, not an old one).
          setPreferredPartyCid(created.contractId);
          setNewPartyMode(false);
          return created;
        },
        { refOf: (r) => (r as { contractId: string }).contractId },
      )
      .catch(() => undefined);

  const fundAndPost = () => {
    if (!myParty) return;
    const postingId = Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9);
    postCmd
      .run(
        () =>
          session!.ledger.exercise(Vindex.InvestorParty.SetupAndPost, myParty.contractId, {
            postingId,
            requirements,
            briefUri: briefCid,
            budgetAmount: num(budget),
            agentFeeAmount: num(agentFee),
            agentOpCost: num(50),
            commitmentRequired: num(commitment),
            recruitmentMode: isOpenPool ? "OPEN_POOL" : "INVITE_ONLY",
            eligibleWorkers: isOpenPool ? ["Worker::*"] : workers,
            publicParty: damlConfig.parties.public,
          }),
        { refOf: (r) => JSON.stringify((r as unknown[])[0]) },
      )
      .catch(() => undefined);
  };

  // Approve / reject the worker's authored plan (the SOW). ApprovePlan mints the Project; RejectPlan
  // sends the worker back to re-author. Both are single member actions (single-investor demo).
  const approvePlan = (plan: (typeof plans.contracts)[number]) =>
    planCmd
      .run(() => session!.ledger.exercise(Vindex.WorkPlan.ApprovePlan, plan.contractId, { actor: party }))
      .catch(() => undefined);

  const rejectPlan = (plan: (typeof plans.contracts)[number]) =>
    planCmd
      .run(() => session!.ledger.exercise(Vindex.WorkPlan.RejectPlan, plan.contractId, { actor: party }))
      .catch(() => undefined);

  const handleEditDescription = (postingCid: any, newRequirements: string) => {
    postCmd
      .run(() =>
        session!.ledger.exercise(Vindex.ProjectPosting.EditPostingDescription, postingCid, {
          actor: party,
          newRequirements,
        })
      )
      .then(() => {
        setEditingPostingCid(null);
      })
      .catch(() => undefined);
  };

  const handleTakeDown = (postingCid: any) => {
    if (confirm("Are you sure you want to take down this job? This will archive the posting and refund your vaults.")) {
      postCmd
        .run(() =>
          session!.ledger.exercise(Vindex.ProjectPosting.TakeDownPosting, postingCid, {
            actor: party,
          })
        )
        .catch(() => undefined);
    }
  };

  // Total a plan needs from the budget envelope: Σ payment·(1 + penalty%).
  const planRequired = (p: (typeof plans.contracts)[number]) =>
    p.payload.milestones.reduce(
      (sum, m) => sum + Number(m.payment) * (1 + Number(m.violationPct)),
      0,
    );

  // Accept a submission in ONE atomic step: cast the ACCEPT ballot, then finalize using the
  // freshly-returned review cid. CastVote is CONSUMING — it archives & recreates the review — so
  // finalizing with the pre-vote cid would hit an archived contract (the two-button flow silently
  // failed, leaving the milestone stuck in "Awaiting review"). Chaining avoids that race.
  const acceptSubmission = (
    review: (typeof reviews.contracts)[number],
    proj: (typeof projects.contracts)[number],
  ) =>
    voteCmd
      .run(async () => {
        // Skip the ballot if this party already voted this cycle (e.g. a prior attempt where the
        // vote landed but the finalize didn't) — re-voting would abort "already voted this cycle".
        let reviewCid = review.contractId;
        if (!review.payload.votes.some((v) => v._1 === party)) {
          const [voted] = await session!.ledger.exercise(
            Vindex.MilestoneReview.CastVote,
            review.contractId,
            { voter: party, vote: "ACCEPT" },
          );
          reviewCid = voted;
        }
        return session!.ledger.exercise(Vindex.Project.FinalizeReview, proj.contractId, {
          actor: party,
          reviewCid,
        });
      })
      .catch(() => undefined);

  // P0-1: hire a worker. Worker selection is governance-gated (locked decision 2/4), so this
  // bundles the three on-ledger steps the protocol requires into one click:
  //   1. open a `SelectWinner` governance proposal,
  //   2. cast a passing ACCEPT vote (a single-investor party clears the 0.5 threshold at once),
  //   3. exercise `SelectWorker` -> creates the `ProjectProposal` offer the worker can accept.
  // Without this, the posting never becomes a project and the whole worker/agent flow is unreachable.
  const selectApplicant = (app: (typeof applications.contracts)[number]) =>
    selectCmd
      .run(async () => {
        if (!myParty) throw new Error("Create an Investor Party first");
        const deadline = new Date(Date.now() + 7 * 86_400_000).toISOString();
        const [proposalCid] = await session!.ledger.exercise(
          Vindex.InvestorParty.OpenProposal,
          myParty.contractId,
          {
            purpose: "Select project worker",
            action: { tag: "SelectWinner", value: app.payload.applicant },
            deadline,
          },
        );
        const [votedCid] = await session!.ledger.exercise(
          Vindex.GovernanceProposal.CastProposalVote,
          proposalCid,
          { voter: party, vote: "ACCEPT" },
        );
        return session!.ledger.exercise(Vindex.ProjectPosting.SelectWorker, app.payload.postingCid, {
          actor: party,
          proposalCid: votedCid,
          applicationCid: app.contractId,
        });
      })
      .catch(() => undefined);

  // Reject a submission in ONE atomic step: REJECT ballot -> record reasons -> finalize, which
  // escalates to the AI agent (project -> RejPending so the Agent panel shows the dispute). Each
  // step uses the cid returned by the previous one, so nothing references an archived contract.
  const rejectSubmission = (
    review: (typeof reviews.contracts)[number],
    proj: (typeof projects.contracts)[number],
  ) =>
    voteCmd
      .run(async () => {
        const reasons = reasonsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        if (reasons.length === 0) throw new Error("At least one rejection reason is required");
        // Skip the ballot if this party already voted this cycle (recovers a half-finished attempt).
        let reviewCid = review.contractId;
        if (!review.payload.votes.some((v) => v._1 === party)) {
          const [voted] = await session!.ledger.exercise(
            Vindex.MilestoneReview.CastVote,
            review.contractId,
            { voter: party, vote: "REJECT" },
          );
          reviewCid = voted;
        }
        const [withReasons] = await session!.ledger.exercise(
          Vindex.MilestoneReview.SetRejectionReasons,
          reviewCid,
          { actor: party, reasons },
        );
        return session!.ledger.exercise(Vindex.Project.FinalizeReview, proj.contractId, {
          actor: party,
          reviewCid: withReasons,
        });
      })
      .catch(() => undefined);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {!myParty || newPartyMode ? (
        <Card title="Create Investor Party">
          <p className="text-[12px] text-text-secondary">
            Each project is its own Investor Party (a fresh funding pool + governance group).
          </p>
          <Field label="AI Agent party id" value={agent} onChange={setAgent} placeholder="Agent::1220…" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Budget funding" value={budget} onChange={setBudget} />
            <Field label="Agent-fee funding" value={agentFee} onChange={setAgentFee} />
          </div>
          <Button onClick={createParty} disabled={!agent || createCmd.phase === "submitting"}>
            Create Investor Party
          </Button>
          {myParty && (
            <Button variant="ghost" size="sm" onClick={() => setNewPartyMode(false)}>
              Cancel
            </Button>
          )}
          <TxStatus status={createCmd} />
        </Card>
      ) : (
        <>
          <Card title="Fund Vaults &amp; Publish Job">
            <p className="text-[12px] text-text-secondary">
              Investor Party: <span className="font-mono">{myParty.payload.members.length}</span> member(s)
            </p>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-text-secondary">Project description</span>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={2}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[13px] text-text-primary outline-none focus:border-accent/50"
              />
            </label>
            <FileUpload label="Project brief / reference files (→ IPFS)" cid={briefCid} onUploaded={setBriefCid} />
            <div className="flex justify-between items-center bg-white/[0.02] border border-white/8 rounded-xl p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-semibold text-text-primary">Posting Mode</span>
                <span className="text-[11px] text-text-secondary">
                  {isOpenPool ? "Open Pool (any Worker can apply)" : "Invite Only (only pool members can apply)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenPool(!isOpenPool)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  isOpenPool ? "bg-emerald-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isOpenPool ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-text-primary font-medium">Worker Audience (Open Pool)</span>
                <span className="text-[11px] text-text-secondary">{workers.length} worker(s)</span>
              </div>
              
              {workers.length > 0 ? (
                <ul className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {workers.map((w) => (
                    <li key={w} className="flex justify-between items-center gap-2 rounded bg-white/[0.03] border border-white/5 px-2 py-1 text-[11px] font-mono">
                      <span className="truncate text-text-secondary" title={w}>{w}</span>
                      <button
                        type="button"
                        onClick={() => removeWorker(w)}
                        className="text-text-secondary hover:text-red-400 transition-colors px-1"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-amber-300">
                  No workers added. Add at least one worker party below so they can see and apply to this job.
                </p>
              )}

              <div className="flex gap-2 mt-1">
                <input
                  value={newWorkerInput}
                  onChange={(e) => setNewWorkerInput(e.target.value)}
                  placeholder="Worker::1220..."
                  className="flex-1 rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[12px] text-text-primary outline-none focus:border-accent/50 font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addWorker();
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={addWorker}>
                  Add
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Budget envelope (cap)" value={budget} onChange={setBudget} />
              <Field label="Required worker stake" value={commitment} onChange={setCommitment} />
            </div>
            <p className="text-[11px] text-text-secondary">
              You fund the budget <span className="text-text-primary">envelope</span> and set the worker
              stake. After you select a worker, they draft the milestone plan (count, payment split, max
              submissions) for you to approve — it must fit within this envelope.
            </p>
            {!budgetValid && (
              <p className="text-[11px] text-amber-300">Enter a budget envelope greater than 0.</p>
            )}
            <Button
              onClick={fundAndPost}
              disabled={postCmd.phase === "submitting" || !budgetValid || (!isOpenPool && workers.length === 0)}
            >
              Fund Vaults &amp; Post Open Job
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setNewPartyMode(true)}>
              + Start a separate project (new Investor Party)
            </Button>
            <TxStatus status={postCmd} />
          </Card>

          <Card title="Active Job Postings &amp; Applicants">
            {myPostings.length === 0 ? (
              <p className="text-[12px] text-text-secondary">No active job postings. Publish a job first.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {myPostings.map((post) => {
                  const isEditing = editingPostingCid === post.contractId;
                  const openApplications = applications.contracts.filter((a) => a.payload.postingCid === post.contractId);
                  return (
                    <div key={post.contractId} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.01] p-4">
                      <div>
                        <span className="text-[11px] text-text-secondary block mb-1">Job Description:</span>
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={editingRequirements}
                              onChange={(e) => setEditingRequirements(e.target.value)}
                              rows={3}
                              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[13px] text-text-primary outline-none focus:border-accent/50"
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleEditDescription(post.contractId, editingRequirements)}
                                disabled={postCmd.phase === "submitting"}
                              >
                                Save Changes
                              </Button>
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => setEditingPostingCid(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-[13px] text-text-primary bg-white/[0.02] border border-white/5 rounded-lg p-2.5 whitespace-pre-wrap">
                              {post.payload.requirements}
                            </p>
                            <div>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setEditingRequirements(post.payload.requirements);
                                  setEditingPostingCid(post.contractId);
                                }}
                              >
                                Edit Description
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[12px] border-t border-white/5 pt-3">
                        <div>
                          <span className="text-[11px] text-text-secondary block">Required Worker Stake:</span>
                          <span className="font-mono text-text-primary">{post.payload.commitmentRequired}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-text-secondary block">Recruitment Pool:</span>
                          <span className="text-text-primary">
                            {post.payload.recruitmentMode === "OPEN_POOL"
                              ? "Open Pool (Worker::*)"
                              : `${post.payload.eligibleWorkers.length} workers`}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-3">
                        <span className="text-[11px] text-text-secondary block mb-1.5 font-medium">Applicants:</span>
                        {openApplications.length === 0 ? (
                          <p className="text-[11px] text-text-secondary italic">No applicants yet.</p>
                        ) : (
                          <ul className="flex flex-col gap-2">
                            {openApplications.map((a) => (
                              <li
                                key={a.contractId}
                                className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-[12px]"
                              >
                                <div className="flex min-w-0 flex-col">
                                  <span className="min-w-0 truncate font-mono text-text-secondary" title={a.payload.applicant}>
                                    {a.payload.applicant}
                                  </span>
                                  {ipfsUrl(a.payload.presentationUri) ? (
                                    <a
                                      href={ipfsUrl(a.payload.presentationUri)!}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] text-accent-soft hover:underline"
                                    >
                                      View portfolio ↗
                                    </a>
                                  ) : (
                                    a.payload.contactLink && (
                                      <span className="truncate text-[10px] text-text-secondary">{a.payload.contactLink}</span>
                                    )
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => selectApplicant(a)}
                                  disabled={!myParty || selectCmd.phase === "submitting"}
                                >
                                  Select &amp; Offer
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="border-t border-white/5 pt-3 mt-1">
                        <Button
                          variant="secondary"
                          className="w-full border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                          onClick={() => handleTakeDown(post.contractId)}
                          disabled={postCmd.phase === "submitting"}
                        >
                          Take Down &amp; Refund Vaults
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <TxStatus status={selectCmd} />
          </Card>
        </>
      )}

      <Card title="Worker Plans — Approve">
        {myMandates.length === 0 && myPlans.length === 0 ? (
          <p className="text-[12px] text-text-secondary">
            No plans yet. After you select a worker, they draft a plan here for your approval.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {myMandates.map((m) => (
              <li key={m.contractId} className="rounded-lg border border-white/8 px-3 py-2 text-[12px] text-text-secondary">
                Worker selected — waiting for{" "}
                <span className="font-mono text-text-primary">{m.payload.worker}</span> to submit a plan…
              </li>
            ))}
            {myPlans.map((pl) => {
              const required = planRequired(pl);
              return (
                <li key={pl.contractId} className="flex flex-col gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3">
                  <p className="text-[12px] text-text-secondary">
                    Plan from <span className="font-mono text-text-primary">{pl.payload.worker}</span>
                  </p>
                  <ul className="flex flex-col gap-1 text-[12px]">
                    {pl.payload.milestones.map((m, i) => (
                      <li key={i} className="flex justify-between">
                        <span className="text-text-secondary">
                          Milestone {i + 1}
                          {m.isFinal ? " (final)" : ""}
                        </span>
                        <span className="font-mono text-text-primary">{m.payment}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-text-secondary">
                    {pl.payload.milestones.length} milestone(s) · max {pl.payload.maxSubmissions}{" "}
                    submissions · needs ≥{" "}
                    <span className="text-text-primary">{required.toFixed(0)}</span> from the envelope
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => approvePlan(pl)} disabled={planCmd.phase === "submitting"}>
                      Approve plan &amp; start project
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => rejectPlan(pl)}
                      disabled={planCmd.phase === "submitting"}
                    >
                      Reject — ask to revise
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <TxStatus status={planCmd} />
      </Card>

      <Card title="Escrow Vaults (live)">
        {vaults.loading ? (
          <p className="text-[12px] text-text-secondary">Subscribing…</p>
        ) : myVaults.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No vaults yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {myVaults.map((v) => (
              <li
                key={v.contractId}
                className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2 text-[13px]"
              >
                <span className="text-text-secondary">{v.payload.vaultType}</span>
                <span className="font-mono text-text-primary">{v.payload.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Review Submissions">
        {myReviews.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No open milestone reviews.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {myReviews.map((r) => {
              const proj = myProjects.find(
                (p) =>
                  p.payload.status === "Submitted" &&
                  Number(p.payload.currentIndex) === Number(r.payload.milestoneIndex),
              );
              const submissionUrl = proj && ipfsUrl(proj.payload.currentSubmissionUri);
              const busy = voteCmd.phase === "submitting";
              return (
                <li key={r.contractId} className="rounded-lg border border-white/8 p-3">
                  <p className="mb-2 text-[12px] text-text-secondary">
                    Milestone #{Number(r.payload.milestoneIndex) + 1} · cycle {r.payload.cycle} ·{" "}
                    {r.payload.votes.length} vote(s)
                  </p>
                  {submissionUrl && (
                    <a
                      href={submissionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-2 inline-block text-[12px] text-accent-soft hover:underline"
                    >
                      View deliverable ↗
                    </a>
                  )}
                  {!proj ? (
                    <p className="text-[12px] text-text-secondary">Waiting for the submission…</p>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => acceptSubmission(r, proj)} disabled={busy}>
                        Accept &amp; release payment
                      </Button>
                      <div className="mt-3 flex flex-col gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-2.5">
                        <span className="text-[11px] text-text-secondary">
                          Or reject &amp; send to the AI agent (one reason per line):
                        </span>
                        <textarea
                          value={reasonsText}
                          onChange={(e) => setReasonsText(e.target.value)}
                          rows={2}
                          placeholder="One reason per line…"
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[12px] text-text-primary outline-none focus:border-accent/50"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => rejectSubmission(r, proj)}
                          disabled={busy}
                        >
                          Reject → send to AI agent
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <TxStatus status={voteCmd} />
      </Card>

      <Card title="Projects &amp; Settlements (live)">
        <ul className="flex flex-col gap-2 text-[13px]">
          {myProjects.map((p) => (
            <li key={p.contractId} className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2">
              <span className="text-text-secondary">
                Milestone {Number(p.payload.currentIndex) + 1}/{p.payload.milestones.length}
              </span>
              <span className="text-text-primary">{STATUS_LABEL[p.payload.status] ?? p.payload.status}</span>
            </li>
          ))}
          {mySettlements.map((s) => (
            <li key={s.contractId} className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 px-3 py-2">
              <span className="text-text-secondary">Settled · {s.payload.reason}</span>
              <span className="font-mono text-success">paid {s.payload.totalPaidOut}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
