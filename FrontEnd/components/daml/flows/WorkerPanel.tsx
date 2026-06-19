"use client";

import { useState } from "react";
import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { useCommand } from "@/lib/daml/useCommand";
import { TxStatus } from "@/components/daml/TxStatus";
import { Button } from "@/components/ui/button";
import { Vindex, STATUS_LABEL } from "@/lib/daml/vindex";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass flex flex-col gap-3 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}

export function WorkerPanel() {
  const { session } = useDaml();
  const party = session!.party;

  const postings = useStreamQueries(Vindex.ProjectPosting);
  const proposals = useStreamQueries(Vindex.ProjectProposal);
  const projects = useStreamQueries(Vindex.Project);
  const vaults = useStreamQueries(Vindex.AssetVault);
  const settlements = useStreamQueries(Vindex.Settlement);

  const applyCmd = useCommand<unknown>();
  const acceptCmd = useCommand<unknown>();
  const submitCmd = useCommand<unknown>();

  const [hash, setHash] = useState("sha256:milestone-1-deliverable");

  const apply = (postingCid: (typeof postings.contracts)[number]["contractId"]) =>
    applyCmd
      .run(() =>
        session!.ledger.exercise(Vindex.ProjectPosting.Apply, postingCid, {
          applicant: party,
          presentationHash: "sha256:portfolio",
          contactLink: "https://verdix.app/contact/me",
        }),
      )
      .catch(() => undefined);

  const accept = (proposalCid: (typeof proposals.contracts)[number]["contractId"]) =>
    acceptCmd
      .run(
        () => session!.ledger.exercise(Vindex.ProjectProposal.AcceptProposal, proposalCid, {}),
        { refOf: (r) => JSON.stringify((r as unknown[])[0]) },
      )
      .catch(() => undefined);

  const submit = (projectCid: (typeof projects.contracts)[number]["contractId"]) =>
    submitCmd
      .run(() =>
        session!.ledger.exercise(Vindex.Project.SubmitMilestone, projectCid, {
          deliverableHash: hash,
        }),
      )
      .catch(() => undefined);

  const commitment = vaults.contracts.find((v) => v.payload.vaultType === "CommitmentV");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Open Postings">
        {postings.contracts.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No postings visible to you.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {postings.contracts.map((p) => (
              <li key={p.contractId} className="rounded-lg border border-white/8 p-3">
                <p className="mb-2 text-[13px] text-text-primary">{p.payload.requirements}</p>
                <Button size="sm" onClick={() => apply(p.contractId)} disabled={applyCmd.phase === "submitting"}>
                  Apply (submit presentation)
                </Button>
              </li>
            ))}
          </ul>
        )}
        <TxStatus status={applyCmd} />
      </Card>

      <Card title="Job Offers">
        {proposals.contracts.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No contract offers yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {proposals.contracts.map((p) => (
              <li key={p.contractId} className="rounded-lg border border-white/8 p-3">
                <p className="mb-2 text-[12px] text-text-secondary">
                  Commitment fee required: <span className="font-mono text-text-primary">{p.payload.commitmentRequired}</span>
                </p>
                <Button size="sm" onClick={() => accept(p.contractId)} disabled={acceptCmd.phase === "submitting"}>
                  Accept &amp; deposit commitment
                </Button>
              </li>
            ))}
          </ul>
        )}
        <TxStatus status={acceptCmd} />
      </Card>

      <Card title="Active Milestones">
        {projects.contracts.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No active project.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {projects.contracts.map((p) => {
              const submittable = p.payload.status === "Active" || p.payload.status === "Revision";
              return (
                <li key={p.contractId} className="rounded-lg border border-white/8 p-3">
                  <p className="mb-2 text-[12px] text-text-secondary">
                    Milestone {Number(p.payload.currentIndex) + 1}/{p.payload.milestones.length} ·{" "}
                    {STATUS_LABEL[p.payload.status] ?? p.payload.status}
                  </p>
                  {submittable && (
                    <div className="flex flex-col gap-2">
                      <input
                        value={hash}
                        onChange={(e) => setHash(e.target.value)}
                        className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 font-mono text-[12px] text-text-primary outline-none focus:border-accent/50"
                      />
                      <Button size="sm" onClick={() => submit(p.contractId)} disabled={submitCmd.phase === "submitting"}>
                        Submit milestone
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <TxStatus status={submitCmd} />
      </Card>

      <Card title="Payments & Escrow">
        <p className="text-[12px] text-text-secondary">
          Commitment locked:{" "}
          <span className="font-mono text-text-primary">{commitment?.payload.amount ?? "—"}</span>
        </p>
        <ul className="flex flex-col gap-2 text-[13px]">
          {settlements.contracts.map((s) => (
            <li key={s.contractId} className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 px-3 py-2">
              <span className="text-text-secondary">{s.payload.reason}</span>
              <span className="font-mono text-success">paid out {s.payload.totalPaidOut}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
