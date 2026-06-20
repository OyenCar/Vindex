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
import { Vindex, num, hours, days, STATUS_LABEL } from "@/lib/daml/vindex";

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
  const projects = useStreamQueries(Vindex.Project);
  const reviews = useStreamQueries(Vindex.MilestoneReview);
  const vaults = useStreamQueries(Vindex.AssetVault);
  const settlements = useStreamQueries(Vindex.Settlement);
  const applications = useStreamQueries(Vindex.Application);

  const createCmd = useCommand<unknown>();
  const postCmd = useCommand<unknown>();
  const voteCmd = useCommand<unknown>();
  const selectCmd = useCommand<unknown>();

  const [agent, setAgent] = useState("");
  const [budget, setBudget] = useState("4000");
  const [agentFee, setAgentFee] = useState("300");
  const [payment, setPayment] = useState("1000");
  const [reasonsText, setReasonsText] = useState("Deliverable does not meet the milestone spec");
  const [requirements, setRequirements] = useState("Build the Verdix milestone deliverables");
  const [briefCid, setBriefCid] = useState("");

  const myParty = parties.contracts.find((c) => c.payload.members.includes(party));

  // Bug fix (spam): once a posting or project already exists for this party, block re-posting —
  // each SetupAndPost mints a fresh pair of vaults, so repeated clicks pile up duplicates.
  const myPosting = postings.contracts.find((p) => p.payload.members.includes(party));
  const myProject = projects.contracts.find((p) => p.payload.members.includes(party));
  const hasJob = Boolean(myPosting || myProject);

  // Open posting: published to the registered worker pool (env-configured), NOT a hand-picked
  // worker. Anyone in the pool can apply; the investor selects later by governance vote.
  const workerPool = damlConfig.workerPool;

  // Bug fix (validation): the milestone payment (plus its penalty buffer) cannot exceed the budget.
  // Mirrors the on-ledger guard `budgetAmount >= Σ payment·(1+violationPct)` so the user sees it
  // BEFORE submitting instead of getting a raw Daml interpretation error.
  const VIOLATION_PCT = 0.1; // must match the milestone `violationPct` used in fundAndPost
  const paymentNum = Number(payment);
  const budgetNum = Number(budget);
  const minBudget = paymentNum * (1 + VIOLATION_PCT);
  const budgetValid =
    Number.isFinite(paymentNum) && Number.isFinite(budgetNum) && paymentNum > 0 && budgetNum >= minBudget;

  const createParty = () =>
    createCmd
      .run(
        () =>
          session!.ledger.create(Vindex.InvestorParty, {
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
          }),
        { refOf: (r) => (r as { contractId: string }).contractId },
      )
      .catch(() => undefined);

  const fundAndPost = () => {
    if (!myParty) return;
    postCmd
      .run(
        () =>
          session!.ledger.exercise(Vindex.InvestorParty.SetupAndPost, myParty.contractId, {
            requirements,
            briefUri: briefCid,
            milestones: [
              {
                deliverablesHash: "sha256:deliverable-1",
                payment: num(payment),
                workerWindow: days(2),
                reviewWindow: hours(24),
                violationPct: num(0.1),
                isFinal: true,
              },
            ],
            budgetAmount: num(budget),
            agentFeeAmount: num(agentFee),
            agentOpCost: num(50),
            maxSubmissions: num(5),
            commitmentRequired: num(500),
            workerPool,
          }),
        { refOf: (r) => JSON.stringify((r as unknown[])[0]) },
      )
      .catch(() => undefined);
  };

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
      {!myParty ? (
        <Card title="Create Investor Party">
          <Field label="AI Agent party id" value={agent} onChange={setAgent} placeholder="Agent::1220…" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Budget funding" value={budget} onChange={setBudget} />
            <Field label="Agent-fee funding" value={agentFee} onChange={setAgentFee} />
          </div>
          <Button onClick={createParty} disabled={!agent || createCmd.phase === "submitting"}>
            Create Investor Party
          </Button>
          <TxStatus status={createCmd} />
        </Card>
      ) : hasJob ? (
        <Card title="Job Published">
          <p className="text-[12px] text-text-secondary">
            A job is already live for this Investor Party. Manage applicants, voting and
            finalization in the cards below — posting again would create duplicate vaults.
          </p>
          {myProject && (
            <p className="text-[12px] text-text-secondary">
              Project status:{" "}
              <span className="text-text-primary">
                {STATUS_LABEL[myProject.payload.status] ?? myProject.payload.status}
              </span>
            </p>
          )}
        </Card>
      ) : (
        <Card title="Fund Vaults & Publish Job">
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
          <div className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
            <p className="text-[12px] text-text-primary">Open posting</p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              {workerPool.length > 0 ? (
                <>
                  Published to{" "}
                  <span className="font-mono text-text-primary">{workerPool.length}</span> registered
                  worker{workerPool.length > 1 ? "s" : ""}. Any of them can apply — you pick the
                  winner by vote in <span className="text-text-primary">Applicants</span> below. You
                  are not hiring anyone directly.
                </>
              ) : (
                <span className="text-amber-300">
                  No worker pool configured. Set <span className="font-mono">NEXT_PUBLIC_WORKER_POOL</span>{" "}
                  (or <span className="font-mono">NEXT_PUBLIC_PARTY_WORKER</span>) in{" "}
                  <span className="font-mono">.env.local</span> so workers can see and apply to this job.
                </span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Milestone payment" value={payment} onChange={setPayment} />
            <Field label="Budget (≥ Σ pay·(1+p))" value={budget} onChange={setBudget} />
          </div>
          {!budgetValid && (
            <p className="text-[11px] text-amber-300">
              {paymentNum > 0
                ? `Budget must be ≥ ${minBudget} (milestone payment + ${Math.round(
                    VIOLATION_PCT * 100,
                  )}% penalty buffer). A milestone can't pay more than the project budget.`
                : "Enter a milestone payment greater than 0."}
            </p>
          )}
          <Button
            onClick={fundAndPost}
            disabled={postCmd.phase === "submitting" || !budgetValid || workerPool.length === 0}
          >
            Fund Budget + Agent-Fee Vaults &amp; Post Job
          </Button>
          <TxStatus status={postCmd} />
        </Card>
      )}

      <Card title="Applicants — Select Worker">
        {applications.contracts.length === 0 ? (
          <p className="text-[12px] text-text-secondary">
            No applicants yet. Publish a job, then have a Worker apply.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {applications.contracts.map((a) => (
              <li
                key={a.contractId}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/8 px-3 py-2 text-[13px]"
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
                      className="text-[11px] text-accent-soft hover:underline"
                    >
                      View portfolio ↗
                    </a>
                  ) : (
                    a.payload.contactLink && (
                      <span className="truncate text-[11px] text-text-secondary">{a.payload.contactLink}</span>
                    )
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => selectApplicant(a)}
                  disabled={!myParty || selectCmd.phase === "submitting"}
                >
                  Select &amp; make offer
                </Button>
              </li>
            ))}
          </ul>
        )}
        <TxStatus status={selectCmd} />
      </Card>

      <Card title="Escrow Vaults (live)">
        {vaults.loading ? (
          <p className="text-[12px] text-text-secondary">Subscribing…</p>
        ) : vaults.contracts.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No vaults yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {vaults.contracts.map((v) => (
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
        {reviews.contracts.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No open milestone reviews.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reviews.contracts.map((r) => {
              const proj = projects.contracts.find(
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

      <Card title="Projects & Settlements (live)">
        <ul className="flex flex-col gap-2 text-[13px]">
          {projects.contracts.map((p) => (
            <li key={p.contractId} className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2">
              <span className="text-text-secondary">
                Milestone {Number(p.payload.currentIndex) + 1}/{p.payload.milestones.length}
              </span>
              <span className="text-text-primary">{STATUS_LABEL[p.payload.status] ?? p.payload.status}</span>
            </li>
          ))}
          {settlements.contracts.map((s) => (
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
