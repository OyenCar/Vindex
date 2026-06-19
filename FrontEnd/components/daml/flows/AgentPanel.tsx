"use client";

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

  const verdict = (
    cid: (typeof projects.contracts)[number]["contractId"],
    rejectionValid: boolean,
  ) =>
    verdictCmd
      .run(() =>
        session!.ledger.exercise(Vindex.Project.AgentVerdict, cid, { rejectionValid }),
      )
      .catch(() => undefined);

  const enforce = (cid: (typeof projects.contracts)[number]["contractId"]) =>
    enforceCmd
      .run(() =>
        session!.ledger.exercise(Vindex.Project.WorkerViolation, cid, { actor: party }),
      )
      .catch(() => undefined);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Disputes Awaiting Verdict">
        {disputed.length === 0 ? (
          <p className="text-[12px] text-text-secondary">No disputes pending your ruling.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {disputed.map((p) => (
              <li key={p.contractId} className="rounded-lg border border-accent/30 bg-accent/5 p-3">
                <p className="mb-1 text-[12px] text-text-secondary">
                  Milestone {Number(p.payload.currentIndex) + 1}/{p.payload.milestones.length}
                </p>
                <p className="mb-2 break-words text-[12px] text-text-secondary">
                  Rejection reasons:{" "}
                  <span className="text-text-primary">
                    {p.payload.rejectionReasons?.join("; ") ?? "—"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => verdict(p.contractId, false)}>
                    Rejection invalid → enforce payout
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => verdict(p.contractId, true)}>
                    Rejection valid → revision
                  </Button>
                </div>
              </li>
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
