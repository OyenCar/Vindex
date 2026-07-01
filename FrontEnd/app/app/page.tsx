"use client";

import { useDaml } from "@/components/daml/DamlProvider";
import { ErrorBoundary } from "@/components/daml/ErrorBoundary";
import { PartyConnect } from "@/components/daml/PartyConnect";
import { InvestorPanel } from "@/components/daml/flows/InvestorPanel";
import { WorkerPanel } from "@/components/daml/flows/WorkerPanel";
import { AgentPanel } from "@/components/daml/flows/AgentPanel";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { Vindex } from "@/lib/daml/vindex";
import { TrendingUp, Lock, CheckCircle } from "lucide-react";

// ─── Worker Earnings Widget ───────────────────────────────────────────────────
function EarningsWidget() {
  const { session } = useDaml();
  const party = session!.party;

  const projects = useStreamQueries(Vindex.Project);
  const settlements = useStreamQueries(Vindex.Settlement);
  const vaults = useStreamQueries(Vindex.AssetVault);

  const myProjects = projects.contracts.filter((p) => p.payload.worker === party);
  const mySettlements = settlements.contracts.filter((s) => s.payload.worker === party);
  const commitment = vaults.contracts.find((v) => v.payload.vaultType === "CommitmentV");

  const releasedSoFar = myProjects.reduce((sum, p) => {
    const idx = Number(p.payload.currentIndex);
    return sum + p.payload.milestones.slice(0, idx).reduce((s, m) => s + Number(m.payment), 0);
  }, 0);

  const totalSettled = mySettlements.reduce((sum, s) => sum + Number(s.payload.totalPaidOut), 0);

  const stats = [
    {
      icon: TrendingUp,
      label: "Released so far",
      value: releasedSoFar.toLocaleString(),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: CheckCircle,
      label: "Fully settled",
      value: totalSettled.toLocaleString(),
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      icon: Lock,
      label: "Commitment locked",
      value: commitment?.payload.amount ?? "—",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div
          key={label}
          className={`glass flex flex-col gap-1.5 rounded-2xl border p-4 ${bg}`}
        >
          <div className="flex items-center gap-1.5">
            <Icon className={`h-3.5 w-3.5 ${color}`} />
            <span className="text-[11px] text-text-secondary">{label}</span>
          </div>
          <span className={`font-mono text-xl font-bold ${color}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function Dapp() {
  const { session } = useDaml();

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-shell px-5 py-8 sm:px-8">
      {/* Page title */}
      <header className="mb-6">
        <h1
          className="font-display font-black tracking-tightest text-text-primary"
          style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.5rem)", lineHeight: 1.05 }}
        >
          Protocol <span className="text-gradient-animated">Console</span>
        </h1>
        <p className="mt-2 max-w-xl text-[14px] text-text-secondary">
          Connect as an Investor, Worker, or AI Agent. Every action runs a real Daml command on the
          participant — every panel streams live from the ledger.
        </p>
      </header>

      {/* Party connect widget */}
      <div className="mb-6 max-w-md">
        <PartyConnect />
      </div>

      {!session ? (
        <div className="glass max-w-2xl rounded-2xl p-6">
          <h2 className="mb-2 text-lg font-semibold">Connect a party to begin</h2>
          <p className="text-sm text-text-secondary">
            Authenticate as an Investor, Worker, or AI Agent party. Every action below executes a
            real <span className="text-text-primary">create</span> or{" "}
            <span className="text-text-primary">exercise</span> command against the deployed Vindex
            Daml contracts on the participant, and all dashboards stream live from the ledger.
          </p>
        </div>
      ) : (
        <ErrorBoundary>
          {/* Worker earnings — shown prominently above the main panel */}
          {session.role === "worker" && <EarningsWidget />}

          {/* Role-gated panels */}
          {session.role === "investor" && <InvestorPanel />}
          {session.role === "worker" && <WorkerPanel />}
          {session.role === "agent" && <AgentPanel />}
        </ErrorBoundary>
      )}
    </main>
  );
}

export default function ProtocolConsole() {
  return <Dapp />;
}
