"use client";

import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { Vindex } from "@/lib/daml/vindex";
import { TrendingUp, Lock, CheckCircle, Briefcase } from "lucide-react";

export function EarningsWidget() {
  const { session } = useDaml();
  const party = session!.party;

  const projects = useStreamQueries(Vindex.Project);
  const settlements = useStreamQueries(Vindex.Settlement);
  const vaults = useStreamQueries(Vindex.AssetVault);

  const myProjects = projects.contracts.filter((p) => p.payload.worker === party);
  const activeProjectsCount = myProjects.filter((p) => ["Active", "Submitted", "Revision"].includes(p.payload.status)).length;
  const mySettlements = settlements.contracts.filter((s) => s.payload.worker === party);
  const commitment = vaults.contracts.find((v) => v.payload.vaultType === "CommitmentV");

  const releasedSoFar = myProjects.reduce((sum, p) => {
    const idx = Number(p.payload.currentIndex);
    return sum + p.payload.milestones.slice(0, idx).reduce((s, m) => s + Number(m.payment), 0);
  }, 0);

  const totalSettled = mySettlements.reduce((sum, s) => sum + Number(s.payload.totalPaidOut), 0);

  const stats = [
    { icon: TrendingUp, label: "Released", value: releasedSoFar.toLocaleString(), accent: true },
    { icon: CheckCircle, label: "Settled", value: totalSettled.toLocaleString(), accent: false },
    { icon: Lock, label: "Locked", value: commitment?.payload.amount ?? "—", accent: false },
    { icon: Briefcase, label: "Active", value: activeProjectsCount.toString(), accent: true },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, accent }) => (
        <div
          key={label}
          className={`brutal-card-flat flex flex-col justify-between gap-2 p-4 ${accent ? "border-l-4 border-l-[var(--accent)]" : ""}`}
        >
          <div className="flex items-center gap-1.5">
            <Icon className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
          </div>
          <span className="font-mono text-2xl font-black text-[var(--text-primary)]">{value}</span>
        </div>
      ))}
    </div>
  );
}
