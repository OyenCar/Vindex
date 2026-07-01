"use client";

import { useState } from "react";
import { useDaml } from "@/components/daml/DamlProvider";
import { ErrorBoundary } from "@/components/daml/ErrorBoundary";
import { PartyConnect } from "@/components/daml/PartyConnect";
import { InvestorPanel } from "@/components/daml/flows/InvestorPanel";
import { WorkerPanel } from "@/components/daml/flows/WorkerPanel";
import { AgentPanel } from "@/components/daml/flows/AgentPanel";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { Vindex } from "@/lib/daml/vindex";
import { 
  TrendingUp, 
  Lock, 
  CheckCircle, 
  Briefcase, 
  Copy, 
  Check,
  Zap
} from "lucide-react";

// ─── Worker Earnings Widget ───────────────────────────────────────────────────
function EarningsWidget() {
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
    {
      icon: Briefcase,
      label: "Active Projects",
      value: activeProjectsCount.toString(),
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div
          key={label}
          className={`glass flex flex-col justify-between gap-2 rounded-2xl border p-5 transition-all hover:scale-[1.02] ${bg}`}
        >
          <div className="flex items-center gap-1.5">
            <Icon className={`h-4 w-4 ${color}`} />
            <span className="text-[11px] font-medium tracking-wide uppercase text-text-secondary">{label}</span>
          </div>
          <span className={`font-mono text-2xl font-bold ${color}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar component for connected state ───────────────────────────────────
function ConsoleSidebar() {
  const { session, online } = useDaml();
  const [copied, setCopied] = useState(false);

  // Queries to show active ledger summary in the sidebar
  const postings = useStreamQueries(Vindex.ProjectPosting);
  const projects = useStreamQueries(Vindex.Project);
  const proposals = useStreamQueries(Vindex.GovernanceProposal);
  const reviews = useStreamQueries(Vindex.MilestoneReview);

  if (!session) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(session.party);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roleText: Record<string, string> = {
    investor: "Investor Account",
    worker: "Freelance Worker",
    agent: "AI Governance Agent",
  };

  return (
    <aside className="glass flex flex-col gap-5 rounded-2xl p-5 lg:sticky lg:top-20 h-fit">
      {/* Connected identity */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Connected Identity</span>
          <span className={`h-2 w-2 rounded-full ${online ? "bg-success shadow-[0_0_8px_#10B981]" : "bg-text-secondary"}`} />
        </div>
        
        <div className="flex flex-col gap-1 mt-1">
          <div className="text-sm font-semibold text-text-primary capitalize">{roleText[session.role] || session.role}</div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.02] border border-white/5 px-2 py-1.5 font-mono text-[11px] text-text-secondary">
            <span className="truncate flex-1" title={session.party}>{session.party}</span>
            <button onClick={handleCopy} className="text-text-secondary hover:text-text-primary transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Live Ledger Activity Summary */}
      <div className="flex flex-col gap-3 border-b border-white/5 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Live Ledger Info</span>
        
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="flex flex-col rounded-lg bg-white/[0.02] border border-white/5 p-2">
            <span className="text-text-secondary text-[10px] uppercase">Active Postings</span>
            <span className="font-mono text-base font-bold text-text-primary mt-0.5">{postings.contracts.length}</span>
          </div>
          <div className="flex flex-col rounded-lg bg-white/[0.02] border border-white/5 p-2">
            <span className="text-text-secondary text-[10px] uppercase">Total Projects</span>
            <span className="font-mono text-base font-bold text-text-primary mt-0.5">{projects.contracts.length}</span>
          </div>
          <div className="flex flex-col rounded-lg bg-white/[0.02] border border-white/5 p-2">
            <span className="text-text-secondary text-[10px] uppercase">Open Reviews</span>
            <span className="font-mono text-base font-bold text-text-primary mt-0.5">{reviews.contracts.length}</span>
          </div>
          <div className="flex flex-col rounded-lg bg-white/[0.02] border border-white/5 p-2">
            <span className="text-text-secondary text-[10px] uppercase">Gov Proposals</span>
            <span className="font-mono text-base font-bold text-text-primary mt-0.5">{proposals.contracts.length}</span>
          </div>
        </div>
      </div>

      {/* Network parameters */}
      <div className="flex flex-col gap-2 text-[11px] text-text-secondary">
        <div className="flex justify-between">
          <span>Escrow Mode:</span>
          <span className="text-text-primary font-medium">Non-custodial Multi-sig</span>
        </div>
        <div className="flex justify-between">
          <span>AI Arbitrator:</span>
          <span className="text-text-primary font-medium">Claude 3.5 Sonnet</span>
        </div>
        <div className="flex justify-between">
          <span>Consensus:</span>
          <span className="text-text-primary font-medium">Canton Sync Layer</span>
        </div>
      </div>
    </aside>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function Dapp() {
  const { session } = useDaml();

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-shell px-5 py-8 sm:px-8">
      {!session ? (
        // Pre-login state using 2-column layout to eliminate empty spaces
        <div className="grid gap-8 lg:grid-cols-2 items-start mt-6">
          {/* Left: PartyConnect Widget */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-text-primary">Connect Identity</h2>
            <p className="text-sm text-text-secondary">
              Select your role (Investor, Worker, or AI Agent) and enter your Canton Party ID.
            </p>
            <PartyConnect />
          </div>

          {/* Right: Info Panel describing Vindex Protocol */}
          <div className="glass rounded-2xl p-6 flex flex-col gap-5">
            <h2 className="text-xl font-black text-text-primary flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent-soft" />
              Vindex Protocol Console
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed font-normal">
              Vindex is a Canton-native freelance escrow system. It secures freelance payouts with non-custodial milestone-based vaults, multi-signatory governance, and autonomous AI arbitration.
            </p>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 font-mono text-xs font-bold text-accent-soft">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Secured Escrows</h4>
                  <p className="text-xs text-text-secondary mt-0.5">Budget, Commitment, and Agent-Fee funds are locked on-ledger on initialization.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 font-mono text-xs font-bold text-accent-soft">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Multi-sig Governance</h4>
                  <p className="text-xs text-text-secondary mt-0.5">Investors manage projects via votes, proposal submissions, and direct milestone reviews.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 font-mono text-xs font-bold text-accent-soft">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">AI Dispute Resolution</h4>
                  <p className="text-xs text-text-secondary mt-0.5">Disputed milestones are resolved by the AI Governed Escrow Agent via cryptographic proofs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Connected state using split layout: Sidebar + main console panel
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] items-start mt-4">
          {/* Left Column: Console Sidebar */}
          <ConsoleSidebar />

          {/* Right Column: Panel Contents */}
          <div className="flex flex-col gap-6">
            <ErrorBoundary>
              {/* Worker earnings widget */}
              {session.role === "worker" && <EarningsWidget />}

              {/* Role-gated panels */}
              {session.role === "investor" && <InvestorPanel />}
              {session.role === "worker" && <WorkerPanel />}
              {session.role === "agent" && <AgentPanel />}
            </ErrorBoundary>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ProtocolConsole() {
  return <Dapp />;
}
