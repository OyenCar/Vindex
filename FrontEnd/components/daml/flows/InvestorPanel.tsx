"use client";

import { useState } from "react";
import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { useCommand } from "@/lib/daml/useCommand";
import { TxStatus } from "@/components/daml/TxStatus";
import { Button } from "@/components/ui/button";
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
  const projects = useStreamQueries(Vindex.Project);
  const reviews = useStreamQueries(Vindex.MilestoneReview);
  const vaults = useStreamQueries(Vindex.AssetVault);
  const settlements = useStreamQueries(Vindex.Settlement);

  const createCmd = useCommand<unknown>();
  const postCmd = useCommand<unknown>();
  const voteCmd = useCommand<unknown>();

  const [agent, setAgent] = useState("");
  const [budget, setBudget] = useState("4000");
  const [agentFee, setAgentFee] = useState("300");
  const [candidate, setCandidate] = useState("");
  const [payment, setPayment] = useState("1000");

  const myParty = parties.contracts.find((c) => c.payload.members.includes(party));

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
            requirements: "Build the Verdix milestone deliverables",
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
            candidates: candidate ? [candidate] : [],
          }),
        { refOf: (r) => JSON.stringify((r as unknown[])[0]) },
      )
      .catch(() => undefined);
  };

  const castVote = (reviewCid: string, vote: "ACCEPT" | "REJECT") =>
    voteCmd
      .run(() =>
        session!.ledger.exercise(Vindex.MilestoneReview.CastVote, reviewCid as never, {
          voter: party,
          vote,
        }),
      )
      .catch(() => undefined);

  const finalize = (projectCid: string, reviewCid: string) =>
    voteCmd
      .run(() =>
        session!.ledger.exercise(Vindex.Project.FinalizeReview, projectCid as never, {
          actor: party,
          reviewCid: reviewCid as never,
        }),
      )
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
      ) : (
        <Card title="Fund Vaults & Publish Job">
          <p className="text-[12px] text-text-secondary">
            Investor Party: <span className="font-mono">{myParty.payload.members.length}</span> member(s)
          </p>
          <Field label="Worker candidate party id" value={candidate} onChange={setCandidate} placeholder="Worker::1220…" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Milestone payment" value={payment} onChange={setPayment} />
            <Field label="Budget (≥ Σ pay·(1+p))" value={budget} onChange={setBudget} />
          </div>
          <Button onClick={fundAndPost} disabled={postCmd.phase === "submitting"}>
            Fund Budget + Agent-Fee Vaults & Post Job
          </Button>
          <TxStatus status={postCmd} />
        </Card>
      )}

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

      <Card title="Review Submissions & Vote">
        {reviews.contracts.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No open milestone reviews.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reviews.contracts.map((r) => {
              const proj = projects.contracts.find(
                (p) => p.payload.status === "Submitted",
              );
              return (
                <li key={r.contractId} className="rounded-lg border border-white/8 p-3">
                  <p className="mb-2 text-[12px] text-text-secondary">
                    Milestone #{Number(r.payload.milestoneIndex) + 1} · cycle {r.payload.cycle} ·{" "}
                    {r.payload.votes.length} vote(s)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => castVote(r.contractId, "ACCEPT")}>
                      Vote Accept
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => castVote(r.contractId, "REJECT")}>
                      Vote Reject
                    </Button>
                    {proj && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => finalize(proj.contractId, r.contractId)}
                      >
                        Finalize review
                      </Button>
                    )}
                  </div>
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
